import { Controller, Post, Get, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common'
import { InternalTransferService } from './application/internal-transfer.service'
import { BillPaymentService } from './application/bill-payment.service'
import { EscrowService } from './application/escrow.service'
import { LedgerService } from './domain/ledger.service'

@Controller('ledger')
export class LedgerController {
  constructor(
    private readonly internalTransferService: InternalTransferService,
    private readonly billPaymentService: BillPaymentService,
    private readonly escrowService: EscrowService,
    private readonly ledgerService: LedgerService,
  ) {}

  // ============================================
  // INTERNAL TRANSFERS
  // ============================================

  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  async createTransfer(@Body() body: any) {
    return this.internalTransferService.createTransfer(body)
  }

  @Get('transfers/:userId')
  async getTransferHistory(@Param('userId') userId: string, @Query('limit') limit?: string) {
    return this.internalTransferService.getTransferHistory(
      userId,
      limit ? parseInt(limit) : 50,
    )
  }

  // ============================================
  // BILL PAYMENTS
  // ============================================

  @Post('bill-payment')
  @HttpCode(HttpStatus.OK)
  async payBill(@Body() body: any) {
    return this.billPaymentService.payBill(body)
  }

  @Get('bill-payments/:userId')
  async getBillPaymentHistory(@Param('userId') userId: string) {
    return this.billPaymentService.getBillPaymentHistory(userId)
  }

  @Get('providers')
  async getProviders() {
    return this.billPaymentService.getAvailableProviders()
  }

  // ============================================
  // ESCROW
  // ============================================

  @Post('escrow/hold')
  @HttpCode(HttpStatus.OK)
  async holdPayment(@Body() body: { transactionId: string; amount: number; holdUntil?: string }) {
    return this.escrowService.holdPayment(
      body.transactionId,
      body.amount,
      body.holdUntil ? new Date(body.holdUntil) : undefined,
    )
  }

  @Post('escrow/:escrowId/release')
  @HttpCode(HttpStatus.OK)
  async releasePayment(@Param('escrowId') escrowId: string) {
    return this.escrowService.releasePayment(escrowId)
  }

  @Post('escrow/:escrowId/refund')
  @HttpCode(HttpStatus.OK)
  async refundPayment(@Param('escrowId') escrowId: string, @Body() body: { reason: string }) {
    return this.escrowService.refundPayment(escrowId, body.reason)
  }

  @Get('escrow')
  async getEscrowTransactions(@Query('status') status?: string) {
    return this.escrowService.getEscrowTransactions(status)
  }

  // ============================================
  // LEDGER ENTRIES
  // ============================================

  @Get('entries/:walletId')
  async getLedgerEntries(@Param('walletId') walletId: string, @Query('limit') limit?: string) {
    return this.ledgerService.getLedgerEntries(walletId, limit ? parseInt(limit) : 50)
  }

  @Get('verify/:walletId')
  async verifyLedgerIntegrity(@Param('walletId') walletId: string) {
    const isValid = await this.ledgerService.verifyLedgerIntegrity(walletId)
    return { walletId, isValid }
  }
}
