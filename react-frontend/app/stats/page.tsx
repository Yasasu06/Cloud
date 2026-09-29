import Link from 'next/link'

export default function StatsPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '120px 24px 80px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <p style={{ color: '#818cf8', fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>PLATFORM STATISTICS</p>
        <h1 style={{ fontSize: 42, margin: '18px 0' }}>Verified results are not published yet</h1>
        <p style={{ color: '#a0a0b0', lineHeight: 1.7 }}>
          This demo does not publish customer counts, total spend analyzed, or realized savings.
          Calculators show estimated opportunities; a compatible uploaded CSV produces a service-level cost breakdown.
        </p>
        <Link href="/bill-upload" style={{ color: '#818cf8', fontWeight: 700 }}>Try the bill analyzer →</Link>
      </div>
    </main>
  )
}
