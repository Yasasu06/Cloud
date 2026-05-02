'use client'

import { useState } from 'react'

type ProductType = 'simple' | 'collaboration' | 'data' | 'realtime' | 'aiml'

const BENCHMARKS: Record<ProductType, { label: string; low: number; high: number; icon: string }> = {
  simple:        { label: 'Simple SaaS',   low: 0.30, high: 1.00,  icon: '📦' },
  collaboration: { label: 'Collaboration', low: 1.00, high: 2.50,  icon: '👥' },
  data:          { label: 'Data-heavy',    low: 2.00, high: 5.00,  icon: '🗄️' },
  realtime:      { label: 'Real-time',     low: 3.00, high: 8.00,  icon: '⚡' },
  aiml:          { label: 'AI/ML',         low: 5.00, high: 15.00, icon: '🤖' },
}

const CAUSES: Record<string, string[]> = {
  simple:        ['Missing CDN / caching layer', 'Overprovisioned RDS instance', 'Logs stored in S3 Standard (use Glacier)', 'No autoscaling on app servers'],
  collaboration: ['Per-user storage not bounded', 'Real-time infra running 24/7 for idle users', 'Redundant file sync calls', 'WebSocket connections per idle user'],
  data:          ['Full dataset loaded per query (add indexes)', 'No query result caching', 'One heavy customer skewing averages', 'Uncompressed data in transit'],
  realtime:      ['Persistent connections for all users', 'Pub/sub fanout to offline users', 'No message batching', 'Overprovisioned cache cluster'],
  aiml:          ['GPT-4 for every call (use smaller model for 80%)', 'No prompt caching or dedup', 'Embedding recomputed on every request', 'Large context windows where small would suffice'],
}

function getVerdict(cpu: number, type: ProductType): 'healthy' | 'high' | 'critical' {
  const b = BENCHMARKS[type]
  if (cpu <= b.high) return 'healthy'
  if (cpu <= b.high * 2) return 'high'
  return 'critical'
}

