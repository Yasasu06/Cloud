import test from 'node:test'
import assert from 'node:assert/strict'
import { parseBill, UnsupportedBillError, buildAnalysisPrompt } from '../lib/billParsers.ts'

test('AWS billing CSV computes total and service shares from rows', () => {
  const csv = `lineItem/UnblendedCost,lineItem/ProductCode,lineItem/UsageStartDate
100,AmazonEC2,2026-09-01
50,AmazonEC2,2026-09-02
50,AmazonS3,2026-09-02
0,AmazonS3,2026-09-02`
  const bill = parseBill(csv)
  assert.equal(bill.summary.providerKey, 'aws')
  assert.equal(bill.summary.rowsParsed, 3)
  assert.equal(bill.summary.rowsSkipped, 1)
  assert.equal(bill.grandTotal, 200)
  assert.deepEqual(bill.byService.map(({ service, total, pct }) => [service, total, pct]), [
    ['AmazonEC2', 150, 75], ['AmazonS3', 50, 25],
  ])
  const prompt = buildAnalysisPrompt(bill)
  assert.match(prompt, /AmazonEC2: USD 150\.00 \(75\.0%\)/)
  assert.doesNotMatch(prompt, /lineItem\/UsageStartDate/)
})

test('Azure profile detects quoted service names', () => {
  const bill = parseBill('MeterCategory,CostInBillingCurrency,Date\n"Virtual Machines",12.50,2026-09-01')
  assert.equal(bill.summary.providerKey, 'azure')
  assert.equal(bill.byService[0].service, 'Virtual Machines')
  assert.equal(bill.grandTotal, 12.5)
})

test('generic cost table is marked low confidence and unsupported input fails', () => {
  const generic = parseBill('Service,Amount\nCompute,4.25')
  assert.equal(generic.summary.providerKey, 'generic')
  assert.equal(generic.summary.confidence, 'low')
  assert.throws(() => parseBill('unknown,value\na,b'), UnsupportedBillError)
})
