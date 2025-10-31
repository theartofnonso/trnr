import MemoryClient from 'mem0ai'

const MEM0_API_KEY = process.env.MEM0_API_KEY
const mem0Client = MEM0_API_KEY ? new MemoryClient({ apiKey: MEM0_API_KEY }) : null

export interface Mem0Message {
    role: 'user' | 'assistant'
    content: string
}

export interface Mem0SearchResult {
    memory: string
}

export async function pushConversationToMem0(
    conversation: Array<{ role: string; transcript: string }>,
    userId: string
): Promise<void> {
    if (!mem0Client || conversation.length === 0) return

    try {
        const messages: Mem0Message[] = conversation
            .filter((item) => item.role === 'user' || item.role === 'assistant')
            .map((item) => ({
                role: (item.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
                content: item.transcript,
            }))

        await addMemory(messages, userId)
    } catch (error) {
        console.error('Error pushing conversation to Mem0:', error)
    }
}

export async function addMemory(
    messages: Mem0Message[],
    userId: string
): Promise<void> {
    if (!mem0Client || messages.length === 0) return

    try {
        await mem0Client.add(messages, { user_id: userId })
    } catch (error) {
        console.error('Error adding memory to Mem0:', error)
    }
}

export async function searchMemories(
    query: string,
    userId: string
): Promise<Mem0SearchResult[]> {
    if (!mem0Client || !query.trim()) return []

    try {
        const results = await mem0Client.search(query, { user_id: userId })
        return results as Mem0SearchResult[]
    } catch (error) {
        console.error('Error searching memories from Mem0:', error)
        throw error
    }
}

