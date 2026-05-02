'use client'

import { useState } from 'react'
import Link from 'next/link'

type Provider = 'All' | 'AWS' | 'Azure' | 'GCP' | 'DigitalOcean' | 'Cloudflare'

interface NewsItem {
  id: string
  provider: Provider
  title: string
  summary: string
  date: string
  tag: string
  color: string
  link?: string
}

const NEWS: NewsItem[] = [
  { id: '1',  provider: 'AWS',          title: 'AWS Graviton4 instances now generally available',                           summary: 'New generation ARM-based instances offering up to 30% better price-performance vs Graviton3. Available in EC2, RDS, and ElastiCache.',                date: '2025-04-28', tag: 'New Instance',    color: '#f59e0b' },
  { id: '2',  provider: 'Azure',        title: 'Microsoft cuts Azure Blob Storage prices by 15% in all regions',            summary: 'Standard GRS and LRS tiers reduced. Effective immediately for existing customers. No action required.',                                          date: '2025-04-25', tag: 'Price Reduction', color: '#22c55e' },
  { id: '3',  provider: 'GCP',          title: 'Google Spot VMs now support GPUs in 8 new regions',                         summary: 'Spot pricing for A100 and H100 instances expanded. Typical 60–91% discount vs on-demand pricing.',                                              date: '2025-04-22', tag: 'Expansion',       color: '#4285f4' },
  { id: '4',  provider: 'AWS',          title: 'Amazon RDS Aurora I/O-Optimized pricing model available for all clusters',  summary: 'Predictable pricing for I/O-intensive workloads. Eliminates per-request charges. Best for apps with >25% I/O cost in current bill.',             date: '2025-04-20', tag: 'Pricing Change',  color: '#f59e0b' },
  { id: '5',  provider: 'Cloudflare',   title: 'Cloudflare Workers raises free tier to 100,000 requests/day per worker',    summary: 'Up from 10,000. All existing free accounts upgraded automatically. No code changes required.',                                                    date: '2025-04-18', tag: 'Free Tier',       color: '#f6821f' },
  { id: '6',  provider: 'Azure',        title: 'Azure Reserved VM Instances now support 3-year terms for new families',     summary: 'Dv5, Ev5, and Fsv2 series now eligible for 3-year reservations. Up to 72% savings vs pay-as-you-go.',                                           date: '2025-04-15', tag: 'Savings',         color: '#22c55e' },
  { id: '7',  provider: 'GCP',          title: 'BigQuery pricing model updated: slot-based billing replaces on-demand',     summary: 'BigQuery editions now default. On-demand still available. Organizations processing >100TB/month typically save 40–60% with slots.',             date: '2025-04-12', tag: 'Pricing Change',  color: '#4285f4' },
  { id: '8',  provider: 'AWS',          title: 'S3 Intelligent-Tiering minimum object size removed',                        summary: 'Previously required 128KB minimum. Now applies to all objects. Expected to increase savings for services with many small files.',              date: '2025-04-10', tag: 'Feature Update',  color: '#f59e0b' },
  { id: '9',  provider: 'DigitalOcean', title: 'DigitalOcean Premium CPU Droplets get 20% price reduction',                 summary: 'Premium AMD and Intel droplets reduced across all sizes. Cheapest tier now $4/month for 1 vCPU / 512MB.',                                       date: '2025-04-08', tag: 'Price Reduction', color: '#0080ff' },
  { id: '10', provider: 'GCP',          title: 'Cloud Run Gen2 execution environment now default for all new services',     summary: 'Improved cold start times (up to 3x faster) and support for longer request timeouts (up to 60 minutes).',                                      date: '2025-04-05', tag: 'Infrastructure',  color: '#4285f4' },
  { id: '11', provider: 'AWS',          title: 'AWS Cost Anomaly Detection now free for all accounts',                      summary: 'Previously part of Cost Explorer paid features. Machine learning-powered spend monitoring now included at no extra cost.',                      date: '2025-04-03', tag: 'Free Feature',    color: '#22c55e' },
  { id: '12', provider: 'Azure',        title: 'Azure Savings Plans now support 1-hour compute flexibility',                summary: 'Switch between VM families within the same commitment. No more penalties for workload changes within a billing period.',                          date: '2025-04-01', tag: 'Feature Update',  color: '#0078d4' },
]

