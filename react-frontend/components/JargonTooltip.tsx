'use client'

import React, { useState } from 'react'
import { JARGON_TERMS } from '@/lib/data'

const TERMS_MAP = new Map(JARGON_TERMS.map(t => [t.term.toLowerCase(), t.explanation]))

const JARGON_STYLE: React.CSSProperties = {
  borderBottom: '1px dotted #6366f1',
  cursor: 'help',
}

// Splits text into word tokens and wraps jargon terms in data-term spans.
// Handles single-word terms (EC2, S3) and multi-word terms (SOC 2, ISO 27001).
export function JargonText({ text }: { text: string }) {
  if (!text) return null

  const tokens = text.split(/(\s+)/)
  const result: React.ReactNode[] = []
  let i = 0

  while (i < tokens.length) {
    const tok = tokens[i]

    if (/^\s+$/.test(tok)) {
      result.push(tok)
      i++
      continue
    }

    // Try 3-word term (5 tokens: word space word space word)
    if (i + 4 < tokens.length) {
      const candidate = tok + tokens[i + 1] + tokens[i + 2] + tokens[i + 3] + tokens[i + 4]
      const key = candidate.replace(/\s+/g, ' ').toLowerCase().trim()
      if (TERMS_MAP.has(key)) {
        result.push(<span key={i} data-term={key} style={JARGON_STYLE}>{candidate}</span>)
        i += 5
        continue
      }
    }

    // Try 2-word term (3 tokens: word space word)
    if (i + 2 < tokens.length) {
      const candidate = tok + tokens[i + 1] + tokens[i + 2]
      const key = candidate.replace(/\s+/g, ' ').toLowerCase().trim()
      if (TERMS_MAP.has(key)) {
        result.push(<span key={i} data-term={key} style={JARGON_STYLE}>{candidate}</span>)
        i += 3
        continue
      }
    }

    // Single word — strip punctuation for lookup, render original token
    const cleanWord = tok.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    if (cleanWord && TERMS_MAP.has(cleanWord)) {
      result.push(<span key={i} data-term={cleanWord} style={JARGON_STYLE}>{tok}</span>)
    } else {
      result.push(tok)
    }
    i++
  }

  return <>{result}</>
}

// Wraps the entire response area. Single onMouseOver with event delegation
// detects data-term spans and shows one shared floating tooltip.
export function JargonWrapper({ children }: { children: React.ReactNode }) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)

  function handleMouseOver(e: React.MouseEvent) {
    const el = e.target as HTMLElement
    const term = el.dataset?.term
    if (term) {
      const explanation = TERMS_MAP.get(term)
      if (explanation) {
        setTooltip({ text: explanation, x: e.clientX, y: e.clientY })
        return
      }
    }
    setTooltip(null)
  }

  return (
    <div onMouseOver={handleMouseOver} onMouseLeave={() => setTooltip(null)}>
      {children}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x + 14,
            top: tooltip.y + 18,
            background: '#1a1a2e',
            border: '1px solid rgba(99,102,241,0.5)',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 13,
            color: '#e0e0e0',
            maxWidth: 240,
            zIndex: 9999,
            pointerEvents: 'none',
            lineHeight: 1.5,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
