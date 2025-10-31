'use client'

import { useState, useEffect, useRef } from 'react'
import { RealtimeAgent, RealtimeSession, RealtimeItem } from '@openai/agents/realtime'
import { personalTrainerPrompt } from '@/config/personalTrainerPrompt'
import { Conversation, ConversationMessage } from '@/lib/types/conversation'

const DEFAULT_USER_ID = 'default_user_id'

function getLastWeekDateRange(): { gte: string; lte: string } {
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  return {
    gte: oneWeekAgo.toISOString(),
    lte: now.toISOString(),
  }
}

function formatConversationHistory(history: RealtimeItem[]): Conversation {
  return history
    .map((item) => {
      const role = (item as any).role || 'unknown'
      const content = (item as any).content

      if (!Array.isArray(content)) return null

      const text = content
        .map((contentItem: any) => contentItem.transcript)
        .filter(Boolean)
        .join(' ')

      if (!text) return null

      // Ensure role is 'user' or 'assistant'
      const validRole = role === 'user' || role === 'assistant' ? role : 'user'

      return { role: validRole, content: text } as ConversationMessage
    })
    .filter((item): item is ConversationMessage => item !== null)
}

async function extractAndPostExercises(history: RealtimeItem[]) {
  if (history.length === 0) return

  try {
    const conversation = formatConversationHistory(history)
    console.log('[VoiceAgent] Extracting exercises and saving session', { messageCount: conversation.length })

    // Extract exercises and save to Supabase
    await fetch('/api/extract-exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation }),
    })
    console.log('[VoiceAgent] Exercises extracted and saved to Supabase')

    // Also save full conversation to mem0 as fallback via API
    try {
      const mem0Response = await fetch('/api/mem0/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation,
          userId: DEFAULT_USER_ID,
        }),
      })

      if (mem0Response.ok) {
        console.log('[VoiceAgent] Full conversation saved to Mem0')
      } else {
        console.error('[VoiceAgent] Failed to save conversation to Mem0')
      }
    } catch (err) {
      console.error('[VoiceAgent] Error saving conversation to Mem0:', err)
    }
  } catch (err) {
    console.error('[VoiceAgent] Error extracting exercises:', err)
  }
}

async function loadLastWeekMemories(): Promise<string> {
  try {
    const dateRange = getLastWeekDateRange()
    console.log('[VoiceAgent] Loading last week memories from Mem0', { dateRange })

    // Search for workout-related memories from last week via API
    const response = await fetch('/api/mem0/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'workout training exercise session fitness goals preferences',
        userId: DEFAULT_USER_ID,
        dateFilter: dateRange,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to search memories')
    }

    const { results } = await response.json()
    console.log('[VoiceAgent] Mem0 search complete', { memoryCount: results.length })

    if (results.length === 0) return ''

    return results
      .map((result: { memory: string }) => result.memory)
      .join('\n\n')
  } catch (err) {
    console.error('[VoiceAgent] Error loading last week memories:', err)
    return ''
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
    console.log('[VoiceAgent] Session ended (transport disconnect)')
    setIsConnected(false)
    await extractAndPostExercises(conversationHistoryRef.current)
  }

  const connect = async () => {
    if (sessionRef.current || isConnecting) return

    setError(null)
    setIsConnecting(true)

    try {
      // Load last week's memories for context
      const lastWeekContext = await loadLastWeekMemories()
      const enhancedInstructions = lastWeekContext
        ? `${personalTrainerPrompt}\n\n---\n\n## User Context (Last Week's Training)\n${lastWeekContext}\n\n**IMPORTANT:** Use this context ONLY to personalize your fitness coaching. Reference past workouts, preferences, or goals when relevant. DO NOT use this context to discuss topics outside of fitness and training. Stay focused on your role as a personal trainer.`
        : personalTrainerPrompt

      console.log('[VoiceAgent] Requesting ephemeral key from OpenAI')
      const response = await fetch('/api/ephemeral-key', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to get ephemeral key')

      const { ephemeralKey } = await response.json()
      if (!ephemeralKey) throw new Error('No ephemeral key received')

      const agent = new RealtimeAgent({
        name: 'PersonalTrainer',
        instructions: enhancedInstructions,
      })

      const session = new RealtimeSession(agent, { model: 'gpt-realtime' })
      sessionRef.current = session

      session.on('history_updated', (history: RealtimeItem[]) => {
        conversationHistoryRef.current = history
      })

      session.transport.on('disconnect', handleSessionEnd)

      console.log('[VoiceAgent] Connecting to OpenAI Realtime API')
      await session.connect({ apiKey: ephemeralKey })
      console.log('[VoiceAgent] Connected to OpenAI Realtime API')
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
    console.log('[VoiceAgent] Manual disconnect initiated')
    const history = conversationHistoryRef.current

    closeSession(sessionRef.current)
    sessionRef.current = null
    setIsConnected(false)
    setError(null)

    await extractAndPostExercises(history)
    conversationHistoryRef.current = []
    console.log('[VoiceAgent] Disconnect complete')
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

