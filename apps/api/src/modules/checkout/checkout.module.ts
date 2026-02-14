import { Module } from '@nestjs/common'
import { CheckoutController } from './checkout.controller'
import { CheckoutService } from './application/checkout.service'
import { BancardGateway } from './infrastructure/bancard.gateway'
import { StripeGateway } from './infrastructure/stripe.gateway'
import { TransactionRepository } from './domain/repositories/transaction.repository'
import { PaymentLinkRepository } from './domain/repositories/payment-link.repository'
import { SecurityModule } from '../security/security.module'

@Module({
  imports: [SecurityModule],
  controllers: [CheckoutController],
  providers: [
    CheckoutService,
    BancardGateway,
    StripeGateway,
    TransactionRepository,
    PaymentLinkRepository,
  ],
  exports: [CheckoutService],
})
export class CheckoutModule {}
