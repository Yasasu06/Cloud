'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import DisclaimerBanner from '@/components/DisclaimerBanner'
import { getUserMode, modeInstruction } from '@/lib/userMode'
import NextActionCards from '@/components/NextActionCards'

const EXAMPLES = [
  'Enable Aurora Multi-AZ for production database',
  'Migrate from S3 Standard to S3 Glacier',
  'Add CloudFront CDN to all static assets',
  'Switch from on-demand to reserved instances',
  'Move from ECS Fargate to Lambda functions',
  'Enable VPC Flow Logs in all regions',
]

const SYSTEM_PROMPT = `You are a senior cloud architect giving a concise pre-decision sanity check.
The user is about to make a cloud infrastructure decision. Respond with EXACTLY this structure:

**VERDICT: [DO IT / WAIT / DON'T DO IT]**
One sentence reason for this verdict.

---

**1. Cost Impact**
Specific dollar estimates where possible (monthly, annually). Flag if cost is hard to estimate and why.

**2. Hidden Gotchas**
2–4 bullet points of non-obvious risks, caveats, or surprises most engineers miss. Be direct and specific.

**3. Better Alternatives**
If a better approach exists, name it concisely. If the decision is already optimal, say "No better alternative — this is the right call."

Keep total response under 400 words. Be specific, not generic. Prioritize practical over theoretical.`

type Verdict = 'DO IT' | 'WAIT' | "DON'T DO IT" | null

const VERDICT_META: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  'DO IT':       { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.3)',  icon: '✅' },
  'WAIT':        { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', icon: '⏳' },
  "DON'T DO IT": { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)',  icon: '🚫' },
}

function extractVerdict(text: string): Verdict {
  const m = text.match(/VERDICT:\s*\*?\*?\s*(DO IT|WAIT|DON'T DO IT)/i)
  if (!m) return null
  const v = m[1].toUpperCase()
  if (v === 'DO IT') return 'DO IT'
  if (v === 'WAIT') return 'WAIT'
  return "DON'T DO IT"
}

export default function SanityCheckPage() {
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [response, setResponse] = useState('')
  const [done, setDone]         = useState(false)
  const [verdict, setVerdict]   = useState<Verdict>(null)

  async function runCheck() {
    if (!input.trim() || loading) return
    setLoading(true)
    setResponse('')
    setDone(false)
    setVerdict(null)

    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 700,
          stream: true,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT + modeInstruction(getUserMode()) },
            { role: 'user', content: `I am about to: ${input}` },
          ],
        }),
      })

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      if (reader) {
        while (true) {
          const { done: streamDone, value } = await reader.read()
          if (streamDone) break
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
          for (const line of lines) {
            const data = line.replace('data: ', '')
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              const token = parsed.choices?.[0]?.delta?.content || ''
              fullText += token
              setResponse(fullText)
              const v = extractVerdict(fullText)
              if (v) setVerdict(v)
            } catch { /* partial chunk */ }
          }
        }
      }
      setDone(true)
    } catch {
      setResponse('Analysis failed. Please try again.')
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  const vm = verdict ? VERDICT_META[verdict] : null

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>
            PRE-DECISION CHECK
          </div>
          <h1 style={{ fontSize: 'clamp(26px,5vw,40px)', fontWeight: 900, marginBottom: 12, lineHeight: 1.1 }}>
            Cloud Sanity Check
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 15, maxWidth: 460, margin: '0 auto' }}>
            Describe what you&apos;re about to do. Get cost impact, hidden gotchas, and a final verdict in seconds.
          </p>
        </div>

        {/* Input */}
        <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: 1, display: 'block', marginBottom: 10 }}>
            I AM ABOUT TO…
          </label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) runCheck() }}
            placeholder="e.g. Enable Aurora Multi-AZ for our production database"
            rows={3}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 14, fontWeight: 500,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'white', outline: 'none', resize: 'none', boxSizing: 'border-box',
              fontFamily: 'inherit', lineHeight: 1.5,
            }}
          />

          {/* Examples */}
          <div style={{ marginTop: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#444', letterSpacing: 1, marginBottom: 8 }}>EXAMPLES</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {EXAMPLES.map(ex => (
                <button
                  key={ex}
                  onClick={() => setInput(ex)}
                  style={{
                    fontSize: 12, padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
                    color: '#a0a0b0', transition: 'all 0.1s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'white' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#a0a0b0' }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={runCheck}
            disabled={!input.trim() || loading}
            style={{
              width: '100%', padding: '13px 0', borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: (!input.trim() || loading) ? 'rgba(99,102,241,0.3)' : '#6366f1',
              border: 'none', color: 'white', cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {loading ? '⏳ Analyzing...' : '🔍 Run Sanity Check'}
          </button>
        </div>

        {/* Verdict badge — shown as soon as verdict is streamed */}
        {vm && verdict && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '18px 24px', borderRadius: 16,
            background: vm.bg, border: `1px solid ${vm.border}`, marginBottom: 20,
          }}>
            <span style={{ fontSize: 32 }}>{vm.icon}</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: vm.color, letterSpacing: 1 }}>VERDICT</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: vm.color }}>{verdict}</div>
            </div>
          </div>
        )}

        {/* Streaming response */}
        {response && <DisclaimerBanner />}
        {response && (
          <div className="glass-card" style={{ padding: 28 }}>
            <div style={{
              fontSize: 14, lineHeight: 1.75, color: '#d0d0e0',
            }}>
              <ReactMarkdown
                components={{
                  h2: ({ children }) => <h2 style={{ fontSize: 16, fontWeight: 700, color: 'white', margin: '20px 0 8px' }}>{children}</h2>,
                  strong: ({ children }) => <strong style={{ color: 'white', fontWeight: 700 }}>{children}</strong>,
                  p: ({ children }) => <p style={{ margin: '0 0 12px', color: '#c0c0d0' }}>{children}</p>,
                  ul: ({ children }) => <ul style={{ paddingLeft: 20, margin: '0 0 12px' }}>{children}</ul>,
                  li: ({ children }) => <li style={{ margin: '4px 0', color: '#a0a0b0' }}>{children}</li>,
                  hr: () => <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '16px 0' }} />,
                }}
              >
                {response}
              </ReactMarkdown>
              {loading && <span style={{ display: 'inline-block', width: 8, height: 16, background: '#818cf8', borderRadius: 2, marginLeft: 2, animation: 'pulse 1s infinite' }} />}
            </div>
          </div>
        )}

        {/* Next Action cards */}
        {done && (
          <NextActionCards actions={[
            { icon: '📊', title: 'See Outcome Path',  desc: '12-week visual journey', href: '/outcome-simulator' },
            { icon: '💰', title: 'Calculate ROI',      desc: 'Estimate financial impact', href: '/roi-calculator' },
            { icon: '📝', title: 'Document Decision',  desc: 'Save reasoning + review',   href: '/track-results' },
          ]} />
        )}

        {/* Related tools after done */}
        {done && (
          <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { label: '💰 See Savings Calculator', href: '/optimize?tab=savings' },
              { label: '🏗️ Visualize Architecture', href: '/architecture' },
              { label: '🔍 Full AI Analysis', href: '/analyze' },
            ].map(t => (
              <a key={t.href} href={t.href} style={{
                padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none',
                border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.08)',
                color: '#818cf8', transition: 'all 0.1s',
              }}>
                {t.label}
              </a>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
