import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 86400 // 24 hours runtime cache

const COMMON_INSTANCES = [
  't3.micro', 't3.small', 't3.medium', 't3.large', 't3.xlarge',
  't4g.small', 't4g.medium', 't4g.large',
  'm5.large', 'm5.xlarge', 'm5.2xlarge',
  'm6i.large', 'm6i.xlarge',
  'c5.large', 'c5.xlarge', 'c5.2xlarge',
  'c6i.large', 'c6i.xlarge',
  'r5.large', 'r5.xlarge',
]

interface PriceDimension {
  pricePerUnit?: { USD?: string }
  unit?: string
}
interface AwsTerm {
  priceDimensions?: Record<string, PriceDimension>
}
interface AwsProduct {
  attributes?: {
    instanceType?: string
    operatingSystem?: string
    tenancy?: string
    preInstalledSw?: string
    capacitystatus?: string
    vcpu?: string
    memory?: string
    location?: string
  }
}

export async function GET() {
  try {
    // Use the smaller per-region index for us-east-1
    const res = await fetch(
      'https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/us-east-1/index.json',
      { next: { revalidate: 86400 } },
    )
    if (!res.ok) {
      return NextResponse.json({ error: 'AWS pricing fetch failed', status: res.status }, { status: 502 })
    }
    const data = await res.json() as { products: Record<string, AwsProduct>; terms: { OnDemand: Record<string, Record<string, AwsTerm>> } }

    // Filter to On-Demand Linux pricing for common instance types
    const out: Array<{ name: string; vcpus: number; ram_gb: number; price_hourly_usd: number; price_monthly_usd: number }> = []
    const seen = new Set<string>()

    for (const [sku, product] of Object.entries(data.products)) {
      const a = product.attributes
      if (!a) continue
      if (a.tenancy !== 'Shared') continue
      if (a.operatingSystem !== 'Linux') continue
      if (a.preInstalledSw !== 'NA') continue
      if (a.capacitystatus !== 'Used') continue
      if (!a.instanceType) continue
      if (!COMMON_INSTANCES.includes(a.instanceType)) continue
      if (seen.has(a.instanceType)) continue

      const onDemand = data.terms.OnDemand?.[sku]
      if (!onDemand) continue
      const term = Object.values(onDemand)[0]
      if (!term?.priceDimensions) continue
      const dim = Object.values(term.priceDimensions)[0]
      const usd = parseFloat(dim?.pricePerUnit?.USD ?? '0')
      if (!usd || usd <= 0) continue

      const vcpus = parseInt(a.vcpu ?? '0', 10)
      const ramMatch = a.memory?.match(/(\d+(?:\.\d+)?)/)
      const ram = ramMatch ? parseFloat(ramMatch[1]) : 0

      out.push({
        name: a.instanceType,
        vcpus,
        ram_gb: ram,
        price_hourly_usd: usd,
        price_monthly_usd: Math.round(usd * 730 * 100) / 100,
      })
      seen.add(a.instanceType)
    }

    return NextResponse.json({
      provider: 'AWS',
      region: 'us-east-1',
      source: 'live-api',
      fetched_at: new Date().toISOString(),
      instances: out.sort((a, b) => a.price_monthly_usd - b.price_monthly_usd),
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'unknown' }, { status: 500 })
  }
}
