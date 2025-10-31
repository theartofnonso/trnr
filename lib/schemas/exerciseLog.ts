import { z } from "zod"

const SetSchema = z.object({
  reps: z.number().optional().describe('Number of repetitions for this specific set'),
  weight: z.number().optional().describe('Weight used for this specific set in kg or lb'),
  rpe: z.number().optional().describe('Rate of perceived exertion for this specific set (1-10)'),
  restTime: z.number().optional().describe('Rest time taken after this set in seconds'),
  repsInReserve: z.number().optional().describe('Number of reps left in reserve (RIR) for this set'),
})

export const ExerciseLogSchema = z.array(
  z.object({
    name: z.string().describe('Name of the exercise performed (e.g., "Barbell Squat", "Leg Press")'),
    muscleGroup: z.string().optional().describe('Primary muscle group trained (e.g., "quadriceps", "chest", "back", "shoulders")'),
    equipment: z.string().optional().describe('Equipment used (e.g., "barbell", "dumbbells", "machine", "bodyweight", "resistance bands")'),
    sets: z.array(SetSchema).describe('Per-set data for all sets performed'),
    notes: z.string().optional().describe('Any relevant free-form note about the exercise or performance'),
  })
)

export type ExerciseLog = z.infer<typeof ExerciseLogSchema>

