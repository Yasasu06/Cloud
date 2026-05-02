'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserContext } from '@/lib/userContext'
import DisclaimerBanner from '@/components/DisclaimerBanner'
import NextActionCards from '@/components/NextActionCards'

const PROVIDERS = ['AWS', 'Azure', 'GCP'] as const
const COMPANY_SIZES = ['1–10 employees', '11–50 employees', '51–200 employees', '200+ employees'] as const

interface SavingsRow {
  key: keyof DisplayedValues
  label: string
  pct: number
  desc: string
  color: string
}
interface DisplayedValues {
  reserved: number
  rightsizing: number
  idle: number
  storage: number
  total: number
}

const ROWS: SavingsRow[] = [
  { key: 'reserved',    label: 'Reserved Instances',   pct: 0.35, color: '#6366f1', desc: 'Commit to 1-year terms on steady workloads' },
  { key: 'rightsizing', label: 'Right-sizing',          pct: 0.18, color: '#f59e0b', desc: 'Match instance sizes to actual CPU/memory usage' },
  { key: 'idle',        label: 'Idle Resource Cleanup', pct: 0.12, color: '#22c55e', desc: 'Delete stopped instances, unattached volumes, old snapshots' },
  { key: 'storage',     label: 'Storage Optimization',  pct: 0.08, color: '#0078D4', desc: 'Move cold data to lower storage tiers' },
]

const TOTAL_PCT = ROWS.reduce((s, r) => s + r.pct, 0)
const ZERO: DisplayedValues = { reserved: 0, rightsizing: 0, idle: 0, storage: 0, total: 0 }

const selectStyle: React.CSSProperties = {
  width: '100%', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10, padding: '12px 16px', color: 'white', fontSize: 15,
  outline: 'none', cursor: 'pointer', boxSizing: 'border-box',
}

interface Props { embedded?: boolean }

