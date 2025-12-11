import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rewards = await prisma.reward.findMany({
      orderBy: [
        { requiredLevel: 'asc' },
        { requiredStreak: 'asc' },
      ],
    })

    const userRewards = await prisma.userReward.findMany({
      where: {
        userId: session.user.id,
      },
    })

    const rewardsWithStatus = rewards.map(reward => {
      const userReward = userRewards.find(ur => ur.rewardId === reward.id)
      return {
        ...reward,
        unlocked: !!userReward,
        equipped: userReward?.equipped || false,
        unlockedAt: userReward?.unlockedAt || null,
      }
    })

    return NextResponse.json({ rewards: rewardsWithStatus })
  } catch (error) {
    console.error('Error fetching rewards:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

