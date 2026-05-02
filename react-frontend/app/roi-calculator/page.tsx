'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { UserContext } from '@/lib/userContext'

// ─── animated counter hook ──────────────────────────────────────────────────
function useAnimatedValue(target: number, duration = 600): number {
  const [displayed, setDisplayed] = useState(target)
  const rafRef = useRef<number | null>(null)
  const prevRef = useRef(target)

  useEffect(() => {
    const from = prevRef.current
    const to = target
    if (from === to) return
    const start = performance.now()
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setDisplayed(Math.round(from + (to - from) * e))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
      else prevRef.current = to
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return displayed
}

// ─── sub-components ─────────────────────────────────────────────────────────
function NumberInput({
  label, value, onChange, prefix, suffix, placeholder,
}: {
  label: string
  value: number | ''
  onChange: (v: number | '') => void
  prefix?: string
  suffix?: string
  placeholder?: string
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {prefix && (
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a0a0b0', fontSize: 15, pointerEvents: 'none' }}>
            {prefix}
          </span>
        )}
        <input
          type="number"
          min={0}
          value={value === '' ? '' : value}
          placeholder={placeholder ?? '0'}
          onChange={e => onChange(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
          style={{
            width: '100%',
            background: '#0a0a0f',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            padding: `12px 16px 12px ${prefix ? '30px' : '16px'}`,
            paddingRight: suffix ? '48px' : '16px',
            color: 'white',
            fontSize: 16,
            fontWeight: 600,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {suffix && (
          <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#555', fontSize: 13, pointerEvents: 'none' }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

interface MetricRowProps {
  label: string
  value: number
  color?: string
  large?: boolean
  prefix?: string
  suffix?: string
  dimmed?: boolean
}

function MetricRow({ label, value, color = '#e0e0e0', large, prefix = '$', suffix, dimmed }: MetricRowProps) {
  const displayed = useAnimatedValue(value)
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ fontSize: 13, color: dimmed ? '#444' : '#a0a0b0' }}>{label}</span>
      <span style={{ fontSize: large ? 22 : 15, fontWeight: large ? 900 : 700, color: dimmed ? '#333' : color }}>
        {prefix}{displayed.toLocaleString()}{suffix}
      </span>
    </div>
  )
}

// ─── main page ───────────────────────────────────────────────────────────────
export default function ROICalculatorPage() {
  const router = useRouter()
  const [spend, setSpend] = useState<number | ''>(5000)
  const [hours, setHours] = useState<number | ''>(20)
  const [rate, setRate] = useState<number | ''>(85)

  useEffect(() => {
    const saved = UserContext.get('monthlySpend'); if (saved) setSpend(saved)
  }, [])
  useEffect(() => { if (typeof spend === 'number' && spend > 0) UserContext.save('monthlySpend', spend) }, [spend])

  const s = spend === '' ? 0 : spend
  const h = hours === '' ? 0 : hours
  const r = rate === '' ? 0 : rate

  // Row 1 — The Problem
  const timeCost   = Math.round(h * r)
  const cloudWaste = Math.round(s * 0.28)
  const totalProblem = timeCost + cloudWaste

  // Row 2 — What we save
  const timeSaved  = Math.round(h * 0.8 * r)
  const wasteElim  = cloudWaste
  const toolCost   = 49
  const netSaving  = Math.max(0, timeSaved + wasteElim - toolCost)

  // Row 3 — ROI
  const roi        = toolCost > 0 ? Math.round(((timeSaved + wasteElim - toolCost) / toolCost) * 100) : 0
  const perDollar  = toolCost > 0 ? ((timeSaved + wasteElim) / toolCost).toFixed(1) : '0'
  const annualSaving = netSaving * 12

  const animRoi          = useAnimatedValue(roi)
  const animNetSaving    = useAnimatedValue(netSaving)
  const animAnnual       = useAnimatedValue(annualSaving)
  const animTotalProblem = useAnimatedValue(totalProblem)

  const hasInputs = s > 0 || h > 0

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 20,
            padding: '6px 16px',
            fontSize: 12,
            color: '#22c55e',
            fontWeight: 700,
            marginBottom: 16,
            letterSpacing: 1,
          }}>
            ROI CALCULATOR
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, marginBottom: 12 }}>
            What is cloud chaos costing you?
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 16, maxWidth: 460, margin: '0 auto' }}>
            Enter your numbers. See the exact return on using Cloud Intelligence to fix it.
          </p>
        </div>

        {/* Inputs */}
        <div className="glass-card" style={{ padding: '28px', marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 20 }}>YOUR NUMBERS</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            <NumberInput label="MONTHLY CLOUD SPEND" value={spend} onChange={setSpend} prefix="$" />
            <NumberInput label="HOURS / MONTH MANAGING CLOUD" value={hours} onChange={setHours} suffix="hrs" />
            <NumberInput label="YOUR ENGINEER HOURLY RATE" value={rate} onChange={setRate} prefix="$" suffix="/hr" />
          </div>
        </div>

        {hasInputs && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Row 1 — The Problem */}
            <div className="glass-card" style={{ padding: '24px 28px', borderTop: '3px solid #ef4444' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 18 }}>🔥</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', letterSpacing: 1 }}>THE PROBLEM</p>
                  <p style={{ fontSize: 12, color: '#444' }}>What cloud chaos costs you right now</p>
                </div>
              </div>
              <MetricRow label="Time cost (managing cloud)" value={timeCost} color="#f87171" />
              <MetricRow label="Cloud waste (28% industry avg)" value={cloudWaste} color="#f87171" />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#e0e0e0' }}>Total monthly problem</span>
                <span style={{ fontSize: 26, fontWeight: 900, color: '#ef4444' }}>
                  ${animTotalProblem.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Row 2 — What we save */}
            <div className="glass-card" style={{ padding: '24px 28px', borderTop: '3px solid #6366f1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 18 }}>⚡</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#818cf8', letterSpacing: 1 }}>WHAT CLOUD INTELLIGENCE SAVES</p>
                  <p style={{ fontSize: 12, color: '#444' }}>At $49/month</p>
                </div>
              </div>
              <MetricRow label="Time saved (80% reduction)" value={timeSaved} color="#818cf8" />
              <MetricRow label="Waste eliminated" value={wasteElim} color="#818cf8" />
              <MetricRow label="Tool cost" value={toolCost} color="#555" dimmed />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#e0e0e0' }}>Net monthly saving</span>
                <span style={{ fontSize: 26, fontWeight: 900, color: '#22c55e' }}>
                  ${animNetSaving.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Row 3 — ROI */}
            <div
              className="glass-card"
              style={{
                padding: '28px',
                borderTop: '3px solid #22c55e',
                background: 'linear-gradient(135deg, rgba(34,197,94,0.05), rgba(34,197,94,0.02))',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <span style={{ fontSize: 18 }}>📈</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#22c55e', letterSpacing: 1 }}>YOUR ROI</p>
                  <p style={{ fontSize: 12, color: '#444' }}>Return on your $49/month investment</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 32, flexWrap: 'wrap', marginBottom: 20 }}>
                {/* Big ROI number */}
                <div>
                  <div style={{ fontSize: 'clamp(56px, 10vw, 88px)', fontWeight: 900, color: '#22c55e', lineHeight: 1 }}>
                    {animRoi.toLocaleString()}%
                  </div>
                  <p style={{ color: '#555', fontSize: 14, marginTop: 6 }}>
                    You make <strong style={{ color: '#22c55e' }}>${perDollar}</strong> for every $1 spent
                  </p>
                </div>

                {/* Annual saving */}
                <div style={{
                  background: 'rgba(34,197,94,0.08)',
                  border: '1px solid rgba(34,197,94,0.2)',
                  borderRadius: 16,
                  padding: '18px 24px',
                  flex: 1,
                  minWidth: 180,
                }}>
                  <p style={{ fontSize: 11, color: '#22c55e', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>ANNUAL SAVING</p>
                  <div style={{ fontSize: 36, fontWeight: 900, color: '#22c55e', lineHeight: 1 }}>
                    ${animAnnual.toLocaleString()}
                  </div>
                  <p style={{ fontSize: 12, color: '#555', marginTop: 6 }}>per year recovered</p>
                </div>
              </div>
            </div>

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
                <div style={{ fontSize: 12, color: '#a0a0b0', marginBottom: 6, letterSpacing: 1 }}>READY TO CAPTURE THIS?</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                  Start saving ${animNetSaving.toLocaleString()}/month
                </h3>
                <p style={{ color: '#a0a0b0', fontSize: 13 }}>
                  $49/month · Cancel anytime · ROI from day one.
                </p>
              </div>
              <button
                onClick={() => router.push('/pricing')}
                style={{
                  background: '#22c55e',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px 28px',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#16a34a' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#22c55e' }}
              >
                Start Saving ${animNetSaving.toLocaleString()}/month →
              </button>
            </div>
          </div>
        )}

        {!hasInputs && (
          <div className="glass-card" style={{ padding: '48px 28px', textAlign: 'center' }}>
            <p style={{ color: '#444', fontSize: 15 }}>Enter your numbers above to see your ROI instantly.</p>
          </div>
        )}

        <p style={{ color: '#333', fontSize: 11, textAlign: 'center', marginTop: 32, lineHeight: 1.6 }}>
          Time savings based on customer-reported averages. Cloud waste figure uses the 28% industry benchmark from the FinOps Foundation 2024 report. Individual results will vary.
        </p>
      </div>
    </div>
  )
}
