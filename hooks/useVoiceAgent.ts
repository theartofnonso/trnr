'use client'

import { useState, useEffect, useRef } from 'react'
import { RealtimeAgent, RealtimeSession, RealtimeItem } from '@openai/agents/realtime'
import { personalTrainerPrompt } from '@/config/personalTrainerPrompt'
import { Conversation, ConversationMessage } from '@/lib/types/conversation'
import { saveConversationOffline } from '@/lib/offlineStorage'

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

      const validRole = role === 'user' || role === 'assistant' ? role : 'user'
      return { role: validRole, content: text } as ConversationMessage
    })
    .filter((item): item is ConversationMessage => item !== null)
}

async function extractAndPostExercises(history: RealtimeItem[]) {
  if (history.length === 0) return

  const conversation = formatConversationHistory(history)
  
  // Save locally first
  await saveConversationOffline(conversation)
  console.log('[VoiceAgent] Session saved locally', { messageCount: conversation.length })

  if (!navigator.onLine) {
    console.log('[VoiceAgent] Offline - will sync later')
    return
  }

  // Attempt sync if online
  try {
    await fetch('/api/extract-exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation }),
    })
  } catch (err) {
    console.error('[VoiceAgent] Extract sync failed:', err)
  }

  try {
    await fetch('/api/mem0/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation, userId: DEFAULT_USER_ID }),
    })
  } catch (err) {
    console.error('[VoiceAgent] Mem0 sync failed:', err)
  }
}

async function loadLastWeekMemories(): Promise<string> {
  try {
    const response = await fetch('/api/mem0/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'workout training exercise session fitness goals preferences',
        userId: DEFAULT_USER_ID,
        dateFilter: getLastWeekDateRange(),
      }),
    })

    if (!response.ok) return ''

    const { results } = await response.json()
    if (!results?.length) return ''

    return results.map((r: { memory: string }) => r.memory).join('\n\n')
  } catch (err) {
    console.error('[VoiceAgent] Load memories failed:', err)
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
  const [isMuted, setIsMuted] = useState(false)
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
      const lastWeekContext = await loadLastWeekMemories()
      const instructions = lastWeekContext
        ? `${personalTrainerPrompt}\n\n---\n\n## Recent Context\n${lastWeekContext}`
        : personalTrainerPrompt

      const response = await fetch('/api/ephemeral-key', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to get ephemeral key')

      const { ephemeralKey } = await response.json()
      if (!ephemeralKey) throw new Error('No ephemeral key received')

      const agent = new RealtimeAgent({ name: 'PersonalTrainer', instructions })
      const session = new RealtimeSession(agent, { model: 'gpt-realtime' })
      sessionRef.current = session

      session.on('history_updated', (history: RealtimeItem[]) => {
        conversationHistoryRef.current = history
      })

      session.transport.on('disconnect', handleSessionEnd)

      await session.connect({ apiKey: ephemeralKey })
      setIsConnected(true)
      setIsConnecting(false)

      if (navigator.vibrate) {
        navigator.vibrate(200)
      }
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
    setIsMuted(false)
    setError(null)

    await extractAndPostExercises(history)
    conversationHistoryRef.current = []
  }

  const toggleMute = (muted: boolean) => {
    if (!sessionRef.current || !isConnected) return
    sessionRef.current.mute(muted)
    setIsMuted(muted)
  }

  useEffect(() => {
    return () => closeSession(sessionRef.current)
  }, [])

  return {
    isConnected,
    isConnecting,
    isMuted,
    error,
    connect,
    disconnect,
    toggleMute,
  }
}

