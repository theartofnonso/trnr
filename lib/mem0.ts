/**
 * Mem0.ai API integration for persisting conversation history
 */

import MemoryClient from 'mem0ai'

const MEM0_API_KEY = process.env.MEM0_API_KEY

// Initialize Mem0 client (only if API key is configured)
let mem0Client: MemoryClient | null = null

if (MEM0_API_KEY) {
    mem0Client = new MemoryClient({
        apiKey: MEM0_API_KEY,
    })
}

export interface Mem0Message {
    role: 'user' | 'assistant'
    content: string
}

/**
 * Push conversation history to Mem0.ai
 * @param conversation Array of conversation items with role and transcript
 * @param userId Optional user ID to associate with the memory
 */
export async function pushConversationToMem0(
    conversation: Array<{ role: string; transcript: string }>,
    userId: string
): Promise<void> {
    if (!mem0Client) {
        console.warn('MEM0_API_KEY not configured. Skipping Mem0 integration.')
        return
    }

    if (conversation.length === 0) {
        return
    }

    try {
        // Format conversation for Mem0 SDK (only user and assistant roles are supported)
        const messages: Mem0Message[] = conversation
            .filter((item) => item.role === 'user' || item.role === 'assistant')
            .map((item) => ({
                role: item.role === 'user' ? 'user' as const : 'assistant' as const,
                content: item.transcript,
            }))

        // Use Mem0 SDK to add memory
        await mem0Client.add(messages, {
            user_id: userId,
        })

        console.log('Successfully pushed conversation to Mem0')
    } catch (error: any) {
        console.error('Error pushing conversation to Mem0:', error)
        // Don't throw - allow the flow to continue even if Mem0 fails
    }
}

