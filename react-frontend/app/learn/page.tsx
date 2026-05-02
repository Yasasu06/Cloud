'use client'

import ConsolidationHub from '@/components/ConsolidationHub'

export default function LearnPage() {
  return (
    <ConsolidationHub
      badge="LEARN"
      title="Build your cloud expertise"
      subtitle="Glossary of cloud terms, industry benchmarks, and a digital twin to test scenarios safely."
      tabs={[
        { id: 'glossary',   label: 'Glossary',           icon: '📚', href: '/cloud-glossary', color: '#6366f1', blurb: '50+ cloud terms in plain English',                          features: ['Searchable A-Z index', 'Cross-references', 'Real-world examples'] },
        { id: 'benchmarks', label: 'Industry Benchmarks',icon: '📊', href: '/benchmark',      color: '#f59e0b', blurb: 'How your spend compares to similar companies',              features: ['By industry + stage', 'Median + percentiles', 'Year-over-year trends'] },
        { id: 'twin',       label: 'Cloud Twin',         icon: '🎯', href: '/cloud-twin',     color: '#22c55e', blurb: 'Sandbox to test "what-if" scenarios safely',                features: ['No-risk modeling', 'Architecture variants', 'Cost projection'] },
      ]}
    />
  )
}
