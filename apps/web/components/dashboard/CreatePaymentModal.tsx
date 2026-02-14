'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, DollarSign } from 'lucide-react'

interface CreatePaymentModalProps {
  onClose: () => void
  onSubmit: (data: any) => void
}

export function CreatePaymentModal({ onClose, onSubmit }: CreatePaymentModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'PYG',
    description: '',
    expirationHours: '24',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Obtener merchantId dinámicamente desde el backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const merchantRes = await fetch(`${apiUrl}/v1/checkout/merchant`)
      
      if (!merchantRes.ok) {
        throw new Error('Error al obtener merchant')
      }
      
      const merchant = await merchantRes.json()
      
      onSubmit({
        merchantId: merchant.id,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        description: formData.description,
        expirationSeconds: parseInt(formData.expirationHours) * 3600,
      })
    } catch (error) {
      console.error('Error en handleSubmit:', error)
      alert('Error al crear el pago. Por favor intenta de nuevo.')
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-obsidian/90 backdrop-blur-xl flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass-card p-8 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gradient">Crear Cobro</h2>
            <button
              onClick={onClose}
              className="text-silver hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div>
              <label className="text-sm text-silver mb-2 block">Monto</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold" />
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="150000"
                  required
                  min="1"
                  step="1"
                  className="w-full bg-obsidian-light border border-gold/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-silver/50 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                />
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="text-sm text-silver mb-2 block">Moneda</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full bg-obsidian-light border border-gold/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
              >
                <option value="PYG">Guaraníes (PYG)</option>
                <option value="USD">Dólares (USD)</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm text-silver mb-2 block">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ej: Pago de producto premium"
                required
                rows={3}
                maxLength={200}
                className="w-full bg-obsidian-light border border-gold/20 rounded-lg px-4 py-3 text-white placeholder-silver/50 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all resize-none"
              />
              <p className="text-xs text-silver/70 mt-1">
                {formData.description.length}/200 caracteres
              </p>
            </div>

            {/* Expiration */}
            <div>
              <label className="text-sm text-silver mb-2 block">Válido por</label>
              <select
                value={formData.expirationHours}
                onChange={(e) => setFormData({ ...formData, expirationHours: e.target.value })}
                className="w-full bg-obsidian-light border border-gold/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
              >
                <option value="1">1 hora</option>
                <option value="6">6 horas</option>
                <option value="24">24 horas</option>
                <option value="72">3 días</option>
                <option value="168">7 días</option>
              </select>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="w-full gold-gradient text-obsidian font-bold py-4 rounded-lg relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">Generar Link y QR</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              />
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
