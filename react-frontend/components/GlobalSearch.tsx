'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const SEARCH_ITEMS = [
  { title: 'AI Analyze', desc: 'Explain your cloud situation', url: '/analyze', emoji: '🔍' },
  { title: 'Bill Upload', desc: 'Analyze your actual bill', url: '/bill-upload', emoji: '📄' },
  { title: 'Architecture', desc: 'Visualize your stack', url: '/architecture', emoji: '🏗️' },
  { title: 'Savings Calculator', desc: 'Find your savings', url: '/savings', emoji: '💰' },
  { title: 'Cost Forecast', desc: 'Predict future spending', url: '/forecast', emoji: '📈' },
  { title: 'Multi-Cloud View', desc: 'Consolidate all providers', url: '/multi-cloud', emoji: '☁️' },
  { title: 'Infrastructure Estimator', desc: 'Estimate before you build', url: '/terraform-estimator', emoji: '🏛️' },
  { title: 'Egress Calculator', desc: 'Cost to switch providers', url: '/migration', emoji: '🔄' },
  { title: 'Cloud Advisor', desc: 'Get a recommendation', url: '/advisor', emoji: '🎯' },
  { title: 'Report Card', desc: 'Grade your setup', url: '/report-card', emoji: '📋' },
  { title: 'Cloud Score', desc: 'Maturity assessment', url: '/cloud-score', emoji: '🏆' },
  { title: 'AI Strategy Session', desc: 'Full strategy conversation', url: '/ai-advisor', emoji: '💼' },
  { title: 'ROI Calculator', desc: 'Calculate your return', url: '/roi-calculator', emoji: '📊' },
  { title: 'Compliance Checker', desc: 'Check requirements', url: '/compliance', emoji: '✅' },
  { title: 'Reserved Instances', desc: 'Optimize commitments', url: '/reserved-instances', emoji: '💎' },
  { title: 'Price Alerts', desc: 'Track price changes', url: '/vendor-alerts', emoji: '🔔' },
  { title: 'Cloud Updates', desc: 'Latest provider news', url: '/provider-news', emoji: '📰' },
  { title: 'Benchmarks', desc: 'Compare to industry', url: '/benchmark', emoji: '📊' },
  { title: 'Glossary', desc: 'Cloud terms explained', url: '/cloud-glossary', emoji: '📚' },
  { title: 'Pricing', desc: 'View our plans', url: '/pricing', emoji: '💳' },
  { title: 'Dashboard', desc: 'Your saved analyses', url: '/dashboard', emoji: '🗂️' },
]

interface Props {
  onClose: () => void
}

export default function GlobalSearch({ onClose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(SEARCH_ITEMS)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults(SEARCH_ITEMS)
      return
    }
    const filtered = SEARCH_ITEMS.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.desc.toLowerCase().includes(query.toLowerCase())
    )
    setResults(filtered)

    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        await supabase.from('search_queries').insert({
          query: query.trim(),
          result_found: filtered.length > 0,
          user_id: session?.user?.id ?? null,
        })
      } catch (_e) {}
    }, 800)
  }, [query])

  function handleSelect(url: string, title: string) {
    try {
      supabase.from('search_queries').insert({
        query: query.trim(),
        result_found: true,
        clicked_result: title,
        user_id: null,
      })
    } catch (_e) {}
    onClose()
    setQuery('')
    router.push(url)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0d0d16',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 20,
          width: '100%',
          maxWidth: 600,
          margin: '0 16px',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span style={{ fontSize: 18 }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tools, ask anything..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'white',
              fontSize: 16,
              fontFamily: 'inherit',
            }}
          />
          <kbd style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 6,
            padding: '2px 8px',
            fontSize: 12,
            color: '#666',
          }}>ESC</kbd>
        </div>

        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {results.length > 0 ? (
            <>
              <div style={{ padding: '8px 20px 4px', fontSize: 11, color: '#555', letterSpacing: 1 }}>
                {query ? 'RESULTS' : 'ALL TOOLS'}
              </div>
              {results.map((item, i) => (
                <div
                  key={i}
                  onClick={() => handleSelect(item.url, item.title)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 20px',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(99,102,241,0.1)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                >
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{item.emoji}</span>
                  <div>
                    <div style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>{item.title}</div>
                    <div style={{ color: '#666', fontSize: 12 }}>{item.desc}</div>
                  </div>
                  <span style={{ marginLeft: 'auto', color: '#444', fontSize: 12 }}>↵</span>
                </div>
              ))}
              {query && (
                <div
                  onClick={() => handleSelect(`/analyze?q=${encodeURIComponent(query)}`, 'AI Search')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 20px',
                    cursor: 'pointer',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    color: '#6366f1',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(99,102,241,0.08)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                >
                  <span>🤖</span>
                  <span style={{ fontSize: 14 }}>Ask AI about &ldquo;{query}&rdquo;</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12 }}>↵</span>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🤔</div>
              <div style={{ color: '#666', marginBottom: 16 }}>No tools found for &ldquo;{query}&rdquo;</div>
              <div
                onClick={() => handleSelect(`/analyze?q=${encodeURIComponent(query)}`, 'AI Search')}
                style={{
                  background: '#6366f1',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  display: 'inline-block',
                  fontSize: 14,
                }}
              >
                Ask AI instead →
              </div>
            </div>
          )}
        </div>

        <div style={{
          padding: '8px 20px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          gap: 16,
          fontSize: 11,
          color: '#444',
        }}>
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>ESC close</span>
        </div>
      </div>
    </div>
  )
}
