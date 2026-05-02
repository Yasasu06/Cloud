'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { routeForQuery } from '@/lib/smartRouter'

interface LastRec { provider: string; confidence: number }

const HERO_CHIPS = [
  { emoji: '💸', text: 'My AWS bill doubled', q: 'My AWS bill doubled this month' },
  { emoji: '🏗️', text: 'Designing a SaaS app', q: 'Designing a SaaS app architecture' },
  { emoji: '🌍', text: 'Considering DigitalOcean', q: 'Considering DigitalOcean as an alternative' },
  { emoji: '🤖', text: 'OpenAI costs are killing me', q: 'OpenAI costs are killing me - need to reduce LLM spend' },
  { emoji: '🎁', text: 'Tracking startup credits', q: 'Tracking my startup credits across providers' },
  { emoji: '🏥', text: 'HIPAA compliance check', q: 'HIPAA compliance check for healthcare workload' },
]

const PROVIDER_LIST = [
  { name: 'AWS',          color: '#f59e0b', desc: 'Market leader' },
  { name: 'Azure',        color: '#0078D4', desc: 'Microsoft ecosystem' },
  { name: 'GCP',          color: '#4285f4', desc: 'AI-first cloud' },
  { name: 'DigitalOcean', color: '#0080ff', desc: 'Developer-friendly' },
  { name: 'Hetzner',      color: '#e63946', desc: 'Best price/perf' },
  { name: 'Linode',       color: '#02b159', desc: 'Simple & affordable' },
  { name: 'Vultr',        color: '#007bfc', desc: 'Global edge' },
  { name: 'Cloudflare',   color: '#f6821f', desc: 'Edge serverless' },
  { name: 'Oracle',       color: '#c0392b', desc: 'Generous free tier' },
  { name: 'OVH',          color: '#123f6d', desc: 'European leader' },
  { name: 'Render',       color: '#46e3b7', desc: 'Heroku replacement' },
  { name: 'Railway',      color: '#b044f8', desc: 'Modern dev platform' },
]

const DEMO_LINES = [
  { text: 'Analyzing your AWS bill...', color: '#a0a0b0', delay: 0 },
  { text: '🔍 Found 18% waste in EC2 instances (14 underutilized)', color: '#f59e0b', delay: 1400 },
  { text: '💡 Recommend: Reserved Instances for db.t3.large (3 found)', color: '#818cf8', delay: 2800 },
  { text: '💰 Estimated savings: $1,847/month · $22,164/year', color: '#22c55e', delay: 4200 },
  { text: '📋 Generating your 30-day action plan...', color: '#a0a0b0', delay: 5400 },
  { text: '✅ Analysis complete', color: '#22c55e', delay: 6400 },
]

