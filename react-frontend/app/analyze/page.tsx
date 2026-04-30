'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { trackEvent } from '@/lib/posthog'

type Mode = 'finops' | 'architect' | 'migration'
type SectionType = 'summary' | 'positive' | 'warning' | 'risk' | 'action' | 'neutral'

interface SectionConfig {
  header: string
  type: SectionType
}

interface ParsedSection {
  header: string
  content: string
  type: SectionType
}

interface ModeConfig {
  id: Mode
  icon: string
  title: string
  subtitle: string
  placeholder: string
  color: string
  systemPrompt: string
  sections: SectionConfig[]
}

const MODES: ModeConfig[] = [
  {
    id: 'finops',
    icon: '💸',
    title: 'Explain My Cloud Bill',
    subtitle: 'FinOps Analyst — find waste, explain costs, cut spend',
    placeholder: "e.g. We're on AWS, spending $12k/month, 5 engineers. Our bill doubled last quarter and we don't know why.",
    color: '#f59e0b',
    systemPrompt: `You are a senior FinOps analyst with 15 years of experience cutting cloud waste. When someone describes their cloud situation, you give them the specific, actionable analysis a $300/hour consultant would give — in plain English.

ALWAYS structure your response with these exact section headers on their own line:

📊 YOUR SITUATION SUMMARY
Restate what you understand in 2 sentences. Show you understood their specific details.

💸 WHERE YOUR MONEY IS GOING
Based on their cloud provider and spend level, identify the 3-4 most likely cost drivers. Name actual services (EC2, RDS, Data Transfer, NAT Gateway, etc.) with estimated costs.

🗑️ WHAT YOU CAN PROBABLY ELIMINATE
List 3-5 specific resources or configurations that are commonly wasted. For each: what it is, how to find it, estimated monthly savings.

⚡ YOUR TOP 3 ACTIONS THIS WEEK
Specific, ordered steps. For each: exact action, which console page to find it, time to complete, expected monthly saving.

⚠️ YOUR BIGGEST RISK
One specific technical or financial risk. Be honest about what could go wrong.

💰 COST AT SCALE
If they mentioned growth — show what their bill looks like at 10x scale.

🏆 HONEST RECOMMENDATION
Should they stay on their current provider or consider switching? Be direct.

Rules: Use real service names. Give real dollar estimates. Never say "it depends" without explaining what it depends on. Maximum 500 words. Write for a non-technical founder.`,
    sections: [
      { header: '📊 YOUR SITUATION SUMMARY', type: 'summary' },
      { header: '💸 WHERE YOUR MONEY IS GOING', type: 'neutral' },
      { header: '🗑️ WHAT YOU CAN PROBABLY ELIMINATE', type: 'positive' },
      { header: '⚡ YOUR TOP 3 ACTIONS THIS WEEK', type: 'action' },
      { header: '⚠️ YOUR BIGGEST RISK', type: 'risk' },
      { header: '💰 COST AT SCALE', type: 'warning' },
      { header: '🏆 HONEST RECOMMENDATION', type: 'positive' },
    ],
  },
  {
    id: 'architect',
    icon: '🏗️',
    title: 'Design My Architecture',
    subtitle: 'Solutions Architect — pick the right stack for what you\'re building',
    placeholder: "e.g. I want to build a healthcare app for 500 doctors in Europe that handles patient records and needs HIPAA/GDPR compliance.",
    color: '#6366f1',
    systemPrompt: `You are a principal solutions architect at a top-tier cloud consultancy. When someone describes what they want to build, you design the right architecture for their actual needs — not what's trendy or over-engineered.

ALWAYS structure your response with these exact section headers on their own line:

🎯 WHAT YOU'RE ACTUALLY BUILDING
Restate their project in concrete technical terms. What category of system is this?

☁️ RECOMMENDED CLOUD & STACK
Which cloud provider and why. Be opinionated. Name the specific services.

🏛️ ARCHITECTURE BLUEPRINT
The 4-6 core components of their system. For each: what it does, which service to use, rough monthly cost.

🛡️ COMPLIANCE & SECURITY
Any regulatory requirements (HIPAA, GDPR, SOC2, etc.) and specifically which cloud features satisfy them.

⚠️ THE HARD PARTS
The 2-3 genuinely difficult technical challenges they will face. Be honest.

💰 REALISTIC COST ESTIMATE
Monthly cost breakdown at launch and at 10x scale. Use real service pricing.

🚀 HOW TO START
The first 3 steps to begin building this. Specific, ordered.

Rules: Name real cloud services and their SKUs. Give real cost estimates. Warn about common mistakes for this type of project. Maximum 500 words. Write clearly for a smart non-architect founder.`,
    sections: [
      { header: "🎯 WHAT YOU'RE ACTUALLY BUILDING", type: 'summary' },
      { header: '☁️ RECOMMENDED CLOUD & STACK', type: 'positive' },
      { header: '🏛️ ARCHITECTURE BLUEPRINT', type: 'neutral' },
      { header: '🛡️ COMPLIANCE & SECURITY', type: 'action' },
      { header: '⚠️ THE HARD PARTS', type: 'warning' },
      { header: '💰 REALISTIC COST ESTIMATE', type: 'neutral' },
      { header: '🚀 HOW TO START', type: 'action' },
    ],
  },
  {
    id: 'migration',
    icon: '🔄',
    title: 'Plan My Migration',
    subtitle: 'Migration Engineer — move clouds without breaking production',
    placeholder: "e.g. We're on AWS and want to move to Azure. $15k/month, 8 engineers, running 12 microservices and a PostgreSQL database.",
    color: '#22c55e',
    systemPrompt: `You are a cloud migration engineer who has led 50+ enterprise cloud migrations. When someone describes a migration they need to do, you give them a realistic, specific plan — including the parts most consultants don't tell you about.

ALWAYS structure your response with these exact section headers on their own line:

📋 MIGRATION SCOPE ASSESSMENT
What exactly needs to move. Classify each component: lift-and-shift, re-platform, or refactor.

⏱️ REALISTIC TIMELINE
Week-by-week phases. Be honest about complexity. Don't compress timelines to sound good.

💸 TOTAL MIGRATION COST
Engineering hours, downtime risk, dual-running costs, and any licensing changes. Give real numbers.

🔴 YOUR HIGHEST RISKS
The 3 things most likely to cause the migration to fail or overrun. Specific to their stack.

✅ PRE-MIGRATION CHECKLIST
The 5 things they must do before moving anything. Include dependency mapping and rollback plan.

🗺️ PHASE-BY-PHASE PLAN
Phase 1 (Foundation), Phase 2 (Migrate), Phase 3 (Cutover), Phase 4 (Decommission). Specific tasks per phase.

🏁 SHOULD YOU ACTUALLY MIGRATE?
Honest cost-benefit: total migration cost vs annual savings. Include the break-even point.

Rules: Name real services on both source and target clouds. Give real time and cost estimates. Warn about the hidden costs (dual running, re-training, tooling changes). Maximum 500 words.`,
    sections: [
      { header: '📋 MIGRATION SCOPE ASSESSMENT', type: 'summary' },
      { header: '⏱️ REALISTIC TIMELINE', type: 'neutral' },
      { header: '💸 TOTAL MIGRATION COST', type: 'warning' },
      { header: '🔴 YOUR HIGHEST RISKS', type: 'risk' },
      { header: '✅ PRE-MIGRATION CHECKLIST', type: 'action' },
      { header: '🗺️ PHASE-BY-PHASE PLAN', type: 'neutral' },
      { header: '🏁 SHOULD YOU ACTUALLY MIGRATE?', type: 'positive' },
    ],
  },
]

