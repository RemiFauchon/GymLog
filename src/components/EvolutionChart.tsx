import { useState } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { ScatterPointItem } from 'recharts'
import type { Exercise } from '../types'
import { useExerciseHistory } from '../hooks/useExerciseHistory'

interface Props {
  exercises: Exercise[]
  onViewDate: (date: string) => void
}

export function EvolutionChart({ exercises, onViewDate }: Props) {
  const strengthExercises = exercises.filter((e) => e.type === 'salle')
  // null = "pas encore choisi manuellement" ; dans ce cas on retombe sur le premier
  // exercice disponible, recalculé à CHAQUE rendu (pas juste au montage), donc pas
  // de souci si "exercises" arrive après le premier rendu du composant.
  const [manualSelectedId, setManualSelectedId] = useState<string | null>(null)
  const selectedId = manualSelectedId ?? strengthExercises[0]?.id ?? null

  if (strengthExercises.length === 0) {
    return (
      <div className="card">
        <p>Ajoute au moins un exercice de type "salle" pour voir son évolution ici.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3>Évolution</h3>

      <select
        value={selectedId ?? ''}
        onChange={(e) => setManualSelectedId(e.target.value)}
      >
        {strengthExercises.map((ex) => (
          <option key={ex.id} value={ex.id}>
            {ex.name}
          </option>
        ))}
      </select>

      {/* La key force un nouveau montage (et donc un état loading frais) à chaque changement d'exercice */}
      <ExerciseChartContent key={selectedId} exerciseId={selectedId} onViewDate={onViewDate} />
    </div>
  )
}

interface ChartContentProps {
  exerciseId: string | null
  onViewDate: (date: string) => void
}

interface ChartPoint {
  x: number | undefined
  y: number
  date: string
  reps: number
  setNumber: number
}

function ExerciseChartContent({ exerciseId, onViewDate }: ChartContentProps) {
  const { history, loading } = useExerciseHistory(exerciseId)
  const [selectedPoint, setSelectedPoint] = useState<{
    date: string
    weight: number
    reps: number
    setNumber: number
  } | null>(null)

  // Recharts a besoin d'un axe X numérique pour un ScatterChart ;
  // on convertit chaque date unique en position, mais on affiche la vraie date en label
  const uniqueDates = Array.from(new Set(history.map((h) => h.date)))
  const dateToIndex = new Map(uniqueDates.map((d, i) => [d, i]))

  const chartData: ChartPoint[] = history.map((h) => ({
    x: dateToIndex.get(h.date),
    y: h.weight,
    date: h.date,
    reps: h.reps,
    setNumber: h.setNumber,
  }))

  if (loading) return <p>Chargement...</p>

  if (history.length === 0) {
    return <p>Aucune donnée enregistrée pour cet exercice pour l'instant.</p>
  }

  return (
    <>
      <ResponsiveContainer width="100%" height={250}>
        <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="x"
            type="number"
            domain={[0, uniqueDates.length - 1]}
            ticks={uniqueDates.map((_, i) => i)}
            tickFormatter={(i) => uniqueDates[i]?.slice(5) ?? ''}
            stroke="var(--color-text-muted)"
            fontSize={12}
          />
          <YAxis
            dataKey="y"
            name="Poids (kg)"
            stroke="var(--color-text-muted)"
            fontSize={12}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null
              const point = payload[0].payload
              return (
                <div className="card" style={{ margin: 0, padding: '8px' }}>
                  <p>{point.date}</p>
                  <p>{point.y} kg × {point.reps} reps (série {point.setNumber})</p>
                </div>
              )
            }}
          />
          <Scatter
            data={chartData}
            fill="var(--color-primary)"
            onClick={(point: ScatterPointItem) => {
              const data = point.payload as ChartPoint
              setSelectedPoint({
                date: data.date,
                weight: data.y,
                reps: data.reps,
                setNumber: data.setNumber,
              })
            }}
            style={{ cursor: 'pointer' }}
          />
        </ScatterChart>
      </ResponsiveContainer>

      {selectedPoint && (
        <div className="card" style={{ marginTop: '8px' }}>
          <p>{selectedPoint.date}</p>
          <p>{selectedPoint.weight} kg × {selectedPoint.reps} reps (série {selectedPoint.setNumber})</p>
          <button type="button" onClick={() => onViewDate(selectedPoint.date)}>
            Voir la séance
          </button>
        </div>
      )}
    </>
  )
}