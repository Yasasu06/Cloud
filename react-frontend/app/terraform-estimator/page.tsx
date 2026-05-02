'use client'

import { useState, useMemo } from 'react'

type Provider = 'AWS' | 'Azure' | 'GCP'
type Region = 'US' | 'Europe' | 'Asia'
type UserTier = 'under10k' | '10k-100k' | '100k+'

interface Pattern {
  id: string
  label: string
  icon: string
  desc: string
  lineItems: { name: string; pct: number }[]
}

const PATTERNS: Pattern[] = [
  { id: 'simple_web',    icon: '🌐', label: 'Simple web app',   desc: 'EC2 + RDS + Transfer',          lineItems: [{ name: 'Compute (EC2/VM)', pct: 45 }, { name: 'Database (RDS)', pct: 35 }, { name: 'Data Transfer', pct: 20 }] },
  { id: 'microservices', icon: '🔧', label: 'Microservices',    desc: 'ECS + RDS + ALB',               lineItems: [{ name: 'Container (ECS/ACI)', pct: 40 }, { name: 'Database (RDS)', pct: 30 }, { name: 'Load Balancer', pct: 18 }, { name: 'Data Transfer', pct: 12 }] },
  { id: 'data_pipeline', icon: '📊', label: 'Data pipeline',    desc: 'EMR + S3 + Transfer',           lineItems: [{ name: 'Processing (EMR/HDInsight)', pct: 55 }, { name: 'Storage (S3)', pct: 25 }, { name: 'Data Transfer', pct: 20 }] },
  { id: 'ml_workload',   icon: '🤖', label: 'ML workload',      desc: 'GPU instance + S3',             lineItems: [{ name: 'GPU Compute', pct: 70 }, { name: 'Storage (S3)', pct: 20 }, { name: 'Data Transfer', pct: 10 }] },
  { id: 'static_site',   icon: '📄', label: 'Static website',   desc: 'CloudFront + S3',               lineItems: [{ name: 'CDN (CloudFront)', pct: 60 }, { name: 'Storage (S3)', pct: 40 }] },
  { id: 'enterprise',    icon: '🏢', label: 'Enterprise app',   desc: 'Multi-AZ + WAF + Shield',       lineItems: [{ name: 'Multi-AZ Compute', pct: 40 }, { name: 'WAF + Shield', pct: 25 }, { name: 'Database HA', pct: 25 }, { name: 'Data Transfer', pct: 10 }] },
]

const BASE_COSTS: Record<string, Record<Provider, number>> = {
  simple_web:    { AWS: 58,   Azure: 62,   GCP: 55   },
  microservices: { AWS: 310,  Azure: 290,  GCP: 275  },
  data_pipeline: { AWS: 450,  Azure: 420,  GCP: 400  },
  ml_workload:   { AWS: 800,  Azure: 780,  GCP: 720  },
  static_site:   { AWS: 12,   Azure: 14,   GCP: 11   },
  enterprise:    { AWS: 1200, Azure: 1100, GCP: 1050 },
}

const USER_MULT: Record<UserTier, number> = {
  'under10k': 1,
  '10k-100k': 3,
  '100k+':    8,
}

const REGION_MULT: Record<Region, number> = {
  US:     1,
  Europe: 1.1,
  Asia:   1.1,
}

const USER_TIERS: { id: UserTier; label: string }[] = [
  { id: 'under10k', label: 'Under 10k / month' },
  { id: '10k-100k', label: '10k – 100k / month' },
  { id: '100k+',    label: '100k+ / month' },
]

