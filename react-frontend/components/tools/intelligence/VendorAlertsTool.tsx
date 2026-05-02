'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Provider = 'AWS' | 'Azure' | 'GCP'

interface PriceAlert {
  provider: Provider
  service: string
  change: number
  date: string
  impact: string
  action: string
}

const PRICE_ALERTS: PriceAlert[] = [
  { provider: 'AWS',   service: 'EC2 t3.medium',         change: -8,  date: 'March 2026',    impact: 'Companies spending $2k+/month on compute save ~$160/month', action: 'Review your EC2 instance types' },
  { provider: 'GCP',   service: 'Cloud Storage',         change: -12, date: 'February 2026', impact: 'Storage-heavy workloads save 12% automatically',            action: 'No action needed — automatic' },
  { provider: 'Azure', service: 'Azure SQL Database',    change: +5,  date: 'January 2026',  impact: 'Companies on Standard tier pay ~$50/month more',            action: 'Evaluate Azure SQL vs alternatives' },
  { provider: 'AWS',   service: 'Data Transfer (egress)',change: -6,  date: 'April 2026',    impact: 'High-traffic apps save on outbound data costs',             action: 'Review your data transfer patterns' },
  { provider: 'GCP',   service: 'Vertex AI Training',    change: -15, date: 'March 2026',    impact: 'ML teams training models save significantly',               action: 'Re-evaluate ML workload placement' },
  { provider: 'Azure', service: 'Bandwidth (Zone 1)',    change: -4,  date: 'February 2026', impact: 'Minor saving for high-bandwidth applications',              action: 'Monitor next billing cycle' },
]

const PROVIDER_COLOR: Record<Provider, string> = {
  AWS:   '#f59e0b',
  Azure: '#0078D4',
  GCP:   '#22c55e',
}

const PROVIDER_BG: Record<Provider, string> = {
  AWS:   'rgba(245,158,11,0.1)',
  Azure: 'rgba(0,120,212,0.1)',
  GCP:   'rgba(34,197,94,0.1)',
}

const FILTERS: ('All' | Provider)[] = ['All', 'AWS', 'Azure', 'GCP']

function providerRgb(f: string): string {
  return { AWS: '245,158,11', Azure: '0,120,212', GCP: '34,197,94', All: '99,102,241' }[f] ?? '99,102,241'
}

function AlertCard({ alert }: { alert: PriceAlert }) {
  const decrease = alert.change < 0
  const changeColor = decrease ? '#22c55e' : '#ef4444'
  const changeBg    = decrease ? 'rgba(34,197,94,0.08)'  : 'rgba(239,68,68,0.08)'
  const changeBorder= decrease ? 'rgba(34,197,94,0.25)'  : 'rgba(239,68,68,0.25)'

  return (
    <div style={{
      background: '#111118', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16, padding: '22px',
      display: 'flex', flexDirection: 'column', gap: 14,
      transition: 'border-color 0.15s',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
            padding: '4px 10px', borderRadius: 6,
            color: PROVIDER_COLOR[alert.provider],
            background: PROVIDER_BG[alert.provider],
          }}>
            {alert.provider}
          </span>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{alert.service}</span>
        </div>
        <div style={{
          background: changeBg, border: `1px solid ${changeBorder}`,
          borderRadius: 10, padding: '6px 14px',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: changeColor, lineHeight: 1 }}>
            {decrease ? '▼' : '▲'}
          </span>
          <span style={{ fontSize: 20, fontWeight: 900, color: changeColor, lineHeight: 1 }}>
            {Math.abs(alert.change)}%
          </span>
          <span style={{ fontSize: 12, color: changeColor, fontWeight: 600, marginLeft: 2 }}>
            {decrease ? 'decrease' : 'increase'}
          </span>
        </div>
      </div>

      <p style={{ fontSize: 11, color: '#444', fontWeight: 700, letterSpacing: 1, margin: 0 }}>
        {alert.date.toUpperCase()}
      </p>

      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderLeft: `3px solid ${PROVIDER_COLOR[alert.provider]}`,
        borderRadius: '0 8px 8px 0', padding: '10px 14px',
      }}>
        <p style={{ fontSize: 11, color: '#444', fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>BUSINESS IMPACT</p>
        <p style={{ fontSize: 13, color: '#a0a0b0', lineHeight: 1.6, margin: 0 }}>{alert.impact}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
          padding: '3px 9px', borderRadius: 6,
          color: '#818cf8', background: 'rgba(99,102,241,0.1)',
          whiteSpace: 'nowrap', marginTop: 1,
        }}>
          ACTION
        </span>
        <p style={{ fontSize: 13, color: '#e0e0e0', lineHeight: 1.5, margin: 0 }}>{alert.action}</p>
      </div>
    </div>
  )
}

