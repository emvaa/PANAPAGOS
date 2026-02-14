import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CheckoutModule } from './modules/checkout/checkout.module'
import { WebhookModule } from './modules/webhook/webhook.module'
import { LedgerModule } from './modules/ledger/ledger.module'
import { SecurityModule } from './modules/security/security.module'
import { PrismaModule } from './infrastructure/database/prisma.module'
import { RedisModule } from './infrastructure/cache/redis.module'
import { CryptoModule } from './infrastructure/crypto/crypto.module'
import { CurrencyModule } from './infrastructure/currency/currency.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    RedisModule,
    CryptoModule,
    CurrencyModule,
    SecurityModule,
    CheckoutModule,
    WebhookModule,
    LedgerModule,
  ],
})
export class AppModule {}
