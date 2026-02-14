import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '@/infrastructure/database/prisma.service'

interface AlertConfig {
  userId: string
  threshold: number
  channels: ('email' | 'sms' | 'push')[]
}

interface BalanceChange {
  userId: string
  previousBalance: number
  newBalance: number
  change: number
  changePercent: number
  transactionType: string
  description: string
}

@Injectable()
export class GoldenAlertService {
  private readonly logger = new Logger(GoldenAlertService.name)
  private readonly DEFAULT_THRESHOLD = 0.05 // 5%

  constructor(private prisma: PrismaService) {}

  /**
   * Check if balance change exceeds threshold and send alert
   */
  async checkAndAlert(change: BalanceChange): Promise<void> {
    const config = await this.getAlertConfig(change.userId)
    
    if (Math.abs(change.changePercent) >= config.threshold) {
      await this.sendAlert(change, config)
    }
  }

  /**
   * Send multi-channel alert
   */
  private async sendAlert(change: BalanceChange, config: AlertConfig): Promise<void> {
    const message = this.createAlertMessage(change)

    // Send to all configured channels
    const promises = config.channels.map((channel) => {
      switch (channel) {
        case 'email':
          return this.sendEmailAlert('user@example.com', message, change)
        case 'sms':
          return this.sendSMSAlert('+595981234567', message, change)
        case 'push':
          return this.sendPushAlert(change.userId, message, change)
      }
    })

    await Promise.allSettled(promises)

    this.logger.log(`Golden Alert sent to user ${change.userId}: ${change.changePercent.toFixed(2)}% change`)
  }

  /**
   * Create alert message
   */
  private createAlertMessage(change: BalanceChange): string {
    const direction = change.change > 0 ? 'aumentó' : 'disminuyó'
    const emoji = change.change > 0 ? '📈' : '📉'
    
    return `${emoji} PANAPAGOS Alert: Tu saldo ${direction} ${Math.abs(change.changePercent).toFixed(1)}%\n` +
           `Movimiento: ${change.description}\n` +
           `Nuevo saldo: Gs. ${change.newBalance.toLocaleString('es-PY')}`
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(
    email: string,
    message: string,
    change: BalanceChange,
  ): Promise<void> {
    this.logger.log(`Email alert sent to ${email}`)
    console.log(`📧 Email to ${email}:`, message)
  }

  /**
   * Send SMS alert
   */
  private async sendSMSAlert(
    phone: string,
    message: string,
    change: BalanceChange,
  ): Promise<void> {
    this.logger.log(`SMS alert sent to ${phone}`)
    console.log(`📱 SMS to ${phone}:`, message)
  }

  /**
   * Send push notification
   */
  private async sendPushAlert(
    userId: string,
    message: string,
    change: BalanceChange,
  ): Promise<void> {
    this.logger.log(`Push notification sent to user ${userId}`)
    console.log(`🔔 Push to ${userId}:`, message)
  }

  /**
   * Get user alert configuration
   */
  private async getAlertConfig(userId: string): Promise<AlertConfig> {
    return {
      userId,
      threshold: this.DEFAULT_THRESHOLD,
      channels: ['email', 'push'],
    }
  }

  /**
   * Webhook notification for external systems
   */
  async sendWebhook(change: BalanceChange, webhookUrl: string): Promise<void> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PANAPAGOS-Signature': this.generateWebhookSignature(change),
        },
        body: JSON.stringify({
          event: 'balance.changed',
          userId: change.userId,
          change: change.change,
          changePercent: change.changePercent,
          newBalance: change.newBalance,
          transactionType: change.transactionType,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        this.logger.error(`Webhook failed: ${response.statusText}`)
      }
    } catch (error) {
      this.logger.error(`Webhook error: ${error.message}`)
    }
  }

  /**
   * Generate webhook signature for verification
   */
  private generateWebhookSignature(data: any): string {
    const crypto = require('crypto')
    const secret = process.env.WEBHOOK_SECRET || 'default-secret'
    const payload = JSON.stringify(data)
    
    return crypto.createHmac('sha256', secret).update(payload).digest('hex')
  }
}
