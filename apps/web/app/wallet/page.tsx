'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { MetalCard } from '@/components/wallet/MetalCard'
import { TransactionList } from '@/components/wallet/TransactionList'
import { QuickActions } from '@/components/wallet/QuickActions'
import { PrivacyMode } from '@/components/wallet/PrivacyMode'
import { CurrencyConverter } from '@/components/wallet/CurrencyConverter'
import { SmartSearch } from '@/components/wallet/SmartSearch'

export default function WalletPage() {
  const [balance, setBalance] = useState(2500000)
  const [showBalance, setShowBalance] = useState(true)
  const [privacyMode, setPrivacyMode] = useState(false)
  const [currency, setCurrency] = useState<'PYG' | 'USD'>('PYG')
  const [transactions, setTransactions] = useState<Array<{
    id: string
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
    description: string
    amount: number
    currency: string
    status: 'COMPLETED' | 'PENDING' | 'FAILED'
    createdAt: string
  }>>([
    {
      id: '1',
      type: 'INCOME',
      description: 'Pago recibido de Juan Pérez',
      amount: 150000,
      currency: 'PYG',
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'EXPENSE',
      description: 'Pago de factura ANDE',
      amount: -85000,
      currency: 'PYG',
      status: 'COMPLETED',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '3',
      type: 'TRANSFER',
      description: 'Transferencia a María González',
      amount: -200000,
      currency: 'PYG',
      status: 'COMPLETED',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ])
  const [filteredTransactions, setFilteredTransactions] = useState(transactions)

  return (
    <DashboardLayout>
      <PrivacyMode onToggle={setPrivacyMode}>
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-4xl font-bold text-gradient">Mi Billetera</h1>
              <p className="text-silver mt-1">Gestiona tu saldo PANAPAGOS</p>
            </div>
            <div className="flex items-center gap-4">
              <CurrencyConverter
                currency={currency}
                onCurrencyChange={setCurrency}
              />
              <motion.button
                className="glass-card px-4 py-2 flex items-center gap-2 text-gold hover:bg-gold/10 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Metal Card */}
        <MetalCard
          balance={balance}
          showBalance={showBalance}
          onToggleBalance={() => setShowBalance(!showBalance)}
          cardNumber="**** **** **** 4567"
          cardHolder="JUAN PÉREZ"
          currency={currency}
        />

        {/* Quick Actions */}
        <QuickActions />

        {/* Smart Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <SmartSearch 
            transactions={transactions}
            onSearch={(results) => setFilteredTransactions(results as any)} 
          />
        </motion.div>

        {/* Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Movimientos</h2>
            <button className="text-gold hover:text-gold-light transition-colors text-sm">
              Ver todos
            </button>
          </div>

          <TransactionList transactions={filteredTransactions} />
        </motion.div>
      </div>
      </PrivacyMode>
    </DashboardLayout>
  )
}
