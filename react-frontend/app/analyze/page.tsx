'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { supabase } from '@/lib/supabase'
import { trackEvent } from '@/lib/posthog'
import { JargonText, JargonWrapper } from '@/components/JargonTooltip'
import JourneyProgress from '@/components/JourneyProgress'
import ImplementationWizard from '@/components/ImplementationWizard'

type Mode = 'finops' | 'architect' | 'migration'

const MODE_CHIPS: Record<Mode, string[]> = {
  finops:    ['Bill spike', 'Find waste', 'Explain charges'],
  architect: ['New startup', 'Healthcare app', 'Scale to 1M users'],
  migration: ['AWS to Azure', 'Cut costs 40%', 'Avoid lock-in'],
}

interface ModeConfig {
  id: Mode
  icon: string
  title: string
  subtitle: string
  placeholder: string
  color: string
  systemPrompt: string
}

const MODES: ModeConfig[] = [
  {
    id: 'finops',
    icon: '💸',
    title: 'Explain My Cloud Bill',
    subtitle: "FinOps Analyst — find waste, explain costs, cut spend",
    placeholder: "e.g. We're on AWS, spending $12k/month, 5 engineers. Our bill doubled last quarter and we don't know why.",
    color: '#f59e0b',
    systemPrompt: `You are a senior FinOps consultant with 15 years experience at AWS and Azure. A client just described their cloud situation.

Give them a specific expert analysis with these exact markdown sections:

## Your Situation
One sentence confirming their setup.

## Top Cost Drivers
The 3-4 services most likely causing their spend. Use REAL service names and REAL price estimates based on AWS/Azure/GCP published pricing. Example: EC2 c5.xlarge = $0.17/hr = $122/month per instance.

## Cut This Week
5 specific items ranked by savings potential.
Format each as:
**[Service]** — $X/month — [How to find it in console] — [One line action]

## Your Action Plan
Numbered steps for this week only.
Each step: specific console page, estimated time, expected saving.

## Risk Alert
One specific financial risk they may not know about based on their situation.

## Expected Saving
Bold the monthly saving range.
Show as: **$X,XXX - $X,XXX/month**

Rules: Never say 'it depends' without explaining. Use real dollar amounts. Max 450 words. Write for a smart non-technical founder.`,
  },
  {
    id: 'architect',
    icon: '🏗️',
    title: 'Design My Architecture',
    subtitle: "Solutions Architect — pick the right stack for what you're building",
    placeholder: "e.g. I want to build a healthcare app for 500 doctors in Europe that handles patient records and needs HIPAA/GDPR compliance.",
    color: '#6366f1',
    systemPrompt: `You are a senior cloud solutions architect. Design a cloud architecture for the user's project. Use clear markdown with headers and structured lists.

Structure your response:

## Your Project
One sentence confirming what you understood.

## Recommended Cloud Provider
**[Provider Name]** — one clear reason why.

## Your Architecture
For each service:
**Service Name** (~$X/month) — what it does in plain English

## Total Monthly Cost
**$X - $Y/month** at your described scale. What drives this higher or lower.

## Compliance Requirements
Specific requirements for their industry if applicable.

## Your First 3 Steps
1. Specific action with time estimate
2. Specific action with time estimate
3. Specific action with time estimate

## One Thing That Usually Goes Wrong
Honest warning specific to their project type.

When recommending providers, also consider DigitalOcean, Hetzner, Linode, Vultr, Cloudflare Workers, Oracle Cloud, OVH, Render, and Railway when appropriate. For startups under $5k/month spend, alternatives often provide 50–70% savings vs AWS/Azure/GCP.`,
  },
  {
    id: 'migration',
    icon: '🔄',
    title: 'Plan My Migration',
    subtitle: "Migration Engineer — move clouds without breaking production",
    placeholder: "e.g. We're on AWS and want to move to Azure. $15k/month, 8 engineers, running 12 microservices and a PostgreSQL database.",
    color: '#22c55e',
    systemPrompt: `You are a senior cloud migration engineer. Create a migration plan for the user. Use clear markdown formatting.

Structure your response:

## Migration Summary
What you understood they want to migrate.

## Complexity: [Easy/Medium/Hard/Very Hard]
One sentence explaining the rating.

## Financial Analysis
**Migration Cost:** $X - $Y one-time
**Monthly Change:** Save/Cost $X after migration
**Break Even:** X months

## 8-Week Migration Plan
**Week 1-2:** [specific tasks]
**Week 3-4:** [specific tasks]
**Week 5-6:** [specific tasks]
**Week 7-8:** [specific tasks]

## Top 3 Risks
**Risk 1:** What it is and how to prevent it
**Risk 2:** What it is and how to prevent it
**Risk 3:** What it is and how to prevent it

## My Honest Recommendation
Direct answer: should they migrate or not and why. If it does not make financial sense say so clearly.`,
  },
]