const VERDICT_META = {
  healthy:  { label: 'Healthy',  color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.3)',  icon: '✅' },
  high:     { label: 'High',     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', icon: '⚠️' },
  critical: { label: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)',  icon: '🔴' },
}

interface Props { embedded?: boolean }

export default function CostPerUserTool({ embedded = false }: Props) {
  const [spend, setSpend] = useState('')
  const [users, setUsers] = useState('')
  const [type, setType]   = useState<ProductType>('simple')

  const spendNum = parseFloat(spend) || 0
  const usersNum = parseFloat(users) || 0
  const cpu      = usersNum > 0 ? spendNum / usersNum : 0
  const bench    = BENCHMARKS[type]
  const verdict  = cpu > 0 ? getVerdict(cpu, type) : null
  const vm       = verdict ? VERDICT_META[verdict] : null

  const gaugeMax     = bench.high * 2
  const gaugeFill    = cpu > 0 ? Math.min(cpu / gaugeMax, 1) * 100 : 0
  const healthyEnd   = (bench.high / gaugeMax) * 100
  const healthyStart = (bench.low / gaugeMax) * 100

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 10, fontSize: 15, fontWeight: 500,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'white', outline: 'none', boxSizing: 'border-box',
  }

  const inner = (
    <>
      {!embedded && (
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>
            STARTUP METRIC
          </div>
          <h1 style={{ fontSize: 'clamp(26px,5vw,40px)', fontWeight: 900, marginBottom: 12, lineHeight: 1.1 }}>
            Cost Per User Calculator
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 15, maxWidth: 440, margin: '0 auto' }}>
            Know if your cloud economics are healthy before your next funding round.
          </p>
        </div>
      )}

      <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label htmlFor="cpu-spend" style={{ fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: 1, display: 'block', marginBottom: 8 }}>MONTHLY CLOUD SPEND ($)</label>
            <input id="cpu-spend" type="number" min="0" value={spend} onChange={e => setSpend(e.target.value)} placeholder="e.g. 4000" style={inputStyle} />
          </div>
          <div>
            <label htmlFor="cpu-users" style={{ fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: 1, display: 'block', marginBottom: 8 }}>PAYING CUSTOMERS</label>
            <input id="cpu-users" type="number" min="1" value={users} onChange={e => setUsers(e.target.value)} placeholder="e.g. 500" style={inputStyle} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: 1, display: 'block', marginBottom: 8 }}>PRODUCT TYPE</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(Object.keys(BENCHMARKS) as ProductType[]).map(k => (
              <button key={k} onClick={() => setType(k)}
                style={{ padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  border: type === k ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.08)',
                  background: type === k ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                  color: type === k ? '#818cf8' : '#a0a0b0', transition: 'all 0.15s' }}
              >
                {BENCHMARKS[k].icon} {BENCHMARKS[k].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {cpu > 0 && verdict && vm && (
        <>
          <div className="glass-card" style={{ padding: 28, marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>YOUR COST PER USER</div>
            <div style={{ fontSize: 'clamp(48px,10vw,72px)', fontWeight: 900, color: vm.color, lineHeight: 1 }}>
              ${cpu < 10 ? cpu.toFixed(2) : cpu.toFixed(0)}
            </div>
            <div style={{ fontSize: 14, color: '#555', marginTop: 6 }}>per paying customer / month</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 20, background: vm.bg, border: `1px solid ${vm.border}`, borderRadius: 12, padding: '10px 20px', fontSize: 15, fontWeight: 700, color: vm.color }}>
              {vm.icon} {vm.label}
            </div>
          </div>

          <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 12 }}>
              INDUSTRY RANGE — {bench.label}
            </div>
            <div style={{ position: 'relative', height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${healthyStart}%`, width: `${healthyEnd - healthyStart}%`, background: 'rgba(34,197,94,0.15)', borderLeft: '1px solid rgba(34,197,94,0.4)', borderRight: '1px solid rgba(34,197,94,0.4)' }} />
              <div style={{ position: 'absolute', top: 0, bottom: 0, width: 3, borderRadius: 2, left: `${Math.min(gaugeFill, 98)}%`, background: vm.color, boxShadow: `0 0 8px ${vm.color}` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#555' }}>
              <span>$0</span>
              <span style={{ color: '#22c55e' }}>Healthy: ${bench.low}–${bench.high}/user</span>
              <span>${gaugeMax.toFixed(0)}+</span>
            </div>
          </div>

          {(verdict === 'high' || verdict === 'critical') && (
            <div style={{ background: vm.bg, border: `1px solid ${vm.border}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: vm.color, marginBottom: 14 }}>
                {verdict === 'critical' ? '🔴 Likely causes of over-spend' : '⚠️ Common causes to investigate'}
              </div>
              {CAUSES[type].map(c => (
                <div key={c} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#a0a0b0', marginBottom: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: vm.color, flexShrink: 0 }}>→</span>{c}
                </div>
              ))}
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 13, color: '#555' }}>
                Run <a href="/analyze" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>AI Analyze</a> with your stack details for specific recommendations.
              </div>
            </div>
          )}

          {verdict === 'healthy' && (
            <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 16, padding: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#22c55e', marginBottom: 6 }}>✅ Your unit economics look solid</div>
              <div style={{ fontSize: 13, color: '#a0a0b0' }}>
                ${cpu.toFixed(2)}/user falls within the healthy ${bench.low}–${bench.high} range for {bench.label}.
                At this rate, cloud costs won&apos;t be a concern until you scale significantly.
              </div>
            </div>
          )}

          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 14 }}>ALL BENCHMARKS</div>
            {(Object.keys(BENCHMARKS) as ProductType[]).map(k => {
              const b = BENCHMARKS[k]
              const isActive = k === type
              return (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 8, marginBottom: 4, background: isActive ? 'rgba(99,102,241,0.08)' : 'transparent', border: isActive ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent' }}>
                  <span style={{ fontSize: 13, color: isActive ? 'white' : '#a0a0b0' }}>{b.icon} {b.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? '#818cf8' : '#555' }}>${b.low}–${b.high}/user</span>
                </div>
              )
            })}
          </div>
        </>
      )}

      {!cpu && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#555' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 14 }}>Enter your spend and customer count to see your cost per user</div>
        </div>
      )}
    </>
  )

  if (embedded) return <div>{inner}</div>
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '100px 24px 80px' }}>{inner}</div>
    </div>
  )
}
