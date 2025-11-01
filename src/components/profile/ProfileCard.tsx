import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { UserCircle2, Mail, Phone, AtSign, LogOut } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  username: string
}

interface ProfileCardProps {
  user: User
  onLogout: () => void
}

export function ProfileCard({ user, onLogout }: ProfileCardProps) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <UserCircle2 className="h-20 w-20 text-gray-400" />
          <div>
            <h3>{user.name}</h3>
            <p className="text-gray-500">@{user.username}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p>{user.email}</p>
            </div>
          </div>

          {user.phone && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p>{user.phone}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <AtSign className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Username</p>
              <p>@{user.username}</p>
            </div>
          </div>
        </div>

        <Button 
          variant="destructive" 
          className="w-full"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </CardContent>
    </Card>
  )
}
