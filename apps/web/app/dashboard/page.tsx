'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, QrCode, DollarSign, Share2 } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { CreatePaymentModal } from '@/components/dashboard/CreatePaymentModal'
import { PaymentLinkCard } from '@/components/dashboard/PaymentLinkCard'
import { ShimmerLoader, CardSkeleton } from '@/components/ui/ShimmerLoader'

interface PaymentLink {
  id: string
  shortCode: string
  amount: number
  currency: string
  description: string
  paymentLink: string
  expiresAt: string
  createdAt: string
}

export default function DashboardPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1500)
  }, [])

  const handleCreatePayment = async (data: any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/checkout/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Error creating payment link')
      }

      const result = await response.json()
      
      const newLink: PaymentLink = {
        id: result.transactionId,
        shortCode: result.shortCode,
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        paymentLink: result.paymentLink,
        expiresAt: result.expiresAt,
        createdAt: new Date().toISOString(),
      }

      setPaymentLinks([newLink, ...paymentLinks])
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating payment:', error)
      alert('Error al crear el link de pago')
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-gradient">Panel de Cobros</h1>
            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="gold-gradient text-obsidian font-bold px-6 py-3 rounded-lg flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              Crear Cobro
            </motion.button>
          </div>
          <p className="text-silver">Genera links de pago y códigos QR para cobrar</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card glass-card-hover p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-gold" />
              </div>
              <div>
                <p className="text-sm text-silver">Links Activos</p>
                <p className="text-2xl font-bold text-white">{paymentLinks.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card glass-card-hover p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                <QrCode className="w-6 h-6 text-gold" />
              </div>
              <div>
                <p className="text-sm text-silver">QR Generados</p>
                <p className="text-2xl font-bold text-white">{paymentLinks.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card glass-card-hover p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                <Share2 className="w-6 h-6 text-gold" />
              </div>
              <div>
                <p className="text-sm text-silver">Compartidos</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Payment Links List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Links de Pago</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : paymentLinks.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <QrCode className="w-16 h-16 text-gold/50 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No hay links de pago</h3>
              <p className="text-silver mb-6">Crea tu primer link de pago para empezar a cobrar</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="gold-gradient text-obsidian font-bold px-8 py-3 rounded-lg inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Crear Primer Cobro
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {paymentLinks.map((link, index) => (
                <PaymentLinkCard key={link.id} link={link} index={index} />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Create Payment Modal */}
      {showCreateModal && (
        <CreatePaymentModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePayment}
        />
      )}
    </DashboardLayout>
  )
}
