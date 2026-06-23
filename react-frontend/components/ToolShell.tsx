'use client'

import Link from 'next/link'

// ─── ToolShell ───────────────────────────────────────────────────────────────
//
// Shared premium frame for the three focused tools (/bill-upload, /compliance,
// /pricing-explorer). It:
//   • hides the global app chrome (navbar, ticker, breadcrumbs, back-to-dashboard,
//     global footer) for this page only — same technique as /demo, without
//     touching layout.tsx.
//   • paints the flowing Stripe-style mesh-gradient background (no blobs/particles).
//   • renders a sticky top bar with a "← Back to Tools" link to /demo so each
//     tool is self-contained: land, do one thing, get the answer, go back.
//
// Pages render their own content as children; ToolShell owns the full-bleed
// background and the page chrome, so child pages should NOT set their own
// opaque full-page background.

const HIDE_GLOBAL_CHROME = `
  nav,
  .ticker-wrap,
  body footer { display: none !important; }
  div:has(> a[href="/dashboard"]) { display: none !important; }
`

export default function ToolShell({
  label,
  children,
}: {
  label: string            // short tool name shown in the top bar (e.g. "Bill Analyzer")
  children: React.ReactNode
}) {
  return (
    <div style={{ minHeight: '100vh', position: 'relative', color: 'var(--text)', background: 'var(--bg)' }}>
      <style dangerouslySetInnerHTML={{ __html: HIDE_GLOBAL_CHROME }} />

      {/* Sticky top bar — Back to Tools + branding */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, flexWrap: 'wrap',
        padding: '14px clamp(16px, 4vw, 32px)',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(250,250,248,0.85)',
        backdropFilter: 'saturate(180%) blur(8px)', WebkitBackdropFilter: 'saturate(180%) blur(8px)',
      }}>
        <Link href="/demo" className="back-to-tools">← Back to Tools</Link>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
          <span style={{ color: 'var(--text)', fontWeight: 700 }}>☁️ Cloud Intelligence</span>
          <span style={{ color: '#C9C9C2' }}>·</span>
          <span>{label}</span>
        </span>
      </header>

      {/* Page content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}
