'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import CloudGlossaryTool from '@/components/tools/learn/CloudGlossaryTool'
import BenchmarkTool from '@/components/tools/learn/BenchmarkTool'
import CloudTwinTool from '@/components/tools/learn/CloudTwinTool'

type TabId = 'glossary' | 'benchmarks' | 'cloud-twin'

const TABS: Array<{ id: TabId; label: string; icon: string; color: string; blurb: string }> = [
  { id: 'glossary',    label: 'Glossary',            icon: '📚', color: '#6366f1', blurb: '50+ cloud terms in plain English' },
  { id: 'benchmarks',  label: 'Industry Benchmarks', icon: '📊', color: '#f59e0b', blurb: 'How your spend compares to similar companies' },
  { id: 'cloud-twin',  label: 'Cloud Twin',          icon: '🎯', color: '#22c55e', blurb: 'Sandbox to test "what-if" scenarios safely' },
]

export default function LearnPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabId>('glossary')

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
          <p style={{ color: '#818cf8', fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>LEARN</p>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, marginBottom: 12, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Build your cloud expertise
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 16, maxWidth: 640 }}>
            Glossary of cloud terms, industry benchmarks, and a digital twin to test scenarios safely.
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
          {activeTab === 'glossary'   && <CloudGlossaryTool embedded />}
          {activeTab === 'benchmarks' && <BenchmarkTool embedded />}
          {activeTab === 'cloud-twin' && <CloudTwinTool embedded />}
        </div>
      </div>
    </div>
  )
}
