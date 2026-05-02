'use client'

import { useEffect, useState } from 'react'

export default function AnalysisSkeleton() {
  const [longWait, setLongWait] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setLongWait(true), 30000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div>
      {/* Status bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 18px', marginBottom: 20,
        background: 'rgba(99,102,241,0.06)',
        border: '1px solid rgba(99,102,241,0.18)',
        borderRadius: 12,
      }}>
        <span className="pulse-ring" style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
        <span style={{ color: '#a0a0b0', fontSize: 14 }}>
          {longWait ? 'Still analyzing — refining your numbers...' : 'AI is analyzing your situation...'}
        </span>
        <span style={{ color: '#555', fontSize: 12, marginLeft: 'auto', whiteSpace: 'nowrap' }}>
          Usually 15–30 seconds
        </span>
      </div>

      {/* Skeleton SummaryCard */}
      <div className="ai-shimmer" style={{ height: 110, marginBottom: 24 }} />

      {/* Skeleton MetricsRow — 3 cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="ai-shimmer" style={{ height: 96 }} />
        ))}
      </div>

      {/* Skeleton chart */}
      <div className="ai-shimmer" style={{ height: 280, marginBottom: 24 }} />

      {/* Skeleton recommendation cards */}
      {[0, 1].map(i => (
        <div key={i} className="ai-shimmer" style={{ height: 140, marginBottom: 14 }} />
      ))}
    </div>
  )
}
