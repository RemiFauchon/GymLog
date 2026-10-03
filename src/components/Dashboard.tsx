import { useState } from 'react'
import { useWorkouts } from '../hooks/useWorkouts'
import { useExercises } from '../hooks/useExercises'
import { WorkoutCalendar } from './WorkoutCalendar'
import { EvolutionChart } from './EvolutionChart'
import { Modal } from './Modal'
import { WorkoutDetailPanel } from './WorkoutDetailPanel'

export function Dashboard() {
  const { workouts, loading } = useWorkouts()
  const { exercises } = useExercises()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  return (
    <div className="container">
      <h2>Dashboard</h2>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          <WorkoutCalendar workouts={workouts} onSelectDate={setSelectedDate} />

          <EvolutionChart exercises={exercises} onViewDate={setSelectedDate} />
        </>
      )}

      {selectedDate && (
        <Modal onClose={() => setSelectedDate(null)}>
          <WorkoutDetailPanel date={selectedDate} />
        </Modal>
      )}
    </div>
  )
}