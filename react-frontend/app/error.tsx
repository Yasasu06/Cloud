'use client'

import Link from 'next/link'

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ maxWidth: 480, padding: '24px', textAlign: 'center', width: '100%' }}>

        <div style={{ fontSize: 52, marginBottom: 20 }}>⚠️</div>

        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Something went wrong</h1>
        <p style={{ color: '#a0a0b0', fontSize: 15, marginBottom: 6 }}>
          Our AI hit an unexpected error.
        </p>
        <p style={{ color: '#555', fontSize: 13, marginBottom: 32 }}>
          This is usually temporary — try again in a moment.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
          <button
            onClick={reset}
            style={{
              background: '#6366f1', border: 'none', borderRadius: 12,
              padding: '12px 28px', color: 'white', fontWeight: 700,
              fontSize: 15, cursor: 'pointer',
            }}
          >
            Try again
          </button>
          <Link href="/" style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 12, padding: '12px 28px',
            color: '#a0a0b0', fontWeight: 600,
            fontSize: 15, textDecoration: 'none',
            display: 'inline-block',
          }}>
            Go home
          </Link>
        </div>

        <p style={{ color: '#444', fontSize: 12 }}>
          Need help?{' '}
          <a href="mailto:support@cloudintelligence.app" style={{ color: '#6366f1', textDecoration: 'none' }}>
            support@cloudintelligence.app
          </a>
        </p>
      </div>
    </div>
  )
}
