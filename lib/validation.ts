import { ConversationMessage } from './types/conversation'

export function isValidConversation(conversation: any): conversation is ConversationMessage[] {
  return (
    Array.isArray(conversation) &&
    conversation.length > 0 &&
    conversation.every(
      (msg: any): msg is ConversationMessage =>
        msg &&
        typeof msg === 'object' &&
        (msg.role === 'user' || msg.role === 'assistant') &&
        typeof msg.content === 'string' &&
        msg.content.length > 0
    )
  )
}

