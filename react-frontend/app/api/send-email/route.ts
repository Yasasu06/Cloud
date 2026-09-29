import { NextRequest, NextResponse } from 'next/server'
import { authenticatedUser, rateLimited, readJsonBody } from '@/lib/serverGuard'

export async function POST(req: NextRequest) {
  const user = await authenticatedUser(req)
  if (!user?.email) return NextResponse.json({ error: 'Sign in to email a report.' }, { status: 401 })
  if (rateLimited(req, 'send-email', 3, 60 * 60_000)) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: 'Email service not configured.' }, { status: 503 })

  let input: unknown
  try { input = await readJsonBody(req, 8_000) }
  catch (error) { return NextResponse.json({ error: (error as Error).message }, { status: 400 }) }
  if (!input || typeof input !== 'object') return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  const body = input as Record<string, unknown>
  if (body.type !== 'waste_report' || body.email !== user.email ||
      typeof body.wasteAmount !== 'number' || !Number.isFinite(body.wasteAmount) ||
      body.wasteAmount < 0 || body.wasteAmount > 1_000_000_000 ||
      typeof body.userName !== 'string' || body.userName.length > 100 ||
      !Array.isArray(body.items) || body.items.length > 10 ||
      !body.items.every(item => typeof item === 'string' && item.length <= 300)) {
    return NextResponse.json({ error: 'Invalid report data.' }, { status: 400 })
  }
  try {
    const { sendWasteReport } = await import('@/lib/emailService')
    const result = await sendWasteReport(user.email, body.userName, body.wasteAmount, body.items)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Email delivery failed.' }, { status: 502 })
  }
}
