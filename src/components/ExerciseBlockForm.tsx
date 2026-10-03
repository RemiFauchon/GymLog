import type { Exercise, WorkoutExerciseBlock } from '../types'

interface Props {
  block: WorkoutExerciseBlock
  exercises: Exercise[]
  onChange: (updated: WorkoutExerciseBlock) => void
  onRemove: () => void
}

export function ExerciseBlockForm({ block, exercises, onChange, onRemove }: Props) {
  const isCreatingNew = block.exerciseId === null && block.newExerciseName !== ''
  const isNewExerciseMode = block.exerciseId === '__new__'

  function handleExerciseSelect(value: string) {
    if (value === '__new__') {
      onChange({ ...block, exerciseId: '__new__', newExerciseName: '' })
    } else {
      const selected = exercises.find((e) => e.id === value)
      onChange({
        ...block,
        exerciseId: value,
        newExerciseName: '',
        exerciseType: selected?.type ?? 'salle',
      })
    }
  }

  function handleSetsCountChange(count: number) {
    const newSets = Array.from({ length: count }, (_, i) => block.sets[i] ?? { weight: 0, reps: 0 })
    onChange({ ...block, sets: newSets })
  }

  function updateSet(index: number, field: 'weight' | 'reps', value: number) {
    const newSets = [...block.sets]
    newSets[index] = { ...newSets[index], [field]: value }
    onChange({ ...block, sets: newSets })
  }

  return (
    <div className="card">
      <select
        value={block.exerciseId ?? ''}
        onChange={(e) => handleExerciseSelect(e.target.value)}
      >
        <option value="" disabled>
          Choisir un exercice
        </option>
        {exercises.map((ex) => (
          <option key={ex.id} value={ex.id}>
            {ex.name}
          </option>
        ))}
        <option value="__new__">+ Nouvel exercice</option>
      </select>

      {isNewExerciseMode && (
        <>
          <input
            type="text"
            placeholder="Nom du nouvel exercice"
            value={block.newExerciseName}
            onChange={(e) => onChange({ ...block, newExerciseName: e.target.value })}
          />
          <select
            value={block.exerciseType}
            onChange={(e) => onChange({ ...block, exerciseType: e.target.value as 'salle' | 'course' })}
          >
            <option value="salle">Salle (poids/reps)</option>
            <option value="course">Course (distance/durée)</option>
          </select>
        </>
      )}

      {block.exerciseType === 'salle' && (block.exerciseId || isCreatingNew) && (
        <>
          <label>Nombre de séries</label>
          <input
            type="number"
            min={1}
            value={block.sets.length || ''}
            onChange={(e) => handleSetsCountChange(Number(e.target.value))}
          />

          {block.sets.map((set, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                placeholder={`Poids série ${i + 1} (kg)`}
                value={set.weight || ''}
                onChange={(e) => updateSet(i, 'weight', Number(e.target.value))}
              />
              <input
                type="number"
                placeholder={`Reps série ${i + 1}`}
                value={set.reps || ''}
                onChange={(e) => updateSet(i, 'reps', Number(e.target.value))}
              />
            </div>
          ))}
        </>
      )}

      {block.exerciseType === 'course' && (block.exerciseId || isCreatingNew) && (
        <>
          <input
            type="number"
            placeholder="Distance (km)"
            value={block.cardio.distance_km || ''}
            onChange={(e) =>
              onChange({ ...block, cardio: { ...block.cardio, distance_km: Number(e.target.value) } })
            }
          />
          <input
            type="number"
            placeholder="Durée (secondes)"
            value={block.cardio.duration_seconds || ''}
            onChange={(e) =>
              onChange({ ...block, cardio: { ...block.cardio, duration_seconds: Number(e.target.value) } })
            }
          />
        </>
      )}

      <button type="button" className="secondary" onClick={onRemove}>
        Retirer cet exercice
      </button>
    </div>
  )
}