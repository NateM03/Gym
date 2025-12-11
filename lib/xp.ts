import { prisma } from './prisma'

export const XP_VALUES = {
  WORKOUT_COMPLETED: 50,
  WORKOUT_WITH_SETS: 20,
  STREAK_7_DAYS: 150,
}

export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  500,    // Level 2
  1200,   // Level 3
  2400,   // Level 4
  4000,   // Level 5
  6000,   // Level 6
  8500,   // Level 7
  11500,  // Level 8
  15000,  // Level 9
  20000,  // Level 10
]

export function calculateLevel(totalXp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) {
      return i + 1
    }
  }
  return 1
}

export function getXpForNextLevel(totalXp: number): number {
  const currentLevel = calculateLevel(totalXp)
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return 0 // Max level
  }
  return LEVEL_THRESHOLDS[currentLevel] - totalXp
}

export async function awardXp(userId: string, action: string, metadata?: any): Promise<void> {
  const stats = await prisma.userStats.findUnique({
    where: { userId },
  })

  if (!stats) {
    throw new Error('User stats not found')
  }

  let xpToAward = 0

  switch (action) {
    case 'workout_completed':
      xpToAward = XP_VALUES.WORKOUT_COMPLETED
      break
    case 'workout_with_sets':
      xpToAward = XP_VALUES.WORKOUT_WITH_SETS
      break
    case 'streak_7_days':
      xpToAward = XP_VALUES.STREAK_7_DAYS
      break
    default:
      xpToAward = 0
  }

  const newTotalXp = stats.totalXp + xpToAward
  const newLevel = calculateLevel(newTotalXp)

  // Update streak if workout was completed
  let currentStreak = stats.currentStreak
  let longestStreak = stats.longestStreak
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (action === 'workout_completed' || action === 'workout_with_sets') {
    const lastWorkoutDate = stats.lastWorkoutDate
      ? new Date(stats.lastWorkoutDate)
      : null

    if (lastWorkoutDate) {
      lastWorkoutDate.setHours(0, 0, 0, 0)
      const daysDiff = Math.floor((today.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === 1) {
        // Consecutive day
        currentStreak += 1
      } else if (daysDiff > 1) {
        // Streak broken
        currentStreak = 1
      }
      // If daysDiff === 0, same day, don't change streak
    } else {
      // First workout
      currentStreak = 1
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak
    }

    // Check for 7-day streak bonus (only if streak just reached 7)
    if (currentStreak === 7 && stats.currentStreak < 7) {
      // Award streak bonus (add directly to avoid recursion)
      const streakBonusXp = XP_VALUES.STREAK_7_DAYS
      const finalXp = newTotalXp + streakBonusXp
      const finalLevel = calculateLevel(finalXp)
      
      await prisma.userStats.update({
        where: { userId },
        data: {
          totalXp: finalXp,
          level: finalLevel,
        },
      })
      
      // Check for additional unlocks with the bonus XP
      await checkUnlocks(userId, finalLevel, currentStreak)
      
      // Update streak-related fields
      await prisma.userStats.update({
        where: { userId },
        data: {
          currentStreak,
          longestStreak,
          lastWorkoutDate: today,
          workoutsThisWeek: metadata?.workoutsThisWeek ?? stats.workoutsThisWeek,
        },
      })
      return // Early return to avoid double update
    }
  }

  await prisma.userStats.update({
    where: { userId },
    data: {
      totalXp: newTotalXp,
      level: newLevel,
      currentStreak,
      longestStreak,
      lastWorkoutDate: today,
      workoutsThisWeek: metadata?.workoutsThisWeek ?? stats.workoutsThisWeek,
    },
  })

  // Check for reward unlocks
  await checkUnlocks(userId, newLevel, currentStreak)
}

export async function checkUnlocks(userId: string, level: number, streak: number): Promise<void> {
  const rewards = await prisma.reward.findMany({
    where: {
      OR: [
        { requiredLevel: { lte: level } },
        { requiredStreak: { lte: streak } },
      ],
    },
  })

  for (const reward of rewards) {
    // Check if reward should be unlocked
    const shouldUnlock =
      (reward.requiredLevel === null || level >= reward.requiredLevel) &&
      (reward.requiredStreak === null || streak >= reward.requiredStreak)

    if (shouldUnlock) {
      // Check if already unlocked
      const existing = await prisma.userReward.findUnique({
        where: {
          userId_rewardId: {
            userId,
            rewardId: reward.id,
          },
        },
      })

      if (!existing) {
        await prisma.userReward.create({
          data: {
            userId,
            rewardId: reward.id,
            equipped: false,
          },
        })
      }
    }
  }
}