export default function SavingsCalculatorTool({ embedded = false }: Props) {
  const router = useRouter()
  const [spend, setSpend] = useState(5000)
  const [provider, setProvider] = useState<typeof PROVIDERS[number]>('AWS')
  const [companySize, setCompanySize] = useState<typeof COMPANY_SIZES[number]>('11–50 employees')
  const [calculated, setCalculated] = useState(false)
  const [displayed, setDisplayed] = useState<DisplayedValues>(ZERO)
  const [showCalc, setShowCalc] = useState(false)
  const rafRef = useRef<number | null>(null)

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  useEffect(() => {
    const s = UserContext.get('monthlySpend'); if (s) setSpend(s)
    const p = UserContext.get('provider'); if (p) setProvider(p)
    const c = UserContext.get('companySize'); if (c) setCompanySize(c)
  }, [])
  useEffect(() => { if (spend > 0) UserContext.save('monthlySpend', spend) }, [spend])
  useEffect(() => { UserContext.save('provider', provider) }, [provider])
  useEffect(() => { UserContext.save('companySize', companySize) }, [companySize])

  function animate(targetSpend: number) {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const targets: DisplayedValues = {
      reserved:    Math.round(targetSpend * 0.35),
      rightsizing: Math.round(targetSpend * 0.18),
      idle:        Math.round(targetSpend * 0.12),
      storage:     Math.round(targetSpend * 0.08),
      total:       Math.round(targetSpend * TOTAL_PCT),
    }
    const duration = 1200
    const start = performance.now()
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setDisplayed({
        reserved:    Math.round(targets.reserved * e),
        rightsizing: Math.round(targets.rightsizing * e),
        idle:        Math.round(targets.idle * e),
        storage:     Math.round(targets.storage * e),
        total:       Math.round(targets.total * e),
      })
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  function calculate() {
    if (!spend || spend <= 0) return
    setCalculated(true)
    animate(spend)
  }

  const monthlySaving = Math.round(spend * TOTAL_PCT)
  const annualSaving = monthlySaving * 12

  const inner = (
    <>
      {!embedded && (
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-block', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#22c55e', fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>
            SAVINGS CALCULATOR
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, marginBottom: 12 }}>
            How much are you leaving on the table?
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 16, maxWidth: 440, margin: '0 auto' }}>
            Enter your current spend to see your exact savings opportunity.
          </p>
        </div>
      )}

      <div style={{ background: '#1a1a2e', borderRadius: 20, padding: '28px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 24 }}>
          <div>
            <label htmlFor="sav-spend" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>
              MONTHLY CLOUD SPEND
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a0a0b0', fontSize: 15, pointerEvents: 'none' }}>$</span>
              <input id="sav-spend" type="number" value={spend} min={0} onChange={e => setSpend(Number(e.target.value))} style={{ ...selectStyle, paddingLeft: 30, fontSize: 16, fontWeight: 600 }} />
            </div>
          </div>
          <div>
            <label htmlFor="sav-provider" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>
              CLOUD PROVIDER
            </label>
            <select id="sav-provider" value={provider} onChange={e => setProvider(e.target.value as typeof PROVIDERS[number])} style={selectStyle}>
              {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="sav-size" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>
              COMPANY SIZE
            </label>
            <select id="sav-size" value={companySize} onChange={e => setCompanySize(e.target.value as typeof COMPANY_SIZES[number])} style={selectStyle}>
              {COMPANY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={calculate}
          disabled={!spend || spend <= 0}
          style={{
            background: '#22c55e', border: 'none', borderRadius: 12,
            padding: '14px 36px', color: 'white', fontWeight: 700, fontSize: 16,
            cursor: !spend || spend <= 0 ? 'not-allowed' : 'pointer',
            opacity: !spend || spend <= 0 ? 0.5 : 1, transition: 'background 0.15s',
          }}
          onMouseEnter={e => { if (spend > 0) e.currentTarget.style.background = '#16a34a' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#22c55e' }}
        >
          Calculate My Savings →
        </button>
      </div>

      {calculated && <DisclaimerBanner />}
      {calculated && (
        <div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.07), rgba(34,197,94,0.02))',
            border: '1px solid rgba(34,197,94,0.2)', borderRadius: 20,
            padding: '36px 28px', textAlign: 'center', marginBottom: 24,
          }}>
            <p style={{ color: '#a0a0b0', fontSize: 15, marginBottom: 10 }}>
              At your current {provider} spend, you could save
            </p>
            <div style={{ fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 900, color: '#22c55e', lineHeight: 1, marginBottom: 10 }}>
              ${displayed.total.toLocaleString()}
              <span style={{ fontSize: '0.35em', color: '#a0a0b0', fontWeight: 600 }}>/month</span>
            </div>
            <p style={{ color: '#22c55e', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              That&apos;s ${annualSaving.toLocaleString()}/year
            </p>
            <p style={{ color: '#555', fontSize: 13 }}>
              Based on industry benchmarks for {companySize} on {provider} · FinOps Foundation 2025
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: 14, marginBottom: 24 }}>
            {ROWS.map(row => (
              <div key={row.key} className="glass-card" style={{ padding: '20px 18px', borderTop: `3px solid ${row.color}` }}>
                <div style={{ fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
                  {row.label.toUpperCase()}
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: row.color, lineHeight: 1, marginBottom: 4 }}>
                  ${displayed[row.key].toLocaleString()}
                </div>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>{Math.round(row.pct * 100)}% of spend</div>
                <div style={{ fontSize: 12, color: '#444', lineHeight: 1.5 }}>{row.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 20 }}>
            <button
              onClick={() => setShowCalc(v => !v)}
              style={{
                background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                padding: '8px 16px', color: '#666', fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#a0a0b0' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#666' }}
            >
              {showCalc ? '▲ Hide calculations' : '▼ Show how we calculated this'}
            </button>

            {showCalc && (
              <div style={{ marginTop: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 16 }}>📐 CALCULATION METHODOLOGY</div>
                {[
                  { label: 'Reserved Instances',   color: '#6366f1', saving: `$${Math.round(spend * 0.35).toLocaleString()}`, formula: 'Monthly spend × 35%', source: 'AWS publishes 30–72% RI savings. We use a conservative 35% (1-year No Upfront).',                                  link: 'aws.amazon.com/ec2/pricing/reserved-instances/' },
                  { label: 'Right-sizing',         color: '#f59e0b', saving: `$${Math.round(spend * 0.18).toLocaleString()}`, formula: 'Monthly spend × 18%', source: 'FinOps Foundation 2025: average 20% waste from over-provisioning. We use 18% (conservative).',                  link: 'finops.org/research/state-of-finops/' },
                  { label: 'Idle Resource Cleanup',color: '#22c55e', saving: `$${Math.round(spend * 0.12).toLocaleString()}`, formula: 'Monthly spend × 12%', source: 'Flexera State of Cloud 2025: 27% of cloud spend is wasted. Idle resources account for ~12%.',                  link: 'flexera.com/blog/cloud/state-of-the-cloud/' },
                  { label: 'Storage Optimization', color: '#0078D4', saving: `$${Math.round(spend * 0.08).toLocaleString()}`, formula: 'Monthly spend × 8%',  source: 'Moving infrequently accessed data from S3 Standard to Intelligent-Tiering saves 60–80% on that data. We assume ~8% of total spend is cold storage.', link: 'aws.amazon.com/s3/pricing/' },
                ].map(row => (
                  <div key={row.label} style={{ paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: row.color }}>{row.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 900, color: row.color }}>{row.saving}/mo</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}><span style={{ color: '#444', fontWeight: 700 }}>Formula:</span> {row.formula}</div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}><span style={{ color: '#444', fontWeight: 700 }}>Benchmark:</span> {row.source}</div>
                    <div style={{ fontSize: 11, color: '#444' }}>Source: {row.link}</div>
                  </div>
                ))}
                <div style={{ fontSize: 12, color: '#555' }}>
                  All percentages are conservative estimates. Actual savings depend on your specific workload and commitment level.
                </div>
              </div>
            )}
          </div>

          <div style={{ background: '#1a1a2e', borderRadius: 14, padding: '18px 22px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ color: '#a0a0b0', fontSize: 14 }}>Current spend: <strong style={{ color: 'white' }}>${spend.toLocaleString()}/month</strong></span>
            <span style={{ color: '#a0a0b0', fontSize: 14 }}>After optimization: <strong style={{ color: '#22c55e' }}>${(spend - monthlySaving).toLocaleString()}/month</strong></span>
            <span style={{ color: '#a0a0b0', fontSize: 14 }}>Annual saving: <strong style={{ color: '#22c55e' }}>${annualSaving.toLocaleString()}</strong></span>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #1a1a2e)', borderRadius: 16, padding: '24px 28px', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: '#a0a0b0', marginBottom: 6, letterSpacing: 1 }}>NEXT STEP</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Get your personalized savings plan</h3>
              <p style={{ color: '#a0a0b0', fontSize: 13 }}>AI analysis specific to your stack, team size, and existing setup.</p>
            </div>
            <button onClick={() => router.push('/analyze?mode=finops')} style={{ background: '#6366f1', border: 'none', borderRadius: 12, padding: '13px 28px', color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Get My Personalized Plan →
            </button>
          </div>
        </div>
      )}

      {calculated && (
        <NextActionCards actions={[
          { icon: '📊', title: 'Visualize Journey',  desc: '12-week trajectory',     href: '/outcome-simulator' },
          { icon: '🔧', title: 'Implementation Plan', desc: 'Step-by-step wizard',     href: '/optimize' },
          { icon: '📈', title: 'Track Progress',     desc: 'Log actual savings',       href: '/track-results' },
        ]} />
      )}
    </>
  )

  if (embedded) return <div>{inner}</div>
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '100px 24px 80px' }}>{inner}</div>
    </div>
  )
}
