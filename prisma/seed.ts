import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create exercises - comprehensive list with variations
  const exercises = [
    // Chest - Flat
    { name: 'Bench Press', muscleGroup: 'chest', equipment: 'barbell' },
    { name: 'Dumbbell Bench Press', muscleGroup: 'chest', equipment: 'dumbbells' },
    { name: 'Dumbbell Press', muscleGroup: 'chest', equipment: 'dumbbells' },
    { name: 'Barbell Bench Press', muscleGroup: 'chest', equipment: 'barbell' },
    { name: 'Dumbbell Flyes', muscleGroup: 'chest', equipment: 'dumbbells' },
    { name: 'Cable Crossover', muscleGroup: 'chest', equipment: 'cable_machine' },
    { name: 'Push-Ups', muscleGroup: 'chest', equipment: 'bodyweight' },
    { name: 'Chest Dips', muscleGroup: 'chest', equipment: 'bodyweight' },
    { name: 'Pec Deck', muscleGroup: 'chest', equipment: 'cable_machine' },
    { name: 'Cable Flyes', muscleGroup: 'chest', equipment: 'cable_machine' },
    
    // Chest - Incline
    { name: 'Incline Bench Press', muscleGroup: 'chest', equipment: 'barbell' },
    { name: 'Incline Dumbbell Press', muscleGroup: 'chest', equipment: 'dumbbells' },
    { name: 'Incline Barbell Bench Press', muscleGroup: 'chest', equipment: 'barbell' },
    { name: 'Incline Dumbbell Flyes', muscleGroup: 'chest', equipment: 'dumbbells' },
    { name: 'Incline Cable Flyes', muscleGroup: 'chest', equipment: 'cable_machine' },
    { name: 'Incline Push-Ups', muscleGroup: 'chest', equipment: 'bodyweight' },
    
    // Chest - Decline
    { name: 'Decline Bench Press', muscleGroup: 'chest', equipment: 'barbell' },
    { name: 'Decline Dumbbell Press', muscleGroup: 'chest', equipment: 'dumbbells' },
    { name: 'Decline Barbell Bench Press', muscleGroup: 'chest', equipment: 'barbell' },
    { name: 'Decline Dumbbell Flyes', muscleGroup: 'chest', equipment: 'dumbbells' },
    { name: 'Decline Push-Ups', muscleGroup: 'chest', equipment: 'bodyweight' },
    
    // Back - Rows
    { name: 'Pull-Up', muscleGroup: 'back', equipment: 'pull_up_bar' },
    { name: 'Chin-Up', muscleGroup: 'back', equipment: 'pull_up_bar' },
    { name: 'Bent-Over Row', muscleGroup: 'back', equipment: 'barbell' },
    { name: 'Barbell Row', muscleGroup: 'back', equipment: 'barbell' },
    { name: 'Dumbbell Row', muscleGroup: 'back', equipment: 'dumbbells' },
    { name: 'One-Arm Dumbbell Row', muscleGroup: 'back', equipment: 'dumbbells' },
    { name: 'T-Bar Row', muscleGroup: 'back', equipment: 'barbell' },
    { name: 'Cable Row', muscleGroup: 'back', equipment: 'cable_machine' },
    { name: 'Seated Cable Row', muscleGroup: 'back', equipment: 'cable_machine' },
    { name: 'Chest-Supported Row', muscleGroup: 'back', equipment: 'dumbbells' },
    { name: 'Incline Dumbbell Row', muscleGroup: 'back', equipment: 'dumbbells' },
    
    // Back - Pulldowns/Pullovers
    { name: 'Lat Pulldown', muscleGroup: 'back', equipment: 'cable_machine' },
    { name: 'Wide-Grip Lat Pulldown', muscleGroup: 'back', equipment: 'cable_machine' },
    { name: 'Close-Grip Lat Pulldown', muscleGroup: 'back', equipment: 'cable_machine' },
    { name: 'Reverse-Grip Lat Pulldown', muscleGroup: 'back', equipment: 'cable_machine' },
    { name: 'Cable Pullover', muscleGroup: 'back', equipment: 'cable_machine' },
    { name: 'Dumbbell Pullover', muscleGroup: 'back', equipment: 'dumbbells' },
    
    // Back - Deadlifts
    { name: 'Deadlift', muscleGroup: 'back', equipment: 'barbell' },
    { name: 'Romanian Deadlift', muscleGroup: 'back', equipment: 'barbell' },
    { name: 'Sumo Deadlift', muscleGroup: 'back', equipment: 'barbell' },
    { name: 'Dumbbell Deadlift', muscleGroup: 'back', equipment: 'dumbbells' },
    
    // Back - Shrugs/Traps
    { name: 'Shrugs', muscleGroup: 'back', equipment: 'dumbbells' },
    { name: 'Barbell Shrugs', muscleGroup: 'back', equipment: 'barbell' },
    { name: 'Dumbbell Shrugs', muscleGroup: 'back', equipment: 'dumbbells' },
    { name: 'Cable Shrugs', muscleGroup: 'back', equipment: 'cable_machine' },
    
    // Shoulders - Pressing
    { name: 'Overhead Press', muscleGroup: 'shoulders', equipment: 'barbell' },
    { name: 'Barbell Overhead Press', muscleGroup: 'shoulders', equipment: 'barbell' },
    { name: 'Dumbbell Shoulder Press', muscleGroup: 'shoulders', equipment: 'dumbbells' },
    { name: 'Seated Dumbbell Press', muscleGroup: 'shoulders', equipment: 'dumbbells' },
    { name: 'Standing Dumbbell Press', muscleGroup: 'shoulders', equipment: 'dumbbells' },
    { name: 'Arnold Press', muscleGroup: 'shoulders', equipment: 'dumbbells' },
    { name: 'Incline Dumbbell Shoulder Press', muscleGroup: 'shoulders', equipment: 'dumbbells' },
    { name: 'Cable Shoulder Press', muscleGroup: 'shoulders', equipment: 'cable_machine' },
    { name: 'Push Press', muscleGroup: 'shoulders', equipment: 'barbell' },
    
    // Shoulders - Lateral/Front/Rear
    { name: 'Lateral Raises', muscleGroup: 'shoulders', equipment: 'dumbbells' },
    { name: 'Dumbbell Lateral Raises', muscleGroup: 'shoulders', equipment: 'dumbbells' },
    { name: 'Cable Lateral Raises', muscleGroup: 'shoulders', equipment: 'cable_machine' },
    { name: 'Front Raises', muscleGroup: 'shoulders', equipment: 'dumbbells' },
    { name: 'Dumbbell Front Raises', muscleGroup: 'shoulders', equipment: 'dumbbells' },
    { name: 'Barbell Front Raises', muscleGroup: 'shoulders', equipment: 'barbell' },
    { name: 'Cable Front Raises', muscleGroup: 'shoulders', equipment: 'cable_machine' },
    { name: 'Rear Delt Flyes', muscleGroup: 'shoulders', equipment: 'dumbbells' },
    { name: 'Rear Delt Cable Flyes', muscleGroup: 'shoulders', equipment: 'cable_machine' },
    { name: 'Bent-Over Lateral Raises', muscleGroup: 'shoulders', equipment: 'dumbbells' },
    { name: 'Upright Row', muscleGroup: 'shoulders', equipment: 'barbell' },
    { name: 'Dumbbell Upright Row', muscleGroup: 'shoulders', equipment: 'dumbbells' },
    { name: 'Face Pulls', muscleGroup: 'shoulders', equipment: 'cable_machine' },
    
    // Biceps
    { name: 'Bicep Curls', muscleGroup: 'biceps', equipment: 'dumbbells' },
    { name: 'Dumbbell Bicep Curls', muscleGroup: 'biceps', equipment: 'dumbbells' },
    { name: 'Barbell Curls', muscleGroup: 'biceps', equipment: 'barbell' },
    { name: 'Hammer Curls', muscleGroup: 'biceps', equipment: 'dumbbells' },
    { name: 'Dumbbell Hammer Curls', muscleGroup: 'biceps', equipment: 'dumbbells' },
    { name: 'Cable Curls', muscleGroup: 'biceps', equipment: 'cable_machine' },
    { name: 'Cable Hammer Curls', muscleGroup: 'biceps', equipment: 'cable_machine' },
    { name: 'Preacher Curls', muscleGroup: 'biceps', equipment: 'barbell' },
    { name: 'Dumbbell Preacher Curls', muscleGroup: 'biceps', equipment: 'dumbbells' },
    { name: 'Concentration Curls', muscleGroup: 'biceps', equipment: 'dumbbells' },
    { name: 'Incline Dumbbell Curls', muscleGroup: 'biceps', equipment: 'dumbbells' },
    { name: 'Seated Dumbbell Curls', muscleGroup: 'biceps', equipment: 'dumbbells' },
    { name: 'Standing Barbell Curls', muscleGroup: 'biceps', equipment: 'barbell' },
    { name: 'Spider Curls', muscleGroup: 'biceps', equipment: 'barbell' },
    { name: '21s', muscleGroup: 'biceps', equipment: 'barbell' },
    
    // Triceps
    { name: 'Tricep Dips', muscleGroup: 'triceps', equipment: 'bodyweight' },
    { name: 'Bench Dips', muscleGroup: 'triceps', equipment: 'bodyweight' },
    { name: 'Close-Grip Bench Press', muscleGroup: 'triceps', equipment: 'barbell' },
    { name: 'Close-Grip Dumbbell Press', muscleGroup: 'triceps', equipment: 'dumbbells' },
    { name: 'Overhead Tricep Extension', muscleGroup: 'triceps', equipment: 'dumbbells' },
    { name: 'Dumbbell Overhead Extension', muscleGroup: 'triceps', equipment: 'dumbbells' },
    { name: 'Cable Overhead Extension', muscleGroup: 'triceps', equipment: 'cable_machine' },
    { name: 'Tricep Pushdown', muscleGroup: 'triceps', equipment: 'cable_machine' },
    { name: 'Cable Tricep Pushdown', muscleGroup: 'triceps', equipment: 'cable_machine' },
    { name: 'Rope Pushdown', muscleGroup: 'triceps', equipment: 'cable_machine' },
    { name: 'Skull Crushers', muscleGroup: 'triceps', equipment: 'barbell' },
    { name: 'Dumbbell Skull Crushers', muscleGroup: 'triceps', equipment: 'dumbbells' },
    { name: 'Diamond Push-Ups', muscleGroup: 'triceps', equipment: 'bodyweight' },
    { name: 'Tricep Kickbacks', muscleGroup: 'triceps', equipment: 'dumbbells' },
    { name: 'Cable Tricep Kickbacks', muscleGroup: 'triceps', equipment: 'cable_machine' },
    { name: 'Overhead Cable Extension', muscleGroup: 'triceps', equipment: 'cable_machine' },
    
    // Legs - Quads
    { name: 'Squat', muscleGroup: 'quadriceps', equipment: 'barbell' },
    { name: 'Barbell Squat', muscleGroup: 'quadriceps', equipment: 'barbell' },
    { name: 'Front Squat', muscleGroup: 'quadriceps', equipment: 'barbell' },
    { name: 'Goblet Squat', muscleGroup: 'quadriceps', equipment: 'dumbbells' },
    { name: 'Dumbbell Squat', muscleGroup: 'quadriceps', equipment: 'dumbbells' },
    { name: 'Leg Press', muscleGroup: 'quadriceps', equipment: 'cable_machine' },
    { name: 'Leg Extension', muscleGroup: 'quadriceps', equipment: 'cable_machine' },
    { name: 'Bulgarian Split Squat', muscleGroup: 'quadriceps', equipment: 'dumbbells' },
    { name: 'Lunges', muscleGroup: 'quadriceps', equipment: 'dumbbells' },
    { name: 'Walking Lunges', muscleGroup: 'quadriceps', equipment: 'dumbbells' },
    { name: 'Reverse Lunges', muscleGroup: 'quadriceps', equipment: 'dumbbells' },
    { name: 'Step-Ups', muscleGroup: 'quadriceps', equipment: 'dumbbells' },
    { name: 'Hack Squat', muscleGroup: 'quadriceps', equipment: 'cable_machine' },
    { name: 'Sissy Squat', muscleGroup: 'quadriceps', equipment: 'bodyweight' },
    
    // Legs - Hamstrings
    { name: 'Romanian Deadlift', muscleGroup: 'hamstrings', equipment: 'barbell' },
    { name: 'Leg Curl', muscleGroup: 'hamstrings', equipment: 'cable_machine' },
    { name: 'Stiff-Leg Deadlift', muscleGroup: 'hamstrings', equipment: 'barbell' },
    { name: 'Good Mornings', muscleGroup: 'hamstrings', equipment: 'barbell' },
    { name: 'Nordic Curls', muscleGroup: 'hamstrings', equipment: 'bodyweight' },
    
    // Legs - Calves
    { name: 'Calf Raises', muscleGroup: 'calves', equipment: 'dumbbells' },
    { name: 'Standing Calf Raises', muscleGroup: 'calves', equipment: 'barbell' },
    { name: 'Seated Calf Raises', muscleGroup: 'calves', equipment: 'cable_machine' },
    { name: 'Donkey Calf Raises', muscleGroup: 'calves', equipment: 'bodyweight' },
    
    // Legs - Glutes
    { name: 'Hip Thrust', muscleGroup: 'glutes', equipment: 'barbell' },
    { name: 'Glute Bridge', muscleGroup: 'glutes', equipment: 'barbell' },
    { name: 'Romanian Deadlift', muscleGroup: 'glutes', equipment: 'barbell' },
    { name: 'Lunges', muscleGroup: 'glutes', equipment: 'dumbbells' },
    
    // Core
    { name: 'Plank', muscleGroup: 'core', equipment: 'bodyweight' },
    { name: 'Crunches', muscleGroup: 'core', equipment: 'bodyweight' },
    { name: 'Russian Twists', muscleGroup: 'core', equipment: 'bodyweight' },
    { name: 'Leg Raises', muscleGroup: 'core', equipment: 'bodyweight' },
  ]

  console.log('Creating exercises...')
  for (const exercise of exercises) {
    const existing = await prisma.exercise.findFirst({
      where: { name: exercise.name },
    })
    if (!existing) {
      await prisma.exercise.create({
        data: exercise,
      })
    }
  }

  // Create rewards
  const rewards = [
    { name: 'Starter Avatar', type: 'avatar', requiredLevel: 1 },
    { name: 'Bronze Badge', type: 'badge', requiredLevel: 2 },
    { name: 'Silver Badge', type: 'badge', requiredLevel: 3 },
    { name: '7-Day Streak Medal', type: 'medal', requiredStreak: 7 },
    { name: 'Gold Badge', type: 'badge', requiredLevel: 5 },
    { name: 'Platinum Avatar', type: 'avatar', requiredLevel: 7 },
  ]

  console.log('Creating rewards...')
  for (const reward of rewards) {
    const existing = await prisma.reward.findFirst({
      where: { name: reward.name },
    })
    if (!existing) {
      await prisma.reward.create({
        data: reward,
      })
    }
  }

  // Create sample users
  const passwordHash = await bcrypt.hash('password123', 10)

  const users = [
    {
      email: 'alice@example.com',
      username: 'alice',
      passwordHash,
    },
    {
      email: 'bob@example.com',
      username: 'bob',
      passwordHash,
    },
    {
      email: 'carol@example.com',
      username: 'carol',
      passwordHash,
    },
  ]

  console.log('Creating sample users...')
  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        profile: {
          create: {
            age: 25,
            heightCm: 170,
            weightKg: 70,
            sex: 'female',
            experienceLevel: 'intermediate',
            goal: 'build_muscle',
            daysPerWeek: 4,
            equipment: ['dumbbells', 'barbell', 'bench'],
          },
        },
        stats: {
          create: {
            totalXp: Math.floor(Math.random() * 5000),
            level: Math.floor(Math.random() * 5) + 1,
            currentStreak: Math.floor(Math.random() * 10),
            longestStreak: Math.floor(Math.random() * 15) + 5,
            workoutsThisWeek: Math.floor(Math.random() * 5),
          },
        },
      },
    })

    // Unlock some rewards for sample users
    const userStats = await prisma.userStats.findUnique({
      where: { userId: user.id },
    })

    if (userStats) {
      const availableRewards = await prisma.reward.findMany({
        where: {
          OR: [
            { requiredLevel: { lte: userStats.level } },
            { requiredStreak: { lte: userStats.currentStreak } },
          ],
        },
      })

      for (const reward of availableRewards.slice(0, 2)) {
        const existing = await prisma.userReward.findUnique({
          where: {
            userId_rewardId: {
              userId: user.id,
              rewardId: reward.id,
            },
          },
        })

        if (!existing) {
          await prisma.userReward.create({
            data: {
              userId: user.id,
              rewardId: reward.id,
              equipped: false,
            },
          })
        }
      }
    }
  }

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

