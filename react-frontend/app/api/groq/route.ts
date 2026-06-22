import { NextRequest, NextResponse } from 'next/server'

// Transparent server-side proxy for the Groq chat-completions API.
//
// Every client page that used to call api.groq.com directly now POSTs the exact
// same request body to /api/groq instead. The body is forwarded verbatim — same
// model, messages, temperature, max_tokens, streaming flag, response_format,
// etc. — so no page logic changes; only the API key moves server-side.
//
// The key lives ONLY here (GROQ_API_KEY), so it can no longer be read from the
// browser's DevTools / network tab. Falls back to the legacy
// NEXT_PUBLIC_GROQ_API_KEY so the app keeps working before env is migrated.

export const dynamic = 'force-dynamic'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI service is not configured. Set GROQ_API_KEY in the server environment.' },
      { status: 503 },
    )
  }

  let body: string
  try {
    body = JSON.stringify(await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  let upstream: Response
  try {
    upstream = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body,
    })
  } catch {
    return NextResponse.json({ error: 'Could not reach the AI service.' }, { status: 502 })
  }

  // Pass the upstream response straight through, preserving status and content
  // type. This works identically for streaming (SSE) and plain JSON responses,
  // so each page's existing response handling continues to work unchanged.
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
      'Cache-Control': 'no-cache, no-transform',
    },
  })
}
