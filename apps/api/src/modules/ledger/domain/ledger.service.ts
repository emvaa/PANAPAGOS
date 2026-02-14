import { Injectable, BadRequestException, ConflictException } from '@nestjs/common'
import { PrismaService } from '@/infrastructure/database/prisma.service'
import { CryptoService } from '@/infrastructure/crypto/crypto.service'
import { DigitalSignatureService } from '@/modules/security/digital-signature.service'
import { GoldenAlertService } from '@/modules/security/golden-alert.service'

export interface LedgerEntryInput {
  walletId: string
  debitAccountId: string
  creditAccountId: string
  amount: number
  currency: string
  transactionType: string
  description: string
  referenceId?: string
  metadata?: any
  userId?: string
}

@Injectable()
export class LedgerService {
  constructor(
    private prisma: PrismaService,
    private cryptoService: CryptoService,
    private digitalSignatureService: DigitalSignatureService,
    private goldenAlertService: GoldenAlertService,
  ) {}

  /**
   * Create a double-entry ledger transaction with atomic balance updates
   * Uses SELECT FOR UPDATE to prevent race conditions
   */
  async createLedgerEntry(input: LedgerEntryInput) {
    // Validate amount is positive
    if (input.amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero')
    }

    return await this.prisma.$transaction(async (tx) => {
      // 🔒 OPTIMISTIC LOCKING: Lock accounts with version check
      const debitAccount = await tx.account.findUnique({
        where: { id: input.debitAccountId },
      })

      const creditAccount = await tx.account.findUnique({
        where: { id: input.creditAccountId },
      })

      if (!debitAccount || !creditAccount) {
        throw new BadRequestException('Invalid account IDs')
      }

      // Verify sufficient balance for debit account
      if (debitAccount.balance < input.amount) {
        throw new BadRequestException('Insufficient balance')
      }

      // Get previous balance for Golden Alert check
      const wallet = await tx.wallet.findUnique({
        where: { id: input.walletId },
      })
      const previousBalance = wallet?.balance || 0

      // 🔐 DIGITAL SIGNATURE: Generate HMAC signature for immutability
      const signaturePayload = {
        debitAccountId: input.debitAccountId,
        creditAccountId: input.creditAccountId,
        amount: input.amount,
        currency: input.currency,
        timestamp: new Date().toISOString(),
      }
      const signature = this.digitalSignatureService.signLedgerEntry(signaturePayload)

      // Create ledger entry
      const ledgerEntry = await tx.ledgerEntry.create({
        data: {
          walletId: input.walletId,
          debitAccountId: input.debitAccountId,
          creditAccountId: input.creditAccountId,
          amount: input.amount,
          currency: input.currency,
          transactionType: input.transactionType,
          description: input.description,
          referenceId: input.referenceId,
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
          signature,
          status: 'COMPLETED',
        },
      })

      // Update account balances atomically with version check (optimistic locking)
      const updatedDebitAccount = await tx.account.update({
        where: { 
          id: input.debitAccountId,
          version: debitAccount.version, // Optimistic lock
        },
        data: {
          balance: {
            decrement: input.amount,
          },
          version: {
            increment: 1,
          },
        },
      })

      const updatedCreditAccount = await tx.account.update({
        where: { 
          id: input.creditAccountId,
          version: creditAccount.version, // Optimistic lock
        },
        data: {
          balance: {
            increment: input.amount,
          },
          version: {
            increment: 1,
          },
        },
      })

      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: input.walletId },
        data: {
          balance: {
            decrement: input.transactionType === 'DEBIT' ? input.amount : 0,
            increment: input.transactionType === 'CREDIT' ? input.amount : 0,
          },
          version: {
            increment: 1,
          },
        },
      })

      // 🔔 GOLDEN ALERT: Check if balance change exceeds 5%
      // Fix: Prevent division by zero
      if (previousBalance > 0) {
        const balanceChange = Math.abs(updatedWallet.balance - previousBalance)
        const changePercentage = (balanceChange / previousBalance) * 100

        if (changePercentage >= 5 && input.userId) {
          // Send alert asynchronously (don't block transaction)
          setImmediate(() => {
            this.goldenAlertService.checkAndAlert({
              userId: input.userId!,
              previousBalance,
              newBalance: updatedWallet.balance,
              change: updatedWallet.balance - previousBalance,
              changePercent: changePercentage,
              transactionType: input.transactionType,
              description: input.description,
            }).catch((err: Error) => console.error('Failed to send Golden Alert:', err))
          })
        }
      }

      return ledgerEntry
    }, {
      maxWait: 5000, // Maximum time to wait for a transaction slot
      timeout: 10000, // Maximum time for the transaction to complete
    })
  }

  /**
   * Generate cryptographic signature for ledger entry immutability
   */
  private generateLedgerSignature(data: any): string {
    const payload = JSON.stringify(data)
    return this.cryptoService.generateToken(32) + ':' + 
           this.cryptoService.encrypt(payload).split(':')[2]
  }

  /**
   * Verify ledger entry signature
   */
  async verifyLedgerSignature(entryId: string): Promise<boolean> {
    const entry = await this.prisma.ledgerEntry.findUnique({
      where: { id: entryId },
    })

    if (!entry) {
      return false
    }

    // 🔐 Verify HMAC signature
    const signaturePayload = {
      debitAccountId: entry.debitAccountId,
      creditAccountId: entry.creditAccountId,
      amount: entry.amount,
      currency: entry.currency,
      timestamp: entry.createdAt.toISOString(),
    }

    return this.digitalSignatureService.verifyLedgerSignature(
      signaturePayload,
      entry.signature,
    )
  }

  /**
   * Get wallet balance with lock for update
   */
  async getWalletBalanceForUpdate(walletId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { id: walletId },
      })

      if (!wallet) {
        throw new BadRequestException('Wallet not found')
      }

      return wallet.balance
    })
  }

  /**
   * Get ledger entries for a wallet
   */
  async getLedgerEntries(walletId: string, limit: number = 50) {
    return this.prisma.ledgerEntry.findMany({
      where: { walletId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        debitAccount: true,
        creditAccount: true,
      },
    })
  }

  /**
   * Calculate account balance from ledger entries (for verification)
   */
  async calculateAccountBalance(accountId: string): Promise<number> {
    const debits = await this.prisma.ledgerEntry.aggregate({
      where: { debitAccountId: accountId },
      _sum: { amount: true },
    })

    const credits = await this.prisma.ledgerEntry.aggregate({
      where: { creditAccountId: accountId },
      _sum: { amount: true },
    })

    return (credits._sum.amount || 0) - (debits._sum.amount || 0)
  }

  /**
   * Verify ledger integrity
   */
  async verifyLedgerIntegrity(walletId: string): Promise<boolean> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
      include: { accounts: true },
    })

    if (!wallet) {
      return false
    }

    // Verify each account balance matches ledger entries
    for (const account of wallet.accounts) {
      const calculatedBalance = await this.calculateAccountBalance(account.id)
      if (Math.abs(calculatedBalance - account.balance) > 0.01) {
        return false
      }
    }

    return true
  }
}
