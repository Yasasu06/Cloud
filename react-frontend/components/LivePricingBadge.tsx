'use client'

import { PROVIDER_LAST_UPDATED, providerSource } from '@/lib/pricing/compare'

function timeAgo(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days <= 0) return 'today'
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface Props {
  provider?: string
  source?: 'live' | 'fallback' | 'static'
  compact?: boolean
}

export default function LivePricingBadge({ provider, source, compact }: Props) {
  if (provider) {
    const last = PROVIDER_LAST_UPDATED[provider]
    if (!last) return null
    const label = source === 'live' ? 'Live' : source === 'fallback' ? 'Fallback' :
      source === 'static' || providerSource(provider) === 'hardcoded' ? 'Static reference' : 'Live or fallback'
    const isLive = label === 'Live'
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: compact ? '3px 8px' : '5px 11px',
        borderRadius: 6, fontSize: compact ? 10 : 11, fontWeight: 600,
        background: isLive ? 'rgba(34,197,94,0.08)' : 'rgba(99,102,241,0.06)',
        border: `1px solid ${isLive ? 'rgba(34,197,94,0.25)' : 'rgba(99,102,241,0.2)'}`,
        color: isLive ? '#22c55e' : '#818cf8',
        whiteSpace: 'nowrap',
      }}>
        <span style={{ fontSize: compact ? 8 : 9 }}>{isLive ? '🟢' : '📌'}</span>
        {label}{isLive ? '' : ` · updated ${timeAgo(last)}`}
      </span>
    )
  }

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: compact ? '3px 8px' : '5px 12px',
      borderRadius: 6, fontSize: compact ? 10 : 11, fontWeight: 600,
      background: 'rgba(34,197,94,0.08)',
      border: '1px solid rgba(34,197,94,0.25)',
      color: '#22c55e', whiteSpace: 'nowrap',
    }}>
      AWS/Azure live or fallback · others static
    </span>
  )
}
