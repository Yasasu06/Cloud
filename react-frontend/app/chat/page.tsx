'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED_QUESTIONS = [
  "I'm a startup with 5 engineers and $500/month budget — which cloud should I use?",
  "We're on AWS but our bills are getting out of control. What should we do?",
  "I need to build an AI app — which cloud has the best ML tools?",
  "We need HIPAA compliance. Which provider makes this easiest?",
  "How hard is it to migrate from AWS to Azure?",
  "What's the cheapest cloud for a personal project?",
]

const SYSTEM_PROMPT = `You are an expert cloud computing consultant specializing in AWS, Azure, Google Cloud Platform, and alternative providers like DigitalOcean, Hetzner, Vultr, and Oracle Cloud. You give direct, opinionated, practical advice based on real-world experience. You are independent and unbiased — you recommend whatever is genuinely best for the user's situation, not what's most popular. Keep answers concise but complete. Use markdown formatting with bold headings where helpful. Always ask follow-up questions if you need more context to give a better recommendation.`

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm your Cloud Intelligence consultant. I can help you choose the right cloud provider, optimize costs, plan migrations, and navigate compliance requirements. What's on your mind?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

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
            { role: 'system', content: SYSTEM_PROMPT },
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
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>☁️ Cloud AI Consultant</h1>
          <p style={{ color: '#a0a0b0' }}>
            Ask anything about cloud — get expert, unbiased answers instantly.
          </p>
        </div>

        {/* Suggested questions — only shown before user sends first message */}
        {messages.length === 1 && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ color: '#a0a0b0', fontSize: 13, marginBottom: 12 }}>SUGGESTED QUESTIONS</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  style={{
                    background: '#1a1a2e',
                    border: '1px solid #ffffff15',
                    borderRadius: 20,
                    padding: '8px 16px',
                    color: '#a0a0b0',
                    cursor: 'pointer',
                    fontSize: 13,
                    textAlign: 'left',
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
              <div
                style={{
                  background: '#1a1a2e',
                  borderRadius: '18px 18px 18px 4px',
                  padding: '12px 16px',
                }}
              >
                <span style={{ color: '#a0a0b0' }}>Thinking…</span>
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
