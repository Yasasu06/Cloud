'use client'

import { useState, useEffect, useRef } from 'react'
import DisclaimerBanner from '@/components/DisclaimerBanner'
import { getUserMode, modeInstruction } from '@/lib/userMode'

const QUESTIONS = [
  "What are you building or running on cloud? Give me a quick description.",
  "What's your current monthly cloud spend, or your expected budget?",
  "What's your biggest cloud pain right now — cost, complexity, performance, or compliance?",
  "How technical is your team on a scale of 1–10?",
  "What's your growth plan — staying stable, growing 2×, or targeting 10× in the next year?",
]

const Q_LABELS = ['What you build', 'Budget', 'Biggest pain', 'Team tech level', 'Growth plan']

type Phase = 'discovery' | 'generating' | 'report'

interface Message {
  role: 'ai' | 'user'
  text: string
}

function buildPrompt(answers: string[]): string {
  return `You are a senior cloud strategy advisor. A client completed a 5-question discovery session. Build their complete, personalized cloud strategy.

CLIENT PROFILE:
1. What they build/run: ${answers[0]}
2. Monthly budget/spend: ${answers[1]}
3. Biggest pain point: ${answers[2]}
4. Team technical level (1-10): ${answers[3]}
5. Growth plan: ${answers[4]}

Generate a concise, structured cloud strategy report. Be specific to their context — no generic advice. Format exactly as:

## Cloud Strategy Summary
2–3 sentences on their situation and overall direction.

## Recommended Provider
Name the primary provider (AWS, Azure, GCP, DigitalOcean, etc.) and explain specifically why it fits their profile. If multi-cloud makes sense, say so.

## Top 3 Immediate Actions
- **[Action name]**: [specific step + expected outcome tied to their answers]
- **[Action name]**: [specific step + expected outcome tied to their answers]
- **[Action name]**: [specific step + expected outcome tied to their answers]

## 90-Day Roadmap
**Month 1**: [what to prioritize first and why]
**Month 2**: [what to build or improve next]
**Month 3**: [what to complete or scale]

## Estimated Monthly Cost
[Realistic cost estimate tied to their stated budget, broken down by category]

## Risk Factors
- **[Risk]**: [specific mitigation for their situation]
- **[Risk]**: [specific mitigation for their situation]`
}

// ─── Inline bold renderer ─────────────────────────────────────────────────────

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} style={{ color: 'white' }}>{p.slice(2, -2)}</strong>
      : p
  )
}

// ─── Markdown report renderer ─────────────────────────────────────────────────

