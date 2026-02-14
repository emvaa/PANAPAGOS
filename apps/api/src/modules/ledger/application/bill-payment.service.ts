import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@/infrastructure/database/prisma.service'
import { LedgerService } from '../domain/ledger.service'

export interface BillPaymentInput {
  userId: string
  provider: 'ANDE' | 'ESSAP' | 'TIGO' | 'PERSONAL' | 'CLARO'
  serviceType: 'ELECTRICITY' | 'WATER' | 'MOBILE' | 'INTERNET'
  accountNumber: string
  amount: number
}

@Injectable()
export class BillPaymentService {
  constructor(
    private prisma: PrismaService,
    private ledgerService: LedgerService,
  ) {}

  /**
   * Pay bill using wallet balance
   */
  async payBill(input: BillPaymentInput) {
    // Get user wallet
    const user = await this.prisma.user.findUnique({
      where: { id: input.userId },
      include: {
        wallet: {
          include: { accounts: true },
        },
      },
    })

    if (!user || !user.wallet) {
      throw new BadRequestException('User wallet not found')
    }

    // Verify sufficient balance
    if (user.wallet.balance < input.amount) {
      throw new BadRequestException('Insufficient balance')
    }

    // Create bill payment record
    const billPayment = await this.prisma.billPayment.create({
      data: {
        userId: input.userId,
        provider: input.provider,
        serviceType: input.serviceType,
        accountNumber: input.accountNumber,
        amount: input.amount,
        currency: 'PYG',
        status: 'PROCESSING',
      },
    })

    try {
      // Get user's main account
      const userAccount = user.wallet.accounts.find((acc) => acc.accountType === 'MAIN')

      if (!userAccount) {
        throw new BadRequestException('User account not found')
      }

      // Get or create provider account
      let providerAccount = await this.prisma.account.findFirst({
        where: {
          accountType: 'PROVIDER',
          accountNumber: `PROVIDER-${input.provider}`,
        },
      })

      if (!providerAccount) {
        // Create system wallet for providers
        let systemWallet = await this.prisma.wallet.findFirst({
          where: { userId: 'SYSTEM' },
        })

        if (!systemWallet) {
          // Create system user first
          const systemUser = await this.prisma.user.upsert({
            where: { email: 'system@oropay.com' },
            update: {},
            create: {
              id: 'SYSTEM',
              email: 'system@oropay.com',
              firstName: 'System',
              lastName: 'Account',
              documentType: 'RUC',
              documentNumber: '80000000-0',
              passwordHash: 'SYSTEM',
            },
          })

          systemWallet = await this.prisma.wallet.create({
            data: {
              userId: systemUser.id,
              balance: 0,
              currency: 'PYG',
              status: 'ACTIVE',
            },
          })
        }

        providerAccount = await this.prisma.account.create({
          data: {
            walletId: systemWallet.id,
            accountType: 'PROVIDER',
            accountNumber: `PROVIDER-${input.provider}`,
            balance: 0,
            currency: 'PYG',
            status: 'ACTIVE',
          },
        })
      }

      // Process payment through provider API (Mock)
      const paymentResult = await this.processProviderPayment(input)

      // Create ledger entry
      const ledgerEntry = await this.ledgerService.createLedgerEntry({
        walletId: user.wallet.id,
        debitAccountId: userAccount.id,
        creditAccountId: providerAccount.id,
        amount: input.amount,
        currency: 'PYG',
        transactionType: 'BILL_PAYMENT',
        description: `${input.provider} - ${input.serviceType} payment`,
        referenceId: billPayment.id,
        metadata: {
          provider: input.provider,
          accountNumber: input.accountNumber,
          referenceNumber: paymentResult.referenceNumber,
        },
      })

      // Update bill payment status
      await this.prisma.billPayment.update({
        where: { id: billPayment.id },
        data: {
          status: 'COMPLETED',
          referenceNumber: paymentResult.referenceNumber,
          ledgerEntryId: ledgerEntry.id,
          completedAt: new Date(),
        },
      })

      return {
        billPaymentId: billPayment.id,
        provider: input.provider,
        amount: input.amount,
        referenceNumber: paymentResult.referenceNumber,
        status: 'COMPLETED',
      }
    } catch (error) {
      // Update bill payment status on error
      await this.prisma.billPayment.update({
        where: { id: billPayment.id },
        data: {
          status: 'FAILED',
          metadata: JSON.stringify({ error: error.message }),
        },
      })

      throw error
    }
  }

  /**
   * Mock provider API integration
   */
  private async processProviderPayment(input: BillPaymentInput): Promise<{
    success: boolean
    referenceNumber: string
  }> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock successful payment
    return {
      success: true,
      referenceNumber: `${input.provider}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    }
  }

  /**
   * Get bill payment history
   */
  async getBillPaymentHistory(userId: string, limit: number = 50) {
    return this.prisma.billPayment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  /**
   * Get available providers
   */
  getAvailableProviders() {
    return [
      {
        id: 'ANDE',
        name: 'ANDE',
        serviceType: 'ELECTRICITY',
        logo: '/providers/ande.png',
      },
      {
        id: 'ESSAP',
        name: 'ESSAP',
        serviceType: 'WATER',
        logo: '/providers/essap.png',
      },
      {
        id: 'TIGO',
        name: 'Tigo',
        serviceType: 'MOBILE',
        logo: '/providers/tigo.png',
      },
      {
        id: 'PERSONAL',
        name: 'Personal',
        serviceType: 'MOBILE',
        logo: '/providers/personal.png',
      },
      {
        id: 'CLARO',
        name: 'Claro',
        serviceType: 'MOBILE',
        logo: '/providers/claro.png',
      },
    ]
  }
}
