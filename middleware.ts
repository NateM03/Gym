export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/plans/:path*', '/leaderboard/:path*', '/settings/:path*', '/workouts/:path*'],
}

