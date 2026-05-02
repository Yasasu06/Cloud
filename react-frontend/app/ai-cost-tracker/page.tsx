'use client'

import { useState, useMemo } from 'react'

type Provider = 'openai' | 'anthropic' | 'google' | 'other'

const PROVIDERS: Record<Provider, { label: string; color: string; emoji: string }> = {
  openai:    { label: 'OpenAI',          color: '#10a37f', emoji: '🟢' },
  anthropic: { label: 'Anthropic Claude', color: '#d97706', emoji: '🟠' },
  google:    { label: 'Google Gemini',   color: '#4285f4', emoji: '🔵' },
  other:     { label: 'Other LLM',       color: '#818cf8', emoji: '🟣' },
}

interface Tip {
  id: string
  applies: Provider[]
  icon: string
  title: string
  detail: string
  savePct: number
  category: 'model' | 'arch' | 'pricing'
}

const TIPS: Tip[] = [
  {
    id: 'haiku',
    applies: ['openai', 'anthropic'],
    icon: '🔀',
    title: 'Route 80% of calls to Claude Haiku',
    detail: 'Most classification, extraction, and short-answer tasks don\'t need a frontier model. Haiku costs ~95% less than GPT-4o.',
    savePct: 70,
    category: 'model',
  },
  {
    id: 'flash',
    applies: ['openai', 'google'],
    icon: '⚡',
    title: 'Use Gemini Flash for high-volume calls',
    detail: 'Gemini 2.0 Flash is 90% cheaper than GPT-4o for simple tasks and handles 1M+ token context natively.',
    savePct: 85,
    category: 'model',
  },
  {
    id: 'cache',
    applies: ['openai', 'anthropic', 'google', 'other'],
    icon: '💾',
    title: 'Cache repeated prompts',
    detail: 'Identical system prompts, RAG context, and few-shot examples can be cached server-side. Typical saving: 30–40% of input token cost.',
    savePct: 35,
    category: 'arch',
  },
  {
    id: 'batch',
    applies: ['openai', 'anthropic'],
    icon: '📦',
    title: 'Batch API for non-real-time workloads',
    detail: 'OpenAI Batch API and Anthropic Message Batches cut costs 50%. Great for nightly processing, bulk classification, and offline evals.',
    savePct: 50,
    category: 'pricing',
  },
  {
    id: 'context',
    applies: ['openai', 'anthropic', 'google', 'other'],
    icon: '✂️',
    title: 'Trim context windows aggressively',
    detail: 'Every unnecessary token in your system prompt costs money at scale. Audit and compress prompts — typical saving: 20–30% on input tokens.',
    savePct: 25,
    category: 'arch',
  },
  {
    id: 'embed',
    applies: ['openai', 'anthropic', 'google', 'other'],
    icon: '🗄️',
    title: 'Pre-compute and store embeddings',
    detail: 'Recomputing embeddings per request is wasteful. Store vectors in pgvector or Pinecone and refresh only on content change.',
    savePct: 40,
    category: 'arch',
  },
]

const CATEGORY_LABELS = { model: '🔀 Model Routing', arch: '🏗️ Architecture', pricing: '💰 Pricing Plan' }

