import { NextRequest, NextResponse } from 'next/server'
import { addMemory } from '@/lib/mem0'
import { ConversationMessage } from '@/lib/types/conversation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { conversation, userId } = body

    if (!Array.isArray(conversation) || conversation.length === 0) {
      return NextResponse.json(
        { error: 'Conversation is required and must be a non-empty array' },
        { status: 400 }
      )
    }

    // Validate conversation structure
    const isValidConversation = conversation.every(
      (msg: any): msg is ConversationMessage =>
        msg &&
        typeof msg === 'object' &&
        (msg.role === 'user' || msg.role === 'assistant') &&
        typeof msg.content === 'string' &&
        msg.content.length > 0
    )

    if (!isValidConversation) {
      return NextResponse.json(
        { error: 'Conversation must be an array of { role: "user" | "assistant", content: string }' },
        { status: 400 }
      )
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'UserId is required and must be a string' },
        { status: 400 }
      )
    }

    console.log('[API] Saving conversation to Mem0', { messageCount: conversation.length, userId })
    await addMemory(conversation, userId)
    console.log('[API] Conversation saved to Mem0 successfully')

    return NextResponse.json({ status: true })
  } catch (error: any) {
    console.error('[API] Error saving conversation to Mem0:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save conversation' },
      { status: 500 }
    )
  }
}

