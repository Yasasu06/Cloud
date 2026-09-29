'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const PROVIDERS = ['AWS', 'Azure', 'GCP'] as const
const THRESHOLDS = [50, 75, 90, 100] as const
type Provider = typeof PROVIDERS[number]
type Threshold = typeof THRESHOLDS[number]

const PROVIDER_COLOR: Record<Provider, string> = {
  AWS:   '#f59e0b',
  Azure: '#0078D4',
  GCP:   '#22c55e',
}

// ─── Per-provider instructions ─────────────────────────────────────────────

function awsSteps(budget: number, threshold: Threshold, email: string) {
  return [
    'Go to AWS Console → Billing & Cost Management → Budgets',
    'Click Create Budget → choose Cost Budget',
    `Set monthly amount: $${budget.toLocaleString()}`,
    `Under Alert thresholds, add ${threshold}% of budgeted amount`,
    `Enter notification email: ${email || 'your@email.com'}`,
    'Click Confirm Budget',
  ]
}

function azureSteps(budget: number, threshold: Threshold, email: string) {
  return [
    'Go to Azure Portal → Cost Management + Billing → Budgets',
    'Click + Add, choose your subscription scope',
    `Set the budget amount to $${budget.toLocaleString()} (monthly reset)`,
    `Under Alert conditions, add ${threshold}% actual threshold`,
    `Create or select an Action Group → add email: ${email || 'your@email.com'}`,
    'Review + Create',
  ]
}

function gcpSteps(budget: number, threshold: Threshold, email: string) {
  return [
    'Go to GCP Console → Billing → Budgets & alerts',
    'Click Create Budget',
    `Set budget type to Specified amount: $${budget.toLocaleString()}`,
    `Under Alert thresholds, set ${threshold}% of budget`,
    'Enable Email alerts → Cloud Billing account administrators',
    `Add ${email || 'your@email.com'} as a billing contact in Account Management`,
  ]
}

const STEPS: Record<Provider, (b: number, t: Threshold, e: string) => string[]> = {
  AWS:   awsSteps,
  Azure: azureSteps,
  GCP:   gcpSteps,
}

// ─── Alert preview cards ────────────────────────────────────────────────────

interface AlertLevel {
  pct: Threshold
  label: string
  color: string
  bg: string
  border: string
  icon: string
  urgency: string
}

const ALERT_LEVELS: AlertLevel[] = [
  { pct: 50,  label: 'Info',     icon: 'ℹ️',  urgency: 'Informational', color: '#6366f1', bg: 'rgba(99,102,241,0.06)',  border: 'rgba(99,102,241,0.2)'  },
  { pct: 75,  label: 'Warning',  icon: '⚠️',  urgency: 'Warning',       color: '#f59e0b', bg: 'rgba(245,158,11,0.06)',  border: 'rgba(245,158,11,0.25)' },
  { pct: 90,  label: 'Urgent',   icon: '🚨',  urgency: 'Urgent',        color: '#ef4444', bg: 'rgba(239,68,68,0.06)',   border: 'rgba(239,68,68,0.25)'  },
  { pct: 100, label: 'Critical', icon: '🔥',  urgency: 'Critical',      color: '#dc2626', bg: 'rgba(220,38,38,0.1)',    border: 'rgba(220,38,38,0.35)'  },
]

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