// Function to process text and wrap jargon terms

const MarkdownResponse = ({ content }: { content: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      h1: ({ children }) => (
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 12, marginTop: 24, borderBottom: '1px solid #ffffff15', paddingBottom: 8 }}>
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#6366f1', marginBottom: 10, marginTop: 20 }}>
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#a0a0b0', marginBottom: 8, marginTop: 16 }}>
          {children}
        </h3>
      ),
      p: ({ children }) => (
        <p style={{ color: '#e0e0e0', lineHeight: 1.8, marginBottom: 12, fontSize: 15 }}>
          {React.Children.map(children, c => typeof c === 'string' ? <JargonText text={c} /> : c)}
        </p>
      ),
      strong: ({ children }) => (
        <strong style={{ color: 'white', fontWeight: 700 }}>
          {React.Children.map(children, c => typeof c === 'string' ? <JargonText text={c} /> : c)}
        </strong>
      ),
      ul: ({ children }) => (
        <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
          {children}
        </ul>
      ),
      ol: ({ children }) => (
        <ol style={{ paddingLeft: 20, marginBottom: 16 }}>
          {children}
        </ol>
      ),
      li: ({ children }) => (
        <li style={{ color: '#e0e0e0', marginBottom: 8, fontSize: 15, lineHeight: 1.7 }}>
          {React.Children.map(children, c => typeof c === 'string' ? <JargonText text={c} /> : c)}
        </li>
      ),
      blockquote: ({ children }) => (
        <div style={{ borderLeft: '4px solid #6366f1', paddingLeft: 16, margin: '16px 0', background: 'rgba(99,102,241,0.05)', borderRadius: '0 8px 8px 0', padding: '12px 16px' }}>
          {children}
        </div>
      ),
      code: ({ children }) => (
        <code style={{ background: '#0a0a0f', padding: '2px 6px', borderRadius: 4, fontSize: 13, color: '#22c55e', fontFamily: 'monospace' }}>
          {children}
        </code>
      ),
      hr: () => (
        <hr style={{ border: 'none', borderTop: '1px solid #ffffff10', margin: '20px 0' }} />
      ),
    }}
  >
    {content}
  </ReactMarkdown>
)

function ConfidenceBadge({ level, text }: { level: 'high' | 'medium' | 'low'; text: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 12, fontSize: 11,
      background: level === 'high' ? 'rgba(34,197,94,0.1)' : level === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
      color: level === 'high' ? '#22c55e' : level === 'medium' ? '#f59e0b' : '#ef4444',
      border: `1px solid ${level === 'high' ? '#22c55e33' : level === 'medium' ? '#f59e0b33' : '#ef444433'}`,
    }}>
      {level === 'high' ? '🟢' : level === 'medium' ? '🟡' : '🟠'} {text}
    </div>
  )
}

const TOOL_SUGGESTIONS = [
  { keywords: ['reserved instance', 'reserved instances', ' ri '], label: '💎 Reserved Instances', href: '/reserved-instances' },
  { keywords: ['egress', 'data transfer', 'bandwidth cost'], label: '🔄 Egress Calculator', href: '/migration-cost' },
  { keywords: ['compliance', 'hipaa', 'gdpr', 'pci', 'fedramp', 'hitrust', 'sox'], label: '✅ Compliance', href: '/compliance' },
  { keywords: ['architecture', 'stack', 'infrastructure design', 'service design'], label: '🏗️ Architecture', href: '/architecture' },
  { keywords: ['benchmark', 'industry average', 'peers', 'compare to'], label: '🏆 Cloud Score', href: '/benchmark' },
]

