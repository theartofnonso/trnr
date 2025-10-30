'use client'

import { useState, useEffect, useRef } from 'react'
import { RealtimeAgent, RealtimeSession, RealtimeItem } from '@openai/agents/realtime'
import { personalTrainerPrompt } from '@/config/personalTrainerPrompt'

export function useVoiceAgent() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationHistory, setConversationHistory] = useState<RealtimeItem[]>([])
  const sessionRef = useRef<RealtimeSession | null>(null)

  const connect = async () => {
    if (isConnected || sessionRef.current || isConnecting) return

    setError(null)
    setIsConnecting(true)

    try {
      // Get ephemeral key from backend (required for WebRTC in browser)
      const response = await fetch('/api/ephemeral-key')
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

      session.transport.on('disconnect', () => setIsConnected(false))
      session.transport.on('error', (err: any) => {
        setError(err?.message || 'Session error')
        setIsConnected(false)
      })

      // Listen for conversation history updates
      session.on('history_updated', (history: RealtimeItem[]) => {
        setConversationHistory(history)
        console.log('Conversation updated:', history)
      })

      await session.connect({ apiKey: ephemeralKey })
      setIsConnected(true)
      setIsConnecting(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect')
      setIsConnecting(false)
      try {
        sessionRef.current?.close()
      } catch(err) {
        console.error('Error closing session:', err)
        // Ignore cleanup errors
      }
      sessionRef.current = null
    }
  }

  const disconnect = async () => {
    try {
      sessionRef.current?.close()
    } catch {
      // Ignore cleanup errors
    }
    sessionRef.current = null
    setIsConnected(false)
    setError(null)
  }

  const getConversationHistory = () => {
    return conversationHistory
  }

  const clearConversationHistory = () => {
    setConversationHistory([])
    if (sessionRef.current) {
      sessionRef.current.updateHistory([])
    }
  }

  useEffect(() => {
    return () => {
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
    conversationHistory,
    connect, 
    disconnect, 
    getConversationHistory,
    clearConversationHistory
  }
}

