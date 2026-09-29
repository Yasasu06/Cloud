'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import WhiteLabelTool from '@/components/tools/consultants/WhiteLabelTool'
import ExpertsTool from '@/components/tools/consultants/ExpertsTool'
import PerformancePricingTool from '@/components/tools/consultants/PerformancePricingTool'
import ReplacesTool from '@/components/tools/consultants/ReplacesTool'

type TabId = 'white-label' | 'experts' | 'pricing' | 'roles'

const TABS: Array<{ id: TabId; label: string; icon: string; color: string; blurb: string }> = [
  { id: 'white-label', label: 'White Label',         icon: '🏷️', color: '#6366f1', blurb: "Branded reports under your firm's identity" },
  { id: 'experts',     label: 'Expert Review',  icon: '👥', color: '#22c55e', blurb: 'Understand when a qualified reviewer is needed' },
  { id: 'pricing',     label: 'Pricing Concept', icon: '💰', color: '#f59e0b', blurb: 'Explore an illustrative performance-fee model' },
  { id: 'roles',       label: 'Tool Directory',      icon: '💼', color: '#a855f7', blurb: 'Find tools for specific cloud decisions' },
]

export default function ForConsultantsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabId>('white-label')

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
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px 80px' }}>

        <div style={{ marginBottom: 32 }}>
          <p style={{ color: '#818cf8', fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>FOR CONSULTANTS</p>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, marginBottom: 12, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Tools for cloud consultants and agencies
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 16, maxWidth: 640 }}>
            Printable report tools, illustrative expert profiles, and an example pricing model.
          </p>
        </div>

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

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, padding: '14px 18px', borderRadius: 12, background: `${active.color}08`, border: `1px solid ${active.color}25` }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${active.color}15`, border: `1px solid ${active.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
            {active.icon}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{active.label}</div>
            <div style={{ fontSize: 12, color: '#a0a0b0' }}>{active.blurb}</div>
          </div>
        </div>

        <div className="page-enter" key={activeTab}>
          {activeTab === 'white-label' && <WhiteLabelTool embedded />}
          {activeTab === 'experts'     && <ExpertsTool embedded />}
          {activeTab === 'pricing'     && <PerformancePricingTool embedded />}
          {activeTab === 'roles'       && <ReplacesTool embedded />}
        </div>
      </div>
    </div>
  )
}
