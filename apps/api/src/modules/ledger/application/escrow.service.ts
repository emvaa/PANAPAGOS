import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@/infrastructure/database/prisma.service'
import { LedgerService } from '../domain/ledger.service'

@Injectable()
export class EscrowService {
  constructor(
    private prisma: PrismaService,
    private ledgerService: LedgerService,
  ) {}

  /**
   * Hold payment in escrow until confirmation
   */
  async holdPayment(transactionId: string, amount: number, holdUntilDate?: Date) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    })

    if (!transaction) {
      throw new BadRequestException('Transaction not found')
    }

    if (transaction.status !== 'AUTHORIZED') {
      throw new BadRequestException('Transaction must be authorized first')
    }

    // Create escrow record
    const escrow = await this.prisma.escrowTransaction.create({
      data: {
        transactionId,
        amount,
        currency: transaction.currency,
        status: 'HELD',
        holdUntil: holdUntilDate,
      },
    })

    // Update transaction status
    await this.prisma.transaction.update({
      where: { id: transactionId },
      data: { status: 'ESCROWED' },
    })

    return {
      escrowId: escrow.id,
      amount: escrow.amount,
      status: 'HELD',
      holdUntil: escrow.holdUntil,
    }
  }

  /**
   * Release payment from escrow
   */
  async releasePayment(escrowId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const escrow = await tx.escrowTransaction.findUnique({
        where: { id: escrowId },
      })

      if (!escrow) {
        throw new BadRequestException('Escrow not found')
      }

      if (escrow.status !== 'HELD') {
        throw new BadRequestException('Escrow already processed')
      }

      // Check if hold period has passed
      if (escrow.holdUntil && new Date() < escrow.holdUntil) {
        throw new BadRequestException('Hold period not yet expired')
      }

      // Update escrow status
      await tx.escrowTransaction.update({
        where: { id: escrowId },
        data: {
          status: 'RELEASED',
          releasedAt: new Date(),
        },
      })

      // Update transaction status
      await tx.transaction.update({
        where: { id: escrow.transactionId },
        data: { status: 'CAPTURED' },
      })

      return {
        escrowId: escrow.id,
        status: 'RELEASED',
        amount: escrow.amount,
        releasedAt: new Date(),
      }
    })
  }

  /**
   * Refund payment from escrow
   */
  async refundPayment(escrowId: string, reason: string) {
    return await this.prisma.$transaction(async (tx) => {
      const escrow = await tx.escrowTransaction.findUnique({
        where: { id: escrowId },
      })

      if (!escrow) {
        throw new BadRequestException('Escrow not found')
      }

      if (escrow.status !== 'HELD') {
        throw new BadRequestException('Escrow already processed')
      }

      // Update escrow status
      await tx.escrowTransaction.update({
        where: { id: escrowId },
        data: {
          status: 'REFUNDED',
          releasedAt: new Date(),
        },
      })

      // Update transaction status
      await tx.transaction.update({
        where: { id: escrow.transactionId },
        data: {
          status: 'REVERSED',
          errorMessage: `Refunded: ${reason}`,
        },
      })

      return {
        escrowId: escrow.id,
        status: 'REFUNDED',
        amount: escrow.amount,
        reason,
      }
    })
  }

  /**
   * Get escrow transactions
   */
  async getEscrowTransactions(status?: string) {
    return this.prisma.escrowTransaction.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
  }
}
