import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CryptoService } from '@/infrastructure/crypto/crypto.service'

interface BancardPaymentRequest {
  shopProcessId: string
  amount: number
  currency: string
  description: string
  cardNumber: string
  cardHolder: string
  expiryDate: string
  cvv: string
  documentType: string
  documentNumber: string
  privateKey: string
}

interface BancardPaymentResponse {
  status: 'AUTHORIZED' | 'DENIED' | 'ERROR'
  authorizationCode?: string
  ticket?: string
  message: string
}

@Injectable()
export class BancardGateway {
  private readonly logger = new Logger(BancardGateway.name)
  private readonly bancardUrl: string

  constructor(
    private configService: ConfigService,
    private cryptoService: CryptoService,
  ) {
    this.bancardUrl = this.configService.get<string>('BANCARD_API_URL', 'https://vpos.infonet.com.py:8888')
  }

  async processPayment(request: BancardPaymentRequest): Promise<BancardPaymentResponse> {
    try {
      const [expMonth, expYear] = request.expiryDate.split('/')
      
      const payload = {
        public_key: request.shopProcessId,
        operation: {
          token: 'single_buy',
          shop_process_id: request.shopProcessId,
          amount: this.formatAmount(request.amount, request.currency),
          currency: request.currency,
          description: request.description,
          additional_data: JSON.stringify({
            document_type: request.documentType,
            document_number: request.documentNumber,
          }),
        },
        card: {
          card_number: request.cardNumber,
          card_holder_name: request.cardHolder,
          card_expiration_month: expMonth,
          card_expiration_year: `20${expYear}`,
          security_code: request.cvv,
        },
      }

      const signature = this.cryptoService.generateBancardSignature(
        {
          shop_process_id: payload.operation.shop_process_id,
          amount: payload.operation.amount,
          currency: payload.operation.currency,
        },
        request.privateKey,
      )

      this.logger.log(`Processing payment for shop_process_id: ${request.shopProcessId}`)

      const response = await fetch(`${this.bancardUrl}/vpos/api/0.3/single_buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          signature,
        }),
      })

      const data = await response.json()

      if (data.status === 'success') {
        return {
          status: 'AUTHORIZED',
          authorizationCode: data.confirmation?.authorization_number,
          ticket: data.confirmation?.ticket_number,
          message: 'Payment authorized successfully',
        }
      } else if (data.status === 'error') {
        return {
          status: 'DENIED',
          message: data.messages?.[0]?.dsc || 'Payment denied',
        }
      }

      return {
        status: 'ERROR',
        message: 'Unknown response from payment gateway',
      }
    } catch (error) {
      this.logger.error(`Payment processing error: ${error.message}`, error.stack)
      return {
        status: 'ERROR',
        message: 'Payment gateway communication error',
      }
    }
  }

  private formatAmount(amount: number, currency: string): string {
    if (currency === 'PYG') {
      return Math.round(amount).toString()
    }
    return (amount * 100).toFixed(0)
  }
}
