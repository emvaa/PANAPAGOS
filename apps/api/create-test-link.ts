import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestPaymentLink() {
  console.log('🔍 Finding merchant...')
  
  const merchant = await prisma.merchant.findFirst()
  
  if (!merchant) {
    console.error('❌ No merchant found. Run: npx ts-node prisma/seed.ts')
    process.exit(1)
  }

  console.log('✅ Found merchant:', merchant.name)
  console.log('📧 Email:', merchant.email)
  console.log('🆔 ID:', merchant.id)
  
  console.log('\n📝 Creating test payment link...')
  
  const response = await fetch('http://localhost:4000/v1/checkout/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      merchantId: merchant.id,
      amount: 150000,
      currency: 'PYG',
      description: 'Producto Premium - Demo PANAPAGOS',
      expirationSeconds: 3600,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('❌ Error creating payment link:', error)
    process.exit(1)
  }

  const data = await response.json()
  
  console.log('\n✅ Payment link created successfully!')
  console.log('🔗 Payment URL:', data.paymentLink)
  console.log('🎫 Short Code:', data.shortCode)
  console.log('⏰ Expires at:', new Date(data.expiresAt).toLocaleString())
  console.log('\n🌐 Open in browser:', data.paymentLink)
}

createTestPaymentLink()
  .catch((e) => {
    console.error('❌ Error:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
