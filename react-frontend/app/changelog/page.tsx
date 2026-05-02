const ENTRIES = [
  {
    version: '2.0',
    date: 'May 2026',
    title: 'Major Visual Upgrade',
    changes: [
      'Premium glass-card design system',
      'Animated gradient hero',
      'Global search with Cmd+K',
      '42 pages covering full cloud journey',
    ],
  },
  {
    version: '1.9',
    date: 'April 2026',
    title: 'New Analysis Tools',
    changes: [
      'Cost Forecast with line charts',
      'Multi-Cloud consolidation view',
      'Reserved Instance optimizer',
      'Infrastructure cost estimator',
    ],
  },
  {
    version: '1.8',
    date: 'April 2026',
    title: 'Intelligence Features',
    changes: [
      'Price alerts feed',
      'Cloud provider news',
      'Industry benchmarking',
      'Cloud glossary with 50+ terms',
    ],
  },
  {
    version: '1.7',
    date: 'March 2026',
    title: 'AI Improvements',
    changes: [
      'Quick Wins after every analysis',
      'Data source citations',
      'Architecture diagram generator',
      'AI Strategy Session',
    ],
  },
]

const VERSION_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#3b82f6']

export default function ChangelogPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '100px 24px 80px' }}>

        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 14, letterSpacing: 1 }}>
            CHANGELOG
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, marginBottom: 10 }}>
            What&apos;s new
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 15 }}>
            Every update to the Cloud Intelligence Platform.
          </p>
        </div>

        {/* Timeline */}
        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute',
            left: 19,
            top: 0,
            bottom: 0,
            width: 1,
            background: 'rgba(255,255,255,0.06)',
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {ENTRIES.map((entry, i) => (
              <div key={entry.version} style={{ display: 'flex', gap: 28, paddingBottom: 44 }}>
                {/* Timeline dot */}
                <div style={{ flexShrink: 0, position: 'relative', width: 40 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: `${VERSION_COLORS[i]}20`,
                    border: `2px solid ${VERSION_COLORS[i]}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 900,
                    color: VERSION_COLORS[i],
                    position: 'relative',
                    zIndex: 1,
                  }}>
                    v{entry.version}
                  </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, paddingTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 18, fontWeight: 900, color: 'white' }}>{entry.title}</span>
                    <span style={{ fontSize: 12, color: '#555', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '2px 10px', borderRadius: 20 }}>
                      {entry.date}
                    </span>
                  </div>
                  <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 18px', marginTop: 8 }}>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {entry.changes.map(change => (
                        <li key={change} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <span style={{ color: VERSION_COLORS[i], fontWeight: 900, fontSize: 14, flexShrink: 0, marginTop: 1 }}>+</span>
                          <span style={{ fontSize: 14, color: '#a0a0b0', lineHeight: 1.5 }}>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 8, padding: '16px 20px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12, fontSize: 13, color: '#555', textAlign: 'center' }}>
          More updates on the way. Built continuously for founders, not enterprises.
        </div>

      </div>
    </div>
  )
}
