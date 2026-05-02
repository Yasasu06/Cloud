// DigitalOcean Droplet pricing — verified 2026-05-02 against digitalocean.com/pricing/droplets
import type { ComputeInstance, EgressPrice, StoragePrice } from './types'

const DO_DROPLETS: ComputeInstance[] = [
  { provider: 'DigitalOcean', name: 's-1vcpu-512mb', vcpus: 1, ram_gb: 0.5, storage_gb: 10,  price_monthly_usd: 4,   price_hourly_usd: 0.006 },
  { provider: 'DigitalOcean', name: 's-1vcpu-1gb',   vcpus: 1, ram_gb: 1,   storage_gb: 25,  price_monthly_usd: 6,   price_hourly_usd: 0.009 },
  { provider: 'DigitalOcean', name: 's-1vcpu-2gb',   vcpus: 1, ram_gb: 2,   storage_gb: 50,  price_monthly_usd: 12,  price_hourly_usd: 0.018 },
  { provider: 'DigitalOcean', name: 's-2vcpu-2gb',   vcpus: 2, ram_gb: 2,   storage_gb: 60,  price_monthly_usd: 18,  price_hourly_usd: 0.027 },
  { provider: 'DigitalOcean', name: 's-2vcpu-4gb',   vcpus: 2, ram_gb: 4,   storage_gb: 80,  price_monthly_usd: 24,  price_hourly_usd: 0.036 },
  { provider: 'DigitalOcean', name: 's-4vcpu-8gb',   vcpus: 4, ram_gb: 8,   storage_gb: 160, price_monthly_usd: 48,  price_hourly_usd: 0.071 },
  { provider: 'DigitalOcean', name: 's-8vcpu-16gb',  vcpus: 8, ram_gb: 16,  storage_gb: 320, price_monthly_usd: 96,  price_hourly_usd: 0.143 },
  { provider: 'DigitalOcean', name: 'g-2vcpu-8gb',   vcpus: 2, ram_gb: 8,   storage_gb: 25,  price_monthly_usd: 63,  price_hourly_usd: 0.094, notes: 'General Purpose' },
]

export async function fetchDOCompute(): Promise<ComputeInstance[]> { return DO_DROPLETS }
export async function fetchDOStorage(): Promise<StoragePrice[]> {
  return [
    { provider: 'DigitalOcean', tier: 'Spaces (S3-compatible)', price_per_gb_month_usd: 0.02, notes: '$5/mo for 250GB + 1TB egress' },
    { provider: 'DigitalOcean', tier: 'Block Storage',          price_per_gb_month_usd: 0.10 },
  ]
}
export async function fetchDOEgress(): Promise<EgressPrice[]> {
  return [{ provider: 'DigitalOcean', price_per_gb_usd: 0.01, free_tier_gb: 1000, notes: '1TB free per Droplet, then $0.01/GB' }]
}
export const DO_LAST_UPDATED = '2026-05-02'
