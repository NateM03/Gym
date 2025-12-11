import { prisma } from './prisma'

export interface WorkoutPlanData {
  name: string
  goal: string
  days: Array<{
    dayIndex: number
    title: string
    exercises: Array<{
      exerciseId: string
      order: number
      sets: number
      reps: string
      restSeconds?: number
    }>
  }>
}

export async function generateWorkoutPlan(userId: string, routineType?: 'fullbody' | 'upperlower' | 'ppl' | 'arnold' | null): Promise<WorkoutPlanData> {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  })

  if (!profile) {
    throw new Error('User profile not found')
  }

  const { daysPerWeek, experienceLevel, goal, equipment } = profile
  const equipmentList = equipment as string[]

  // Filter out option IDs (public_gym, home_gym_limited) and keep only actual equipment
  const actualEquipment = equipmentList.filter(eq => 
    eq !== 'public_gym' && eq !== 'home_gym_limited'
  )

  // Get available exercises based on equipment
  const availableExercises = await prisma.exercise.findMany({
    where: {
      equipment: {
        in: actualEquipment,
      },
    },
  })

  if (availableExercises.length === 0) {
    throw new Error('No exercises available for selected equipment')
  }

  let planType: 'fullbody' | 'upperlower' | 'ppl' | 'arnold'
  let planName: string
  let days: Array<{ dayIndex: number; title: string; exercises: any[] }>

  // Use selected routine type, or fall back to auto-determine based on days per week
  if (routineType) {
    planType = routineType
    switch (routineType) {
      case 'fullbody':
        planName = 'Full Body (3-Day)'
        days = generateFullBodyPlan(availableExercises, goal)
        break
      case 'upperlower':
        planName = 'Upper/Lower Split (4-Day)'
        days = generateUpperLowerPlan(availableExercises, goal)
        break
      case 'ppl':
        planName = 'Push/Pull/Legs (6-Day)'
        days = generatePPLPlan(availableExercises, goal, 6)
        break
      case 'arnold':
        planName = 'Arnold Split (6-Day)'
        days = generateArnoldPlan(availableExercises, goal)
        break
    }
  } else {
    // Fallback: Determine plan type based on days per week and experience
    if (daysPerWeek === 3) {
      planType = 'fullbody'
      planName = 'Full Body (3-Day)'
      days = generateFullBodyPlan(availableExercises, goal)
    } else if (daysPerWeek === 4) {
      planType = 'upperlower'
      planName = 'Upper/Lower Split (4-Day)'
      days = generateUpperLowerPlan(availableExercises, goal)
    } else if (daysPerWeek >= 5) {
      planType = 'ppl'
      planName = 'Push/Pull/Legs (5-6 Day)'
      days = generatePPLPlan(availableExercises, goal, daysPerWeek)
    } else {
      // Default to full body for 1-2 days
      planType = 'fullbody'
      planName = 'Full Body'
      days = generateFullBodyPlan(availableExercises, goal).slice(0, daysPerWeek)
    }
  }

  return {
    name: planName,
    goal: profile.goal,
    days,
  }
}

