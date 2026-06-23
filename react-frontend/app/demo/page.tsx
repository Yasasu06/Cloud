'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

// ─── /demo — isolated portfolio hub (2026 redesign) ──────────────────────────
//
// Shared with recruiters/hiring managers. Stripe/Linear-level craft: a flowing
// mesh-gradient backdrop (no blobs, no particles), a "live result" product
// preview in the hero, and a bento card grid. The root layout injects global
// chrome on every route; the <style> block below neutralizes it for this page
// only (this page renders its own <header> + <div role="contentinfo"> footer,
// so neither is hit).

const HIDE_GLOBAL_CHROME = `
  nav,
  .ticker-wrap,
  body footer { display: none !important; }
  div:has(> a[href="/dashboard"]) { display: none !important; }
`

const MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace'

interface Tool {
  emoji: string
  name: string
  problem: string
  bullets: string[]
  cta: string
  href: string
  badge?: string
}

const TOOLS: Tool[] = [
  {
    emoji: '📊',
    name: 'Cloud Bill Analyzer',
    problem: "If you're not sure where your cloud money is going, upload your bill and find out in 30 seconds.",
    bullets: [
      'Supports AWS, Azure, GCP, DigitalOcean and Oracle bills',
      'Exact cost breakdown by service, with percentages',
      'Pinpoints waste and hands you a prioritized action plan',
    ],
    cta: 'Upload Your Bill',
    href: '/bill-upload',
    badge: 'Most Popular',
  },
  {
    emoji: '🛡️',
    name: 'Compliance Checker',
    problem: 'If you work in a regulated industry, see every requirement for your cloud setup instantly.',
    bullets: [
      'Healthcare, Finance, Government, Education and more',
      'The exact AWS, Azure or GCP services to enable',
      'Cost estimates so you can budget immediately',
    ],
    cta: 'Check Compliance',
    href: '/compliance',
  },
  {
    emoji: '💰',
    name: 'Pricing Explorer',
    problem: 'If you want the cheapest provider for your exact workload, compare all 12 in seconds.',
    bullets: [
      'Live pricing from AWS and Azure APIs',
      'Compare 12 providers — AWS, Hetzner, DO and more',
      'Download results as a PDF for your team',
    ],
    cta: 'Explore Pricing',
    href: '/pricing-explorer',
  },
]

// ─── count-up hook (numbers animate up on first load) ─────────────────────────

function useCountUp(target: number, duration = 1500): number {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

// ─── Live result preview — a realistic mini dashboard widget ──────────────────

function LiveResultPreview() {
  const total = useCountUp(2617)
  const savings = useCountUp(734)

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      style={{ maxWidth: 460, margin: '0 auto' }}
    >
      <p style={{ fontSize: 10.5, letterSpacing: 2.5, color: '#6b6b80', fontWeight: 700, marginBottom: 10, textAlign: 'center' }}>
        LIVE RESULT PREVIEW
      </p>

      <div className="gradient-card" style={{ padding: 0, overflow: 'hidden', textAlign: 'left' }}>
        {/* window chrome */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }} />
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e' }} />
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840' }} />
          <span style={{ marginLeft: 8, fontSize: 11.5, color: '#6b6b80', fontFamily: MONO }}>aws-cost-and-usage.csv</span>
        </div>

        <div style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: '#a0a0b0' }}>AWS bill analyzed</span>
            <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
              complete
            </span>
          </div>

          <div style={{ fontFamily: MONO, fontSize: 34, fontWeight: 700, color: 'white', lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 4 }}>
            ${total.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: '#6b6b80', marginBottom: 18 }}>total monthly spend</div>

          {/* waste bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 7 }}>
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>⚠ Top waste — EC2 overprovision</span>
            <span style={{ color: '#a0a0b0', fontFamily: MONO }}>28%</span>
          </div>
          <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 20 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '28%' }}
              transition={{ duration: 1.1, delay: 0.5, ease: 'easeOut' }}
              style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }}
            />
          </div>

          {/* savings */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderRadius: 12, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.22)' }}>
            <span style={{ fontSize: 13, color: '#a0a0b0' }}>Potential savings</span>
            <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color: '#22c55e' }}>
              ${savings.toLocaleString()}<span style={{ fontSize: 12, color: '#15803d' }}>/mo</span>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Tool card (bento-aware, gradient border, refined hover) ──────────────────

