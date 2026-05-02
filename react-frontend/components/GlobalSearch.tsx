'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
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

interface SearchItem { title: string; desc: string; url: string; emoji: string }
interface Props { onClose: () => void }

function getRecentlyViewed(): SearchItem[] {
  try {
    const raw = localStorage.getItem('recently_viewed')
    return raw ? (JSON.parse(raw) as SearchItem[]) : []
  } catch {
    return []
  }
}

export default function GlobalSearch({ onClose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(SEARCH_ITEMS)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentlyViewed, setRecentlyViewed] = useState<SearchItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const router = useRouter()
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed())
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        // already open — do nothing (parent controls open)
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        setQuery('')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(-1)
    itemRefs.current = []
  }, [results])

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0) {
      itemRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

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

  const handleSelect = useCallback((url: string, title: string) => {
    try {
      supabase.from('search_queries').insert({
        query: query.trim(), result_found: true, clicked_result: title, user_id: null,
      })
    } catch (_e) {}
    onClose()
    setQuery('')
    router.push(url)
  }, [query, onClose, router])

  // Total navigable rows = results + optional "Ask AI" row
  const aiRowIndex = results.length // index of the "Ask AI" row when query exists
  const totalRows = results.length + (query ? 1 : 0)

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, totalRows - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex === -1) {
        // Submit typed query
        if (query.trim()) handleSelect(`/analyze?q=${encodeURIComponent(query)}`, 'AI Search')
      } else if (selectedIndex < results.length) {
        const item = results[selectedIndex]
        handleSelect(item.url, item.title)
      } else if (selectedIndex === aiRowIndex && query) {
        handleSelect(`/analyze?q=${encodeURIComponent(query)}`, 'AI Search')
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  function rowBg(i: number) {
    return selectedIndex === i ? 'rgba(99,102,241,0.18)' : 'transparent'
  }

  const showRecent = !query.trim() && recentlyViewed.length > 0

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)', zIndex: 9999,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '15vh',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0d0d16', border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 20, width: '100%', maxWidth: 600, margin: '0 16px',
          overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 18 }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tools, ask anything..."
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 16, fontFamily: 'inherit' }}
          />
          <button
            onClick={() => { onClose(); setQuery('') }}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
          >
            <span style={{ fontSize: 14 }}>✕</span>
            <span>ESC</span>
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ maxHeight: 400, overflowY: 'auto' }}>
          {/* Recently viewed section */}
          {showRecent && (
            <>
              <div style={{ padding: '8px 20px 4px', fontSize: 11, color: '#555', letterSpacing: 1 }}>RECENTLY VIEWED</div>
              {recentlyViewed.map((item, i) => (
                <div
                  key={`recent-${i}`}
                  ref={el => { itemRefs.current[i] = el }}
                  onClick={() => handleSelect(item.url, item.title)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', cursor: 'pointer', background: rowBg(i), transition: 'background 0.1s' }}
                  onMouseEnter={() => setSelectedIndex(i)}
                  onMouseLeave={() => setSelectedIndex(-1)}
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{item.emoji}</span>
                  <div>
                    <div style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>{item.title}</div>
                    <div style={{ color: '#555', fontSize: 11 }}>{item.desc}</div>
                  </div>
                  <span style={{ marginLeft: 'auto', color: '#444', fontSize: 11 }}>recent</span>
                </div>
              ))}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '4px 0' }} />
            </>
          )}

          {results.length > 0 ? (
            <>
              <div style={{ padding: '8px 20px 4px', fontSize: 11, color: '#555', letterSpacing: 1 }}>
                {query ? 'RESULTS' : 'ALL TOOLS'}
              </div>
              {results.map((item, i) => (
                <div
                  key={i}
                  ref={el => { itemRefs.current[i] = el }}
                  onClick={() => handleSelect(item.url, item.title)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', cursor: 'pointer', background: rowBg(i), transition: 'background 0.1s' }}
                  onMouseEnter={() => setSelectedIndex(i)}
                  onMouseLeave={() => setSelectedIndex(-1)}
                >
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{item.emoji}</span>
                  <div>
                    <div style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>{item.title}</div>
                    <div style={{ color: '#666', fontSize: 12 }}>{item.desc}</div>
                  </div>
                  <span style={{ marginLeft: 'auto', color: selectedIndex === i ? '#818cf8' : '#444', fontSize: 12 }}>↵</span>
                </div>
              ))}
              {query && (
                <div
                  ref={el => { itemRefs.current[aiRowIndex] = el }}
                  onClick={() => handleSelect(`/analyze?q=${encodeURIComponent(query)}`, 'AI Search')}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', cursor: 'pointer', borderTop: '1px solid rgba(255,255,255,0.06)', color: '#6366f1', background: rowBg(aiRowIndex), transition: 'background 0.1s' }}
                  onMouseEnter={() => setSelectedIndex(aiRowIndex)}
                  onMouseLeave={() => setSelectedIndex(-1)}
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
                style={{ background: '#6366f1', color: 'white', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', display: 'inline-block', fontSize: 14 }}
              >
                Ask AI instead →
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '8px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 16, fontSize: 11, color: '#444' }}>
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>ESC close</span>
        </div>
      </div>
    </div>
  )
}
