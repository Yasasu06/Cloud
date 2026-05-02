import Link from 'next/link'
import type { AlternativeProvider } from './types'

export default function AlternativesSection({ data }: { data: AlternativeProvider[] }) {
  if (!data?.length) return null
  return (
    <div style={{ marginTop: 32, marginBottom: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 11, color: '#818cf8', letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>EQUAL WEIGHT ALTERNATIVES</p>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: 'white', margin: 0 }}>Alternative providers worth considering</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
        {data.map((alt, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14, padding: '20px 22px',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.3)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 26 }}>{alt.logo || '☁️'}</span>
              <h4 style={{ fontSize: 17, fontWeight: 800, color: 'white', margin: 0 }}>{alt.name}</h4>
            </div>
            {typeof alt.savings_vs_current === 'number' && alt.savings_vs_current > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#22c55e', lineHeight: 1 }}>
                  -${alt.savings_vs_current.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>per month vs current</div>
              </div>
            )}
            {typeof alt.monthly_cost_estimate === 'number' && (
              <div style={{ fontSize: 12, color: '#a0a0b0', marginBottom: 10 }}>
                Estimated cost: <strong style={{ color: 'white' }}>${alt.monthly_cost_estimate.toLocaleString()}/mo</strong>
              </div>
            )}
            {alt.why && (
              <p style={{ fontSize: 13, color: '#a0a0b0', lineHeight: 1.6, margin: '0 0 10px' }}>
                <span style={{ color: '#666' }}>Why: </span>{alt.why}
              </p>
            )}
            {alt.recommended_for && (
              <p style={{ fontSize: 12, color: '#666', margin: '0 0 14px' }}>
                Best for: {alt.recommended_for}
              </p>
            )}
            <Link href={`/compare?provider=${encodeURIComponent(alt.name)}`} style={{
              fontSize: 12, color: '#818cf8', fontWeight: 600, textDecoration: 'none',
            }}>
              Compare in detail →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
