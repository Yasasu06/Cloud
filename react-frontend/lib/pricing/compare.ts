import type { ComputeInstance } from './types'
import { fetchAWSCompute, AWS_LAST_UPDATED } from './aws'
import { fetchAzureCompute, AZURE_LAST_UPDATED } from './azure'
import { fetchGCPCompute, GCP_LAST_UPDATED } from './gcp'
import { fetchDOCompute, DO_LAST_UPDATED } from './digitalocean'
import { fetchHetznerCompute, HETZNER_LAST_UPDATED } from './hetzner'
import { fetchLinodeCompute, LINODE_LAST_UPDATED } from './linode'
import { fetchVultrCompute, VULTR_LAST_UPDATED } from './vultr'
import { fetchCloudflareCompute, CLOUDFLARE_LAST_UPDATED } from './cloudflare'
import { fetchOracleCompute, ORACLE_LAST_UPDATED } from './oracle'
import { fetchRenderCompute, RENDER_LAST_UPDATED } from './render'
import { fetchRailwayCompute, RAILWAY_LAST_UPDATED } from './railway'
import { fetchFlyCompute, FLY_LAST_UPDATED } from './fly'

export const PROVIDER_LAST_UPDATED: Record<string, string> = {
  AWS: AWS_LAST_UPDATED,
  Azure: AZURE_LAST_UPDATED,
  GCP: GCP_LAST_UPDATED,
  DigitalOcean: DO_LAST_UPDATED,
  Hetzner: HETZNER_LAST_UPDATED,
  Linode: LINODE_LAST_UPDATED,
  Vultr: VULTR_LAST_UPDATED,
  Cloudflare: CLOUDFLARE_LAST_UPDATED,
  Oracle: ORACLE_LAST_UPDATED,
  Render: RENDER_LAST_UPDATED,
  Railway: RAILWAY_LAST_UPDATED,
  'Fly.io': FLY_LAST_UPDATED,
}

export const PROVIDER_SOURCE: Record<string, 'live-api' | 'hardcoded'> = {
  AWS: 'live-api',
  Azure: 'live-api',
  GCP: 'hardcoded',
  DigitalOcean: 'hardcoded',
  Hetzner: 'hardcoded',
  Linode: 'hardcoded',
  Vultr: 'hardcoded',
  Cloudflare: 'hardcoded',
  Oracle: 'hardcoded',
  Render: 'hardcoded',
  Railway: 'hardcoded',
  'Fly.io': 'hardcoded',
}

export interface CompareSpec {
  vcpus: number
  ram_gb: number
}

export interface ComparisonRow {
  provider: string
  instance: ComputeInstance
  closeness: number  // lower is better fit
  premium_vs_cheapest: number  // $/mo over cheapest
}

export async function fetchAllCompute(): Promise<ComputeInstance[]> {
  const results = await Promise.allSettled([
    fetchAWSCompute(),
    fetchAzureCompute(),
    fetchGCPCompute(),
    fetchDOCompute(),
    fetchHetznerCompute(),
    fetchLinodeCompute(),
    fetchVultrCompute(),
    fetchCloudflareCompute(),
    fetchOracleCompute(),
    fetchRenderCompute(),
    fetchRailwayCompute(),
    fetchFlyCompute(),
  ])
  return results.flatMap(r => r.status === 'fulfilled' ? r.value : [])
}

export async function compareCompute(spec: CompareSpec): Promise<ComparisonRow[]> {
  const all = await fetchAllCompute()

  // For each provider, pick the instance that best fits the spec (smallest size that meets requirements)
  const byProvider = new Map<string, ComputeInstance>()
  for (const inst of all) {
    if (inst.vcpus < spec.vcpus) continue
    if (inst.ram_gb < spec.ram_gb) continue
    const current = byProvider.get(inst.provider)
    if (!current || inst.price_monthly_usd < current.price_monthly_usd) {
      byProvider.set(inst.provider, inst)
    }
  }

  const matches = Array.from(byProvider.entries()).map(([provider, instance]) => ({
    provider,
    instance,
    closeness: (instance.vcpus - spec.vcpus) + (instance.ram_gb - spec.ram_gb) * 0.1,
    premium_vs_cheapest: 0,
  }))
  matches.sort((a, b) => a.instance.price_monthly_usd - b.instance.price_monthly_usd)

  if (matches.length > 0) {
    const cheapest = matches[0].instance.price_monthly_usd
    matches.forEach(m => { m.premium_vs_cheapest = Math.round((m.instance.price_monthly_usd - cheapest) * 100) / 100 })
  }

  return matches
}
