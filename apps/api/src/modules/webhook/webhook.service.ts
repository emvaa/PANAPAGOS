import { Injectable, UnauthorizedException, Logger } from '@nestjs/common'
import { BancardWebhookDto } from './dto/bancard-webhook.dto'
import { TransactionRepository } from '../checkout/domain/repositories/transaction.repository'
import { CryptoService } from '@/infrastructure/crypto/crypto.service'
import { PrismaService } from '@/infrastructure/database/prisma.service'
import { StripeGateway } from '../checkout/infrastructure/stripe.gateway'

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name)

  constructor(
    private readonly transactionRepo: TransactionRepository,
    private readonly cryptoService: CryptoService,
    private readonly prisma: PrismaService,
    private readonly stripeGateway: StripeGateway,
  ) {}

  async processBancardWebhook(dto: BancardWebhookDto, signature: string) {
    this.logger.log(`Received webhook for operation: ${dto.operation.shop_process_id}`)

    const transaction = await this.prisma.transaction.findFirst({
      where: {
        merchant: {
          shopProcessId: dto.operation.shop_process_id,
        },
        id: dto.operation.token,
      },
      include: {
        merchant: true,
      },
    })

    if (!transaction) {
      this.logger.warn(`Transaction not found for shop_process_id: ${dto.operation.shop_process_id}`)
      return { received: true }
    }

    const isValid = this.cryptoService.verifyBancardSignature(
      {
        shop_process_id: dto.operation.shop_process_id,
        amount: dto.operation.amount,
      },
      signature,
      transaction.merchant.privateKey,
    )

    if (!isValid) {
      this.logger.error('Invalid webhook signature')
      throw new UnauthorizedException('Invalid signature')
    }

    const statusMap: Record<string, any> = {
      'success': 'AUTHORIZED',
      'error': 'DENIED',
      'reversed': 'REVERSED',
    }

    const newStatus = statusMap[dto.status] || 'ERROR'

    await this.transactionRepo.update(transaction.id, {
      status: newStatus,
      authorizationCode: dto.confirmation?.authorization_number,
      bancardTicket: dto.confirmation?.ticket_number,
      processedAt: new Date(),
    })

    await this.prisma.auditLog.create({
      data: {
        merchantId: transaction.merchantId,
        transactionId: transaction.id,
        action: 'WEBHOOK_RECEIVED',
        entity: 'Transaction',
        entityId: transaction.id,
        changes: dto as any,
      },
    })

    this.logger.log(`Transaction ${transaction.id} updated to status: ${newStatus}`)

    return { received: true, status: newStatus }
  }

  /**
   * Process Stripe webhook
   */
  async processStripeWebhook(rawBody: string, signature: string) {
    this.logger.log('Received Stripe webhook')

    // Verify webhook signature
    const isValid = this.stripeGateway.verifyWebhookSignature(rawBody, signature)
    if (!isValid) {
      this.logger.error('Invalid Stripe webhook signature')
      throw new UnauthorizedException('Invalid signature')
    }

    const event = JSON.parse(rawBody)
    this.logger.log(`Processing Stripe event: ${event.type}`)

    // Handle the event
    await this.stripeGateway.handleWebhookEvent(event)

    // Update transaction in database based on event type
    if (event.type === 'payment_intent.succeeded') {
      await this.handleStripePaymentSuccess(event.data.object)
    } else if (event.type === 'payment_intent.payment_failed') {
      await this.handleStripePaymentFailure(event.data.object)
    }

    return { received: true }
  }

  /**
   * Handle successful Stripe payment
   */
  private async handleStripePaymentSuccess(paymentIntent: any) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        idempotencyKey: paymentIntent.id,
      },
    })

    if (!transaction) {
      this.logger.warn(`Transaction not found for payment intent: ${paymentIntent.id}`)
      return
    }

    await this.transactionRepo.update(transaction.id, {
      status: 'AUTHORIZED',
      authorizationCode: paymentIntent.id,
      processedAt: new Date(),
    })

    await this.prisma.auditLog.create({
      data: {
        merchantId: transaction.merchantId,
        transactionId: transaction.id,
        action: 'PAYMENT_SUCCESS',
        entity: 'Transaction',
        entityId: transaction.id,
        changes: {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          status: 'succeeded',
        } as any,
      },
    })

    this.logger.log(`Stripe payment succeeded: ${transaction.id}`)
  }

  /**
   * Handle failed Stripe payment
   */
  private async handleStripePaymentFailure(paymentIntent: any) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        idempotencyKey: paymentIntent.id,
      },
    })

    if (!transaction) {
      this.logger.warn(`Transaction not found for payment intent: ${paymentIntent.id}`)
      return
    }

    await this.transactionRepo.update(transaction.id, {
      status: 'DENIED',
      errorMessage: paymentIntent.last_payment_error?.message || 'Payment failed',
      processedAt: new Date(),
    })

    await this.prisma.auditLog.create({
      data: {
        merchantId: transaction.merchantId,
        transactionId: transaction.id,
        action: 'PAYMENT_FAILED',
        entity: 'Transaction',
        entityId: transaction.id,
        changes: {
          paymentIntentId: paymentIntent.id,
          error: paymentIntent.last_payment_error,
        } as any,
      },
    })

    this.logger.log(`Stripe payment failed: ${transaction.id}`)
  }
}