export default function CostAlertsPage() {
  const router = useRouter()
  const [budget, setBudget]       = useState<number | ''>(5000)
  const [threshold, setThreshold] = useState<Threshold>(80 as unknown as Threshold)
  const [provider, setProvider]   = useState<Provider>('AWS')
  const [email, setEmail]         = useState('')
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [saveError, setSaveError] = useState('')

  // Snap threshold to nearest valid value
  const snapThreshold = (v: number): Threshold => {
    const closest = THRESHOLDS.reduce((a, b) =>
      Math.abs(b - v) < Math.abs(a - v) ? b : a
    )
    return closest
  }

  const activeThreshold: Threshold = THRESHOLDS.includes(threshold as Threshold)
    ? threshold as Threshold
    : 75

  const budgetNum = budget === '' ? 0 : budget
  const steps = useMemo(
    () => STEPS[provider](budgetNum, activeThreshold, email),
    [provider, budgetNum, activeThreshold, email]
  )

  const visibleAlerts = ALERT_LEVELS.filter(l => l.pct >= activeThreshold)

  async function saveBudget() {
    if (!budgetNum || saving) return
    setSaving(true)
    setSaveError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }
      const { data: updated, error } = await supabase
        .from('profiles')
        .update({ monthly_budget: budgetNum })
        .eq('id', session.user.id)
        .select('id')
        .maybeSingle()
      if (error || !updated) throw error ?? new Error('Budget was not saved.')
      setSaved(true)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Save failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const color = PROVIDER_COLOR[provider]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-block', background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20,
            padding: '6px 16px', fontSize: 12, color: '#f87171',
            fontWeight: 700, marginBottom: 16, letterSpacing: 1,
          }}>
            COST ALERTS
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, marginBottom: 12 }}>
            Set up billing alerts with your provider
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 16, maxWidth: 460, margin: '0 auto' }}>
            Enter your budget for guided steps to set up
            billing alerts in your cloud provider&apos;s console.
          </p>
        </div>

        {/* Step 1 — Inputs */}
        <div style={{ background: '#1a1a2e', borderRadius: 20, padding: '28px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 20 }}>
            STEP 1 — YOUR BUDGET
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>

            {/* Budget */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>
                MONTHLY BUDGET
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a0a0b0', fontSize: 15, pointerEvents: 'none' }}>$</span>
                <input
                  type="number"
                  value={budget}
                  min={1}
                  onChange={e => setBudget(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                  style={{ ...selectStyle, paddingLeft: 30, fontSize: 16, fontWeight: 600, fontFamily: 'inherit' }}
                />
              </div>
            </div>

            {/* Threshold */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>
                ALERT THRESHOLD
              </label>
              <select
                value={activeThreshold}
                onChange={e => setThreshold(Number(e.target.value) as Threshold)}
                style={selectStyle}
              >
                {THRESHOLDS.map(t => (
                  <option key={t} value={t}>{t}% of budget</option>
                ))}
              </select>
            </div>

            {/* Provider */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>
                CLOUD PROVIDER
              </label>
              <select value={provider} onChange={e => setProvider(e.target.value as Provider)} style={selectStyle}>
                {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>
                ALERT EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                style={{ ...selectStyle, fontFamily: 'inherit' }}
              />
            </div>
          </div>
        </div>

        {/* Step 2 — Instructions */}
        {budgetNum > 0 && (
          <div style={{
            background: `rgba(${provRgb(provider)},0.05)`,
            border: `1px solid rgba(${provRgb(provider)},0.2)`,
            borderRadius: 20,
            padding: '28px',
            marginBottom: 28,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: color, background: `rgba(${provRgb(provider)},0.12)`, padding: '3px 10px', borderRadius: 6, letterSpacing: 0.5 }}>
                STEP 2 — {provider.toUpperCase()} SETUP INSTRUCTIONS
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{
                    fontSize: 12, fontWeight: 800, color: color,
                    background: `rgba(${provRgb(provider)},0.15)`,
                    borderRadius: 6, padding: '2px 8px', flexShrink: 0, marginTop: 1,
                    minWidth: 24, textAlign: 'center',
                  }}>
                    {i + 1}
                  </span>
                  <p style={{
                    fontSize: 14, color: '#d0d0e0', lineHeight: 1.6, margin: 0,
                    fontFamily: step.includes('$') || step.includes('@') ? 'monospace' : 'inherit',
                  }}>
                    {/* Highlight dynamic values */}
                    {step.split(/([$]\d[\d,]*|[\w.+-]+@[\w.+-]+\.\w+|\d+%)/).map((part, j) =>
                      /^[$\d]/.test(part) || /@/.test(part) || /\d+%/.test(part)
                        ? <strong key={j} style={{ color: color }}>{part}</strong>
                        : part
                    )}
                  </p>
                </div>
              ))}
            </div>

            {/* Copy-to-clipboard budget hint */}
            <div style={{
              marginTop: 20, background: 'rgba(255,255,255,0.03)',
              borderRadius: 10, padding: '12px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            }}>
              <span style={{ fontSize: 13, color: '#555' }}>
                Budget amount to enter:
              </span>
              <code style={{ fontSize: 15, fontWeight: 700, color: color, background: `rgba(${provRgb(provider)},0.1)`, padding: '4px 12px', borderRadius: 6 }}>
                ${budgetNum.toLocaleString()}
              </code>
            </div>
          </div>
        )}

        {/* Step 3 — Alert preview */}
        {budgetNum > 0 && (
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 16 }}>
              STEP 3 — SAMPLE ALERT PREVIEW
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ALERT_LEVELS.map(level => {
                const spendAtLevel = Math.round(budgetNum * level.pct / 100)
                const isActive = level.pct >= activeThreshold
                return (
                  <div
                    key={level.pct}
                    style={{
                      background: isActive ? level.bg : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isActive ? level.border : 'rgba(255,255,255,0.04)'}`,
                      borderRadius: 12,
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 14,
                      opacity: isActive ? 1 : 0.35,
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{level.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? level.color : '#444', letterSpacing: 0.5 }}>
                          {level.urgency.toUpperCase()} · {level.pct}%
                        </span>
                      </div>
                      <p style={{ fontSize: 14, color: isActive ? '#e0e0e0' : '#333', margin: 0, lineHeight: 1.5 }}>
                        {level.pct < 100
                          ? <>You&apos;ve spent <strong style={{ color: isActive ? level.color : '#444' }}>${spendAtLevel.toLocaleString()}</strong> of your <strong>${budgetNum.toLocaleString()}</strong> monthly budget ({level.pct}%)</>
                          : <>⚡ Budget limit reached — you&apos;ve spent <strong style={{ color: level.color }}>${budgetNum.toLocaleString()}</strong>. Review your usage now.</>
                        }
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 4 — Save to Supabase */}
        {budgetNum > 0 && (
          <div style={{
            background: '#1a1a2e', borderRadius: 20, padding: '24px 28px',
            border: '1px solid rgba(255,255,255,0.06)', marginBottom: 28,
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 12 }}>
              STEP 4 — SAVE YOUR BUDGET
            </p>
            <p style={{ fontSize: 14, color: '#a0a0b0', marginBottom: 16 }}>
              Save your <strong style={{ color: 'white' }}>${budgetNum.toLocaleString()}/month</strong> budget to your account. The app does not send automatic billing alerts; configure those in your provider console.
            </p>

            {saved ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', padding: '6px 14px', borderRadius: 8 }}>
                  ✓ Budget saved — ${budgetNum.toLocaleString()}/month
                </span>
              </div>
            ) : (
              <>
                <button
                  onClick={saveBudget}
                  disabled={saving}
                  style={{
                    background: '#6366f1', border: 'none', borderRadius: 10,
                    padding: '11px 26px', color: 'white', fontWeight: 700, fontSize: 14,
                    cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#4f46e5' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#6366f1' }}
                >
                  {saving ? 'Saving…' : 'Save Budget →'}
                </button>
                {saveError && <p style={{ fontSize: 13, color: '#f87171', marginTop: 10 }}>{saveError}</p>}
              </>
            )}
          </div>
        )}

        {/* CTA */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b, #1a1a2e)', borderRadius: 16,
          padding: '24px 28px', border: '1px solid rgba(99,102,241,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 12, color: '#a0a0b0', marginBottom: 6, letterSpacing: 1 }}>ONCE ALERTS ARE SET UP</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Analyze your current spending</h3>
            <p style={{ color: '#a0a0b0', fontSize: 13 }}>
              Find out where your budget is going and what to cut first.
            </p>
          </div>
          <button
            onClick={() => router.push('/analyze')}
            style={{
              background: '#6366f1', border: 'none', borderRadius: 12,
              padding: '13px 28px', color: 'white', fontWeight: 700, fontSize: 15,
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#4f46e5' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#6366f1' }}
          >
            Analyze My Spending →
          </button>
        </div>

        <p style={{ color: '#333', fontSize: 11, textAlign: 'center', marginTop: 28, lineHeight: 1.6 }}>
          Billing alerts are configured directly in your cloud provider&apos;s console — we never access your account.
          Verify the current setup steps in your provider&apos;s documentation.
        </p>

      </div>
    </div>
  )
}

function provRgb(p: Provider): string {
  return { AWS: '245,158,11', Azure: '0,120,212', GCP: '34,197,94' }[p]
}
