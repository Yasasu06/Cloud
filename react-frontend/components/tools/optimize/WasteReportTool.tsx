'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { supabase } from '@/lib/supabase'

interface Profile {
  provider?: string
  monthly_spend?: number
  industry?: string
  plan?: string
}

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`
  return `$${Math.round(n).toLocaleString()}`
}

interface Props { embedded?: boolean }

export default function WasteReportTool({ embedded = false }: Props) {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [report, setReport] = useState('')
  const [done, setDone] = useState(false)
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // In embedded mode, don't hard-redirect — show a sign-in prompt
        if (embedded) { setProfile({}); setLoading(false); return }
        router.replace('/auth')
        return
      }
      const { data } = await supabase
        .from('profiles')
        .select('provider, monthly_spend, industry, plan')
        .eq('id', session.user.id)
        .single()
      setProfile(data ?? {})
      setLoading(false)
    }
    load()
  }, [router, embedded])

  async function generate() {
    setGenerating(true)
    setReport('')
    setDone(false)

    const provider = profile?.provider ?? 'AWS'
    const spend = profile?.monthly_spend ?? 5000
    const industry = profile?.industry ?? 'SaaS'

    const prompt = `Generate an estimated cloud optimization report for:
Provider: ${provider}
Monthly spend: $${spend}/month
Industry: ${industry}

Format as a professional waste report with:
1. Executive Summary
2. Top 5 possible optimization opportunities with estimated dollar ranges
3. Quick Win Actions (this week)
4. Medium Term Optimizations (this month)
5. Strategic Recommendations (this quarter)

