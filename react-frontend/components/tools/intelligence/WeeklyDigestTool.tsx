'use client'

interface Props { embedded?: boolean }

export default function WeeklyDigestTool({ embedded = false }: Props) {
  const content = (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <p style={{ color: '#818cf8', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>DIGEST PREVIEW</p>
      <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', marginBottom: 16 }}>Recent analysis recap</h1>
      <p style={{ color: '#a0a0b0', lineHeight: 1.7 }}>
        Account holders can opt in to email recaps of their saved analyses from dashboard settings.
        Delivery requires an administrator to trigger the digest; no automatic weekly schedule is active.
      </p>
      <div className="glass-card" style={{ marginTop: 28, padding: 28 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>What a recap contains</h2>
        <ul style={{ color: '#a0a0b0', lineHeight: 1.9, paddingLeft: 20 }}>
          <li>Up to three of your recently saved analyses</li>
          <li>A link back to your dashboard</li>
          <li>A link to pricing comparisons for your own review</li>
        </ul>
        <p style={{ color: '#a0a0b0', fontSize: 13, marginBottom: 0 }}>
          This is a feature preview. It does not show a live email or promise a delivery date.
        </p>
      </div>
    </div>
  )

  if (embedded) return content
  return <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '100px 24px 80px' }}>{content}</div>
}
