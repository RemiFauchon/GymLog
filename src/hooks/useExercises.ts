import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Exercise, ExerciseType } from '../types'

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [refetchIndex, setRefetchIndex] = useState(0)

  useEffect(() => {
    let ignore = false

    async function load() {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true })

      if (ignore) return

      if (!error && data) {
        setExercises(data as Exercise[])
      }
      setLoading(false)
    }

    load()

    return () => {
      ignore = true
    }
  }, [refetchIndex])

  const fetchExercises = useCallback(() => {
    setRefetchIndex((i) => i + 1)
  }, [])

  // Crée un nouvel exercice et renvoie son id, ou null en cas d'erreur
  async function createExercise(name: string, type: ExerciseType): Promise<string | null> {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) return null

    const { data, error } = await supabase
      .from('exercises')
      .insert({ name, type, user_id: userId })
      .select()
      .single()

    if (error || !data) return null

    // Met à jour la liste locale pour que le nouvel exercice apparaisse tout de suite
    setExercises((prev) => [...prev, data as Exercise].sort((a, b) => a.name.localeCompare(b.name)))

    return data.id
  }

  return { exercises, loading, createExercise, refetch: fetchExercises }
}