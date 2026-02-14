'use client'

import { ReactNode } from 'react'
import { Navigation } from './Navigation'
import { GlowCursor } from '../ui/GlowCursor'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-obsidian">
      <GlowCursor />
      <Navigation />
      
      {/* Main Content */}
      <main className="md:ml-80 min-h-screen">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
