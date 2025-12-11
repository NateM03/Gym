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

    // Get active plan
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

    if (!plan || plan.days.length === 0) {
      return NextResponse.json({ workoutDay: null })
    }

    // Determine which day of the week (0 = Sunday, 1 = Monday, etc.)
    const today = new Date()
    const dayOfWeek = today.getDay()
    
    // Map to our plan: Monday = 0, Tuesday = 1, etc.
    // For simplicity, we'll cycle through days based on plan start date
    const daysSinceStart = Math.floor(
      (today.getTime() - plan.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    )
    const dayIndex = daysSinceStart % plan.days.length

    const workoutDay = plan.days[dayIndex]

    // Check if already logged today
    const todayStart = new Date(today)
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date(today)
    todayEnd.setHours(23, 59, 59, 999)

    const existingLog = await prisma.workoutLog.findFirst({
      where: {
        userId: session.user.id,
        workoutDayId: workoutDay.id,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    })

    return NextResponse.json({
      workoutDay: {
        ...workoutDay,
        completed: existingLog?.completed || false,
        logId: existingLog?.id,
      },
    })
  } catch (error) {
    console.error('Error fetching today\'s workout:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

