import { NextRequest, NextResponse } from "next/server"
import { extractExerciseData } from "@/lib/agents/analysisAgent"
import { supabase } from "@/lib/supabase"
import { pushConversationToMem0 } from "@/lib/mem0"

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * POST endpoint to extract structured exercise data from workout transcript
 * and persist to Supabase
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { conversation } = body

    if (!Array.isArray(conversation) || conversation.length === 0) {
      return NextResponse.json(
        { error: "Conversation is required and must be a non-empty array" },
        { status: 400 }
      )
    }

    // Convert conversation array to JSON string for extractExerciseData
    const conversationJson = JSON.stringify(conversation, null, 2)

    // Pass the JSON string to extractExerciseData
    const exercises = await extractExerciseData(conversationJson)

    // Create a new workout session with conversation and exercises stored as JSONB
    const { data: session, error: sessionError } = await supabase!
      .from('workout_sessions')
      .insert({
        conversation: conversation, // Store original conversation history
        exercises: exercises, // Store entire exercise array as JSONB
      })
      .select()
      .single()

    if (sessionError || !session) {
      console.error("Error creating workout session:", sessionError)
      return NextResponse.json(
        { error: "Failed to create workout session" },
        { status: 500 }
      )
    }

    // Push conversation history to Mem0.ai
    await pushConversationToMem0(conversation, "default_user_id")

    return NextResponse.json({ status: true})
  } catch (error: any) {
    console.error("Error extracting exercise data:", error)
    return NextResponse.json(
      { error: error.message || "Failed to extract exercise data" },
      { status: 500 }
    )
  }
}

