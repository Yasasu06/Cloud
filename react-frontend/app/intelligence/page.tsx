'use client'

import { useState } from 'react'
import NewsCard from '@/components/NewsCard'
import { Rss, Filter } from 'lucide-react'

type Impact = 'High' | 'Medium' | 'Low'

interface Article {
  title: string
  provider: 'AWS' | 'Azure' | 'GCP'
  date: string
  impact: Impact
  url: string
}

const SAMPLE_ARTICLES: Article[] = [
  { title: 'AWS Announces Amazon Bedrock Agents with Multi-Step Reasoning', provider: 'AWS', date: '2025-04-10', impact: 'High', url: '#' },
  { title: 'AWS re:Invent 2025 Preview: Major Infrastructure Announcements Expected', provider: 'AWS', date: '2025-04-08', impact: 'High', url: '#' },
  { title: 'Amazon EC2 P6 Instances Now Available with NVIDIA Blackwell GPUs', provider: 'AWS', date: '2025-04-05', impact: 'High', url: '#' },
  { title: 'AWS Cost Optimization Hub Gets New Savings Plan Recommendations', provider: 'AWS', date: '2025-04-02', impact: 'Medium', url: '#' },
  { title: 'Microsoft Copilot for Azure Reaches General Availability', provider: 'Azure', date: '2025-04-11', impact: 'High', url: '#' },
  { title: 'Azure OpenAI Service Adds GPT-4o Real-Time API Support', provider: 'Azure', date: '2025-04-09', impact: 'High', url: '#' },
  { title: 'Microsoft Acquisition of Nuance AI Platform Integration Complete', provider: 'Azure', date: '2025-04-06', impact: 'High', url: '#' },
  { title: 'Azure Arc Expands Multi-Cloud Governance to Oracle Cloud', provider: 'Azure', date: '2025-04-04', impact: 'Medium', url: '#' },
  { title: 'Google Gemini Ultra 2.0 Launches on Vertex AI Platform', provider: 'GCP', date: '2025-04-12', impact: 'High', url: '#' },
  { title: 'Google Cloud Announces Breakthrough in Quantum Computing Research', provider: 'GCP', date: '2025-04-07', impact: 'High', url: '#' },
  { title: 'GCP BigQuery Omni Adds Support for Azure Fabric Integration', provider: 'GCP', date: '2025-04-03', impact: 'Medium', url: '#' },
  { title: 'Google Cloud TPU v6 Now Generally Available for AI Training', provider: 'GCP', date: '2025-04-01', impact: 'High', url: '#' },
]

const ALL_PROVIDERS = ['AWS', 'Azure', 'GCP'] as const

export default function IntelligencePage() {
  const [selectedProviders, setSelectedProviders] = useState<string[]>(['AWS', 'Azure', 'GCP'])
  const [selectedImpact, setSelectedImpact] = useState<Impact | 'All'>('All')

  const toggleProvider = (p: string) => {
    setSelectedProviders((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }

  const filtered = SAMPLE_ARTICLES.filter(
    (a) =>
      selectedProviders.includes(a.provider) &&
      (selectedImpact === 'All' || a.impact === selectedImpact)
  )

  return (
    <div className="min-h-screen pt-24 px-4 pb-16" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
            Cloud Intelligence
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Latest cloud news &amp; insights
          </h1>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            Curated announcements from AWS, Azure, and Google Cloud — filtered by impact.
          </p>
        </div>

        {/* Filters */}
        <div
          className="rounded-2xl p-5 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-white shrink-0">
            <Filter size={14} style={{ color: 'var(--accent)' }} /> Filters
          </div>

          <div className="flex flex-wrap gap-2">
            {ALL_PROVIDERS.map((p) => {
              const colors: Record<string, string> = { AWS: '#FF9900', Azure: '#0078D4', GCP: '#34A853' }
              const active = selectedProviders.includes(p)
              return (
                <button
                  key={p} onClick={() => toggleProvider(p)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: active ? `${colors[p]}22` : 'rgba(255,255,255,0.05)',
                    border: active ? `1px solid ${colors[p]}` : '1px solid transparent',
                    color: active ? colors[p] : '#a0a0b0',
                  }}
                >{p}</button>
              )
            })}

            <div className="w-px self-stretch" style={{ background: 'var(--border)' }} />

            {(['All', 'High', 'Medium', 'Low'] as const).map((level) => (
              <button
                key={level} onClick={() => setSelectedImpact(level)}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: selectedImpact === level ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                  border: selectedImpact === level ? '1px solid #6366f1' : '1px solid transparent',
                  color: selectedImpact === level ? '#c7d2fe' : '#a0a0b0',
                }}
              >{level === 'All' ? 'All Impact' : `${level} Impact`}</button>
            ))}
          </div>

          <span className="text-xs ml-auto shrink-0" style={{ color: 'var(--text-secondary)' }}>
            {filtered.length} articles
          </span>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Sample articles — connect to RSS feeds for live data
          </span>
          <Rss size={12} style={{ color: 'var(--text-secondary)' }} />
        </div>

        {/* Article grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((article, i) => (
              <NewsCard key={i} {...article} />
            ))}
          </div>
        ) : (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <p style={{ color: 'var(--text-secondary)' }}>No articles match your filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
