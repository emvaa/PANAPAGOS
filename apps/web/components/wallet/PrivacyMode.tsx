'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EyeOff, Eye } from 'lucide-react'

interface PrivacyModeProps {
  children: React.ReactNode
  onToggle?: (enabled: boolean) => void
}

export function PrivacyMode({ children, onToggle }: PrivacyModeProps) {
  const [privacyEnabled, setPrivacyEnabled] = useState(false)
  const [shakeDetected, setShakeDetected] = useState(false)

  useEffect(() => {
    let lastX = 0
    let lastY = 0
    let lastZ = 0
    let shakeCount = 0
    let shakeTimeout: NodeJS.Timeout

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity
      if (!acceleration || !acceleration.x || !acceleration.y || !acceleration.z) return

      const { x, y, z } = acceleration

      // Calculate shake intensity
      const deltaX = Math.abs(x - lastX)
      const deltaY = Math.abs(y - lastY)
      const deltaZ = Math.abs(z - lastZ)

      const shakeIntensity = deltaX + deltaY + deltaZ

      // Detect shake (threshold: 30)
      if (shakeIntensity > 30) {
        shakeCount++

        clearTimeout(shakeTimeout)
        shakeTimeout = setTimeout(() => {
          shakeCount = 0
        }, 500)

        // Toggle privacy mode after 2 shakes
        if (shakeCount >= 2) {
          togglePrivacy()
          shakeCount = 0
        }
      }

      lastX = x
      lastY = y
      lastZ = z
    }

    // Request permission for iOS 13+
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission().then((response: string) => {
        if (response === 'granted') {
          window.addEventListener('devicemotion', handleDeviceMotion)
        }
      })
    } else {
      window.addEventListener('devicemotion', handleDeviceMotion)
    }

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion)
      clearTimeout(shakeTimeout)
    }
  }, [])

  const togglePrivacy = () => {
    setPrivacyEnabled((prev) => {
      const newValue = !prev
      onToggle?.(newValue)
      setShakeDetected(true)
      setTimeout(() => setShakeDetected(false), 1000)
      return newValue
    })
  }

  return (
    <div className="relative">
      {/* Privacy Toggle Button */}
      <motion.button
        onClick={togglePrivacy}
        className="fixed bottom-6 right-6 z-50 glass-card p-4 rounded-full shadow-gold-glow"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={shakeDetected ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
      >
        {privacyEnabled ? (
          <EyeOff className="w-6 h-6 text-gold" />
        ) : (
          <Eye className="w-6 h-6 text-gold" />
        )}
      </motion.button>

      {/* Content with Privacy Blur */}
      <AnimatePresence mode="wait">
        {privacyEnabled ? (
          <motion.div
            key="blurred"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            <div className="blur-xl select-none pointer-events-none">{children}</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-card p-8 text-center"
              >
                <EyeOff className="w-16 h-16 text-gold mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gradient mb-2">Modo Privacidad</h3>
                <p className="text-silver">
                  Toca el botón o agita tu dispositivo para ver el contenido
                </p>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="visible"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shake Hint */}
      <AnimatePresence>
        {shakeDetected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-24 right-6 glass-card px-4 py-2 rounded-lg"
          >
            <p className="text-sm text-gold">
              {privacyEnabled ? '🔒 Modo Privacidad Activado' : '👁️ Modo Normal'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
