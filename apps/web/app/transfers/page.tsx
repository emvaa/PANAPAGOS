'use client'

import { motion } from 'framer-motion'
import { ArrowLeftRight, Send } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function TransfersPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="glass-card p-12">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-6">
              <ArrowLeftRight className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gradient mb-4">Transferencias</h1>
            <p className="text-silver text-lg mb-8">
              Envía dinero a otros usuarios de PANAPAGOS de forma instantánea
            </p>
            <motion.button
              className="gold-gradient text-obsidian font-bold px-8 py-4 rounded-lg inline-flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-5 h-5" />
              Nueva Transferencia
            </motion.button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
