'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Lock, User, Calendar } from 'lucide-react'
import { BehavioralAnalytics } from '@/components/security/BehavioralAnalytics'

interface CardFormProps {
  onSubmit: (data: CardFormData) => Promise<void>
  isProcessing: boolean
}

export interface CardFormData {
  cardNumber: string
  cardHolder: string
  expiryDate: string
  cvv: string
  documentType: 'RUC' | 'CI'
  documentNumber: string
  behavioralData?: any
}

export function CardForm({ onSubmit, isProcessing }: CardFormProps) {
  const [formData, setFormData] = useState<CardFormData>({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    documentType: 'CI',
    documentNumber: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof CardFormData, string>>>({})
  const [behavioralData, setBehavioralData] = useState<any>(null)
  // Luhn Algorithm para validación de tarjeta
  const validateCardNumber = (number: string): boolean => {
    const digits = number.replace(/\s/g, '')
    if (!/^\d{13,19}$/.test(digits)) return false

    let sum = 0
    let isEven = false

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i])

      if (isEven) {
        digit *= 2
        if (digit > 9) digit -= 9
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  }

  const formatCardNumber = (value: string): string => {
    const digits = value.replace(/\s/g, '')
    const groups = digits.match(/.{1,4}/g)
    return groups ? groups.join(' ') : digits
  }

  const formatExpiryDate = (value: string): string => {
    const digits = value.replace(/\D/g, '')
    if (digits.length >= 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`
    }
    return digits
  }

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value.replace(/\s/g, ''))
    if (formatted.replace(/\s/g, '').length <= 19) {
      setFormData({ ...formData, cardNumber: formatted })
      if (errors.cardNumber) {
        setErrors({ ...errors, cardNumber: undefined })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Partial<Record<keyof CardFormData, string>> = {}

    if (!validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = 'Número de tarjeta inválido'
    }

    if (!formData.cardHolder.trim()) {
      newErrors.cardHolder = 'Nombre requerido'
    }

    if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Formato inválido (MM/AA)'
    }

    if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'CVV inválido'
    }

    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = 'Documento requerido'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // 🔒 Include behavioral analytics data
    await onSubmit({
      ...formData,
      behavioralData,
    })
  }

  return (
    <>
      <BehavioralAnalytics onDataCollected={setBehavioralData} />
      
      <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      onSubmit={handleSubmit}
      className="glass-card p-8 space-y-6"
    >
      {/* Card Number */}
      <div className="space-y-2">
        <label className="text-sm text-silver flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Número de Tarjeta
        </label>
        <input
          type="text"
          value={formData.cardNumber}
          onChange={(e) => handleCardNumberChange(e.target.value)}
          placeholder="1234 5678 9012 3456"
          className="w-full bg-obsidian-light border border-gold/20 rounded-lg px-4 py-3 text-white placeholder-silver/50 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
          disabled={isProcessing}
        />
        {errors.cardNumber && (
          <p className="text-xs text-red-400">{errors.cardNumber}</p>
        )}
      </div>

      {/* Card Holder */}
      <div className="space-y-2">
        <label className="text-sm text-silver flex items-center gap-2">
          <User className="w-4 h-4" />
          Titular de la Tarjeta
        </label>
        <input
          type="text"
          value={formData.cardHolder}
          onChange={(e) => setFormData({ ...formData, cardHolder: e.target.value.toUpperCase() })}
          placeholder="NOMBRE APELLIDO"
          className="w-full bg-obsidian-light border border-gold/20 rounded-lg px-4 py-3 text-white placeholder-silver/50 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all uppercase"
          disabled={isProcessing}
        />
        {errors.cardHolder && (
          <p className="text-xs text-red-400">{errors.cardHolder}</p>
        )}
      </div>

      {/* Expiry & CVV */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-silver flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Vencimiento
          </label>
          <input
            type="text"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: formatExpiryDate(e.target.value) })}
            placeholder="MM/AA"
            maxLength={5}
            className="w-full bg-obsidian-light border border-gold/20 rounded-lg px-4 py-3 text-white placeholder-silver/50 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
            disabled={isProcessing}
          />
          {errors.expiryDate && (
            <p className="text-xs text-red-400">{errors.expiryDate}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm text-silver flex items-center gap-2">
            <Lock className="w-4 h-4" />
            CVV
          </label>
          <input
            type="text"
            value={formData.cvv}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '')
              if (value.length <= 4) {
                setFormData({ ...formData, cvv: value })
              }
            }}
            placeholder="123"
            maxLength={4}
            className="w-full bg-obsidian-light border border-gold/20 rounded-lg px-4 py-3 text-white placeholder-silver/50 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
            disabled={isProcessing}
          />
          {errors.cvv && (
            <p className="text-xs text-red-400">{errors.cvv}</p>
          )}
        </div>
      </div>

      {/* Document (Paraguay specific) */}
      <div className="space-y-2">
        <label className="text-sm text-silver">Documento de Identidad</label>
        <div className="grid grid-cols-3 gap-4">
          <select
            value={formData.documentType}
            onChange={(e) => setFormData({ ...formData, documentType: e.target.value as 'RUC' | 'CI' })}
            className="bg-obsidian-light border border-gold/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
            disabled={isProcessing}
          >
            <option value="CI">Cédula</option>
            <option value="RUC">RUC</option>
          </select>
          <input
            type="text"
            value={formData.documentNumber}
            onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value.replace(/\D/g, '') })}
            placeholder="1234567"
            className="col-span-2 bg-obsidian-light border border-gold/20 rounded-lg px-4 py-3 text-white placeholder-silver/50 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
            disabled={isProcessing}
          />
        </div>
        {errors.documentNumber && (
          <p className="text-xs text-red-400">{errors.documentNumber}</p>
        )}
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isProcessing}
        className="w-full gold-gradient text-obsidian font-bold py-4 rounded-lg relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: isProcessing ? 1 : 1.02 }}
        whileTap={{ scale: isProcessing ? 1 : 0.98 }}
      >
        <span className="relative z-10">
          {isProcessing ? 'Procesando...' : 'Pagar Ahora'}
        </span>
        {!isProcessing && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          />
        )}
      </motion.button>

      <p className="text-xs text-center text-silver/70">
        Tus datos están protegidos con encriptación AES-256
      </p>
    </motion.form>
    </>
  )
}
