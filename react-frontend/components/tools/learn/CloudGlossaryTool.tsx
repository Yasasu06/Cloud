'use client'

import { useState, useMemo } from 'react'
import { CLOUD_TERMS, TermCategory } from '@/lib/cloudTerms'

const CATEGORIES: ('All' | TermCategory)[] = ['All', 'AWS', 'Azure', 'GCP', 'Security', 'Cost', 'Architecture']

const CATEGORY_COLOR: Record<TermCategory, string> = {
  AWS:          '#f59e0b',
  Azure:        '#0078D4',
  GCP:          '#22c55e',
  Security:     '#ef4444',
  Cost:         '#a855f7',
  Architecture: '#6366f1',
}

const CATEGORY_BG: Record<TermCategory, string> = {
  AWS:          'rgba(245,158,11,0.1)',
  Azure:        'rgba(0,120,212,0.1)',
  GCP:          'rgba(34,197,94,0.1)',
  Security:     'rgba(239,68,68,0.1)',
  Cost:         'rgba(168,85,247,0.1)',
  Architecture: 'rgba(99,102,241,0.1)',
}

function categoryRgb(cat: TermCategory): string {
  return {
    AWS: '245,158,11', Azure: '0,120,212', GCP: '34,197,94',
    Security: '239,68,68', Cost: '168,85,247', Architecture: '99,102,241',
  }[cat]
}

function CategoryBadge({ category }: { category: TermCategory }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
      padding: '3px 9px', borderRadius: 6,
      color: CATEGORY_COLOR[category],
      background: CATEGORY_BG[category],
      border: `1px solid rgba(${categoryRgb(category)},0.25)`,
    }}>
      {category.toUpperCase()}
    </span>
  )
}

function TermCard({ term: t }: { term: typeof CLOUD_TERMS[number] }) {
  const [expanded, setExpanded] = useState(false)
  const relatedMatches = useMemo(
    () => t.related.filter(r => CLOUD_TERMS.some(ct => ct.term === r)),
    [t.related]
  )

  return (
    <div style={{
      background: '#111118',
      border: expanded ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16, padding: '20px',
      display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'border-color 0.15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>{t.term}</span>
            <CategoryBadge category={t.category} />
          </div>
          <p style={{ fontSize: 13, color: '#a0a0b0', lineHeight: 1.65, margin: 0 }}>{t.definition}</p>
        </div>
      </div>

      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          alignSelf: 'flex-start', background: 'transparent', border: 'none',
          color: expanded ? '#818cf8' : '#555',
          fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0,
          display: 'flex', alignItems: 'center', gap: 4, transition: 'color 0.15s',
        }}
      >
        {expanded ? '▲ Less' : '▼ Learn more'}
      </button>

      {expanded && (
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14,
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#444', letterSpacing: 1, marginBottom: 6 }}>EXAMPLE USE CASE</p>
            <p style={{
              fontSize: 13, color: '#888', lineHeight: 1.65,
              background: 'rgba(255,255,255,0.03)',
              borderLeft: '3px solid rgba(99,102,241,0.4)',
              padding: '10px 14px', borderRadius: '0 8px 8px 0', margin: 0,
            }}>
              {t.example}
            </p>
          </div>

          {relatedMatches.length > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#444', letterSpacing: 1, marginBottom: 8 }}>RELATED TERMS</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {t.related.map(r => {
                  const exists = CLOUD_TERMS.some(ct => ct.term === r)
                  return (
                    <span key={r} style={{
                      fontSize: 12, fontWeight: 600,
                      padding: '4px 12px', borderRadius: 8,
                      background: exists ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.04)',
                      border: exists ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(255,255,255,0.06)',
                      color: exists ? '#818cf8' : '#444',
                    }}>
                      {r}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface Props { embedded?: boolean }

export default function CloudGlossaryTool({ embedded = false }: Props) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<'All' | TermCategory>('All')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CLOUD_TERMS.filter(t => {
      const matchesCat = activeCategory === 'All' || t.category === activeCategory
      const matchesQuery = !q ||
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      return matchesCat && matchesQuery
    }).sort((a, b) => a.term.localeCompare(b.term))
  }, [query, activeCategory])

  const inner = (
    <>
      {!embedded && (
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#818cf8', fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>
            CLOUD GLOSSARY
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, marginBottom: 12 }}>
            Cloud jargon, explained plainly
          </h1>
          <p style={{ color: '#a0a0b0', fontSize: 16, maxWidth: 460, margin: '0 auto' }}>
            {CLOUD_TERMS.length} terms covering AWS, Azure, GCP, security, cost optimization, and architecture.
          </p>
        </div>
      )}

      <div style={{ position: 'relative', marginBottom: 20 }}>
        <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#444', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
        <input
          type="text"
          placeholder="Search terms, definitions, categories…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            width: '100%', background: '#1a1a2e',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
            padding: '14px 16px 14px 44px', color: 'white', fontSize: 15, outline: 'none',
            boxSizing: 'border-box', transition: 'border-color 0.15s',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', fontSize: 18 }}
          >
            ×
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
        {CATEGORIES.map(cat => {
          const active = activeCategory === cat
          const color = cat === 'All' ? '#6366f1' : CATEGORY_COLOR[cat as TermCategory]
          const count = cat === 'All' ? CLOUD_TERMS.length : CLOUD_TERMS.filter(t => t.category === cat).length
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '7px 14px', borderRadius: 10,
                border: active ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.08)',
                background: active ? `rgba(${active && cat !== 'All' ? categoryRgb(cat as TermCategory) : '99,102,241'},0.12)` : 'transparent',
                color: active ? color : '#555',
                fontWeight: active ? 700 : 500, fontSize: 13, cursor: 'pointer',
                transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {cat}
              <span style={{
                fontSize: 10, fontWeight: 700,
                background: active ? `rgba(${active && cat !== 'All' ? categoryRgb(cat as TermCategory) : '99,102,241'},0.2)` : 'rgba(255,255,255,0.06)',
                color: active ? color : '#444',
                padding: '1px 6px', borderRadius: 5,
              }}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 13, color: '#444' }}>
          {filtered.length === CLOUD_TERMS.length
            ? `All ${CLOUD_TERMS.length} terms`
            : `${filtered.length} of ${CLOUD_TERMS.length} terms`}
          {query && <span style={{ color: '#6366f1' }}> matching &ldquo;{query}&rdquo;</span>}
        </p>
      </div>

      {filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 14 }}>
          {filtered.map(t => <TermCard key={t.term} term={t} />)}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: '#1a1a2e', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🤷</p>
          <p style={{ color: '#a0a0b0', fontSize: 15, marginBottom: 8 }}>No terms found for &ldquo;{query}&rdquo;</p>
          <p style={{ color: '#444', fontSize: 13 }}>Try a different search or clear the filter.</p>
          <button
            onClick={() => { setQuery(''); setActiveCategory('All') }}
            style={{ marginTop: 16, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 18px', color: '#a0a0b0', fontSize: 13, cursor: 'pointer' }}
          >
            Clear search
          </button>
        </div>
      )}
    </>
  )

  if (embedded) return <div>{inner}</div>
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '100px 24px 80px' }}>{inner}</div>
    </div>
  )
}
