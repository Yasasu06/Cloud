'use client'

import Link from 'next/link'

export interface NextAction {
  icon: string
  title: string
  desc?: string
  href?: string
  onClick?: () => void
}

export default function NextActionCards({ actions, label = 'WHAT TO DO NEXT' }: { actions: NextAction[]; label?: string }) {
  if (!actions?.length) return null
  return (
    <div style={{ marginTop: 32 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#666', letterSpacing: 1.5, marginBottom: 12 }}>{label}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {actions.map((a, i) => {
          const inner = (
            <div className="next-action-card" style={{
              padding: '16px 18px', borderRadius: 12,
              background: 'rgba(99,102,241,0.05)',
              border: '1px solid rgba(99,102,241,0.18)',
              transition: 'all 0.2s ease', cursor: 'pointer',
              height: '100%', boxSizing: 'border-box',
            }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{a.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: a.desc ? 3 : 0, lineHeight: 1.3 }}>
                {a.title} <span style={{ color: '#818cf8', marginLeft: 4 }}>→</span>
              </div>
              {a.desc && <div style={{ fontSize: 11, color: '#a0a0b0', lineHeight: 1.4 }}>{a.desc}</div>}
            </div>
          )
          if (a.onClick) return (
            <button key={i} onClick={a.onClick} style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>{inner}</button>
          )
          return (
            <Link key={i} href={a.href ?? '#'} style={{ textDecoration: 'none' }}>{inner}</Link>
          )
        })}
      </div>
      <style>{`
        .next-action-card:hover {
          border-color: rgba(99,102,241,0.4) !important;
          background: rgba(99,102,241,0.08) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(99,102,241,0.12);
        }
      `}</style>
    </div>
  )
}
