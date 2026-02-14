'use client'

import { motion } from 'framer-motion'
import { Receipt, Zap, Droplet, Phone } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function BillsPage() {
  const providers = [
    { name: 'ANDE', icon: Zap, color: 'from-yellow-500 to-yellow-600', type: 'Electricidad' },
    { name: 'ESSAP', icon: Droplet, color: 'from-blue-500 to-blue-600', type: 'Agua' },
    { name: 'Tigo', icon: Phone, color: 'from-purple-500 to-purple-600', type: 'Telefonía' },
    { name: 'Personal', icon: Phone, color: 'from-cyan-500 to-cyan-600', type: 'Telefonía' },
  ]

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gradient mb-2">Pagar Servicios</h1>
          <p className="text-silver">Paga tus facturas con tu saldo PANAPAGOS</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {providers.map((provider, index) => (
            <motion.button
              key={provider.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card glass-card-hover p-8 text-center group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${provider.color} flex items-center justify-center mx-auto mb-4 group-hover:shadow-gold-glow transition-all`}>
                <provider.icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{provider.name}</h3>
              <p className="text-sm text-silver">{provider.type}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
