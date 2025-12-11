import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateWorkoutPlan } from '@/lib/generator'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has a profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Please complete your profile first' },
        { status: 400 }
      )
    }

    // Check how many plans user already has
    const planCount = await prisma.workoutPlan.count({
      where: {
        userId: session.user.id,
      },
    })

    if (planCount >= 4) {
      return NextResponse.json(
        { error: 'You can only have up to 4 workout plans. Please delete one to create a new one.' },
        { status: 400 }
      )
    }

    // Get routine type and custom exercises from request body
    const body = await request.json().catch(() => ({}))
    const routineType = body.routineType || null
    const customDays = body.days || null

    let planData: any

    // If custom days are provided, use them directly
    if (customDays && Array.isArray(customDays)) {
      const profile = await prisma.userProfile.findUnique({
        where: { userId: session.user.id },
      })
      
      if (!profile) {
        return NextResponse.json(
          { error: 'Please complete your profile first' },
          { status: 400 }
        )
      }

      planData = {
        name: routineType === 'ppl' ? 'Push/Pull/Legs (Custom)' :
              routineType === 'arnold' ? 'Arnold Split (Custom)' :
              routineType === 'upperlower' ? 'Upper/Lower Split (Custom)' :
              'Full Body (Custom)',
        goal: profile.goal,
        days: customDays,
      }
    } else {
      // Generate new plan using generator
      planData = await generateWorkoutPlan(session.user.id, routineType)
    }

    // Create plan in database (set as inactive initially, user can activate it)
    const plan = await prisma.workoutPlan.create({
      data: {
        userId: session.user.id,
        name: planData.name,
        goal: planData.goal,
        active: false, // New plans are inactive by default
        days: {
          create: planData.days.map(day => ({
            dayIndex: day.dayIndex,
            title: day.title,
            exercises: {
              create: day.exercises.map(ex => ({
                exerciseId: ex.exerciseId,
                order: ex.order,
                sets: ex.sets,
                reps: ex.reps,
                restSeconds: ex.restSeconds,
              })),
            },
          })),
        },
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

    return NextResponse.json({ plan })
  } catch (error: any) {
    console.error('Error generating plan:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