function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [lastRec, setLastRec] = useState<LastRec | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [particles, setParticles] = useState<Array<{ x: number; y: number; size: number; dur: number; delay: number }>>([])
  const [visibleLines, setVisibleLines] = useState(0)
  const demoRef = useRef<NodeJS.Timeout | null>(null)

  function submit(q: string) {
    if (!q.trim()) return
    router.push(routeForQuery(q.trim()))
  }

  useEffect(() => {
    const handle = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handle)
    return () => window.removeEventListener('mousemove', handle)
  }, [])

  useEffect(() => {
    setParticles(Array.from({ length: 20 }, () => ({
      x: Math.random() * 100, y: Math.random() * 100,
      size: 1 + Math.random() * 2, dur: 8 + Math.random() * 7, delay: Math.random() * 5,
    })))
  }, [])

  useEffect(() => {
    async function loadLastRec() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data } = await supabase.from('saved_recommendations')
        .select('*').eq('user_id', session.user.id)
        .order('created_at', { ascending: false }).limit(1).single()
      if (data) setLastRec(data)
    }
    loadLastRec()
  }, [])

  // Cycling demo animation
  useEffect(() => {
    function runDemo() {
      setVisibleLines(0)
      DEMO_LINES.forEach((line, i) => {
        const t = setTimeout(() => setVisibleLines(i + 1), line.delay + 300)
        return t
      })
      // Reset and loop after all lines shown + pause
      demoRef.current = setTimeout(runDemo, 9500)
    }
    runDemo()
    return () => { if (demoRef.current) clearTimeout(demoRef.current) }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#050508', color: 'white' }}>

      {/* Returning user banner */}
      {lastRec && (
        <div style={{ background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.15)', padding: '10px 24px', textAlign: 'center', fontSize: 14 }}>
          Welcome back — your last recommendation was{' '}
          <strong style={{ color: '#6366f1' }}>{lastRec.provider}</strong>{' '}
          ({lastRec.confidence}% match){' '}
          <a href="/dashboard" style={{ color: '#6366f1', marginLeft: 8 }}>View Dashboard →</a>
        </div>
      )}

      {/* ── SECTION 1: HERO ──────────────────────────────────────────── */}
      <section style={{
        position: 'relative', minHeight: '92vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '100px 24px 80px', textAlign: 'center', overflow: 'hidden',
        background: 'radial-gradient(ellipse at 20% 40%, rgba(99,102,241,0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 10%, rgba(139,92,246,0.12) 0%, transparent 55%), #050508',
      }}>
        {/* Mouse-follow glow */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99,102,241,0.06), transparent 70%)` }} />
        {/* 5 Orbs */}
        <div style={{ position: 'absolute', top: '-100px', left: '-80px', width: 600, height: 600, background: 'rgba(99,102,241,0.14)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none', animation: 'orbFloat 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '40px', right: '-80px', width: 400, height: 400, background: 'rgba(139,92,246,0.1)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none', animation: 'orbFloat 10s ease-in-out 2s infinite' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, background: 'rgba(59,130,246,0.08)', borderRadius: '50%', filter: 'blur(150px)', pointerEvents: 'none', animation: 'orbFloat 12s ease-in-out 1s infinite' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '-60px', width: 350, height: 350, background: 'rgba(236,72,153,0.06)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none', animation: 'orbFloat 14s ease-in-out 3s infinite' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '-60px', width: 300, height: 300, background: 'rgba(6,182,212,0.06)', borderRadius: '50%', filter: 'blur(90px)', pointerEvents: 'none', animation: 'orbFloat 9s ease-in-out 4s infinite' }} />
        {/* Particles */}
        {particles.map((p, i) => (
          <div key={i} className="particle" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }} />
        ))}

        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} style={{ maxWidth: 760, position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 18px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 28, letterSpacing: 1 }}>
            ⚡ BUILT FOR THE AI ERA OF CLOUD COMPUTING
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(40px, 7vw, 88px)', fontWeight: 900, lineHeight: 1.0, marginBottom: 24, letterSpacing: '-0.02em' }}>
            <span className="shimmer-text">Stop flying blind</span>
            <br />
            <span style={{ color: 'white' }}>on your cloud bill.</span>
          </h1>

          {/* Subheadline */}
          <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: '#a0a0b0', lineHeight: 1.6, maxWidth: 600, margin: '0 auto 40px' }}>
            AI-powered cloud advisor that explains your spend, finds waste, and gives you a 30-day action plan. In plain English. In 30 seconds.
          </p>

          {/* Smart routing input */}
          <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto 20px' }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit(query)}
              placeholder="Describe your cloud situation in plain English..."
              style={{
                width: '100%', padding: '20px 130px 20px 24px', fontSize: 17,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(99,102,241,0.25)',
                borderRadius: 16, color: 'white', outline: 'none', boxSizing: 'border-box',
              }}
            />
            <button
              onClick={() => submit(query)}
              disabled={!query.trim()}
              className={query.trim() ? 'animate-glow' : ''}
              style={{
                position: 'absolute', right: 8, top: 8, bottom: 8,
                padding: '0 22px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                background: query.trim() ? '#6366f1' : 'rgba(99,102,241,0.25)',
                color: 'white', border: 'none',
                cursor: query.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Go →
            </button>
          </div>

          {/* Example chips */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 720, margin: '0 auto 24px' }}>
            {HERO_CHIPS.map(c => (
              <button
                key={c.text}
                onClick={() => submit(c.q)}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 20, padding: '7px 14px', fontSize: 13,
                  color: '#a0a0b0', fontWeight: 500, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.4)'; (e.currentTarget as HTMLElement).style.color = 'white' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = '#a0a0b0' }}
              >
                {c.emoji} {c.text}
              </button>
            ))}
          </div>

          {/* /for-you link */}
          <a href="/for-you" style={{ display: 'inline-block', color: '#818cf8', fontSize: 13, textDecoration: 'none', fontWeight: 600, marginBottom: 28 }}>
            Or browse tools by your role →
          </a>

          {/* Trust line */}
          <p style={{ color: '#555', fontSize: 13 }}>
            No credit card &nbsp;·&nbsp; 12 providers covered &nbsp;·&nbsp; Trusted by founders managing $2.4M cloud spend
          </p>
        </motion.div>
      </section>

      {/* ── SECTION 2: PROOF ────────────────────────────────��────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'linear-gradient(180deg, #050508 0%, #080810 100%)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <FadeInSection>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div style={{ fontSize: 'clamp(52px, 9vw, 96px)', fontWeight: 900, color: '#6366f1', lineHeight: 1, marginBottom: 8 }}>$2.4M+</div>
              <div style={{ fontSize: 18, color: '#a0a0b0', fontWeight: 500 }}>in cloud spend analyzed by founders using this platform</div>
            </div>
          </FadeInSection>
          <FadeInSection delay={0.1}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {[
                { value: '28%', label: 'Average waste found', sub: 'Of monthly cloud spend' },
                { value: '30s', label: 'Average analysis time', sub: 'From input to action plan' },
                { value: '12+', label: 'Providers covered', sub: 'Including alternatives' },
              ].map(s => (
                <div key={s.label} style={{ padding: '28px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, color: 'white', lineHeight: 1, marginBottom: 8 }}>{s.value}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: '#555' }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ── SECTION 3: LIVE DEMO PREVIEW ───────────────────────────��─── */}
      <section id="demo-preview" style={{ padding: '80px 24px', background: '#080810', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <FadeInSection>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <p style={{ color: '#555', fontSize: 13, letterSpacing: 2, marginBottom: 12 }}>LIVE PREVIEW</p>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, marginBottom: 12 }}>See it in action</h2>
              <p style={{ color: '#a0a0b0', fontSize: 15 }}>This is what your analysis looks like — before you even sign up.</p>
            </div>
          </FadeInSection>
          <FadeInSection delay={0.15}>
            <div style={{ background: '#0d0d18', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 20, padding: 28, fontFamily: 'monospace', boxShadow: '0 0 60px rgba(99,102,241,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
                <span style={{ marginLeft: 8, color: '#555', fontSize: 12 }}>cloud-intelligence — analysis</span>
              </div>
              <div style={{ minHeight: 180 }}>
                {DEMO_LINES.slice(0, visibleLines).map((line, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12, animation: 'pageEnter 0.3s ease-out' }}>
                    <span style={{ color: '#333', fontSize: 12, userSelect: 'none', flexShrink: 0, marginTop: 2 }}>$</span>
                    <span style={{ color: line.color, fontSize: 14, lineHeight: 1.5 }}>{line.text}</span>
                  </div>
                ))}
                {visibleLines > 0 && visibleLines < DEMO_LINES.length && (
                  <div style={{ display: 'flex', gap: 8, paddingLeft: 22 }}>
                    <span style={{ display: 'inline-block', width: 8, height: 16, background: '#6366f1', borderRadius: 2, animation: 'pulseRing 1s ease-out infinite' }} />
                  </div>
                )}
              </div>
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'center' }}>
                <a href="/instant-audit" style={{ background: '#6366f1', borderRadius: 10, padding: '10px 24px', color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none', display: 'inline-block' }}>
                  Run this on your actual bill →
                </a>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ── SECTION 4: HOW IT WORKS (3 steps) ───────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <FadeInSection>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <p style={{ color: '#555', fontSize: 13, letterSpacing: 2, marginBottom: 12 }}>HOW IT WORKS</p>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, marginBottom: 12 }}>Three steps to clarity</h2>
              <p style={{ color: '#a0a0b0', fontSize: 15 }}>No account required. No credit card. No setup.</p>
            </div>
          </FadeInSection>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              { step: '01', icon: '💬', title: 'Describe your setup', desc: 'Tell us your cloud provider, monthly spend, and biggest frustration. Plain English — no forms or integrations required.', href: '/analyze' },
              { step: '02', icon: '🔍', title: 'Get AI analysis in 30 seconds', desc: 'Our AI breaks down your bill, identifies waste, and gives you specific dollar amounts for every savings opportunity.', href: '/analyze' },
              { step: '03', icon: '⚡', title: 'Follow your action plan', desc: 'Every recommendation includes step-by-step console instructions, expected savings, and effort level.', href: '/advisor' },
            ].map((item, i) => (
              <FadeInSection key={i} delay={i * 0.1}>
                <a href={item.href} style={{ textDecoration: 'none', display: 'block' }}>
                  <div className="glass-card" style={{ padding: 32, height: '100%' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.3)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                      <span style={{ fontSize: 36 }}>{item.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', letterSpacing: 2 }}>STEP {item.step}</span>
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: 'white' }}>{item.title}</h3>
                    <p style={{ color: '#a0a0b0', fontSize: 14, lineHeight: 1.65 }}>{item.desc}</p>
                    <div style={{ marginTop: 20, fontSize: 13, color: '#6366f1', fontWeight: 600 }}>Get started →</div>
                  </div>
                </a>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: WHO USES THIS ─────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: '#080810', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <FadeInSection>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <p style={{ color: '#555', fontSize: 13, letterSpacing: 2, marginBottom: 12 }}>BUILT FOR</p>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900 }}>Who uses Cloud Intelligence</h2>
            </div>
          </FadeInSection>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              { icon: '🚀', role: 'Startup Founders', tagline: 'Stop wasting credits', desc: 'You have $25K in AWS credits and a growing bill you can\'t explain. Get a clear breakdown and stop burning runway.', href: '/advisor', cta: 'Get founder advice', color: '#6366f1' },
              { icon: '🏢', role: 'IT Managers', tagline: 'Clarity on your bill', desc: 'Monthly cloud costs are rising faster than your revenue. Identify waste, justify the bill to leadership, and build a savings plan.', href: '/instant-audit', cta: 'Run an audit', color: '#22c55e' },
              { icon: '💼', role: 'Consultants', tagline: 'White-label reports', desc: 'Deliver professional cloud cost analysis to clients under your brand. Generate reports in seconds, not weeks.', href: '/for-consultants?tab=white-label', cta: 'Explore white label', color: '#f59e0b' },
            ].map((card, i) => (
              <FadeInSection key={i} delay={i * 0.1}>
                <a href={card.href} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                  <div style={{
                    padding: 32, borderRadius: 20, height: '100%', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.07)`,
                    transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column',
                  }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${card.color}40`; el.style.background = `${card.color}08` }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.background = 'rgba(255,255,255,0.02)' }}
                  >
                    <div style={{ fontSize: 40, marginBottom: 16 }}>{card.icon}</div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: card.color, letterSpacing: 2, marginBottom: 8 }}>FOR {card.role.toUpperCase()}</p>
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 12 }}>{card.tagline}</h3>
                    <p style={{ color: '#a0a0b0', fontSize: 14, lineHeight: 1.65, flex: 1, marginBottom: 24 }}>{card.desc}</p>
                    <span style={{ color: card.color, fontSize: 13, fontWeight: 700 }}>{card.cta} →</span>
                  </div>
                </a>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12 PROVIDERS COVERED ─────────────────────────────────────── */}
      <section style={{ padding: '72px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <FadeInSection>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <p style={{ color: '#555', fontSize: 13, letterSpacing: 2, marginBottom: 12 }}>EQUAL WEIGHT, NO SPONSORSHIPS</p>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, marginBottom: 12 }}>12 providers covered</h2>
              <p style={{ color: '#a0a0b0', fontSize: 15, maxWidth: 520, margin: '0 auto' }}>
                We don&apos;t just compare AWS, Azure, and GCP. Alternatives often deliver better value for startups — we treat all providers equally.
              </p>
            </div>
          </FadeInSection>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
            {PROVIDER_LIST.map(p => (
              <a key={p.name} href={`/compare?provider=${encodeURIComponent(p.name)}`}
                style={{
                  padding: '16px 14px', borderRadius: 12, textDecoration: 'none',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderLeft: `3px solid ${p.color}`,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)' }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: '#666' }}>{p.desc}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: TRUST BADGES ──────────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <FadeInSection>
            <p style={{ color: '#555', fontSize: 13, letterSpacing: 2, textAlign: 'center', marginBottom: 48 }}>WHY FOUNDERS TRUST CLOUD INTELLIGENCE</p>
          </FadeInSection>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { icon: '🛡️', title: '100% Vendor Neutral', desc: 'We never take partner commissions from AWS, Azure, or GCP. Our advice favors what\'s best for you — including recommending cheaper alternatives.', color: '#6366f1' },
              { icon: '📊', title: 'Verified Pricing Data', desc: `Every dollar amount we cite is backed by the cloud provider's published pricing as of ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.`, color: '#22c55e' },
              { icon: '✅', title: 'Performance Guarantee', desc: "With our Pay-Per-Saving plan, you only pay when we deliver verified savings. Zero risk — if we don't save you money, you pay nothing.", color: '#f59e0b' },
            ].map(badge => (
              <FadeInSection key={badge.title}>
                <div style={{ padding: '32px 28px', borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.07)`, transition: 'border-color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${badge.color}40` }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)' }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: `${badge.color}15`, border: `1px solid ${badge.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 20 }}>
                    {badge.icon}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 10 }}>{badge.title}</div>
                  <div style={{ fontSize: 14, color: '#a0a0b0', lineHeight: 1.65 }}>{badge.desc}</div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 7: FINAL CTA ─────────────────────────────────────── */}
      <section style={{ padding: '100px 24px', background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%), #080810', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
        <FadeInSection>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}>
              Ready to find your<br /><span className="shimmer-text">cloud waste?</span>
            </h2>
            <p style={{ color: '#a0a0b0', fontSize: 17, marginBottom: 40 }}>Get your free 30-second audit. No signup required to try.</p>
            <a href="/instant-audit" className="btn-primary animate-glow" style={{ fontSize: 18, padding: '16px 40px', display: 'inline-block', marginBottom: 16 }}>
              Start Free Audit →
            </a>
            <p style={{ color: '#555', fontSize: 13 }}>No signup required &nbsp;·&nbsp; Results in 30 seconds &nbsp;·&nbsp; 100% free</p>
          </div>
        </FadeInSection>
      </section>

      {/* ── TRUSTED DATA SOURCES ─────────────────────��───────────────── */}
      <section style={{ padding: '40px 24px 60px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <p style={{ color: '#333', fontSize: 12, marginBottom: 20, letterSpacing: 2 }}>TRUSTED DATA SOURCES</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
          {['SEC Filings & Earnings Reports', 'Synergy Research Group', 'FinOps Foundation 2025', 'Flexera State of Cloud'].map(s => (
            <div key={s} style={{ color: '#444', fontSize: 13 }}>{s}</div>
          ))}
        </div>
      </section>

    </div>
  )
}
