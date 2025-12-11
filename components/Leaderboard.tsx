'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  totalXp: number
  level: number
  workoutsThisWeek: number
  currentStreak: number
}

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
  onFollow?: (userId: string) => void
  onUnfollow?: (userId: string) => void
  following?: string[]
}

export function Leaderboard({
  entries,
  currentUserId,
  onFollow,
  onUnfollow,
  following = [],
}: LeaderboardProps) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500'
    if (rank === 2) return 'text-gray-400'
    if (rank === 3) return 'text-orange-600'
    return 'text-muted-foreground'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
        <CardDescription>Top performers this week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.userId}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`font-bold text-lg w-8 ${getRankColor(entry.rank)}`}>
                  #{entry.rank}
                </div>
                <Avatar>
                  <AvatarFallback>
                    {entry.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{entry.username}</span>
                    {entry.userId === currentUserId && (
                      <Badge variant="secondary">You</Badge>
                    )}
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    <span>Level {entry.level}</span>
                    <span>{entry.workoutsThisWeek} workouts</span>
                    <span>🔥 {entry.currentStreak} day streak</span>
                  </div>
                </div>
              </div>
              {entry.userId !== currentUserId && (
                <div>
                  {following.includes(entry.userId) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUnfollow?.(entry.userId)}
                    >
                      Unfollow
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onFollow?.(entry.userId)}
                    >
                      Follow
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

