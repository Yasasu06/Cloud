'use client'

import { useState, useMemo, useEffect } from 'react'
import { UserContext } from '@/lib/userContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const GROWTH_RATES = [5, 10, 20, 30, 50] as const
const PERIODS = [3, 6, 12] as const
type GrowthRate = typeof GROWTH_RATES[number]
type Period = typeof PERIODS[number]

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${Math.round(n).toLocaleString()}`
}

function buildData(base: number, growthPct: number, months: number) {
  const data = []
  let current = base
  let optimized = base * 0.72
  for (let m = 0; m <= months; m++) {
    data.push({
      month: m === 0 ? 'Now' : `M${m}`,
      current: Math.round(current),
      optimized: Math.round(optimized),
    })
    current *= 1 + growthPct / 100
    optimized *= 1 + growthPct / 100
  }
  return data
}

const selectStyle: React.CSSProperties = {
  background: '#0a0a0f',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  padding: '11px 14px',
  color: 'white',
  fontSize: 14,
  outline: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
}

export default function ForecastPage() {
  const [spend, setSpend] = useState(5000)
  const [growth, setGrowth] = useState<GrowthRate>(10)
  const [period, setPeriod] = useState<Period>(6)

  useEffect(() => {
    const s = UserContext.get('monthlySpend'); if (s) setSpend(s)
  }, [])
  useEffect(() => { if (spend > 0) UserContext.save('monthlySpend', spend) }, [spend])

  const data = useMemo(() => buildData(spend, growth, period), [spend, growth, period])

  const totalCurrent = data.slice(1).reduce((s, d) => s + d.current, 0)
  const totalOptimized = data.slice(1).reduce((s, d) => s + d.optimized, 0)
  const totalWaste = totalCurrent * 0.28
  const totalSaving = totalCurrent - totalOptimized
  const hoursWork = 4

  const stats = [
    { label: 'Total spend (no action)', value: fmt(totalCurrent), color: '#ef4444', sub: `over ${period} months` },
    { label: 'Estimated waste', value: fmt(totalWaste), color: '#f97316', sub: '28% industry average' },
    { label: 'Saving if optimized now', value: fmt(totalSaving), color: '#22c55e', sub: 'vs current trajectory' },
    { label: `${hoursWork}hrs work =`, value: fmt(totalSaving), color: '#6366f1', sub: 'implement top 3 actions' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px 80px' }}>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 14, letterSpacing: 1 }}>
            COST FORECAST
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, marginBottom: 10 }}>
            Where is your cloud bill headed?
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 15, maxWidth: 520 }}>
            Model your cost trajectory and see exactly how much you save by optimizing now vs. later.
          </p>
        </div>

        {/* Inputs */}
        <div style={{ background: '#1a1a2e', borderRadius: 16, padding: '24px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 32, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 180px' }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>CURRENT MONTHLY SPEND</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#666', fontSize: 14 }}>$</span>
              <input
                type="number"
                value={spend}
                onChange={e => setSpend(Math.max(0, Number(e.target.value)))}
                style={{ ...selectStyle, paddingLeft: 28, width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          <div style={{ flex: '1 1 160px' }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>MONTHLY GROWTH RATE</label>
            <select value={growth} onChange={e => setGrowth(Number(e.target.value) as GrowthRate)} style={selectStyle}>
              {GROWTH_RATES.map(r => <option key={r} value={r}>{r}% / month</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 160px' }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>FORECAST PERIOD</label>
            <select value={period} onChange={e => setPeriod(Number(e.target.value) as Period)} style={selectStyle}>
              {PERIODS.map(p => <option key={p} value={p}>{p} months</option>)}
            </select>
          </div>
        </div>

        {/* Chart */}
        <div style={{ background: '#111118', borderRadius: 16, padding: '24px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 20 }}>MONTHLY COST PROJECTION</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#555', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 13 }}
                labelStyle={{ color: '#a0a0b0' }}
                formatter={(v: number) => [`$${v.toLocaleString()}`, '']}
              />
              <Legend wrapperStyle={{ fontSize: 13, paddingTop: 12 }} />
              <Line type="monotone" dataKey="current" name="Current trajectory" stroke="#ef4444" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="optimized" name="Optimized (28% less)" stroke="#22c55e" strokeWidth={2.5} dot={false} strokeDasharray="6 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          {stats.map(s => (
            <div key={s.label} className="glass-card" style={{ padding: '20px 22px' }}>
              <div style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>{s.label.toUpperCase()}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#444', marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 28, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '16px 20px' }}>
          <p style={{ fontSize: 13, color: '#818cf8', margin: 0, lineHeight: 1.6 }}>
            💡 <strong>The key insight:</strong> Every month you delay optimization, you pay for waste twice — once in current bills and once in the compounding trajectory. The gap between lines is money you&apos;re choosing to spend.
          </p>
        </div>
      </div>
    </div>
  )
}
