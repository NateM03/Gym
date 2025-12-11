import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { awardXp } from '@/lib/xp'

export async function POST(
  request: NextRequest,
  { params }: { params: { dayId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { dayId } = params
    const body = await request.json()
    const { exerciseLogs, exercisePlans } = body

    // Verify workout day exists
    const workoutDay = await prisma.workoutDay.findUnique({
      where: { id: dayId },
      include: {
        workoutPlan: true,
      },
    })

    if (!workoutDay) {
      return NextResponse.json(
        { error: 'Workout day not found' },
        { status: 404 }
      )
    }

    if (workoutDay.workoutPlan.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check if already logged today
    const today = new Date()
    const todayStart = new Date(today)
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date(today)
    todayEnd.setHours(23, 59, 59, 999)

    let workoutLog = await prisma.workoutLog.findFirst({
      where: {
        userId: session.user.id,
        workoutDayId: dayId,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    })

    if (workoutLog && workoutLog.completed) {
      return NextResponse.json(
        { error: 'Workout already completed today' },
        { status: 400 }
      )
    }

    // Create or update workout log
    if (!workoutLog) {
      workoutLog = await prisma.workoutLog.create({
        data: {
          userId: session.user.id,
          workoutDayId: dayId,
          date: today,
          completed: true,
        },
      })
    } else {
      workoutLog = await prisma.workoutLog.update({
        where: { id: workoutLog.id },
        data: { completed: true },
      })
    }

    // Update workout day exercises with planned sets/reps/rest if provided
    if (exercisePlans) {
      for (const [exerciseId, plan] of Object.entries(exercisePlans)) {
        const planData = plan as { sets: number; reps: string; restSeconds: number }
        await prisma.workoutDayExercise.updateMany({
          where: {
            workoutDayId: dayId,
            exerciseId: exerciseId,
          },
          data: {
            sets: planData.sets,
            reps: planData.reps,
            restSeconds: planData.restSeconds,
          },
        })
      }
    }

    // Create exercise logs if provided
    if (exerciseLogs && Array.isArray(exerciseLogs)) {
      await prisma.exerciseLog.createMany({
        data: exerciseLogs.map((log: any) => ({
          workoutLogId: workoutLog.id,
          exerciseId: log.exerciseId,
          setNumber: log.setNumber,
          weight: log.weight || null,
          reps: log.reps,
        })),
      })
    }

    // Calculate workouts this week
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const workoutsThisWeek = await prisma.workoutLog.count({
      where: {
        userId: session.user.id,
        date: {
          gte: weekStart,
        },
        completed: true,
      },
    })

    // Award XP
    const hasSets = exerciseLogs && exerciseLogs.length > 0
    await awardXp(session.user.id, 'workout_completed', { workoutsThisWeek })
    if (hasSets) {
      await awardXp(session.user.id, 'workout_with_sets', { workoutsThisWeek })
    }

    // Fetch complete log with exercise logs
    const completeLog = await prisma.workoutLog.findUnique({
      where: { id: workoutLog.id },
      include: {
        exerciseLogs: {
          include: {
            exercise: true,
          },
        },
      },
    })

    return NextResponse.json({ workoutLog: completeLog })
  } catch (error: any) {
    console.error('Error logging workout:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

