'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

// ─── /demo — isolated professional portfolio page ────────────────────────────
//
// This route is shared with recruiters and hiring managers. It must read as a
// standalone, premium product landing page — NOT as a page inside the larger
// app. The root layout (app/layout.tsx) injects global chrome on every route
// (navbar, breadcrumbs, live ticker, back-to-dashboard, and a 20-link footer).
// Since that file must not be modified, the <style> block below neutralizes
// that chrome for this page only. It is fully self-contained: the rules apply
// while /demo is mounted and disappear when the user navigates away.
//
// It only targets the shared chrome — this page renders its own header as a
// <div> and its own footer as a <div role="contentinfo">, so neither is hit.

const HIDE_GLOBAL_CHROME = `
  nav,
  .ticker-wrap,
  body footer { display: none !important; }
  div:has(> a[href="/dashboard"]) { display: none !important; }
`

interface Tool {
  emoji: string
  name: string
  problem: string
  bullets: string[]
  cta: string
  href: string
  accent: string
  badge?: string
}

const TOOLS: Tool[] = [
  {
    emoji: '📊',
    name: 'Cloud Bill Analyzer',
    problem: "If you're not sure where your cloud money is going, upload your bill and find out in 30 seconds.",
    bullets: [
      'Supports AWS, Azure, GCP, DigitalOcean and Oracle bills',
      'Shows exact cost breakdown by service with percentages',
      'AI identifies waste and gives you a prioritized action plan',
    ],
    cta: 'Upload Your Bill →',
    href: '/bill-upload',
    accent: '#6366f1',
    badge: 'Most Popular',
  },
  {
    emoji: '🛡️',
    name: 'Compliance Checker',
    problem: 'If you work in a regulated industry, see every compliance requirement for your cloud setup instantly.',
    bullets: [
      'Covers Healthcare, Finance, Government, Education and more',
      'Shows exact AWS, Azure or GCP services you need to enable',
      'Includes cost estimates so you can budget immediately',
    ],
    cta: 'Check Compliance →',
    href: '/compliance',
    accent: '#3b82f6',
  },
  {
    emoji: '💰',
    name: 'Pricing Explorer',
    problem: 'If you want to know which cloud provider is cheapest for your exact workload, compare all 12 in seconds.',
    bullets: [
      'Live pricing from AWS and Azure APIs',
      'Compare 12 providers: AWS, Azure, GCP, Hetzner, DO and more',
      'Download results as PDF for your team',
    ],
    cta: 'Explore Pricing →',
    href: '/pricing-explorer',
    accent: '#8b5cf6',
  },
]

// ─── Tool card ───────────────────────────────────────────────────────────────

