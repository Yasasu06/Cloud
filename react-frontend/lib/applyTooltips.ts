import { JARGON_TERMS } from './data'

const TERMS = JARGON_TERMS.map(t => t.term).sort((a, b) => b.length - a.length)

const TERM_PATTERN = new RegExp(
  '\\b(' + TERMS.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b',
  'g'
)

export function hasJargon(text: string): boolean {
  return TERM_PATTERN.test(text)
}

export { TERM_PATTERN }
