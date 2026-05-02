'use client'

import ConsolidationHub from '@/components/ConsolidationHub'

export default function ForConsultantsPage() {
  return (
    <ConsolidationHub
      badge="FOR CONSULTANTS"
      title="Tools for cloud consultants and agencies"
      subtitle="White-label reports, expert marketplace, performance pricing, and roles you can replace."
      tabs={[
        { id: 'white-label', label: 'White Label',         icon: '🏷️', href: '/white-label',         color: '#6366f1', blurb: 'Branded reports under your firm\'s identity',         features: ['Custom logo + colors', 'PDF + HTML output', 'Per-client billing'] },
        { id: 'experts',     label: 'Expert Marketplace',  icon: '👥', href: '/experts',             color: '#22c55e', blurb: 'Connect with vetted cloud consultants',              features: ['On-demand specialists', 'Reputation scores', 'Project-based hiring'] },
        { id: 'performance', label: 'Performance Pricing', icon: '💰', href: '/performance-pricing', color: '#f59e0b', blurb: 'Pay only when we deliver verified savings',          features: ['Zero risk to client', 'Audit trail', 'Pay-per-saving model'] },
        { id: 'replaces',    label: 'Roles Replaced',      icon: '💼', href: '/replaces',            color: '#a855f7', blurb: '$400K of expertise for $49/month',                   features: ['10 cloud roles covered', 'ROI calculator', 'Capability matrix'] },
      ]}
    />
  )
}