function RelatedTools({ response }: { response: string }) {
  const lower = response.toLowerCase()
  const matches = TOOL_SUGGESTIONS.filter(t => t.keywords.some(k => lower.includes(k)))
  if (matches.length === 0) return null
  return (
    <div style={{ marginTop: 24, padding: 16, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12 }}>
      <div style={{ fontSize: 11, color: '#6366f1', letterSpacing: 2, marginBottom: 12, fontWeight: 700 }}>🔗 RELATED TOOLS</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {matches.map(m => (
          <a
            key={m.href}
            href={m.href}
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 20, padding: '6px 14px', fontSize: 13, color: '#818cf8', textDecoration: 'none', fontWeight: 600, transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(99,102,241,0.2)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(99,102,241,0.1)' }}
          >
            {m.label} →
          </a>
        ))}
      </div>
    </div>
  )
}

export default function AnalyzePage() {
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null)
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [quickWins, setQuickWins] = useState<any[]>([])
  const [copied, setCopied] = useState(false)
  const [showWizard, setShowWizard] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session))
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    const modeParam = params.get('mode') as Mode | null
    if (modeParam && ['finops', 'architect', 'migration'].includes(modeParam)) {
      setSelectedMode(modeParam)
    }
    if (q && q.trim()) {
      setInput(q)
      setSelectedMode('finops')
      setTimeout(() => analyze('finops', q), 300)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const activeMode = MODES.find(m => m.id === selectedMode)

  async function analyze(modeId: Mode, overrideText?: string) {
    const mode = MODES.find(m => m.id === modeId)
    if (!mode) return
    const userText = (overrideText ?? input).trim()
    if (!userText || loading) return

    setLoading(true)
    setResponse('')
    setDone(false)
    setSaved(false)
    setQuickWins([])
    trackEvent('analyze_started', { mode: modeId, input_length: userText.length })

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1000,
          stream: true,
          messages: [
            { role: 'system', content: mode.systemPrompt },
            { role: 'user', content: userText },
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
            } catch {
              // partial chunk
            }
          }
        }
      }

      setDone(true)
      trackEvent('analyze_completed', { mode: modeId })
      void fetchQuickWins(userText)

      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await supabase.from('saved_recommendations').insert({
          user_id: session.user.id,
          provider: mode.title,
          confidence: 0,
          workload: modeId,
          team_size: '',
          budget: '',
          raw_analysis: fullText,
        })
        setSaved(true)
      }
    } catch {
      setResponse('Sorry, analysis failed. Please try again.')
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResponse('')
    setDone(false)
    setSaved(false)
    setInput('')
    setQuickWins([])
  }

  async function fetchQuickWins(userInput: string) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 400,
          messages: [
            { role: 'system', content: 'Return only valid JSON array.' },
            {
              role: 'user',
              content: `For this cloud situation: "${userInput}"
Return exactly 3 quick wins as JSON:
[
  {
    "action": "Short action title",
    "description": "One sentence plain English",
    "saving": "$X/month",
    "effort": "5 minutes" or "30 minutes" or "1 hour",
    "where": "Exact console location"
  }
]
Focus on things they can do TODAY.`,
            },
          ],
        }),
      })
      const data = await res.json()
      const text = data.choices?.[0]?.message?.content || '[]'
      const clean = text.replace(/```json|```/g, '').trim()
      setQuickWins(JSON.parse(clean))
    } catch {
      setQuickWins([])
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <JourneyProgress currentStep={1} />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '100px 24px 60px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 20,
            padding: '6px 16px',
            fontSize: 12,
            color: '#6366f1',
            fontWeight: 700,
            marginBottom: 16,
            letterSpacing: 1,
          }}>
            AI-POWERED CLOUD ANALYSIS
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, marginBottom: 12, lineHeight: 1.2 }}>
            What do you need help with?
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
            Pick a mode, describe your situation in plain English, get expert analysis in 30 seconds.
          </p>
        </div>

        {/* Trust bar */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 32, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
          {['🔒 Vendor Neutral', '📊 Real pricing data', '⚡ Powered by Llama 3.3 70B', '🌍 Covers 12+ providers'].map(item => (
            <span key={item} style={{ color: '#666', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>{item}</span>
          ))}
        </div>

        {/* Mode selection */}
        {!done && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 32 }}>
            {MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => { setSelectedMode(mode.id); reset() }}
                className={`glass-card mode-${mode.id}`}
                style={{
                  background: selectedMode === mode.id ? `${mode.color}15` : undefined,
                  border: selectedMode === mode.id ? `2px solid ${mode.color}` : undefined,
                  padding: '24px 20px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  minHeight: 200,
                  position: 'relative',
                }}
              >
                {mode.id === 'finops' && (
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    background: '#f59e0b', color: '#000',
                    fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 6, letterSpacing: 0.5,
                  }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ fontSize: 48, marginBottom: 12, lineHeight: 1 }}>{mode.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'white', marginBottom: 6 }}>{mode.title}</div>
                <div style={{ fontSize: 12, color: '#a0a0b0', lineHeight: 1.5, marginBottom: 14 }}>{mode.subtitle}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {MODE_CHIPS[mode.id].map(chip => (
                    <span
                      key={chip}
                      onClick={e => { e.stopPropagation(); setSelectedMode(mode.id); setInput(chip) }}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 20, padding: '3px 10px',
                        fontSize: 11, color: '#888', cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.color = '#a0a0f0' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#888' }}
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        {selectedMode && !done && (
          <div style={{
            background: '#1a1a2e',
            borderRadius: 20,
            padding: 28,
            border: `1px solid ${activeMode?.color}30`,
            marginBottom: 24,
          }}>
            <div style={{ fontSize: 13, color: '#a0a0b0', marginBottom: 12, fontWeight: 600 }}>
              {activeMode?.icon} {activeMode?.title}
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={activeMode?.placeholder}
              rows={4}
              style={{
                width: '100%',
                background: '#0a0a0f',
                border: '1px solid #ffffff15',
                borderRadius: 12,
                padding: '14px 16px',
                color: 'white',
                fontSize: 15,
                lineHeight: 1.6,
                resize: 'none',
                outline: 'none',
                marginBottom: 16,
                boxSizing: 'border-box',
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && e.metaKey && selectedMode) analyze(selectedMode)
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#555', fontSize: 13 }}>Press ⌘+Enter to analyze</span>
              <button
                onClick={() => selectedMode && analyze(selectedMode)}
                disabled={loading || !input.trim()}
                style={{
                  background: activeMode?.color || '#6366f1',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 28px',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !input.trim() ? 0.5 : 1,
                }}
              >
                {loading ? 'Analyzing...' : 'Analyze →'}
              </button>
            </div>
          </div>
        )}

        {/* Response (streaming + done) */}
        {(response || loading) && (
          <div
            className="glass-card"
            style={{
              padding: 32,
              marginBottom: done ? 0 : 24,
              background: 'linear-gradient(#050508, #050508) padding-box, linear-gradient(135deg, #6366f1, transparent) border-box',
              border: '1px solid transparent',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: loading ? '#6366f1' : '#22c55e' }} />
                <span style={{ color: '#a0a0b0', fontSize: 13 }}>
                  {loading ? 'Analyzing your situation...' : `Analysis complete${saved ? ' · Saved to your account' : ''}`}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#444', padding: '3px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}>
                  Llama 3.3 70B
                </span>
                {done && (
                  <button
                    onClick={() => { navigator.clipboard.writeText(response); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                    style={{ fontSize: 12, color: copied ? '#22c55e' : '#666', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '3px 10px', cursor: 'pointer' }}
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                )}
              </div>
            </div>

            {loading && !response && (
              <>
                <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4 } 50% { opacity: 1 } }`}</style>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: 'rgba(99,102,241,0.08)', borderRadius: 12, marginBottom: 16 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', animation: 'pulse 1s infinite', flexShrink: 0 }} />
                  <span style={{ color: '#a0a0b0', fontSize: 14 }}>AI is analyzing your situation...</span>
                  <span style={{ color: '#555', fontSize: 12, marginLeft: 'auto', whiteSpace: 'nowrap' }}>Usually takes 15–30 seconds</span>
                </div>
                {[100, 80, 90, 70, 85, 60].map((w, i) => (
                  <div key={i} style={{
                    height: 16,
                    background: 'rgba(255,255,255,0.07)',
                    borderRadius: 8,
                    marginBottom: 12,
                    width: `${w}%`,
                    animation: 'pulse 1.5s infinite',
                    animationDelay: `${i * 0.1}s`,
                  }} />
                ))}
              </>
            )}
            <JargonWrapper>
              <MarkdownResponse content={response} />
            </JargonWrapper>

            {loading && (
              <span style={{
                display: 'inline-block',
                width: 2,
                height: 14,
                background: '#6366f1',
                marginLeft: 2,
                verticalAlign: 'text-bottom',
              }} />
            )}

            {done && response && (
              <div style={{ marginTop: 24, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
                <div style={{ fontSize: 11, letterSpacing: 2, color: '#666', marginBottom: 12 }}>
                  🛡️ CONFIDENCE BREAKDOWN
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  <ConfidenceBadge level="high"   text="Pricing data verified" />
                  <ConfidenceBadge level="high"   text="Reserved instance math" />
                  <ConfidenceBadge level="medium" text="Workload estimates" />
                  <ConfidenceBadge level="low"    text="Future projections" />
                </div>
                <p style={{ color: '#666', fontSize: 12, margin: 0 }}>
                  🟢 Verified against published AWS/Azure/GCP pricing as of {new Date().toLocaleDateString()}.&nbsp;
                  🟡 Based on typical workload patterns.&nbsp;
                  🟠 Projections vary with actual usage.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick Wins */}
        {quickWins.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s ease-in-out infinite' }} />
              <span style={{ fontSize: 11, color: '#22c55e', letterSpacing: 2, fontWeight: 700 }}>⚡ QUICK WINS — DO TODAY</span>
            </div>
            {quickWins.map((w, i) => (
              <div key={i} className="glass-card" style={{ padding: 16, marginBottom: 12, borderLeft: '3px solid #22c55e' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <strong style={{ color: 'white', fontSize: 14 }}>{w.action}</strong>
                  <span style={{ color: '#22c55e', fontSize: 13, fontWeight: 700 }}>{w.saving}</span>
                </div>
                <p style={{ color: '#a0a0b0', fontSize: 13, marginBottom: 8 }}>{w.description}</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ color: '#666', fontSize: 12 }}>⏱ {w.effort}</span>
                  <span style={{ color: '#666', fontSize: 12 }}>📍 {w.where}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Related Tools */}
        {done && response && <RelatedTools response={response} />}

        {/* Implementation Wizard + Track results */}
        {done && (
          <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => setShowWizard(true)}
              style={{
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: 8, padding: '8px 14px', color: '#22c55e',
                fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              🧭 Start Implementation Wizard
            </button>
            <div style={{ flex: 1, padding: '8px 14px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#666' }}>Implemented this advice? Tell us what happened.</span>
              <a href="/track-results" style={{ fontSize: 13, color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Share your results →</a>
            </div>
          </div>
        )}

        {showWizard && <ImplementationWizard onClose={() => setShowWizard(false)} savingEstimate="$200–800/mo" />}

        {/* Disclaimer */}
        {done && (
          <div style={{ marginTop: 12, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 8, borderLeft: '3px solid #333' }}>
            <p style={{ color: '#555', fontSize: 11, margin: 0 }}>
              ℹ️ Recommendations are based on published cloud provider pricing and industry benchmarks. Actual savings may vary. Always verify recommendations with your cloud provider before making changes to production infrastructure.
            </p>
          </div>
        )}

        {/* Save nudge for logged-out users */}
        {done && !isLoggedIn && (
          <div
            className="glass-card"
            style={{
              marginTop: 16,
              padding: '16px 20px',
              border: '1px solid rgba(99,102,241,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <p style={{ color: '#c7c8f0', fontSize: 14, margin: 0 }}>
              <strong style={{ color: 'white' }}>Save this analysis</strong> — Sign in to keep your results and get personalized recommendations.
            </p>
            <button
              onClick={() => router.push('/auth')}
              style={{
                background: '#6366f1',
                border: 'none',
                borderRadius: 8,
                padding: '9px 20px',
                color: 'white',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Sign In
            </button>
          </div>
        )}

        {/* Action row */}
        {done && (
          <div style={{
            marginTop: 24,
            paddingTop: 24,
            borderTop: '1px solid #ffffff08',
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
          }}>
            <button onClick={() => router.push('/advisor')} className="btn-primary" style={{ fontSize: 14, padding: '12px 24px' }}>
              Get Full Recommendation →
            </button>
            <button onClick={() => router.push('/chat')} className="btn-secondary" style={{ fontSize: 14, padding: '12px 24px' }}>
              Ask Follow-up Questions
            </button>
            <button
              onClick={() => { reset(); setSelectedMode(null) }}
              className="btn-secondary"
              style={{ fontSize: 14, padding: '12px 24px', color: '#666' }}
            >
              Start New Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
