import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { type, email, userName, wasteAmount, items } = await req.json()

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email service not configured' }, { status: 503 })
  }

  if (type === 'waste_report') {
    const { sendWasteReport } = await import('@/lib/emailService')
    const result = await sendWasteReport(email, userName, wasteAmount, items)
    return NextResponse.json(result)
  }

  if (type === 'welcome') {
    const { sendWelcomeEmail } = await import('@/lib/emailService')
    await sendWelcomeEmail(email)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
}