function generateFullBodyPlan(exercises: any[], goal: string): Array<{ dayIndex: number; title: string; exercises: any[] }> {
  const pushExercises = exercises.filter(e => 
    ['chest', 'shoulders', 'triceps'].includes(e.muscleGroup.toLowerCase())
  )
  const pullExercises = exercises.filter(e => 
    ['back', 'biceps'].includes(e.muscleGroup.toLowerCase())
  )
  const legsExercises = exercises.filter(e => 
    ['legs', 'quadriceps', 'hamstrings', 'glutes', 'calves'].includes(e.muscleGroup.toLowerCase())
  )
  const coreExercises = exercises.filter(e => 
    ['core', 'abs'].includes(e.muscleGroup.toLowerCase())
  )

  const getReps = (goal: string) => {
    if (goal === 'build_muscle') return '8-12'
    if (goal === 'strength') return '4-6'
    if (goal === 'endurance') return '15-20'
    return '10-15'
  }

  const reps = getReps(goal)
  const sets = goal === 'strength' ? 4 : 3

  return [
    {
      dayIndex: 0,
      title: 'Full Body A',
      exercises: [
        { exercise: legsExercises[0] || exercises[0], order: 1, sets, reps, restSeconds: 90 },
        { exercise: pushExercises[0] || exercises[1], order: 2, sets, reps, restSeconds: 90 },
        { exercise: pullExercises[0] || exercises[2], order: 3, sets, reps, restSeconds: 90 },
        { exercise: legsExercises[1] || exercises[3], order: 4, sets, reps, restSeconds: 60 },
        { exercise: coreExercises[0] || exercises[4], order: 5, sets: 3, reps: '10-15', restSeconds: 45 },
      ].filter(e => e.exercise).map((e, idx) => ({
        exerciseId: e.exercise.id,
        order: idx + 1,
        sets: e.sets,
        reps: e.reps,
        restSeconds: e.restSeconds,
      })),
    },
    {
      dayIndex: 1,
      title: 'Full Body B',
      exercises: [
        { exercise: pullExercises[0] || exercises[0], order: 1, sets, reps, restSeconds: 90 },
        { exercise: pushExercises[1] || exercises[1], order: 2, sets, reps, restSeconds: 90 },
        { exercise: legsExercises[0] || exercises[2], order: 3, sets, reps, restSeconds: 90 },
        { exercise: pullExercises[1] || exercises[3], order: 4, sets, reps, restSeconds: 60 },
        { exercise: coreExercises[0] || exercises[4], order: 5, sets: 3, reps: '10-15', restSeconds: 45 },
      ].filter(e => e.exercise).map((e, idx) => ({
        exerciseId: e.exercise.id,
        order: idx + 1,
        sets: e.sets,
        reps: e.reps,
        restSeconds: e.restSeconds,
      })),
    },
    {
      dayIndex: 2,
      title: 'Full Body C',
      exercises: [
        { exercise: pushExercises[0] || exercises[0], order: 1, sets, reps, restSeconds: 90 },
        { exercise: legsExercises[1] || exercises[1], order: 2, sets, reps, restSeconds: 90 },
        { exercise: pullExercises[1] || exercises[2], order: 3, sets, reps, restSeconds: 90 },
        { exercise: pushExercises[1] || exercises[3], order: 4, sets, reps, restSeconds: 60 },
        { exercise: coreExercises[0] || exercises[4], order: 5, sets: 3, reps: '10-15', restSeconds: 45 },
      ].filter(e => e.exercise).map((e, idx) => ({
        exerciseId: e.exercise.id,
        order: idx + 1,
        sets: e.sets,
        reps: e.reps,
        restSeconds: e.restSeconds,
      })),
    },
  ]
}

function generateUpperLowerPlan(exercises: any[], goal: string): Array<{ dayIndex: number; title: string; exercises: any[] }> {
  const upperExercises = exercises.filter(e => 
    ['chest', 'shoulders', 'triceps', 'back', 'biceps'].includes(e.muscleGroup.toLowerCase())
  )
  const lowerExercises = exercises.filter(e => 
    ['legs', 'quadriceps', 'hamstrings', 'glutes', 'calves'].includes(e.muscleGroup.toLowerCase())
  )
  const coreExercises = exercises.filter(e => 
    ['core', 'abs'].includes(e.muscleGroup.toLowerCase())
  )

  const getReps = (goal: string) => {
    if (goal === 'build_muscle') return '8-12'
    if (goal === 'strength') return '4-6'
    if (goal === 'endurance') return '15-20'
    return '10-15'
  }

  const reps = getReps(goal)
  const sets = goal === 'strength' ? 4 : 3

  return [
    {
      dayIndex: 0,
      title: 'Upper Body A',
      exercises: [
        ...upperExercises.slice(0, 4).map((e, idx) => ({
          exerciseId: e.id,
          order: idx + 1,
          sets,
          reps,
          restSeconds: 90,
        })),
        ...(coreExercises[0] ? [{
          exerciseId: coreExercises[0].id,
          order: 5,
          sets: 3,
          reps: '10-15',
          restSeconds: 45,
        }] : []),
      ],
    },
    {
      dayIndex: 1,
      title: 'Lower Body A',
      exercises: lowerExercises.slice(0, 4).map((e, idx) => ({
        exerciseId: e.id,
        order: idx + 1,
        sets,
        reps,
        restSeconds: 90,
      })),
    },
    {
      dayIndex: 2,
      title: 'Upper Body B',
      exercises: [
        ...upperExercises.slice(4, 8).length > 0 
          ? upperExercises.slice(4, 8).map((e, idx) => ({
              exerciseId: e.id,
              order: idx + 1,
              sets,
              reps,
              restSeconds: 90,
            }))
          : upperExercises.slice(0, 4).map((e, idx) => ({
              exerciseId: e.id,
              order: idx + 1,
              sets,
              reps,
              restSeconds: 90,
            })),
        ...(coreExercises[0] ? [{
          exerciseId: coreExercises[0].id,
          order: 5,
          sets: 3,
          reps: '10-15',
          restSeconds: 45,
        }] : []),
      ],
    },
    {
      dayIndex: 3,
      title: 'Lower Body B',
      exercises: lowerExercises.slice(4, 8).length > 0
        ? lowerExercises.slice(4, 8).map((e, idx) => ({
            exerciseId: e.id,
            order: idx + 1,
            sets,
            reps,
            restSeconds: 90,
          }))
        : lowerExercises.slice(0, 4).map((e, idx) => ({
            exerciseId: e.id,
            order: idx + 1,
            sets,
            reps,
            restSeconds: 90,
          })),
    },
  ]
}

