'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserContext } from '@/lib/userContext'

const INDUSTRIES = ['SaaS', 'Healthcare', 'Ecommerce', 'Finance', 'Gaming', 'Education'] as const
const SIZES = ['1–10 employees', '11–50 employees', '51–200 employees', '200+ employees'] as const

type Industry = typeof INDUSTRIES[number]
type Size = typeof SIZES[number]

// Average monthly cloud spend by industry + size
const BENCHMARKS: Partial<Record<`${Industry}|${Size}`, number>> = {
  'SaaS|1–10 employees':         800,
  'SaaS|11–50 employees':        3200,
  'SaaS|51–200 employees':       12000,
  'Healthcare|1–10 employees':   1200,
  'Healthcare|11–50 employees':  5500,
  'Healthcare|51–200 employees': 18000,
  'Ecommerce|1–10 employees':    600,
  'Ecommerce|11–50 employees':   4800,
  'Finance|1–10 employees':      2000,
  'Finance|11–50 employees':     8000,
  'Gaming|1–10 employees':       1500,
  'Gaming|11–50 employees':      6000,
}

// Fallback multipliers for combos not in the table (200+ and Education)
const BASE_AVG: Record<Industry, number> = {
  SaaS: 800, Healthcare: 1200, Ecommerce: 600,
  Finance: 2000, Gaming: 1500, Education: 900,
}
const SIZE_MULT: Record<Size, number> = {
  '1–10 employees': 1, '11–50 employees': 4,
  '51–200 employees': 14, '200+ employees': 50,
}

function getAvg(industry: Industry, size: Size): number {
  const key = `${industry}|${size}` as `${Industry}|${Size}`
  return BENCHMARKS[key] ?? Math.round(BASE_AVG[industry] * SIZE_MULT[size])
}

interface Result {
  avg: number
  ratio: number      // spend / avg, e.g. 1.5 = 50% over
  pct: number        // ratio * 100
  diff: number       // pct - 100 (signed, +ve = over)
  grade: 'A' | 'B' | 'C' | 'D'
  gradeLabel: string
  saving: number     // only if overspending
}

function computeResult(spend: number, avg: number): Result {
  const ratio = spend / avg
  const pct = Math.round(ratio * 100)
  const diff = pct - 100

  let grade: Result['grade']
  let gradeLabel: string
  if (diff <= -20) { grade = 'A'; gradeLabel = 'Excellent' }
  else if (diff <= 20) { grade = 'B'; gradeLabel = 'Good' }
  else if (diff < 50) { grade = 'C'; gradeLabel = 'Room to Improve' }
  else { grade = 'D'; gradeLabel = 'High Spend' }

  return {
    avg,
    ratio,
    pct,
    diff,
    grade,
    gradeLabel,
    saving: diff > 0 ? spend - avg : 0,
  }
}

const GRADE_COLOR: Record<Result['grade'], string> = {
  A: '#22c55e', B: '#6366f1', C: '#f59e0b', D: '#ef4444',
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  background: '#0a0a0f',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  padding: '12px 16px',
  color: 'white',
  fontSize: 15,
  outline: 'none',
  cursor: 'pointer',
  boxSizing: 'border-box',
}

