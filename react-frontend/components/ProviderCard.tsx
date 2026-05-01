'use client'

import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

interface ProviderCardProps {
  name: string
  color: string
  marketShare: number
  revenue: string
  growth: string
  tag: string
  description: string
}

export default function ProviderCard({
  name,
  color,
  marketShare,
  revenue,
  growth,
  tag,
  description,
}: ProviderCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative rounded-2xl p-6 cursor-default"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderTop: `3px solid ${color}`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.3)`,
      }}
    >
      {/* Provider tag */}
      <div className="mb-4">
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
          style={{ background: `${color}22`, color }}
        >
          {tag}
        </span>
      </div>

      {/* Provider name */}
      <h3 className="text-lg font-bold text-white mb-2">{name}</h3>
      <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
            Q4 2025 Revenue
          </p>
          <p className="text-xl font-bold text-white">{revenue}</p>
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
            YoY Growth
          </p>
          <div className="flex items-center gap-1">
            <TrendingUp size={14} style={{ color }} />
            <p className="text-xl font-bold" style={{ color }}>
              {growth}
            </p>
          </div>
        </div>
      </div>

      {/* Market share bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Market Share
          </p>
          <p className="text-xs font-semibold text-white">{marketShare}%</p>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            whileInView={{ width: `${marketShare}%` }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
            viewport={{ once: true }}
          />
        </div>
      </div>
    </motion.div>
  )
}
