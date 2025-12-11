'use client'

import { Badge } from '@/components/ui/badge'

interface ExerciseRowProps {
  exercise: {
    id: string
    name: string
    muscleGroup: string
    equipment: string
  }
  sets: number
  reps: string
  restSeconds?: number
}

export function ExerciseRow({ exercise, sets, reps, restSeconds }: ExerciseRowProps) {
  return (
    <div className="flex items-start justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <h4 className="font-semibold">{exercise.name}</h4>
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary">{exercise.muscleGroup}</Badge>
          <Badge variant="outline">{exercise.equipment}</Badge>
        </div>
      </div>
      {(sets > 0 || reps) && (
        <div className="text-right ml-4">
          <div className="font-medium">
            {sets > 0 ? `${sets} × ` : ''}{reps || 'Set by user'}
          </div>
          {restSeconds && restSeconds > 0 && (
            <div className="text-sm text-muted-foreground mt-1">
              {Math.floor(restSeconds / 60)}m rest
            </div>
          )}
        </div>
      )}
    </div>
  )
}