function ToolCard({ tool, index, onOpen }: { tool: Tool; index: number; onOpen: (href: string) => void }) {
  const [hover, setHover] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      whileHover={{ y: -6 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        background: hover ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${hover ? `${tool.accent}66` : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 20,
        padding: '32px 28px',
        boxShadow: hover ? `0 24px 60px rgba(0,0,0,0.45), 0 0 0 1px ${tool.accent}22, 0 0 48px ${tool.accent}22` : '0 1px 2px rgba(0,0,0,0.2)',
        transition: 'background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
      }}
    >
      {/* Most Popular badge */}
      {tool.badge && (
        <div style={{
          position: 'absolute', top: 18, right: 18,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white', fontSize: 10.5, fontWeight: 800, letterSpacing: 0.6,
          padding: '5px 11px', borderRadius: 20, textTransform: 'uppercase',
          boxShadow: '0 4px 14px rgba(99,102,241,0.45)',
        }}>
          {tool.badge}
        </div>
      )}

      {/* Icon */}
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: `${tool.accent}1f`, border: `1px solid ${tool.accent}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, marginBottom: 20,
      }}>
        {tool.emoji}
      </div>

      {/* Name */}
      <h3 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 12, letterSpacing: '-0.01em' }}>
        {tool.name}
      </h3>

      {/* Problem statement */}
      <p style={{ fontSize: 14.5, color: '#b4b4c4', lineHeight: 1.6, marginBottom: 22 }}>
        {tool.problem}
      </p>

      {/* Bullets */}
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {tool.bullets.map(b => (
          <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
            <span style={{
              flexShrink: 0, marginTop: 1,
              width: 18, height: 18, borderRadius: '50%',
              background: `${tool.accent}26`, color: tool.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 900,
            }}>
              ✓
            </span>
            <span style={{ fontSize: 13.5, color: '#d0d0de', lineHeight: 1.55 }}>{b}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={() => onOpen(tool.href)}
        style={{
          width: '100%', padding: '14px 0', border: 'none', borderRadius: 12,
          background: `linear-gradient(135deg, ${tool.accent}, #8b5cf6)`,
          color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          boxShadow: hover ? `0 10px 28px ${tool.accent}55` : `0 4px 16px ${tool.accent}33`,
          transform: hover ? 'translateY(-1px)' : 'translateY(0)',
          transition: 'box-shadow 0.25s ease, transform 0.25s ease',
        }}
      >
        {tool.cta}
      </button>
    </motion.div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const router = useRouter()
  const [particles, setParticles] = useState<Array<{ x: number; y: number; size: number; dur: number; delay: number }>>([])

  // Client-only particle field — generated after mount to avoid hydration drift.
  useEffect(() => {
    setParticles(Array.from({ length: 18 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      dur: 9 + Math.random() * 7,
      delay: Math.random() * 5,
    })))
  }, [])

  // Same-tab navigation, matching the app's existing button pattern.
  const open = (href: string) => router.push(href)

  return (
    <div style={{ minHeight: '100vh', background: '#050508', color: 'white', position: 'relative', zIndex: 1 }}>
      <style dangerouslySetInnerHTML={{ __html: HIDE_GLOBAL_CHROME }} />

      {/* ── SECTION 1: Minimal isolated header ─────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
        padding: '16px clamp(20px, 5vw, 48px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(5,5,8,0.72)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
      }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'white', letterSpacing: '-0.01em' }}>
          ☁️ Cloud Intelligence
        </div>
        <div style={{ fontSize: 13, color: '#7a7a8c', fontWeight: 500 }}>
          Built by <span style={{ color: '#a0a0b0', fontWeight: 600 }}>Yasaswi Dutta</span>
        </div>
      </header>

      {/* ── SECTION 2: Hero ────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        padding: 'clamp(72px, 12vw, 120px) 24px clamp(56px, 8vw, 88px)',
        textAlign: 'center',
        background: 'radial-gradient(ellipse at 20% 30%, rgba(99,102,241,0.16) 0%, transparent 60%), radial-gradient(ellipse at 80% 10%, rgba(139,92,246,0.12) 0%, transparent 55%)',
      }}>
        {/* Floating orbs */}
        <div style={{ position: 'absolute', top: -120, left: -80, width: 520, height: 520, background: 'rgba(99,102,241,0.13)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none', animation: 'orbFloat 9s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: 0, right: -100, width: 380, height: 380, background: 'rgba(139,92,246,0.1)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none', animation: 'orbFloat 11s ease-in-out 2s infinite' }} />
        <div style={{ position: 'absolute', bottom: -120, left: '45%', width: 420, height: 420, background: 'rgba(59,130,246,0.08)', borderRadius: '50%', filter: 'blur(130px)', pointerEvents: 'none', animation: 'orbFloat 13s ease-in-out 1s infinite' }} />
        {/* Particles */}
        {particles.map((p, i) => (
          <div key={i} className="particle" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }} />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto' }}
        >
          {/* Badge */}
          <div style={{
            display: 'inline-block', background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20,
            padding: '6px 18px', fontSize: 12, color: '#818cf8', fontWeight: 700,
            letterSpacing: 1, marginBottom: 28,
          }}>
            ⚡ AI-POWERED CLOUD TOOLS
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(34px, 6vw, 64px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 22 }}>
            <span style={{ color: 'white' }}>Three tools. Real problems.</span>
            <br />
            <span className="shimmer-text">Results in 60 seconds.</span>
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: 'clamp(15px, 2.2vw, 19px)', color: '#a0a0b0', lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>
            No login required. No setup. Pick a tool below.
          </p>
        </motion.div>
      </section>

      {/* ── SECTION 3: Three tool cards ────────────────────────────────────── */}
      <section style={{ padding: '0 24px clamp(56px, 8vw, 80px)' }}>
        <div style={{
          maxWidth: 1080, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24,
        }}>
          {TOOLS.map((tool, i) => (
            <ToolCard key={tool.name} tool={tool} index={i} onOpen={open} />
          ))}
        </div>
      </section>

      {/* ── SECTION 4: Credibility bar ─────────────────────────────────────── */}
      <section style={{
        padding: 'clamp(28px, 5vw, 40px) 24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.012)',
      }}>
        <p style={{
          maxWidth: 760, margin: '0 auto', textAlign: 'center',
          fontSize: 'clamp(13px, 1.8vw, 15px)', color: '#8a8a9c', lineHeight: 1.7,
        }}>
          <span style={{ color: '#c0c0d0', fontWeight: 600 }}>Real data. No signups. No paywalls.</span>{' '}
          Built with Next.js, Groq AI, and live cloud pricing APIs.
        </p>
      </section>

      {/* ── SECTION 5: Minimal footer ──────────────────────────────────────── */}
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
        border: `1px solid ${hover ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`,
        background: hover ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
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
