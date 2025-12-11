'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function OnboardingPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    age: '',
    heightFeet: '',
    heightInches: '',
    weightLbs: '',
    sex: 'male',
    experienceLevel: 'beginner',
    goal: 'build_muscle',
    daysPerWeek: '3',
    equipment: [] as string[],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const equipmentOptions = [
    { 
      id: 'public_gym', 
      label: 'Public/Commercial Gym', 
      description: 'Access to a full gym with most equipment (machines, free weights, cable machines, etc.)',
      equipment: ['dumbbells', 'barbell', 'squat_rack', 'bench', 'cable_machine', 'pull_up_bar', 'machines', 'kettlebells']
    },
    { 
      id: 'home_gym_limited', 
      label: 'In-Home Gym (Limited Equipment)', 
      description: 'Dumbbells, barbell, and bench (or similar basic equipment)',
      equipment: ['dumbbells', 'barbell', 'bench']
    },
  ]

  const toggleEquipment = (itemId: string) => {
    const selectedOption = equipmentOptions.find(opt => opt.id === itemId)
    
    if (!selectedOption) return

    if (formData.equipment.includes(itemId)) {
      // Deselect this option and all its equipment
      setFormData({
        ...formData,
        equipment: [],
      })
    } else {
      // Select this option and its associated equipment
      setFormData({
        ...formData,
        equipment: [itemId, ...selectedOption.equipment],
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.equipment.length === 0) {
      setError('Please select your workout setup (Public Gym or Home Gym)')
      return
    }

    // Validate height
    if (!formData.heightFeet || !formData.heightInches) {
      setError('Please enter both feet and inches for height')
      return
    }

    const feet = parseInt(formData.heightFeet)
    const inches = parseInt(formData.heightInches)
    
    if (isNaN(feet) || isNaN(inches) || feet < 3 || feet > 8 || inches < 0 || inches >= 12) {
      setError('Please enter a valid height (e.g., 5 feet 7 inches)')
      return
    }

    // Convert feet and inches to centimeters
    // 1 foot = 30.48 cm, 1 inch = 2.54 cm
    const heightCm = Math.round((feet * 30.48) + (inches * 2.54))

    // Convert pounds to kilograms
    // 1 lb = 0.453592 kg
    const weightKg = parseFloat(formData.weightLbs) * 0.453592

    if (isNaN(weightKg) || weightKg < 20 || weightKg > 300) {
      setError('Please enter a valid weight (50-700 lbs)')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/me/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: parseInt(formData.age),
          heightCm: heightCm,
          weightKg: Math.round(weightKg * 10) / 10, // Round to 1 decimal place
          sex: formData.sex,
          experienceLevel: formData.experienceLevel,
          goal: formData.goal,
          daysPerWeek: parseInt(formData.daysPerWeek),
          equipment: formData.equipment,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to save profile')
        return
      }

      router.push('/dashboard')
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>Help us create a personalized workout plan for you</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="age" className="text-sm font-medium">
                  Age
                </label>
                <input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                  min="13"
                  max="100"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Height
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="heightFeet"
                    type="number"
                    value={formData.heightFeet}
                    onChange={(e) => setFormData({ ...formData, heightFeet: e.target.value })}
                    required
                    min="3"
                    max="8"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <span className="text-sm font-medium">ft</span>
                  <input
                    id="heightInches"
                    type="number"
                    value={formData.heightInches}
                    onChange={(e) => setFormData({ ...formData, heightInches: e.target.value })}
                    required
                    min="0"
                    max="11"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <span className="text-sm font-medium">in</span>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="weightLbs" className="text-sm font-medium">
                  Weight (lbs)
                </label>
                <input
                  id="weightLbs"
                  type="number"
                  value={formData.weightLbs}
                  onChange={(e) => setFormData({ ...formData, weightLbs: e.target.value })}
                  required
                  min="50"
                  max="700"
                  step="0.1"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="sex" className="text-sm font-medium">
                  Sex
                </label>
                <select
                  id="sex"
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="experienceLevel" className="text-sm font-medium">
                  Experience Level
                </label>
                <select
                  id="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="goal" className="text-sm font-medium">
                  Goal
                </label>
                <select
                  id="goal"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="build_muscle">Build Muscle</option>
                  <option value="lose_weight">Lose Weight</option>
                  <option value="strength">Build Strength</option>
                  <option value="endurance">Improve Endurance</option>
                  <option value="general_fitness">General Fitness</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="daysPerWeek" className="text-sm font-medium">
                  Average Days per Week
                </label>
                <select
                  id="daysPerWeek"
                  value={formData.daysPerWeek}
                  onChange={(e) => setFormData({ ...formData, daysPerWeek: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="1">1 day</option>
                  <option value="2">2 days</option>
                  <option value="3">3 days</option>
                  <option value="4">4 days</option>
                  <option value="5">5 days</option>
                  <option value="6">6 days</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Available Equipment</label>
                <p className="text-xs text-muted-foreground mt-1 mb-3">
                  Select the option that best describes your workout setup.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {equipmentOptions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleEquipment(item.id)}
                    className={`p-5 border-2 rounded-lg text-left transition-all ${
                      formData.equipment.includes(item.id)
                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                        : 'hover:bg-accent hover:border-accent-foreground/20 border-border'
                    }`}
                  >
                    <div className="font-semibold text-base mb-2">{item.label}</div>
                    <div className={`text-sm ${
                      formData.equipment.includes(item.id)
                        ? 'text-primary-foreground/90'
                        : 'text-muted-foreground'
                    }`}>
                      {item.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Saving...' : 'Complete Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

