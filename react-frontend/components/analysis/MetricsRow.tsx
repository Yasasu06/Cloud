'use client'

import { useEffect, useState } from 'react'
import type { KeyMetric } from './types'

const TREND_ICONS: Record<NonNullable<KeyMetric['trend']>, { icon: string; color: string }> = {
  positive:   { icon: '↗', color: '#22c55e' },
  concerning: { icon: '↘', color: '#ef4444' },
  stable:     { icon: '→', color: '#a0a0b0' },
}

function useReveal(delay: number) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return visible
}

function MetricCard({ metric, index }: { metric: KeyMetric; index: number }) {
  const visible = useReveal(index * 100)
  const trend = metric.trend ? TREND_ICONS[metric.trend] : null
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14, padding: '20px 24px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}
    >
      <div style={{ fontSize: 11, color: '#666', fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>
        {metric.label.toUpperCase()}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: 'white', lineHeight: 1 }}>
          {metric.value}
        </div>
        {trend && (
          <span style={{ fontSize: 18, color: trend.color, fontWeight: 700 }}>{trend.icon}</span>
        )}
      </div>
    </div>
  )
}

export default function MetricsRow({ data }: { data: KeyMetric[] }) {
  if (!data?.length) return null
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`,
      gap: 14, marginBottom: 24,
    }}>
      {data.map((m, i) => <MetricCard key={i} metric={m} index={i} />)}
    </div>
  )
}
