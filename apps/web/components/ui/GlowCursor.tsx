'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export function GlowCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', updateMousePosition)
    return () => window.removeEventListener('mousemove', updateMousePosition)
  }, [])

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-50"
      animate={{
        background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(212, 175, 55, 0.15), transparent 80%)`,
      }}
      transition={{ type: 'tween', ease: 'linear', duration: 0 }}
    />
  )
}
