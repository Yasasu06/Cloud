// Railway pricing — verified 2026-05-02 against railway.app/pricing
// Railway charges by usage; flat estimates for typical app workloads
import type { ComputeInstance, EgressPrice, StoragePrice } from './types'

const RAILWAY: ComputeInstance[] = [
  { provider: 'Railway', name: 'Hobby',         vcpus: 0,  ram_gb: 0,  price_monthly_usd: 5,   notes: '$5 included usage credit' },
  { provider: 'Railway', name: 'Pro estimate (1vCPU/2GB)', vcpus: 1, ram_gb: 2, price_monthly_usd: 18,  notes: 'Usage-based; this is typical' },
  { provider: 'Railway', name: 'Pro estimate (2vCPU/4GB)', vcpus: 2, ram_gb: 4, price_monthly_usd: 35,  notes: 'Usage-based; this is typical' },
]

export async function fetchRailwayCompute(): Promise<ComputeInstance[]> { return RAILWAY }
export async function fetchRailwayStorage(): Promise<StoragePrice[]> {
  return [{ provider: 'Railway', tier: 'Volume', price_per_gb_month_usd: 0.25 }]
}
export async function fetchRailwayEgress(): Promise<EgressPrice[]> {
  return [{ provider: 'Railway', price_per_gb_usd: 0.10, notes: 'Charged per usage' }]
}
export const RAILWAY_LAST_UPDATED = '2026-05-02'
