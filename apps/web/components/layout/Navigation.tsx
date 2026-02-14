'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Wallet,
  LayoutDashboard,
  QrCode,
  Receipt,
  ArrowLeftRight,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
} from 'lucide-react'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const menuItems = [
    {
      icon: Wallet,
      label: 'Mi Billetera',
      href: '/wallet',
      description: 'Saldo y movimientos',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: LayoutDashboard,
      label: 'Panel de Cobros',
      href: '/dashboard',
      description: 'Links y QR de pago',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: ArrowLeftRight,
      label: 'Transferencias',
      href: '/transfers',
      description: 'Enviar y recibir',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Receipt,
      label: 'Pagar Servicios',
      href: '/bills',
      description: 'ANDE, ESSAP, Telefonía',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: QrCode,
      label: 'Cobrar con QR',
      href: '/qr-collect',
      description: 'Genera QR para cobrar',
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: Settings,
      label: 'Configuración',
      href: '/settings',
      description: 'Perfil y seguridad',
      color: 'from-gray-500 to-gray-600',
    },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 right-6 z-50 glass-card p-3 md:hidden"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6 text-gold" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <Menu className="w-6 h-6 text-gold" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="hidden md:flex fixed left-0 top-0 h-screen w-80 glass-card border-r border-gold/20 flex-col z-40"
      >
        {/* Logo */}
        <div className="p-6 border-b border-gold/20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center group-hover:shadow-gold-glow transition-all">
              <Sparkles className="w-7 h-7 text-obsidian" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">PANAPAGOS</h1>
              <p className="text-xs text-silver">Fintech Premium</p>
            </div>
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  className={`group relative block p-4 rounded-xl transition-all ${
                    isActive(item.href)
                      ? 'bg-gold/10 border border-gold/30'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {/* Active Indicator */}
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gold/5 rounded-xl border border-gold/30"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}

                  <div className="relative flex items-center gap-4">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center group-hover:shadow-gold-glow transition-all`}
                    >
                      <item.icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Text */}
                    <div className="flex-1">
                      <h3
                        className={`font-semibold ${
                          isActive(item.href) ? 'text-gold' : 'text-white'
                        } group-hover:text-gold transition-colors`}
                      >
                        {item.label}
                      </h3>
                      <p className="text-xs text-silver">{item.description}</p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight
                      className={`w-5 h-5 transition-all ${
                        isActive(item.href)
                          ? 'text-gold opacity-100'
                          : 'text-silver opacity-0 group-hover:opacity-100'
                      }`}
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gold/20">
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                <span className="text-obsidian font-bold">JP</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Juan Pérez</p>
                <p className="text-xs text-silver">demo@oropay.com</p>
              </div>
            </div>
            <motion.button
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-semibold">Cerrar Sesión</span>
            </motion.button>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-obsidian/90 backdrop-blur-xl z-40 md:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 h-screen w-full max-w-sm glass-card border-l border-gold/20 z-40 md:hidden overflow-y-auto"
            >
              {/* Logo */}
              <div className="p-6 border-b border-gold/20">
                <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-obsidian" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">PANAPAGOS</h1>
                    <p className="text-xs text-silver">Fintech Premium</p>
                  </div>
                </Link>
              </div>

              {/* Menu Items */}
              <nav className="p-4">
                <div className="space-y-2">
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`block p-4 rounded-xl transition-all ${
                          isActive(item.href)
                            ? 'bg-gold/10 border border-gold/30'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}
                          >
                            <item.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3
                              className={`font-semibold ${
                                isActive(item.href) ? 'text-gold' : 'text-white'
                              }`}
                            >
                              {item.label}
                            </h3>
                            <p className="text-xs text-silver">{item.description}</p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </nav>

              {/* User Section */}
              <div className="p-4 border-t border-gold/20">
                <div className="glass-card p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                      <span className="text-obsidian font-bold">JP</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">Juan Pérez</p>
                      <p className="text-xs text-silver">demo@oropay.com</p>
                    </div>
                  </div>
                  <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 text-red-400">
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-semibold">Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
