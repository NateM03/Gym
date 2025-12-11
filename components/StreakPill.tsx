'use client'

import { Badge } from '@/components/ui/badge'
import { Flame } from 'lucide-react'

interface StreakPillProps {
  currentStreak: number
  longestStreak?: number
}

export function StreakPill({ currentStreak, longestStreak }: StreakPillProps) {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="gap-2">
        <Flame className="h-4 w-4 text-orange-500" />
        <span className="font-semibold">{currentStreak} day streak</span>
      </Badge>
      {longestStreak && longestStreak > currentStreak && (
        <span className="text-sm text-muted-foreground">
          Best: {longestStreak} days
        </span>
      )}
    </div>
  )
}

