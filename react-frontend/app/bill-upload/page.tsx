'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const BILL_PROMPT = `You are a FinOps expert analyzing a cloud bill.
Identify: 1) What each major charge is in plain English
2) Top 3 items to cut immediately with dollar savings
3) Total estimated monthly saving
4) One action to take this week
Be specific. Write for a non-technical founder.`

type Tab = 'paste' | 'csv'

export default function BillUploadPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('paste')
  const [billText, setBillText] = useState('')
  const [csvContent, setCsvContent] = useState('')
  const [fileName, setFileName] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => setCsvContent(ev.target?.result as string)
    reader.readAsText(file)
  }

  async function analyze() {
    const content = tab === 'paste' ? billText : csvContent
    if (!content.trim() || loading) return

    setLoading(true)
    setResponse('')

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1500,
          stream: true,
          messages: [
            { role: 'system', content: BILL_PROMPT },
            { role: 'user', content: `Here is my cloud bill:\n\n${content}` },
          ],
        }),
      })

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
            const json = JSON.parse(data)
            const token = json.choices?.[0]?.delta?.content
            if (token) {
              full += token
              setResponse(full)
            }
          } catch {
            // partial chunk
          }
        }
      }
    } catch {
      setResponse('Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const hasContent = tab === 'paste' ? billText.trim().length > 0 : csvContent.length > 0

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '96px 24px 48px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
            Bill Analyzer
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 16 }}>
            Paste or upload your cloud bill and get a plain-English breakdown with
            specific savings actions.
          </p>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: 'flex',
            background: '#1a1a2e',
            borderRadius: 12,
            padding: 4,
            marginBottom: 24,
            border: '1px solid #ffffff0d',
          }}
        >
          {(['paste', 'csv'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 9,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14,
                transition: 'all 0.2s',
                background: tab === t ? '#6366f1' : 'transparent',
                color: tab === t ? 'white' : '#a0a0b0',
              }}
            >
              {t === 'paste' ? '📋  Paste Bill Text' : '📂  Upload CSV'}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div style={{ marginBottom: 20 }}>
          {tab === 'paste' ? (
            <textarea
              value={billText}
              onChange={(e) => setBillText(e.target.value)}
              placeholder={`Paste your cloud bill here — AWS Cost Explorer export, Azure invoice text, GCP billing report, or just describe your charges line by line.\n\nExample:\nEC2 instances: $3,200\nRDS: $890\nData Transfer: $1,100\nS3: $240\nNAT Gateway: $680`}
              style={{
                width: '100%',
                minHeight: 240,
                background: '#1a1a2e',
                border: '1px solid #ffffff15',
                borderRadius: 12,
                padding: '16px',
                color: 'white',
                fontSize: 14,
                lineHeight: 1.6,
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                background: '#1a1a2e',
                border: `2px dashed ${csvContent ? '#6366f1' : '#ffffff20'}`,
                borderRadius: 12,
                padding: '48px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>
                {csvContent ? '✅' : '📂'}
              </div>
              <p style={{ color: csvContent ? '#22c55e' : '#a0a0b0', fontSize: 15, marginBottom: 4 }}>
                {csvContent
                  ? fileName
                  : 'Click to upload CSV'}
              </p>
              <p style={{ color: '#666', fontSize: 13 }}>
                {csvContent
                  ? `${csvContent.split('\n').length} rows loaded`
                  : 'Supports AWS Cost Explorer CSV, Azure billing CSV, GCP billing export'}
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleCsvUpload}
                style={{ display: 'none' }}
              />
            </div>
          )}
        </div>

        <button
          onClick={analyze}
          disabled={!hasContent || loading}
          style={{
            width: '100%',
            padding: '14px 0',
            background: '#6366f1',
            border: 'none',
            borderRadius: 12,
            color: 'white',
            fontWeight: 700,
            fontSize: 16,
            cursor: hasContent && !loading ? 'pointer' : 'not-allowed',
            opacity: hasContent && !loading ? 1 : 0.5,
            transition: 'opacity 0.2s',
          }}
        >
          {loading ? 'Analyzing…' : 'Analyze My Bill →'}
        </button>

        {/* Response */}
        {response && (
          <div
            style={{
              marginTop: 32,
              background: '#1a1a2e',
              borderRadius: 16,
              padding: '28px 32px',
              border: '1px solid #ffffff0d',
              lineHeight: 1.7,
              fontSize: 15,
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => (
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#6366f1', marginTop: 24, marginBottom: 8 }}>
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 6 }}>
                    {children}
                  </h3>
                ),
                strong: ({ children }) => (
                  <strong style={{ color: '#f0f0ff' }}>{children}</strong>
                ),
                ul: ({ children }) => (
                  <ul style={{ paddingLeft: 20, marginBottom: 12 }}>{children}</ul>
                ),
                li: ({ children }) => (
                  <li style={{ color: '#d0d0e0', marginBottom: 6 }}>{children}</li>
                ),
                p: ({ children }) => (
                  <p style={{ color: '#c0c0d0', marginBottom: 12 }}>{children}</p>
                ),
              }}
            >
              {response}
            </ReactMarkdown>
            {loading && (
              <span style={{ color: '#6366f1', animation: 'pulse 1s infinite' }}>▍</span>
            )}
          </div>
        )}

        {response && !loading && (
          <div style={{ marginTop: 32 }}>
            <p style={{ color: '#666', fontSize: 13, marginBottom: 12, letterSpacing: 1 }}>WHAT&apos;S NEXT</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn-secondary" onClick={() => router.push('/report-card')}>📊 Grade My Setup</button>
              <button className="btn-secondary" onClick={() => router.push('/chat')}>💬 Ask AI Questions</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