const PROVIDER_COLOR: Record<Provider, string> = {
  AWS: '#f59e0b', Azure: '#3b82f6', GCP: '#22c55e',
}

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`
  return `$${Math.round(n).toLocaleString()}`
}

function calcCost(patternId: string, provider: Provider, region: Region, userTier: UserTier) {
  const base = BASE_COSTS[patternId]?.[provider] ?? 0
  return Math.round(base * USER_MULT[userTier] * REGION_MULT[region])
}

export default function TerraformEstimatorPage() {
  const [pattern, setPattern] = useState<string>('simple_web')
  const [provider, setProvider] = useState<Provider>('AWS')
  const [region, setRegion] = useState<Region>('US')
  const [userTier, setUserTier] = useState<UserTier>('under10k')

  const selectedPattern = PATTERNS.find(p => p.id === pattern)!
  const cost = useMemo(() => calcCost(pattern, provider, region, userTier), [pattern, provider, region, userTier])

  const allProviderCosts = useMemo(() =>
    (['AWS', 'Azure', 'GCP'] as Provider[]).map(p => ({
      provider: p,
      cost: calcCost(pattern, p, region, userTier),
    })).sort((a, b) => a.cost - b.cost),
  [pattern, region, userTier])

  const cheapest = allProviderCosts[0].provider

  const selBtnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, background: active ? '#6366f1' : '#0a0a0f',
    border: `1px solid ${active ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 8, padding: '9px 0', color: 'white', fontSize: 13,
    fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px 80px' }}>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 14, letterSpacing: 1 }}>
            INFRASTRUCTURE ESTIMATOR
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, marginBottom: 10 }}>
            Estimate your infrastructure cost
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 15, maxWidth: 520 }}>
            Pick your stack pattern and get instant cost estimates across all three major cloud providers.
          </p>
        </div>

        {/* Pattern selector */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 14 }}>SELECT YOUR PATTERN</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {PATTERNS.map(p => (
              <button
                key={p.id}
                onClick={() => setPattern(p.id)}
                style={{
                  background: pattern === p.id ? 'rgba(99,102,241,0.12)' : '#111118',
                  border: `1px solid ${pattern === p.id ? '#6366f1' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 12, padding: '16px 18px', cursor: 'pointer',
                  textAlign: 'left', transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>{p.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 3 }}>{p.label}</div>
                <div style={{ fontSize: 12, color: '#555' }}>{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Config row */}
        <div style={{ background: '#1a1a2e', borderRadius: 14, padding: '20px 24px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>PROVIDER</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['AWS', 'Azure', 'GCP'] as Provider[]).map(p => (
                  <button key={p} onClick={() => setProvider(p)} style={selBtnStyle(provider === p)}>{p}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>REGION</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['US', 'Europe', 'Asia'] as Region[]).map(r => (
                  <button key={r} onClick={() => setRegion(r)} style={selBtnStyle(region === r)}>{r}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>MONTHLY USERS</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {USER_TIERS.map(t => (
                  <button key={t.id} onClick={() => setUserTier(t.id)} style={{ ...selBtnStyle(userTier === t.id), textAlign: 'left', padding: '8px 12px', fontSize: 12 }}>{t.label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cost display */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          {/* Main estimate */}
          <div className="glass-card" style={{ padding: '28px', borderTop: `3px solid ${PROVIDER_COLOR[provider]}` }}>
            <div style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>ESTIMATED COST — {provider}</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: PROVIDER_COLOR[provider], marginBottom: 4 }}>{fmt(cost)}</div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>per month · {selectedPattern.label} · {region}</div>
            <div style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>COST BREAKDOWN</div>
            {selectedPattern.lineItems.map(item => {
              const itemCost = Math.round(cost * item.pct / 100)
              return (
                <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    <div style={{ height: 4, borderRadius: 2, background: PROVIDER_COLOR[provider], width: `${item.pct}%`, maxWidth: 80 }} />
                    <span style={{ fontSize: 13, color: '#a0a0b0' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{fmt(itemCost)}</span>
                </div>
              )
            })}
          </div>

          {/* Provider comparison */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>PROVIDER COMPARISON</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {allProviderCosts.map(({ provider: p, cost: c }, i) => (
                <div key={p} style={{
                  background: p === cheapest ? 'rgba(34,197,94,0.06)' : '#0a0a0f',
                  border: `1px solid ${p === cheapest ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 10, padding: '14px 16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: PROVIDER_COLOR[p] }}>{p}</span>
                      {p === cheapest && (
                        <span style={{ fontSize: 10, fontWeight: 800, color: '#22c55e', background: 'rgba(34,197,94,0.15)', padding: '2px 8px', borderRadius: 6 }}>CHEAPEST</span>
                      )}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: p === cheapest ? '#22c55e' : 'white' }}>{fmt(c)}</div>
                  </div>
                  {i > 0 && (
                    <div style={{ fontSize: 12, color: '#555' }}>
                      +{fmt(c - allProviderCosts[0].cost)}/mo vs {cheapest}
                    </div>
                  )}
                  {/* Cost bar */}
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, marginTop: 8 }}>
                    <div style={{ height: '100%', background: PROVIDER_COLOR[p], borderRadius: 2, width: `${(c / allProviderCosts[2].cost) * 100}%`, transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(99,102,241,0.06)', borderRadius: 8 }}>
              <p style={{ fontSize: 12, color: '#555', margin: 0, lineHeight: 1.6 }}>
                Estimates based on public list pricing. Reserved instances can reduce costs by 35–57%. Region multiplier applies for Europe and Asia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
