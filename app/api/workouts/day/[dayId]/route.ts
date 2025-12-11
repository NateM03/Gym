import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { dayId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { dayId } = params

    const workoutDay = await prisma.workoutDay.findUnique({
      where: { id: dayId },
      include: {
        workoutPlan: {
          include: {
            user: true,
          },
        },
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    if (!workoutDay) {
      return NextResponse.json({ error: 'Workout day not found' }, { status: 404 })
    }

    if (workoutDay.workoutPlan.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ workoutDay })
  } catch (error) {
    console.error('Error fetching workout day:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

