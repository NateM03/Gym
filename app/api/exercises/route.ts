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

    const { searchParams } = new URL(request.url)
    const muscleGroup = searchParams.get('muscleGroup')
    const equipment = searchParams.get('equipment')
    const search = searchParams.get('search')?.toLowerCase()

    const where: any = {}
    if (muscleGroup) {
      where.muscleGroup = muscleGroup
    }
    if (equipment) {
      where.equipment = equipment
    }
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      }
    }

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({ exercises })
  } catch (error) {
    console.error('Error fetching exercises:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

