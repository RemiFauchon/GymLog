import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface Workout {
  id: string
  date: string
  notes: string | null
}

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [refetchIndex, setRefetchIndex] = useState(0)

  useEffect(() => {
    let ignore = false

    async function load() {
      const { data, error } = await supabase
        .from('workouts')
        .select('id, date, notes')
        .order('date', { ascending: false })

      if (ignore) return

      if (!error && data) {
        setWorkouts(data as Workout[])
      }
      setLoading(false)
    }

    load()

    return () => {
      ignore = true
    }
  }, [refetchIndex])

  function refetch() {
    setRefetchIndex((i) => i + 1)
  }

  return { workouts, loading, refetch }
}