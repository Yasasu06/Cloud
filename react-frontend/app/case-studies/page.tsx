import Link from 'next/link'

export default function CaseStudiesPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 20, letterSpacing: 1 }}>
            CASE STUDIES
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, marginBottom: 14, lineHeight: 1.1 }}>
            Real Results From Real Customers
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 17, maxWidth: 540, margin: '0 auto' }}>
            Coming soon — be the first.
          </p>
        </div>

        {/* Placeholder cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 56 }}>
          {[
            { tag: 'SaaS · Series A',     hint: 'Bill went from $14k → $9k/mo' },
            { tag: 'Fintech · Bootstrap', hint: 'Migrated AWS → Hetzner, saved 70%' },
            { tag: 'AI Startup · Seed',   hint: 'LLM costs cut 40% in 30 days' },
          ].map((card, i) => (
            <div key={i} style={{
              padding: '36px 28px', borderRadius: 18,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(139,92,246,0.03))',
              border: '1px solid rgba(255,255,255,0.06)',
              minHeight: 220, position: 'relative', overflow: 'hidden',
            }}>
              <div className="ai-shimmer" style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', letterSpacing: 1.5, marginBottom: 16 }}>
                  {card.tag}
                </p>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 12 }}>
                  Case Study Coming Soon
                </h3>
                <p style={{ color: '#a0a0b0', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
                  We&apos;re documenting our first customers&apos; results.
                </p>
                <p style={{ color: '#666', fontSize: 12, fontStyle: 'italic' }}>
                  Hint: {card.hint}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          padding: '36px 32px', borderRadius: 20,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.06))',
          border: '1px solid rgba(99,102,241,0.25)',
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 10 }}>
            Want to be featured?
          </h2>
          <p style={{ color: '#a0a0b0', fontSize: 14, marginBottom: 24, maxWidth: 460, margin: '0 auto 24px', lineHeight: 1.6 }}>
            We&apos;re looking for early customers willing to share their cloud cost stories. Email{' '}
            <a href="mailto:case-studies@cloudintelligence.ai" style={{ color: '#818cf8', textDecoration: 'none' }}>
              case-studies@cloudintelligence.ai
            </a>{' '}
            or sign up to chat with us about it.
          </p>
          <Link href="/auth?utm=case-study" style={{
            display: 'inline-block', background: '#6366f1', borderRadius: 10,
            padding: '12px 28px', color: 'white', fontWeight: 700, fontSize: 14,
            textDecoration: 'none',
          }}>
            Get Early Access — Be a Case Study →
          </Link>
        </div>
      </div>
    </div>
  )
}
