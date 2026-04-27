'use client'

import { ALTERNATIVE_PROVIDERS, AlternativeProvider } from '@/lib/data'
import { CheckCircle2, XCircle, Star, Globe, Shield, ExternalLink } from 'lucide-react'

function ProviderCard({ p }: { p: AlternativeProvider }) {
  const displayUrl = p.website.replace(/^https?:\/\//, '')

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderLeft: `4px solid ${p.color}`,
      }}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{p.logo}</span>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">{p.name}</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{p.tagline}</p>
            </div>
          </div>
          <span
            className="shrink-0 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap"
            style={{ background: `${p.color}20`, color: p.color }}
          >
            from {p.monthlyStarting}/mo
          </span>
        </div>
      </div>

      {/* 2×2 grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px" style={{ background: 'var(--border)' }}>
        {/* Strengths */}
        <div className="p-4" style={{ background: 'var(--bg-card)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2.5" style={{ color: '#4ade80' }}>
            Strengths
          </p>
          <ul className="space-y-1.5">
            {p.strengths.map((s) => (
              <li key={s} className="flex items-start gap-2 text-xs" style={{ color: '#d1fae5' }}>
                <CheckCircle2 size={12} className="mt-0.5 shrink-0" style={{ color: '#4ade80' }} />
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="p-4" style={{ background: 'var(--bg-card)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2.5" style={{ color: '#f87171' }}>
            Weaknesses
          </p>
          <ul className="space-y-1.5">
            {p.weaknesses.map((w) => (
              <li key={w} className="flex items-start gap-2 text-xs" style={{ color: '#fecaca' }}>
                <XCircle size={12} className="mt-0.5 shrink-0" style={{ color: '#f87171' }} />
                {w}
              </li>
            ))}
          </ul>
        </div>

        {/* Best For */}
        <div className="p-4" style={{ background: 'var(--bg-card)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2.5" style={{ color: '#60a5fa' }}>
            Best For
          </p>
          <ul className="space-y-1.5">
            {p.bestFor.map((b) => (
              <li key={b} className="flex items-start gap-2 text-xs" style={{ color: '#bfdbfe' }}>
                <Star size={10} className="mt-0.5 shrink-0" style={{ color: '#60a5fa' }} />
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Free Tier */}
        <div className="p-4" style={{ background: 'rgba(245,158,11,0.06)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2.5" style={{ color: '#fbbf24' }}>
            Free Tier
          </p>
          <p className="text-xs leading-relaxed" style={{ color: '#fde68a' }}>
            {p.freetier}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-6 py-4 flex items-center justify-between gap-3 flex-wrap"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span className="flex items-center gap-1">
            <Globe size={12} /> {p.regions} regions
          </span>
          <span className="flex items-center gap-1 flex-wrap gap-y-1">
            <Shield size={12} />
            {p.certifications.join(' · ')}
          </span>
        </div>
        <a
          href={p.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
          style={{ background: `${p.color}20`, color: p.color, border: `1px solid ${p.color}40` }}
        >
          {displayUrl} <ExternalLink size={11} />
        </a>
      </div>
    </div>
  )
}

const TABLE_COLS = ['Provider', 'Starting Price', 'Free Tier', 'Best For', 'Regions']

export default function OthersPage() {
  return (
    <div className="min-h-screen pt-24 px-4 pb-20" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto">

        {/* Cheapest option section */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a2e, #0f2027)',
          borderRadius: 16,
          padding: 32,
          marginBottom: 40,
          border: '1px solid #22c55e30',
        }}>
          <div style={{ fontSize: 13, color: '#22c55e', fontWeight: 600, letterSpacing: 2, marginBottom: 12 }}>
            💰 CHEAPEST CLOUD FOR YOUR USE CASE
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Not everyone needs AWS.</h2>
          <p style={{ color: '#a0a0b0', marginBottom: 24, fontSize: 15 }}>
            The Big 3 are built for scale. If you&apos;re a developer, startup, or small business — these alternatives will save you 60-80% without sacrificing reliability.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {[
              { use: 'Personal projects', winner: 'Oracle Cloud', reason: 'Always-free tier: 4 ARM cores, 24GB RAM, forever', saving: '100% free' },
              { use: 'Small web apps', winner: 'DigitalOcean', reason: 'Simplest setup, $4/month, no surprise bills', saving: '70% cheaper than AWS' },
              { use: 'European startups', winner: 'Hetzner', reason: 'GDPR-native, green energy, €3.29/month', saving: '80% cheaper than Azure' },
              { use: 'Game servers', winner: 'Vultr', reason: '$2.50/month entry, 17 global locations', saving: '75% cheaper than AWS' },
              { use: 'Edge & CDN', winner: 'Cloudflare', reason: 'Free CDN, Workers free tier, 285 locations', saving: 'Free tier available' },
              { use: 'Developer VPS', winner: 'Linode', reason: '$5/month, Linux-native, transparent pricing', saving: '65% cheaper than GCP' },
            ].map(item => (
              <div key={item.use} style={{
                background: '#0a0a0f',
                borderRadius: 12,
                padding: 16,
                borderLeft: '3px solid #22c55e',
              }}>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>BEST FOR</div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{item.use}</div>
                <div style={{ color: '#22c55e', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{item.winner}</div>
                <div style={{ color: '#a0a0b0', fontSize: 12, marginBottom: 8 }}>{item.reason}</div>
                <div style={{
                  background: 'rgba(34,197,94,0.1)',
                  color: '#22c55e',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 4,
                  display: 'inline-block',
                }}>
                  {item.saving}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
            Alternative Providers
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Beyond the Big Three</h1>
          <p className="text-base max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            The cloud giants aren&apos;t always the right choice. For developers, startups, and budget-conscious
            teams — these alternatives often win on simplicity, price, and fit.
          </p>
        </div>

        {/* Comparison table */}
        <div
          className="rounded-2xl overflow-hidden mb-12"
          style={{ border: '1px solid var(--border)' }}
        >
          <div
            className="px-5 py-3 text-xs font-semibold uppercase tracking-widest"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
          >
            Quick Comparison
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                  {TABLE_COLS.map((col) => (
                    <th
                      key={col}
                      className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALTERNATIVE_PROVIDERS.map((p, i) => (
                  <tr
                    key={p.name}
                    style={{
                      background: i % 2 === 0 ? 'var(--bg-card)' : 'rgba(255,255,255,0.02)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 font-semibold text-white">
                        <span>{p.logo}</span>
                        <span style={{ color: p.color }}>{p.name}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold" style={{ color: p.color }}>
                      {p.monthlyStarting}/mo
                    </td>
                    <td className="px-4 py-3 text-xs max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                      {p.freetier.length > 40 ? p.freetier.slice(0, 40) + '…' : p.freetier}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {p.bestFor[0]}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{p.regions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Provider cards */}
        <div className="space-y-6">
          {ALTERNATIVE_PROVIDERS.map((p) => (
            <ProviderCard key={p.name} p={p} />
          ))}
        </div>
      </div>
    </div>
  )
}
