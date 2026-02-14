'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { QrCode } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DynamicQRGenerator } from '@/components/qr/DynamicQRGenerator'

export default function QRCollectPage() {
  const [showGenerator, setShowGenerator] = useState(false)

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gradient">Cobrar con QR</h1>
          <p className="text-silver mt-2">
            Genera códigos QR estáticos o dinámicos compatibles con EMVCo
          </p>
        </motion.div>

        {!showGenerator ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="glass-card p-12">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center mx-auto mb-6">
                <QrCode className="w-10 h-10 text-obsidian" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Genera tu código QR de cobro
              </h2>
              <p className="text-silver text-lg mb-8">
                Crea QRs estáticos para montos fijos o dinámicos para cobros variables
              </p>
              <motion.button
                onClick={() => setShowGenerator(true)}
                className="gold-gradient text-obsidian font-bold px-8 py-4 rounded-lg inline-flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <QrCode className="w-5 h-5" />
                Comenzar
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <DynamicQRGenerator merchantId="cmll2557e0000deqnuasrxhvj" />
        )}
      </div>
    </DashboardLayout>
  )
}
