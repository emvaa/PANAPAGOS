import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

interface StripePaymentRequest {
  amount: number
  currency: string
  description: string
  cardNumber: string
  cardHolder: string
  expiryDate: string
  cvv: string
  email?: string
  metadata?: Record<string, string>
}

interface StripePaymentResponse {
  success: boolean
  status: string
  authorizationCode?: string
  transactionId?: string
  message: string
  errorCode?: string
  requiresAction?: boolean
  clientSecret?: string
}

@Injectable()
export class StripeGateway {
  private readonly logger = new Logger(StripeGateway.name)
  private readonly apiKey: string
  private readonly webhookSecret: string
  private readonly apiUrl = 'https://api.stripe.com/v1'
  private stripe: any // Stripe instance

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('STRIPE_SECRET_KEY') || ''
    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || ''
    
    // Initialize Stripe SDK if available
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Stripe = require('stripe')
      this.stripe = new Stripe(this.apiKey, {
        apiVersion: '2023-10-16',
        typescript: true,
      })
      this.logger.log('Stripe SDK initialized successfully')
    } catch (error) {
      this.logger.warn('Stripe SDK not installed, using mock mode. Install with: npm install stripe')
    }
  }

  /**
   * Process international payment through Stripe
   */
  async processPayment(request: StripePaymentRequest): Promise<StripePaymentResponse> {
    try {
      // Validate input
      this.validatePaymentRequest(request)

      // Use mock mode for demo (Stripe requires tokenization in production)
      // TODO: Implement Stripe Elements in frontend for production
      this.logger.warn('Using mock Stripe mode for demo')
      return this.mockStripePayment(request)

      // Create payment intent with Stripe SDK
      // NOTE: This is disabled for demo. In production, use Stripe Elements
      // to tokenize cards on the frontend instead of sending raw card data
      throw new Error('Direct card API disabled. Use Stripe Elements for tokenization.')
      
      /*
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100), // Stripe uses cents
        currency: request.currency.toLowerCase(),
        description: request.description,
        receipt_email: request.email,
        metadata: {
          ...request.metadata,
          cardHolder: request.cardHolder,
        },
        payment_method_data: {
          type: 'card',
          card: {
            number: request.cardNumber,
            exp_month: parseInt(request.expiryDate.split('/')[0]),
            exp_year: parseInt('20' + request.expiryDate.split('/')[1]),
            cvc: request.cvv,
          },
          billing_details: {
            name: request.cardHolder,
            email: request.email,
          },
        },
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      })

      return {
        success: paymentIntent.status === 'succeeded',
        status: this.mapStripeStatus(paymentIntent.status),
        authorizationCode: paymentIntent.id,
        transactionId: paymentIntent.id,
        message: paymentIntent.status === 'succeeded' 
          ? 'Payment successful' 
          : 'Payment requires additional action',
        requiresAction: paymentIntent.status === 'requires_action',
        clientSecret: paymentIntent.client_secret,
      })
      */
      }
    } catch (error) {
      this.logger.error(`Stripe payment failed: ${error.message}`, error.stack)

      return {
        success: false,
        status: 'DECLINED',
        message: this.getErrorMessage(error),
        errorCode: error.code || 'UNKNOWN_ERROR',
      }
    }
  }

  /**
   * Validate payment request
   */
  private validatePaymentRequest(request: StripePaymentRequest): void {
    // Validate amount
    if (request.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0')
    }

    if (request.amount > 999999999) {
      throw new BadRequestException('Amount exceeds maximum limit')
    }

    // Validate currency
    const supportedCurrencies = ['USD', 'EUR', 'GBP', 'PYG', 'BRL', 'ARS']
    if (!supportedCurrencies.includes(request.currency.toUpperCase())) {
      throw new BadRequestException(`Currency ${request.currency} not supported`)
    }

    // Validate card number (basic Luhn check)
    if (!this.isValidCardNumber(request.cardNumber)) {
      throw new BadRequestException('Invalid card number')
    }

    // Validate expiry date
    if (!this.isValidExpiryDate(request.expiryDate)) {
      throw new BadRequestException('Invalid or expired card')
    }

    // Validate CVV
    if (!/^\d{3,4}$/.test(request.cvv)) {
      throw new BadRequestException('Invalid CVV')
    }

    // Validate card holder
    if (!request.cardHolder || request.cardHolder.length < 3) {
      throw new BadRequestException('Invalid card holder name')
    }
  }

  /**
   * Luhn algorithm for card validation
   */
  private isValidCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s/g, '')
    
    if (!/^\d{13,19}$/.test(cleaned)) {
      return false
    }

    let sum = 0
    let isEven = false

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i])

      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  }

  /**
   * Validate expiry date
   */
  private isValidExpiryDate(expiryDate: string): boolean {
    const match = expiryDate.match(/^(\d{2})\/(\d{2})$/)
    if (!match) return false

    const month = parseInt(match[1])
    const year = parseInt('20' + match[2])

    if (month < 1 || month > 12) return false

    const now = new Date()
    const expiry = new Date(year, month - 1)

    return expiry > now
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: any): string {
    const errorMessages: Record<string, string> = {
      card_declined: 'Your card was declined',
      insufficient_funds: 'Insufficient funds',
      expired_card: 'Your card has expired',
      incorrect_cvc: 'Incorrect CVV/CVC',
      processing_error: 'An error occurred processing your card',
      rate_limit: 'Too many requests, please try again later',
    }

    return errorMessages[error.code] || error.message || 'Payment failed'
  }

  /**
   * Mock Stripe payment for development
   */
  private mockStripePayment(request: StripePaymentRequest): StripePaymentResponse {
    this.logger.log('Using mock Stripe payment')

    // Test card numbers from Stripe documentation
    const testCards: Record<string, { success: boolean; status: string; message: string }> = {
      '4242424242424242': { 
        success: true, 
        status: 'AUTHORIZED', 
        message: 'Payment successful' 
      },
      '4000000000000002': { 
        success: false, 
        status: 'DECLINED', 
        message: 'Card declined' 
      },
      '4000000000009995': { 
        success: false, 
        status: 'DECLINED', 
        message: 'Insufficient funds' 
      },
      '4000000000000069': { 
        success: false, 
        status: 'DECLINED', 
        message: 'Expired card' 
      },
      '4000002500003155': { 
        success: true, 
        status: 'PENDING', 
        message: 'Requires 3D Secure authentication' 
      },
    }

    const result = testCards[request.cardNumber.replace(/\s/g, '')] || {
      success: true,
      status: 'AUTHORIZED',
      message: 'Payment successful',
    }

    return {
      ...result,
      authorizationCode: result.success ? `mock_${this.generateId()}` : undefined,
      transactionId: `pi_mock_${this.generateId()}`,
      errorCode: result.success ? undefined : 'card_declined',
    }
  }

  /**
   * Verify Stripe webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      if (!this.stripe || !this.webhookSecret) {
        this.logger.warn('Webhook verification skipped - Stripe not configured')
        return true // Allow in development
      }

      this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret)
      return true
    } catch (error) {
      this.logger.error(`Webhook signature verification failed: ${error.message}`)
      return false
    }
  }

  /**
   * Handle Stripe webhook event
   */
  async handleWebhookEvent(event: any): Promise<void> {
    this.logger.log(`Processing webhook event: ${event.type}`)

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object)
        break
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object)
        break
      case 'charge.refunded':
        await this.handleRefund(event.data.object)
        break
      case 'charge.dispute.created':
        await this.handleDispute(event.data.object)
        break
      default:
        this.logger.log(`Unhandled event type: ${event.type}`)
    }
  }

  private async handlePaymentSuccess(paymentIntent: any): Promise<void> {
    this.logger.log(`Payment succeeded: ${paymentIntent.id}`)
    // Update transaction status in database
  }

  private async handlePaymentFailure(paymentIntent: any): Promise<void> {
    this.logger.log(`Payment failed: ${paymentIntent.id}`)
    // Update transaction status and notify user
  }

  private async handleRefund(charge: any): Promise<void> {
    this.logger.log(`Refund processed: ${charge.id}`)
    // Process refund in ledger
  }

  private async handleDispute(dispute: any): Promise<void> {
    this.logger.log(`Dispute created: ${dispute.id}`)
    // Alert fraud detection system
  }

  /**
   * Map Stripe status to our internal status
   */
  private mapStripeStatus(stripeStatus: string): string {
    const statusMap: Record<string, string> = {
      succeeded: 'AUTHORIZED',
      processing: 'PROCESSING',
      requires_payment_method: 'PENDING',
      requires_confirmation: 'PENDING',
      requires_action: 'PENDING',
      canceled: 'DECLINED',
      failed: 'DECLINED',
    }

    return statusMap[stripeStatus] || 'ERROR'
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

  /**
   * Generate random ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15)
  }

  /**
   * Get Stripe fees for a transaction
   */
  getStripeFees(amount: number, currency: string): { fee: number; net: number } {
    // Stripe fees: 2.9% + $0.30 for US cards
    // International cards: +1.5%
    const isInternational = currency !== 'USD'
    const percentageFee = isInternational ? 0.044 : 0.029 // 4.4% or 2.9%
    const fixedFee = 0.30

    const fee = amount * percentageFee + fixedFee
    const net = amount - fee

    return {
      fee: Math.round(fee * 100) / 100,
      net: Math.round(net * 100) / 100,
    }
  }
}
