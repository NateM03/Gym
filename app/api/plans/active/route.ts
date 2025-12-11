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

    const plan = await prisma.workoutPlan.findFirst({
      where: {
        userId: session.user.id,
        active: true,
      },
      include: {
        days: {
          include: {
            exercises: {
              include: {
                exercise: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            dayIndex: 'asc',
          },
        },
      },
    })

    if (!plan) {
      return NextResponse.json({ plan: null })
    }

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Error fetching active plan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