const PROVIDERS: Provider[] = ['All', 'AWS', 'Azure', 'GCP', 'DigitalOcean', 'Cloudflare']

const PROVIDER_COLORS: Record<string, string> = {
  AWS: '#f59e0b', Azure: '#0078d4', GCP: '#4285f4',
  DigitalOcean: '#0080ff', Cloudflare: '#f6821f',
}

const TAG_COLORS: Record<string, string> = {
  'Price Reduction': '#22c55e', 'Free Tier': '#22c55e', 'Free Feature': '#22c55e',
  'Pricing Change': '#f59e0b', 'Savings': '#6366f1',
  'New Instance': '#818cf8', 'Expansion': '#0ea5e9', 'Feature Update': '#a0a0b0', 'Infrastructure': '#a0a0b0',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`
}

interface Props { embedded?: boolean }

export default function ProviderNewsTool({ embedded = false }: Props) {
  const [filter, setFilter] = useState<Provider>('All')

  const filtered = filter === 'All' ? NEWS : NEWS.filter(n => n.provider === filter)

  // Hub-aware digest link
  const digestHref = embedded ? '/intelligence?tab=digest' : '/weekly-digest'

  const inner = (
    <>
      {!embedded && (
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>
            PROVIDER INTELLIGENCE
          </div>
          <h1 style={{ fontSize: 'clamp(26px,5vw,40px)', fontWeight: 900, marginBottom: 12, lineHeight: 1.1 }}>
            Cloud Provider News
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 15, maxWidth: 460, margin: '0 auto' }}>
            Pricing changes, new features, and announcements from AWS, Azure, GCP and alternatives — curated for cost impact.
          </p>
        </div>
      )}

      {/* Provider filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
        {PROVIDERS.map(p => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            style={{
              padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              border: filter === p ? `1px solid ${p === 'All' ? '#6366f1' : PROVIDER_COLORS[p]}60` : '1px solid rgba(255,255,255,0.08)',
              background: filter === p ? `rgba(${hexToRgb(p === 'All' ? '#6366f1' : PROVIDER_COLORS[p])},0.12)` : 'rgba(255,255,255,0.02)',
              color: filter === p ? (p === 'All' ? '#818cf8' : PROVIDER_COLORS[p]) : '#a0a0b0', transition: 'all 0.15s',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* News grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
        {filtered.map(item => (
          <div key={item.id} className="glass-card" style={{ padding: '20px 24px', borderLeft: `3px solid ${PROVIDER_COLORS[item.provider] ?? '#555'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: PROVIDER_COLORS[item.provider] ?? '#555', background: `rgba(${hexToRgb(PROVIDER_COLORS[item.provider] ?? '#555')},0.1)`, border: `1px solid rgba(${hexToRgb(PROVIDER_COLORS[item.provider] ?? '#555')},0.25)`, padding: '2px 8px', borderRadius: 5 }}>
                    {item.provider}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: TAG_COLORS[item.tag] ?? '#555', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 5 }}>
                    {item.tag}
                  </span>
                  <span style={{ fontSize: 11, color: '#444' }}>{timeAgo(item.date)}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 6, lineHeight: 1.3 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: '#a0a0b0', lineHeight: 1.5 }}>{item.summary}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Newsletter CTA */}
      <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.02))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20, padding: '32px', textAlign: 'center' }}>
        <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>Get the weekly cloud digest</h3>
        <p style={{ color: '#a0a0b0', fontSize: 14, maxWidth: 360, margin: '0 auto 20px' }}>
          Pricing changes, new savings opportunities, and provider news — every week, free.
        </p>
        <Link href={digestHref} style={{ background: '#6366f1', borderRadius: 10, padding: '11px 24px', color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
          Subscribe to Weekly Digest →
        </Link>
      </div>
    </>
  )

  if (embedded) return <div>{inner}</div>
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '100px 24px 80px' }}>{inner}</div>
    </div>
  )
}
