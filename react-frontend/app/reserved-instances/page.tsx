'use client'

import { useState } from 'react'

type Age = 'under3' | '3to6' | '6to12' | 'over12'
type Workload = 'always_on' | 'business_hours' | 'variable' | 'batch'
type Provider = 'AWS' | 'Azure' | 'GCP'

interface Recommendation {
  label: string
  color: string
  bg: string
  border: string
  icon: string
  reason: string
}

const AGE_OPTS: { id: Age; label: string }[] = [
  { id: 'under3',  label: 'Under 3 months' },
  { id: '3to6',    label: '3–6 months' },
  { id: '6to12',   label: '6–12 months' },
  { id: 'over12',  label: 'Over 12 months' },
]

const WORKLOAD_OPTS: { id: Workload; label: string; desc: string }[] = [
  { id: 'always_on',     label: 'Always on 24/7',    desc: 'Runs continuously' },
  { id: 'business_hours',label: 'Business hours',    desc: '~8 hrs/day weekdays' },
  { id: 'variable',      label: 'Variable',          desc: 'Unpredictable demand' },
  { id: 'batch',         label: 'Batch / scheduled', desc: 'Periodic jobs' },
]

const PROVIDER_OPTS: Provider[] = ['AWS', 'Azure', 'GCP']

const PROVIDER_TERMS: Record<Provider, { one: string; three: string; url: string }> = {
  AWS:   { one: '1-Year Reserved Instance',    three: '3-Year Reserved Instance',    url: 'EC2 Reserved Instances' },
  Azure: { one: '1-Year Reserved VM',          three: '3-Year Reserved VM',          url: 'Azure Reserved VM Instances' },
  GCP:   { one: '1-Year Committed Use Discount', three: '3-Year Committed Use Discount', url: 'GCP Committed Use Discounts' },
}

