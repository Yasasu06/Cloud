'use client'

import ConsolidationHub from '@/components/ConsolidationHub'

export default function CostIntelligencePage() {
  return (
    <ConsolidationHub
      badge="COST INTELLIGENCE"
      title="Understand and forecast your cloud costs"
      subtitle="Forecast spend, analyze unit economics, track credits, and monitor AI cost — all in one place."
      tabs={[
        { id: 'forecast',    label: 'Cost Forecast',     icon: '📊', href: '/forecast',           color: '#6366f1', blurb: 'Project your cloud spend 3, 6, 12 months out',           features: ['Trend analysis from historical data', 'Multi-scenario projections', 'Budget alerts at thresholds'] },
        { id: 'per-user',    label: 'Cost Per User',     icon: '👤', href: '/cost-per-user',      color: '#22c55e', blurb: 'Benchmark your unit economics against peers',              features: ['SaaS / B2B / consumer benchmarks', 'COGS as % of revenue', 'Pricing strategy insights'] },
        { id: 'credits',     label: 'Credits Tracker',   icon: '🎁', href: '/credits-tracker',    color: '#f59e0b', blurb: 'Track AWS Activate, Azure, GCP startup credits',          features: ['Multi-program tracking', 'Burn-rate forecasting', 'Renewal reminders'] },
        { id: 'ai-costs',    label: 'AI Costs',          icon: '🤖', href: '/ai-cost-tracker',    color: '#a855f7', blurb: 'Optimize OpenAI, Anthropic, Gemini spend',               features: ['Per-model cost analysis', '6 reduction strategies', 'Provider comparison'] },
      ]}
    />
  )
}
