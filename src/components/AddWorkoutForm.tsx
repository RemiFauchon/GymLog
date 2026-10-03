import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useExercises } from '../hooks/useExercises'
import { ExerciseBlockForm } from './ExerciseBlockForm'
import type { WorkoutExerciseBlock } from '../types'

function emptyBlock(): WorkoutExerciseBlock {
  return {
    exerciseId: null,
    newExerciseName: '',
    exerciseType: 'salle',
    sets: [],
    cardio: { distance_km: 0, duration_seconds: 0 },
  }
}

interface Props {
  onWorkoutAdded: () => void
}

export function AddWorkoutForm({ onWorkoutAdded }: Props) {
  const { exercises, createExercise } = useExercises()
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [blocks, setBlocks] = useState<WorkoutExerciseBlock[]>([emptyBlock()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateBlock(index: number, updated: WorkoutExerciseBlock) {
    const newBlocks = [...blocks]
    newBlocks[index] = updated
    setBlocks(newBlocks)
  }

  function removeBlock(index: number) {
    setBlocks(blocks.filter((_, i) => i !== index))
  }

  function addBlock() {
    setBlocks([...blocks, emptyBlock()])
  }

  async function handleSubmit() {
    setError(null)
    setSaving(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      if (!userId) throw new Error('Utilisateur non connecté')

      // 1. Créer la séance
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({ date, notes, user_id: userId })
        .select()
        .single()

      if (workoutError || !workout) throw new Error(workoutError?.message ?? 'Erreur séance')

      // 2. Pour chaque bloc d'exercice, créer l'exercice si besoin, puis les séries/cardio
      for (const block of blocks) {
        let exerciseId = block.exerciseId

        // Cas "nouvel exercice"
        if (exerciseId === '__new__') {
          if (!block.newExerciseName.trim()) continue
          const newId = await createExercise(block.newExerciseName.trim(), block.exerciseType)
          if (!newId) throw new Error("Erreur lors de la création de l'exercice")
          exerciseId = newId
        }

        if (!exerciseId) continue

        if (block.exerciseType === 'salle') {
          const rows = block.sets.map((set, i) => ({
            workout_id: workout.id,
            exercise_id: exerciseId,
            weight: set.weight,
            reps: set.reps,
            set_number: i + 1,
          }))
          if (rows.length > 0) {
            const { error: setsError } = await supabase.from('sets').insert(rows)
            if (setsError) throw new Error(setsError.message)
          }
        } else {
          const { error: cardioError } = await supabase.from('cardio_sessions').insert({
            workout_id: workout.id,
            exercise_id: exerciseId,
            distance_km: block.cardio.distance_km,
            duration_seconds: block.cardio.duration_seconds,
          })
          if (cardioError) throw new Error(cardioError.message)
        }
      }

      // Réinitialise le formulaire après succès
      setBlocks([emptyBlock()])
      setNotes('')
      onWorkoutAdded()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container">
      <h2>Ajouter une séance</h2>

      <label>Date</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <label>Notes (optionnel)</label>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />

      {blocks.map((block, i) => (
        <ExerciseBlockForm
          key={i}
          block={block}
          exercises={exercises}
          onChange={(updated) => updateBlock(i, updated)}
          onRemove={() => removeBlock(i)}
        />
      ))}

      <button type="button" className="secondary" onClick={addBlock}>
        + Ajouter un exercice
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="button" onClick={handleSubmit} disabled={saving}>
        {saving ? 'Enregistrement...' : 'Enregistrer la séance'}
      </button>
    </div>
  )
}