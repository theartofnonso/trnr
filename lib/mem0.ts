import MemoryClient from 'mem0ai'
import { ConversationMessage } from './types/conversation'

const MEM0_API_KEY = process.env.MEM0_API_KEY
const mem0Client = MEM0_API_KEY ? new MemoryClient({ apiKey: MEM0_API_KEY }) : null

export interface Mem0SearchResult {
    memory: string
}

export async function addMemory(
    messages: ConversationMessage[],
    userId: string
): Promise<void> {
    if (!mem0Client) {
        console.warn('[Mem0] Client not available')
        return
    }

    if (messages.length === 0) return

    try {
        await mem0Client.add(messages, { user_id: userId })
        console.log('[Mem0] Memory added', { count: messages.length })
    } catch (error) {
        console.error('[Mem0] Add error:', error)
        throw error
    }
}

export interface Mem0DateFilter {
    gte?: string // Greater than or equal to (ISO date string)
    lte?: string // Less than or equal to (ISO date string)
}

export async function searchMemories(
    query: string,
    userId: string,
    dateFilter?: Mem0DateFilter
): Promise<Mem0SearchResult[]> {
    if (!mem0Client || !query.trim()) return []

    try {
        const searchOptions: any = { user_id: userId }
        if (dateFilter) {
            searchOptions.created_at = dateFilter
        }

        const results = await mem0Client.search(query, searchOptions)
        console.log('[Mem0] Search complete', { count: results.length })
        return results as Mem0SearchResult[]
    } catch (error) {
        console.error('[Mem0] Search error:', error)
        throw error
    }
}

