'use client'

import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const PROVIDERS = ['AWS', 'Azure', 'GCP', 'Other'] as const
type Provider = typeof PROVIDERS[number]

const COLORS: Record<Provider, string> = {
  AWS:   '#f59e0b',
  Azure: '#3b82f6',
  GCP:   '#22c55e',
  Other: '#8b5cf6',
}

const PROVIDER_ADVICE: Record<number, { label: string; color: string; bg: string; advice: string }> = {
  1: { label: 'Simple', color: '#22c55e', bg: 'rgba(34,197,94,0.08)', advice: 'Single-cloud is the easiest to manage and negotiate. Focus on reserved instances and rightsizing to maximize savings on your primary provider.' },
  2: { label: 'Moderate', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', advice: 'Two-cloud setups can make sense for specific workloads, but watch for duplication. Consolidate monitoring and ensure your team has skills for both providers.' },
  3: { label: 'Complex', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', advice: 'Three or more clouds significantly increases operational overhead, tooling costs, and security surface area. Consider consolidating unless each provider serves a genuinely distinct purpose.' },
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${Math.round(n).toLocaleString()}`
}

function CustomLabel({ cx, cy, total }: { cx: number; cy: number; total: number }) {
  return (
    <>
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#ffffff" fontSize={22} fontWeight={900}>
        {fmt(total)}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#555" fontSize={12}>
        /month
      </text>
    </>
  )
}

export default function MultiCloudPage() {
  const [spends, setSpends] = useState<Record<Provider, string>>({ AWS: '', Azure: '', GCP: '', Other: '' })

  const values = useMemo((): Record<Provider, number> => ({
    AWS:   Number(spends.AWS)   || 0,
    Azure: Number(spends.Azure) || 0,
    GCP:   Number(spends.GCP)   || 0,
    Other: Number(spends.Other) || 0,
  }), [spends])

  const total = useMemo(() => Object.values(values).reduce((s, v) => s + v, 0), [values])
  const active = PROVIDERS.filter(p => values[p] > 0)
  const complexity = active.length <= 1 ? 1 : active.length === 2 ? 2 : 3
  const complexityInfo = PROVIDER_ADVICE[complexity]
  const totalWaste = total * 0.28
  const savingPotential = total * 0.28

  const pieData = active.map(p => ({ name: p, value: values[p] }))

  const inputStyle: React.CSSProperties = {
    background: '#0a0a0f',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: '11px 14px 11px 32px',
    color: 'white',
    fontSize: 15,
    fontWeight: 600,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '100px 24px 80px' }}>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 14, letterSpacing: 1 }}>
            MULTI-CLOUD VIEW
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, marginBottom: 10 }}>
            Your complete cloud spend picture
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 15, maxWidth: 520 }}>
            Enter your monthly spend across all providers to see consolidated totals, waste, and complexity score.
          </p>
        </div>

        {/* Spend inputs */}
        <div style={{ background: '#1a1a2e', borderRadius: 16, padding: '24px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 32 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {PROVIDERS.map(p => (
              <div key={p}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[p], flexShrink: 0 }} />
                  {p} MONTHLY
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#444', fontSize: 14 }}>$</span>
                  <input
                    type="number"
                    value={spends[p]}
                    onChange={e => setSpends(prev => ({ ...prev, [p]: e.target.value }))}
                    placeholder="0"
                    style={inputStyle}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {total > 0 && (
          <>
            {/* Chart + provider cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24, alignItems: 'start' }}>
              {/* Pie chart */}
              <div style={{ background: '#111118', borderRadius: 16, padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>SPEND BREAKDOWN</div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} dataKey="value" paddingAngle={3}>
                      {pieData.map(entry => (
                        <Cell key={entry.name} fill={COLORS[entry.name as Provider]} />
                      ))}
                    </Pie>
                    <CustomLabel cx={0} cy={0} total={total} />
                    <Tooltip
                      contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 13 }}
                      formatter={(v: number) => [`$${v.toLocaleString()}/mo`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {active.map(p => (
                    <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[p], flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: '#a0a0b0', flex: 1 }}>{p}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{fmt(values[p])}</span>
                      <span style={{ fontSize: 11, color: '#555' }}>{((values[p] / total) * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Provider cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {active.map(p => (
                  <div key={p} className="glass-card" style={{ padding: '16px 18px', borderLeft: `3px solid ${COLORS[p]}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: COLORS[p] }}>{p}</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: 'white' }}>{fmt(values[p])}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 10, color: '#444', letterSpacing: 1 }}>% OF TOTAL</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#a0a0b0' }}>{((values[p] / total) * 100).toFixed(0)}%</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#444', letterSpacing: 1 }}>EST. WASTE</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#ef4444' }}>{fmt(values[p] * 0.28)}/mo</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complexity + totals */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div className="glass-card" style={{ padding: '20px 22px' }}>
                <div style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>TOTAL WASTE ESTIMATE</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#ef4444' }}>{fmt(totalWaste)}</div>
                <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>28% industry avg · per month</div>
              </div>
              <div className="glass-card" style={{ padding: '20px 22px' }}>
                <div style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>SAVING POTENTIAL</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#22c55e' }}>{fmt(savingPotential)}</div>
                <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>recoverable monthly</div>
              </div>
            </div>

            {/* Complexity score */}
            <div style={{ background: complexityInfo.bg, border: `1px solid ${complexityInfo.color}30`, borderRadius: 14, padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1 }}>COMPLEXITY SCORE</div>
                <span style={{ fontSize: 14, fontWeight: 800, color: complexityInfo.color, background: `${complexityInfo.color}20`, padding: '3px 12px', borderRadius: 8 }}>
                  {complexityInfo.label.toUpperCase()} — {active.length} provider{active.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p style={{ fontSize: 14, color: '#a0a0b0', lineHeight: 1.65, margin: 0 }}>{complexityInfo.advice}</p>
            </div>
          </>
        )}

        {total === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#333', fontSize: 15 }}>
            Enter spend amounts above to see your consolidated cloud picture
          </div>
        )}
      </div>
    </div>
  )
}