export default function AiCostTrackerPage() {
  const [spends, setSpends] = useState<Record<Provider, string>>({ openai: '', anthropic: '', google: '', other: '' })

  function setSpend(p: Provider, v: string) {
    setSpends(prev => ({ ...prev, [p]: v }))
  }

  const totals = useMemo(() => {
    const vals: Record<Provider, number> = { openai: 0, anthropic: 0, google: 0, other: 0 }
    for (const k of Object.keys(spends) as Provider[]) vals[k] = parseFloat(spends[k]) || 0
    return vals
  }, [spends])

  const total = Object.values(totals).reduce((a, b) => a + b, 0)

  const activeTips = useMemo(() => {
    if (total === 0) return []
    const activeProviders = (Object.keys(totals) as Provider[]).filter(k => totals[k] > 0)
    return TIPS.filter(t => t.applies.some(p => activeProviders.includes(p)))
  }, [totals, total])

  const optimizedSpend = useMemo(() => {
    if (activeTips.length === 0) return total
    const compoundFactor = activeTips.reduce((acc, t) => acc * (1 - t.savePct / 100 * 0.3), 1)
    return Math.round(total * compoundFactor)
  }, [activeTips, total])

  const saving = total - optimizedSpend

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, fontWeight: 500,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'white', outline: 'none', boxSizing: 'border-box',
  }

  const byCategory = activeTips.reduce<Record<string, Tip[]>>((acc, t) => {
    acc[t.category] = [...(acc[t.category] || []), t]
    return acc
  }, {})

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>
            AI COST OPTIMIZATION
          </div>
          <h1 style={{ fontSize: 'clamp(26px,5vw,40px)', fontWeight: 900, marginBottom: 12, lineHeight: 1.1 }}>
            AI Workload Cost Optimizer
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 15, maxWidth: 460, margin: '0 auto' }}>
            Enter your monthly AI API spend and get specific optimization recommendations.
          </p>
        </div>

        {/* Spend inputs */}
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 16 }}>MONTHLY AI API SPEND</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {(Object.keys(PROVIDERS) as Provider[]).map(k => {
              const p = PROVIDERS[k]
              return (
                <div key={k}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    {p.emoji} {p.label.toUpperCase()} ($/MO)
                  </label>
                  <input
                    type="number" min="0" value={spends[k]}
                    onChange={e => setSpend(k, e.target.value)}
                    placeholder="0"
                    style={inputStyle}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {total > 0 && (
          <>
            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'CURRENT SPEND', value: `$${total.toLocaleString()}/mo`, color: '#ef4444' },
                { label: 'OPTIMIZED SPEND', value: `$${optimizedSpend.toLocaleString()}/mo`, color: '#22c55e' },
                { label: 'MONTHLY SAVING', value: saving > 0 ? `$${saving.toLocaleString()}/mo` : '$0', color: '#f59e0b' },
              ].map(s => (
                <div key={s.label} className="glass-card" style={{ padding: 18, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#444', letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Breakdown bar */}
            <div className="glass-card" style={{ padding: 22, marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 12 }}>SPEND BREAKDOWN</div>
              <div style={{ display: 'flex', height: 16, borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
                {(Object.keys(totals) as Provider[]).filter(k => totals[k] > 0).map(k => (
                  <div key={k} style={{
                    width: `${(totals[k] / total) * 100}%`,
                    background: PROVIDERS[k].color,
                    transition: 'width 0.3s',
                  }} />
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {(Object.keys(totals) as Provider[]).filter(k => totals[k] > 0).map(k => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#a0a0b0' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: PROVIDERS[k].color, flexShrink: 0 }} />
                    {PROVIDERS[k].label}: ${totals[k].toLocaleString()} ({((totals[k]/total)*100).toFixed(0)}%)
                  </div>
                ))}
              </div>
            </div>

            {/* Tips by category */}
            {activeTips.length > 0 && (
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 16 }}>
                  {activeTips.length} Optimization Recommendations
                </div>
                {(Object.keys(byCategory) as Array<keyof typeof CATEGORY_LABELS>).map(cat => (
                  <div key={cat} style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 8 }}>{CATEGORY_LABELS[cat]}</div>
                    {byCategory[cat].map(tip => (
                      <div key={tip.id} className="glass-card" style={{ padding: '16px 20px', marginBottom: 10, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 22, flexShrink: 0 }}>{tip.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 4 }}>{tip.title}</div>
                          <div style={{ fontSize: 13, color: '#a0a0b0', marginBottom: 8 }}>{tip.detail}</div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: '#22c55e' }}>
                            Save up to {tip.savePct}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Annual projection */}
            {saving > 0 && (
              <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 16, padding: '20px 24px', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#22c55e', marginBottom: 4 }}>💡 Annual saving potential</div>
                  <div style={{ fontSize: 13, color: '#a0a0b0' }}>If you implement all recommendations above</div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#22c55e' }}>${(saving * 12).toLocaleString()}/yr</div>
              </div>
            )}
          </>
        )}

        {total === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#555' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
            <div style={{ fontSize: 14 }}>Enter your monthly AI API costs to see optimization recommendations</div>
          </div>
        )}

      </div>
    </div>
  )
}
