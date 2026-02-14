'use client'

import { motion } from 'framer-motion'

interface ShimmerLoaderProps {
  className?: string
  variant?: 'card' | 'text' | 'circle' | 'button'
}

export function ShimmerLoader({ className = '', variant = 'card' }: ShimmerLoaderProps) {
  const baseClasses = 'relative overflow-hidden bg-obsidian-light'

  const variantClasses = {
    card: 'h-32 rounded-xl',
    text: 'h-4 rounded',
    circle: 'w-12 h-12 rounded-full',
    button: 'h-12 rounded-lg',
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {/* Shimmer Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/20 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-4">
        <ShimmerLoader variant="circle" />
        <div className="flex-1 space-y-2">
          <ShimmerLoader variant="text" className="w-3/4" />
          <ShimmerLoader variant="text" className="w-1/2" />
        </div>
      </div>
      <ShimmerLoader variant="card" />
    </div>
  )
}

export function TransactionSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass-card p-4">
          <div className="flex items-center gap-4">
            <ShimmerLoader variant="circle" />
            <div className="flex-1 space-y-2">
              <ShimmerLoader variant="text" className="w-2/3" />
              <ShimmerLoader variant="text" className="w-1/3" />
            </div>
            <ShimmerLoader variant="text" className="w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}
