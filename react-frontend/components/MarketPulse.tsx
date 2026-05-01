'use client'

import { useEffect, useState, useRef } from 'react'
import { MARKET_METRICS } from '@/lib/data'

function useCountUp(target: number, duration = 2000, shouldStart: boolean) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!shouldStart) return
    const startTime = performance.now()
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, shouldStart])

  return count
}

interface MetricCardProps {
  label: string
  value: number
  suffix: string
  prefix?: string
  description: string
  color: string
  shouldAnimate: boolean
}

function MetricCard({ label, value, suffix, prefix, description, color, shouldAnimate }: MetricCardProps) {
  const count = useCountUp(value, 2000, shouldAnimate)

  return (
    <div
      className="flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-300 hover:scale-105"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: `0 0 30px ${color}18`,
      }}
    >
      <div
        className="text-4xl font-black mb-2 tabular-nums"
        style={{ color }}
      >
        {prefix}{count}{suffix}
      </div>
      <div className="text-sm font-semibold text-white mb-1">{label}</div>
      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </div>
    </div>
  )
}

export default function MarketPulse() {
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [hasAnimated])

  return (
    <section
      ref={ref}
      className="py-16 px-4"
      style={{ background: 'var(--bg-secondary)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
            Market Pulse
          </p>
          <h2 className="text-2xl font-bold text-white">The numbers that define the cloud era</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {MARKET_METRICS.map((metric) => (
            <MetricCard
              key={metric.label}
              {...metric}
              shouldAnimate={hasAnimated}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
