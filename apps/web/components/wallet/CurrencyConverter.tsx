'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'

interface CurrencyConverterProps {
  currency: 'PYG' | 'USD'
  onCurrencyChange: (currency: 'PYG' | 'USD') => void
}

export function CurrencyConverter({ currency, onCurrencyChange }: CurrencyConverterProps) {
  const [exchangeRate, setExchangeRate] = useState(7200) // PYG per USD
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    fetchExchangeRate()
    // Update every 5 minutes
    const interval = setInterval(fetchExchangeRate, 300000)
    return () => clearInterval(interval)
  }, [])

  const fetchExchangeRate = async () => {
    setLoading(true)
    try {
      // Mock API call - In production, integrate with BCP or local exchange APIs
      // const response = await fetch('https://api.exchangerate.com/v4/latest/USD')
      // const data = await response.json()
      // setExchangeRate(data.rates.PYG)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      // Mock rate with small variation
      const variation = (Math.random() - 0.5) * 100
      setExchangeRate(7200 + variation)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching exchange rate:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCurrency = () => {
    const newCurrency = currency === 'PYG' ? 'USD' : 'PYG'
    onCurrencyChange(newCurrency)
  }

  return (
    <div className="glass-card p-3 rounded-lg flex items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-silver">Moneda:</span>
        <motion.button
          onClick={toggleCurrency}
          className="px-3 py-1.5 rounded-lg bg-gold/10 text-gold font-semibold text-sm hover:bg-gold/20 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {currency}
        </motion.button>
      </div>

      {currency === 'USD' && (
        <div className="text-xs text-silver border-l border-gold/20 pl-3">
          1 USD = Gs. {exchangeRate.toLocaleString('es-PY', { maximumFractionDigits: 0 })}
        </div>
      )}

      <motion.button
        onClick={fetchExchangeRate}
        disabled={loading}
        className="ml-auto p-2 rounded-lg hover:bg-white/5 transition-all disabled:opacity-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={loading ? { rotate: 360 } : {}}
        transition={loading ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
      >
        <RefreshCw className="w-4 h-4 text-silver" />
      </motion.button>
    </div>
  )
}
