import { NextRequest, NextResponse } from 'next/server'

/**
 * Generate an ephemeral client key for Realtime API WebRTC connection
 * 
 * Reference: https://openai.github.io/openai-agents-js/guides/voice-agents/quickstart/
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model: 'gpt-realtime',
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to generate ephemeral key')
    }

    const data = await response.json()
    
    // Return the ephemeral key (starts with "ek_")
    return NextResponse.json({ ephemeralKey: data.value })
  } catch (error: any) {
    console.error('Error generating ephemeral key:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate ephemeral key' },
      { status: 500 }
    )
  }
}

