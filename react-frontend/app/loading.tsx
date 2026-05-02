export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
      color: 'white',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>
          ⚡
        </div>
        <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em' }}>Cloud Intelligence</span>
      </div>

      {/* Spinner */}
      <div style={{ position: 'relative', width: 40, height: 40 }}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg) } }
        `}</style>
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: '3px solid rgba(99,102,241,0.15)',
          borderTopColor: '#6366f1',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>

      <span style={{ color: '#555', fontSize: 13 }}>Loading...</span>
    </div>
  )
}
