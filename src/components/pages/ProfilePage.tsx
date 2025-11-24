import { ProfileCard } from '../profile/ProfileCard'
import { FriendList } from '../friends/FriendList'
import { NotificationPreferences } from '../notifications/NotificationPreferences'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Users } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  username: string
}

interface Friend {
  id: string
  name: string
  username: string
  email: string
  balance: number
}

interface ProfilePageProps {
  user: User
  friends: Friend[]
  loading: boolean
  onLogout: () => Promise<void>
  onSettle: (friendId: string, amount: number, method: string) => Promise<void>
}

export function ProfilePage({ user, friends, loading, onLogout, onSettle }: ProfilePageProps) {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl">Profile</h1>
      
      <ProfileCard user={user} onLogout={onLogout} />
      
      {/* Notification Preferences */}
      <NotificationPreferences userId={user.id} />
      
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-medium">My Friends</h3>
              <p className="text-sm text-gray-600">
                {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading friends...</div>
          ) : (
            <FriendList friends={friends} onSettle={onSettle} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
