// Cloudflare Workers / R2 pricing — verified 2026-05-02 against cloudflare.com/plans
// Cloudflare's primary serverless model; no traditional compute instances
import type { ComputeInstance, EgressPrice, StoragePrice } from './types'

const CLOUDFLARE: ComputeInstance[] = [
  { provider: 'Cloudflare', name: 'Workers Free',  vcpus: 0, ram_gb: 0, price_monthly_usd: 0,   notes: '100k requests/day free' },
  { provider: 'Cloudflare', name: 'Workers Paid',  vcpus: 0, ram_gb: 0, price_monthly_usd: 5,   notes: '10M requests + $0.30/M extra' },
  { provider: 'Cloudflare', name: 'Workers + R2',  vcpus: 0, ram_gb: 0, price_monthly_usd: 5,   notes: '10GB storage + zero egress' },
]

export async function fetchCloudflareCompute(): Promise<ComputeInstance[]> { return CLOUDFLARE }
export async function fetchCloudflareStorage(): Promise<StoragePrice[]> {
  return [
    { provider: 'Cloudflare', tier: 'R2 Standard',  price_per_gb_month_usd: 0.015, notes: '10GB free, then $0.015/GB' },
    { provider: 'Cloudflare', tier: 'R2 Operations', price_per_gb_month_usd: 0,    notes: 'Free Class A: 1M ops/mo' },
  ]
}
export async function fetchCloudflareEgress(): Promise<EgressPrice[]> {
  return [{ provider: 'Cloudflare', price_per_gb_usd: 0, notes: 'Zero egress on R2 — biggest differentiator' }]
}
export const CLOUDFLARE_LAST_UPDATED = '2026-05-02'
