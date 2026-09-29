export interface ComputeInstance {
  provider: string
  name: string
  vcpus: number
  ram_gb: number
  storage_gb?: number
  price_monthly_usd: number
  price_hourly_usd?: number
  region?: string
  notes?: string
  price_source?: 'live' | 'fallback' | 'static'
}

export interface StoragePrice {
  provider: string
  tier: string
  price_per_gb_month_usd: number
  notes?: string
}

export interface EgressPrice {
  provider: string
  price_per_gb_usd: number
  free_tier_gb?: number
  notes?: string
}

export interface DatabasePrice {
  provider: string
  name: string
  vcpus: number
  ram_gb: number
  storage_gb: number
  price_monthly_usd: number
  notes?: string
}

export interface PricingProvider {
  fetchCompute: () => Promise<ComputeInstance[]>
  fetchStorage?: () => Promise<StoragePrice[]>
  fetchEgress?: () => Promise<EgressPrice[]>
  fetchDatabase?: () => Promise<DatabasePrice[]>
  source: 'live-api' | 'hardcoded'
  lastUpdated: string  // ISO date for hardcoded; runtime for live
  providerName: string
}
