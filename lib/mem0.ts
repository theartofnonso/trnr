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
        console.warn('[Mem0] Client not available - MEM0_API_KEY not configured. Skipping save.')
        return
    }

    if (messages.length === 0) {
        console.warn('[Mem0] Messages array is empty. Skipping save.')
        return
    }

    try {
        console.log('[Mem0] Adding memory', { messageCount: messages.length, userId })
        await mem0Client.add(messages, { user_id: userId })
        console.log('[Mem0] Memory added successfully')
    } catch (error) {
        console.error('[Mem0] Error adding memory:', error)
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
    if (!mem0Client) {
        console.warn('[Mem0] Client not available - MEM0_API_KEY not configured. Returning empty results.')
        return []
    }
    
    if (!query.trim()) {
        console.warn('[Mem0] Query is empty. Returning empty results.')
        return []
    }

    try {
        const searchOptions: any = {
            user_id: userId,
        }
        
        if (dateFilter) {
            searchOptions.created_at = dateFilter
        }

        console.log('[Mem0] Searching memories', { query, userId, hasDateFilter: !!dateFilter })
        const results = await mem0Client.search(query, searchOptions)
        console.log('[Mem0] Search complete', { resultCount: results.length })
        return results as Mem0SearchResult[]
    } catch (error) {
        console.error('[Mem0] Error searching memories:', error)
        throw error
    }
}

