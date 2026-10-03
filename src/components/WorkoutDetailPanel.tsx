import { useState } from 'react'
import { useWorkoutDetails } from '../hooks/useWorkoutDetails'
import type { SetDetail, CardioDetail } from '../hooks/useWorkoutDetails'

interface Props {
  date: string
}

export function WorkoutDetailPanel({ date }: Props) {
  const { workouts, updateSet, updateCardio } = useWorkoutDetails(date)

  if (workouts.length === 0) {
    return <p>Aucune séance trouvée pour le {date}.</p>
  }

  return (
    <div>
      <h3>Séance du {date}</h3>
      {workouts.map((w) => (
        <div key={w.id} style={{ marginBottom: '16px' }}>
          {w.notes && <p style={{ color: 'var(--color-text-muted)' }}>{w.notes}</p>}

          {/* Regroupe les séries par exercice */}
          {Object.entries(groupByExercise(w.sets)).map(([exerciseName, sets]) => (
            <div key={exerciseName} style={{ marginBottom: '12px' }}>
              <strong>{exerciseName}</strong>
              {sets.map((set) => (
                <EditableSetRow key={set.id} set={set} onSave={updateSet} />
              ))}
            </div>
          ))}

          {w.cardio.map((c) => (
            <div key={c.id} style={{ marginBottom: '12px' }}>
              <strong>{c.exercise_name}</strong>
              <EditableCardioRow cardio={c} onSave={updateCardio} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function groupByExercise(sets: SetDetail[]) {
  const groups: Record<string, SetDetail[]> = {}
  for (const set of sets) {
    if (!groups[set.exercise_name]) groups[set.exercise_name] = []
    groups[set.exercise_name].push(set)
  }
  return groups
}

function EditableSetRow({
  set,
  onSave,
}: {
  set: SetDetail
  onSave: (id: string, weight: number, reps: number) => void
}) {
  const [weight, setWeight] = useState(set.weight)
  const [reps, setReps] = useState(set.reps)
  const [editing, setEditing] = useState(false)

  const changed = weight !== set.weight || reps !== set.reps

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <span style={{ minWidth: '60px', color: 'var(--color-text-muted)' }}>
        Série {set.set_number}
      </span>
      <input
        type="number"
        value={weight}
        onChange={(e) => {
          setWeight(Number(e.target.value))
          setEditing(true)
        }}
        style={{ marginBottom: 0 }}
      />
      <span>kg ×</span>
      <input
        type="number"
        value={reps}
        onChange={(e) => {
          setReps(Number(e.target.value))
          setEditing(true)
        }}
        style={{ marginBottom: 0 }}
      />
      <span>reps</span>
      {editing && changed && (
        <button
          type="button"
          style={{ width: 'auto', marginBottom: 0 }}
          onClick={() => {
            onSave(set.id, weight, reps)
            setEditing(false)
          }}
        >
          ✓
        </button>
      )}
    </div>
  )
}

function EditableCardioRow({
  cardio,
  onSave,
}: {
  cardio: CardioDetail
  onSave: (id: string, distanceKm: number, durationSeconds: number) => void
}) {
  const [distance, setDistance] = useState(cardio.distance_km)
  const [duration, setDuration] = useState(cardio.duration_seconds)
  const [editing, setEditing] = useState(false)

  const changed = distance !== cardio.distance_km || duration !== cardio.duration_seconds

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <input
        type="number"
        value={distance}
        onChange={(e) => {
          setDistance(Number(e.target.value))
          setEditing(true)
        }}
        style={{ marginBottom: 0 }}
      />
      <span>km en</span>
      <input
        type="number"
        value={duration}
        onChange={(e) => {
          setDuration(Number(e.target.value))
          setEditing(true)
        }}
        style={{ marginBottom: 0 }}
      />
      <span>sec</span>
      {editing && changed && (
        <button
          type="button"
          style={{ width: 'auto', marginBottom: 0 }}
          onClick={() => {
            onSave(cardio.id, distance, duration)
            setEditing(false)
          }}
        >
          ✓
        </button>
      )}
    </div>
  )
}