interface Props { embedded?: boolean }

export default function VendorAlertsTool({ embedded = false }: Props) {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState<'All' | Provider>('All')

  const filtered = activeFilter === 'All'
    ? PRICE_ALERTS
    : PRICE_ALERTS.filter(a => a.provider === activeFilter)

  const decreaseCount = PRICE_ALERTS.filter(a => a.change < 0).length
  const increaseCount = PRICE_ALERTS.filter(a => a.change > 0).length

  const inner = (
    <>
      {!embedded && (
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>
            PRICE INTELLIGENCE
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, marginBottom: 12 }}>
            Cloud pricing changes you need to know
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
            We track AWS, Azure, and GCP pricing changes so you don&apos;t have to.
          </p>
        </div>
      )}

      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.05))',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 16, padding: '18px 24px', marginBottom: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 22 }}>📡</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 2 }}>
              Price Intelligence — Last updated May 2026
            </p>
            <p style={{ fontSize: 12, color: '#555' }}>
              Tracking AWS, Azure, and GCP pricing changes across compute, storage, networking, and AI
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '8px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#22c55e', lineHeight: 1 }}>{decreaseCount}</p>
            <p style={{ fontSize: 10, color: '#22c55e', fontWeight: 700, letterSpacing: 0.5 }}>DECREASES</p>
          </div>
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '8px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#ef4444', lineHeight: 1 }}>{increaseCount}</p>
            <p style={{ fontSize: 10, color: '#ef4444', fontWeight: 700, letterSpacing: 0.5 }}>INCREASES</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {FILTERS.map(f => {
          const active = activeFilter === f
          const color = f === 'All' ? '#6366f1' : PROVIDER_COLOR[f as Provider]
          const count = f === 'All' ? PRICE_ALERTS.length : PRICE_ALERTS.filter(a => a.provider === f).length
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '7px 16px', borderRadius: 10,
                border: active ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.08)',
                background: active ? `rgba(${providerRgb(f)},0.12)` : 'transparent',
                color: active ? color : '#555',
                fontWeight: active ? 700 : 500, fontSize: 13, cursor: 'pointer',
                transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {f}
              <span style={{
                fontSize: 10, fontWeight: 700,
                background: active ? `rgba(${providerRgb(f)},0.2)` : 'rgba(255,255,255,0.06)',
                color: active ? color : '#444',
                padding: '1px 6px', borderRadius: 5,
              }}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: 14, marginBottom: 40,
      }}>
        {filtered.map((alert, i) => (
          <AlertCard key={`${alert.provider}-${alert.service}-${i}`} alert={alert} />
        ))}
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b, #1a1a2e)',
        borderRadius: 16, padding: '28px',
        border: '1px solid rgba(99,102,241,0.3)', textAlign: 'center',
      }}>
        <p style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>NEXT STEP</p>
        <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
          Want alerts when prices change for <em style={{ color: '#818cf8', fontStyle: 'normal' }}>your</em> services?
        </h3>
        <p style={{ color: '#a0a0b0', fontSize: 14, maxWidth: 420, margin: '0 auto 20px' }}>
          Tell us what you&apos;re running and we&apos;ll flag every price change that affects your bill — before it hits.
        </p>
        <button
          onClick={() => router.push('/analyze')}
          style={{
            background: '#6366f1', border: 'none', borderRadius: 12,
            padding: '14px 32px', color: 'white', fontWeight: 700, fontSize: 15,
            cursor: 'pointer', transition: 'background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#4f46e5' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#6366f1' }}
        >
          Analyze My Stack for Price Alerts →
        </button>
      </div>

      <p style={{ color: '#333', fontSize: 11, textAlign: 'center', marginTop: 28, lineHeight: 1.6 }}>
        Price changes sourced from official AWS, Azure, and GCP pricing pages and announcements.
        Impact estimates are illustrative averages. Verify changes directly with your provider.
      </p>
    </>
  )

  if (embedded) return <div>{inner}</div>
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px 80px' }}>{inner}</div>
    </div>
  )
}
