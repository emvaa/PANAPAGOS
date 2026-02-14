import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test merchant
  const merchant = await prisma.merchant.upsert({
    where: { email: 'demo@panapagos.com' },
    update: {
      name: 'PANAPAGOS Demo Store',
      ruc: '80012345-6',
      isActive: 1,
      commissionRate: 2.5,
    },
    create: {
      name: 'PANAPAGOS Demo Store',
      email: 'demo@panapagos.com',
      ruc: '80012345-6',
      apiKey: 'oro_test_key_' + Math.random().toString(36).substring(7),
      apiSecret: 'oro_test_secret_' + Math.random().toString(36).substring(7),
      shopProcessId: 'demo_shop_' + Math.random().toString(36).substring(7),
      privateKey: 'demo_private_key_xyz789',
      isActive: 1,
      commissionRate: 2.5,
    },
  })

  console.log('✅ Created merchant:', merchant.name)
  console.log('📧 Email:', merchant.email)
  console.log('🔑 API Key:', merchant.apiKey)
  console.log('🏪 Shop Process ID:', merchant.shopProcessId)

  // Create test users for fintech features
  const user1 = await prisma.user.upsert({
    where: { email: 'juan@test.com' },
    update: {},
    create: {
      email: 'juan@test.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      phone: '+595981234567',
      documentType: 'CI',
      documentNumber: '1234567',
      passwordHash: '$2b$10$demoHashForTesting123456789',
      emailVerified: 1,
      kycStatus: 'APPROVED',
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'maria@test.com' },
    update: {},
    create: {
      email: 'maria@test.com',
      firstName: 'María',
      lastName: 'González',
      phone: '+595981234568',
      documentType: 'CI',
      documentNumber: '7654321',
      passwordHash: '$2b$10$demoHashForTesting123456789',
      emailVerified: 1,
      kycStatus: 'APPROVED',
    },
  })

  console.log('✅ Created users:', user1.email, user2.email)

  // Create wallets for users
  const wallet1 = await prisma.wallet.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      balance: 1000000, // Gs. 1,000,000
      currency: 'PYG',
      status: 'ACTIVE',
    },
  })

  const wallet2 = await prisma.wallet.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      balance: 500000, // Gs. 500,000
      currency: 'PYG',
      status: 'ACTIVE',
    },
  })

  console.log('✅ Created wallets with balances')

  // Create accounts for double-entry ledger
  const account1Main = await prisma.account.create({
    data: {
      walletId: wallet1.id,
      accountType: 'MAIN',
      accountNumber: 'ACC-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      balance: 1000000,
      currency: 'PYG',
      status: 'ACTIVE',
    },
  })

  const account2Main = await prisma.account.create({
    data: {
      walletId: wallet2.id,
      accountType: 'MAIN',
      accountNumber: 'ACC-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      balance: 500000,
      currency: 'PYG',
      status: 'ACTIVE',
    },
  })

  console.log('✅ Created accounts for ledger')

  // Create sample transaction
  const transaction = await prisma.transaction.create({
    data: {
      merchantId: merchant.id,
      amount: 150000,
      currency: 'PYG',
      description: 'Compra de prueba - Demo Store',
      status: 'PENDING',
      documentType: 'CI',
      documentNumber: '1234567',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Test Browser)',
    },
  })

  console.log('✅ Created sample transaction:', transaction.id)

  console.log('\n📊 Database seeded successfully!')
  console.log('\n🔐 Test Credentials:')
  console.log('Merchant API Key:', merchant.apiKey)
  console.log('User 1:', user1.email, '- Wallet Balance: Gs.', wallet1.balance.toLocaleString('es-PY'))
  console.log('User 2:', user2.email, '- Wallet Balance: Gs.', wallet2.balance.toLocaleString('es-PY'))
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
