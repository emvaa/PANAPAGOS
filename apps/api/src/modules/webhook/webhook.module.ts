import { Module } from '@nestjs/common'
import { WebhookController } from './webhook.controller'
import { WebhookService } from './webhook.service'
import { TransactionRepository } from '../checkout/domain/repositories/transaction.repository'
import { StripeGateway } from '../checkout/infrastructure/stripe.gateway'
import { CryptoModule } from '@/infrastructure/crypto/crypto.module'
import { PrismaModule } from '@/infrastructure/database/prisma.module'

@Module({
  imports: [CryptoModule, PrismaModule],
  controllers: [WebhookController],
  providers: [WebhookService, TransactionRepository, StripeGateway],
})
export class WebhookModule {}
