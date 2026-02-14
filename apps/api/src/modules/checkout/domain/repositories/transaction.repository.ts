import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infrastructure/database/prisma.service'
import { Transaction } from '@prisma/client'

@Injectable()
export class TransactionRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    merchantId: string
    amount: number
    currency: string
    description: string
    status: string
    documentType: string
    documentNumber: string
    metadata?: any
  }): Promise<Transaction> {
    return this.prisma.transaction.create({
      data: {
        ...data,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
      include: {
        merchant: true,
      },
    }) as any
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.prisma.transaction.findUnique({
      where: { id },
      include: {
        merchant: true,
        paymentLink: true,
      },
    }) as any
  }

  async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const { id: _, merchantId, createdAt, updatedAt, ...updateData } = data as any
    return this.prisma.transaction.update({
      where: { id },
      data: updateData,
    })
  }

  async findByMerchant(merchantId: string, limit: number = 50): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        paymentLink: true,
      },
    }) as any
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<Transaction | null> {
    return this.prisma.transaction.findUnique({
      where: { idempotencyKey },
      include: {
        merchant: true,
        paymentLink: true,
      },
    }) as any
  }
}
