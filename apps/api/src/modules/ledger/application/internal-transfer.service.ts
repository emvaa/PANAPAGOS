import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@/infrastructure/database/prisma.service'
import { LedgerService } from '../domain/ledger.service'

export interface InternalTransferInput {
  senderId: string
  receiverEmail: string
  amount: number
  description: string
  twoFactorCode?: string
}

@Injectable()
export class InternalTransferService {
  constructor(
    private prisma: PrismaService,
    private ledgerService: LedgerService,
  ) {}

  /**
   * Transfer balance between PANAPAGOS users
   */
  async createTransfer(input: InternalTransferInput) {
    // Find receiver by email
    const receiver = await this.prisma.user.findUnique({
      where: { email: input.receiverEmail },
      include: { wallet: true },
    })

    if (!receiver) {
      throw new BadRequestException('Receiver not found')
    }

    if (receiver.id === input.senderId) {
      throw new BadRequestException('Cannot transfer to yourself')
    }

    // Get sender wallet
    const sender = await this.prisma.user.findUnique({
      where: { id: input.senderId },
      include: { wallet: { include: { accounts: true } } },
    })

    if (!sender || !sender.wallet) {
      throw new BadRequestException('Sender wallet not found')
    }

    // Verify 2FA if enabled
    if (sender.twoFactorEnabled === 1 && !input.twoFactorCode) {
      throw new ForbiddenException('2FA code required')
    }

    // Verify sufficient balance
    if (sender.wallet.balance < input.amount) {
      throw new BadRequestException('Insufficient balance')
    }

    // Create transfer record
    const transfer = await this.prisma.internalTransfer.create({
      data: {
        senderId: input.senderId,
        receiverId: receiver.id,
        amount: input.amount,
        currency: 'PYG',
        description: input.description,
        status: 'PROCESSING',
        twoFactorVerified: sender.twoFactorEnabled === 1 ? 1 : 0,
      },
    })

    try {
      // Get sender's main account
      const senderAccount = sender.wallet.accounts.find(
        (acc) => acc.accountType === 'MAIN',
      )

      if (!senderAccount) {
        throw new BadRequestException('Sender account not found')
      }

      // Get or create receiver's main account
      let receiverAccount = await this.prisma.account.findFirst({
        where: {
          walletId: receiver.wallet!.id,
          accountType: 'MAIN',
        },
      })

      if (!receiverAccount) {
        receiverAccount = await this.prisma.account.create({
          data: {
            walletId: receiver.wallet!.id,
            accountType: 'MAIN',
            accountNumber: `ACC-${receiver.id.slice(0, 8)}`,
            balance: 0,
            currency: 'PYG',
            status: 'ACTIVE',
          },
        })
      }

      // Create ledger entry (double-entry)
      const ledgerEntry = await this.ledgerService.createLedgerEntry({
        walletId: sender.wallet.id,
        debitAccountId: senderAccount.id,
        creditAccountId: receiverAccount.id,
        amount: input.amount,
        currency: 'PYG',
        transactionType: 'TRANSFER',
        description: `Transfer to ${receiver.email}: ${input.description}`,
        referenceId: transfer.id,
        metadata: {
          senderEmail: sender.email,
          receiverEmail: receiver.email,
        },
      })

      // Update transfer status
      await this.prisma.internalTransfer.update({
        where: { id: transfer.id },
        data: {
          status: 'COMPLETED',
          ledgerEntryId: ledgerEntry.id,
          completedAt: new Date(),
        },
      })

      return {
        transferId: transfer.id,
        amount: input.amount,
        receiver: {
          email: receiver.email,
          name: `${receiver.firstName} ${receiver.lastName}`,
        },
        status: 'COMPLETED',
      }
    } catch (error) {
      // Rollback transfer on error
      await this.prisma.internalTransfer.update({
        where: { id: transfer.id },
        data: { status: 'FAILED' },
      })

      throw error
    }
  }

  /**
   * Get transfer history for a user
   */
  async getTransferHistory(userId: string, limit: number = 50) {
    const transfers = await this.prisma.internalTransfer.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        sender: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        receiver: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return transfers.map((transfer) => ({
      id: transfer.id,
      amount: transfer.amount,
      currency: transfer.currency,
      description: transfer.description,
      status: transfer.status,
      type: transfer.senderId === userId ? 'SENT' : 'RECEIVED',
      counterparty:
        transfer.senderId === userId
          ? {
              email: transfer.receiver.email,
              name: `${transfer.receiver.firstName} ${transfer.receiver.lastName}`,
            }
          : {
              email: transfer.sender.email,
              name: `${transfer.sender.firstName} ${transfer.sender.lastName}`,
            },
      createdAt: transfer.createdAt,
      completedAt: transfer.completedAt,
    }))
  }
}
