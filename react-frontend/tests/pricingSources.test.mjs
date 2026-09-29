import test from 'node:test'
import assert from 'node:assert/strict'
import { fetchAWSCompute } from '../lib/pricing/aws.ts'
import { fetchAzureCompute } from '../lib/pricing/azure.ts'
import { fetchGCPCompute } from '../lib/pricing/gcp.ts'

test('failed AWS and Azure requests return explicitly labeled fallback prices', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => { throw new Error('offline') }
  try {
    const aws = await fetchAWSCompute()
    const azure = await fetchAzureCompute()
    assert.ok(aws.length > 0)
    assert.ok(azure.length > 0)
    assert.ok(aws.every(item => item.price_source === 'fallback'))
    assert.ok(azure.every(item => item.price_source === 'fallback'))
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('GCP compute returns bundled reference prices without a catalog key', async () => {
  const gcp = await fetchGCPCompute()
  assert.ok(gcp.length > 0)
  assert.equal(gcp[0].provider, 'GCP')
  assert.equal(gcp[0].price_monthly_usd, 6.11)
})
