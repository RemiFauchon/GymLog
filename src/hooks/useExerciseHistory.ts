import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface SetHistoryPoint {
  date: string // format YYYY-MM-DD
  weight: number
  reps: number
  setNumber: number
}

export function useExerciseHistory(exerciseId: string | null) {
  const [history, setHistory] = useState<SetHistoryPoint[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!exerciseId) return

    let ignore = false

    async function load() {
      // On récupère les séries avec la date de la séance liée (jointure via workouts)
      const { data, error } = await supabase
        .from('sets')
        .select('weight, reps, set_number, workouts(date)')
        .eq('exercise_id', exerciseId)

      if (ignore) return

      if (!error && data) {
        type SetRow = {
          weight: number
          reps: number
          set_number: number
          workouts: { date: string } | null
        }

        const points: SetHistoryPoint[] = (data as unknown as SetRow[])
          .map((row) => ({
            date: row.workouts?.date ?? '',
            weight: row.weight,
            reps: row.reps,
            setNumber: row.set_number,
          }))
          .filter((p) => p.date !== '')
          .sort((a, b) => a.date.localeCompare(b.date))

        setHistory(points)
      }
      setLoading(false)
    }

    load()

    return () => {
      ignore = true
    }
  }, [exerciseId])

  return { history, loading }
}