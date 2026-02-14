import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { nanoid } from 'nanoid'
import { CreateCheckoutDto } from '../dto/create-checkout.dto'
import { ProcessPaymentDto } from '../dto/process-payment.dto'
import { TransactionRepository } from '../domain/repositories/transaction.repository'
import { PaymentLinkRepository } from '../domain/repositories/payment-link.repository'
import { BancardGateway } from '../infrastructure/bancard.gateway'
import { StripeGateway } from '../infrastructure/stripe.gateway'
import { CryptoService } from '@/infrastructure/crypto/crypto.service'
import { RedisService } from '@/infrastructure/cache/redis.service'
import { CurrencyService } from '@/infrastructure/currency/currency.service'
import { FraudDetectionService } from '@/modules/security/fraud-detection.service'
import { DataMaskingService } from '@/modules/security/data-masking.service'

@Injectable()
export class CheckoutService {
  constructor(
    private readonly transactionRepo: TransactionRepository,
    private readonly paymentLinkRepo: PaymentLinkRepository,
    private readonly bancardGateway: BancardGateway,
    private readonly stripeGateway: StripeGateway,
    private readonly cryptoService: CryptoService,
    private readonly redisService: RedisService,
    private readonly currencyService: CurrencyService,
    private readonly fraudDetectionService: FraudDetectionService,
    private readonly dataMaskingService: DataMaskingService,
  ) {}

  async createCheckout(dto: CreateCheckoutDto) {
    const expiresAt = new Date(Date.now() + (dto.expirationSeconds || 3600) * 1000)
    const shortCode = nanoid(10)

    const transaction = await this.transactionRepo.create({
      merchantId: dto.merchantId,
      amount: dto.amount,
      currency: dto.currency,
      description: dto.description,
      status: 'PENDING',
      documentType: '',
      documentNumber: '',
      metadata: dto.metadata,
    })

    const paymentLink = await this.paymentLinkRepo.create({
      merchantId: dto.merchantId,
      transactionId: transaction.id,
      shortCode,
      amount: dto.amount,
      currency: dto.currency,
      description: dto.description,
      expiresAt,
      isActive: 1,
      maxUses: 1,
      usedCount: 0,
    })

    await this.redisService.set(
      `payment_link:${shortCode}`,
      JSON.stringify({ transactionId: transaction.id, expiresAt }),
      dto.expirationSeconds || 3600,
    )

    return {
      transactionId: transaction.id,
      paymentLink: `${process.env.APP_URL}/pay/${shortCode}`,
      shortCode,
      expiresAt,
    }
  }

  async getPaymentLinkDetails(shortCode: string) {
    const cached = await this.redisService.get(`payment_link:${shortCode}`)
    
    if (!cached) {
      throw new NotFoundException('Payment link expired or not found')
    }

    const paymentLink = await this.paymentLinkRepo.findByShortCode(shortCode)

    if (!paymentLink || paymentLink.isActive !== 1) {
      throw new NotFoundException('Payment link not found or inactive')
    }

    if (new Date() > paymentLink.expiresAt) {
      await this.paymentLinkRepo.update(paymentLink.id, { isActive: 0 })
      throw new BadRequestException('Payment link has expired')
    }

    if (paymentLink.usedCount >= paymentLink.maxUses) {
      throw new BadRequestException('Payment link has reached maximum uses')
    }

    const transaction = await this.transactionRepo.findById(paymentLink.transactionId)

    if (!transaction) {
      throw new NotFoundException('Transaction not found')
    }

    return {
      transactionId: transaction.id,
      amount: paymentLink.amount,
      currency: paymentLink.currency,
      description: paymentLink.description,
      merchantName: (transaction as any).merchant?.name || 'Merchant',
      expiresAt: paymentLink.expiresAt,
    }
  }

