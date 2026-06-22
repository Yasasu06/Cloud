// ─── Multi-provider cloud bill parser ────────────────────────────────────────
//
// Auto-detects which cloud provider a billing CSV came from (by header
// signature), maps the provider-specific column names to a common shape, and
// returns a fully transparent parse summary so the UI can NEVER fail silently.
//
// Providers with downloadable billing CSV exports (parsed here):
//   • AWS          — Cost & Usage Report (CUR)  +  Cost Explorer CSV (wide/pivot)
//   • Azure        — Cost Management usage/cost export (EA + MCA schemas)
//   • GCP          — Billing "Cost table" CSV export (console)
//   • DigitalOcean — Billing history CSV invoice
//   • Oracle Cloud — Cost & Usage Report CSV
//
// Providers that do NOT offer a granular billing CSV export (handled with a
// clear message — see NO_CSV_PROVIDERS): Hetzner, Linode, Vultr, Cloudflare,
// Render, Railway, Fly.io. These bill via PDF invoices / Stripe receipts, so we
// route the user to the "Paste Bill Text" tab instead of failing silently.

export interface ServiceRow {
  service: string
  cost: number
  region: string
  date?: string
}

export interface ParseSummary {
  provider: string                      // display name, e.g. "AWS"
  providerKey: string                   // canonical key, e.g. "aws"
  confidence: 'high' | 'medium' | 'low'
  format: 'line-item' | 'wide-pivot'    // long format vs. service×period matrix
  rowsTotal: number                     // data rows seen (excludes header)
  rowsParsed: number                    // rows with a valid, non-zero cost
  rowsSkipped: number                   // rows dropped (no/zero/unparseable cost)
  servicesFound: number
  costColumn: string                    // detected header name (or '—')
  serviceColumn: string
  dateColumn: string
  regionColumn: string
  currency: string
}

export interface ParsedBill {
  rows: ServiceRow[]
  byService: { service: string; total: number; pct: number }[]
  grandTotal: number
  dateRange: string
  summary: ParseSummary
}

// Providers known NOT to offer a granular CSV billing export.
export const NO_CSV_PROVIDERS = [
  'Hetzner', 'Linode', 'Vultr', 'Cloudflare', 'Render', 'Railway', 'Fly.io',
]

interface ProviderProfile {
  key: string
  name: string
  signatures: string[]    // headers that uniquely identify this provider
  costCols: string[]
  serviceCols: string[]
  dateCols: string[]
  regionCols: string[]
  currencyCols?: string[]
  stripPrefix?: RegExp    // tidy up service names for display
}

