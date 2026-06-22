'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { parseBill, buildAnalysisPrompt, NO_CSV_PROVIDERS, type ParsedBill } from '@/lib/billParsers'

// CSV parsing + multi-provider detection lives in lib/billParsers.ts.

// ─── component ───────────────────────────────────────────────────────────────

type Tab = 'paste' | 'csv'

export default function BillUploadPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('csv')
  const [billText, setBillText] = useState('')
  const [csvRaw, setCsvRaw] = useState('')
  const [fileName, setFileName] = useState('')
  const [parsed, setParsed] = useState<ParsedBill | null>(null)
  const [parseError, setParseError] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setParsed(null)
    setParseError('')
    setResponse('')
    const reader = new FileReader()
    reader.onload = (ev) => {
      const raw = ev.target?.result as string
      setCsvRaw(raw)
      try {
        setParsed(parseBill(raw))
      } catch (err) {
        setParseError(err instanceof Error ? err.message : 'Could not parse this CSV.')
      }
    }
    reader.readAsText(file)
  }

  async function analyze() {
    // CSV tab requires a successfully-parsed bill — never send raw CSV blindly.
    if (tab === 'csv' && !parsed) {
      setParseError('Upload a billing CSV we can read before analyzing, or switch to the Paste tab.')
      return
    }
    const content = tab === 'paste' ? billText : buildAnalysisPrompt(parsed!)

    if (!content.trim() || loading) return
    setLoading(true)
    setResponse('')

    try {
      // Calls the server route — the Groq API key never touches the browser.
      const res = await fetch('/api/analyze-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (!res.ok) {
        const info = await res.json().catch(() => ({}))
        setResponse(`⚠️ ${info.error || 'Analysis failed. Please try again.'}`)
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let full = ''
      if (!reader) throw new Error('No stream')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const token = JSON.parse(data).choices?.[0]?.delta?.content
            if (token) { full += token; setResponse(full) }
          } catch { /* partial chunk */ }
        }
      }
      if (!full) setResponse('⚠️ The analyzer returned no content. Please try again.')
    } catch {
      setResponse('⚠️ Analysis failed — could not reach the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const hasContent = tab === 'paste' ? billText.trim().length > 0 : csvRaw.length > 0

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '96px 24px 64px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-block', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#f59e0b', fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>
            BILL ANALYZER
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 900, marginBottom: 12 }}>
            Understand your cloud bill instantly
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 16 }}>
            Upload any AWS, Azure, GCP, DigitalOcean or Oracle billing CSV for a detailed breakdown and plain-English analysis.
          </p>
        </div>

        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', fontSize: 12, color: '#a0a0b0' }}>
          💡 <strong style={{ color: 'white', fontWeight: 600 }}>No CSV file?</strong> Try{' '}
          <a href="/analyze" style={{ color: '#818cf8' }}>/analyze</a> with just your spend amount instead.
        </div>

        {/* Multi-provider instructions banner */}
        <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, padding: '16px 20px', marginBottom: 28, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>📋</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', marginBottom: 6 }}>
              We auto-detect AWS, Azure, GCP, DigitalOcean &amp; Oracle billing CSVs
            </p>
            <p style={{ fontSize: 13, color: '#a0a0b0', lineHeight: 1.7, margin: 0 }}>
              <strong style={{ color: '#e0e0e0' }}>AWS</strong>: Cost Explorer → Download CSV, or a Cost &amp; Usage Report (CUR). &nbsp;
              <strong style={{ color: '#e0e0e0' }}>Azure</strong>: Cost Management → Exports. &nbsp;
              <strong style={{ color: '#e0e0e0' }}>GCP</strong>: Billing → Cost table → Download CSV. &nbsp;
              <strong style={{ color: '#e0e0e0' }}>DigitalOcean</strong>: Billing → CSV. &nbsp;
              <strong style={{ color: '#e0e0e0' }}>Oracle</strong>: Cost &amp; Usage Report.
              <br />
              <span style={{ color: '#777' }}>
                {NO_CSV_PROVIDERS.join(', ')} don&apos;t offer a granular CSV export — for those, use the{' '}
                <strong style={{ color: '#a0a0b0' }}>Paste Bill Text</strong> tab.
              </span>
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', background: '#1a1a2e', borderRadius: 12, padding: 4, marginBottom: 24, border: '1px solid #ffffff0d' }}>
          {(['csv', 'paste'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '10px 0', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'all 0.2s', background: tab === t ? '#6366f1' : 'transparent', color: tab === t ? 'white' : '#a0a0b0' }}>
              {t === 'csv' ? '📂  Upload CSV' : '📋  Paste Bill Text'}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div style={{ marginBottom: 20 }}>
          {tab === 'csv' ? (
            <div>
              <div
                onClick={() => fileRef.current?.click()}
                style={{ background: '#1a1a2e', border: `2px dashed ${parsed ? '#22c55e' : parseError ? '#ef4444' : '#ffffff20'}`, borderRadius: 12, padding: '40px 24px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>
                  {parsed ? '✅' : parseError ? '❌' : '📂'}
                </div>
                <p style={{ color: parsed ? '#22c55e' : parseError ? '#f87171' : '#a0a0b0', fontSize: 15, marginBottom: 4, fontWeight: parsed ? 600 : 400 }}>
                  {parsed ? fileName : parseError ? parseError : 'Click to upload your cloud billing CSV'}
                </p>
                <p style={{ color: '#555', fontSize: 12 }}>
                  {parsed
                    ? `${parsed.rows.length.toLocaleString()} line items · ${parsed.byService.length} services · ${parsed.dateRange}`
                    : 'AWS · Azure · GCP · DigitalOcean · Oracle — auto-detected'}
                </p>
                <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleCsvUpload} style={{ display: 'none' }} />
              </div>

              {/* Detection banner + transparent parse summary */}
              {parsed && (
                <div style={{ marginTop: 16, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 12, padding: '14px 18px' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#22c55e', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span>✅ Detected {parsed.summary.provider} bill — {loading ? 'analyzing…' : 'ready to analyze'}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: 0.5, padding: '2px 8px', borderRadius: 6,
                      color: parsed.summary.confidence === 'high' ? '#22c55e' : parsed.summary.confidence === 'medium' ? '#f59e0b' : '#f87171',
                      background: parsed.summary.confidence === 'high' ? 'rgba(34,197,94,0.12)' : parsed.summary.confidence === 'medium' ? 'rgba(245,158,11,0.12)' : 'rgba(248,113,113,0.12)',
                    }}>
                      {parsed.summary.confidence.toUpperCase()} CONFIDENCE
                    </span>
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px 20px', fontSize: 12, color: '#a0a0b0' }}>
                    <span>📊 <strong style={{ color: '#e0e0e0' }}>{parsed.summary.rowsParsed.toLocaleString()}</strong> rows parsed</span>
                    <span>⏭️ <strong style={{ color: '#e0e0e0' }}>{parsed.summary.rowsSkipped.toLocaleString()}</strong> rows skipped (zero/empty)</span>
                    <span>🧩 <strong style={{ color: '#e0e0e0' }}>{parsed.summary.servicesFound}</strong> services found</span>
                    <span>📅 <strong style={{ color: '#e0e0e0' }}>{parsed.dateRange}</strong></span>
                    <span>💵 cost column: <strong style={{ color: '#e0e0e0' }}>{parsed.summary.costColumn}</strong></span>
                    <span>💱 currency: <strong style={{ color: '#e0e0e0' }}>{parsed.summary.currency}</strong></span>
                  </div>
                  {parsed.summary.confidence === 'low' && (
                    <p style={{ fontSize: 11, color: '#f59e0b', marginTop: 10, marginBottom: 0 }}>
                      ⚠️ Low confidence — we couldn&apos;t match a known provider signature, so we used a generic cost/service mapping. Double-check the totals below.
                    </p>
                  )}
                </div>
              )}

              {/* Parsed breakdown table */}
              {parsed && (
                <div style={{ marginTop: 24 }}>
                  {/* Summary cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
                    <div className="glass-card" style={{ padding: '16px 20px' }}>
                      <p style={{ fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>TOTAL BILL</p>
                      <p style={{ fontSize: 24, fontWeight: 900, color: '#f59e0b' }}>${parsed.grandTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="glass-card" style={{ padding: '16px 20px' }}>
                      <p style={{ fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>SERVICES</p>
                      <p style={{ fontSize: 24, fontWeight: 900, color: 'white' }}>{parsed.byService.length}</p>
                    </div>
                    <div className="glass-card" style={{ padding: '16px 20px' }}>
                      <p style={{ fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>LINE ITEMS</p>
                      <p style={{ fontSize: 24, fontWeight: 900, color: 'white' }}>{parsed.rows.length.toLocaleString()}</p>
                    </div>
                    <div className="glass-card" style={{ padding: '16px 20px' }}>
                      <p style={{ fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>TOP DRIVER</p>
                      <p style={{ fontSize: 14, fontWeight: 800, color: '#ef4444', lineHeight: 1.3 }}>{parsed.byService[0]?.service ?? '—'}</p>
                    </div>
                  </div>

                  {/* Breakdown table */}
                  <div style={{ background: '#111118', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: '1fr 120px 90px', gap: 8 }}>
                      <span style={{ fontSize: 11, color: '#444', fontWeight: 700, letterSpacing: 1 }}>SERVICE</span>
                      <span style={{ fontSize: 11, color: '#444', fontWeight: 700, letterSpacing: 1, textAlign: 'right' }}>TOTAL COST</span>
                      <span style={{ fontSize: 11, color: '#444', fontWeight: 700, letterSpacing: 1, textAlign: 'right' }}>% OF BILL</span>
                    </div>
                    {parsed.byService.slice(0, 15).map((row, i) => {
                      const isTopDriver = i < 3
                      return (
                        <div
                          key={row.service}
                          style={{
                            padding: '12px 20px',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            display: 'grid',
                            gridTemplateColumns: '1fr 120px 90px',
                            gap: 8,
                            alignItems: 'center',
                            background: isTopDriver ? 'rgba(239,68,68,0.04)' : 'transparent',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {isTopDriver && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.12)', padding: '2px 7px', borderRadius: 5, flexShrink: 0 }}>
                                TOP {i + 1}
                              </span>
                            )}
                            <span style={{ fontSize: 13, color: isTopDriver ? '#fff' : '#d0d0e0', fontWeight: isTopDriver ? 700 : 400 }}>
                              {row.service}
                            </span>
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 700, color: isTopDriver ? '#ef4444' : '#e0e0e0', textAlign: 'right' }}>
                            ${row.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </span>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: 13, color: '#666' }}>{row.pct.toFixed(1)}%</span>
                            <div style={{ marginTop: 4, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{ width: `${Math.min(100, row.pct)}%`, height: '100%', background: isTopDriver ? '#ef4444' : '#6366f1', borderRadius: 2 }} />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {parsed.byService.length > 15 && (
                      <div style={{ padding: '10px 20px', textAlign: 'center' }}>
                        <span style={{ fontSize: 12, color: '#444' }}>+{parsed.byService.length - 15} more services</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <textarea
              value={billText}
              onChange={e => setBillText(e.target.value)}
              placeholder={`Paste your cloud bill here — AWS Cost Explorer export, Azure invoice, or line items.\n\nExample:\nEC2 instances: $3,200\nRDS: $890\nData Transfer: $1,100\nS3: $240\nNAT Gateway: $680`}
              style={{ width: '100%', minHeight: 240, background: '#1a1a2e', border: '1px solid #ffffff15', borderRadius: 12, padding: '16px', color: 'white', fontSize: 14, lineHeight: 1.6, resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          )}
        </div>

        <button
          onClick={analyze}
          disabled={!hasContent || loading}
          style={{ width: '100%', padding: '14px 0', background: '#6366f1', border: 'none', borderRadius: 12, color: 'white', fontWeight: 700, fontSize: 16, cursor: hasContent && !loading ? 'pointer' : 'not-allowed', opacity: hasContent && !loading ? 1 : 0.5, transition: 'opacity 0.2s' }}
        >
          {loading ? 'Analyzing…' : parsed ? `Analyze $${parsed.grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} Bill →` : 'Analyze My Bill →'}
        </button>

        {/* AI Response */}
        {response && (
          <div style={{ marginTop: 32, background: '#1a1a2e', borderRadius: 16, padding: '28px 32px', border: '1px solid #ffffff0d', lineHeight: 1.7, fontSize: 15 }}>
            <p style={{ fontSize: 11, color: '#6366f1', fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>AI ANALYSIS</p>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => <h2 style={{ fontSize: 18, fontWeight: 700, color: '#6366f1', marginTop: 24, marginBottom: 8 }}>{children}</h2>,
                h3: ({ children }) => <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 6 }}>{children}</h3>,
                strong: ({ children }) => <strong style={{ color: '#f0f0ff' }}>{children}</strong>,
                ul: ({ children }) => <ul style={{ paddingLeft: 20, marginBottom: 12 }}>{children}</ul>,
                li: ({ children }) => <li style={{ color: '#d0d0e0', marginBottom: 6 }}>{children}</li>,
                p: ({ children }) => <p style={{ color: '#c0c0d0', marginBottom: 12 }}>{children}</p>,
              }}
            >
              {response}
            </ReactMarkdown>
            {loading && <span style={{ color: '#6366f1' }}>▍</span>}
          </div>
        )}

        {response && !loading && (
          <div style={{ marginTop: 32 }}>
            <p style={{ color: '#666', fontSize: 13, marginBottom: 12, letterSpacing: 1 }}>WHAT&apos;S NEXT</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn-secondary" onClick={() => router.push('/report-card')}>📊 Grade My Setup</button>
              <button className="btn-secondary" onClick={() => router.push('/optimize?tab=savings')}>💰 Savings Calculator</button>
              <button className="btn-secondary" onClick={() => router.push('/chat')}>💬 Ask AI Questions</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
