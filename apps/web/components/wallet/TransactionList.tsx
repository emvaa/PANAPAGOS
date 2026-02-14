'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, CheckCircle, Clock, XCircle } from 'lucide-react'

interface Transaction {
  id: string
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  description: string
  amount: number
  currency: string
  status: 'COMPLETED' | 'PENDING' | 'FAILED'
  createdAt: string
}

interface TransactionListProps {
  transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'INCOME':
        return <ArrowDownLeft className="w-5 h-5" />
      case 'EXPENSE':
        return <ArrowUpRight className="w-5 h-5" />
      case 'TRANSFER':
        return <ArrowLeftRight className="w-5 h-5" />
      default:
        return <ArrowLeftRight className="w-5 h-5" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-400" />
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return null
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INCOME':
        return 'text-green-400 bg-green-400/10'
      case 'EXPENSE':
        return 'text-red-400 bg-red-400/10'
      case 'TRANSFER':
        return 'text-blue-400 bg-blue-400/10'
      default:
        return 'text-silver bg-silver/10'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'INCOME':
        return 'Ingreso'
      case 'EXPENSE':
        return 'Gasto'
      case 'TRANSFER':
        return 'Transferencia'
      default:
        return type
    }
  }

  const formatAmount = (value: number, curr: string) => {
    // Ensure currency is valid
    const validCurrency = curr && (curr === 'PYG' || curr === 'USD') ? curr : 'PYG'
    
    const formatted = new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: validCurrency,
      minimumFractionDigits: 0,
    }).format(Math.abs(value))

    return value < 0 ? `- ${formatted}` : `+ ${formatted}`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-PY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction, index) => (
        <motion.div
          key={transaction.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="glass-card glass-card-hover p-4 relative overflow-hidden"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 opacity-5">
            <div
              className={`w-full h-full ${
                transaction.type === 'INCOME'
                  ? 'bg-gradient-to-r from-green-500'
                  : transaction.type === 'EXPENSE'
                  ? 'bg-gradient-to-r from-red-500'
                  : 'bg-gradient-to-r from-blue-500'
              } to-transparent`}
            />
          </div>

          <div className="relative z-10 flex items-center gap-4">
            {/* Icon */}
            <div className={`w-12 h-12 rounded-full ${getTypeColor(transaction.type)} flex items-center justify-center flex-shrink-0`}>
              {getIcon(transaction.type)}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-semibold truncate">{transaction.description}</h3>
                {getStatusIcon(transaction.status)}
              </div>
              <div className="flex items-center gap-3 text-xs text-silver">
                <span className={`px-2 py-0.5 rounded-full ${getTypeColor(transaction.type)}`}>
                  {getTypeLabel(transaction.type)}
                </span>
                <span>{formatDate(transaction.createdAt)}</span>
              </div>
            </div>

            {/* Amount */}
            <div className="text-right flex-shrink-0">
              <p
                className={`text-xl font-bold ${
                  transaction.amount < 0 ? 'text-red-400' : 'text-green-400'
                }`}
              >
                {formatAmount(transaction.amount, transaction.currency)}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
