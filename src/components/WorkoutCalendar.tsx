import { useState } from 'react'
import type { Workout } from '../hooks/useWorkouts'

interface Props {
  workouts: Workout[]
  onSelectDate: (date: string) => void
}

const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const MONTH_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

export function WorkoutCalendar({ workouts, onSelectDate }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Dates (format YYYY-MM-DD) où il y a une séance, pour un lookup rapide
  const workoutDates = new Set(workouts.map((w) => w.date))

  const firstDayOfMonth = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // getDay() renvoie 0 pour dimanche ; on veut que la semaine commence lundi
  const startWeekday = (firstDayOfMonth.getDay() + 6) % 7

  function formatDateKey(day: number) {
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    return `${year}-${mm}-${dd}`
  }

  function goToPreviousMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  function goToNextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const todayKey = new Date().toISOString().slice(0, 10)

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <button type="button" className="secondary" style={{ width: 'auto' }} onClick={goToPreviousMonth}>
          ←
        </button>
        <strong>{MONTH_LABELS[month]} {year}</strong>
        <button type="button" className="secondary" style={{ width: 'auto' }} onClick={goToNextMonth}>
          →
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={i} style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            {label}
          </div>
        ))}

        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />

          const dateKey = formatDateKey(day)
          const hasWorkout = workoutDates.has(dateKey)
          const isToday = dateKey === todayKey

          return (
            <div
              key={dateKey}
              onClick={hasWorkout ? () => onSelectDate(dateKey) : undefined}
              style={{
                padding: '8px 0',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: hasWorkout ? 'var(--color-primary)' : 'transparent',
                border: isToday ? '1px solid var(--color-text)' : 'none',
                fontWeight: hasWorkout ? 600 : 400,
                cursor: hasWorkout ? 'pointer' : 'default',
              }}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}