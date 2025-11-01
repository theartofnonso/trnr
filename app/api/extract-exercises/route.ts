import { NextRequest, NextResponse } from "next/server"
import { extractExerciseData } from "@/lib/agents/analysisAgent"
import { supabase } from "@/lib/supabase"
import { isValidConversation } from "@/lib/validation"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { conversation } = body

    if (!isValidConversation(conversation)) {
      console.error('[API] Invalid conversation:', {
        isArray: Array.isArray(conversation),
        length: conversation?.length,
        sample: conversation?.[0]
      })
      return NextResponse.json(
        { error: 'Invalid conversation format' },
        { status: 400 }
      )
    }

    const exercises = await extractExerciseData(JSON.stringify(conversation, null, 2))
    console.log('[API] Exercises extracted', { exerciseCount: exercises.length })
    const { data: session, error: sessionError } = await supabase!
      .from('workout_sessions')
      .insert({
        conversation,
        exercises,
      })
      .select()
      .single()

    if (sessionError || !session) {
      console.error('[API] Supabase error:', sessionError)
      return NextResponse.json({ error: 'Failed to save workout session' }, { status: 500 })
    }
    
    console.log('[API] Workout session saved', { sessionId: session.id })
    return NextResponse.json({ status: true })
  } catch (error: any) {
    console.error('[API] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}

