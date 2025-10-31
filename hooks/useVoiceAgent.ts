'use client'

import { useState, useEffect, useRef } from 'react'
import { RealtimeAgent, RealtimeSession, RealtimeItem } from '@openai/agents/realtime'
import { personalTrainerPrompt } from '@/config/personalTrainerPrompt'

/**
 * Convert conversation history items to an array format for API
 */
function formatConversationHistory(history: RealtimeItem[]) {
  return history
    .map((item) => {
      const role = (item as any).role || 'unknown'
      const content = (item as any).content

      if (!Array.isArray(content)) return null

      // Extract transcript from content items array
      const transcript = content
        .map((contentItem: any) => contentItem.transcript)
        .filter(Boolean)
        .join(' ')

      if (!transcript) return null

      return { role, transcript }
    })
    .filter((item) => item !== null)
}

/**
 * Extract and post exercises to the API
 */
async function extractAndPostExercises(history: RealtimeItem[]) {
  if (history.length === 0) return

  try {
    const conversation = formatConversationHistory(history)
    await fetch('/api/extract-exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation }),
    })
  } catch (err) {
    console.error('Error extracting exercises:', err)
  }
}

export function useVoiceAgent() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const conversationHistoryRef = useRef<RealtimeItem[]>([])
  const sessionRef = useRef<RealtimeSession | null>(null)

  const connect = async () => {
    if (isConnected || sessionRef.current || isConnecting) return

    setError(null)
    setIsConnecting(true)

    try {
      // Get ephemeral key from backend (required for WebRTC in browser)
      const response = await fetch('/api/ephemeral-key', {
        cache: 'no-store',
      })
      if (!response.ok) {
        throw new Error('Failed to get ephemeral key')
      }

      const { ephemeralKey } = await response.json()
      if (!ephemeralKey) {
        throw new Error('No ephemeral key received')
      }

      const agent = new RealtimeAgent({
        name: 'PersonalTrainer',
        instructions: personalTrainerPrompt,
      })

      const session = new RealtimeSession(agent, { model: 'gpt-realtime' })
      sessionRef.current = session

      // Listen for conversation history updates
      session.on('history_updated', (history: RealtimeItem[]) => {
        conversationHistoryRef.current = history
      })

      const handleSessionEnd = async () => {
        setIsConnected(false)
        await extractAndPostExercises(conversationHistoryRef.current)
      }

      session.transport.on('disconnect', handleSessionEnd)
      session.transport.on('error', (err: any) => {
        setError(err?.message || 'Session error')
        handleSessionEnd()
      })

      await session.connect({ apiKey: ephemeralKey })
      setIsConnected(true)
      setIsConnecting(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect')
      setIsConnecting(false)
      try {
        sessionRef.current?.close()
      } catch (err) {
        console.error('Error closing session:', err)
        // Ignore cleanup errors
      }
      sessionRef.current = null
    }
  }

  const disconnect = async () => {
    const history = conversationHistoryRef.current

    try {
      sessionRef.current?.close()
    } catch {
      // Ignore cleanup errors
    }

    sessionRef.current = null
    setIsConnected(false)
    setError(null)

    // Extract and post exercises before resetting history
    await extractAndPostExercises(history)

    conversationHistoryRef.current = []
  }

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      try {
        sessionRef.current?.close()
      } catch {
        // Ignore cleanup errors
      }
    }
  }, [])

  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
  }
}

