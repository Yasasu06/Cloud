'use client'

import { useState } from 'react'

type Provider = 'aws' | 'azure' | 'google'

const PROGRAMS: Record<Provider, { name: string; color: string; emoji: string; range: string; duration: string }> = {
  aws:    { name: 'AWS Activate',              color: '#ff9900', emoji: '🟠', range: '$5K–$100K',   duration: '12–24 months' },
  azure:  { name: 'Microsoft for Startups',    color: '#00a2ed', emoji: '🔵', range: '$25K–$150K',  duration: 'up to 4 years' },
  google: { name: 'Google for Startups',       color: '#34a853', emoji: '🟢', range: '$2K–$200K',   duration: '12–24 months' },
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

function monthsBetween(a: Date, b: Date): number {
  return Math.max(0, (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth())
}

export default function CreditsTrackerPage() {
  const [provider, setProvider]         = useState<Provider>('aws')
  const [totalCredits, setTotalCredits] = useState('')
  const [usedCredits, setUsedCredits]   = useState('')
  const [monthlyBurn, setMonthlyBurn]   = useState('')
  const [startDate, setStartDate]       = useState('')
  const [durationMonths, setDuration]   = useState('12')

  const prog   = PROGRAMS[provider]
  const total  = parseFloat(totalCredits) || 0
  const used   = parseFloat(usedCredits) || 0
  const burn   = parseFloat(monthlyBurn) || 0
  const dur    = parseInt(durationMonths) || 12
  const remaining = Math.max(0, total - used)

  const today       = new Date()
  const start       = startDate ? new Date(startDate) : null
  const expiry      = start ? addMonths(start, dur) : null
  const daysToExpiry = expiry ? daysBetween(today, expiry) : null
  const moToExpiry   = expiry ? monthsBetween(today, expiry) : null

  const monthsOfRunway  = burn > 0 ? remaining / burn : null
  const projectedExhaust = (start && monthsOfRunway != null)
    ? addMonths(today, monthsOfRunway)
    : null

  const willLoseMoney = projectedExhaust && expiry && projectedExhaust > expiry && remaining > 0
  const lostAmount    = willLoseMoney && burn > 0 && moToExpiry != null
    ? Math.max(0, remaining - burn * moToExpiry)
    : 0

  // Timeline bar math (span = start → max(expiry, exhaust))
  const timelineStart = start || today
  const timelineEnd   = expiry
    ? new Date(Math.max(expiry.getTime(), projectedExhaust?.getTime() ?? 0, today.getTime() + 86400000 * 60))
    : new Date(today.getTime() + 86400000 * 365)
  const totalSpan = timelineEnd.getTime() - timelineStart.getTime()

  function pct(d: Date) {
    return Math.min(100, Math.max(0, ((d.getTime() - timelineStart.getTime()) / totalSpan) * 100))
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, fontWeight: 500,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'white', outline: 'none', boxSizing: 'border-box',
  }

  const pctUsed = total > 0 ? Math.min(100, (used / total) * 100) : 0

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>
            STARTUP CREDITS
          </div>
          <h1 style={{ fontSize: 'clamp(26px,5vw,40px)', fontWeight: 900, marginBottom: 12, lineHeight: 1.1 }}>
            Cloud Credits Tracker
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 15, maxWidth: 460, margin: '0 auto' }}>
            Track your AWS Activate, Azure, and Google startup credits before they expire.
          </p>
        </div>

        {/* Provider select */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {(Object.keys(PROGRAMS) as Provider[]).map(k => {
            const p = PROGRAMS[k]
            return (
              <button
                key={k}
                onClick={() => setProvider(k)}
                style={{
                  flex: 1, minWidth: 160, padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                  border: provider === k ? `1px solid ${p.color}50` : '1px solid rgba(255,255,255,0.08)',
                  background: provider === k ? `rgba(${hexToRgb(p.color)},0.08)` : 'rgba(255,255,255,0.02)',
                  color: provider === k ? p.color : '#a0a0b0', transition: 'all 0.15s', textAlign: 'left',
                }}
              >
                <div style={{ fontSize: 18, marginBottom: 4 }}>{p.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: 11, opacity: 0.6 }}>{p.range} · {p.duration}</div>
              </button>
            )
          })}
        </div>

        {/* Inputs */}
        <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, display: 'block', marginBottom: 6 }}>TOTAL CREDITS GRANTED ($)</label>
              <input type="number" min="0" value={totalCredits} onChange={e => setTotalCredits(e.target.value)} placeholder="e.g. 25000" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, display: 'block', marginBottom: 6 }}>CREDITS USED SO FAR ($)</label>
              <input type="number" min="0" value={usedCredits} onChange={e => setUsedCredits(e.target.value)} placeholder="e.g. 8000" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, display: 'block', marginBottom: 6 }}>MONTHLY CLOUD SPEND ($)</label>
              <input type="number" min="0" value={monthlyBurn} onChange={e => setMonthlyBurn(e.target.value)} placeholder="e.g. 1200" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, display: 'block', marginBottom: 6 }}>CREDITS START DATE</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, display: 'block', marginBottom: 6 }}>CREDIT DURATION</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['12', '18', '24', '48'].map(m => (
                <button key={m} onClick={() => setDuration(m)} style={{
                  padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  border: durationMonths === m ? `1px solid ${prog.color}80` : '1px solid rgba(255,255,255,0.08)',
                  background: durationMonths === m ? `rgba(${hexToRgb(prog.color)},0.1)` : 'rgba(255,255,255,0.03)',
                  color: durationMonths === m ? prog.color : '#a0a0b0', transition: 'all 0.15s',
                }}>
                  {m === '48' ? '4 years' : `${m} mo`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Alert — will lose money */}
        {willLoseMoney && lostAmount > 0 && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 14, padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>Credits will expire before you use them</div>
              <div style={{ fontSize: 13, color: '#a0a0b0' }}>
                At your current burn rate, you&apos;ll have ~<strong style={{ color: 'white' }}>${Math.round(lostAmount).toLocaleString()}</strong> in unused credits
                when they expire in {fmtDate(expiry!)}. Consider scaling usage or spinning up staging environments.
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        {total > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'REMAINING', value: `$${remaining.toLocaleString()}`, color: '#22c55e' },
              { label: 'BURN RATE', value: burn > 0 ? `$${burn.toLocaleString()}/mo` : '—', color: '#f59e0b' },
              { label: 'RUNWAY', value: monthsOfRunway != null && burn > 0 ? `${monthsOfRunway.toFixed(1)} mo` : '—', color: '#818cf8' },
            ].map(s => (
              <div key={s.label} className="glass-card" style={{ padding: 18, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#444', letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Progress bar */}
        {total > 0 && (
          <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 10 }}>
              <span>CREDITS USED</span>
              <span style={{ color: pctUsed > 80 ? '#ef4444' : '#a0a0b0' }}>{pctUsed.toFixed(0)}%</span>
            </div>
            <div style={{ height: 12, borderRadius: 8, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', marginBottom: 6 }}>
              <div style={{
                height: '100%', borderRadius: 8, transition: 'width 0.4s ease',
                width: `${pctUsed}%`,
                background: pctUsed > 80 ? '#ef4444' : pctUsed > 60 ? '#f59e0b' : '#22c55e',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#555' }}>
              <span>${used.toLocaleString()} used</span>
              <span>${total.toLocaleString()} total</span>
            </div>
          </div>
        )}

        {/* Timeline */}
        {start && expiry && (
          <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 16 }}>TIMELINE</div>
            <div style={{ position: 'relative', height: 36, marginBottom: 28 }}>
              {/* Track */}
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, transform: 'translateY(-50%)' }} />

              {/* Today marker */}
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${pct(today)}%`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 2, height: '100%', background: '#818cf8' }} />
              </div>

              {/* Projected exhaust marker */}
              {projectedExhaust && burn > 0 && (
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${pct(projectedExhaust)}%`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 2, height: '100%', background: '#f59e0b' }} />
                </div>
              )}

              {/* Expiry marker */}
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${pct(expiry)}%`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 2, height: '100%', background: willLoseMoney ? '#ef4444' : '#22c55e' }} />
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#a0a0b0' }}>
                <div style={{ width: 12, height: 3, background: '#818cf8', borderRadius: 2 }} />
                Today ({fmtDate(today)})
              </div>
              {projectedExhaust && burn > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#a0a0b0' }}>
                  <div style={{ width: 12, height: 3, background: '#f59e0b', borderRadius: 2 }} />
                  Credits exhausted ({fmtDate(projectedExhaust)})
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#a0a0b0' }}>
                <div style={{ width: 12, height: 3, background: willLoseMoney ? '#ef4444' : '#22c55e', borderRadius: 2 }} />
                Expires ({fmtDate(expiry)}) — {daysToExpiry != null ? `${daysToExpiry} days` : ''}
              </div>
            </div>
          </div>
        )}

        {/* Program info */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 22px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 12 }}>CREDIT PROGRAMS COVERED</div>
          {(Object.keys(PROGRAMS) as Provider[]).map(k => {
            const p = PROGRAMS[k]
            return (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: 13, color: '#a0a0b0' }}>{p.emoji} {p.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: p.color }}>{p.range} · {p.duration}</span>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`
}
