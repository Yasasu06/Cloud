// Hetzner Cloud pricing — verified 2026-05-02 against hetzner.com/cloud
// EUR converted to USD at 1.08 EUR/USD; verify rate before quoting
import type { ComputeInstance, EgressPrice, StoragePrice } from './types'

const EUR_USD = 1.08

const HETZNER: ComputeInstance[] = [
  { provider: 'Hetzner', name: 'CX22',  vcpus: 2,  ram_gb: 4,  storage_gb: 40,  price_monthly_usd: round(3.85 * EUR_USD),  notes: 'AMD shared' },
  { provider: 'Hetzner', name: 'CX32',  vcpus: 4,  ram_gb: 8,  storage_gb: 80,  price_monthly_usd: round(6.96 * EUR_USD),  notes: 'AMD shared' },
  { provider: 'Hetzner', name: 'CX42',  vcpus: 8,  ram_gb: 16, storage_gb: 160, price_monthly_usd: round(13.85 * EUR_USD), notes: 'AMD shared' },
  { provider: 'Hetzner', name: 'CCX13', vcpus: 2,  ram_gb: 8,  storage_gb: 80,  price_monthly_usd: round(13.49 * EUR_USD), notes: 'Dedicated vCPU' },
  { provider: 'Hetzner', name: 'CCX23', vcpus: 4,  ram_gb: 16, storage_gb: 160, price_monthly_usd: round(26.49 * EUR_USD), notes: 'Dedicated vCPU' },
  { provider: 'Hetzner', name: 'CCX33', vcpus: 8,  ram_gb: 32, storage_gb: 240, price_monthly_usd: round(52.49 * EUR_USD), notes: 'Dedicated vCPU' },
]

function round(n: number): number { return Math.round(n * 100) / 100 }

export async function fetchHetznerCompute(): Promise<ComputeInstance[]> { return HETZNER }
export async function fetchHetznerStorage(): Promise<StoragePrice[]> {
  return [{ provider: 'Hetzner', tier: 'Volume',         price_per_gb_month_usd: round(0.044 * EUR_USD), notes: 'Block storage' }]
}
export async function fetchHetznerEgress(): Promise<EgressPrice[]> {
  return [{ provider: 'Hetzner', price_per_gb_usd: round(0.001 * EUR_USD), free_tier_gb: 20000, notes: '20TB included per server, then €1/TB' }]
}
export const HETZNER_LAST_UPDATED = '2026-05-02'