function ToolCard({ tool, index, large, onOpen }: { tool: Tool; index: number; large: boolean; onOpen: (href: string) => void }) {
  return (
    <motion.div
      className={`gradient-card${large ? ' bento-lg' : ''}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      style={{ padding: large ? '34px 32px' : '26px 24px' }}
    >
      {/* Most Popular badge */}
      {tool.badge && (
        <div style={{
          position: 'absolute', top: 18, right: 18,
          background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
          color: 'white', fontSize: 10.5, fontWeight: 800, letterSpacing: 0.6,
          padding: '5px 11px', borderRadius: 20, textTransform: 'uppercase',
          boxShadow: '0 4px 14px rgba(99,102,241,0.45)',
        }}>
          {tool.badge}
        </div>
      )}

      {/* Icon */}
      <div style={{
        width: large ? 60 : 50, height: large ? 60 : 50, borderRadius: 15,
        background: 'rgba(124,58,237,0.16)', border: '1px solid rgba(124,58,237,0.32)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: large ? 30 : 25, marginBottom: large ? 22 : 18,
      }}>
        {tool.emoji}
      </div>

      <h3 style={{ fontSize: large ? 28 : 21, fontWeight: 800, color: 'white', marginBottom: 12, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
        {tool.name}
      </h3>

      <p style={{ fontSize: large ? 16 : 14, color: '#b4b4c4', lineHeight: 1.6, marginBottom: large ? 26 : 20, maxWidth: large ? 460 : 'none' }}>
        {tool.problem}
      </p>

      <ul style={{ listStyle: 'none', padding: 0, margin: `0 0 ${large ? 30 : 22}px`, display: 'flex', flexDirection: 'column', gap: large ? 13 : 10, flex: 1 }}>
        {tool.bullets.map(b => (
          <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
            <span style={{
              flexShrink: 0, marginTop: 1, width: 18, height: 18, borderRadius: '50%',
              background: 'rgba(124,58,237,0.2)', color: '#a5b4fc',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900,
            }}>✓</span>
            <span style={{ fontSize: large ? 14.5 : 13, color: '#d0d0de', lineHeight: 1.55 }}>{b}</span>
          </li>
        ))}
      </ul>

      <motion.button
        onClick={() => onOpen(tool.href)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.15 }}
        style={{
          width: '100%', padding: large ? '15px 0' : '13px 0', border: 'none', borderRadius: 13,
          background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
          color: 'white', fontSize: large ? 16 : 14.5, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(99,102,241,0.32)',
        }}
      >
        {tool.cta} →
      </motion.button>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const router = useRouter()
  const open = (href: string) => router.push(href)

  return (
    <div style={{ minHeight: '100vh', color: 'white', position: 'relative', overflow: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: HIDE_GLOBAL_CHROME }} />

      {/* Flowing mesh-gradient background */}
      <div className="mesh-bg" />
      <div className="mesh-veil" />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
          padding: '16px clamp(20px, 5vw, 48px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(5,5,8,0.55)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'white', letterSpacing: '-0.01em' }}>
            ☁️ Cloud Intelligence
          </div>
          <div style={{ fontSize: 13, color: '#7a7a8c', fontWeight: 500 }}>
            Built by <span style={{ color: '#a0a0b0', fontWeight: 600 }}>Yasaswi Dutta</span>
          </div>
        </header>

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section style={{ padding: 'clamp(64px, 11vw, 104px) 24px clamp(40px, 6vw, 56px)', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ maxWidth: 820, margin: '0 auto' }}
          >
            {/* Headline — large, tight, gradient on key words only */}
            <h1 style={{ fontSize: 'clamp(44px, 8.5vw, 92px)', fontWeight: 900, lineHeight: 0.98, letterSpacing: '-0.045em', marginBottom: 24 }}>
              Three tools.<br />
              Real answers in <span className="grad-word">60 seconds</span>.
            </h1>

            {/* Subheadline — lighter, muted, airy */}
            <p style={{ fontSize: 'clamp(16px, 2.2vw, 20px)', color: '#9a9ab0', fontWeight: 400, lineHeight: 1.6, letterSpacing: '0.01em', maxWidth: 540, margin: '0 auto 44px' }}>
              No login. No setup. Pick a tool and get a real answer.
            </p>

            <LiveResultPreview />
          </motion.div>
        </section>

        {/* ── Case study ─────────────────────────────────────────────────── */}
        <section style={{ padding: '0 24px clamp(40px, 6vw, 56px)' }}>
          <motion.div
            className="gradient-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(26px, 4vw, 36px) clamp(24px, 4vw, 38px)' }}
          >
            <h2 style={{ fontSize: 'clamp(19px, 2.6vw, 23px)', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: 14 }}>
              How this was built
            </h2>
            <p style={{ fontSize: 'clamp(14px, 1.9vw, 15.5px)', color: '#b4b4c4', lineHeight: 1.75, margin: 0 }}>
              A startup was spending $31K/month on AWS with no visibility into where it was going.
              I approached it like a Forward Deployed Engineer — took their actual billing data,
              identified specific waste patterns, and built a system that does the diagnosis
              automatically. What I found: EC2 overprovisioned by 40%, staging servers running
              24/7 adding $1,800/month, S3 logs with no lifecycle policy accumulating $2,100/month.
              Total identified savings: $12,300/month. This tool is what I left them with.
            </p>
          </motion.div>
        </section>

        {/* ── Bento card grid ────────────────────────────────────────────── */}
        <section style={{ padding: '0 24px clamp(52px, 7vw, 76px)' }}>
          <div className="bento" style={{ maxWidth: 1080, margin: '0 auto' }}>
            {TOOLS.map((tool, i) => (
              <ToolCard key={tool.name} tool={tool} index={i} large={i === 0} onOpen={open} />
            ))}
          </div>
        </section>

        {/* ── Credibility bar ────────────────────────────────────────────── */}
        <section style={{
          padding: 'clamp(26px, 4vw, 36px) 24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: 'clamp(13px, 1.8vw, 15px)', color: '#c0c0d0', fontWeight: 600, marginBottom: 8 }}>
              Real data, no signups, no paywalls.
            </p>
            <p style={{ fontSize: 13, color: '#7a7a8c', letterSpacing: 0.3 }}>
              Live pricing across{' '}
              <span style={{ color: '#a0a0b0', fontWeight: 600 }}>AWS</span> • <span style={{ color: '#a0a0b0', fontWeight: 600 }}>Azure</span> •{' '}
              <span style={{ color: '#a0a0b0', fontWeight: 600 }}>GCP</span> • <span style={{ color: '#a0a0b0', fontWeight: 600 }}>DigitalOcean</span> •{' '}
              <span style={{ color: '#a0a0b0', fontWeight: 600 }}>Oracle</span> • <span style={{ color: '#a0a0b0', fontWeight: 600 }}>9 more</span>
            </p>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div role="contentinfo" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 16,
          maxWidth: 1080, margin: '0 auto',
          padding: 'clamp(28px, 5vw, 44px) clamp(20px, 5vw, 24px) clamp(40px, 6vw, 56px)',
        }}>
          <span style={{ fontSize: 13.5, color: '#7a7a8c' }}>
            Cloud Intelligence Platform — <span style={{ color: '#a0a0b0', fontWeight: 600 }}>Built by Yasaswi Dutta</span>
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SocialLink href="#" label="LinkedIn">
              <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.25 8h4.5v13.5H.25V8zM8.5 8h4.32v1.85h.06c.6-1.14 2.07-2.34 4.26-2.34 4.56 0 5.4 3 5.4 6.9v7.09h-4.5v-6.28c0-1.5-.03-3.43-2.09-3.43-2.09 0-2.41 1.63-2.41 3.32v6.39H8.5V8z" />
            </SocialLink>
            <SocialLink href="https://github.com/Yasasu06" label="GitHub">
              <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.92 1.24 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
            </SocialLink>
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Social icon link (inline SVG — no icon dependency) ──────────────────────

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  const [hover, setHover] = useState(false)
  const external = href.startsWith('http')
  return (
    <a
      href={href}
      aria-label={label}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 38, height: 38, borderRadius: 10,
        border: `1px solid ${hover ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.1)'}`,
        background: hover ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.02)',
        color: hover ? '#a5b4fc' : '#8a8a9c',
        transition: 'all 0.2s ease',
      }}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        {children}
      </svg>
    </a>
  )
}
