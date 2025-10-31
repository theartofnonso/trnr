-- Create workout_sessions table to store workout sessions with exercise logs
CREATE TABLE IF NOT EXISTS workout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation JSONB NOT NULL, -- Original conversation history [{role: "user"|"assistant", content: string}, ...]
  exercises JSONB NOT NULL, -- Array of exercise objects extracted from the session
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on created_at for date-based queries
CREATE INDEX IF NOT EXISTS idx_workout_sessions_created_at ON workout_sessions(created_at DESC);

-- Create GIN indexes on JSONB columns for efficient querying
CREATE INDEX IF NOT EXISTS idx_workout_sessions_conversation ON workout_sessions USING GIN (conversation);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_exercises ON workout_sessions USING GIN (exercises);

-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger
CREATE TRIGGER update_workout_sessions_updated_at 
  BEFORE UPDATE ON workout_sessions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE workout_sessions IS 'Stores workout sessions with original conversation and extracted exercise logs';
COMMENT ON COLUMN workout_sessions.conversation IS 'Original conversation history: [{role: "user"|"assistant", content: string}, ...]';
COMMENT ON COLUMN workout_sessions.exercises IS 'Array of exercise objects: [{name, muscleGroup, equipment, notes, sets: [...]}, ...]';

