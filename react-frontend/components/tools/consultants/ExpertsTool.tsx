import Link from 'next/link'

interface Props { embedded?: boolean }

export default function ExpertsTool({ embedded = false }: Props) {
  const content = (
    <div style={{ maxWidth: 720, margin: '0 auto', color: 'white' }}>
      <p style={{ color: '#818cf8', fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>EXPERT SUPPORT CONCEPT</p>
      <h2 style={{ fontSize: 32, margin: '16px 0' }}>Human review still matters</h2>
      <p style={{ color: '#a0a0b0', lineHeight: 1.7 }}>
        This demo does not operate an expert marketplace or offer bookings. Before acting on an estimated
        saving, have a qualified professional check the relevant resources, utilization, risk, and current pricing.
      </p>
      <Link href="/analyze" style={{ color: '#818cf8', fontWeight: 700 }}>Explore advisory suggestions →</Link>
    </div>
  )
  return embedded ? content : <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '100px 24px' }}>{content}</div>
}
