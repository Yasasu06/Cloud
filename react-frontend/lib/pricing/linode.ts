// Linode (Akamai) pricing — verified 2026-05-02 against linode.com/pricing
import type { ComputeInstance, EgressPrice, StoragePrice } from './types'

const LINODE: ComputeInstance[] = [
  { provider: 'Linode', name: 'Nanode 1GB', vcpus: 1, ram_gb: 1,  storage_gb: 25,  price_monthly_usd: 5,   price_hourly_usd: 0.0075 },
  { provider: 'Linode', name: 'Linode 2GB', vcpus: 1, ram_gb: 2,  storage_gb: 50,  price_monthly_usd: 12,  price_hourly_usd: 0.018 },
  { provider: 'Linode', name: 'Linode 4GB', vcpus: 2, ram_gb: 4,  storage_gb: 80,  price_monthly_usd: 24,  price_hourly_usd: 0.036 },
  { provider: 'Linode', name: 'Linode 8GB', vcpus: 4, ram_gb: 8,  storage_gb: 160, price_monthly_usd: 48,  price_hourly_usd: 0.072 },
  { provider: 'Linode', name: 'Linode 16GB',vcpus: 6, ram_gb: 16, storage_gb: 320, price_monthly_usd: 96,  price_hourly_usd: 0.144 },
  { provider: 'Linode', name: 'Linode 32GB',vcpus: 8, ram_gb: 32, storage_gb: 640, price_monthly_usd: 192, price_hourly_usd: 0.288 },
]

export async function fetchLinodeCompute(): Promise<ComputeInstance[]> { return LINODE }
export async function fetchLinodeStorage(): Promise<StoragePrice[]> {
  return [
    { provider: 'Linode', tier: 'Object Storage', price_per_gb_month_usd: 0.02, notes: '$5/mo for 250GB + 1TB egress' },
    { provider: 'Linode', tier: 'Block Storage',  price_per_gb_month_usd: 0.10 },
  ]
}
export async function fetchLinodeEgress(): Promise<EgressPrice[]> {
  return [{ provider: 'Linode', price_per_gb_usd: 0.005, free_tier_gb: 1000, notes: '1TB free per VM, then $0.005/GB' }]
}
export const LINODE_LAST_UPDATED = '2026-05-02'
