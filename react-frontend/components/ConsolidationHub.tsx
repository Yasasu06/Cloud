'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export interface HubTab {
  id: string
  label: string
  icon: string
  href: string  // Where to send user to use the actual tool
  blurb: string
  features: string[]
  color: string
}

interface Props {
  badge: string
  title: string
  subtitle: string
  tabs: HubTab[]
}

export default function ConsolidationHub({ badge, title, subtitle, tabs }: Props) {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(tabs[0].id)

  useEffect(() => {
    const t = searchParams.get('tab')
    if (t && tabs.some(tab => tab.id === t)) setActiveTab(t)
  }, [searchParams, tabs])

  const active = tabs.find(t => t.id === activeTab) ?? tabs[0]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ color: '#818cf8', fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>{badge}</p>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, marginBottom: 12, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            {title}
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 16, maxWidth: 640 }}>{subtitle}</p>
        </div>

        {/* Tab nav */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 28, overflowX: 'auto' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '12px 18px', background: 'transparent', border: 'none',
                borderBottom: `2px solid ${activeTab === t.id ? t.color : 'transparent'}`,
                color: activeTab === t.id ? 'white' : '#666',
                fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Active tab content */}
        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: `${active.color}15`, border: `1px solid ${active.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
              {active.icon}
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', margin: 0 }}>{active.label}</h2>
              <p style={{ color: '#a0a0b0', fontSize: 14, margin: '4px 0 0', lineHeight: 1.5 }}>{active.blurb}</p>
            </div>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
            {active.features.map(f => (
              <li key={f} style={{ fontSize: 13, color: '#c0c0d0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: active.color }}>✓</span> {f}
              </li>
            ))}
          </ul>

          <Link href={active.href} style={{
            display: 'inline-block', background: active.color, borderRadius: 10,
            padding: '11px 24px', color: 'white', fontWeight: 700, fontSize: 14,
            textDecoration: 'none', marginTop: 8,
          }}>
            Open {active.label} →
          </Link>
        </div>

        {/* Tab summary cards (showing all tabs at a glance) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          {tabs.filter(t => t.id !== activeTab).map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '14px 16px', borderRadius: 12, textAlign: 'left',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                cursor: 'pointer', color: 'white', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${t.color}40` }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)' }}
            >
              <div style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 3 }}>{t.label}</div>
              <div style={{ fontSize: 11, color: '#888', lineHeight: 1.4 }}>{t.blurb}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
