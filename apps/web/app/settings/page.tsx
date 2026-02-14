'use client'

import { motion } from 'framer-motion'
import { Settings, User, Shield, Bell, CreditCard } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function SettingsPage() {
  const sections = [
    { icon: User, title: 'Perfil', description: 'Información personal', color: 'from-blue-500 to-blue-600' },
    { icon: Shield, title: 'Seguridad', description: '2FA y contraseña', color: 'from-green-500 to-green-600' },
    { icon: Bell, title: 'Notificaciones', description: 'Alertas y avisos', color: 'from-yellow-500 to-yellow-600' },
    { icon: CreditCard, title: 'Métodos de Pago', description: 'Tarjetas y cuentas', color: 'from-purple-500 to-purple-600' },
  ]

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gradient mb-2">Configuración</h1>
          <p className="text-silver">Gestiona tu cuenta y preferencias</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, index) => (
            <motion.button
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card glass-card-hover p-6 text-left group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center group-hover:shadow-gold-glow transition-all`}>
                  <section.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{section.title}</h3>
                  <p className="text-sm text-silver">{section.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
