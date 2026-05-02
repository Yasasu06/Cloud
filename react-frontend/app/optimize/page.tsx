'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import SavingsCalculatorTool from '@/components/tools/optimize/SavingsCalculatorTool'
import WasteReportTool from '@/components/tools/optimize/WasteReportTool'
import ReservedInstancesTool from '@/components/tools/optimize/ReservedInstancesTool'

type TabId = 'savings' | 'waste' | 'reserved' | 'quick-wins'

const TABS: Array<{ id: TabId; label: string; icon: string; color: string; blurb: string }> = [
  { id: 'savings',    label: 'Savings Calculator', icon: '💰', color: '#22c55e', blurb: 'Estimate annual savings from common optimizations' },
  { id: 'waste',      label: 'Waste Report',       icon: '♻️', color: '#f59e0b', blurb: "Find what you're wasting right now" },
  { id: 'reserved',   label: 'Reserved Instances', icon: '📅', color: '#6366f1', blurb: 'Decide which workloads to commit to RIs' },
  { id: 'quick-wins', label: 'Quick Wins',         icon: '⚡', color: '#a855f7', blurb: 'Ranked actions you can do today' },
]

function QuickWinsLinkout() {
  return (
    <div style={{ padding: '40px 28px', borderRadius: 16, background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.2)', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: 'white', margin: '0 0 8px' }}>Quick Wins live inside AI Analyze</h2>
      <p style={{ color: '#a0a0b0', fontSize: 14, lineHeight: 1.6, margin: '0 auto 20px', maxWidth: 440 }}>
        After running an analysis, AI Analyze ranks &quot;do today&quot; actions by $-saved-per-hour with console deep-links. It&apos;s context-aware — quick wins differ by your stack.
      </p>
      <Link href="/analyze" style={{ display: 'inline-block', background: '#a855f7', borderRadius: 10, padding: '11px 24px', color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
        Open AI Analyze →
      </Link>
    </div>
  )
}

export default function OptimizePage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabId>('savings')

  useEffect(() => {
    const t = searchParams.get('tab')
    if (t && TABS.some(tab => tab.id === t)) setActiveTab(t as TabId)
  }, [searchParams])

  function selectTab(id: TabId) {
    setActiveTab(id)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', id)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const active = TABS.find(t => t.id === activeTab) ?? TABS[0]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '100px 24px 80px' }}>

        <div style={{ marginBottom: 32 }}>
          <p style={{ color: '#818cf8', fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>OPTIMIZE</p>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, marginBottom: 12, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Find waste, calculate savings, lock in commitments
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 16, maxWidth: 640 }}>
            Four optimization tools in one place — savings calculator, waste finder, RI optimizer, and quick wins.
          </p>
        </div>

        {/* Tab nav */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 28, overflowX: 'auto' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => selectTab(t.id)}
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

        {/* Active tab description */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, padding: '14px 18px', borderRadius: 12, background: `${active.color}08`, border: `1px solid ${active.color}25` }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${active.color}15`, border: `1px solid ${active.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
            {active.icon}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{active.label}</div>
            <div style={{ fontSize: 12, color: '#a0a0b0' }}>{active.blurb}</div>
          </div>
        </div>

        {/* Embedded tool */}
        <div className="page-enter" key={activeTab}>
          {activeTab === 'savings'    && <SavingsCalculatorTool embedded />}
          {activeTab === 'waste'      && <WasteReportTool embedded />}
          {activeTab === 'reserved'   && <ReservedInstancesTool embedded />}
          {activeTab === 'quick-wins' && <QuickWinsLinkout />}
        </div>
      </div>
    </div>
  )
}
