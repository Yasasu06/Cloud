// Oracle Cloud (OCI) pricing — verified 2026-05-02 against oracle.com/cloud/price-list
import type { ComputeInstance, EgressPrice, StoragePrice } from './types'

const ORACLE: ComputeInstance[] = [
  { provider: 'Oracle', name: 'VM.Standard.E4.Flex 1OCPU', vcpus: 1, ram_gb: 16, price_monthly_usd: 0,    price_hourly_usd: 0,     notes: 'Always-Free tier (2 AMD VMs included)' },
  { provider: 'Oracle', name: 'VM.Standard.A1.Flex 1OCPU', vcpus: 1, ram_gb: 6,  price_monthly_usd: 0,    price_hourly_usd: 0,     notes: 'Always-Free tier (4 ARM VMs, 24GB total)' },
  { provider: 'Oracle', name: 'VM.Standard.E4.Flex 2OCPU', vcpus: 2, ram_gb: 16, price_monthly_usd: 36.50,price_hourly_usd: 0.05,   notes: 'AMD' },
  { provider: 'Oracle', name: 'VM.Standard.E4.Flex 4OCPU', vcpus: 4, ram_gb: 32, price_monthly_usd: 73.00,price_hourly_usd: 0.10,   notes: 'AMD' },
]

export async function fetchOracleCompute(): Promise<ComputeInstance[]> { return ORACLE }
export async function fetchOracleStorage(): Promise<StoragePrice[]> {
  return [
    { provider: 'Oracle', tier: 'Object Storage Standard', price_per_gb_month_usd: 0.0255 },
    { provider: 'Oracle', tier: 'Block Volume',            price_per_gb_month_usd: 0.0255 },
  ]
}
export async function fetchOracleEgress(): Promise<EgressPrice[]> {
  return [{ provider: 'Oracle', price_per_gb_usd: 0.0085, free_tier_gb: 10000, notes: '10TB/mo free, then $0.0085/GB — competitive with hyperscalers' }]
}
export const ORACLE_LAST_UPDATED = '2026-05-02'
