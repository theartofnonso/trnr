import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(_req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      )
    }

    const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model: 'gpt-realtime',
        }
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      console.error('[API] OpenAI error:', error)
      throw new Error(error.error?.message || 'Failed to create session')
    }

    const data = await response.json()
    console.log('[API] Ephemeral key generated')
    return NextResponse.json({ ephemeralKey: data.value })
  } catch (error: any) {
    console.error('[API] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get key' }, { status: 500 })
  }
}