const PROFILES: ProviderProfile[] = [
  {
    key: 'aws',
    name: 'AWS',
    signatures: [
      'lineItem/UnblendedCost', 'lineItem/ProductCode', 'lineItem/UsageStartDate',
      'bill/BillingPeriodStartDate', 'product/ProductName', 'pricing/term',
    ],
    costCols: [
      'lineItem/UnblendedCost', 'lineItem/BlendedCost', 'lineItem/NetUnblendedCost',
      'UnblendedCost', 'BlendedCost', 'AmortizedCost', 'Total costs($)', 'Total costs', 'Cost',
    ],
    serviceCols: ['product/ProductName', 'lineItem/ProductCode', 'ProductName', 'Service'],
    dateCols: ['lineItem/UsageStartDate', 'bill/BillingPeriodStartDate', 'UsageStartDate'],
    regionCols: ['product/region', 'product/location', 'lineItem/AvailabilityZone', 'Region'],
    currencyCols: ['lineItem/CurrencyCode', 'pricing/currency'],
    stripPrefix: /^Amazon\s+|^AWS\s+/i,
  },
  {
    key: 'azure',
    name: 'Azure',
    signatures: [
      'MeterCategory', 'meterCategory', 'ServiceFamily', 'ConsumedService',
      'CostInBillingCurrency', 'costInBillingCurrency', 'SubscriptionName', 'ResourceGroup',
    ],
    costCols: [
      'CostInBillingCurrency', 'costInBillingCurrency', 'CostInUSD', 'PreTaxCost', 'Cost', 'cost',
    ],
    serviceCols: ['ServiceName', 'MeterCategory', 'meterCategory', 'ConsumedService', 'ProductName', 'productName'],
    dateCols: ['Date', 'date', 'UsageDateTime', 'BillingPeriodStartDate'],
    regionCols: ['ResourceLocation', 'resourceLocation', 'Location'],
    currencyCols: ['BillingCurrency', 'billingCurrency', 'BillingCurrencyCode'],
    stripPrefix: /^Microsoft\.?\s*|^Azure\s+/i,
  },
  {
    key: 'gcp',
    name: 'GCP',
    signatures: [
      'Service description', 'SKU description', 'Usage start date', 'Usage end date',
      'Project ID', 'Project name', 'Cost type',
    ],
    costCols: ['Cost ($)', 'Cost (USD)', 'Cost', 'cost', 'Subtotal'],
    serviceCols: ['Service description', 'Service', 'SKU description'],
    dateCols: ['Usage start date', 'Usage start', 'Start date'],
    regionCols: ['Location', 'Region', 'Location / region', 'Country'],
    currencyCols: ['Currency'],
  },
  {
    key: 'digitalocean',
    name: 'DigitalOcean',
    signatures: ['group_description', 'project_name', 'product'],
    costCols: ['USD', 'amount', 'Amount', 'cost'],
    serviceCols: ['product', 'group_description', 'description'],
    dateCols: ['start', 'end'],
    regionCols: ['region'],
    currencyCols: [],
  },
  {
    key: 'oracle',
    name: 'Oracle Cloud',
    signatures: [
      'cost/myCost', 'product/service', 'lineItem/intervalUsageStart', 'cost/currencyCode',
    ],
    costCols: ['cost/myCost', 'cost/myCostOverage', 'Cost'],
    serviceCols: ['product/service', 'product/Description', 'product/resource'],
    dateCols: ['lineItem/intervalUsageStart', 'lineItem/intervalUsageEnd'],
    regionCols: ['product/region', 'product/availabilityDomain'],
    currencyCols: ['cost/currencyCode'],
  },
]

// Last-resort profile for any CSV that has a recognizable cost + name column.
const GENERIC_PROFILE: ProviderProfile = {
  key: 'generic',
  name: 'Cloud',
  signatures: [],
  costCols: ['Cost', 'cost', 'Amount', 'amount', 'Total', 'total', 'Price', 'price', 'USD', 'Charge'],
  serviceCols: ['Service', 'service', 'Product', 'product', 'Name', 'name', 'Description', 'description', 'Item'],
  dateCols: ['Date', 'date', 'Start', 'start', 'Period', 'Month'],
  regionCols: ['Region', 'region', 'Location', 'location'],
}

// ─── low-level CSV helpers ───────────────────────────────────────────────────

function detectDelimiter(headerLine: string): string {
  const counts: Record<string, number> = {
    ',': (headerLine.match(/,/g) || []).length,
    '\t': (headerLine.match(/\t/g) || []).length,
    ';': (headerLine.match(/;/g) || []).length,
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}

// RFC-4180-aware field splitter: handles quoted fields, embedded delimiters,
// and escaped quotes ("").
function splitLine(line: string, delim: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuote = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') { cur += '"'; i++; continue }
      inQuote = !inQuote
      continue
    }
    if (ch === delim && !inQuote) { out.push(cur.trim()); cur = ''; continue }
    cur += ch
  }
  out.push(cur.trim())
  return out
}

