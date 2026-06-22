import { NextRequest, NextResponse } from 'next/server'

// Server-side FinOps bill analysis. The Groq API key lives ONLY here — it is
// never sent to the browser, so it can't be read from DevTools / network tab.
//
// Prefers the server-only GROQ_API_KEY. Falls back to the legacy
// NEXT_PUBLIC_GROQ_API_KEY so the feature keeps working before env is migrated,
// but you should set GROQ_API_KEY (no NEXT_PUBLIC_ prefix) in production.

export const dynamic = 'force-dynamic'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const SYSTEM_PROMPT =
  'You are a FinOps expert. Analyze cloud bills in plain English for non-technical founders. Be specific about dollar amounts and exact actions.'

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Bill analysis is not configured. Set GROQ_API_KEY in the server environment.' },
      { status: 503 },
    )
  }

  let content: unknown
  try {
    content = (await req.json())?.content
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }
  if (typeof content !== 'string' || !content.trim()) {
    return NextResponse.json({ error: 'Missing "content" — nothing to analyze.' }, { status: 400 })
  }

  let upstream: Response
  try {
    upstream = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1500,
        stream: true,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content },
        ],
      }),
    })
  } catch {
    return NextResponse.json({ error: 'Could not reach the analysis service.' }, { status: 502 })
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '')
    return NextResponse.json(
      { error: 'The analysis service returned an error.', status: upstream.status, detail: detail.slice(0, 300) },
      { status: 502 },
    )
  }

  // Proxy the SSE stream straight through — the client parses it unchanged.
  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
