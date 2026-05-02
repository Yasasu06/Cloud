export interface Perspective {
  role: 'finops' | 'architect' | 'operations' | 'business'
  take: string
  top_concern: string
  would_do_differently: string
}

const ROLE_META: Record<Perspective['role'], { icon: string; label: string; color: string }> = {
  finops:     { icon: '💰', label: 'FinOps Analyst',       color: '#22c55e' },
  architect:  { icon: '🏗️', label: 'Solutions Architect',  color: '#6366f1' },
  operations: { icon: '🛡️', label: 'Operations Manager',   color: '#f59e0b' },
  business:   { icon: '💼', label: 'Business Strategist',  color: '#a855f7' },
}

export default function Perspectives({ data }: { data: Perspective[] }) {
  if (!data?.length) return null
  return (
    <div style={{ marginTop: 24, marginBottom: 24 }}>
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 11, color: '#818cf8', letterSpacing: 2, fontWeight: 700, marginBottom: 4 }}>
          🎭 FOUR PERSPECTIVES
        </p>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: 'white', margin: 0 }}>
          What different experts say about this
        </h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
        {data.map((p, i) => {
          const meta = ROLE_META[p.role] ?? ROLE_META.architect
          return (
            <div key={i} style={{
              padding: '18px 20px', borderRadius: 14,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderTop: `3px solid ${meta.color}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 22 }}>{meta.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{meta.label}</div>
                  <div style={{ fontSize: 10, color: meta.color, letterSpacing: 1.5, fontWeight: 700 }}>SAYS...</div>
                </div>
              </div>

              <p style={{ fontSize: 13, color: '#d0d0e0', lineHeight: 1.65, marginBottom: 12 }}>
                {p.take}
              </p>

              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#666', letterSpacing: 1.5, marginBottom: 4 }}>TOP CONCERN</div>
                <div style={{ fontSize: 12, color: '#a0a0b0', lineHeight: 1.5 }}>{p.top_concern}</div>
              </div>

              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#666', letterSpacing: 1.5, marginBottom: 4 }}>WOULD DO DIFFERENTLY</div>
                <div style={{ fontSize: 12, color: '#a0a0b0', lineHeight: 1.5 }}>{p.would_do_differently}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
