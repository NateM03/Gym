import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: rewardId } = params

    // Check if user has unlocked this reward
    const userReward = await prisma.userReward.findUnique({
      where: {
        userId_rewardId: {
          userId: session.user.id,
          rewardId,
        },
      },
      include: {
        reward: true,
      },
    })

    if (!userReward) {
      return NextResponse.json(
        { error: 'Reward not unlocked' },
        { status: 400 }
      )
    }

    // If reward type is avatar, unequip other avatars of same type
    if (userReward.reward.type === 'avatar') {
      await prisma.userReward.updateMany({
        where: {
          userId: session.user.id,
          reward: {
            type: 'avatar',
          },
          equipped: true,
        },
        data: {
          equipped: false,
        },
      })
    }

    // Equip this reward
    const updated = await prisma.userReward.update({
      where: {
        userId_rewardId: {
          userId: session.user.id,
          rewardId,
        },
      },
      data: {
        equipped: true,
      },
      include: {
        reward: true,
      },
    })

    return NextResponse.json({ userReward: updated })
  } catch (error: any) {
    console.error('Error equipping reward:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

