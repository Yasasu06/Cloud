'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const TOOLS_BY_ROLE: Record<string, string[]> = {
  founder:    ['/instant-audit', '/bill-upload', '/cost-intelligence?tab=credits', '/cost-intelligence?tab=ai-costs', '/sanity-check', '/cost-intelligence?tab=per-user'],
  finops:     ['/optimize?tab=savings', '/cost-intelligence?tab=forecast', '/optimize?tab=waste', '/optimize?tab=reserved', '/cost-intelligence?tab=ai-costs', '/bill-upload'],
  architect:  ['/architecture', '/multi-cloud', '/compliance', '/sanity-check', '/ai-advisor', '/terraform-estimator'],
  itmanager:  ['/report-card', '/cloud-score', '/learn?tab=benchmarks', '/compare', '/intelligence?tab=news', '/dashboard'],
  consultant: ['/for-consultants?tab=white-label', '/for-consultants?tab=experts', '/for-consultants?tab=roles', '/for-consultants?tab=pricing', '/team', '/track-results'],
  beginner:   ['/learn?tab=glossary', '/bill-upload', '/cost-intelligence?tab=credits', '/cost-alerts', '/advisor', '/instant-audit'],
}

const ROLE_META: Record<string, { icon: string; label: string }> = {
  founder:    { icon: '🚀', label: 'Founder' },
  finops:     { icon: '💰', label: 'FinOps Lead' },
  architect:  { icon: '🏗️', label: 'Architect' },
  itmanager:  { icon: '👥', label: 'IT Manager' },
  consultant: { icon: '🎯', label: 'Consultant' },
  beginner:   { icon: '🧑‍💻', label: 'Beginner' },
}

const ALL_TOOLS: Array<{ href: string; icon: string; label: string }> = [
  { href: '/analyze',             icon: '🔍', label: 'AI Analyze' },
  { href: '/instant-audit',       icon: '⚡', label: 'Instant Audit' },
  { href: '/architecture',        icon: '🏗️', label: 'Architecture' },
  { href: '/bill-upload',         icon: '📊', label: 'Bill Upload' },
  { href: '/optimize?tab=savings',             icon: '💰', label: 'Savings Calculator' },
  { href: '/migrate?tab=egress',      icon: '🔄', label: 'Egress Calculator' },
  { href: '/cost-intelligence?tab=forecast',            icon: '📈', label: 'Cost Forecast' },
  { href: '/multi-cloud',         icon: '☁️', label: 'Multi-Cloud View' },
  { href: '/terraform-estimator', icon: '🏛️', label: 'Infrastructure Estimator' },
  { href: '/cost-intelligence?tab=per-user',       icon: '👤', label: 'Cost Per User' },
  { href: '/cost-intelligence?tab=ai-costs',     icon: '🤖', label: 'AI Costs' },
  { href: '/alternatives',        icon: '🌐', label: 'All Providers' },
  { href: '/advisor',             icon: '🎯', label: 'Cloud Advisor' },
  { href: '/report-card',         icon: '📋', label: 'Report Card' },
  { href: '/cloud-score',         icon: '🏆', label: 'Cloud Score' },
  { href: '/ai-advisor',          icon: '💼', label: 'AI Strategy' },
  { href: '/roi-calculator',      icon: '📈', label: 'ROI Calculator' },
  { href: '/compliance',          icon: '✅', label: 'Compliance' },
  { href: '/optimize?tab=reserved',  icon: '🔒', label: 'Reserved Instances' },
  { href: '/cost-intelligence?tab=credits',     icon: '🎁', label: 'Credits Tracker' },
  { href: '/sanity-check',        icon: '🛟', label: 'Sanity Check' },
  { href: '/intelligence?tab=alerts',       icon: '💸', label: 'Price Alerts' },
  { href: '/intelligence?tab=news',       icon: '📰', label: 'Cloud Updates' },
  { href: '/learn?tab=benchmarks',           icon: '📊', label: 'Industry Benchmarks' },
  { href: '/learn?tab=glossary',      icon: '📚', label: 'Glossary' },
  { href: '/optimize?tab=waste',        icon: '🗑️', label: 'Waste Report' },
  { href: '/for-consultants?tab=roles',            icon: '💡', label: 'What We Replace' },
  { href: '/compare',             icon: '⚖️', label: 'Compare' },
  { href: '/cost-alerts',         icon: '🔔', label: 'Cost Alerts' },
  { href: '/for-consultants?tab=white-label',         icon: '🏷️', label: 'White Label' },
  { href: '/for-consultants?tab=experts',             icon: '👨‍💼', label: 'Experts' },
  { href: '/for-consultants?tab=pricing', icon: '💸', label: 'Performance Pricing' },
  { href: '/team',                icon: '👥', label: 'Team' },
  { href: '/track-results',       icon: '📈', label: 'Track Results' },
]

export default function RoleAwareToolGrid() {
  const [role, setRole] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('user_role')
    if (stored && TOOLS_BY_ROLE[stored]) setRole(stored)
  }, [])

  if (!mounted) return null

  const priorityHrefs = role ? TOOLS_BY_ROLE[role] ?? [] : []
  const priorityTools = priorityHrefs.map(h => ALL_TOOLS.find(t => t.href === h)).filter((t): t is (typeof ALL_TOOLS)[number] => Boolean(t))
  const otherTools = ALL_TOOLS.filter(t => !priorityHrefs.includes(t.href))

  if (!role) {
    // No role — show full grid as flat list
    return (
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Your Toolkit</h2>
          <Link href="/for-you" style={{ fontSize: 12, color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>Pick a role for a tailored view →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
          {ALL_TOOLS.slice(0, 12).map(t => <ToolCard key={t.href} tool={t} priority={false} />)}
        </div>
      </div>
    )
  }

  const meta = ROLE_META[role]
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
          {meta?.icon} Your tools as a {meta?.label}
        </h2>
        <Link href="/for-you" style={{ fontSize: 12, color: '#666', textDecoration: 'none' }}>Change role →</Link>
      </div>

      {/* Priority tools — full color */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
        {priorityTools.map(t => <ToolCard key={t.href} tool={t} priority={true} />)}
      </div>

      {/* Other tools — collapsed */}
      <button
        onClick={() => setShowAll(s => !s)}
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10, padding: '10px 16px',
          color: '#a0a0b0', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', width: '100%', textAlign: 'left',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <span>{showAll ? 'Hide' : 'Show'} all tools ({otherTools.length})</span>
        <span style={{ transition: 'transform 0.15s', transform: showAll ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>

      {showAll && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8, marginTop: 12 }}>
          {otherTools.map(t => <ToolCard key={t.href} tool={t} priority={false} />)}
        </div>
      )}
    </div>
  )
}

function ToolCard({ tool, priority }: { tool: (typeof ALL_TOOLS)[number]; priority: boolean }) {
  return (
    <Link
      href={tool.href}
      style={{
        display: 'block', padding: priority ? '16px 18px' : '10px 12px',
        borderRadius: priority ? 12 : 8,
        background: priority ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${priority ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)'}`,
        textDecoration: 'none',
        opacity: priority ? 1 : 0.65,
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.opacity = '1'
        el.style.borderColor = priority ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.15)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.opacity = priority ? '1' : '0.65'
        el.style.borderColor = priority ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)'
      }}
    >
      <div style={{ fontSize: priority ? 24 : 18, marginBottom: priority ? 8 : 4 }}>{tool.icon}</div>
      <div style={{ fontSize: priority ? 14 : 12, fontWeight: 700, color: 'white', lineHeight: 1.3 }}>
        {tool.label}
      </div>
    </Link>
  )
}
