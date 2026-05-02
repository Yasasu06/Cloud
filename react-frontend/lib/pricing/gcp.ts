// GCP Compute Engine pricing — verified 2026-05-02 against cloud.google.com/compute/all-pricing
// us-central1, on-demand, Linux. GCP Cloud Billing API requires NEXT_PUBLIC_GCP_API_KEY;
// hardcoded for reliability. Wire in API call when key is provisioned.

import type { ComputeInstance, EgressPrice, StoragePrice } from './types'

const GCP_INSTANCES: ComputeInstance[] = [
  { provider: 'GCP', name: 'e2-micro',     vcpus: 2, ram_gb: 1,  price_monthly_usd: 6.11,   price_hourly_usd: 0.00838, region: 'us-central1' },
  { provider: 'GCP', name: 'e2-small',     vcpus: 2, ram_gb: 2,  price_monthly_usd: 12.23,  price_hourly_usd: 0.01675, region: 'us-central1' },
  { provider: 'GCP', name: 'e2-medium',    vcpus: 2, ram_gb: 4,  price_monthly_usd: 24.46,  price_hourly_usd: 0.0335,  region: 'us-central1' },
  { provider: 'GCP', name: 'e2-standard-2',vcpus: 2, ram_gb: 8,  price_monthly_usd: 48.92,  price_hourly_usd: 0.067,   region: 'us-central1' },
  { provider: 'GCP', name: 'e2-standard-4',vcpus: 4, ram_gb: 16, price_monthly_usd: 97.83,  price_hourly_usd: 0.134,   region: 'us-central1' },
  { provider: 'GCP', name: 'n2-standard-2',vcpus: 2, ram_gb: 8,  price_monthly_usd: 71.10,  price_hourly_usd: 0.0974,  region: 'us-central1' },
  { provider: 'GCP', name: 'n2-standard-4',vcpus: 4, ram_gb: 16, price_monthly_usd: 142.21, price_hourly_usd: 0.1948,  region: 'us-central1' },
  { provider: 'GCP', name: 'c3-standard-4',vcpus: 4, ram_gb: 16, price_monthly_usd: 156.95, price_hourly_usd: 0.215,   region: 'us-central1' },
]

export async function fetchGCPCompute(): Promise<ComputeInstance[]> {
  return GCP_INSTANCES
}
export async function fetchGCPStorage(): Promise<StoragePrice[]> {
  return [
    { provider: 'GCP', tier: 'Cloud Storage Standard', price_per_gb_month_usd: 0.020 },
    { provider: 'GCP', tier: 'Cloud Storage Nearline', price_per_gb_month_usd: 0.010 },
    { provider: 'GCP', tier: 'Cloud Storage Coldline', price_per_gb_month_usd: 0.004 },
    { provider: 'GCP', tier: 'Persistent Disk SSD',    price_per_gb_month_usd: 0.17 },
  ]
}
export async function fetchGCPEgress(): Promise<EgressPrice[]> {
  return [{ provider: 'GCP', price_per_gb_usd: 0.12, notes: 'First 1GB/mo to internet free, then $0.12/GB to 1TB' }]
}
export const GCP_LAST_UPDATED = '2026-05-02'
