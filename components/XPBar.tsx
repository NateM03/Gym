'use client'

import { getXpForNextLevel, LEVEL_THRESHOLDS } from '@/lib/xp'

interface XPBarProps {
  totalXp: number
  level: number
}

export function XPBar({ totalXp, level }: XPBarProps) {
  const xpForNext = getXpForNextLevel(totalXp)
  const currentLevelXp = level > 1 ? LEVEL_THRESHOLDS[level - 1] : 0
  const nextLevelXp = level < LEVEL_THRESHOLDS.length ? LEVEL_THRESHOLDS[level] : LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  const xpInCurrentLevel = totalXp - currentLevelXp
  const xpNeededForLevel = nextLevelXp - currentLevelXp
  const progress = xpNeededForLevel > 0 ? (xpInCurrentLevel / xpNeededForLevel) * 100 : 100

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Level {level}</span>
        <span className="text-muted-foreground">
          {xpForNext > 0 ? `${xpForNext} XP to next level` : 'Max Level'}
        </span>
      </div>
      <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-300 rounded-full"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <div className="text-xs text-muted-foreground text-center">
        {totalXp.toLocaleString()} total XP
      </div>
    </div>
  )
}

