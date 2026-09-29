'use client'

import { useRouter } from 'next/navigation'

interface AltProvider {
  id: string
  name: string
  emoji: string
  tagline: string
  bestFor: string
  starting: string
  stat: string
  statLabel: string
  color: string
  strengths: string[]
  compareSlug: string
}

const PROVIDERS: AltProvider[] = [
  {
    id: 'digitalocean',
    name: 'DigitalOcean',
    emoji: '🌊',
    tagline: 'Developer-friendly cloud',
    bestFor: 'Startups, indie devs, web apps',
    starting: '$4/month',
    stat: '600k+',
    statLabel: 'customers',
    color: '#0080ff',
    strengths: ['Simple flat pricing', 'Best docs in the industry', 'Managed Kubernetes (DOKS)', '1-click app deploys'],
    compareSlug: 'DigitalOcean',
  },
  {
    id: 'hetzner',
    name: 'Hetzner',
    emoji: '🇩🇪',
    tagline: 'Best price/performance ratio',
    bestFor: 'European startups, dedicated workloads',
    starting: '€3.29/month (~$3.50)',
    stat: '30+',
    statLabel: 'years in hosting',
    color: '#e63946',
    strengths: ['Cheapest dedicated servers in EU', 'GDPR-compliant by default', '20TB free egress/month', 'Bare metal from €39/month'],
    compareSlug: 'Hetzner',
  },
  {
    id: 'linode',
    name: 'Linode (Akamai)',
    emoji: '🔵',
    tagline: 'Simple & predictable pricing',
    bestFor: 'Predictable workloads, Linux teams',
    starting: '$5/month',
    stat: '1M+',
    statLabel: 'customers',
    color: '#02b159',
    strengths: ['Flat, predictable pricing', 'Global Akamai CDN included', '1TB free transfer/month', 'No surprise bills'],
    compareSlug: 'Linode',
  },
  {
    id: 'vultr',
    name: 'Vultr',
    emoji: '⚡',
    tagline: 'Global edge computing',
    bestFor: 'Edge computing, global reach',
    starting: '$2.50/month',
    stat: '32',
    statLabel: 'datacenters',
    color: '#007bfc',
    strengths: ['Bare metal cloud instances', '100% Intel/AMD CPUs', 'Widest global coverage', 'One-click Kubernetes'],
    compareSlug: 'Vultr',
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare Workers',
    emoji: '🔶',
    tagline: 'Edge-first serverless',
    bestFor: 'Edge functions, static sites, APIs',
    starting: '$0/month (free tier)',
    stat: '20%',
    statLabel: 'of the internet',
    color: '#f6821f',
    strengths: ['100k requests/day free', 'Zero cold starts', 'Zero egress fees', 'Runs in 300+ locations'],
    compareSlug: 'Cloudflare Workers',
  },
  {
    id: 'oracle',
    name: 'Oracle Cloud',
    emoji: '☁️',
    tagline: 'Generous always-free tier',
    bestFor: 'Oracle DB workloads, cost-sensitive teams',
    starting: '$0 (best free tier)',
    stat: '46',
    statLabel: 'regions',
    color: '#c0392b',
    strengths: ['4 ARM cores free forever', '2 AMD VMs free forever', '200GB storage always-free', '10TB egress free/month'],
    compareSlug: 'Oracle Cloud',
  },
  {
    id: 'ovh',
    name: 'OVH',
    emoji: '🔷',
    tagline: 'European cloud leader',
    bestFor: 'European compliance, data sovereignty',
    starting: '€3/month (~$3)',
    stat: '#1',
    statLabel: 'EU cloud provider',
    color: '#123f6d',
    strengths: ['European hosting regions', 'Dedicated server options', 'Anti-DDoS features', 'Review provider terms for data protection'],
    compareSlug: 'OVH',
  },
  {
    id: 'render',
    name: 'Render',
    emoji: '🟢',
    tagline: 'The Heroku replacement',
    bestFor: 'Heroku migrants, web services',
    starting: '$7/month',
    stat: 'Git-push',
    statLabel: 'deploys',
    color: '#46e3b7',
    strengths: ['Auto-deploy from Git', 'Zero-downtime deploys', 'Managed Postgres & Redis', 'Free static site hosting'],
    compareSlug: 'Render',
  },
  {
    id: 'railway',
    name: 'Railway',
    emoji: '🚂',
    tagline: 'Modern dev platform',
    bestFor: 'Indie hackers, side projects',
    starting: '$5/month + usage',
    stat: '$5',
    statLabel: 'credit/month free',
    color: '#b044f8',
    strengths: ['Modern, delightful UX', 'Fast deploys (<30 seconds)', 'Automatic HTTPS', 'Built-in metrics'],
    compareSlug: 'Railway',
  },
]

