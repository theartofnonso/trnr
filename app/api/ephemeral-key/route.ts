import { NextRequest, NextResponse } from "next/server"

/**
 * Generate an ephemeral client key for OpenAI Realtime API (WebRTC connection)
 *
 * Docs:
 * https://api.openai.com/v1/realtime
 * https://openai.github.io/openai-agents-js/guides/voice-agents/quickstart/
 */

// Force dynamic rendering to prevent caching
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

    // ✅ Correct endpoint for ephemeral client keys
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
      throw new Error(error.error?.message || "Failed to create Realtime session")
    }

    const data = await response.json()

    return NextResponse.json({ ephemeralKey: data.value })
  } catch (error: any) {
    console.error("Error generating ephemeral session:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create Realtime session" },
      { status: 500 }
    )
  }
}