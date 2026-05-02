'use client'

import ConsolidationHub from '@/components/ConsolidationHub'

export default function OptimizePage() {
  return (
    <ConsolidationHub
      badge="OPTIMIZE"
      title="Find waste, calculate savings, lock in commitments"
      subtitle="Four optimization tools in one place — savings calculator, waste finder, RI optimizer, and quick wins."
      tabs={[
        { id: 'savings',    label: 'Savings Calculator',  icon: '💰', href: '/savings',            color: '#22c55e', blurb: 'Estimate annual savings from common optimizations',         features: ['Reserved Instance modeling', 'Right-sizing potential', 'Idle resource cleanup'] },
        { id: 'waste',      label: 'Waste Report',        icon: '♻️', href: '/waste-report',       color: '#f59e0b', blurb: 'Find what you\'re wasting right now',                         features: ['Idle resources', 'Over-provisioned instances', 'Unattached volumes'] },
        { id: 'reserved',   label: 'Reserved Instances',  icon: '📅', href: '/reserved-instances', color: '#6366f1', blurb: 'Decide which workloads to commit to RIs',                  features: ['1yr / 3yr break-even', 'Convertible vs Standard', 'Term vs Savings Plans'] },
        { id: 'quick-wins', label: 'Quick Wins',          icon: '⚡', href: '/analyze',            color: '#a855f7', blurb: 'Ranked actions you can do today',                          features: ['Sub-1hr fixes', '$/hour saved ranking', 'Console deep-links'] },
      ]}
    />
  )
}