function getSectionStyle(type: SectionType): { borderColor: string; labelColor: string } {
  switch (type) {
    case 'summary': return { borderColor: '#6366f1', labelColor: '#6366f1' }
    case 'positive': return { borderColor: '#22c55e', labelColor: '#22c55e' }
    case 'warning': return { borderColor: '#f59e0b', labelColor: '#f59e0b' }
    case 'risk': return { borderColor: '#ef4444', labelColor: '#ef4444' }
    case 'action': return { borderColor: '#06b6d4', labelColor: '#06b6d4' }
    case 'neutral': return { borderColor: '#ffffff20', labelColor: '#a0a0b0' }
  }
}

function parseSections(text: string, sectionConfigs: SectionConfig[]): ParsedSection[] {
  const results: ParsedSection[] = []
  const headers = sectionConfigs.map(s => s.header)

  for (let i = 0; i < headers.length; i++) {
    const header = headers[i]
    const start = text.indexOf(header)
    if (start === -1) continue

    const contentStart = start + header.length
    const nextHeaderIndex = headers.slice(i + 1).reduce((earliest, h) => {
      const pos = text.indexOf(h, contentStart)
      return pos !== -1 && pos < earliest ? pos : earliest
    }, text.length)

    const content = text.slice(contentStart, nextHeaderIndex).trim()
    if (content) {
      results.push({
        header,
        content,
        type: sectionConfigs[i].type,
      })
    }
  }

  return results
}

