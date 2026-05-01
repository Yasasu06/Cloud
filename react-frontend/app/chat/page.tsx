'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED_QUESTIONS = [
  "Why is my AWS bill so high?",
  "Should I switch from AWS to Azure?",
  "How do I reduce my cloud costs by 30%?",
]

const SYSTEM_PROMPT = `You are an expert cloud computing consultant specializing in AWS, Azure, Google Cloud Platform, and alternative providers like DigitalOcean, Hetzner, Vultr, and Oracle Cloud. You give direct, opinionated, practical advice based on real-world experience. You are independent and unbiased — you recommend whatever is genuinely best for the user's situation, not what's most popular. Keep answers concise but complete. Use markdown formatting with bold headings where helpful. Always ask follow-up questions if you need more context to give a better recommendation.`

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Hi! I'm your Cloud Intelligence consultant. I can help you understand your cloud bill, find waste, plan migrations, and navigate compliance. What's your biggest cloud challenge right now?",
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [userContext, setUserContext] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadContext() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data } = await supabase
        .from('saved_recommendations')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (data) {
        const rec = data as {
          provider: string
          confidence: number
          workload: string
          team_size: string
          budget: string
          industry?: string
          spend?: string
          monthly_spend?: string
        }
        const parts: string[] = [
          `Last cloud analysis: ${rec.workload} mode, recommended ${rec.provider}`,
        ]
        if (rec.team_size) parts.push(`team size: ${rec.team_size}`)
        if (rec.budget) parts.push(`budget: ${rec.budget}`)
        if (rec.spend || rec.monthly_spend) parts.push(`monthly spend: ${rec.spend || rec.monthly_spend}`)
        if (rec.industry) parts.push(`industry: ${rec.industry}`)
        setUserContext(parts.join(', ') + '. Use this context to give personalized cloud advice.')
      }
    }
    loadContext()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    if (q && messages.length === 1) {
      sendMessage(q)
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function checkAndIncrementQueries(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return true

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, ai_queries_today, queries_reset_date')
      .eq('id', session.user.id)
      .single()

    if (!profile) return true

    const today = new Date().toISOString().split('T')[0]
    if (profile.queries_reset_date !== today) {
      await supabase.from('profiles').update({
        ai_queries_today: 0,
        queries_reset_date: today,
      }).eq('id', session.user.id)
      return true
    }

    if (profile.plan === 'free' && profile.ai_queries_today >= 3) {
      return false
    }

    await supabase.from('profiles').update({
      ai_queries_today: profile.ai_queries_today + 1,
    }).eq('id', session.user.id)

    return true
  }

  async function sendMessage(text?: string) {
    const userText = text || input.trim()
    if (!userText || loading) return

    const allowed = await checkAndIncrementQueries()
    if (!allowed) {
      setMessages([...messages,
        { role: 'user', content: userText },
        {
          role: 'assistant',
          content: "You've reached your daily limit of 3 free AI queries. Upgrade to Pro for unlimited access → [cloudintelligence.io/pricing](/pricing)",
        },
      ])
      setInput('')
      return
    }

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userText },
    ]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1000,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT + (userContext ? `\n\nUSER CONTEXT: ${userContext} Use this context to give personalized answers.` : '') },
            ...newMessages.map(m => ({ role: m.role, content: m.content })),
          ],
        }),
      })
      const data = await response.json()
      const reply = data.choices?.[0]?.message?.content ||
        'Sorry, I could not get a response. Please try again.'
      setMessages([...newMessages, { role: 'assistant', content: reply }])
    } catch {
      setMessages([...newMessages, {
        role: 'assistant',
        content: 'Connection error. Please try again.',
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          maxWidth: 800,
          margin: '0 auto',
          width: '100%',
          padding: '80px 24px 0',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Ask Your Cloud Consultant</h1>
          <p style={{ color: '#a0a0b0' }}>
            I know your cloud situation. Ask me anything.
          </p>
        </div>

        {/* Suggested questions — only shown before user sends first message */}
        {messages.length === 1 && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ color: '#666', fontSize: 11, fontWeight: 600, marginBottom: 10, letterSpacing: 1 }}>SUGGESTED</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); sendMessage(q) }}
                  style={{
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.4)',
                    borderRadius: 20,
                    padding: '8px 16px',
                    color: '#a0a0b0',
                    cursor: 'pointer',
                    fontSize: 13,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(99,102,241,0.18)'
                    e.currentTarget.style.color = '#ffffff'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(99,102,241,0.08)'
                    e.currentTarget.style.color = '#a0a0b0'
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message list */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            marginBottom: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            minHeight: 300,
            maxHeight: 500,
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '75%',
                  background: msg.role === 'user' ? '#6366f1' : '#1a1a2e',
                  borderRadius:
                    msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding: '12px 16px',
                  fontSize: 15,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <style>{`
                @keyframes typingBounce {
                  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                  30% { transform: translateY(-6px); opacity: 1; }
                }
              `}</style>
              <div style={{
                background: '#1a1a2e',
                borderRadius: '18px 18px 18px 4px',
                padding: '14px 18px',
                display: 'flex',
                gap: 5,
                alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    display: 'inline-block',
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#6366f1',
                    animation: `typingBounce 1.2s ease infinite`,
                    animationDelay: `${i * 0.2}s`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            background: '#0a0a0f',
            paddingBottom: 24,
            paddingTop: 8,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 12,
              background: '#1a1a2e',
              borderRadius: 16,
              padding: '8px 8px 8px 16px',
              border: '1px solid #ffffff10',
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask about cloud pricing, migration, architecture…"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'white',
                fontSize: 15,
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                background: '#6366f1',
                border: 'none',
                borderRadius: 12,
                padding: '10px 20px',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600,
                opacity: loading || !input.trim() ? 0.5 : 1,
              }}
            >
              Send
            </button>
          </div>
          <p
            style={{
              color: '#ffffff30',
              fontSize: 11,
              textAlign: 'center',
              marginTop: 8,
            }}
          >
            Powered by Groq · Llama 3 · Unbiased · Independent analysis
          </p>
        </div>
      </div>
    </div>
  )
}
