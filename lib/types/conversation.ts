/**
 * Standard conversation message interface
 * 
 * All conversations across the codebase must use this format:
 * - role: Either "user" or "assistant"
 * - content: The message text content
 */
export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

/**
 * Conversation array type - array of ConversationMessage
 * 
 * This is the standard format for all conversations throughout the application.
 */
export type Conversation = ConversationMessage[]

