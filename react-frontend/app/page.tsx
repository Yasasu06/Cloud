'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

interface LastRec {
  provider: string
  confidence: number
}

const SCENARIOS = [
  "We're on AWS spending $12k/month. Bill doubled last quarter and we don't know why.",
  "Starting a healthcare app. Which cloud do I need for HIPAA compliance?",
  "Running on GCP for ML. Spending $8k/month but models only train twice a week.",
]

export default function HomePage() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [lastRec, setLastRec] = useState<LastRec | null>(null)
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [scenarioVisible, setScenarioVisible] = useState(true)
  const [counts, setCounts] = useState({ b855: 0, pct32: 0, n9: 0 })
  const statsRef = useRef<HTMLDivElement>(null)
  const hasCountedRef = useRef(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setScenarioVisible(false)
      setTimeout(() => {
        setScenarioIndex(i => (i + 1) % SCENARIOS.length)
        setScenarioVisible(true)
      }, 300)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasCountedRef.current) {
        hasCountedRef.current = true
        const steps = 60
        const intervalMs = 1500 / steps
        let step = 0
        const timer = setInterval(() => {
          step++
          const p = step / steps
          setCounts({ b855: Math.round(855 * p), pct32: Math.round(32 * p), n9: Math.round(9 * p) })
          if (step >= steps) clearInterval(timer)
        }, intervalMs)
      }
    }, { threshold: 0.3 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setHasProfile(!!localStorage.getItem('cloud_twin_profile'))
  }, [])

  useEffect(() => {
    async function loadLastRec() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data } = await supabase
        .from('saved_recommendations')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (data) setLastRec(data)
    }
    loadLastRec()
  }, [])

  const [emailInput, setEmailInput] = useState('')
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)

  function handleSubmit() {
    if (input.trim()) {
      window.location.href = `/analyze?q=${encodeURIComponent(input)}`
    }
  }

  async function handleEmailSubmit() {
    if (!emailInput.trim() || emailLoading) return
    setEmailLoading(true)
    try {
      await supabase.from('email_subscribers').insert({
        email: emailInput.trim(),
        source: 'homepage',
      })
    } catch { /* capture silently */ } finally {
      setEmailSubmitted(true)
      setEmailLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050508', color: 'white' }}>
      {lastRec && (
        <div style={{
          background: 'rgba(99,102,241,0.08)',
          borderBottom: '1px solid rgba(99,102,241,0.15)',
          padding: '10px 24px',
          textAlign: 'center',
          fontSize: 14,
        }}>
          Welcome back — your last recommendation was{' '}
          <strong style={{ color: '#6366f1' }}>{lastRec.provider}</strong>
          {' '}({lastRec.confidence}% match){' '}
          <a href="/dashboard" style={{ color: '#6366f1', marginLeft: 8 }}>
            View Dashboard →
          </a>
        </div>
      )}

      {/* HERO */}
      <section style={{
        position: 'relative',
        minHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        textAlign: 'center',
        background: 'radial-gradient(ellipse at top, #1a1040 0%, #050508 70%), radial-gradient(circle, #ffffff08 1px, transparent 1px)',
        backgroundSize: 'auto, 32px 32px',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '-200px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: 720 }}
        >
          <div style={{
            display: 'inline-block',
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 20,
            padding: '6px 16px',
            fontSize: 12,
            color: '#22c55e',
            fontWeight: 600,
            marginBottom: 24,
            letterSpacing: 2,
          }}>
            100% VENDOR NEUTRAL · NO AWS/AZURE/GCP SPONSORSHIP
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: 24,
          }}>
            Your cloud bill explained.
            <br />
            <span className="gradient-text">Your waste eliminated.</span>
            <br />
            In plain English.
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: '#a0a0b0',
            marginBottom: 40,
            lineHeight: 1.6,
          }}>
            Describe your cloud situation and get a specific, actionable
            analysis — not generic advice. Built for founders and IT managers
            who can&apos;t afford a $300/hour cloud consultant.
          </p>

          <div style={{
            background: '#1a1a2e',
            borderRadius: 16,
            padding: '8px 8px 8px 20px',
            border: '1px solid #ffffff15',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            maxWidth: 640,
            margin: '0 auto 16px',
          }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder=""
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'white',
                  fontSize: 15,
                  padding: '8px 0',
                  boxSizing: 'border-box',
                }}
              />
              {!input && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                    color: '#666',
                    fontSize: 14,
                    opacity: scenarioVisible ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {SCENARIOS[scenarioIndex]}
                </div>
              )}
            </div>
            <button
              onClick={handleSubmit}
              className="btn-primary"
              style={{ whiteSpace: 'nowrap', padding: '12px 24px', fontSize: 15 }}
            >
              Analyze →
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            {[
              '🔒 Vendor Neutral — No AWS/Azure/GCP partnerships',
              '⚡ Results in 30 seconds',
              '🆓 Free — No credit card required',
            ].map(badge => (
              <span key={badge} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 20,
                padding: '6px 14px',
                fontSize: 12,
                color: '#a0a0b0',
                fontWeight: 500,
              }}>
                {badge}
              </span>
            ))}
          </div>

          {/* Email capture */}
          <div style={{ marginBottom: 40, textAlign: 'center' }}>
            {!emailSubmitted ? (
              <div style={{
                display: 'inline-flex',
                gap: 8,
                background: '#1a1a2e',
                borderRadius: 12,
                padding: '6px 6px 6px 16px',
                border: '1px solid #ffffff0d',
                maxWidth: 380,
                width: '100%',
              }}>
                <input
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()}
                  placeholder="Get weekly cloud cost tips"
                  type="email"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#a0a0b0',
                    fontSize: 13,
                    minWidth: 0,
                  }}
                />
                <button
                  onClick={handleEmailSubmit}
                  disabled={emailLoading || !emailInput.trim()}
                  style={{
                    background: '#6366f1',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 14px',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: emailLoading || !emailInput.trim() ? 'not-allowed' : 'pointer',
                    opacity: emailLoading || !emailInput.trim() ? 0.5 : 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Subscribe
                </button>
              </div>
            ) : (
              <p style={{ color: '#22c55e', fontSize: 13 }}>✓ Thanks! Check your inbox.</p>
            )}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 32,
            flexWrap: 'wrap',
            marginBottom: 60,
          }}>
            {[
              { icon: '🔍', text: 'Bill explanation' },
              { icon: '💸', text: 'Waste identification' },
              { icon: '🗺️', text: 'Migration planning' },
              { icon: '📊', text: 'Cost projections' },
              { icon: '🛡️', text: 'Compliance guidance' },
            ].map(item => (
              <div key={item.text} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#a0a0b0',
                fontSize: 14,
              }}>
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* WHERE TO START — new users only */}
      {hasProfile === false && (
        <section style={{ padding: '72px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, marginBottom: 10 }}>
                Where do you want to start?
              </h2>
              <p style={{ color: '#a0a0b0', fontSize: 15 }}>Pick what fits your situation best.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              {[
                { icon: '🌱', title: "I'm new to cloud", desc: 'Help me choose the right cloud for my project', href: '/advisor' },
                { icon: '💸', title: 'I have a bill problem', desc: 'Explain my bill and find waste', href: '/analyze' },
                { icon: '🔄', title: 'I want to switch providers', desc: 'Evaluate my options', href: '/analyze' },
              ].map(card => (
                <button
                  key={card.title}
                  onClick={() => router.push(card.href)}
                  className="glass-card"
                  style={{ padding: '32px 24px', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                >
                  <div style={{ fontSize: 36, marginBottom: 16 }}>{card.icon}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 8 }}>{card.title}</div>
                  <div style={{ fontSize: 14, color: '#a0a0b0', lineHeight: 1.5 }}>{card.desc}</div>
                  <div style={{ marginTop: 20, fontSize: 13, color: '#6366f1', fontWeight: 600 }}>Get started →</div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SOCIAL PROOF / CREDIBILITY */}
      <section style={{ padding: '60px 24px', borderTop: '1px solid #ffffff08', textAlign: 'center' }}>
        <p style={{ color: '#666', fontSize: 13, marginBottom: 32, letterSpacing: 2 }}>
          TRUSTED DATA SOURCES
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
          {[
            'SEC Filings & Earnings Reports',
            'Synergy Research Group',
            'FinOps Foundation 2025',
            'Flexera State of Cloud',
          ].map(source => (
            <div key={source} style={{ color: '#a0a0b0', fontSize: 14 }}>{source}</div>
          ))}
        </div>
      </section>

      {/* THE PROBLEM WE SOLVE */}
      <section style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 800,
            marginBottom: 16,
            textAlign: 'center',
          }}>
            Sound familiar?
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
            marginTop: 40,
          }}>
            {[
              {
                quote: '"The bill is a complete black box. I can see EC2 and S3 but when I see Data Transfer costing $2,000 I have no idea which microservice caused it."',
                role: 'CTO, SaaS Startup',
              },
              {
                quote: '"We had a $4,000 spike in one weekend because a developer left a NAT Gateway running in staging. It took weeks to get a refund from AWS."',
                role: 'Founder, B2B Platform',
              },
              {
                quote: '"I know we have orphaned resources wasting money every month. But finding them in the AWS Console is like finding a needle in a haystack."',
                role: 'IT Manager, 80-person company',
              },
            ].map((item, i) => (
              <div key={i} className="glass-card" style={{ padding: 24, borderLeft: '4px solid #6366f1' }}>
                <p style={{
                  color: '#e0e0e0',
                  fontSize: 14,
                  lineHeight: 1.7,
                  marginBottom: 16,
                  fontStyle: 'italic',
                }}>
                  {item.quote}
                </p>
                <p style={{ color: '#666', fontSize: 12 }}>{item.role}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '80px 24px', background: '#0d0d16', borderTop: '1px solid #ffffff08' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, marginBottom: 16 }}>
            How it works
          </h2>
          <p style={{ color: '#a0a0b0', marginBottom: 60, fontSize: 16 }}>
            No setup. No account connection required. Results in 30 seconds.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {[
              {
                step: '01',
                title: 'Describe your situation',
                desc: 'Tell us your cloud provider, monthly spend, team size, and biggest frustration. Plain English — no forms.',
                icon: '💬',
              },
              {
                step: '02',
                title: 'Get your analysis',
                desc: "Our AI gives you a specific breakdown — what you're paying for, where you're wasting money, and exactly what to do next.",
                icon: '🔍',
              },
              {
                step: '03',
                title: 'Take action',
                desc: 'Follow your personalized plan. Every recommendation includes the specific steps, services, and expected savings.',
                icon: '⚡',
              },
              {
                step: '04',
                title: 'Track progress',
                desc: 'Save your analysis, share with your team, and come back as your situation changes.',
                icon: '📈',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card"
                style={{ padding: 28, textAlign: 'left' }}
              >
                <div style={{ fontSize: 32, marginBottom: 16 }}>{item.icon}</div>
                <div style={{ color: '#6366f1', fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>
                  STEP {item.step}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{item.title}</h3>
                <p style={{ color: '#a0a0b0', fontSize: 14, lineHeight: 1.6 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MARKET PULSE — condensed */}
      <section style={{ padding: '60px 24px', maxWidth: 900, margin: '0 auto' }}>
        <div ref={statsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {[
            { value: '$855B', label: 'Cloud market 2026', sub: 'Growing 19% annually' },
            { value: '32%', label: 'Average cloud waste', sub: 'Of monthly spend wasted' },
            { value: '$0', label: 'Cost to start', sub: 'No credit card required' },
            { value: '9+', label: 'Providers compared', sub: 'Including alternatives' },
          ].map(stat => (
            <div key={stat.label} className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#6366f1', marginBottom: 4 }}>
                {stat.label === 'Cloud market 2026' ? `$${counts.b855}B`
                  : stat.label === 'Average cloud waste' ? `${counts.pct32}%`
                  : stat.label === 'Providers compared' ? `${counts.n9}+`
                  : stat.value}
              </div>
              <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 14 }}>{stat.label}</div>
              <div style={{ color: '#666', fontSize: 12 }}>{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
