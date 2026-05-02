'use client'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 560, padding: '24px', textAlign: 'center', width: '100%' }}>

        {/* 404 gradient number */}
        <div style={{
          fontSize: 'clamp(80px, 20vw, 140px)',
          fontWeight: 900,
          lineHeight: 1,
          background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 16,
        }}>
          404
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>Page not found</h1>
        <p style={{ color: '#a0a0b0', fontSize: 15, marginBottom: 32 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Cmd+K hint */}
        <div style={{
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 12,
          padding: '14px 20px',
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          color: '#818cf8',
          fontSize: 14,
        }}>
          <span>🔍</span>
          <span>Try searching with</span>
          <kbd style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>⌘K</kbd>
        </div>

        {/* Suggested pages */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 1, marginBottom: 4, textAlign: 'left' }}>SUGGESTED PAGES</div>
          {[
            { href: '/analyze',  emoji: '🔍', label: 'AI Analyze',    desc: 'Explain your cloud situation' },
            { href: '/advisor',  emoji: '🎯', label: 'Cloud Advisor',  desc: 'Get a personalized recommendation' },
            { href: '/pricing',  emoji: '💳', label: 'Pricing',        desc: 'View plans and features' },
          ].map(page => (
            <Link key={page.href} href={page.href} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, padding: '14px 18px', textDecoration: 'none',
              transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
            >
              <span style={{ fontSize: 20 }}>{page.emoji}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{page.label}</div>
                <div style={{ fontSize: 12, color: '#555' }}>{page.desc}</div>
              </div>
              <span style={{ marginLeft: 'auto', color: '#444', fontSize: 14 }}>→</span>
            </Link>
          ))}
        </div>

        <Link href="/" style={{
          display: 'inline-block',
          background: '#6366f1', color: 'white',
          padding: '12px 28px', borderRadius: 12,
          textDecoration: 'none', fontWeight: 700, fontSize: 15,
        }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
