// ─────────────────────────────────────────────────────────────────────────────
// FORWARD PROJECTION — derived entirely from CLOUD_SEGMENT_REVENUE.
//
// Method:
//   • Compute a single compound QoQ growth rate for each provider over the
//     full historical window (Q1 2023 → Q4 2025, 11 periods).
//     rate = (end / start)^(1/11) − 1
//   • For Azure, use the midpoint of the disclosed band (azureLow + azureHigh) / 2.
//   • Project six quarters forward (Q1 2026 → Q2 2027) by applying the rate
//     uniformly. This is a smoothed extrapolation; it does not model
//     seasonality and it does not adjust for the 2025 Azure re-scoping
//     (which is called out separately on the page).
//   • Crossover quarter = first projected quarter where Azure midpoint > AWS.
//   • Sensitivity: same projection with Azure QoQ decelerated by 5pp and 10pp.
// ─────────────────────────────────────────────────────────────────────────────

import { CLOUD_SEGMENT_REVENUE, type QuarterlyRevenuePoint } from './data'

export const PROJECTION_QUARTERS = [
  'Q1 2026',
  'Q2 2026',
  'Q3 2026',
  'Q4 2026',
  'Q1 2027',
  'Q2 2027',
] as const

export interface ProjectedRow {
  quarter: string
  aws: number
  azureMid: number
  gcp: number
  gap: number // azureMid − aws
}

function azureMidpoint(p: QuarterlyRevenuePoint): number {
  if (p.azureLow == null || p.azureHigh == null) {
    throw new Error(`Azure band missing for ${p.quarter}`)
  }
  return (p.azureLow + p.azureHigh) / 2
}

function compoundRate(start: number, end: number, periods: number): number {
  return Math.pow(end / start, 1 / periods) - 1
}

function projectForward(start: number, rate: number, steps: number): number[] {
  const out: number[] = []
  let v = start
  for (let i = 0; i < steps; i++) {
    v = v * (1 + rate)
    out.push(v)
  }
  return out
}

function firstCrossover(rows: ProjectedRow[]): string | null {
  for (const r of rows) {
    if (r.gap > 0) return r.quarter
  }
  return null
}

function rowsFromRates(
  awsRate: number,
  azureRate: number,
  gcpRate: number,
  awsStart: number,
  azureStart: number,
  gcpStart: number,
): ProjectedRow[] {
  const steps = PROJECTION_QUARTERS.length
  const aws = projectForward(awsStart, awsRate, steps)
  const azure = projectForward(azureStart, azureRate, steps)
  const gcp = projectForward(gcpStart, gcpRate, steps)
  return PROJECTION_QUARTERS.map((q, i) => ({
    quarter: q,
    aws: aws[i],
    azureMid: azure[i],
    gcp: gcp[i],
    gap: azure[i] - aws[i],
  }))
}

export interface Projection {
  historicalStartQuarter: string
  historicalEndQuarter: string
  awsQoq: number
  azureQoq: number
  gcpQoq: number
  baseline: {
    rows: ProjectedRow[]
    crossoverQuarter: string | null
  }
  minus5pp: { crossoverQuarter: string | null }
  minus10pp: { crossoverQuarter: string | null }
  azureBandQ4_2025: {
    low: number
    midpoint: number
    high: number
  }
}

export function buildProjection(): Projection {
  const series = CLOUD_SEGMENT_REVENUE
  const first = series[0]
  const last = series[series.length - 1]

  if (first.aws == null || last.aws == null || first.gcp == null || last.gcp == null) {
    throw new Error('Historical AWS/GCP series contains nulls; cannot project.')
  }

  const azureStart = azureMidpoint(first)
  const azureEnd = azureMidpoint(last)

  const periods = series.length - 1 // 11
  const awsQoq = compoundRate(first.aws, last.aws, periods)
  const gcpQoq = compoundRate(first.gcp, last.gcp, periods)
  const azureQoq = compoundRate(azureStart, azureEnd, periods)

  const baseline = rowsFromRates(awsQoq, azureQoq, gcpQoq, last.aws, azureEnd, last.gcp)
  const minus5 = rowsFromRates(awsQoq, azureQoq - 0.05, gcpQoq, last.aws, azureEnd, last.gcp)
  const minus10 = rowsFromRates(awsQoq, azureQoq - 0.1, gcpQoq, last.aws, azureEnd, last.gcp)

  return {
    historicalStartQuarter: first.quarter,
    historicalEndQuarter: last.quarter,
    awsQoq,
    azureQoq,
    gcpQoq,
    baseline: { rows: baseline, crossoverQuarter: firstCrossover(baseline) },
    minus5pp: { crossoverQuarter: firstCrossover(minus5) },
    minus10pp: { crossoverQuarter: firstCrossover(minus10) },
    azureBandQ4_2025: {
      low: last.azureLow!,
      midpoint: azureEnd,
      high: last.azureHigh!,
    },
  }
}
