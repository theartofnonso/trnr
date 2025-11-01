import { NextRequest, NextResponse } from 'next/server'
import { addMemory } from '@/lib/mem0'
import { isValidConversation } from '@/lib/validation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { conversation, userId } = body

    if (!isValidConversation(conversation)) {
      return NextResponse.json(
        { error: 'Invalid conversation format' },
        { status: 400 }
      )
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'UserId is required' },
        { status: 400 }
      )
    }

    await addMemory(conversation, userId)
    console.log('[API] Conversation saved to Mem0', { messageCount: conversation.length })

    return NextResponse.json({ status: true })
  } catch (error: any) {
    console.error('[API] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to save' }, { status: 500 })
  }
}

