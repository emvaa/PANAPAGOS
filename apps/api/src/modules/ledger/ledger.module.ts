import { Module } from '@nestjs/common'
import { LedgerController } from './ledger.controller'
import { LedgerService } from './domain/ledger.service'
import { InternalTransferService } from './application/internal-transfer.service'
import { BillPaymentService } from './application/bill-payment.service'
import { EscrowService } from './application/escrow.service'
import { SecurityModule } from '../security/security.module'

@Module({
  imports: [SecurityModule],
  controllers: [LedgerController],
  providers: [
    LedgerService,
    InternalTransferService,
    BillPaymentService,
    EscrowService,
  ],
  exports: [LedgerService],
})
export class LedgerModule {}
