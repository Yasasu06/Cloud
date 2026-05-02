'use client'

import ConsolidationHub from '@/components/ConsolidationHub'

export default function MigratePage() {
  return (
    <ConsolidationHub
      badge="MIGRATE"
      title="Plan, cost, and execute provider migrations"
      subtitle="Migration planning + egress calculation + cloud-to-bare-metal repatriation modeling."
      tabs={[
        { id: 'planner',     label: 'Migration Planner',    icon: '🔄', href: '/migration',      color: '#6366f1', blurb: 'Step-by-step plan to switch providers',                features: ['12-week migration roadmap', 'Service-by-service mapping', 'Risk + downtime estimate'] },
        { id: 'egress',      label: 'Egress Calculator',    icon: '💸', href: '/migration-cost', color: '#f59e0b', blurb: 'Cost to move data out of your current cloud',          features: ['AWS / Azure / GCP egress rates', 'Multi-region scenarios', 'One-time vs ongoing'] },
        { id: 'repatriation',label: 'Cloud Repatriation',  icon: '🏠', href: '/repatriation',   color: '#22c55e', blurb: 'Compare cloud vs colocation / bare metal',             features: ['TCO over 5 years', 'Hardware lifecycle modeling', 'Hybrid scenarios'] },
      ]}
    />
  )
}
