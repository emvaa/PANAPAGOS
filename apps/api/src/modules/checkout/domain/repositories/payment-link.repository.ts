import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infrastructure/database/prisma.service'
import { PaymentLink } from '@prisma/client'

@Injectable()
export class PaymentLinkRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    merchantId: string
    transactionId: string
    shortCode: string
    amount: number
    currency: string
    description: string
    expiresAt: Date
    isActive: number
    maxUses: number
    usedCount: number
  }): Promise<PaymentLink> {
    return this.prisma.paymentLink.create({
      data,
    })
  }

  async findByShortCode(shortCode: string): Promise<PaymentLink | null> {
    return this.prisma.paymentLink.findUnique({
      where: { shortCode },
      include: {
        merchant: true,
        transaction: {
          include: {
            merchant: true,
          },
        },
      },
    }) as any
  }

  async update(id: string, data: Partial<PaymentLink>): Promise<PaymentLink> {
    return this.prisma.paymentLink.update({
      where: { id },
      data,
    })
  }

  async incrementUsedCount(id: string): Promise<PaymentLink> {
    return this.prisma.paymentLink.update({
      where: { id },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    })
  }
}
