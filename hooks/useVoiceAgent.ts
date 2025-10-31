'use client'

import { useState, useEffect, useRef } from 'react'
import { RealtimeAgent, RealtimeSession, RealtimeItem } from '@openai/agents/realtime'
import { personalTrainerPrompt } from '@/config/personalTrainerPrompt'
import { addMemoryToolDefinition, searchMemoriesToolDefinition, addMemoryTool, searchMemoriesTool } from '@/lib/tools/memoryTools'

function formatConversationHistory(history: RealtimeItem[]) {
  return history
    .map((item) => {
      const role = (item as any).role || 'unknown'
      const content = (item as any).content

      if (!Array.isArray(content)) return null

      const transcript = content
        .map((contentItem: any) => contentItem.transcript)
        .filter(Boolean)
        .join(' ')

      return transcript ? { role, transcript } : null
    })
    .filter((item): item is { role: string; transcript: string } => item !== null)
}

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

function closeSession(session: RealtimeSession | null) {
  if (!session) return
  try {
    session.close()
  } catch {
    // Ignore cleanup errors
  }
}

export function useVoiceAgent() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const conversationHistoryRef = useRef<RealtimeItem[]>([])
  const sessionRef = useRef<RealtimeSession | null>(null)

  const handleSessionEnd = async () => {
    setIsConnected(false)
    await extractAndPostExercises(conversationHistoryRef.current)
  }

  const connect = async () => {
    if (sessionRef.current || isConnecting) return

    setError(null)
    setIsConnecting(true)

    try {
      const response = await fetch('/api/ephemeral-key', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to get ephemeral key')

      const { ephemeralKey } = await response.json()
      if (!ephemeralKey) throw new Error('No ephemeral key received')

      const agent = new RealtimeAgent({
        name: 'PersonalTrainer',
        instructions: personalTrainerPrompt,
        tools: [
          { ...addMemoryToolDefinition, execute: addMemoryTool },
          { ...searchMemoriesToolDefinition, execute: searchMemoriesTool },
        ] as any,
      })

      const session = new RealtimeSession(agent, { model: 'gpt-realtime' })
      sessionRef.current = session

      session.on('history_updated', (history: RealtimeItem[]) => {
        conversationHistoryRef.current = history
      })

      session.transport.on('disconnect', handleSessionEnd)

      await session.connect({ apiKey: ephemeralKey })
      setIsConnected(true)
      setIsConnecting(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect')
      setIsConnecting(false)
      closeSession(sessionRef.current)
      sessionRef.current = null
    }
  }

  const disconnect = async () => {
    const history = conversationHistoryRef.current

    closeSession(sessionRef.current)
    sessionRef.current = null
    setIsConnected(false)
    setError(null)

    await extractAndPostExercises(history)
    conversationHistoryRef.current = []
  }

  useEffect(() => {
    return () => closeSession(sessionRef.current)
  }, [])

  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
  }
}

