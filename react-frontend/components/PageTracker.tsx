'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const PAGE_META: Record<string, { title: string; emoji: string; desc: string }> = {
  '/analyze':            { title: 'AI Analyze',              emoji: '🔍', desc: 'Explain your cloud situation' },
  '/bill-upload':        { title: 'Bill Upload',             emoji: '📄', desc: 'Analyze your actual bill' },
  '/architecture':       { title: 'Architecture',            emoji: '🏗️', desc: 'Visualize your stack' },
  '/savings':            { title: 'Savings Calculator',      emoji: '💰', desc: 'Find your savings' },
  '/forecast':           { title: 'Cost Forecast',           emoji: '📈', desc: 'Predict future spending' },
  '/multi-cloud':        { title: 'Multi-Cloud View',        emoji: '☁️', desc: 'Consolidate all providers' },
  '/terraform-estimator':{ title: 'Infrastructure Estimator',emoji: '🏛️', desc: 'Estimate before you build' },
  '/migration':          { title: 'Egress Calculator',       emoji: '🔄', desc: 'Cost to switch providers' },
  '/advisor':            { title: 'Cloud Advisor',           emoji: '🎯', desc: 'Get a recommendation' },
  '/report-card':        { title: 'Report Card',             emoji: '📋', desc: 'Grade your setup' },
  '/benchmark':          { title: 'Cloud Score',             emoji: '🏆', desc: 'Maturity assessment' },
  '/ai-advisor':         { title: 'AI Strategy Session',     emoji: '💼', desc: 'Full strategy conversation' },
  '/roi-calculator':     { title: 'ROI Calculator',          emoji: '📊', desc: 'Calculate your return' },
  '/compliance':         { title: 'Compliance Checker',      emoji: '✅', desc: 'Check requirements' },
  '/reserved-instances': { title: 'Reserved Instances',      emoji: '💎', desc: 'Optimize commitments' },
  '/vendor-alerts':      { title: 'Price Alerts',            emoji: '🔔', desc: 'Track price changes' },
  '/cloud-glossary':     { title: 'Glossary',                emoji: '📚', desc: 'Cloud terms explained' },
  '/pricing':            { title: 'Pricing',                 emoji: '💳', desc: 'View our plans' },
  '/dashboard':          { title: 'Dashboard',               emoji: '🗂️', desc: 'Your saved analyses' },
  '/changelog':          { title: 'Changelog',               emoji: '📝', desc: "What's new" },
  '/team':               { title: 'Team',                    emoji: '👥', desc: 'Invite your team' },
}

export default function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const meta = PAGE_META[pathname]
    if (!meta) return

    try {
      const key = 'recently_viewed'
      const existing: { title: string; url: string; emoji: string; desc: string }[] =
        JSON.parse(localStorage.getItem(key) ?? '[]')

      const entry = { title: meta.title, url: pathname, emoji: meta.emoji, desc: meta.desc }
      const filtered = existing.filter(e => e.url !== pathname)
      const updated = [entry, ...filtered].slice(0, 5)
      localStorage.setItem(key, JSON.stringify(updated))
    } catch (_e) {}
  }, [pathname])

  return null
}
