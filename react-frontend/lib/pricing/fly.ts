// Fly.io pricing — verified 2026-05-02 against fly.io/docs/about/pricing
import type { ComputeInstance, EgressPrice, StoragePrice } from './types'

const FLY: ComputeInstance[] = [
  { provider: 'Fly.io', name: 'shared-cpu-1x-256mb', vcpus: 1, ram_gb: 0.25, price_monthly_usd: 1.94,  price_hourly_usd: 0.00266, notes: 'Free 3 included' },
  { provider: 'Fly.io', name: 'shared-cpu-1x-512mb', vcpus: 1, ram_gb: 0.5,  price_monthly_usd: 3.89,  price_hourly_usd: 0.00533 },
  { provider: 'Fly.io', name: 'shared-cpu-1x-1gb',   vcpus: 1, ram_gb: 1,    price_monthly_usd: 6.99,  price_hourly_usd: 0.00958 },
  { provider: 'Fly.io', name: 'shared-cpu-2x-2gb',   vcpus: 2, ram_gb: 2,    price_monthly_usd: 13.98, price_hourly_usd: 0.01916 },
  { provider: 'Fly.io', name: 'performance-2x-4gb',  vcpus: 2, ram_gb: 4,    price_monthly_usd: 64.81, price_hourly_usd: 0.0888,  notes: 'Dedicated CPU' },
]

export async function fetchFlyCompute(): Promise<ComputeInstance[]> { return FLY }
export async function fetchFlyStorage(): Promise<StoragePrice[]> {
  return [{ provider: 'Fly.io', tier: 'Volume', price_per_gb_month_usd: 0.15, notes: '3GB free' }]
}
export async function fetchFlyEgress(): Promise<EgressPrice[]> {
  return [{ provider: 'Fly.io', price_per_gb_usd: 0.02, free_tier_gb: 100, notes: 'First 100GB free, then $0.02/GB N.America' }]
}
export const FLY_LAST_UPDATED = '2026-05-02'