function ReportContent({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <div>
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return (
            <div key={i} style={{
              fontSize: 11, fontWeight: 800, color: '#818cf8', letterSpacing: 1.5,
              textTransform: 'uppercase', marginTop: i === 0 ? 0 : 28, marginBottom: 12,
              borderBottom: '1px solid rgba(99,102,241,0.15)', paddingBottom: 8,
            }}>
              {line.slice(3)}
            </div>
          )
        }
        if (line.match(/^- \*\*/)) {
          const m = line.match(/^- \*\*(.+?)\*\*: (.+)$/)
          return m ? (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <span style={{ color: '#6366f1', fontWeight: 900, fontSize: 16, flexShrink: 0, marginTop: 1 }}>→</span>
              <div style={{ fontSize: 14, color: '#c0c0d0', lineHeight: 1.6 }}>
                <strong style={{ color: 'white' }}>{m[1]}: </strong>{m[2]}
              </div>
            </div>
          ) : null
        }
        if (line.startsWith('- ')) {
          return (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              <span style={{ color: '#6366f1', flexShrink: 0 }}>·</span>
              <div style={{ fontSize: 14, color: '#c0c0d0', lineHeight: 1.6 }}>{renderInline(line.slice(2))}</div>
            </div>
          )
        }
        if (line.match(/^\*\*[^*]+\*\*:/)) {
          const m = line.match(/^\*\*(.+?)\*\*: (.+)$/)
          return m ? (
            <div key={i} style={{ marginBottom: 10 }}>
              <span style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>{m[1]}: </span>
              <span style={{ color: '#a0a0b0', fontSize: 14 }}>{m[2]}</span>
            </div>
          ) : null
        }
        if (line.trim() === '') return <div key={i} style={{ height: 6 }} />
        return <p key={i} style={{ fontSize: 14, color: '#a0a0b0', lineHeight: 1.75, marginBottom: 6 }}>{renderInline(line)}</p>
      })}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <>
      <style>{`
        @keyframes adv-bounce {
          0%,80%,100% { transform:translateY(0); opacity:0.3; }
          40% { transform:translateY(-5px); opacity:1; }
        }
      `}</style>
      <div style={{
        padding: '12px 16px',
        borderRadius: '16px 16px 16px 4px',
        background: '#1a1a2e',
        border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: '50%', background: '#6366f1',
            animation: `adv-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </>
  )
}

function AnimatedDots() {
  const [dots, setDots] = useState('.')
  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 400)
    return () => clearInterval(id)
  }, [])
  return <span>{dots}</span>
}

function AiAvatar() {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, alignSelf: 'flex-end',
    }}>☁️</div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AiAdvisorPage() {
  const [phase, setPhase] = useState<Phase>('discovery')
  const [messages, setMessages] = useState<Message[]>([{ role: 'ai', text: QUESTIONS[0] }])
  const [answers, setAnswers] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [report, setReport] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const currentQ = answers.length

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, phase])

  useEffect(() => {
    if (phase === 'discovery' && !isTyping) inputRef.current?.focus()
  }, [phase, messages.length, isTyping])

  async function handleAnswer() {
    const answer = input.trim()
    if (!answer || isTyping || phase !== 'discovery') return
    setInput('')
    const newAnswers = [...answers, answer]
    setAnswers(newAnswers)
    setMessages(prev => [...prev, { role: 'user', text: answer }])

    if (newAnswers.length >= 5) {
      setTimeout(() => setPhase('generating'), 350)
      setTimeout(() => streamReport(newAnswers), 500)
      return
    }

    setIsTyping(true)
    await new Promise(r => setTimeout(r, 650))
    setIsTyping(false)
    setMessages(prev => [...prev, { role: 'ai', text: QUESTIONS[newAnswers.length] }])
  }

  async function streamReport(finalAnswers: string[]) {
    setPhase('report')
    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'You are a senior cloud strategy advisor.' + modeInstruction(getUserMode()) },
            { role: 'user', content: buildPrompt(finalAnswers) },
          ],
          stream: true,
          max_tokens: 1400,
        }),
      })
      if (!res.ok || !res.body) { setReport('Failed to generate. Please try again.'); return }
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let acc = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = dec.decode(value, { stream: true }).split('\n').filter(l => l.startsWith('data: '))
        for (const line of lines) {
          const data = line.slice(6)
          if (data === '[DONE]') continue
          try { acc += JSON.parse(data).choices?.[0]?.delta?.content ?? ''; setReport(acc) } catch {}
        }
      }
    } catch {
      setReport('Failed to generate. Please try again.')
    }
  }

  function restart() {
    setPhase('discovery')
    setMessages([{ role: 'ai', text: QUESTIONS[0] }])
    setAnswers([])
    setReport('')
    setInput('')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-block', background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20,
            padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700,
            marginBottom: 14, letterSpacing: 1,
          }}>
            AI STRATEGY SESSION
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 900, marginBottom: 10, lineHeight: 1.1 }}>
            Your Cloud Strategy,<br />
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Built in 5 Questions
            </span>
          </h1>
          {phase === 'discovery' && (
            <p style={{ color: '#a0a0b0', fontSize: 14, maxWidth: 440, margin: '0 auto' }}>
              Answer honestly — the more specific you are, the better your strategy.
            </p>
          )}
        </div>

        {/* Progress bar */}
        {phase === 'discovery' && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
            {QUESTIONS.map((_, i) => (
              <div key={i} style={{
                height: 4, flex: 1, borderRadius: 4, transition: 'background 0.3s',
                background: i < currentQ ? '#6366f1' : i === currentQ ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.05)',
              }} />
            ))}
          </div>
        )}

        {/* ── Discovery / Generating phase ── */}
        {(phase === 'discovery' || phase === 'generating') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 10 }}>
                {msg.role === 'ai' && <AiAvatar />}
                <div style={{
                  maxWidth: '78%', padding: '12px 16px', fontSize: 14, lineHeight: 1.65,
                  borderRadius: msg.role === 'ai' ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                  background: msg.role === 'ai' ? '#1a1a2e' : '#6366f1',
                  border: msg.role === 'ai' ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  color: msg.role === 'ai' ? '#e0e0f0' : 'white',
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', gap: 10 }}>
                <AiAvatar />
                <TypingDots />
              </div>
            )}

            {phase === 'generating' && (
              <div style={{ display: 'flex', gap: 10 }}>
                <AiAvatar />
                <div style={{
                  padding: '14px 18px',
                  borderRadius: '16px 16px 16px 4px',
                  background: '#1a1a2e',
                  border: '1px solid rgba(99,102,241,0.2)',
                  fontSize: 14, color: '#818cf8', fontWeight: 600,
                }}>
                  Building your strategy<AnimatedDots />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}

        {/* Input */}
        {phase === 'discovery' && !isTyping && (
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAnswer()}
              placeholder={`Q${currentQ + 1} of 5 — your answer…`}
              style={{
                flex: 1, background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: '14px 16px', color: 'white', fontSize: 15, outline: 'none',
              }}
            />
            <button
              onClick={handleAnswer}
              disabled={!input.trim()}
              style={{
                background: input.trim() ? '#6366f1' : 'rgba(99,102,241,0.2)',
                border: 'none', borderRadius: 12, padding: '0 22px',
                color: 'white', fontWeight: 700, fontSize: 14,
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                transition: 'background 0.15s', whiteSpace: 'nowrap',
              }}
            >
              {currentQ >= 4 ? 'Generate ✦' : 'Next →'}
            </button>
          </div>
        )}

        {/* ── Report phase ── */}
        {phase === 'report' && <DisclaimerBanner />}
        {phase === 'report' && (
          <div>
            {/* Answer pills */}
            <div style={{
              background: '#111118', borderRadius: 12, padding: '14px 16px',
              marginBottom: 24, display: 'flex', gap: 8, flexWrap: 'wrap',
            }}>
              {answers.map((a, i) => (
                <div key={i} style={{
                  background: 'rgba(99,102,241,0.08)',
                  border: '1px solid rgba(99,102,241,0.15)',
                  borderRadius: 8, padding: '4px 10px', fontSize: 12,
                }}>
                  <span style={{ color: '#444', marginRight: 5 }}>{Q_LABELS[i]}:</span>
                  <span style={{ color: '#a0a0b0' }}>{a.length > 38 ? a.slice(0, 38) + '…' : a}</span>
                </div>
              ))}
            </div>

            {/* Report card */}
            <div style={{
              background: '#1a1a2e', borderRadius: 20, padding: '28px 28px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              {report
                ? <ReportContent text={report} />
                : <div style={{ color: '#555', fontSize: 14 }}>Generating your strategy<AnimatedDots /></div>
              }

              {/* CTAs — show once streaming is done (heuristic: report has 6 sections) */}
              {report.split('##').length >= 6 && (
                <div style={{
                  display: 'flex', gap: 10, marginTop: 28, paddingTop: 20,
                  borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap',
                }}>
                  <a href="/analyze" style={{
                    flex: 1, minWidth: 160, display: 'block', textAlign: 'center',
                    background: '#6366f1', color: 'white', fontWeight: 700,
                    fontSize: 13, padding: '12px 0', borderRadius: 10, textDecoration: 'none',
                  }}>
                    Deep Dive with AI Analyze →
                  </a>
                  <a href="/bill-upload" style={{
                    flex: 1, minWidth: 160, display: 'block', textAlign: 'center',
                    background: 'rgba(255,255,255,0.06)', color: '#a0a0b0', fontWeight: 600,
                    fontSize: 13, padding: '12px 0', borderRadius: 10, textDecoration: 'none',
                  }}>
                    Upload Your Cloud Bill →
                  </a>
                  <a href="/migrate?tab=egress" style={{
                    flex: 1, minWidth: 160, display: 'block', textAlign: 'center',
                    background: 'rgba(255,255,255,0.06)', color: '#a0a0b0', fontWeight: 600,
                    fontSize: 13, padding: '12px 0', borderRadius: 10, textDecoration: 'none',
                  }}>
                    Egress Cost Calculator →
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={restart}
              style={{
                display: 'block', margin: '16px auto 0', background: 'none',
                border: '1px solid rgba(255,255,255,0.08)', color: '#444',
                fontSize: 13, padding: '8px 20px', borderRadius: 8, cursor: 'pointer',
              }}
            >
              Start new session
            </button>
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  )
}
