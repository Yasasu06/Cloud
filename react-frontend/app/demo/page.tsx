'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

// ─── /demo — isolated portfolio hub (editorial redesign) ─────────────────────
//
// Shared with recruiters/hiring managers. "Bloomberg meets Linear": a warm-white
// editorial canvas, DM Serif Display headlines, near-black ink, restrained green
// (savings) and blue (CTA) accents. No gradients, glassmorphism, or glow.
//
// The root layout injects global chrome on every route; the <style> block below
// neutralizes it for this page only (this page renders its own <header> +
// <div role="contentinfo"> footer, so neither is hit).

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
      'Parses compatible AWS, Azure, GCP, DigitalOcean and Oracle CSVs',
      'Exact cost breakdown by service, with percentages',
      'Suggests optimization hypotheses to verify against resource data',
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
    problem: 'Compare listed compute instances across 12 providers for a selected CPU and RAM spec.',
    bullets: [
      'Selected AWS and Azure compute prices may use live APIs, with static fallbacks',
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
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      style={{ maxWidth: 460, margin: '0 auto' }}
    >
      <p style={{ fontSize: 10.5, letterSpacing: 2.5, color: 'var(--text-faint)', fontWeight: 700, marginBottom: 10, textAlign: 'center' }}>
        SAMPLE RESULT PREVIEW
      </p>

      <div className="edi-card" style={{ padding: 0, overflow: 'hidden', textAlign: 'left' }}>
        {/* window chrome */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '11px 16px', borderBottom: '1px solid var(--border)', background: '#FBFBF9' }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }} />
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e' }} />
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840' }} />
          <span style={{ marginLeft: 8, fontSize: 11.5, color: 'var(--text-muted)', fontFamily: MONO }}>aws-cost-and-usage.csv</span>
        </div>

        <div style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sample AWS bill</span>
            <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
              complete
            </span>
          </div>

          <div style={{ fontFamily: MONO, fontSize: 34, fontWeight: 700, color: 'var(--text)', lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 4 }}>
            ${total.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18 }}>total monthly spend</div>

          {/* waste bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 7 }}>
            <span style={{ color: 'var(--amber)', fontWeight: 600 }}>Example hypothesis — EC2 sizing</span>
            <span style={{ color: 'var(--text-muted)', fontFamily: MONO }}>28%</span>
          </div>
          <div style={{ height: 6, borderRadius: 4, background: '#EFEFEA', overflow: 'hidden', marginBottom: 20 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '28%' }}
              transition={{ duration: 1, delay: 0.45, ease: 'easeOut' }}
              style={{ height: '100%', borderRadius: 4, background: 'var(--amber)' }}
            />
          </div>

          {/* savings */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderRadius: 12, background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.22)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Illustrative opportunity</span>
            <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>
              ${savings.toLocaleString()}<span style={{ fontSize: 12, color: '#15803d' }}>/mo</span>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Tool card (bento-aware, editorial, subtle hover) ─────────────────────────

