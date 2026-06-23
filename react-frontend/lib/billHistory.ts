// ─── Bill analyzer memory ─────────────────────────────────────────────────────
//
// Turns the bill analyzer into an agent with memory: every parsed bill is
// persisted so the user sees their history + month-over-month trend.
//
// Storage model (privacy-first):
//   • Anonymous visitors  → localStorage only, keyed by a persistent random
//     session id ('cip_session_id'). They never write to the database, so no
//     anonymous rows are ever exposed via RLS.
//   • Logged-in users     → Supabase `bill_analyses` (RLS: own rows only),
//     plus a localStorage mirror for instant display / migration.
//   • Login migration     → on next visit while authenticated, any local
//     anonymous analyses are upserted into Supabase under the user's id.

import { supabase } from '@/lib/supabase'
import type { ParsedBill } from '@/lib/billParsers'

const SESSION_KEY = 'cip_session_id'
const HISTORY_KEY = 'cip_bill_analyses'

export interface ServiceSlice { service: string; total: number; pct: number }

export interface AnalysisRecord {
  id: string
  session_id: string
  user_id: string | null
  provider: string
  total_amount: number
  top_service: string
  waste_pct: number
  savings_estimate: number
  service_breakdown: ServiceSlice[]
  analyzed_at: string          // ISO timestamp
  migrated?: boolean           // local-only bookkeeping; not sent to the DB
}

// ── persistent anonymous session id ──────────────────────────────────────────

export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

// ── deterministic waste / savings estimate ───────────────────────────────────
// Per-service typical-waste rates (FinOps rules of thumb). Deterministic so the
// same bill always yields the same numbers — essential for trend comparisons.

const WASTE_RATES: { pattern: RegExp; rate: number }[] = [
  { pattern: /data\s*transfer|bandwidth|egress|networking|cdn/i, rate: 0.40 },
  { pattern: /ec2|compute|virtual\s*machine|droplet|instance|\bvm\b/i, rate: 0.30 },
  { pattern: /load\s*balanc|nat|gateway/i, rate: 0.25 },
  { pattern: /rds|database|sql|cosmos|dynamo|bigquery|firestore/i, rate: 0.22 },
  { pattern: /s3|storage|blob|bucket|spaces|disk|volume/i, rate: 0.15 },
]
const DEFAULT_WASTE = 0.10

export function estimateWaste(parsed: ParsedBill): { wastePct: number; savings: number } {
  let savings = 0
  for (const s of parsed.byService) {
    const rule = WASTE_RATES.find(r => r.pattern.test(s.service))
    savings += s.total * (rule ? rule.rate : DEFAULT_WASTE)
  }
  const wastePct = parsed.grandTotal > 0 ? (savings / parsed.grandTotal) * 100 : 0
  return { wastePct: Math.round(wastePct * 10) / 10, savings: Math.round(savings * 100) / 100 }
}

// ── record building + (de)serialization ──────────────────────────────────────

function buildRecord(parsed: ParsedBill, sessionId: string, userId: string | null): AnalysisRecord {
  const { wastePct, savings } = estimateWaste(parsed)
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `a_${Date.now()}`,
    session_id: sessionId,
    user_id: userId,
    provider: parsed.summary.provider,
    total_amount: Math.round(parsed.grandTotal * 100) / 100,
    top_service: parsed.byService[0]?.service ?? 'Unknown',
    waste_pct: wastePct,
    savings_estimate: savings,
    service_breakdown: parsed.byService.slice(0, 20).map(s => ({
      service: s.service,
      total: Math.round(s.total * 100) / 100,
      pct: Math.round(s.pct * 10) / 10,
    })),
    analyzed_at: new Date().toISOString(),
  }
}

// row shape for Supabase (drops local-only `migrated` flag)
function toDbRow(r: AnalysisRecord) {
  return {
    id: r.id, session_id: r.session_id, user_id: r.user_id,
    provider: r.provider, total_amount: r.total_amount, top_service: r.top_service,
    waste_pct: r.waste_pct, savings_estimate: r.savings_estimate,
    service_breakdown: r.service_breakdown, analyzed_at: r.analyzed_at,
  }
}

function readLocal(): AnalysisRecord[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') as AnalysisRecord[] } catch { return [] }
}
function writeLocal(arr: AnalysisRecord[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(arr.slice(0, 60))) } catch { /* quota */ }
}

async function currentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession()
    return data.session?.user?.id ?? null
  } catch { return null }
}

// ── public API ───────────────────────────────────────────────────────────────

// Save an analysis. Always mirrors to localStorage (instant history); also
// writes to Supabase when the visitor is authenticated.
export async function saveAnalysis(parsed: ParsedBill): Promise<{ record: AnalysisRecord; store: 'supabase' | 'local' }> {
  const sessionId = getSessionId()
  const userId = await currentUserId()
  const record = buildRecord(parsed, sessionId, userId)

  writeLocal([record, ...readLocal()])

  if (userId) {
    try {
      const { error } = await supabase.from('bill_analyses').insert(toDbRow(record))
      if (!error) return { record, store: 'supabase' }
    } catch { /* fall through to local-only */ }
  }
  return { record, store: 'local' }
}

// Load history (newest first). Authoritative source is Supabase when logged in,
// otherwise localStorage.
export async function loadHistory(): Promise<AnalysisRecord[]> {
  const userId = await currentUserId()
  if (userId) {
    try {
      const { data, error } = await supabase
        .from('bill_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('analyzed_at', { ascending: false })
        .limit(24)
      if (!error && data) return data as AnalysisRecord[]
    } catch { /* fall back to local */ }
  }
  return readLocal().sort((a, b) => b.analyzed_at.localeCompare(a.analyzed_at))
}

// Migrate any anonymous (local-only) analyses to the now-logged-in user.
// Idempotent: rows are upserted by id and flagged migrated locally. Returns the
// number migrated.
export async function migrateAnonToUser(): Promise<number> {
  const userId = await currentUserId()
  if (!userId) return 0
  const local = readLocal()
  const toMigrate = local.filter(r => !r.user_id && !r.migrated)
  if (toMigrate.length === 0) return 0
  try {
    const rows = toMigrate.map(r => toDbRow({ ...r, user_id: userId }))
    const { error } = await supabase.from('bill_analyses').upsert(rows, { onConflict: 'id' })
    if (error) return 0
  } catch { return 0 }
  const ids = new Set(toMigrate.map(r => r.id))
  writeLocal(local.map(r => (ids.has(r.id) ? { ...r, user_id: userId, migrated: true } : r)))
  return toMigrate.length
}
