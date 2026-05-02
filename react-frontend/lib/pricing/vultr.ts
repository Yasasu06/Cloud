// Vultr pricing — verified 2026-05-02 against vultr.com/pricing
import type { ComputeInstance, EgressPrice, StoragePrice } from './types'

const VULTR: ComputeInstance[] = [
  { provider: 'Vultr', name: 'vc2-1c-1gb',  vcpus: 1, ram_gb: 1,  storage_gb: 25,  price_monthly_usd: 6,   price_hourly_usd: 0.009 },
  { provider: 'Vultr', name: 'vc2-1c-2gb',  vcpus: 1, ram_gb: 2,  storage_gb: 55,  price_monthly_usd: 12,  price_hourly_usd: 0.018 },
  { provider: 'Vultr', name: 'vc2-2c-4gb',  vcpus: 2, ram_gb: 4,  storage_gb: 80,  price_monthly_usd: 24,  price_hourly_usd: 0.036 },
  { provider: 'Vultr', name: 'vc2-4c-8gb',  vcpus: 4, ram_gb: 8,  storage_gb: 160, price_monthly_usd: 48,  price_hourly_usd: 0.071 },
  { provider: 'Vultr', name: 'vc2-6c-16gb', vcpus: 6, ram_gb: 16, storage_gb: 320, price_monthly_usd: 96,  price_hourly_usd: 0.143 },
]

export async function fetchVultrCompute(): Promise<ComputeInstance[]> { return VULTR }
export async function fetchVultrStorage(): Promise<StoragePrice[]> {
  return [{ provider: 'Vultr', tier: 'Object Storage', price_per_gb_month_usd: 0.02, notes: '$5/mo for 250GB + 1TB egress' }]
}
export async function fetchVultrEgress(): Promise<EgressPrice[]> {
  return [{ provider: 'Vultr', price_per_gb_usd: 0.01, free_tier_gb: 1000, notes: '1TB free per VM, then $0.01/GB' }]
}
export const VULTR_LAST_UPDATED = '2026-05-02'