function ToolCard({ tool, index, large, onOpen }: { tool: Tool; index: number; large: boolean; onOpen: (href: string) => void }) {
  return (
    <motion.div
      className={`gradient-card${large ? ' bento-lg' : ''}`}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      style={{ padding: large ? '34px 32px' : '26px 24px' }}
    >
      {/* Most Popular badge */}
      {tool.badge && (
        <div style={{
          position: 'absolute', top: 18, right: 18,
          background: 'var(--blue)',
          color: 'white', fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6,
          padding: '5px 11px', borderRadius: 6, textTransform: 'uppercase',
        }}>
          {tool.badge}
        </div>
      )}

      {/* Icon */}
      <div style={{
        width: large ? 58 : 48, height: large ? 58 : 48, borderRadius: 13,
        background: '#F4F4F0', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: large ? 28 : 23, marginBottom: large ? 22 : 18,
      }}>
        {tool.emoji}
      </div>

      <h3 className="serif" style={{ fontSize: large ? 30 : 23, color: 'var(--text)', marginBottom: 12, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
        {tool.name}
      </h3>

      <p style={{ fontSize: large ? 16 : 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: large ? 26 : 20, maxWidth: large ? 460 : 'none' }}>
        {tool.problem}
      </p>

      <ul style={{ listStyle: 'none', padding: 0, margin: `0 0 ${large ? 30 : 22}px`, display: 'flex', flexDirection: 'column', gap: large ? 13 : 10, flex: 1 }}>
        {tool.bullets.map(b => (
          <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
            <span style={{
              flexShrink: 0, marginTop: 1, width: 18, height: 18, borderRadius: '50%',
              background: 'rgba(22,163,74,0.12)', color: 'var(--green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900,
            }}>✓</span>
            <span style={{ fontSize: large ? 14.5 : 13, color: '#2A2A2A', lineHeight: 1.55 }}>{b}</span>
          </li>
        ))}
      </ul>

      <motion.button
        onClick={() => onOpen(tool.href)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.15 }}
        style={{
          width: '100%', padding: large ? '15px 0' : '13px 0', border: 'none', borderRadius: 11,
          background: 'var(--blue)',
          color: 'white', fontSize: large ? 16 : 14.5, fontWeight: 600, cursor: 'pointer',
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
    <div style={{ minHeight: '100vh', color: 'var(--text)', background: 'var(--bg)', position: 'relative' }}>
      <style dangerouslySetInnerHTML={{ __html: HIDE_GLOBAL_CHROME }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
          padding: '16px clamp(20px, 5vw, 48px)',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(250,250,248,0.85)', backdropFilter: 'saturate(180%) blur(8px)', WebkitBackdropFilter: 'saturate(180%) blur(8px)',
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
            ☁️ Cloud Intelligence
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
            Built by <span style={{ color: 'var(--text)', fontWeight: 600 }}>Yasaswi Dutta</span>
          </div>
        </header>

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section style={{ padding: 'clamp(64px, 11vw, 104px) 24px clamp(40px, 6vw, 56px)', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ maxWidth: 860, margin: '0 auto' }}
          >
            {/* Headline — DM Serif Display, near-black, no gradient */}
            <h1 className="serif" style={{ fontSize: 'clamp(46px, 9vw, 100px)', lineHeight: 1.0, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 24 }}>
              Three tools.<br />
              Cost insights in <span className="grad-word">60 seconds</span>.
            </h1>

            {/* Subheadline — lighter, muted, airy */}
            <p style={{ fontSize: 'clamp(16px, 2.2vw, 20px)', color: 'var(--text-muted)', fontWeight: 400, lineHeight: 1.6, maxWidth: 540, margin: '0 auto 44px' }}>
              No login needed for the demo tools. Upload a compatible CSV or explore example estimates.
            </p>

            <LiveResultPreview />
          </motion.div>
        </section>

        {/* ── Case study ─────────────────────────────────────────────────── */}
        <section style={{ padding: '0 24px clamp(40px, 6vw, 56px)' }}>
          <motion.div
            className="edi-card"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(26px, 4vw, 36px) clamp(24px, 4vw, 38px)' }}
          >
            <h2 className="serif" style={{ fontSize: 'clamp(22px, 3vw, 28px)', color: 'var(--text)', letterSpacing: '-0.01em', marginBottom: 14 }}>
              How this was built
            </h2>
            <p style={{ fontSize: 'clamp(14px, 1.9vw, 15.5px)', color: 'var(--text-muted)', lineHeight: 1.75, margin: 0 }}>
              <strong>Illustrative startup scenario:</strong> An example AWS bill of $31,000/month
              can be grouped by service to show where spending is concentrated. This demo uses a
              sample $12,300/month optimization opportunity to illustrate a possible action plan.
              Those numbers are not a customer result or measured savings. The bill analyzer
              calculates service totals from a compatible uploaded CSV; its optimization suggestions
              require separate resource and utilization checks.
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
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: 'clamp(13px, 1.8vw, 15px)', color: 'var(--text)', fontWeight: 600, marginBottom: 8 }}>
              CSV cost breakdowns and clearly labeled estimates.
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', letterSpacing: 0.3 }}>
              Compute price comparison across{' '}
              <span style={{ color: 'var(--text)', fontWeight: 600 }}>AWS</span> · <span style={{ color: 'var(--text)', fontWeight: 600 }}>Azure</span> ·{' '}
              <span style={{ color: 'var(--text)', fontWeight: 600 }}>GCP</span> · <span style={{ color: 'var(--text)', fontWeight: 600 }}>DigitalOcean</span> ·{' '}
              <span style={{ color: 'var(--text)', fontWeight: 600 }}>Oracle</span> · <span style={{ color: 'var(--text)', fontWeight: 600 }}>9 more</span>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 520 }}>
            <span style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
              Cloud Intelligence Platform — <span style={{ color: 'var(--text)', fontWeight: 600 }}>Built by Yasaswi Dutta</span>
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55 }}>
              Cloud Intelligence Platform — AI-powered cloud cost analyzer, compliance checker, and pricing explorer. Built with Next.js, Groq AI, Supabase, and live cloud pricing APIs.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <SocialLink href="https://www.linkedin.com/in/yasaswidutta/" label="LinkedIn">
                <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.25 8h4.5v13.5H.25V8zM8.5 8h4.32v1.85h.06c.6-1.14 2.07-2.34 4.26-2.34 4.56 0 5.4 3 5.4 6.9v7.09h-4.5v-6.28c0-1.5-.03-3.43-2.09-3.43-2.09 0-2.41 1.63-2.41 3.32v6.39H8.5V8z" />
              </SocialLink>
              <SocialLink href="https://github.com/Yasasu06/Cloud" label="GitHub">
                <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.92 1.24 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
              </SocialLink>
            </div>
            <a
              href="https://github.com/Yasasu06/Cloud"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none' }}
            >
              View source on GitHub →
            </a>
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
        border: `1px solid ${hover ? 'var(--blue)' : 'var(--border)'}`,
        background: hover ? 'rgba(37,99,235,0.06)' : 'var(--surface)',
        color: hover ? 'var(--blue)' : 'var(--text-muted)',
        transition: 'all 0.18s ease',
      }}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        {children}
      </svg>
    </a>
  )
}
