'use client'

import { motion } from 'framer-motion'
import { Shield, Zap, Globe, Lock } from 'lucide-react'
import { GlowCursor } from '@/components/ui/GlowCursor'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <GlowCursor />
      
      <div className="max-w-7xl mx-auto px-4 py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <motion.h1
            className="text-7xl md:text-9xl font-bold text-gradient mb-6"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            PANAPAGOS
          </motion.h1>
          <p className="text-2xl text-silver max-w-3xl mx-auto">
            La infraestructura de pagos definitiva para Paraguay. Seguridad bancaria de alto nivel con diseño de ultra-lujo.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {[
            {
              icon: Shield,
              title: 'PCI-DSS Compliant',
              description: 'Seguridad bancaria certificada',
            },
            {
              icon: Zap,
              title: 'Procesamiento Instantáneo',
              description: 'Transacciones en tiempo real',
            },
            {
              icon: Globe,
              title: 'Integración Bancard',
              description: 'vPOS 2.0 Paraguay',
            },
            {
              icon: Lock,
              title: 'Encriptación AES-256',
              description: 'Máxima protección de datos',
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card glass-card-hover p-6"
            >
              <feature.icon className="w-12 h-12 text-gold mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-silver text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-gold via-transparent to-silver"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-gradient mb-4">
              Comienza a Aceptar Pagos Hoy
            </h2>
            <p className="text-silver text-lg mb-8 max-w-2xl mx-auto">
              Únete a los comercios que confían en PANAPAGOS para procesar sus transacciones de forma segura y elegante.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/dashboard"
                className="gold-gradient text-obsidian font-bold px-12 py-4 rounded-lg text-lg relative overflow-hidden inline-block"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Panel de Cobros</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                />
              </motion.a>
              <motion.a
                href="/wallet"
                className="bg-silver/10 border-2 border-silver/30 text-silver font-bold px-12 py-4 rounded-lg text-lg hover:bg-silver/20 transition-all inline-block"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Mi Billetera
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
