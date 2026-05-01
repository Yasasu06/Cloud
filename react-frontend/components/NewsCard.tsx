'use client'

import { ExternalLink, Calendar } from 'lucide-react'

interface NewsCardProps {
  title: string
  provider: string
  date: string
  impact: 'High' | 'Medium' | 'Low'
  url?: string
}

const PROVIDER_COLORS: Record<string, string> = {
  AWS: '#FF9900',
  Azure: '#0078D4',
  GCP: '#34A853',
}

const IMPACT_STYLES: Record<string, { bg: string; text: string }> = {
  High: { bg: 'rgba(239,68,68,0.15)', text: '#f87171' },
  Medium: { bg: 'rgba(234,179,8,0.15)', text: '#facc15' },
  Low: { bg: 'rgba(34,197,94,0.15)', text: '#4ade80' },
}

export default function NewsCard({ title, provider, date, impact, url }: NewsCardProps) {
  const providerColor = PROVIDER_COLORS[provider] ?? '#6366f1'
  const impactStyle = IMPACT_STYLES[impact] ?? IMPACT_STYLES.Medium

  return (
    <div
      className="rounded-xl p-5 transition-all duration-200 hover:scale-[1.01] group"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${providerColor}`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Provider + impact badges */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: `${providerColor}20`, color: providerColor }}
            >
              {provider}
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: impactStyle.bg, color: impactStyle.text }}
            >
              {impact} Impact
            </span>
          </div>

          {/* Title */}
          <p className="text-sm font-medium text-white leading-snug mb-3 line-clamp-2">
            {title}
          </p>

          {/* Date + link row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <Calendar size={12} />
              <span>{date}</span>
            </div>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-medium transition-colors hover:text-white"
                style={{ color: providerColor }}
              >
                Read more
                <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
