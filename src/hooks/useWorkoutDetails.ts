import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface SetDetail {
  id: string
  exercise_id: string
  exercise_name: string
  weight: number
  reps: number
  set_number: number
}

export interface CardioDetail {
  id: string
  exercise_id: string
  exercise_name: string
  distance_km: number
  duration_seconds: number
}

export interface WorkoutDetail {
  id: string
  date: string
  notes: string | null
  sets: SetDetail[]
  cardio: CardioDetail[]
}

type SetRow = {
  id: string
  exercise_id: string
  weight: number
  reps: number
  set_number: number
  exercises: { name: string } | null
}

type CardioRow = {
  id: string
  exercise_id: string
  distance_km: number
  duration_seconds: number
  exercises: { name: string } | null
}

// date = null signifie "pas de date sélectionnée", le hook ne fait rien dans ce cas
export function useWorkoutDetails(date: string | null) {
  const [workouts, setWorkouts] = useState<WorkoutDetail[]>([])
  const [loading, setLoading] = useState(false)

  const fetchDetails = useCallback(async (targetDate: string) => {
    const { data: workoutRows, error: workoutError } = await supabase
      .from('workouts')
      .select('id, date, notes')
      .eq('date', targetDate)

    if (workoutError || !workoutRows) {
      setWorkouts([])
      return
    }

    const details: WorkoutDetail[] = []

    for (const w of workoutRows) {
      const { data: setRows } = await supabase
        .from('sets')
        .select('id, exercise_id, weight, reps, set_number, exercises(name)')
        .eq('workout_id', w.id)
        .order('set_number', { ascending: true })

      const { data: cardioRows } = await supabase
        .from('cardio_sessions')
        .select('id, exercise_id, distance_km, duration_seconds, exercises(name)')
        .eq('workout_id', w.id)

      details.push({
        id: w.id,
        date: w.date,
        notes: w.notes,
        sets: ((setRows as unknown as SetRow[]) ?? []).map((s) => ({
          id: s.id,
          exercise_id: s.exercise_id,
          exercise_name: s.exercises?.name ?? '?',
          weight: s.weight,
          reps: s.reps,
          set_number: s.set_number,
        })),
        cardio: ((cardioRows as unknown as CardioRow[]) ?? []).map((c) => ({
          id: c.id,
          exercise_id: c.exercise_id,
          exercise_name: c.exercises?.name ?? '?',
          distance_km: c.distance_km,
          duration_seconds: c.duration_seconds,
        })),
      })
    }

    setWorkouts(details)
  }, [])

  useEffect(() => {
    if (!date) return

    let ignore = false

    async function run() {
      if (!date) return
      await fetchDetails(date)
    }

    run().finally(() => {
      if (!ignore) setLoading(false)
    })

    return () => {
      ignore = true
    }
  }, [date, fetchDetails])

  async function updateSet(setId: string, weight: number, reps: number) {
    await supabase.from('sets').update({ weight, reps }).eq('id', setId)
    if (date) await fetchDetails(date)
  }

  async function updateCardio(cardioId: string, distanceKm: number, durationSeconds: number) {
    await supabase
      .from('cardio_sessions')
      .update({ distance_km: distanceKm, duration_seconds: durationSeconds })
      .eq('id', cardioId)
    if (date) await fetchDetails(date)
  }

  return { workouts, loading, updateSet, updateCardio }
}