export type ExerciseType = 'salle' | 'course'

export interface Exercise {
  id: string
  user_id: string
  name: string
  type: ExerciseType
  created_at: string
}

export interface SetEntry {
  weight: number
  reps: number
}

export interface CardioEntry {
  distance_km: number
  duration_seconds: number
}

// Un "bloc" dans le formulaire : un exercice + ses séries (ou ses données cardio)
export interface WorkoutExerciseBlock {
  exerciseId: string | null // null si on crée un nouvel exercice
  newExerciseName: string
  exerciseType: ExerciseType
  sets: SetEntry[] // utilisé si exerciseType === 'salle'
  cardio: CardioEntry // utilisé si exerciseType === 'course'
}