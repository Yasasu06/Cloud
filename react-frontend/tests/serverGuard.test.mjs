import test from 'node:test'
import assert from 'node:assert/strict'
import { readJsonBody, rateLimited } from '../lib/serverGuard.ts'

test('request body size is enforced even without Content-Length', async () => {
  const request = new Request('https://example.test/api', { method: 'POST', body: JSON.stringify({ text: 'x'.repeat(100) }) })
  await assert.rejects(readJsonBody(request, 50), /too large/)
})

test('rate limiter rejects calls after the configured per-IP allowance', () => {
  const request = new Request('https://example.test/api', { headers: { 'x-forwarded-for': '192.0.2.55' } })
  assert.equal(rateLimited(request, 'test-isolated', 2), false)
  assert.equal(rateLimited(request, 'test-isolated', 2), false)
  assert.equal(rateLimited(request, 'test-isolated', 2), true)
})
