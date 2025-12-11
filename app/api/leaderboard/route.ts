import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const scope = searchParams.get('scope') || 'global'

    let userIds: string[] = []

    if (scope === 'friends' && session?.user?.id) {
      // Get list of users being followed
      const follows = await prisma.follow.findMany({
        where: {
          followerId: session.user.id,
        },
        select: {
          followingId: true,
        },
      })
      userIds = follows.map(f => f.followingId)
      // Include self
      userIds.push(session.user.id)
    }

    const where = scope === 'friends' && userIds.length > 0
      ? { userId: { in: userIds } }
      : {}

    const stats = await prisma.userStats.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: [
        { workoutsThisWeek: 'desc' },
        { totalXp: 'desc' },
      ],
      take: 100,
    })

    const leaderboard = stats.map((stat, index) => ({
      rank: index + 1,
      userId: stat.user.id,
      username: stat.user.username,
      totalXp: stat.totalXp,
      level: stat.level,
      workoutsThisWeek: stat.workoutsThisWeek,
      currentStreak: stat.currentStreak,
    }))

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

