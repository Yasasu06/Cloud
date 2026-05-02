'use client'

import Link from 'next/link'

const ROLES = [
  {
    id: 'founder',
    icon: '🚀',
    title: 'Startup Founder',
    desc: 'You wear 5 hats. We help you make smart cloud decisions without hiring an architect.',
    tools: ['Bill Upload', 'Credits Tracker', 'AI Costs', 'Sanity Check', 'Cost Per User'],
    color: '#6366f1',
  },
  {
    id: 'finops',
    icon: '💰',
    title: 'Finance / FinOps Lead',
    desc: 'Your job is finding waste and predicting spend. We give you the data.',
    tools: ['Savings Calculator', 'Forecast', 'Reserved Instances', 'Waste Report', 'AI Cost Tracker'],
    color: '#22c55e',
  },
  {
    id: 'architect',
    icon: '🏗️',
    title: 'Cloud Architect / Tech Lead',
    desc: 'You design systems. We help validate decisions and speed up architecture work.',
    tools: ['Architecture', 'Multi-Cloud', 'Compliance', 'Sanity Check', 'AI Strategy'],
    color: '#3b82f6',
  },
  {
    id: 'itmanager',
    icon: '👥',
    title: 'IT Manager',
    desc: 'You manage the cloud relationship for the company. We give you the dashboards you need.',
    tools: ['Report Card', 'Cloud Score', 'Benchmarks', 'Compare', 'Provider News'],
    color: '#a855f7',
  },
  {
    id: 'consultant',
    icon: '🎯',
    title: 'Cloud Consultant',
    desc: 'You serve multiple clients. We give you white-label reports and scaling tools.',
    tools: ['White Label', 'Experts', 'Multi-Client Tab', 'Performance Pricing'],
    color: '#f59e0b',
  },
  {
    id: 'beginner',
    icon: '🧑‍💻',
    title: 'Solo Developer / Non-Technical Founder',
    desc: 'No cloud experience needed. We translate everything into plain English.',
    tools: ['Cloud Glossary', 'Bill Upload', 'Credits Tracker', 'Cost Alerts', 'Implementation Wizard'],
    color: '#ec4899',
  },
]

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  return `${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)}`
}

export default function ForYouPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 20, letterSpacing: 1 }}>
            FIND YOUR TOOLKIT
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, marginBottom: 14, lineHeight: 1.1 }}>
            Find Your Toolkit
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 17, maxWidth: 540, margin: '0 auto' }}>
            Pick how you work to see tools designed for you.
          </p>
        </div>

        {/* 6 cards in 2x3 grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {ROLES.map(role => {
            const rgb = hexToRgb(role.color)
            return (
              <Link
                key={role.id}
                href={`/dashboard?role=${role.id}`}
                style={{
                  textDecoration: 'none', display: 'block',
                  padding: 28, borderRadius: 20,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = `rgba(${rgb},0.4)`
                  el.style.background = `rgba(${rgb},0.04)`
                  el.style.boxShadow = `0 8px 40px rgba(${rgb},0.15)`
                  el.style.transform = 'translateY(-3px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'rgba(255,255,255,0.07)'
                  el.style.background = 'rgba(255,255,255,0.02)'
                  el.style.boxShadow = 'none'
                  el.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 14,
                    background: `rgba(${rgb},0.12)`,
                    border: `1px solid rgba(${rgb},0.3)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, flexShrink: 0,
                  }}>
                    {role.icon}
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: 0 }}>
                    {role.title}
                  </h3>
                </div>
                <p style={{ color: '#a0a0b0', fontSize: 14, lineHeight: 1.65, marginBottom: 20 }}>
                  {role.desc}
                </p>
                <div style={{ marginBottom: 20 }}>
                  <p style={{ color: '#555', fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>YOUR TOOLS</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {role.tools.map(t => (
                      <span key={t} style={{
                        fontSize: 11, padding: '4px 10px', borderRadius: 6,
                        background: `rgba(${rgb},0.08)`,
                        border: `1px solid rgba(${rgb},0.2)`,
                        color: role.color, fontWeight: 600,
                      }}>{t}</span>
                    ))}
                  </div>
                </div>
                <div style={{ color: role.color, fontSize: 13, fontWeight: 700 }}>
                  See your dashboard →
                </div>
              </Link>
            )
          })}
        </div>

        {/* Skip link */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link href="/dashboard" style={{ color: '#666', fontSize: 13, textDecoration: 'none' }}>
            Skip — show me everything →
          </Link>
        </div>
      </div>
    </div>
  )
}
