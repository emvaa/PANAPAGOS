'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, Sparkles } from 'lucide-react'

interface PaymentSummaryProps {
  amount: number
  currency: 'PYG' | 'USD'
  description: string
  merchantName: string
}

export function PaymentSummary({ amount, currency, description, merchantName }: PaymentSummaryProps) {
  const formatAmount = (value: number, curr: string) => {
    // Ensure currency is valid
    const validCurrency = curr && (curr === 'PYG' || curr === 'USD') ? curr : 'PYG'
    
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: validCurrency,
      minimumFractionDigits: validCurrency === 'PYG' ? 0 : 2,
    }).format(value)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card glass-card-hover p-8 relative overflow-hidden"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-gold/30 via-transparent to-silver/30"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            <span className="text-sm text-silver">Resumen de Pago</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gold">
            <ShieldCheck className="w-4 h-4" />
            <span>Seguro PCI-DSS</span>
          </div>
        </div>

        {/* Merchant */}
        <div className="mb-4">
          <p className="text-xs text-silver mb-1">Comercio</p>
          <p className="text-lg font-semibold text-white">{merchantName}</p>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-xs text-silver mb-1">Concepto</p>
          <p className="text-sm text-white/80">{description}</p>
        </div>

        {/* Amount */}
        <div className="border-t border-gold/20 pt-6">
          <div className="flex items-end justify-between">
            <span className="text-sm text-silver">Total a pagar</span>
            <motion.div
              className="text-gradient text-4xl font-bold"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {formatAmount(amount, currency)}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
