export default function DisclaimerBanner() {
  return (
    <div style={{
      marginBottom: 16, padding: '10px 14px',
      background: 'rgba(245,158,11,0.06)',
      border: '1px solid rgba(245,158,11,0.15)',
      borderRadius: 8, display: 'flex', gap: 10,
      alignItems: 'flex-start',
    }}>
      <span style={{ fontSize: 14 }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <p style={{ color: '#f59e0b', fontSize: 12, fontWeight: 600, margin: 0 }}>
          Advisory information — verify before acting
        </p>
        <p style={{ color: '#888', fontSize: 11, margin: '2px 0 0' }}>
          Always test in non-production first. Verify pricing with provider. For
          compliance-critical decisions, consult a specialist.
        </p>
      </div>
    </div>
  )
}