  async processPayment(dto: ProcessPaymentDto) {
    // 🔒 IDEMPOTENCY: Check if payment already processed
    if (dto.idempotencyKey) {
      const existingTransaction = await this.transactionRepo.findByIdempotencyKey(dto.idempotencyKey)
      if (existingTransaction) {
        return {
          success: existingTransaction.status === 'AUTHORIZED',
          transactionId: existingTransaction.id,
          status: existingTransaction.status,
          authorizationCode: existingTransaction.authorizationCode,
          message: 'Payment already processed (idempotent)',
        }
      }
    }

    // 🔒 FRAUD DETECTION: Velocity check
    const fraudCheck = await this.fraudDetectionService.shouldBlockTransaction(
      dto.transactionId,
      dto.ipAddress,
      dto.cardNumber,
    )

    if (fraudCheck.blocked) {
      throw new BadRequestException(fraudCheck.reason || 'Transaction blocked')
    }

    const transaction = await this.transactionRepo.findById(dto.transactionId)

    if (!transaction) {
      throw new NotFoundException('Transaction not found')
    }

    if (transaction.status !== 'PENDING') {
      throw new BadRequestException('Transaction already processed')
    }

    // Validate amount is positive
    if (transaction.amount <= 0) {
      throw new BadRequestException('Invalid transaction amount')
    }

    const encryptedCard = this.cryptoService.encrypt(dto.cardNumber)
    const maskedCard = this.cryptoService.maskCardNumber(dto.cardNumber)

    await this.transactionRepo.update(transaction.id, {
      documentType: dto.documentType,
      documentNumber: dto.documentNumber,
      cardLastFour: maskedCard.slice(-4),
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
      idempotencyKey: dto.idempotencyKey,
      status: 'PROCESSING', // Add intermediate state
    })

    try {
      // 🌍 MULTI-CURRENCY: Detect if international payment
      const isInternational = this.isInternationalCard(dto.cardNumber)
      const originalCurrency = dto.currency || 'USD'
      let finalAmount = transaction.amount
      let exchangeRate = 1
      let gateway = 'bancard'

      // If international card or non-PYG currency, use Stripe and convert
      if (isInternational || originalCurrency !== 'PYG') {
        gateway = 'stripe'

        // Convert to PYG if needed
        if (originalCurrency !== 'PYG') {
          const conversion = await this.currencyService.convertCurrency(
            transaction.amount,
            originalCurrency,
            'PYG',
          )
          finalAmount = conversion.convertedAmount
          exchangeRate = conversion.rate
        }

        // Process with Stripe
        const stripeResponse = await this.stripeGateway.processPayment({
          amount: transaction.amount,
          currency: originalCurrency,
          description: transaction.description,
          cardNumber: dto.cardNumber,
          cardHolder: dto.cardHolder,
          expiryDate: dto.expiryDate,
          cvv: dto.cvv,
          email: dto.email,
        })

        await this.transactionRepo.update(transaction.id, {
          status: stripeResponse.status,
          authorizationCode: stripeResponse.authorizationCode,
          originalAmount: transaction.amount,
          originalCurrency,
          amount: finalAmount,
          currency: 'PYG',
          exchangeRate,
          paymentMethod: 'stripe',
          cardBrand: this.detectCardBrand(dto.cardNumber),
          processedAt: new Date(),
        })

        if (stripeResponse.status === 'AUTHORIZED') {
          await this.fraudDetectionService.recordSuccessfulPayment(dto.ipAddress, dto.cardNumber)
          await this.createSettlement(transaction.id, transaction.merchantId, finalAmount)
        } else {
          await this.fraudDetectionService.recordFailedPayment(dto.ipAddress, dto.cardNumber)
        }

        return {
          success: stripeResponse.success,
          transactionId: transaction.id,
          status: stripeResponse.status,
          authorizationCode: stripeResponse.authorizationCode,
          message: stripeResponse.message,
          originalAmount: transaction.amount,
          originalCurrency,
          convertedAmount: finalAmount,
          exchangeRate,
        }
      }

      // Local payment with Bancard
      const bancardResponse = await this.bancardGateway.processPayment({
        shopProcessId: (transaction as any).merchant.shopProcessId,
        amount: transaction.amount,
        currency: transaction.currency,
        description: transaction.description,
        cardNumber: dto.cardNumber,
        cardHolder: dto.cardHolder,
        expiryDate: dto.expiryDate,
        cvv: dto.cvv,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
        privateKey: (transaction as any).merchant.privateKey,
      })

      await this.transactionRepo.update(transaction.id, {
        status: bancardResponse.status,
        authorizationCode: bancardResponse.authorizationCode,
        bancardTicket: bancardResponse.ticket,
        processedAt: new Date(),
      })

      if (bancardResponse.status === 'AUTHORIZED') {
        // ✅ Success: Record successful payment
        await this.fraudDetectionService.recordSuccessfulPayment(dto.ipAddress, dto.cardNumber)
        await this.createSettlement(transaction.id, transaction.merchantId, transaction.amount)
      } else {
        // ❌ Failed: Record failed attempt
        await this.fraudDetectionService.recordFailedPayment(dto.ipAddress, dto.cardNumber)
      }

      return {
        success: bancardResponse.status === 'AUTHORIZED',
        transactionId: transaction.id,
        status: bancardResponse.status,
        authorizationCode: bancardResponse.authorizationCode,
        message: bancardResponse.message,
      }
    } catch (error) {
      // ❌ Error: Record failed attempt
      await this.fraudDetectionService.recordFailedPayment(dto.ipAddress, dto.cardNumber)
      
      await this.transactionRepo.update(transaction.id, {
        status: 'ERROR',
        errorMessage: error.message,
        processedAt: new Date(),
      })

      throw new BadRequestException('Payment processing failed')
    }
  }

  async getTransactionStatus(id: string) {
    const transaction = await this.transactionRepo.findById(id)

    if (!transaction) {
      throw new NotFoundException('Transaction not found')
    }

    // 🔒 DATA MASKING: Mask sensitive data in response
    return {
      id: transaction.id,
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency,
      description: transaction.description,
      authorizationCode: transaction.authorizationCode,
      processedAt: transaction.processedAt,
      documentNumber: this.dataMaskingService.maskDocument(transaction.documentNumber, transaction.documentType as 'RUC' | 'CI'),
      cardLastFour: transaction.cardLastFour,
    }
  }

  private async createSettlement(transactionId: string, merchantId: string, amount: number) {
    // Settlement logic will be implemented in settlement module
    // This is a placeholder for the settlement creation
  }

  /**
   * Detect if card is international based on BIN
   */
  private isInternationalCard(cardNumber: string): boolean {
    // Paraguay BINs typically start with specific ranges
    // This is a simplified check - in production, use a BIN database
    const bin = cardNumber.substring(0, 6)
    const paraguayBins = ['542116', '542117', '542118'] // Example Bancard BINs

    return !paraguayBins.some(pb => bin.startsWith(pb.substring(0, 4)))
  }

  /**
   * Detect card brand from number
   */
  private detectCardBrand(cardNumber: string): string {
    const firstDigit = cardNumber[0]
    const firstTwo = cardNumber.substring(0, 2)

    if (firstDigit === '4') return 'visa'
    if (['51', '52', '53', '54', '55'].includes(firstTwo)) return 'mastercard'
    if (['34', '37'].includes(firstTwo)) return 'amex'
    if (firstTwo === '60') return 'discover'

    return 'unknown'
  }
}
