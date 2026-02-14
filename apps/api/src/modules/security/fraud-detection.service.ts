import { Injectable } from '@nestjs/common'
import { RedisService } from '@/infrastructure/cache/redis.service'

interface VelocityCheckResult {
  allowed: boolean
  attempts: number
  blockedUntil?: Date
  reason?: string
}

@Injectable()
export class FraudDetectionService {
  private readonly MAX_ATTEMPTS = 3
  private readonly WINDOW_SECONDS = 300 // 5 minutes
  private readonly BLOCK_DURATION = 1800 // 30 minutes

  constructor(private redisService: RedisService) {}

  /**
   * Velocity Check: Block IPs/cards with >3 failed attempts in 5 minutes
   */
  async checkVelocity(
    identifier: string,
    type: 'ip' | 'card' | 'user',
  ): Promise<VelocityCheckResult> {
    const key = `velocity:${type}:${identifier}`
    const blockKey = `blocked:${type}:${identifier}`

    // Check if already blocked
    const isBlocked = await this.redisService.exists(blockKey)
    if (isBlocked) {
      const ttl = await this.getBlockTTL(blockKey)
      return {
        allowed: false,
        attempts: this.MAX_ATTEMPTS,
        blockedUntil: new Date(Date.now() + ttl * 1000),
        reason: 'Too many failed attempts. Account temporarily blocked.',
      }
    }

    // Get current attempts
    const attemptsStr = await this.redisService.get(key)
    const attempts = attemptsStr ? parseInt(attemptsStr) : 0

    if (attempts >= this.MAX_ATTEMPTS) {
      // Block the identifier
      await this.redisService.set(blockKey, '1', this.BLOCK_DURATION)
      await this.redisService.del(key)

      return {
        allowed: false,
        attempts: attempts + 1,
        blockedUntil: new Date(Date.now() + this.BLOCK_DURATION * 1000),
        reason: 'Maximum attempts exceeded. Blocked for 30 minutes.',
      }
    }

    return {
      allowed: true,
      attempts,
    }
  }

  /**
   * Record failed attempt
   */
  async recordFailedAttempt(identifier: string, type: 'ip' | 'card' | 'user'): Promise<void> {
    const key = `velocity:${type}:${identifier}`
    const attemptsStr = await this.redisService.get(key)
    const attempts = attemptsStr ? parseInt(attemptsStr) : 0

    await this.redisService.set(key, (attempts + 1).toString(), this.WINDOW_SECONDS)
  }

  /**
   * Clear attempts on successful transaction
   */
  async clearAttempts(identifier: string, type: 'ip' | 'card' | 'user'): Promise<void> {
    const key = `velocity:${type}:${identifier}`
    await this.redisService.del(key)
  }

  /**
   * Get remaining block time
   */
  private async getBlockTTL(blockKey: string): Promise<number> {
    return this.BLOCK_DURATION
  }

  /**
   * Behavioral Analysis: Detect bot patterns
   */
  analyzeBehavior(behaviorData: {
    mouseMovements: number
    keystrokes: number
    timeOnPage: number
    formFillSpeed: number
  }): { isBot: boolean; confidence: number; reasons: string[] } {
    const reasons: string[] = []
    let botScore = 0

    // Check mouse movements
    if (behaviorData.mouseMovements < 10) {
      botScore += 30
      reasons.push('Insufficient mouse movements')
    }

    // Check keystroke patterns
    if (behaviorData.keystrokes > 0 && behaviorData.formFillSpeed < 50) {
      botScore += 25
      reasons.push('Suspiciously fast typing')
    }

    // Check time on page
    if (behaviorData.timeOnPage < 5000) {
      botScore += 20
      reasons.push('Too quick completion')
    }

    // Check if form filled too uniformly
    if (behaviorData.formFillSpeed > 0 && behaviorData.formFillSpeed < 100) {
      botScore += 25
      reasons.push('Uniform typing speed (bot-like)')
    }

    return {
      isBot: botScore >= 50,
      confidence: botScore,
      reasons,
    }
  }

  /**
   * Transaction Risk Score
   */
  async calculateRiskScore(transaction: {
    amount: number
    userId: string
    ipAddress: string
    deviceFingerprint?: string
    location?: string
  }): Promise<{ score: number; level: 'LOW' | 'MEDIUM' | 'HIGH'; factors: string[] }> {
    const factors: string[] = []
    let score = 0

    // Check velocity
    const ipCheck = await this.checkVelocity(transaction.ipAddress, 'ip')
    if (!ipCheck.allowed) {
      score += 40
      factors.push('IP blocked for suspicious activity')
    } else if (ipCheck.attempts > 1) {
      score += 15
      factors.push('Multiple attempts from same IP')
    }

    // Check amount
    if (transaction.amount > 5000000) {
      score += 20
      factors.push('High transaction amount')
    }

    // Check time of day (suspicious if 2-5 AM)
    const hour = new Date().getHours()
    if (hour >= 2 && hour <= 5) {
      score += 10
      factors.push('Unusual transaction time')
    }

    // Determine risk level
    let level: 'LOW' | 'MEDIUM' | 'HIGH'
    if (score >= 50) {
      level = 'HIGH'
    } else if (score >= 25) {
      level = 'MEDIUM'
    } else {
      level = 'LOW'
    }

    return { score, level, factors }
  }

  /**
   * Check if transaction should be blocked
   */
  async shouldBlockTransaction(
    userId: string,
    ipAddress: string,
    cardNumber: string,
  ): Promise<{ blocked: boolean; reason?: string }> {
    // Check IP velocity
    const ipCheck = await this.checkVelocity(ipAddress, 'ip')
    if (!ipCheck.allowed) {
      return { blocked: true, reason: ipCheck.reason }
    }

    // Check card velocity
    const cardHash = this.hashCard(cardNumber)
    const cardCheck = await this.checkVelocity(cardHash, 'card')
    if (!cardCheck.allowed) {
      return { blocked: true, reason: cardCheck.reason }
    }

    // Check user velocity
    const userCheck = await this.checkVelocity(userId, 'user')
    if (!userCheck.allowed) {
      return { blocked: true, reason: userCheck.reason }
    }

    return { blocked: false }
  }

  /**
   * Record successful payment
   */
  async recordSuccessfulPayment(ipAddress: string, cardNumber: string): Promise<void> {
    await this.clearAttempts(ipAddress, 'ip')
    const cardHash = this.hashCard(cardNumber)
    await this.clearAttempts(cardHash, 'card')
  }

  /**
   * Record failed payment
   */
  async recordFailedPayment(ipAddress: string, cardNumber: string): Promise<void> {
    await this.recordFailedAttempt(ipAddress, 'ip')
    const cardHash = this.hashCard(cardNumber)
    await this.recordFailedAttempt(cardHash, 'card')
  }

  /**
   * Hash card number for privacy
   */
  private hashCard(cardNumber: string): string {
    const crypto = require('crypto')
    return crypto.createHash('sha256').update(cardNumber).digest('hex')
  }
}
