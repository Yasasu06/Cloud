import { NextRequest, NextResponse } from 'next/server'
import { authenticatedUser, rateLimited } from '@/lib/serverGuard'

// There is no subscription entitlement or fulfillment flow in this demo.
// Keep the endpoint closed even when Stripe environment variables are present.
export async function POST(req: NextRequest) {
  const user = await authenticatedUser(req)
  if (!user) return NextResponse.json({ error: 'Sign in before checkout.' }, { status: 401 })
  if (rateLimited(req, 'checkout', 6, 60 * 60_000)) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  return NextResponse.json({ error: 'Paid checkout is not available in this demo.' }, { status: 503 })
}
