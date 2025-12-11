'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExerciseRow } from './ExerciseRow'

interface Exercise {
  id: string
  order: number
  sets: number
  reps: string
  restSeconds?: number
  exercise: {
    id: string
    name: string
    muscleGroup: string
    equipment: string
  }
}

interface WorkoutCardProps {
  workoutDay: {
    id: string
    title: string
    exercises: Exercise[]
    completed?: boolean
  }
  onComplete?: () => void
  isLoading?: boolean
}

export function WorkoutCard({ workoutDay, onComplete, isLoading }: WorkoutCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{workoutDay.title}</CardTitle>
            <CardDescription>
              {workoutDay.exercises.length} exercises
            </CardDescription>
          </div>
          {workoutDay.completed && (
            <Badge variant="default">Completed</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {workoutDay.exercises.map((exercise) => (
            <ExerciseRow
              key={exercise.id}
              exercise={exercise.exercise}
              sets={exercise.sets || 0}
              reps={exercise.reps || 'Set by user'}
              restSeconds={exercise.restSeconds}
            />
          ))}
        </div>
        {!workoutDay.completed && onComplete && (
          <Button
            onClick={onComplete}
            disabled={isLoading}
            className="w-full"
            size="lg"
            variant="outline"
          >
            {isLoading ? 'Completing...' : 'Quick Complete (No Logging)'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