function renderContent(text: string): React.ReactNode {
  const clean = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,3} /g, '')

  const lines = clean.split('\n').filter(l => l.trim())
  const elements: React.ReactNode[] = []
  let listItems: string[] = []

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} style={{ margin: '8px 0', paddingLeft: 20 }}>
          {listItems.map((item, j) => (
            <li key={j} style={{ color: '#d0d0e0', fontSize: 14, lineHeight: 1.7, marginBottom: 4 }}>
              {item}
            </li>
          ))}
        </ul>
      )
      listItems = []
    }
  }

  for (const line of lines) {
    const stripped = line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim()
    if (/^[-•*]/.test(line.trim()) || /^\d+\./.test(line.trim())) {
      listItems.push(stripped)
    } else {
      flushList()
      elements.push(
        <p key={`p-${elements.length}`} style={{ color: '#d0d0e0', fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>
          {stripped}
        </p>
      )
    }
  }
  flushList()

  return <>{elements}</>
}

export default function AnalyzePage() {
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null)
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    if (q && q.trim()) {
      setInput(q)
      setSelectedMode('finops')
      setTimeout(() => analyze('finops', q), 300)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const activeMode = MODES.find(m => m.id === selectedMode)
  const parsedSections = activeMode && done
    ? parseSections(response, activeMode.sections)
    : []

  async function analyze(modeId: Mode, overrideText?: string) {
    const mode = MODES.find(m => m.id === modeId)
    if (!mode) return
    const userText = (overrideText ?? input).trim()
    if (!userText || loading) return

    setLoading(true)
    setResponse('')
    setDone(false)
    setSaved(false)
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
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
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

        {/* Mode selection */}
        {!done && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
            {MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => {
                  setSelectedMode(mode.id)
                  reset()
                }}
                style={{
                  background: selectedMode === mode.id ? `${mode.color}15` : '#1a1a2e',
                  border: `2px solid ${selectedMode === mode.id ? mode.color : '#ffffff10'}`,
                  borderRadius: 16,
                  padding: '20px 20px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>{mode.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'white', marginBottom: 4 }}>{mode.title}</div>
                <div style={{ fontSize: 12, color: '#a0a0b0', lineHeight: 1.5 }}>{mode.subtitle}</div>
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

        {/* Streaming raw output (while loading, before sections are parseable) */}
        {loading && response && (
          <div style={{
            background: '#1a1a2e',
            borderRadius: 16,
            padding: 24,
            border: '1px solid #ffffff08',
            marginBottom: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }} />
              <span style={{ color: '#a0a0b0', fontSize: 13 }}>Analyzing your situation...</span>
            </div>
            <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, color: '#e0e0e0', lineHeight: 1.8 }}>
              {response}
              <span style={{
                display: 'inline-block',
                width: 2,
                height: 14,
                background: '#6366f1',
                marginLeft: 2,
                verticalAlign: 'text-bottom',
              }} />
            </div>
          </div>
        )}

        {/* Parsed section cards */}
        {done && parsedSections.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ color: '#a0a0b0', fontSize: 13 }}>Analysis complete{saved ? ' · Saved to your account' : ''}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {parsedSections.map((section, i) => {
                const style = getSectionStyle(section.type)
                return (
                  <div
                    key={i}
                    style={{
                      background: '#1a1a2e',
                      borderRadius: 14,
                      padding: '20px 24px',
                      borderLeft: `4px solid ${style.borderColor}`,
                      border: `1px solid ${style.borderColor}20`,
                      borderLeftWidth: 4,
                    }}
                  >
                    <div style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: style.labelColor,
                      letterSpacing: 1,
                      marginBottom: 10,
                    }}>
                      {section.header}
                    </div>
                    {renderContent(section.content)}
                  </div>
                )
              })}
            </div>

            {/* Fallback: if sections didn't parse, show raw */}
            {parsedSections.length === 0 && (
              <div style={{
                background: '#1a1a2e',
                borderRadius: 14,
                padding: 24,
                border: '1px solid #ffffff08',
                whiteSpace: 'pre-wrap',
                fontSize: 14,
                color: '#e0e0e0',
                lineHeight: 1.8,
              }}>
                {response}
              </div>
            )}

            {/* Action row */}
            <div style={{
              marginTop: 32,
              paddingTop: 24,
              borderTop: '1px solid #ffffff08',
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
            }}>
              <button
                onClick={() => router.push('/advisor')}
                style={{
                  background: '#6366f1',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 24px',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Get Full Recommendation →
              </button>
              <button
                onClick={() => router.push('/chat')}
                style={{
                  background: 'transparent',
                  border: '1px solid #ffffff30',
                  borderRadius: 10,
                  padding: '12px 24px',
                  color: 'white',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Ask Follow-up Questions
              </button>
              <button
                onClick={() => {
                  reset()
                  setSelectedMode(null)
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid #ffffff15',
                  borderRadius: 10,
                  padding: '12px 24px',
                  color: '#a0a0b0',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Start New Analysis
              </button>
            </div>
          </div>
        )}

        {/* Raw fallback when done but no sections parsed */}
        {done && parsedSections.length === 0 && response && (
          <div style={{
            background: '#1a1a2e',
            borderRadius: 14,
            padding: 24,
            border: '1px solid #ffffff08',
            whiteSpace: 'pre-wrap',
            fontSize: 14,
            color: '#e0e0e0',
            lineHeight: 1.8,
            marginBottom: 24,
          }}>
            {response}
          </div>
        )}
      </div>
    </div>
  )
}
