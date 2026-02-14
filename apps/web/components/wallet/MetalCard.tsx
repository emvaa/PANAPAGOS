'use client'

import { motion } from 'framer-motion'
import { Eye, EyeOff, Sparkles } from 'lucide-react'

interface MetalCardProps {
  balance: number
  showBalance: boolean
  onToggleBalance: () => void
  cardNumber: string
  cardHolder: string
  currency?: 'PYG' | 'USD'
}

export function MetalCard({
  balance,
  showBalance,
  onToggleBalance,
  cardNumber,
  cardHolder,
  currency = 'PYG',
}: MetalCardProps) {
  const formatAmount = (value: number) => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(value / 7500) // Mock exchange rate
    }
    
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="relative"
    >
      {/* Card Container */}
      <div className="relative w-full max-w-2xl mx-auto aspect-[1.586/1] perspective-1000">
        <motion.div
          className="relative w-full h-full rounded-3xl overflow-hidden"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {/* Metal Background with Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-obsidian via-obsidian-light to-obsidian">
            {/* Gold Accent Lines */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-gold to-transparent" />
              <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-gold to-transparent" />
            </div>

            {/* Animated Gradient Overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-gold/20 via-transparent to-silver/20"
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />

            {/* Noise Texture */}
            <div className="absolute inset-0 opacity-5 mix-blend-overlay">
              <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" />
            </div>
          </div>

          {/* Card Content */}
          <div className="relative z-10 p-8 h-full flex flex-col justify-between">
            {/* Top Section */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-gold" />
                  <span className="text-gold text-sm font-semibold tracking-wider">
                    PANAPAGOS
                  </span>
                </div>
                <p className="text-silver/70 text-xs">Cuenta Digital Premium</p>
              </div>

              <motion.button
                onClick={onToggleBalance}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {showBalance ? (
                  <Eye className="w-5 h-5 text-silver" />
                ) : (
                  <EyeOff className="w-5 h-5 text-silver" />
                )}
              </motion.button>
            </div>

            {/* Balance */}
            <div className="my-auto">
              <p className="text-silver/70 text-sm mb-2">Saldo Disponible</p>
              <motion.div
                key={showBalance ? 'visible' : 'hidden'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-6xl font-bold text-gradient"
              >
                {showBalance ? formatAmount(balance) : '••••••••'}
              </motion.div>
            </div>

            {/* Bottom Section */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-silver/50 text-xs mb-1">Número de Cuenta</p>
                <p className="text-white font-mono text-lg tracking-wider">{cardNumber}</p>
              </div>

              <div className="text-right">
                <p className="text-silver/50 text-xs mb-1">Titular</p>
                <p className="text-white font-semibold text-sm tracking-wide">{cardHolder}</p>
              </div>
            </div>
          </div>

          {/* Holographic Effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(212, 175, 55, 0.1), transparent 50%)',
            }}
          />
        </motion.div>
      </div>

      {/* Card Shadow */}
      <div className="absolute inset-0 -z-10 blur-3xl opacity-30">
        <div className="w-full h-full bg-gradient-to-br from-gold via-transparent to-silver" />
      </div>
    </motion.div>
  )
}
