'use client'

import { motion } from 'framer-motion'
import { Send, Receipt, ArrowDownToLine, QrCode } from 'lucide-react'

export function QuickActions() {
  const actions = [
    {
      icon: Send,
      label: 'Transferir',
      color: 'from-blue-500 to-blue-600',
      action: () => console.log('Transfer'),
    },
    {
      icon: Receipt,
      label: 'Pagar Servicios',
      color: 'from-purple-500 to-purple-600',
      action: () => console.log('Pay bills'),
    },
    {
      icon: ArrowDownToLine,
      label: 'Recargar',
      color: 'from-green-500 to-green-600',
      action: () => console.log('Top up'),
    },
    {
      icon: QrCode,
      label: 'Cobrar QR',
      color: () => console.log('QR'),
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-8"
    >
      <h2 className="text-xl font-bold text-white mb-4">Acciones Rápidas</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            onClick={action.action}
            className="glass-card glass-card-hover p-6 flex flex-col items-center gap-3 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:shadow-gold-glow transition-all`}>
              <action.icon className="w-7 h-7 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
