import Link from 'next/link'

export default function PricingPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '120px 24px 80px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <p style={{ color: '#818cf8', fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>DEMO ACCESS</p>
        <h1 style={{ fontSize: 42, margin: '18px 0' }}>Explore the cloud cost tools</h1>
        <p style={{ color: '#a0a0b0', lineHeight: 1.7 }}>
          The public demo offers a compatible CSV bill analyzer, service-level cost visualization,
          selected compute price comparisons, deterministic calculators, and AI-generated suggestions
          when the AI service is configured. Savings suggestions are estimates to verify against your resources.
        </p>
        <p style={{ color: '#a0a0b0', lineHeight: 1.7 }}>
          Paid subscriptions and performance-based pricing are not offered through this demo.
          PDF invoice parsing and direct AWS account connection are not enabled.
        </p>
        <Link href="/demo" style={{ color: '#818cf8', fontWeight: 700 }}>Open demo tools →</Link>
      </div>
    </main>
  )
}