export default function BenchmarkPage() {
  const router = useRouter()
  const [spend, setSpend] = useState(5000)
  const [industry, setIndustry] = useState<Industry>('SaaS')
  const [size, setSize] = useState<Size>('11–50 employees')

  useEffect(() => {
    const s = UserContext.get('monthlySpend'); if (s) setSpend(s)
    const i = UserContext.get('industry'); if (i) setIndustry(i)
    const sz = UserContext.get('companySize'); if (sz) setSize(sz)
  }, [])
  useEffect(() => { if (spend > 0) UserContext.save('monthlySpend', spend) }, [spend])
  useEffect(() => { UserContext.save('industry', industry) }, [industry])
  useEffect(() => { UserContext.save('companySize', size) }, [size])

  const result = useMemo<Result>(() => {
    const s = spend > 0 ? spend : 0
    const avg = getAvg(industry, size)
    return computeResult(s, avg)
  }, [spend, industry, size])

  // Gauge: clamp display ratio to 0–200%
  const gaugeValue = Math.min(200, Math.max(0, result.pct))
  const gaugeColor = result.diff <= 0 ? '#22c55e' : result.diff < 30 ? '#f59e0b' : '#ef4444'

  const overOrUnder = result.diff > 0
    ? `${result.diff}% more`
    : `${Math.abs(result.diff)}% less`
  const overOrUnderColor = result.diff > 0 ? '#ef4444' : '#22c55e'

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 20,
            padding: '6px 16px',
            fontSize: 12,
            color: '#818cf8',
            fontWeight: 700,
            marginBottom: 16,
            letterSpacing: 1,
          }}>
            CLOUD SPEND BENCHMARK
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, marginBottom: 12 }}>
            How does your spend compare?
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 16, maxWidth: 460, margin: '0 auto' }}>
            See how your monthly cloud bill stacks up against companies your size in the same industry.
          </p>
        </div>

        {/* Inputs */}
        <div style={{
          background: '#1a1a2e',
          borderRadius: 20,
          padding: '28px',
          border: '1px solid rgba(255,255,255,0.06)',
          marginBottom: 32,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 20,
          }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>
                MONTHLY CLOUD SPEND
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a0a0b0', fontSize: 15, pointerEvents: 'none' }}>$</span>
                <input
                  type="number"
                  value={spend}
                  min={0}
                  onChange={e => setSpend(Number(e.target.value))}
                  style={{ ...selectStyle, paddingLeft: 30, fontSize: 16, fontWeight: 600 }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>
                INDUSTRY
              </label>
              <select value={industry} onChange={e => setIndustry(e.target.value as Industry)} style={selectStyle}>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>
                COMPANY SIZE
              </label>
              <select value={size} onChange={e => setSize(e.target.value as Size)} style={selectStyle}>
                {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Results — always visible, updates live */}
        {spend > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* A — Spending Gauge */}
            <div style={{
              background: '#1a1a2e',
              borderRadius: 20,
              padding: '28px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <p style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>
                SPENDING GAUGE
              </p>
              <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                  You spend{' '}
                  <span style={{ color: overOrUnderColor }}>{overOrUnder}</span>
                  {' '}than similar companies
                </p>
                <p style={{ color: '#555', fontSize: 13 }}>
                  Industry average for {industry} · {size}: <strong style={{ color: '#a0a0b0' }}>${result.avg.toLocaleString()}/month</strong>
                </p>
              </div>

              {/* Gauge track */}
              <div style={{ position: 'relative', marginBottom: 8 }}>
                <div style={{
                  height: 12,
                  borderRadius: 6,
                  background: 'rgba(255,255,255,0.06)',
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${gaugeValue / 2}%`,
                    background: gaugeColor,
                    borderRadius: 6,
                    transition: 'width 0.4s ease, background 0.3s ease',
                  }} />
                </div>
                {/* Average marker at 50% of track */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: -4,
                  width: 2,
                  height: 20,
                  background: 'rgba(255,255,255,0.3)',
                  transform: 'translateX(-50%)',
                }} />
              </div>

              {/* Gauge labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#444' }}>
                <span>$0</span>
                <span style={{ color: '#666' }}>↑ avg ${result.avg.toLocaleString()}</span>
                <span>2× avg</span>
              </div>

              {/* Your spend badge */}
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  background: `rgba(${gaugeColor === '#22c55e' ? '34,197,94' : gaugeColor === '#f59e0b' ? '245,158,11' : '239,68,68'},0.1)`,
                  border: `1px solid rgba(${gaugeColor === '#22c55e' ? '34,197,94' : gaugeColor === '#f59e0b' ? '245,158,11' : '239,68,68'},0.3)`,
                  borderRadius: 10,
                  padding: '10px 18px',
                }}>
                  <span style={{ fontSize: 24, fontWeight: 900, color: gaugeColor }}>
                    {result.pct}%
                  </span>
                  <span style={{ fontSize: 13, color: '#666', marginLeft: 6 }}>of industry average</span>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#555', marginBottom: 2 }}>Your spend</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>${spend.toLocaleString()}/month</div>
                </div>
              </div>
            </div>

            {/* B — Efficiency Score */}
            <div style={{
              background: '#1a1a2e',
              borderRadius: 20,
              padding: '28px',
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              flexWrap: 'wrap',
            }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                background: `rgba(${gradeRgb(result.grade)},0.12)`,
                border: `2px solid rgba(${gradeRgb(result.grade)},0.35)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 40, fontWeight: 900, color: GRADE_COLOR[result.grade], lineHeight: 1 }}>
                  {result.grade}
                </span>
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
                  EFFICIENCY SCORE
                </p>
                <p style={{ fontSize: 22, fontWeight: 800, color: GRADE_COLOR[result.grade], marginBottom: 4 }}>
                  {result.gradeLabel}
                </p>
                <p style={{ color: '#a0a0b0', fontSize: 14, lineHeight: 1.5 }}>
                  {gradeExplainer(result)}
                </p>
              </div>
            </div>

            {/* C — Potential saving (only if overspending) */}
            {result.saving > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(239,68,68,0.05), rgba(239,68,68,0.02))',
                borderRadius: 20,
                padding: '28px',
                border: '1px solid rgba(239,68,68,0.2)',
              }}>
                <p style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
                  POTENTIAL SAVING
                </p>
                <p style={{ fontSize: 16, color: '#a0a0b0', marginBottom: 6 }}>
                  Optimizing to industry average could save you
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 48, fontWeight: 900, color: '#ef4444', lineHeight: 1 }}>
                    ${result.saving.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 18, color: '#666', fontWeight: 600 }}>/month</span>
                </div>
                <p style={{ color: '#666', fontSize: 13 }}>
                  That&apos;s <strong style={{ color: '#ef4444' }}>${(result.saving * 12).toLocaleString()}/year</strong> back in your budget.
                </p>
              </div>
            )}

            {/* CTA */}
            <div style={{
              background: 'linear-gradient(135deg, #1e1b4b, #1a1a2e)',
              borderRadius: 16,
              padding: '24px 28px',
              border: '1px solid rgba(99,102,241,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}>
              <div>
                <div style={{ fontSize: 12, color: '#a0a0b0', marginBottom: 6, letterSpacing: 1 }}>NEXT STEP</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                  See how to reduce your spend
                </h3>
                <p style={{ color: '#a0a0b0', fontSize: 13 }}>
                  Get AI-powered recommendations specific to your {industry} workload.
                </p>
              </div>
              <button
                onClick={() => router.push('/analyze')}
                style={{
                  background: '#6366f1',
                  border: 'none',
                  borderRadius: 12,
                  padding: '13px 28px',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#4f46e5' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#6366f1' }}
              >
                Analyze My Spend →
              </button>
            </div>
          </div>
        )}

        {spend <= 0 && (
          <div style={{
            background: '#1a1a2e',
            borderRadius: 20,
            padding: '48px 28px',
            border: '1px solid rgba(255,255,255,0.06)',
            textAlign: 'center',
          }}>
            <p style={{ color: '#444', fontSize: 15 }}>Enter your monthly spend above to see your benchmark results.</p>
          </div>
        )}

        <p style={{ color: '#333', fontSize: 11, textAlign: 'center', marginTop: 32, lineHeight: 1.6 }}>
          Benchmarks derived from industry surveys, FinOps Foundation reports, and publicly available cloud cost data (2024–2025).
          Figures are averages and will vary by architecture, provider, and geography.
        </p>
      </div>
    </div>
  )
}

function gradeRgb(grade: Result['grade']): string {
  return { A: '34,197,94', B: '99,102,241', C: '245,158,11', D: '239,68,68' }[grade]
}

function gradeExplainer(r: Result): string {
  if (r.grade === 'A') return `You're spending ${Math.abs(r.diff)}% below the industry average. Your cloud spend is well-optimized for your size.`
  if (r.grade === 'B') return `You're within 20% of the industry average. There's some room to optimize, but you're broadly in line with peers.`
  if (r.grade === 'C') return `You're spending ${r.diff}% above average. Right-sizing instances and reserved pricing could close the gap.`
  return `You're spending ${r.diff}% above average — significantly more than peers. A FinOps review could yield major savings.`
}
