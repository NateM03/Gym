import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { age, heightCm, weightKg, sex, experienceLevel, goal, daysPerWeek, equipment } = body

    if (!age || !heightCm || !weightKg || !sex || !experienceLevel || !goal || !daysPerWeek || !equipment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const profile = await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      update: {
        age,
        heightCm,
        weightKg,
        sex,
        experienceLevel,
        goal,
        daysPerWeek,
        equipment,
      },
      create: {
        userId: session.user.id,
        age,
        heightCm,
        weightKg,
        sex,
        experienceLevel,
        goal,
        daysPerWeek,
        equipment,
      },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

