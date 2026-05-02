'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

const PROVIDERS = ['AWS', 'Azure', 'GCP', 'Multi-Cloud'] as const

export default function WhiteLabelPage() {
  const [yourCompany, setYourCompany] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientSpend, setClientSpend] = useState('')
  const [clientProvider, setClientProvider] = useState<string>('AWS')
  const [notes, setNotes] = useState('')
  const [report, setReport] = useState('')
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)

  const canGenerate = yourCompany.trim() && clientName.trim() && clientSpend.trim()

  async function generate() {
    if (!canGenerate) return
    setGenerating(true)
    setReport('')
    setDone(false)

    const prompt = `You are a senior cloud consultant at ${yourCompany}. Generate a professional cloud analysis report for client ${clientName}.

Details:
- Client: ${clientName}
- Cloud Provider: ${clientProvider}
- Monthly Spend: $${clientSpend}/month
- Consultant Notes: ${notes || 'None provided'}

Generate a professional consulting report with:
1. Executive Summary (2-3 paragraphs)
2. Current State Assessment
3. Cost Optimization Opportunities (with specific dollar amounts based on $${clientSpend}/month spend)
4. Security & Compliance Observations
5. Recommended 90-Day Roadmap (with prioritized action items)
6. Investment Summary

Use ${clientProvider} service names. Be specific with dollar amounts. Write in a professional consulting tone.`

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      })

      if (!res.ok || !res.body) throw new Error('Stream failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let text = ''

      while (true) {
        const { done: streamDone, value } = await reader.read()
        if (streamDone) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue
            try {
              const delta = JSON.parse(data).choices?.[0]?.delta?.content ?? ''
              text += delta
              setReport(text)
            } catch (_e) {}
          }
        }
      }
      setDone(true)
    } catch (_e) {
      setReport('Failed to generate report. Please try again.')
      setDone(true)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.4 } 50% { opacity: 1 } }
        @media print {
          nav, .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-area { padding: 20px !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
        <div className="print-area" style={{ maxWidth: 860, margin: '0 auto', padding: '100px 24px 80px' }}>

          {/* Header */}
          <div style={{ marginBottom: 40 }} className="no-print">
            <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 14, letterSpacing: 1 }}>
              WHITE LABEL
            </div>
            <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, marginBottom: 10 }}>
              Branded Client Report Generator
            </h1>
            <p style={{ color: '#a0a0b0', fontSize: 15, maxWidth: 520 }}>
              Generate professional cloud consulting reports branded with your company name.
            </p>
          </div>

          {/* Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }} className="no-print">
            {/* Your company */}
            <div style={{ background: '#1a1a2e', borderRadius: 14, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 16 }}>YOUR FIRM</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>COMPANY NAME *</label>
                  <input
                    value={yourCompany}
                    onChange={e => setYourCompany(e.target.value)}
                    placeholder="Acme Cloud Consulting"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>LOGO URL (OPTIONAL)</label>
                  <input
                    value={logoUrl}
                    onChange={e => setLogoUrl(e.target.value)}
                    placeholder="https://yourcompany.com/logo.png"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Client info */}
            <div style={{ background: '#1a1a2e', borderRadius: 14, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 16 }}>CLIENT INFO</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>CLIENT COMPANY *</label>
                  <input
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="Client Corp"
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>MONTHLY SPEND *</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#555' }}>$</span>
                      <input
                        type="number"
                        value={clientSpend}
                        onChange={e => setClientSpend(e.target.value)}
                        placeholder="10000"
                        style={{ ...inputStyle, paddingLeft: 24 }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>PROVIDER</label>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {PROVIDERS.map(p => (
                        <button
                          key={p}
                          onClick={() => setClientProvider(p)}
                          style={{ background: clientProvider === p ? '#6366f1' : '#0a0a0f', border: `1px solid ${clientProvider === p ? '#6366f1' : 'rgba(255,255,255,0.1)'}`, borderRadius: 7, padding: '7px 10px', color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div style={{ background: '#1a1a2e', borderRadius: 14, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.06)', gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 10 }}>ANALYSIS NOTES</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Key observations, pain points, client goals, existing issues..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              />
            </div>
          </div>

          {/* Generate button */}
          <div style={{ marginBottom: 32 }} className="no-print">
            <button
              onClick={generate}
              disabled={!canGenerate || generating}
              style={{ background: canGenerate && !generating ? '#6366f1' : '#333', border: 'none', borderRadius: 12, padding: '14px 32px', color: 'white', fontWeight: 700, fontSize: 15, cursor: canGenerate && !generating ? 'pointer' : 'not-allowed', transition: 'background 0.15s' }}
            >
              {generating ? 'Generating Report…' : '✦ Generate Client Report →'}
            </button>
          </div>

          {/* Loading skeleton */}
          {generating && !report && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: 'rgba(99,102,241,0.08)', borderRadius: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', animation: 'pulse 1s infinite', flexShrink: 0 }} />
                <span style={{ color: '#a0a0b0', fontSize: 14 }}>AI is analyzing your situation...</span>
                <span style={{ color: '#555', fontSize: 12, marginLeft: 'auto', whiteSpace: 'nowrap' }}>Usually takes 15–30 seconds</span>
              </div>
              {[85, 70, 90, 60, 75, 50, 80].map((w, i) => (
                <div key={i} style={{ height: 16, background: 'rgba(255,255,255,0.07)', borderRadius: 8, width: `${w}%`, animation: 'pulse 1.5s infinite', animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          )}

          {/* Report output */}
          {report && (
            <div>
              {/* Branded header (shown in print too) */}
              <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '16px 16px 0 0', padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
                {logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Logo" style={{ height: 40, borderRadius: 6, objectFit: 'contain' }} />
                )}
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>
                    {yourCompany || 'Your Company'} Cloud Analysis
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
                    Prepared for {clientName} · {clientProvider} · ${Number(clientSpend).toLocaleString()}/month
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }} className="no-print">
                  <button
                    onClick={generate}
                    style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '7px 14px', color: 'white', cursor: 'pointer', fontSize: 12 }}
                  >
                    ↺ Regenerate
                  </button>
                  <button
                    onClick={() => window.print()}
                    style={{ background: 'white', border: 'none', borderRadius: 8, padding: '7px 16px', color: '#6366f1', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}
                  >
                    🖨 Export PDF
                  </button>
                </div>
              </div>

              <div className="glass-card" style={{ borderRadius: '0 0 16px 16px', padding: '28px 32px', lineHeight: 1.7, borderTop: 'none' }}>
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
                  }}
                >
                  {report}
                </ReactMarkdown>
                {generating && <span style={{ display: 'inline-block', width: 2, height: 14, background: '#6366f1', marginLeft: 2, verticalAlign: 'text-bottom' }} />}
              </div>

              {done && (
                <p style={{ fontSize: 12, color: '#444', marginTop: 12, textAlign: 'center' }} className="no-print">
                  AI-generated analysis. Review before sharing with clients.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0a0a0f',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  padding: '11px 14px',
  color: 'white',
  fontSize: 14,
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}
