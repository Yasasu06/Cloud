'use client'
import React, { useState, useRef } from 'react'
import { CLOUD_TERMS } from '@/lib/cloudTerms'

interface Props {
  text: string
}

export default function JargonTooltip({ text }: Props) {
  const [tooltip, setTooltip] = useState<{
    term: string
    definition: string
    x: number
    y: number
  } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  function highlightTerms(content: string) {
    const terms = Object.keys(CLOUD_TERMS)
    const pattern = new RegExp(
      `\\b(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
      'g'
    )

    const parts: Array<{ text: string; term?: string }> = []
    let lastIndex = 0
    let match

    while ((match = pattern.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: content.slice(lastIndex, match.index) })
      }
      parts.push({ text: match[0], term: match[0] })
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < content.length) {
      parts.push({ text: content.slice(lastIndex) })
    }
    return parts
  }

  function handleMouseEnter(term: string, e: React.MouseEvent<HTMLSpanElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()
    setTooltip({
      term,
      definition: CLOUD_TERMS[term],
      x: rect.left - (containerRect?.left || 0),
      y: rect.bottom - (containerRect?.top || 0) + 8,
    })
  }

  const parts = highlightTerms(text)

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline' }}>
      {parts.map((part, i) =>
        part.term ? (
          <span
            key={i}
            onMouseEnter={e => handleMouseEnter(part.term!, e)}
            onMouseLeave={() => setTooltip(null)}
            style={{
              borderBottom: '1px dotted #6366f1',
              cursor: 'help',
              color: 'inherit',
            }}
          >
            {part.text}
          </span>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
      {tooltip && (
        <div style={{
          position: 'absolute',
          left: Math.min(tooltip.x, 300),
          top: tooltip.y,
          background: '#0a0a0f',
          border: '1px solid #6366f1',
          borderRadius: 12,
          padding: '12px 16px',
          width: 280,
          zIndex: 1000,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}>
          <div style={{ color: '#6366f1', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
            {tooltip.term}
          </div>
          <div style={{ color: '#e0e0e0', fontSize: 13, lineHeight: 1.6 }}>
            {tooltip.definition}
          </div>
        </div>
      )}
    </div>
  )
}
