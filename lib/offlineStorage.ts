import { Conversation } from './types/conversation'

const DB_NAME = 'trnr-offline'
const DB_VERSION = 1
const CONVERSATIONS_STORE = 'conversations'

export interface StoredConversation {
  id: string
  conversation: Conversation
  timestamp: number
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(CONVERSATIONS_STORE)) {
        const conversationStore = db.createObjectStore(CONVERSATIONS_STORE, { keyPath: 'id' })
        conversationStore.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })
}

export async function saveConversationOffline(conversation: Conversation): Promise<string> {
  const db = await openDB()
  const id = crypto.randomUUID()
  
  const storedConversation: StoredConversation = {
    id,
    conversation,
    timestamp: Date.now(),
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CONVERSATIONS_STORE], 'readwrite')
    const store = transaction.objectStore(CONVERSATIONS_STORE)
    const request = store.add(storedConversation)

    request.onsuccess = () => resolve(id)
    request.onerror = () => reject(request.error)
  })
}

export async function getUnsyncedConversations(): Promise<StoredConversation[]> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CONVERSATIONS_STORE], 'readonly')
    const store = transaction.objectStore(CONVERSATIONS_STORE)
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function removeSyncedConversation(id: string): Promise<void> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CONVERSATIONS_STORE], 'readwrite')
    const store = transaction.objectStore(CONVERSATIONS_STORE)
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

