'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STEPS = [
  { num: '01', title: 'Connect your cloud account', desc: 'Securely link your AWS, Azure, or GCP account. Read-only access. We never touch your infrastructure.', icon: '🔗' },
  { num: '02', title: 'We find your waste',          desc: 'Our AI scans every service, identifies idle resources, and produces a detailed waste report with exact dollar amounts.', icon: '🔍' },
  { num: '03', title: 'Pay only on savings',         desc: 'We take 15% of the savings we find. You keep 85%. If we find nothing, you pay nothing. Zero risk.', icon: '💰' },
]

const COMPARE = [
  { label: 'Upfront cost',         consultant: '$200–400/hr', subscription: '$49–499/mo', ours: '$0' },
  { label: 'Risk',                 consultant: 'High',        subscription: 'Medium',     ours: 'None' },
  { label: 'Savings guarantee',    consultant: 'None',        subscription: 'None',       ours: 'Yes — or free' },
  { label: 'Time to first result', consultant: '2–4 weeks',   subscription: 'DIY',        ours: '< 24 hours' },
  { label: 'Ongoing optimization', consultant: 'Extra cost',  subscription: 'Manual',     ours: 'Included' },
  { label: 'Who does the work',    consultant: 'You + them',  subscription: 'You',        ours: 'Us' },
]

const FAQS = [
  { q: 'How do you verify the savings are real?',           a: 'We pull your cloud billing data before and after implementing recommendations. Savings are measured against your 30-day baseline — no estimates, no projections.' },
  { q: 'What if I already have a cloud consultant?',        a: 'We complement them. Our AI spots waste that humans often miss (idle Lambda functions, oversized RDS, forgotten dev snapshots). Most teams find 20–35% additional savings on top of what their consultant found.' },
  { q: 'What happens after the first optimization?',        a: 'We keep running in the background. Cloud bills drift up over time as teams spin up new resources. We alert you monthly when new waste accumulates — same 15% fee, only on new savings.' },
]

interface Props { embedded?: boolean }

