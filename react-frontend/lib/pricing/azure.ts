import type { ComputeInstance, EgressPrice, StoragePrice } from './types'

const COMMON_AZURE = [
  'Standard_B1s', 'Standard_B2s', 'Standard_B2ms', 'Standard_B4ms',
  'Standard_D2s_v5', 'Standard_D4s_v5', 'Standard_D8s_v5',
  'Standard_F2s_v2', 'Standard_F4s_v2',
  'Standard_E2s_v5', 'Standard_E4s_v5',
]

interface AzureItem {
  armSkuName?: string
  retailPrice?: number
  type?: string
  productName?: string
  meterName?: string
  unitOfMeasure?: string
  priceType?: string
  serviceName?: string
}

let cached: { data: ComputeInstance[]; fetched: number } | null = null

export async function fetchAzureCompute(): Promise<ComputeInstance[]> {
  if (cached && Date.now() - cached.fetched < 1000 * 60 * 60) return cached.data
  try {
    const filter = `serviceName eq 'Virtual Machines' and armRegionName eq 'eastus' and priceType eq 'Consumption'`
    const url = `https://prices.azure.com/api/retail/prices?$filter=${encodeURIComponent(filter)}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`status ${res.status}`)
    const json = (await res.json()) as { Items: AzureItem[] }
    const seen = new Set<string>()
    const data: ComputeInstance[] = []
    for (const item of json.Items) {
      if (!item.armSkuName) continue
      if (!COMMON_AZURE.includes(item.armSkuName)) continue
      if (item.type !== 'Consumption') continue
      // Skip Windows / Spot / Low Priority
      if (item.productName?.includes('Windows')) continue
      if (item.meterName?.includes('Low Priority') || item.meterName?.includes('Spot')) continue
      if (seen.has(item.armSkuName)) continue
      const hourly = item.retailPrice ?? 0
      if (hourly <= 0) continue
      data.push({
        provider: 'Azure',
        name: item.armSkuName,
        vcpus: SKU_SPECS[item.armSkuName]?.vcpus ?? 0,
        ram_gb: SKU_SPECS[item.armSkuName]?.ram ?? 0,
        price_hourly_usd: hourly,
        price_monthly_usd: Math.round(hourly * 730 * 100) / 100,
        region: 'eastus',
      })
      seen.add(item.armSkuName)
    }
    if (data.length === 0) return AZURE_FALLBACK
    cached = { data: data.sort((a, b) => a.price_monthly_usd - b.price_monthly_usd), fetched: Date.now() }
    return cached.data
  } catch {
    return AZURE_FALLBACK
  }
}

const SKU_SPECS: Record<string, { vcpus: number; ram: number }> = {
  Standard_B1s:    { vcpus: 1, ram: 1 },
  Standard_B2s:    { vcpus: 2, ram: 4 },
  Standard_B2ms:   { vcpus: 2, ram: 8 },
  Standard_B4ms:   { vcpus: 4, ram: 16 },
  Standard_D2s_v5: { vcpus: 2, ram: 8 },
  Standard_D4s_v5: { vcpus: 4, ram: 16 },
  Standard_D8s_v5: { vcpus: 8, ram: 32 },
  Standard_F2s_v2: { vcpus: 2, ram: 4 },
  Standard_F4s_v2: { vcpus: 4, ram: 8 },
  Standard_E2s_v5: { vcpus: 2, ram: 16 },
  Standard_E4s_v5: { vcpus: 4, ram: 32 },
}

const AZURE_FALLBACK: ComputeInstance[] = [
  { provider: 'Azure', name: 'Standard_B1s',    vcpus: 1, ram_gb: 1,  price_monthly_usd: 7.59,   price_hourly_usd: 0.0104, region: 'eastus' },
  { provider: 'Azure', name: 'Standard_B2s',    vcpus: 2, ram_gb: 4,  price_monthly_usd: 30.37,  price_hourly_usd: 0.0416, region: 'eastus' },
  { provider: 'Azure', name: 'Standard_D2s_v5', vcpus: 2, ram_gb: 8,  price_monthly_usd: 70.08,  price_hourly_usd: 0.096,  region: 'eastus' },
  { provider: 'Azure', name: 'Standard_D4s_v5', vcpus: 4, ram_gb: 16, price_monthly_usd: 140.16, price_hourly_usd: 0.192,  region: 'eastus' },
]

export async function fetchAzureStorage(): Promise<StoragePrice[]> {
  return [
    { provider: 'Azure', tier: 'Blob Hot LRS',  price_per_gb_month_usd: 0.0184, notes: 'Locally redundant' },
    { provider: 'Azure', tier: 'Blob Cool LRS', price_per_gb_month_usd: 0.01,   notes: '+ retrieval fees' },
    { provider: 'Azure', tier: 'Premium SSD',   price_per_gb_month_usd: 0.135 },
  ]
}

export async function fetchAzureEgress(): Promise<EgressPrice[]> {
  return [{ provider: 'Azure', price_per_gb_usd: 0.087, free_tier_gb: 100, notes: 'First 100GB/mo free, then $0.087/GB to 10TB' }]
}

export const AZURE_LAST_UPDATED = '2026-05-02'
