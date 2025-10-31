import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import { ExerciseLogSchema, ExerciseLog } from '../schemas/exerciseLog'

/**
 * Extract structured exercise data from workout transcript/conversation
 * Uses AI SDK's generateObject with Zod schema for structured outputs
 */
export async function extractExerciseData(transcript: string): Promise<ExerciseLog> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const openai = createOpenAI({
    apiKey: apiKey,
  })

  const extractionPrompt = `You are a post-workout data extraction agent. After each training session ends, your job is to analyze the user's workout log or transcript (voice/text) and extract structured, analytics-ready information about every exercise performed.

Instructions:
1. Parse the input text or conversation to identify individual exercises and their key details.
2. Return results strictly in structured JSON that conforms to the provided schema.
3. All fields are optional except for name and sets, which are required.
4. Be tolerant of natural language, incomplete entries, or noisy input (e.g., "did 3 sets of squats, last one was heavy").
5. Do not infer unrealistic values — if data is missing, omit the field.
6. Normalize exercise names to standard forms (e.g., "squats" → "Barbell Squat", "leg press" → "Leg Press").
7. Extract equipment mentioned (e.g., "barbell", "dumbbells", "bodyweight") if explicitly stated.
8. Capture reps in reserve (RIR) if user mentions "had 2 reps left", "went to failure", "could have done more" - store in the sets array.
9. Always use sets array to store per-set information (e.g., "3 sets of 8 reps at 80kg" should be stored as 3 objects in sets array).

Workout transcript:
${transcript}`

  try {
    // Wrap array schema in an object since generateObject requires object schema
    const { object } = await generateObject({
      model: openai('gpt-5'),
      schema: z.object({ exercises: ExerciseLogSchema }),
      prompt: extractionPrompt,
      temperature: 0.1,
    })

    return object.exercises
  } catch (error) {
    console.error('Error extracting exercise data:', error)
    throw error
  }
}

