'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, TrendingUp, Calendar, DollarSign } from 'lucide-react'

interface Transaction {
  id: string
  type: string
  description: string
  amount: number
  currency: string
  status: string
  createdAt: string
}

interface SmartSearchProps {
  transactions: Transaction[]
  onSearch: (results: Transaction[]) => void
}

export function SmartSearch({ transactions, onSearch }: SmartSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])

  const commonQueries = [
    'Lo que gasté hoy',
    'Transferencias de esta semana',
    'Pagos mayores a 100.000',
    'Ingresos del mes',
    'Gastos en ANDE',
  ]

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    const results = parseNaturalLanguage(searchQuery)
    onSearch(results)
  }

  const parseNaturalLanguage = (query: string): Transaction[] => {
    const lowerQuery = query.toLowerCase()
    let filtered = [...transactions]

    // Parse time expressions
    if (lowerQuery.includes('hoy')) {
      const today = new Date().toDateString()
      filtered = filtered.filter((t) => new Date(t.createdAt).toDateString() === today)
    } else if (lowerQuery.includes('ayer')) {
      const yesterday = new Date(Date.now() - 86400000).toDateString()
      filtered = filtered.filter((t) => new Date(t.createdAt).toDateString() === yesterday)
    } else if (lowerQuery.includes('semana')) {
      const weekAgo = Date.now() - 7 * 86400000
      filtered = filtered.filter((t) => new Date(t.createdAt).getTime() > weekAgo)
    } else if (lowerQuery.includes('mes')) {
      const monthAgo = Date.now() - 30 * 86400000
      filtered = filtered.filter((t) => new Date(t.createdAt).getTime() > monthAgo)
    }

    // Parse transaction types
    if (lowerQuery.includes('gast') || lowerQuery.includes('pag')) {
      filtered = filtered.filter((t) => t.type === 'EXPENSE' || t.amount < 0)
    } else if (lowerQuery.includes('ingres') || lowerQuery.includes('recib')) {
      filtered = filtered.filter((t) => t.type === 'INCOME' || t.amount > 0)
    } else if (lowerQuery.includes('transfer')) {
      filtered = filtered.filter((t) => t.type === 'TRANSFER')
    }

    // Parse amounts
    const amountMatch = lowerQuery.match(/(\d+\.?\d*)\s*(mil|k)?/)
    if (amountMatch) {
      let amount = parseFloat(amountMatch[1])
      if (amountMatch[2]) {
        amount *= 1000
      }

      if (lowerQuery.includes('mayor') || lowerQuery.includes('más de')) {
        filtered = filtered.filter((t) => Math.abs(t.amount) > amount)
      } else if (lowerQuery.includes('menor') || lowerQuery.includes('menos de')) {
        filtered = filtered.filter((t) => Math.abs(t.amount) < amount)
      }
    }

    // Parse merchant/description
    const words = lowerQuery.split(' ')
    const merchantKeywords = words.filter(
      (w) => w.length > 3 && !['gasté', 'pagué', 'recibí', 'mayor', 'menor'].includes(w),
    )

    if (merchantKeywords.length > 0) {
      filtered = filtered.filter((t) =>
        merchantKeywords.some((keyword) => t.description.toLowerCase().includes(keyword)),
      )
    }

    return filtered
  }

  const handleInputChange = (value: string) => {
    setQuery(value)

    // Generate suggestions
    if (value.length > 2) {
      const matches = commonQueries.filter((q) => q.toLowerCase().includes(value.toLowerCase()))
      setSuggestions(matches)
    } else {
      setSuggestions([])
    }
  }

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-silver" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Busca: 'Lo que gasté en Biggie ayer'"
          className="w-full bg-obsidian-light border border-gold/20 rounded-xl pl-12 pr-12 py-4 text-white placeholder-silver/50 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
        />
        {query && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => {
              setQuery('')
              onSearch(transactions)
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-all"
          >
            <X className="w-4 h-4 text-silver" />
          </motion.button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && (suggestions.length > 0 || query.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full glass-card rounded-xl p-2 z-50"
          >
            {query.length === 0 ? (
              <>
                <p className="text-xs text-silver px-3 py-2">Búsquedas comunes:</p>
                {commonQueries.map((suggestion) => (
                  <motion.button
                    key={suggestion}
                    onClick={() => {
                      handleSearch(suggestion)
                      setIsOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-white text-sm"
                    whileHover={{ x: 4 }}
                  >
                    <TrendingUp className="w-4 h-4 inline mr-2 text-gold" />
                    {suggestion}
                  </motion.button>
                ))}
              </>
            ) : (
              suggestions.map((suggestion) => (
                <motion.button
                  key={suggestion}
                  onClick={() => {
                    handleSearch(suggestion)
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-white text-sm"
                  whileHover={{ x: 4 }}
                >
                  {suggestion}
                </motion.button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  )
}
