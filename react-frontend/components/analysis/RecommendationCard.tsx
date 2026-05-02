'use client'

import { useState } from 'react'
import type { Recommendation } from './types'

const IMPACT_STYLE: Record<Recommendation['impact'], { bg: string; color: string; label: string }> = {
  high:   { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', label: 'HIGH IMPACT' },
  medium: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: 'MEDIUM IMPACT' },
  low:    { bg: 'rgba(99,102,241,0.12)', color: '#818cf8', label: 'LOW IMPACT' },
}
const EFFORT_STYLE: Record<Recommendation['effort'], { color: string; label: string; icon: string }> = {
  low:    { color: '#22c55e', label: 'LOW EFFORT', icon: '⚡' },
  medium: { color: '#f59e0b', label: 'MEDIUM EFFORT', icon: '🛠' },
  high:   { color: '#ef4444', label: 'HIGH EFFORT', icon: '⚙️' },
}
const RISK_COLOR: Record<NonNullable<Recommendation['risk_level']>, string> = {
  low: '#22c55e', medium: '#f59e0b', high: '#ef4444',
}

export default function RecommendationCard({ data, onStartWizard }: { data: Recommendation; onStartWizard?: () => void }) {
  const [showSteps, setShowSteps] = useState(false)
  const [showTechnical, setShowTechnical] = useState(false)
  const impact = IMPACT_STYLE[data.impact] ?? IMPACT_STYLE.medium
  const effort = EFFORT_STYLE[data.effort] ?? EFFORT_STYLE.medium

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14, padding: '22px 24px', marginBottom: 14,
      transition: 'border-color 0.15s',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.25)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 24, lineHeight: 1 }}>{data.icon || '💡'}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'white', margin: '0 0 8px', lineHeight: 1.3 }}>{data.title}</h3>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 5, background: impact.bg, color: impact.color, letterSpacing: 0.8 }}>
                {impact.label}
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 5, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: effort.color, letterSpacing: 0.8 }}>
                {effort.icon} {effort.label}
              </span>
              {data.risk_level && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 5, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: RISK_COLOR[data.risk_level], letterSpacing: 0.8 }}>
                  {data.risk_level.toUpperCase()} RISK
                </span>
              )}
              {data.implementation_time && (
                <span style={{ fontSize: 10, color: '#666', padding: '3px 8px' }}>⏱ {data.implementation_time}</span>
              )}
            </div>
          </div>
        </div>
        {data.savings_text && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#22c55e', lineHeight: 1 }}>{data.savings_text}</div>
            <div style={{ fontSize: 10, color: '#666', marginTop: 2, letterSpacing: 0.5 }}>POTENTIAL SAVINGS</div>
          </div>
        )}
      </div>

      {/* Plain English (default visible) */}
      {data.plain_english && (
        <div style={{
          background: 'rgba(99,102,241,0.05)',
          border: '1px solid rgba(99,102,241,0.15)',
          borderRadius: 10, padding: '12px 14px', marginBottom: 12,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#818cf8', letterSpacing: 1, marginBottom: 6 }}>IN PLAIN ENGLISH</div>
          <p style={{ fontSize: 14, color: '#d0d0e0', lineHeight: 1.6, margin: 0 }}>{data.plain_english}</p>
        </div>
      )}

      {/* Toggles */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: showSteps || showTechnical ? 12 : 0 }}>
        {data.explanation && (
          <button onClick={() => setShowTechnical(v => !v)} style={btnStyle(showTechnical)}>
            {showTechnical ? 'Hide' : 'Show'} technical details
          </button>
        )}
        {data.steps?.length ? (
          <button onClick={() => setShowSteps(v => !v)} style={btnStyle(showSteps)}>
            {showSteps ? 'Hide' : 'Show'} steps ({data.steps.length})
          </button>
        ) : null}
        {onStartWizard && (
          <button onClick={onStartWizard} style={{ ...btnStyle(false), background: '#6366f1', color: 'white', borderColor: '#6366f1' }}>
            🪄 Start Implementation
          </button>
        )}
      </div>

      {showTechnical && data.explanation && (
        <p style={{ fontSize: 13, color: '#a0a0b0', lineHeight: 1.7, margin: '0 0 12px', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
          {data.explanation}
        </p>
      )}

      {showSteps && data.steps && (
        <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
          {data.steps.map((step, i) => (
            <li key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#6366f1', background: 'rgba(99,102,241,0.12)', borderRadius: 5, padding: '2px 7px', flexShrink: 0, height: 'fit-content', marginTop: 2 }}>
                {i + 1}
              </span>
              <span style={{ fontSize: 13, color: '#d0d0e0', lineHeight: 1.6 }}>{step}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function btnStyle(active: boolean): React.CSSProperties {
  return {
    fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
    background: active ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
    border: `1px solid ${active ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
    color: active ? '#818cf8' : '#a0a0b0',
    transition: 'all 0.15s',
  }
}
