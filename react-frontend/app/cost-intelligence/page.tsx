'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import ForecastTool from '@/components/tools/cost-intelligence/ForecastTool'
import CostPerUserTool from '@/components/tools/cost-intelligence/CostPerUserTool'
import CreditsTrackerTool from '@/components/tools/cost-intelligence/CreditsTrackerTool'
import AICostTrackerTool from '@/components/tools/cost-intelligence/AICostTrackerTool'

type TabId = 'forecast' | 'per-user' | 'credits' | 'ai-costs'

const TABS: Array<{ id: TabId; label: string; icon: string; color: string; blurb: string }> = [
  { id: 'forecast', label: 'Cost Forecast',   icon: '📊', color: '#6366f1', blurb: 'Project your cloud spend 3, 6, 12 months out' },
  { id: 'per-user', label: 'Cost Per User',   icon: '👤', color: '#22c55e', blurb: 'Benchmark your unit economics against peers' },
  { id: 'credits',  label: 'Credits Tracker', icon: '🎁', color: '#f59e0b', blurb: 'Track AWS Activate, Azure, GCP startup credits' },
  { id: 'ai-costs', label: 'AI Costs',        icon: '🤖', color: '#a855f7', blurb: 'Optimize OpenAI, Anthropic, Gemini spend' },
]

export default function CostIntelligencePage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabId>('forecast')

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
          <p style={{ color: '#818cf8', fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>COST INTELLIGENCE</p>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, marginBottom: 12, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Understand and forecast your cloud costs
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 16, maxWidth: 640 }}>
            Forecast spend, analyze unit economics, track credits, and monitor AI cost — all in one place.
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
          {activeTab === 'forecast' && <ForecastTool embedded />}
          {activeTab === 'per-user' && <CostPerUserTool embedded />}
          {activeTab === 'credits'  && <CreditsTrackerTool embedded />}
          {activeTab === 'ai-costs' && <AICostTrackerTool embedded />}
        </div>
      </div>
    </div>
  )
}
