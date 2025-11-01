'use client'

import { useState, useEffect, useRef } from 'react'
import { RealtimeAgent, RealtimeSession, RealtimeItem } from '@openai/agents/realtime'
import { personalTrainerPrompt } from '@/config/personalTrainerPrompt'
import { Conversation, ConversationMessage } from '@/lib/types/conversation'
import { saveConversationOffline } from '@/lib/offlineStorage'

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

async function saveAndSyncSession(history: RealtimeItem[], sessionId: string | null, userId: string) {
  if (history.length === 0) return

  const conversation = formatConversationHistory(history)
  
  // Don't save or sync if conversation is empty after formatting
  if (conversation.length === 0) {
    console.log('[VoiceAgent] Skipping save - no valid conversation data')
    return
  }
  
  saveConversationOffline(conversation, sessionId || undefined)

  if (!navigator.onLine) return

  try {
    await Promise.all([
      fetch('/api/extract-exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation }),
      }),
      fetch('/api/mem0/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation, userId }),
      })
    ])
  } catch (err) {
    console.error('[VoiceAgent] Sync failed:', err)
  }
}

async function loadLastWeekMemories(userId: string): Promise<string> {
  try {
    const response = await fetch('/api/mem0/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'workout training exercise session fitness goals preferences',
        userId,
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

export function useVoiceAgent(userId: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const conversationHistoryRef = useRef<RealtimeItem[]>([])
  const sessionRef = useRef<RealtimeSession | null>(null)
  const currentSessionIdRef = useRef<string | null>(null)

  const handleSessionEnd = async () => {
    setIsConnected(false)
    await saveAndSyncSession(conversationHistoryRef.current, currentSessionIdRef.current, userId)
    currentSessionIdRef.current = null
  }

  const connect = async () => {
    if (sessionRef.current || isConnecting) return

    setError(null)
    setIsConnecting(true)

  try {
      const lastWeekContext = await loadLastWeekMemories(userId)
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

      // Generate session ID for this conversation
      currentSessionIdRef.current = crypto.randomUUID()

      session.on('history_updated', (history: RealtimeItem[]) => {
        conversationHistoryRef.current = history
        
        // Save to localStorage on every update for real-time backup
        const conversation = formatConversationHistory(history)
        
        // Only save if we have valid conversation data
        if (conversation.length > 0 && conversation.every(msg => msg.content.trim().length > 0)) {
          saveConversationOffline(conversation, currentSessionIdRef.current!)
        }
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
    const sessionId = currentSessionIdRef.current

    closeSession(sessionRef.current)
    sessionRef.current = null
    setIsConnected(false)
    setIsMuted(false)
    setError(null)

    await saveAndSyncSession(history, sessionId, userId)
    conversationHistoryRef.current = []
    currentSessionIdRef.current = null
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

