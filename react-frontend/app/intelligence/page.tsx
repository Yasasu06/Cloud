'use client'

import ConsolidationHub from '@/components/ConsolidationHub'

export default function IntelligenceHubPage() {
  return (
    <ConsolidationHub
      badge="INTELLIGENCE HUB"
      title="Stay ahead of cloud market changes"
      subtitle="Provider news, price alerts, and weekly digest in one place."
      tabs={[
        { id: 'news',    label: 'Provider News',  icon: '📰', href: '/provider-news', color: '#6366f1', blurb: 'Latest pricing changes, service launches, deprecations',     features: ['12 providers covered', 'Filterable feed', 'Cost-impact tags'] },
        { id: 'alerts',  label: 'Price Alerts',   icon: '🔔', href: '/vendor-alerts', color: '#f59e0b', blurb: 'Get notified when prices change',                            features: ['Per-service watchlist', 'Email + in-app', 'Daily check'] },
        { id: 'digest',  label: 'Weekly Digest',  icon: '📧', href: '/weekly-digest', color: '#22c55e', blurb: 'One email per week with everything that matters',           features: ['Curated weekly summary', 'Personalized to you', 'Opt-in only'] },
      ]}
    />
  )
}
