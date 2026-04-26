'use client'

import { useState } from 'react'

const NEWS = [
  { date: 'Apr 24, 2026', provider: 'Azure', category: 'AI', title: 'Microsoft expands Azure OpenAI Service to 12 new regions with GPT-4o support', impact: 'High', summary: 'Microsoft is rapidly expanding its AI infrastructure globally, making enterprise AI more accessible.' },
  { date: 'Apr 22, 2026', provider: 'AWS', category: 'Pricing', title: 'AWS announces 15% price reduction on S3 Standard storage globally', impact: 'High', summary: 'AWS continues price competition as cloud storage becomes increasingly commoditized.' },
  { date: 'Apr 20, 2026', provider: 'GCP', category: 'AI', title: 'Google launches Gemini 2.0 Ultra on Vertex AI with 2M token context window', impact: 'High', summary: 'GCP strengthens its AI position with the most capable publicly available model context window.' },
  { date: 'Apr 18, 2026', provider: 'AWS', category: 'Infrastructure', title: 'AWS opens new region in Malaysia, expanding Southeast Asia presence to 4 regions', impact: 'Medium', summary: 'AWS continues aggressive geographic expansion to capture growing Asia Pacific demand.' },
  { date: 'Apr 15, 2026', provider: 'Azure', category: 'Security', title: 'Microsoft announces Azure Confidential Computing now generally available across all regions', impact: 'Medium', summary: 'Confidential computing protects data in use, critical for financial services and healthcare.' },
  { date: 'Apr 12, 2026', provider: 'GCP', category: 'Data', title: 'BigQuery adds real-time streaming with sub-100ms latency for analytics workloads', impact: 'Medium', summary: 'GCP continues to strengthen its position as the leading cloud analytics platform.' },
  { date: 'Apr 10, 2026', provider: 'DigitalOcean', category: 'Product', title: 'DigitalOcean launches managed GPU droplets starting at $0.40/hour for AI workloads', impact: 'Medium', summary: 'Alternative providers are entering the AI infrastructure space with more affordable options.' },
  { date: 'Apr 8, 2026', provider: 'AWS', category: 'AI', title: 'Amazon Bedrock adds Claude 3.7 Sonnet and new agent orchestration capabilities', impact: 'High', summary: 'AWS continues to expand its AI model marketplace, partnering with all major AI labs.' },
  { date: 'Apr 5, 2026', provider: 'Azure', category: 'Enterprise', title: 'Microsoft Azure Arc expands hybrid cloud management to edge and IoT devices', impact: 'Low', summary: 'Azure strengthens its hybrid cloud story for manufacturing and retail customers.' },
  { date: 'Apr 2, 2026', provider: 'GCP', category: 'Sustainability', title: 'Google Cloud achieves 100% renewable energy matching in all 40 global regions', impact: 'Medium', summary: 'GCP leads the Big 3 on sustainability commitments, a growing enterprise procurement factor.' },
  { date: 'Mar 28, 2026', provider: 'Hetzner', category: 'Pricing', title: 'Hetzner launches US East region with European pricing — 60% cheaper than AWS equivalent', impact: 'Medium', summary: 'European budget cloud providers are entering the US market, increasing price competition.' },
  { date: 'Mar 25, 2026', provider: 'AWS', category: 'Infrastructure', title: 'AWS Lambda increases free tier to 5M requests/month and raises memory cap to 20GB', impact: 'Low', summary: 'AWS improves developer experience on serverless to maintain Lambda market leadership.' },
]

const PROVIDERS = ['All', 'AWS', 'Azure', 'GCP', 'DigitalOcean', 'Hetzner'] as const
const IMPACTS = ['All', 'High', 'Medium', 'Low'] as const
const CATEGORIES = ['All', 'AI', 'Pricing', 'Infrastructure', 'Security', 'Data', 'Product', 'Enterprise', 'Sustainability'] as const

const PROVIDER_COLORS: Record<string, string> = {
  AWS: '#FF9900', Azure: '#0078D4', GCP: '#34A853',
  DigitalOcean: '#0080FF', Hetzner: '#D50C2D',
}

const IMPACT_COLORS: Record<string, string> = {
  High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e',
}

export default function IntelligencePage() {
  const [provider, setProvider] = useState('All')
  const [impact, setImpact] = useState('All')
  const [category, setCategory] = useState('All')

  const filtered = NEWS.filter(
    (n) =>
      (provider === 'All' || n.provider === provider) &&
      (impact === 'All' || n.impact === impact) &&
      (category === 'All' || n.category === category)
  )

  function filterBtn(active: boolean): React.CSSProperties {
    return {
      padding: '6px 14px',
      borderRadius: 20,
      border: active ? 'none' : '1px solid #ffffff20',
      background: active ? '#6366f1' : 'transparent',
      color: active ? 'white' : '#a0a0b0',
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: active ? 600 : 400,
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px 60px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>📰 Cloud Intelligence Feed</h1>
          <p style={{ color: '#a0a0b0' }}>
            Latest developments across AWS, Azure, GCP, and alternative providers. Updated weekly.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: '#a0a0b0', marginBottom: 8 }}>PROVIDER</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {PROVIDERS.map((p) => (
                <button key={p} onClick={() => setProvider(p)} style={filterBtn(provider === p)}>{p}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#a0a0b0', marginBottom: 8 }}>IMPACT</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {IMPACTS.map((i) => (
                <button key={i} onClick={() => setImpact(i)} style={filterBtn(impact === i)}>{i}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#a0a0b0', marginBottom: 8 }}>CATEGORY</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => setCategory(c)} style={filterBtn(category === c)}>{c}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 16, color: '#a0a0b0', fontSize: 13 }}>
          Showing {filtered.length} of {NEWS.length} stories
        </div>

        {/* Article list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((article, i) => (
            <div
              key={i}
              style={{
                background: '#1a1a2e',
                borderRadius: 12,
                padding: '20px 24px',
                borderLeft: `4px solid ${PROVIDER_COLORS[article.provider] || '#6366f1'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: PROVIDER_COLORS[article.provider] || '#6366f1', fontWeight: 700, fontSize: 13 }}>
                    {article.provider}
                  </span>
                  <span style={{ background: '#ffffff10', padding: '2px 8px', borderRadius: 4, fontSize: 11, color: '#a0a0b0' }}>
                    {article.category}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: IMPACT_COLORS[article.impact], fontSize: 12, fontWeight: 600 }}>
                    {article.impact} Impact
                  </span>
                  <span style={{ color: '#666', fontSize: 12 }}>{article.date}</span>
                </div>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, lineHeight: 1.4 }}>
                {article.title}
              </h3>
              <p style={{ color: '#a0a0b0', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                {article.summary}
              </p>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: '#a0a0b0' }}>
            No stories match your current filters.
          </div>
        )}
      </div>
    </div>
  )
}
