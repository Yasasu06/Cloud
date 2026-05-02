import type { ComputeInstance, EgressPrice, StoragePrice } from './types'

interface ApiResponse {
  provider: string
  region: string
  source: 'live-api'
  fetched_at: string
  instances: Array<{ name: string; vcpus: number; ram_gb: number; price_hourly_usd: number; price_monthly_usd: number }>
}

let cached: { data: ComputeInstance[]; fetched: number } | null = null

export async function fetchAWSCompute(): Promise<ComputeInstance[]> {
  if (cached && Date.now() - cached.fetched < 1000 * 60 * 60) return cached.data
  try {
    const res = await fetch('/api/pricing/aws')
    if (!res.ok) throw new Error(`status ${res.status}`)
    const json = (await res.json()) as ApiResponse
    const data: ComputeInstance[] = json.instances.map(i => ({
      provider: 'AWS',
      name: i.name,
      vcpus: i.vcpus,
      ram_gb: i.ram_gb,
      price_monthly_usd: i.price_monthly_usd,
      price_hourly_usd: i.price_hourly_usd,
      region: json.region,
    }))
    cached = { data, fetched: Date.now() }
    return data
  } catch {
    return AWS_FALLBACK
  }
}

// Fallback used when API fails — verified 2026-05-02 against AWS published pricing
const AWS_FALLBACK: ComputeInstance[] = [
  { provider: 'AWS', name: 't3.micro',  vcpus: 2,  ram_gb: 1,   price_monthly_usd: 7.59,  price_hourly_usd: 0.0104, region: 'us-east-1' },
  { provider: 'AWS', name: 't3.small',  vcpus: 2,  ram_gb: 2,   price_monthly_usd: 15.18, price_hourly_usd: 0.0208, region: 'us-east-1' },
  { provider: 'AWS', name: 't3.medium', vcpus: 2,  ram_gb: 4,   price_monthly_usd: 30.37, price_hourly_usd: 0.0416, region: 'us-east-1' },
  { provider: 'AWS', name: 't3.large',  vcpus: 2,  ram_gb: 8,   price_monthly_usd: 60.74, price_hourly_usd: 0.0832, region: 'us-east-1' },
  { provider: 'AWS', name: 'm5.large',  vcpus: 2,  ram_gb: 8,   price_monthly_usd: 70.08, price_hourly_usd: 0.096,  region: 'us-east-1' },
  { provider: 'AWS', name: 'm5.xlarge', vcpus: 4,  ram_gb: 16,  price_monthly_usd: 140.16,price_hourly_usd: 0.192,  region: 'us-east-1' },
  { provider: 'AWS', name: 'c5.large',  vcpus: 2,  ram_gb: 4,   price_monthly_usd: 62.05, price_hourly_usd: 0.085,  region: 'us-east-1' },
  { provider: 'AWS', name: 'c5.xlarge', vcpus: 4,  ram_gb: 8,   price_monthly_usd: 124.10,price_hourly_usd: 0.17,   region: 'us-east-1' },
  { provider: 'AWS', name: 'r5.large',  vcpus: 2,  ram_gb: 16,  price_monthly_usd: 91.98, price_hourly_usd: 0.126,  region: 'us-east-1' },
]

export async function fetchAWSStorage(): Promise<StoragePrice[]> {
  return [
    { provider: 'AWS', tier: 'S3 Standard',           price_per_gb_month_usd: 0.023, notes: 'First 50TB/mo' },
    { provider: 'AWS', tier: 'S3 Standard-IA',        price_per_gb_month_usd: 0.0125, notes: '+ retrieval fees' },
    { provider: 'AWS', tier: 'S3 Glacier Instant',    price_per_gb_month_usd: 0.004,  notes: 'Archive, instant access' },
    { provider: 'AWS', tier: 'EBS gp3',               price_per_gb_month_usd: 0.08,   notes: 'General purpose SSD' },
  ]
}

export async function fetchAWSEgress(): Promise<EgressPrice[]> {
  return [{ provider: 'AWS', price_per_gb_usd: 0.09, free_tier_gb: 100, notes: 'First 100GB/mo free, then $0.09/GB to 10TB' }]
}

export const AWS_LAST_UPDATED = '2026-05-02'
