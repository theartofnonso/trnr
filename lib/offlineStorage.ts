import { Conversation } from './types/conversation'

const STORAGE_KEY = 'trnr_unsynced_conversations'

export interface StoredConversation {
  id: string
  conversation: Conversation
  timestamp: number
}

export function saveConversationOffline(conversation: Conversation, id?: string): string {
  const sessionId = id || crypto.randomUUID()
  const stored = getUnsyncedConversations().filter(s => s.id !== sessionId)
  
  stored.push({
    id: sessionId,
    conversation,
    timestamp: Date.now(),
  })

  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  return sessionId
}

export function getUnsyncedConversations(): StoredConversation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function removeSyncedConversation(id: string): void {
  const stored = getUnsyncedConversations()
  const filtered = stored.filter(s => s.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}