'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { parseBill, buildAnalysisPrompt, NO_CSV_PROVIDERS, type ParsedBill } from '@/lib/billParsers'
import ToolShell from '@/components/ToolShell'
import { saveAnalysis, loadHistory, migrateAnonToUser, type AnalysisRecord } from '@/lib/billHistory'
import BillHistoryPanel from '@/components/BillHistoryPanel'

// CSV parsing + multi-provider detection lives in lib/billParsers.ts.

// ─── component ───────────────────────────────────────────────────────────────

type Tab = 'paste' | 'csv'

export default function BillUploadPage() {
  const [tab, setTab] = useState<Tab>('csv')
  const [billText, setBillText] = useState('')
  const [csvRaw, setCsvRaw] = useState('')
  const [fileName, setFileName] = useState('')
  const [parsed, setParsed] = useState<ParsedBill | null>(null)
  const [parseError, setParseError] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<AnalysisRecord[]>([])
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Bill analyzer memory: on mount, migrate any anonymous analyses if the
  // visitor is now logged in, then load history (Supabase if logged in, else
  // localStorage).
  useEffect(() => {
    let active = true
    ;(async () => {
      await migrateAnonToUser()
      const h = await loadHistory()
      if (active) setHistory(h)
    })()
    return () => { active = false }
  }, [])

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
    setSaved(false)

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
      if (!full) {
        setResponse('⚠️ The analyzer returned no content. Please try again.')
      } else if (tab === 'csv' && parsed) {
        // Agent memory: persist this analysis, then refresh history + trend.
        try {
          await saveAnalysis(parsed)
          setSaved(true)
          setHistory(await loadHistory())
        } catch { /* non-fatal — the analysis is still shown */ }
      }
    } catch {
      setResponse('⚠️ Analysis failed — could not reach the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const hasContent = tab === 'paste' ? billText.trim().length > 0 : csvRaw.length > 0

  return (
    <ToolShell label="Bill Analyzer">
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 72px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-block', background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.28)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: 'var(--amber)', fontWeight: 700, marginBottom: 18, letterSpacing: 1 }}>
            BILL ANALYZER
          </div>
          <h1 className="serif" style={{ fontSize: 'clamp(34px, 5.5vw, 56px)', marginBottom: 14, lineHeight: 1.05, letterSpacing: '-0.02em', color: 'var(--text)' }}>
            Where is your cloud<br /><span className="shimmer-text">money actually going?</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 17, maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            Upload any AWS, Azure, GCP, DigitalOcean or Oracle billing CSV for a detailed breakdown and a plain-English action plan.
          </p>
        </div>

        {/* Feature 4 — returning-visitor welcome with last-bill recall */}
        {history.length > 0 && !response && (
          <div style={{ marginBottom: 16, padding: '14px 18px', borderRadius: 12, background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.22)' }}>
            <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500, lineHeight: 1.5, margin: 0 }}>
              👋 Welcome back! Your last bill was <strong style={{ color: 'var(--blue)', fontWeight: 700 }}>${history[0].total_amount.toLocaleString()}</strong> on {new Date(history[0].analyzed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}. Let&apos;s see how this month compares.
            </p>
          </div>
        )}

        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>
          💡 <strong style={{ color: 'var(--text)', fontWeight: 600 }}>No CSV file?</strong> Switch to the{' '}
          <strong style={{ color: 'var(--blue)' }}>Paste Bill Text</strong> tab below and paste your line items instead.
        </div>

        {/* Multi-provider instructions banner */}
        <div style={{ background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.2)', borderRadius: 14, padding: '16px 20px', marginBottom: 28, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>📋</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)', marginBottom: 6 }}>
              We auto-detect AWS, Azure, GCP, DigitalOcean &amp; Oracle billing CSVs
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
              <strong style={{ color: 'var(--text)' }}>AWS</strong>: Cost Explorer → Download CSV, or a Cost &amp; Usage Report (CUR). &nbsp;
              <strong style={{ color: 'var(--text)' }}>Azure</strong>: Cost Management → Exports. &nbsp;
              <strong style={{ color: 'var(--text)' }}>GCP</strong>: Billing → Cost table → Download CSV. &nbsp;
              <strong style={{ color: 'var(--text)' }}>DigitalOcean</strong>: Billing → CSV. &nbsp;
              <strong style={{ color: 'var(--text)' }}>Oracle</strong>: Cost &amp; Usage Report.
              <br />
              <span style={{ color: 'var(--text-faint)' }}>
                {NO_CSV_PROVIDERS.join(', ')} don&apos;t offer a granular CSV export — for those, use the{' '}
                <strong style={{ color: 'var(--text-muted)' }}>Paste Bill Text</strong> tab.
              </span>
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', background: '#F4F4F0', borderRadius: 12, padding: 4, marginBottom: 24, border: '1px solid var(--border)' }}>
          {(['csv', 'paste'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '10px 0', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'all 0.2s', background: tab === t ? 'var(--blue)' : 'transparent', color: tab === t ? 'white' : 'var(--text-muted)' }}>
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
                style={{ background: 'var(--surface)', border: `2px dashed ${parsed ? 'var(--green)' : parseError ? 'var(--red)' : '#D5D5CE'}`, borderRadius: 12, padding: '40px 24px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>
                  {parsed ? '✅' : parseError ? '❌' : '📂'}
                </div>
                <p style={{ color: parsed ? 'var(--green)' : parseError ? 'var(--red)' : 'var(--text-muted)', fontSize: 15, marginBottom: 4, fontWeight: parsed ? 600 : 400 }}>
                  {parsed ? fileName : parseError ? parseError : 'Click to upload your cloud billing CSV'}
                </p>
                <p style={{ color: 'var(--text-faint)', fontSize: 12 }}>
                  {parsed
                    ? `${parsed.rows.length.toLocaleString()} line items · ${parsed.byService.length} services · ${parsed.dateRange}`
                    : 'AWS · Azure · GCP · DigitalOcean · Oracle — auto-detected'}
                </p>
                <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleCsvUpload} style={{ display: 'none' }} />
              </div>

              {/* Detection banner + transparent parse summary */}
              {parsed && (
                <div style={{ marginTop: 16, background: 'rgba(22,163,74,0.05)', border: '1px solid rgba(22,163,74,0.25)', borderRadius: 12, padding: '14px 18px' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span>✅ Detected {parsed.summary.provider} bill — {loading ? 'analyzing…' : 'ready to analyze'}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: 0.5, padding: '2px 8px', borderRadius: 6,
                      color: parsed.summary.confidence === 'high' ? 'var(--green)' : parsed.summary.confidence === 'medium' ? 'var(--amber)' : 'var(--red)',
                      background: parsed.summary.confidence === 'high' ? 'rgba(22,163,74,0.1)' : parsed.summary.confidence === 'medium' ? 'rgba(217,119,6,0.1)' : 'rgba(220,38,38,0.1)',
                    }}>
                      {parsed.summary.confidence.toUpperCase()} CONFIDENCE
                    </span>
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px 20px', fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>📊 <strong style={{ color: 'var(--text)' }}>{parsed.summary.rowsParsed.toLocaleString()}</strong> rows parsed</span>
                    <span>⏭️ <strong style={{ color: 'var(--text)' }}>{parsed.summary.rowsSkipped.toLocaleString()}</strong> rows skipped (zero/empty)</span>
                    <span>🧩 <strong style={{ color: 'var(--text)' }}>{parsed.summary.servicesFound}</strong> services found</span>
                    <span>📅 <strong style={{ color: 'var(--text)' }}>{parsed.dateRange}</strong></span>
                    <span>💵 cost column: <strong style={{ color: 'var(--text)' }}>{parsed.summary.costColumn}</strong></span>
                    <span>💱 currency: <strong style={{ color: 'var(--text)' }}>{parsed.summary.currency}</strong></span>
                  </div>
                  {parsed.summary.confidence === 'low' && (
                    <p style={{ fontSize: 11, color: 'var(--amber)', marginTop: 10, marginBottom: 0 }}>
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
                    <div className="edi-card" style={{ padding: '16px 20px' }}>
                      <p style={{ fontSize: 10, color: 'var(--text-faint)', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>TOTAL BILL</p>
                      <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>${parsed.grandTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="edi-card" style={{ padding: '16px 20px' }}>
                      <p style={{ fontSize: 10, color: 'var(--text-faint)', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>SERVICES</p>
                      <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{parsed.byService.length}</p>
                    </div>
                    <div className="edi-card" style={{ padding: '16px 20px' }}>
                      <p style={{ fontSize: 10, color: 'var(--text-faint)', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>LINE ITEMS</p>
                      <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{parsed.rows.length.toLocaleString()}</p>
                    </div>
                    <div className="edi-card" style={{ padding: '16px 20px' }}>
                      <p style={{ fontSize: 10, color: 'var(--text-faint)', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>TOP DRIVER</p>
                      <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--red)', lineHeight: 1.3 }}>{parsed.byService[0]?.service ?? '—'}</p>
                    </div>
                  </div>

                  {/* Breakdown table */}
                  <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 120px 90px', gap: 8 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 700, letterSpacing: 1 }}>SERVICE</span>
                      <span style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 700, letterSpacing: 1, textAlign: 'right' }}>TOTAL COST</span>
                      <span style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 700, letterSpacing: 1, textAlign: 'right' }}>% OF BILL</span>
                    </div>
                    {parsed.byService.slice(0, 15).map((row, i) => {
                      const isTopDriver = i < 3
                      return (
                        <div
                          key={row.service}
                          style={{
                            padding: '12px 20px',
                            borderBottom: '1px solid var(--border)',
                            display: 'grid',
                            gridTemplateColumns: '1fr 120px 90px',
                            gap: 8,
                            alignItems: 'center',
                            background: isTopDriver ? 'rgba(220,38,38,0.03)' : 'transparent',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {isTopDriver && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--red)', background: 'rgba(220,38,38,0.1)', padding: '2px 7px', borderRadius: 5, flexShrink: 0 }}>
                                TOP {i + 1}
                              </span>
                            )}
                            <span style={{ fontSize: 13, color: isTopDriver ? 'var(--text)' : '#3A3A3A', fontWeight: isTopDriver ? 700 : 400 }}>
                              {row.service}
                            </span>
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 700, color: isTopDriver ? 'var(--red)' : 'var(--text)', textAlign: 'right' }}>
                            ${row.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </span>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{row.pct.toFixed(1)}%</span>
                            <div style={{ marginTop: 4, height: 3, background: '#EFEFEA', borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{ width: `${Math.min(100, row.pct)}%`, height: '100%', background: isTopDriver ? 'var(--red)' : 'var(--blue)', borderRadius: 2 }} />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {parsed.byService.length > 15 && (
                      <div style={{ padding: '10px 20px', textAlign: 'center' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>+{parsed.byService.length - 15} more services</span>
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
              style={{ width: '100%', minHeight: 240, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px', color: 'var(--text)', fontSize: 14, lineHeight: 1.6, resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          )}
        </div>

        <button
          onClick={analyze}
          disabled={!hasContent || loading}
          className="btn-gradient"
          style={{ width: '100%', padding: '15px 0', fontSize: 16 }}
        >
          {loading ? 'Analyzing…' : parsed ? `Analyze $${parsed.grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} Bill →` : 'Analyze My Bill →'}
        </button>

        {/* AI Response */}
        {response && (
          <div style={{ marginTop: 28, background: 'var(--surface)', borderRadius: 16, padding: '28px 32px', border: '1px solid var(--border)', lineHeight: 1.7, fontSize: 15 }}>
            <p style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>AI ANALYSIS</p>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => <h2 className="serif" style={{ fontSize: 20, color: 'var(--text)', marginTop: 24, marginBottom: 8 }}>{children}</h2>,
                h3: ({ children }) => <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginTop: 16, marginBottom: 6 }}>{children}</h3>,
                strong: ({ children }) => <strong style={{ color: 'var(--text)', fontWeight: 700 }}>{children}</strong>,
                ul: ({ children }) => <ul style={{ paddingLeft: 20, marginBottom: 12 }}>{children}</ul>,
                li: ({ children }) => <li style={{ color: '#3A3A3A', marginBottom: 6 }}>{children}</li>,
                p: ({ children }) => <p style={{ color: '#333', marginBottom: 12 }}>{children}</p>,
              }}
            >
              {response}
            </ReactMarkdown>
            {loading && <span style={{ color: 'var(--blue)' }}>▍</span>}
          </div>
        )}

        {saved && (
          <div style={{ marginTop: 14, fontSize: 13, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 800 }}>✓</span> Analysis saved to your history
          </div>
        )}

        {response && !loading && (
          <div style={{ marginTop: 24, padding: '14px 18px', borderRadius: 12, background: 'rgba(22,163,74,0.05)', border: '1px solid rgba(22,163,74,0.2)', fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>✅</span>
            <span>Analysis complete. Upload another bill above to compare months — or use <strong style={{ color: 'var(--blue)' }}>← Back to Tools</strong> for the compliance and pricing tools.</span>
          </div>
        )}

        {/* Features 2 & 3 — month-over-month comparison, trend chart, history cards */}
        <BillHistoryPanel history={history} />
      </div>
    </ToolShell>
  )
}
