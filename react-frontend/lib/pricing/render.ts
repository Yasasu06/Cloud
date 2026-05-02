// Render pricing — verified 2026-05-02 against render.com/pricing
import type { ComputeInstance, EgressPrice, StoragePrice } from './types'

const RENDER: ComputeInstance[] = [
  { provider: 'Render', name: 'Free',     vcpus: 0,    ram_gb: 0.5, price_monthly_usd: 0,   notes: 'Static sites + spin-down web service' },
  { provider: 'Render', name: 'Starter',  vcpus: 0.5,  ram_gb: 0.5, price_monthly_usd: 7,   notes: 'Always-on web service' },
  { provider: 'Render', name: 'Standard', vcpus: 1,    ram_gb: 2,   price_monthly_usd: 25 },
  { provider: 'Render', name: 'Pro',      vcpus: 2,    ram_gb: 4,   price_monthly_usd: 85 },
  { provider: 'Render', name: 'Pro Plus', vcpus: 4,    ram_gb: 8,   price_monthly_usd: 175 },
  { provider: 'Render', name: 'Pro Max',  vcpus: 8,    ram_gb: 16,  price_monthly_usd: 350 },
]

export async function fetchRenderCompute(): Promise<ComputeInstance[]> { return RENDER }
export async function fetchRenderStorage(): Promise<StoragePrice[]> {
  return [{ provider: 'Render', tier: 'Persistent Disk', price_per_gb_month_usd: 0.25 }]
}
export async function fetchRenderEgress(): Promise<EgressPrice[]> {
  return [{ provider: 'Render', price_per_gb_usd: 0.10, free_tier_gb: 100, notes: '100GB free, then $0.10/GB' }]
}
export const RENDER_LAST_UPDATED = '2026-05-02'
