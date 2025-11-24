import { Card, CardContent } from '../ui/card'
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
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-100 rounded-full">
              <UserCircle2 className="h-12 w-12 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl mb-1">{user.name}</h2>
              <p className="text-sm text-gray-600">@{user.username}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm">{user.email}</p>
            </div>
          </div>

          {user.phone && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm">{user.phone}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <AtSign className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Username</p>
              <p className="text-sm">@{user.username}</p>
            </div>
          </div>
        </div>

        <Button 
          variant="outline"
          className="w-full rounded-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </CardContent>
    </Card>
  )
}
