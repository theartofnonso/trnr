import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { addMemory, searchMemories } from '../mem0'
import { Mem0SearchResult } from '../mem0'

// Zod schemas for tool parameters
export const Mem0MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1, 'Content cannot be empty'),
})

export const AddMemoryToolParamsSchema = z.object({
  messages: z.array(Mem0MessageSchema).min(1, 'At least one message is required'),
  userId: z.string().min(1, 'User ID is required'),
})

export const SearchMemoriesToolParamsSchema = z.object({
  query: z.string().min(1, 'Query cannot be empty'),
  userId: z.string().min(1, 'User ID is required'),
})

// Tool functions that will be used by the agent
export async function addMemoryTool(params: z.infer<typeof AddMemoryToolParamsSchema>): Promise<{ success: boolean; message: string }> {
  try {
    const validatedParams = AddMemoryToolParamsSchema.parse(params)
    await addMemory(validatedParams.messages, validatedParams.userId)
    return { success: true, message: 'Memory added successfully' }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add memory'
    return { success: false, message }
  }
}

export async function searchMemoriesTool(params: z.infer<typeof SearchMemoriesToolParamsSchema>): Promise<Mem0SearchResult[]> {
  const validatedParams = SearchMemoriesToolParamsSchema.parse(params)
  return await searchMemories(validatedParams.query, validatedParams.userId)
}

// Tool definitions for OpenAI RealtimeAgent
export const addMemoryToolDefinition = {
  type: 'function' as const,
  function: {
    name: 'add_memory',
    description: 'Add a memory or conversation history to the user\'s memory store. Use this to save important information from the conversation that should be remembered for future sessions.',
    parameters: zodToJsonSchema(AddMemoryToolParamsSchema),
  },
}

export const searchMemoriesToolDefinition = {
  type: 'function' as const,
  function: {
    name: 'search_memories',
    description: 'Search the user\'s memory store for relevant past conversations or information. Use this to recall previous workouts, preferences, goals, or other context about the user.',
    parameters: zodToJsonSchema(SearchMemoriesToolParamsSchema),
  },
}