Use ${provider} service names. Label all savings as hypotheses; no resource utilization or configuration has been inspected.`

    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', stream: true, max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }] }),
      })

      if (!res.ok || !res.body) throw new Error('Stream failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let text = ''

      while (true) {
        const { done: streamDone, value } = await reader.read()
        if (streamDone) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices?.[0]?.delta?.content ?? ''
              text += delta
              setReport(text)
            } catch (_e) { /* partial chunk */ }
          }
        }
      }
      setDone(true)
      setLastGenerated(new Date())
    } catch (_e) {
      setReport('Failed to generate report. Please try again.')
      setDone(true)
    } finally {
      setGenerating(false)
    }
  }

  function handlePrint() { window.print() }

  async function emailReport() {
    setSendingEmail(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('Please sign in to email your report')
        return
      }
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          type: 'waste_report',
          email: session.user.email,
          userName: session.user.email?.split('@')[0] ?? 'there',
          wasteAmount: Math.round(spend * 0.28),
          items: [
            `Idle ${provider} compute instances — ${fmt(spend * 0.10)}/month`,
            `Unused storage snapshots — ${fmt(spend * 0.07)}/month`,
            `Over-provisioned database — ${fmt(spend * 0.06)}/month`,
          ],
        }),
      })
      if (!response.ok) throw new Error('Email request failed')
      setEmailSent(true)
    } catch (_e) {
      alert('Failed to send email. Please try again.')
    } finally {
      setSendingEmail(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, color: '#a0a0b0' }}>
        Loading…
      </div>
    )
  }

  const spend = profile?.monthly_spend ?? 5000
  const provider = profile?.provider ?? 'AWS'

  const inner = (
    <>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.4 } 50% { opacity: 1 } }
        @media print {
          nav, .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-area { padding: 20px !important; max-width: 100% !important; }
          .glass-card { border: 1px solid #ddd !important; background: white !important; }
        }
      `}</style>

      {!embedded && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'inline-block', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#f87171', fontWeight: 700, marginBottom: 14, letterSpacing: 1 }}>
            WASTE REPORT
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, marginBottom: 10 }}>
            Estimated Cloud Opportunities
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 15, maxWidth: 520 }}>
            Model-generated suggestions based on entered spend and profile details. No cloud resources or utilization data are inspected.
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
        {[
          { label: 'PROVIDER',       value: provider },
          { label: 'MONTHLY SPEND',  value: fmt(spend) },
          { label: 'INDUSTRY',       value: profile?.industry ?? 'SaaS' },
          { label: '28% SCENARIO OPPORTUNITY', value: fmt(spend * 0.28), color: '#ef4444' },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color ?? 'white' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {!report && !generating && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <p style={{ color: '#666', fontSize: 15, marginBottom: 24 }}>
            Generate hypothetical recommendations based on your cloud profile.
          </p>
          <button onClick={generate} style={{ background: '#ef4444', border: 'none', borderRadius: 12, padding: '14px 32px', color: 'white', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
            Generate Estimated Report →
          </button>
        </div>
      )}

      {generating && !report && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: 'rgba(239,68,68,0.08)', borderRadius: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite', flexShrink: 0 }} />
            <span style={{ color: '#a0a0b0', fontSize: 14 }}>Generating suggestions from your entered information...</span>
            <span style={{ color: '#555', fontSize: 12, marginLeft: 'auto', whiteSpace: 'nowrap' }}>Usually takes 15–30 seconds</span>
          </div>
          {[90, 75, 85, 60, 70, 50, 80, 65].map((w, i) => (
            <div key={i} style={{ height: 16, background: 'rgba(255,255,255,0.07)', borderRadius: 8, width: `${w}%`, animation: 'pulse 1.5s infinite', animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      )}

      {report && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }} className="no-print">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: done ? '#22c55e' : '#ef4444', animation: done ? 'none' : 'pulse 1s infinite' }} />
              <span style={{ color: '#a0a0b0', fontSize: 13 }}>
                {done ? (lastGenerated ? `Generated ${lastGenerated.toLocaleTimeString()}` : 'Report ready') : 'Generating…'}
              </span>
            </div>
            {done && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={generate} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 14px', color: '#a0a0b0', cursor: 'pointer', fontSize: 13 }}>
                  ↺ Regenerate
                </button>
                <button onClick={handlePrint} style={{ background: '#6366f1', border: 'none', borderRadius: 8, padding: '7px 16px', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                  🖨 Download PDF
                </button>
                <button onClick={emailReport} disabled={sendingEmail || emailSent} style={{ background: emailSent ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${emailSent ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, padding: '7px 14px', color: emailSent ? '#22c55e' : '#a0a0b0', cursor: sendingEmail || emailSent ? 'not-allowed' : 'pointer', fontSize: 13, opacity: sendingEmail ? 0.6 : 1 }}>
                  {emailSent ? '✓ Sent to email' : sendingEmail ? 'Sending…' : '📧 Email Report'}
                </button>
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: '28px 32px', lineHeight: 1.7 }}>
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 12, marginTop: 0 }}>{children}</h1>,
                h2: ({ children }) => <h2 style={{ fontSize: 18, fontWeight: 700, color: '#818cf8', marginBottom: 10, marginTop: 24 }}>{children}</h2>,
                h3: ({ children }) => <h3 style={{ fontSize: 15, fontWeight: 700, color: '#a0a0b0', marginBottom: 8, marginTop: 16 }}>{children}</h3>,
                p:  ({ children }) => <p  style={{ color: '#a0a0b0', fontSize: 14, marginBottom: 12 }}>{children}</p>,
                li: ({ children }) => <li style={{ color: '#a0a0b0', fontSize: 14, marginBottom: 6 }}>{children}</li>,
                ul: ({ children }) => <ul style={{ paddingLeft: 20, marginBottom: 12 }}>{children}</ul>,
                ol: ({ children }) => <ol style={{ paddingLeft: 20, marginBottom: 12 }}>{children}</ol>,
                strong: ({ children }) => <strong style={{ color: 'white', fontWeight: 700 }}>{children}</strong>,
                code: ({ children }) => <code style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, padding: '2px 6px', fontSize: 13, fontFamily: 'monospace', color: '#818cf8' }}>{children}</code>,
              }}
            >
              {report}
            </ReactMarkdown>
            {generating && (
              <span style={{ display: 'inline-block', width: 2, height: 14, background: '#ef4444', marginLeft: 2, verticalAlign: 'text-bottom' }} />
            )}
          </div>

          {done && (
            <div style={{ marginTop: 16, padding: '14px 18px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, fontSize: 13, color: '#555' }} className="no-print">
              Estimates based on industry averages for {provider} workloads. Connect your AWS account in the{' '}
              <a href="/dashboard" style={{ color: '#6366f1', textDecoration: 'none' }}>Dashboard</a> for real cost data.
            </div>
          )}
        </div>
      )}
    </>
  )

  if (embedded) return <div>{inner}</div>
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div className="print-area" style={{ maxWidth: 800, margin: '0 auto', padding: '100px 24px 80px' }}>{inner}</div>
    </div>
  )
}