function getRecommendation(age: Age, workload: Workload): Recommendation {
  if ((workload === 'always_on' || workload === 'business_hours') && (age === '6to12' || age === 'over12')) {
    return { label: 'BUY RESERVED', icon: '✓', color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)', reason: 'Stable workload with proven lifetime. Reserved instances will pay back within 3 months and save significantly over the term.' }
  }
  if (workload === 'business_hours' && age === '3to6') {
    return { label: 'CONSIDER', icon: '~', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', reason: 'Your workload pattern is good but age is short. Wait another 1–2 months to confirm stability before committing.' }
  }
  if (workload === 'always_on' && age === '3to6') {
    return { label: 'CONSIDER', icon: '~', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', reason: 'Always-on is ideal for reserved instances, but confirm your spend won\'t change significantly before locking in.' }
  }
  if (workload === 'variable' || workload === 'batch') {
    return { label: 'STAY ON-DEMAND', icon: '→', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)', reason: 'Variable and batch workloads are poor candidates for reserved instances. Consider Spot Instances (AWS) or Preemptible VMs (GCP) instead for up to 90% savings on flexible jobs.' }
  }
  return { label: 'STAY ON-DEMAND', icon: '→', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)', reason: 'Not enough workload history to commit. Stay on-demand and revisit in 3 months.' }
}

function getRisk(age: Age, workload: Workload, cost: number): { level: string; color: string; items: string[] } {
  const items: string[] = []
  if (age === 'under3' || age === '3to6') items.push('Short workload history — usage pattern may still change')
  if (workload === 'variable') items.push('Variable workloads may leave reserved capacity unused on slow periods')
  if (cost > 10000) items.push('High commitment value — confirm with finance before purchasing')
  if (workload === 'always_on' && (age === '6to12' || age === 'over12')) items.push('No significant risks — this workload profile is ideal for reservation')

  const level = items.length === 0 || (items.length === 1 && items[0].includes('No significant'))
    ? 'Low' : items.length <= 2 ? 'Medium' : 'High'
  const color = level === 'Low' ? '#22c55e' : level === 'Medium' ? '#f59e0b' : '#ef4444'
  return { level, color, items }
}

function fmt(n: number) {
  return `$${Math.round(n).toLocaleString()}`
}

const btnStyle = (active: boolean): React.CSSProperties => ({
  background: active ? 'rgba(99,102,241,0.15)' : '#111118',
  border: `1px solid ${active ? '#6366f1' : 'rgba(255,255,255,0.08)'}`,
  borderRadius: 10, padding: '12px 16px', cursor: 'pointer',
  color: active ? 'white' : '#666', textAlign: 'left', width: '100%',
  transition: 'all 0.15s', fontSize: 14,
})

export default function ReservedInstancesPage() {
  const [cost, setCost] = useState(2000)
  const [age, setAge] = useState<Age>('over12')
  const [workload, setWorkload] = useState<Workload>('always_on')
  const [provider, setProvider] = useState<Provider>('AWS')

  const rec = getRecommendation(age, workload)
  const risk = getRisk(age, workload, cost)
  const terms = PROVIDER_TERMS[provider]

  const oneYearSaving = cost * 0.35 * 12
  const threeYearSaving = cost * 0.57 * 36
  const oneYearMonthlyCost = cost * 0.65
  const threeYearMonthlyCost = cost * 0.43
  const breakEvenOne = Math.ceil((cost * 0.65 * 12) / (cost * 0.35 * 12) * 12)

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '100px 24px 80px' }}>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 14, letterSpacing: 1 }}>
            RESERVED INSTANCE OPTIMIZER
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, marginBottom: 10 }}>
            Should you buy reserved instances?
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 15, maxWidth: 520 }}>
            Answer 4 questions. Get a clear buy/wait/avoid verdict with exact savings numbers.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
          {/* Cost input */}
          <div style={{ background: '#1a1a2e', borderRadius: 14, padding: 20, border: '1px solid rgba(255,255,255,0.06)', gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 10 }}>CURRENT ON-DEMAND MONTHLY COST</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '0 0 200px' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#666' }}>$</span>
                <input type="number" value={cost} onChange={e => setCost(Math.max(0, Number(e.target.value)))} style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px 11px 28px', color: 'white', fontSize: 16, fontWeight: 700, outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 6, display: 'block' }}>PROVIDER</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {PROVIDER_OPTS.map(p => (
                    <button key={p} onClick={() => setProvider(p)} style={{ flex: 1, background: provider === p ? '#6366f1' : '#0a0a0f', border: `1px solid ${provider === p ? '#6366f1' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, padding: '8px 0', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Workload age */}
          <div style={{ background: '#1a1a2e', borderRadius: 14, padding: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 12 }}>WORKLOAD AGE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {AGE_OPTS.map(o => (
                <button key={o.id} onClick={() => setAge(o.id)} style={btnStyle(age === o.id)}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Workload type */}
          <div style={{ background: '#1a1a2e', borderRadius: 14, padding: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 12 }}>WORKLOAD TYPE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {WORKLOAD_OPTS.map(o => (
                <button key={o.id} onClick={() => setWorkload(o.id)} style={btnStyle(workload === o.id)}>
                  <div style={{ fontWeight: 600 }}>{o.label}</div>
                  <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{o.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendation badge */}
        <div style={{ background: rec.bg, border: `1px solid ${rec.border}`, borderRadius: 16, padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: rec.color, minWidth: 40, textAlign: 'center' }}>{rec.icon}</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: rec.color, marginBottom: 6 }}>{rec.label}</div>
            <p style={{ fontSize: 14, color: '#a0a0b0', lineHeight: 1.6, margin: 0 }}>{rec.reason}</p>
          </div>
        </div>

        {/* Savings breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div className="glass-card" style={{ padding: '22px 24px' }}>
            <div style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>{terms.one.toUpperCase()}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#22c55e', marginBottom: 4 }}>{fmt(oneYearSaving)}</div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 10 }}>saved over 12 months</div>
            <div style={{ fontSize: 13, color: '#a0a0b0' }}>
              <strong style={{ color: 'white' }}>{fmt(oneYearMonthlyCost)}/month</strong> vs {fmt(cost)} on-demand
            </div>
            <div style={{ fontSize: 12, color: '#555', marginTop: 6 }}>Typically pays back in {breakEvenOne <= 3 ? '< 3' : breakEvenOne} months</div>
          </div>
          <div className="glass-card" style={{ padding: '22px 24px' }}>
            <div style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>{terms.three.toUpperCase()}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#22c55e', marginBottom: 4 }}>{fmt(threeYearSaving)}</div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 10 }}>saved over 36 months</div>
            <div style={{ fontSize: 13, color: '#a0a0b0' }}>
              <strong style={{ color: 'white' }}>{fmt(threeYearMonthlyCost)}/month</strong> vs {fmt(cost)} on-demand
            </div>
            <div style={{ fontSize: 12, color: '#555', marginTop: 6 }}>57% discount — maximum savings</div>
          </div>
        </div>

        {/* Risk assessment */}
        <div style={{ background: '#111118', borderRadius: 14, padding: '20px 24px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1 }}>RISK ASSESSMENT</div>
            <span style={{ fontSize: 11, fontWeight: 800, color: risk.color, background: `${risk.color}20`, padding: '2px 10px', borderRadius: 8 }}>
              {risk.level.toUpperCase()} RISK
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {risk.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: risk.color, fontSize: 14, flexShrink: 0, marginTop: 1 }}>
                  {risk.level === 'Low' ? '✓' : '⚠'}
                </span>
                <span style={{ fontSize: 13, color: '#a0a0b0', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: '#444' }}>
            Pricing model: {terms.url}
          </div>
        </div>
      </div>
    </div>
  )
}