export default function PerformancePricingTool({ embedded = false }: Props) {
  const router = useRouter()
  const [spend, setSpend] = useState(10000)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const waste = Math.round(spend * 0.28)
  const fee = Math.round(waste * 0.15)
  const net = waste - fee

  async function handleCTA() {
    if (!email.trim()) {
      // In embedded mode, don't yank the user out of the hub — open auth in new tab
      if (embedded) { window.open('/auth', '_blank'); return }
      router.push('/auth')
      return
    }
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'welcome', email }),
      })
    } catch (_e) { /* silent */ }
    setSubmitted(true)
  }

  const inner = (
    <>
      {!embedded && (
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ display: 'inline-block', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#22c55e', fontWeight: 700, marginBottom: 20, letterSpacing: 1 }}>
            PERFORMANCE PRICING
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20 }}>
            Pay nothing until<br />
            <span style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              we save you money
            </span>
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 17, maxWidth: 520, margin: '0 auto 32px' }}>
            We find your cloud waste. You keep 85% of the savings. We keep 15%. If we find nothing, you pay nothing.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['$0 upfront', 'No contracts', 'Results in 24 hours'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#a0a0b0' }}>
                <span style={{ color: '#22c55e', fontSize: 16 }}>✓</span>
                {t}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 72 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 32, textAlign: 'center' }}>How it works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {STEPS.map((step, i) => (
            <div key={i} className="glass-card" style={{ padding: '28px 24px', position: 'relative' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#22c55e', letterSpacing: 2, marginBottom: 12 }}>{step.num}</div>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{step.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 8 }}>{step.title}</div>
              <p style={{ fontSize: 13, color: '#a0a0b0', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 20, padding: '36px 40px', marginBottom: 72 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Calculate your savings</h2>
        <p style={{ color: '#666', fontSize: 14, marginBottom: 28 }}>Based on industry average — 28% of cloud spend is waste.</p>

        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <label htmlFor="pp-spend" style={{ fontSize: 13, color: '#a0a0b0', fontWeight: 600 }}>Monthly cloud spend</label>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>${spend.toLocaleString()}</span>
          </div>
          <input id="pp-spend" type="range" min={1000} max={100000} step={1000} value={spend} onChange={e => setSpend(Number(e.target.value))} style={{ width: '100%', accentColor: '#22c55e', cursor: 'pointer' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#555', marginTop: 4 }}>
            <span>$1K</span><span>$100K</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          {[
            { label: 'Waste we find', value: `$${waste.toLocaleString()}`, sub: '28% of spend',     color: '#ef4444' },
            { label: 'Our fee (15%)', value: `$${fee.toLocaleString()}`,   sub: 'of savings only', color: '#f59e0b' },
            { label: 'Your net saving', value: `$${net.toLocaleString()}`, sub: 'per month',       color: '#22c55e' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 14, padding: '20px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>{s.label.toUpperCase()}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, color: '#444', marginTop: 16, textAlign: 'center' }}>
          Industry average. Actual savings vary. Most teams save 20–40% of monthly spend.
        </p>
      </div>

      <div style={{ marginBottom: 72 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>How we compare</h2>
        <p style={{ color: '#666', fontSize: 14, textAlign: 'center', marginBottom: 28 }}>Performance pricing vs the alternatives</p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
            <thead>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#555', fontSize: 12, fontWeight: 700, letterSpacing: 1, borderBottom: '1px solid rgba(255,255,255,0.08)' }}></th>
                {['Cloud Consultant', 'Flat Subscription', 'Cloud Intelligence'].map((h, i) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'center', color: i === 2 ? '#22c55e' : '#a0a0b0', fontSize: 13, fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.08)', background: i === 2 ? 'rgba(34,197,94,0.05)' : 'transparent' }}>
                    {i === 2 && <span style={{ display: 'block', fontSize: 10, letterSpacing: 1, marginBottom: 2 }}>★ BEST VALUE</span>}
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row, i) => (
                <tr key={row.label} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#a0a0b0', fontWeight: 600 }}>{row.label}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, color: '#666' }}>{row.consultant}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, color: '#666' }}>{row.subscription}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, color: '#22c55e', fontWeight: 700, background: 'rgba(34,197,94,0.04)' }}>{row.ours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginBottom: 72 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 28, textAlign: 'center' }}>Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((faq, i) => (
            <div key={i} className="glass-card" style={{ padding: '20px 24px', cursor: 'pointer' }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{faq.q}</div>
                <span style={{ color: '#555', fontSize: 18, flexShrink: 0, transition: 'transform 0.15s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
              </div>
              {openFaq === i && (
                <p style={{ color: '#a0a0b0', fontSize: 13, lineHeight: 1.7, marginTop: 12, marginBottom: 0 }}>{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(22,163,74,0.05))', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 20, padding: '48px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🚀</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>Ready to start saving?</h2>
        <p style={{ color: '#a0a0b0', fontSize: 15, marginBottom: 28, maxWidth: 420, margin: '0 auto 28px' }}>
          Enter your email and we&apos;ll reach out to connect your cloud account and run your first scan — free.
        </p>

        {submitted ? (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 14, padding: '18px 24px', display: 'inline-block' }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>✓</div>
            <div style={{ color: '#22c55e', fontWeight: 700 }}>We&apos;ll be in touch within 2 hours.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, maxWidth: 440, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
            <label htmlFor="pp-email" style={{ position: 'absolute', left: -9999 }}>Email</label>
            <input id="pp-email" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCTA()}
              style={{ flex: 1, minWidth: 200, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '13px 18px', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
            />
            <button onClick={handleCTA} style={{ background: '#22c55e', border: 'none', borderRadius: 12, padding: '13px 24px', color: 'white', fontWeight: 800, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#16a34a' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#22c55e' }}
            >
              Start for Free →
            </button>
          </div>
        )}

        <p style={{ color: '#444', fontSize: 12, marginTop: 16 }}>No credit card. No contract. Cancel anytime.</p>
      </div>
    </>
  )

  if (embedded) return <div>{inner}</div>
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px 80px' }}>{inner}</div>
    </div>
  )
}