const VS_SAVINGS = [
  { size: 'Startup ($500/mo AWS)', saving: '$250–350/mo', provider: 'Hetzner or DigitalOcean' },
  { size: 'Growth ($5k/mo AWS)', saving: '$1.5–2.5k/mo', provider: 'Hetzner + Cloudflare' },
  { size: 'Side project ($50/mo)', saving: '$30–45/mo', provider: 'Railway or Render' },
]

export default function AlternativesPage() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>
            ALTERNATIVE CLOUD PROVIDERS
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 900, marginBottom: 14, lineHeight: 1.1 }}>
            Beyond AWS, Azure & GCP
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 16, maxWidth: 540, margin: '0 auto 28px' }}>
            The big three aren&apos;t always the right answer. For startups under $5k/month, alternatives often cost 50–70% less.
          </p>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['9 providers covered', 'Updated pricing 2025', 'No sponsorships'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#a0a0b0' }}>
                <span style={{ color: '#6366f1' }}>✓</span>{t}
              </div>
            ))}
          </div>
        </div>

        {/* Savings teaser */}
        <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 16, padding: '20px 24px', marginBottom: 48, display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#22c55e', flexShrink: 0 }}>💡 Typical savings vs AWS</div>
          {VS_SAVINGS.map(s => (
            <div key={s.size} style={{ fontSize: 13, color: '#666' }}>
              <strong style={{ color: 'white' }}>{s.size}</strong>: save <strong style={{ color: '#22c55e' }}>{s.saving}</strong> with {s.provider}
            </div>
          ))}
        </div>

        {/* Provider grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 20, marginBottom: 56 }}>
          {PROVIDERS.map(p => (
            <div
              key={p.id}
              className="glass-card"
              style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 0, borderTop: `3px solid ${p.color}` }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 32 }}>{p.emoji}</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: p.color, fontWeight: 600 }}>{p.tagline}</div>
                </div>
              </div>

              {/* Best for */}
              <div style={{ fontSize: 12, color: '#666', marginBottom: 14 }}>
                <span style={{ color: '#555', fontWeight: 700 }}>BEST FOR: </span>{p.bestFor}
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#22c55e' }}>{p.starting}</div>
                  <div style={{ fontSize: 10, color: '#444', fontWeight: 700, letterSpacing: 1, marginTop: 2 }}>STARTING</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: p.color }}>{p.stat}</div>
                  <div style={{ fontSize: 10, color: '#444', fontWeight: 700, letterSpacing: 1, marginTop: 2 }}>{p.statLabel.toUpperCase()}</div>
                </div>
              </div>

              {/* Strengths */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20, flex: 1 }}>
                {p.strengths.map(s => (
                  <div key={s} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#a0a0b0', alignItems: 'flex-start' }}>
                    <span style={{ color: p.color, flexShrink: 0, marginTop: 1 }}>✓</span>
                    {s}
                  </div>
                ))}
              </div>

              {/* Button */}
              <button
                onClick={() => router.push(`/compare?with=${encodeURIComponent(p.compareSlug)}`)}
                style={{
                  background: `rgba(${hexToRgb(p.color)},0.12)`,
                  border: `1px solid rgba(${hexToRgb(p.color)},0.3)`,
                  borderRadius: 10, padding: '10px 0', color: p.color,
                  fontWeight: 700, fontSize: 13, cursor: 'pointer', width: '100%',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `rgba(${hexToRgb(p.color)},0.2)` }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `rgba(${hexToRgb(p.color)},0.12)` }}
              >
                Compare to AWS/Azure/GCP →
              </button>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.02))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20, padding: '36px 40px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>Not sure which provider is right for you?</h2>
          <p style={{ color: '#a0a0b0', fontSize: 15, marginBottom: 24, maxWidth: 420, margin: '0 auto 24px' }}>
            Describe your project and our AI will recommend the best provider — including alternatives — with cost estimates.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/analyze?mode=architect')}
              style={{ background: '#6366f1', border: 'none', borderRadius: 12, padding: '13px 28px', color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
            >
              Get AI Recommendation →
            </button>
            <button
              onClick={() => router.push('/compare')}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '13px 28px', color: '#a0a0b0', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
            >
              Side-by-Side Comparison
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `${r},${g},${b}`
}