function normHeader(h: string): string {
  return h.replace(/^﻿/, '').trim().replace(/^["']|["']$/g, '')
}

// Returns the matched header index AND the actual header text (for the summary).
function findCol(headers: string[], candidates: string[]): { idx: number; name: string } {
  const normed = headers.map(normHeader)
  // 1) exact (case-insensitive) match against candidates, in priority order
  for (const c of candidates) {
    const i = normed.findIndex(h => h.toLowerCase() === c.toLowerCase())
    if (i !== -1) return { idx: i, name: normed[i] }
  }
  // 2) fuzzy: header that contains the first candidate's alpha keyword
  if (candidates.length) {
    const keyword = candidates[0].toLowerCase().replace(/[^a-z]/g, '')
    if (keyword) {
      const i = normed.findIndex(h => h.toLowerCase().replace(/[^a-z]/g, '').includes(keyword))
      if (i !== -1) return { idx: i, name: normed[i] }
    }
  }
  return { idx: -1, name: '—' }
}

function parseCost(raw: string | undefined): number {
  if (!raw) return NaN
  // strip currency symbols / thousands separators, keep sign + decimal
  const cleaned = raw.replace(/[^0-9.\-]/g, '')
  if (!cleaned || cleaned === '-' || cleaned === '.') return NaN
  return parseFloat(cleaned)
}

function buildDateRange(dates: string[]): string {
  if (!dates.length) return 'Period unknown'
  const ts = dates
    .map(d => ({ raw: d, t: Date.parse(d) }))
    .filter(x => !isNaN(x.t))
  if (ts.length) {
    const min = ts.reduce((a, b) => (a.t < b.t ? a : b))
    const max = ts.reduce((a, b) => (a.t > b.t ? a : b))
    const fmt = (t: number) => new Date(t).toISOString().slice(0, 10)
    return min.t === max.t ? fmt(min.t) : `${fmt(min.t)} — ${fmt(max.t)}`
  }
  // non-parseable dates: fall back to first/last seen
  return dates[0].slice(0, 10) === dates[dates.length - 1].slice(0, 10)
    ? dates[0].slice(0, 10)
    : `${dates[0].slice(0, 10)} — ${dates[dates.length - 1].slice(0, 10)}`
}

// ─── provider detection ──────────────────────────────────────────────────────

interface Detection {
  profile: ProviderProfile
  confidence: 'high' | 'medium' | 'low'
}

function detectProvider(headers: string[]): Detection | null {
  const normed = headers.map(h => normHeader(h).toLowerCase())
  const has = (sig: string) => normed.includes(sig.toLowerCase())

  let best: { profile: ProviderProfile; score: number } | null = null
  for (const p of PROFILES) {
    const score = p.signatures.reduce((n, s) => n + (has(s) ? 1 : 0), 0)
    if (score > 0 && (!best || score > best.score)) best = { profile: p, score }
  }

  if (best) {
    return { profile: best.profile, confidence: best.score >= 2 ? 'high' : 'medium' }
  }

  // AWS Cost Explorer "Download CSV": a service×period matrix with no CUR-style
  // signature headers. Identified by a "Service" column plus either a
  // "Total costs" column or date-like period columns (e.g. 2024-01-01).
  const hasService = normed.includes('service')
  const hasTotalCosts = normed.some(h => /^total costs?/.test(h))
  const periodCols = normed.filter(h => /^\d{4}-\d{2}-\d{2}/.test(h) || /^\d{4}\/\d{2}/.test(h)).length
  if (hasService && (hasTotalCosts || periodCols >= 1)) {
    const aws = PROFILES.find(p => p.key === 'aws')!
    return { profile: aws, confidence: 'medium' }
  }

  // No provider signature — does it at least look like a cost table?
  const hasCost = GENERIC_PROFILE.costCols.some(c => has(c)) ||
    normed.some(h => /cost|amount|charge|price|usd/.test(h))
  const hasName = GENERIC_PROFILE.serviceCols.some(c => has(c)) ||
    normed.some(h => /service|product|description|name|item/.test(h))
  if (hasCost && hasName) return { profile: GENERIC_PROFILE, confidence: 'low' }

  return null
}

// ─── main entry ──────────────────────────────────────────────────────────────

export class UnsupportedBillError extends Error {}

export function parseBill(raw: string): ParsedBill {
  const lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim())
  if (lines.length < 2) {
    throw new UnsupportedBillError('This file has no data rows. Export a billing CSV with a header row plus line items.')
  }

  const delim = detectDelimiter(lines[0])
  const headers = splitLine(lines[0], delim)

  const detection = detectProvider(headers)
  if (!detection) {
    throw new UnsupportedBillError(
      `We couldn't recognize this CSV as a cloud billing export. We auto-detect AWS, Azure, GCP, DigitalOcean and Oracle CSVs. ` +
      `Providers like ${NO_CSV_PROVIDERS.join(', ')} don't offer a granular CSV export — for those, paste your line items in the "Paste Bill Text" tab instead.`
    )
  }

  const { profile, confidence } = detection
  const cost = findCol(headers, profile.costCols)
  const service = findCol(headers, profile.serviceCols)
  const date = findCol(headers, profile.dateCols)
  const region = findCol(headers, profile.regionCols)
  const currencyCol = profile.currencyCols?.length ? findCol(headers, profile.currencyCols) : { idx: -1, name: '—' }

  // Decide format: AWS Cost Explorer exports are a service×period matrix with no
  // single cost column — we sum the numeric period columns per row instead.
  const isWide = cost.idx === -1 && service.idx !== -1
  if (cost.idx === -1 && !isWide) {
    throw new UnsupportedBillError(
      `Detected a ${profile.name} file, but no cost column was found. ` +
      `Expected one of: ${profile.costCols.slice(0, 4).join(', ')}.`
    )
  }

  // For wide format, every numeric column that isn't the service/date/region
  // column is treated as a period cost and summed.
  const numericCols: number[] = []
  if (isWide) {
    for (let c = 0; c < headers.length; c++) {
      if (c === service.idx || c === date.idx || c === region.idx) continue
      // sample first data row to decide if this column is numeric
      const sample = splitLine(lines[1], delim)[c]
      if (!isNaN(parseCost(sample))) numericCols.push(c)
    }
  }

  const rows: ServiceRow[] = []
  const dates: string[] = []
  let currency = 'USD'
  let rowsTotal = 0
  let rowsSkipped = 0

  for (let i = 1; i < lines.length; i++) {
    const cols = splitLine(lines[i], delim)
    if (cols.length === 1 && cols[0] === '') continue
    rowsTotal++

    let rowCost: number
    if (isWide) {
      rowCost = numericCols.reduce((sum, c) => {
        const v = parseCost(cols[c])
        return sum + (isNaN(v) ? 0 : v)
      }, 0)
    } else {
      rowCost = parseCost(cols[cost.idx])
    }

    if (isNaN(rowCost) || rowCost === 0) { rowsSkipped++; continue }

    let svc = (service.idx >= 0 ? cols[service.idx] : '') || 'Unknown'
    if (profile.stripPrefix) svc = svc.replace(profile.stripPrefix, '').trim() || svc
    const reg = (region.idx >= 0 ? cols[region.idx] : '') || '—'
    const dt = date.idx >= 0 ? cols[date.idx] : ''
    if (dt) dates.push(dt)
    if (currencyCol.idx >= 0 && cols[currencyCol.idx]) currency = cols[currencyCol.idx]

    rows.push({ service: svc, cost: rowCost, region: reg, date: dt || undefined })
  }

  if (rows.length === 0) {
    throw new UnsupportedBillError(
      `We detected a ${profile.name} file and found the cost column (${cost.name}), ` +
      `but every row had a zero or empty cost. Double-check you exported a cost/usage report, not an empty period.`
    )
  }

  // aggregate by service
  const totals: Record<string, number> = {}
  for (const r of rows) totals[r.service] = (totals[r.service] ?? 0) + r.cost
  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0)
  const byService = Object.entries(totals)
    .map(([service, total]) => ({ service, total, pct: grandTotal > 0 ? (total / grandTotal) * 100 : 0 }))
    .sort((a, b) => b.total - a.total)

  const summary: ParseSummary = {
    provider: profile.name,
    providerKey: profile.key,
    confidence,
    format: isWide ? 'wide-pivot' : 'line-item',
    rowsTotal,
    rowsParsed: rows.length,
    rowsSkipped,
    servicesFound: byService.length,
    costColumn: isWide ? `${numericCols.length} period columns (summed)` : cost.name,
    serviceColumn: service.name,
    dateColumn: date.name,
    regionColumn: region.name,
    currency,
  }

  return { rows, byService, grandTotal, dateRange: buildDateRange(dates), summary }
}

// Provider-aware prompt for the FinOps analysis.
export function buildAnalysisPrompt(parsed: ParsedBill): string {
  const top10 = parsed.byService.slice(0, 10)
  const lines = top10.map(r => `${r.service}: ${parsed.summary.currency} ${r.total.toFixed(2)} (${r.pct.toFixed(1)}%)`).join('\n')
  return `${parsed.summary.provider} bill breakdown — total ${parsed.summary.currency} ${parsed.grandTotal.toFixed(2)} for ${parsed.dateRange}:\n\n${lines}\n\n` +
    `Analyze this ${parsed.summary.provider} bill as a FinOps expert. Give: 1) What each major charge is in plain English, ` +
    `2) Top 3 items to cut immediately with specific dollar savings, 3) One action to take this week. ` +
    `Write for a non-technical founder. Be specific.`
}
