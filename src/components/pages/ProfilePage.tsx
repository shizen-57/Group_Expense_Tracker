import { ProfileCard } from '../profile/ProfileCard'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  username: string
}

interface ProfilePageProps {
  user: User
  onLogout: () => Promise<void>
}

export function ProfilePage({ user, onLogout }: ProfilePageProps) {
  return (
    <div className="space-y-6">
      <h2>Profile</h2>
      <ProfileCard user={user} onLogout={onLogout} />
    </div>
  )
}