function generatePPLPlan(exercises: any[], goal: string, daysPerWeek: number): Array<{ dayIndex: number; title: string; exercises: any[] }> {
  const pushExercises = exercises.filter(e => 
    ['chest', 'shoulders', 'triceps'].includes(e.muscleGroup.toLowerCase())
  )
  const pullExercises = exercises.filter(e => 
    ['back', 'biceps'].includes(e.muscleGroup.toLowerCase())
  )
  const legsExercises = exercises.filter(e => 
    ['legs', 'quadriceps', 'hamstrings', 'glutes', 'calves'].includes(e.muscleGroup.toLowerCase())
  )

  const getReps = (goal: string) => {
    if (goal === 'build_muscle') return '8-12'
    if (goal === 'strength') return '4-6'
    if (goal === 'endurance') return '15-20'
    return '10-15'
  }

  const reps = getReps(goal)
  const sets = goal === 'strength' ? 4 : 3

  const pushDay = {
    dayIndex: 0,
    title: 'Push',
    exercises: pushExercises.slice(0, 5).map((e, idx) => ({
      exerciseId: e.id,
      order: idx + 1,
      sets,
      reps,
      restSeconds: 90,
    })),
  }

  const pullDay = {
    dayIndex: 1,
    title: 'Pull',
    exercises: pullExercises.slice(0, 5).map((e, idx) => ({
      exerciseId: e.id,
      order: idx + 1,
      sets,
      reps,
      restSeconds: 90,
    })),
  }

  const legsDay = {
    dayIndex: 2,
    title: 'Legs',
    exercises: legsExercises.slice(0, 5).map((e, idx) => ({
      exerciseId: e.id,
      order: idx + 1,
      sets,
      reps,
      restSeconds: 90,
    })),
  }

  if (daysPerWeek === 5) {
    return [pushDay, pullDay, legsDay, pushDay, pullDay]
  } else {
    // 6 days
    return [pushDay, pullDay, legsDay, pushDay, pullDay, legsDay]
  }
}

function generateArnoldPlan(exercises: any[], goal: string): Array<{ dayIndex: number; title: string; exercises: any[] }> {
  const chestExercises = exercises.filter(e => 
    ['chest'].includes(e.muscleGroup.toLowerCase())
  )
  const backExercises = exercises.filter(e => 
    ['back'].includes(e.muscleGroup.toLowerCase())
  )
  const shoulderExercises = exercises.filter(e => 
    ['shoulders'].includes(e.muscleGroup.toLowerCase())
  )
  const armExercises = exercises.filter(e => 
    ['biceps', 'triceps'].includes(e.muscleGroup.toLowerCase())
  )
  const legsExercises = exercises.filter(e => 
    ['legs', 'quadriceps', 'hamstrings', 'glutes', 'calves'].includes(e.muscleGroup.toLowerCase())
  )

  const getReps = (goal: string) => {
    if (goal === 'build_muscle') return '8-12'
    if (goal === 'strength') return '4-6'
    if (goal === 'endurance') return '15-20'
    return '10-15'
  }

  const reps = getReps(goal)
  const sets = goal === 'strength' ? 4 : 3

  const chestBackDay = {
    dayIndex: 0,
    title: 'Chest & Back',
    exercises: [
      ...chestExercises.slice(0, 3).map((e, idx) => ({
        exerciseId: e.id,
        order: idx + 1,
        sets,
        reps,
        restSeconds: 90,
      })),
      ...backExercises.slice(0, 3).map((e, idx) => ({
        exerciseId: e.id,
        order: idx + 4,
        sets,
        reps,
        restSeconds: 90,
      })),
    ],
  }

  const shouldersArmsDay = {
    dayIndex: 1,
    title: 'Shoulders & Arms',
    exercises: [
      ...shoulderExercises.slice(0, 3).map((e, idx) => ({
        exerciseId: e.id,
        order: idx + 1,
        sets,
        reps,
        restSeconds: 90,
      })),
      ...armExercises.slice(0, 3).map((e, idx) => ({
        exerciseId: e.id,
        order: idx + 4,
        sets,
        reps,
        restSeconds: 90,
      })),
    ],
  }

  const legsDay = {
    dayIndex: 2,
    title: 'Legs',
    exercises: legsExercises.slice(0, 5).map((e, idx) => ({
      exerciseId: e.id,
      order: idx + 1,
      sets,
      reps,
      restSeconds: 90,
    })),
  }

  // Arnold split is always 6 days: repeat the 3-day cycle
  return [chestBackDay, shouldersArmsDay, legsDay, chestBackDay, shouldersArmsDay, legsDay]
}

