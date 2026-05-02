'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const PROVIDERS = ['AWS', 'Azure', 'GCP', 'Multiple'] as const
const SPEND_RANGES = [
  'Under $500/month',
  '$500–$2,000/month',
  '$2,000–$10,000/month',
  '$10,000–$50,000/month',
  '$50,000+/month',
] as const

type Provider = typeof PROVIDERS[number]
type SpendRange = typeof SPEND_RANGES[number]

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

function DigestPreview() {
  return (
    <div style={{
      background: 'white', borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      maxWidth: 520, margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ background: '#6366f1', padding: '20px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>☁️</div>
          <span style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>Cloud Intelligence</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, margin: 0 }}>Weekly Cost Digest · Monday, 5 May 2026</p>
      </div>

      <div style={{ padding: '24px 28px', color: '#1a1a2e' }}>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16 }}>
          Your weekly cloud intelligence summary — 4 items this week.
        </p>

        <div style={{ background: '#f8f8ff', borderRadius: 12, padding: '16px 18px', marginBottom: 16, borderLeft: '4px solid #6366f1' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', letterSpacing: 1, marginBottom: 6 }}>THIS WEEK&apos;S CLOUD SPEND</p>
          <p style={{ fontSize: 28, fontWeight: 900, color: '#1a1a2e', margin: '0 0 4px' }}>$3,840</p>
          <p style={{ fontSize: 12, color: '#888', margin: 0 }}>↓ 6% vs last week · On track for $15,200 this month</p>
        </div>

        {[
          { icon: '💡', label: 'TOP OPTIMIZATION', color: '#f59e0b', bg: '#fffbeb', title: 'Switch to Reserved Instances',  desc: 'Your 4× m5.large on-demand instances have 90-day steady usage. Committing to 1-year terms saves ~$340/month.', cta: 'See how →' },
          { icon: '📉', label: 'PRICE CHANGE',     color: '#22c55e', bg: '#f0fdf4', title: 'AWS EC2 t3 family dropped 8%',   desc: "Effective March 2026. If you're on t3.medium or t3.large, your next bill will be ~$160 lower automatically.",   cta: 'Full details →' },
          { icon: '⚡', label: 'ACTION ITEM',      color: '#ef4444', bg: '#fef2f2', title: 'Delete 3 idle EBS snapshots',     desc: 'Snapshots from terminated instances in us-east-1 are costing $23/month with zero reads in 60 days.',           cta: 'Clean up →' },
        ].map(item => (
          <div key={item.label} style={{ background: item.bg, borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: item.color, letterSpacing: 1, margin: '0 0 4px' }}>{item.label}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', margin: '0 0 4px' }}>{item.title}</p>
                <p style={{ fontSize: 12, color: '#666', lineHeight: 1.5, margin: '0 0 6px' }}>{item.desc}</p>
                <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.cta}</span>
              </div>
            </div>
          </div>
        ))}

        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, marginTop: 4 }}>
          <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', margin: 0 }}>
            Cloud Intelligence · Vendor neutral · No AWS/Azure/GCP partnerships
            <br />
            <span style={{ color: '#ccc' }}>Unsubscribe · Update preferences</span>
          </p>
        </div>
      </div>
    </div>
  )
}

interface Props { embedded?: boolean }

export default function WeeklyDigestTool({ embedded = false }: Props) {
  const [email, setEmail] = useState('')
  const [provider, setProvider] = useState<Provider>('AWS')
  const [spendRange, setSpendRange] = useState<SpendRange>('$500–$2,000/month')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function subscribe() {
    if (!email.trim() || loading) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { error: dbErr } = await supabase
        .from('email_subscribers')
        .upsert(
          { email: email.trim().toLowerCase(), source: 'weekly-digest', provider, spend_range: spendRange },
          { onConflict: 'email' }
        )
      if (dbErr) throw dbErr
      setSubmitted(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inner = (
    <>
      {!embedded && (
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>
            WEEKLY DIGEST
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 900, marginBottom: 16, lineHeight: 1.1 }}>
            Get Your Weekly<br />
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Cloud Cost Digest
            </span>
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 17, maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
            Every Monday morning — your cloud spending summary, top optimizations,
            and price changes that affect you. <strong style={{ color: 'white' }}>Free.</strong>
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>

        <div>
          {!submitted ? (
            <div style={{ background: '#1a1a2e', borderRadius: 20, padding: '32px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Subscribe — it&apos;s free</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                <div>
                  <label htmlFor="wd-email" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>
                    YOUR EMAIL
                  </label>
                  <input
                    id="wd-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && subscribe()}
                    placeholder="you@company.com"
                    style={{ ...selectStyle, fontFamily: 'inherit' }}
                  />
                </div>

                <div>
                  <label htmlFor="wd-provider" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>
                    CLOUD PROVIDER
                  </label>
                  <select id="wd-provider" value={provider} onChange={e => setProvider(e.target.value as Provider)} style={selectStyle}>
                    {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="wd-spend" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>
                    MONTHLY SPEND RANGE
                  </label>
                  <select id="wd-spend" value={spendRange} onChange={e => setSpendRange(e.target.value as SpendRange)} style={selectStyle}>
                    {SPEND_RANGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {error && <p style={{ fontSize: 13, color: '#f87171', marginBottom: 16 }}>{error}</p>}

              <button
                onClick={subscribe}
                disabled={loading || !email.trim()}
                style={{
                  width: '100%', background: '#6366f1', border: 'none', borderRadius: 12,
                  padding: '14px 0', color: 'white', fontWeight: 700, fontSize: 16,
                  cursor: loading || !email.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !email.trim() ? 0.5 : 1,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!loading && email.trim()) e.currentTarget.style.background = '#4f46e5' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#6366f1' }}
              >
                {loading ? 'Subscribing…' : 'Subscribe — Free →'}
              </button>

              <p style={{ fontSize: 11, color: '#333', textAlign: 'center', marginTop: 14, lineHeight: 1.6 }}>
                No spam. Unsubscribe anytime. Vendor neutral — no AWS/Azure/GCP partnerships.
              </p>
            </div>
          ) : (
            <div style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.03))', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 20, padding: '40px 32px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#22c55e', marginBottom: 8 }}>
                You&apos;re subscribed!
              </h2>
              <p style={{ color: '#a0a0b0', fontSize: 15, lineHeight: 1.6 }}>
                First digest arrives <strong style={{ color: 'white' }}>Monday morning.</strong>
                <br />
                Check your inbox for a confirmation.
              </p>
              <div style={{ marginTop: 24, padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, display: 'inline-block' }}>
                <p style={{ fontSize: 13, color: '#555', margin: 0 }}>
                  Subscribed as <strong style={{ color: '#a0a0b0' }}>{email}</strong> · {provider} · {spendRange}
                </p>
              </div>
            </div>
          )}

          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '📅', text: 'Delivered every Monday at 7am' },
              { icon: '🎯', text: 'Tailored to your provider & spend level' },
              { icon: '⚡', text: 'Actionable — not just data dumps' },
              { icon: '🔒', text: 'No account connection required' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: '#a0a0b0' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontSize: 11, color: '#444', fontWeight: 700, letterSpacing: 1, marginBottom: 16, textAlign: 'center' }}>
            SAMPLE DIGEST
          </p>
          <DigestPreview />
        </div>
      </div>
    </>
  )

  if (embedded) return <div>{inner}</div>
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '100px 24px 80px' }}>{inner}</div>
    </div>
  )
}
