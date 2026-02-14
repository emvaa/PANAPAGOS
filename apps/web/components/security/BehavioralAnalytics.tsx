'use client'

import { useEffect, useRef } from 'react'

interface BehaviorData {
  mouseMovements: number
  keystrokes: number
  timeOnPage: number
  formFillSpeed: number
  clickPattern: number[]
  riskScore: number
}

interface BehavioralAnalyticsProps {
  onDataCollected: (data: BehaviorData) => void
}

export function BehavioralAnalytics({ onDataCollected }: BehavioralAnalyticsProps) {
  const behaviorData = useRef<BehaviorData>({
    mouseMovements: 0,
    keystrokes: 0,
    timeOnPage: 0,
    formFillSpeed: 0,
    clickPattern: [],
    riskScore: 0,
  })

  const startTime = useRef(Date.now())
  const lastKeystroke = useRef(0)
  const keystrokeTimes = useRef<number[]>([])

  useEffect(() => {
    // Track mouse movements
    const handleMouseMove = () => {
      behaviorData.current.mouseMovements++
    }

    // Track keystrokes
    const handleKeyDown = () => {
      const now = Date.now()
      behaviorData.current.keystrokes++

      if (lastKeystroke.current > 0) {
        const timeDiff = now - lastKeystroke.current
        keystrokeTimes.current.push(timeDiff)

        // Calculate average typing speed
        if (keystrokeTimes.current.length > 5) {
          const avg =
            keystrokeTimes.current.reduce((a, b) => a + b, 0) / keystrokeTimes.current.length
          behaviorData.current.formFillSpeed = avg
        }
      }

      lastKeystroke.current = now
    }

    // Track clicks
    const handleClick = () => {
      const timeOnPage = Date.now() - startTime.current
      behaviorData.current.clickPattern.push(timeOnPage)
    }

    // Update time on page and calculate risk score
    const interval = setInterval(() => {
      behaviorData.current.timeOnPage = Date.now() - startTime.current
      
      // Calculate risk score
      const data = behaviorData.current
      let botScore = 0

      if (data.mouseMovements < 10) botScore += 30
      if (data.keystrokes > 0 && data.formFillSpeed < 50) botScore += 25
      if (data.timeOnPage < 5000) botScore += 20
      if (data.clickPattern.length > 2) {
        const intervals = []
        for (let i = 1; i < data.clickPattern.length; i++) {
          intervals.push(data.clickPattern[i] - data.clickPattern[i - 1])
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
        const variance =
          intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length
        if (variance < 100) botScore += 25
      }

      behaviorData.current.riskScore = botScore
      onDataCollected(behaviorData.current)
    }, 2000)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('click', handleClick)
      clearInterval(interval)
    }
  }, [onDataCollected])

  return null
}
