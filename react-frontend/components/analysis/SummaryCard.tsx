import type { AnalysisSummary } from './types'

const VERDICT_COLORS: Record<AnalysisSummary['verdict_type'], { bg: string; border: string; accent: string; label: string; icon: string }> = {
  savings_opportunity: { bg: 'rgba(34,197,94,0.06)', border: 'rgba(34,197,94,0.25)', accent: '#22c55e', label: 'SAVINGS OPPORTUNITY', icon: '💰' },
  well_optimized:      { bg: 'rgba(99,102,241,0.06)', border: 'rgba(99,102,241,0.25)', accent: '#818cf8', label: 'WELL OPTIMIZED', icon: '✓' },
  needs_review:        { bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.25)', accent: '#f59e0b', label: 'NEEDS REVIEW', icon: '⚠️' },
}

const CONFIDENCE_COLOR: Record<AnalysisSummary['confidence'], string> = {
  high: '#22c55e', medium: '#f59e0b', low: '#ef4444',
}

export default function SummaryCard({ data }: { data: AnalysisSummary }) {
  const verdict = VERDICT_COLORS[data.verdict_type] ?? VERDICT_COLORS.needs_review
  return (
    <div style={{
      background: verdict.bg,
      border: `1px solid ${verdict.border}`,
      borderLeft: `4px solid ${verdict.accent}`,
      borderRadius: 16, padding: '28px 32px', marginBottom: 24,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>{verdict.icon}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: verdict.accent, letterSpacing: 2 }}>{verdict.label}</span>
        </div>
        <div className="shimmer-text" style={{
          fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
          background: `${CONFIDENCE_COLOR[data.confidence]}15`,
          border: `1px solid ${CONFIDENCE_COLOR[data.confidence]}30`,
          color: CONFIDENCE_COLOR[data.confidence], letterSpacing: 1,
        }}>
          {data.confidence.toUpperCase()} CONFIDENCE
        </div>
      </div>
      <h2 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 800, color: 'white', lineHeight: 1.3, margin: 0 }}>
        {data.headline}
      </h2>
    </div>
  )
}
