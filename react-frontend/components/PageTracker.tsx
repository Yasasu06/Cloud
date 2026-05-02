'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const PAGE_META: Record<string, { title: string; emoji: string; desc: string }> = {
  '/analyze':             { title: 'AI Analyze',                emoji: '🔍', desc: 'Explain your cloud situation' },
  '/instant-audit':       { title: 'Instant Audit',             emoji: '⚡', desc: 'Free 30-second audit' },
  '/bill-upload':         { title: 'Bill Upload',               emoji: '📄', desc: 'Analyze your actual bill' },
  '/architecture':        { title: 'Architecture',              emoji: '🏗️', desc: 'Visualize your stack' },
  '/cost-intelligence':   { title: 'Cost Intelligence',         emoji: '📊', desc: 'Forecast, per-user, credits, AI cost' },
  '/optimize':            { title: 'Optimize',                  emoji: '💰', desc: 'Savings, waste, RI, quick wins' },
  '/migrate':             { title: 'Migrate',                   emoji: '🔄', desc: 'Plan, egress, repatriation' },
  '/intelligence':        { title: 'Intelligence Hub',          emoji: '📰', desc: 'News, alerts, weekly digest' },
  '/learn':               { title: 'Learn',                     emoji: '📚', desc: 'Glossary, benchmarks, cloud twin' },
  '/for-consultants':     { title: 'For Consultants',           emoji: '💼', desc: 'White label, experts, performance pricing' },
  '/outcome-simulator':   { title: 'Outcome Simulator',         emoji: '🔮', desc: 'Visual journey current → optimized' },
  '/multi-cloud':         { title: 'Multi-Cloud View',          emoji: '☁️', desc: 'Consolidate all providers' },
  '/terraform-estimator': { title: 'Infrastructure Estimator',  emoji: '🏛️', desc: 'Estimate before you build' },
  '/advisor':             { title: 'Cloud Advisor',             emoji: '🎯', desc: 'Get a recommendation' },
  '/report-card':         { title: 'Report Card',               emoji: '📋', desc: 'Grade your setup' },
  '/cloud-score':         { title: 'Cloud Score',               emoji: '🏆', desc: 'Maturity assessment' },
  '/ai-advisor':          { title: 'AI Strategy Session',       emoji: '💼', desc: 'Full strategy conversation' },
  '/roi-calculator':      { title: 'ROI Calculator',            emoji: '📊', desc: 'Calculate your return' },
  '/compliance':          { title: 'Compliance Checker',        emoji: '✅', desc: 'Check requirements' },
  '/sanity-check':        { title: 'Sanity Check',              emoji: '🛟', desc: 'Pre-decision review' },
  '/pricing-explorer':    { title: 'Pricing Explorer',          emoji: '💰', desc: 'Live pricing across 12 providers' },
  '/compare':             { title: 'Compare',                   emoji: '⚖️', desc: 'Side-by-side qualitative comparison' },
  '/stats':               { title: 'Live Stats',                emoji: '📊', desc: 'Aggregated user results' },
  '/pricing':             { title: 'Pricing',                   emoji: '💳', desc: 'View our plans' },
  '/dashboard':           { title: 'Dashboard',                 emoji: '🗂️', desc: 'Your saved analyses' },
  '/changelog':           { title: 'Changelog',                 emoji: '📝', desc: "What's new" },
  '/team':                { title: 'Team',                      emoji: '👥', desc: 'Invite your team' },
}

export default function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const meta = PAGE_META[pathname]
    if (!meta) return

    try {
      const key = 'recently_viewed'
      const existing: { title: string; url: string; emoji: string; desc: string; visitedAt?: number }[] =
        JSON.parse(localStorage.getItem(key) ?? '[]')

      const entry = { title: meta.title, url: pathname, emoji: meta.emoji, desc: meta.desc, visitedAt: Date.now() }
      const filtered = existing.filter(e => e.url !== pathname)
      const updated = [entry, ...filtered].slice(0, 5)
      localStorage.setItem(key, JSON.stringify(updated))
    } catch (_e) {}
  }, [pathname])

  return null
}
