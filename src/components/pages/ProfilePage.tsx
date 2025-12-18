import { ProfileCard } from '../profile/ProfileCard'
import { FriendList } from '../friends/FriendList'
import { NotificationPreferences } from '../notifications/NotificationPreferences'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { Users, Sparkles } from 'lucide-react'

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
  const roster = Array.isArray(friends) ? friends : []
  const friendCount = roster.length
  const owedToYou = roster.reduce((sum, friend) => sum + Math.max(friend.balance, 0), 0)
  const youOwe = roster.reduce((sum, friend) => sum + Math.max(-friend.balance, 0), 0)
  const neutral = friendCount - roster.filter(friend => friend.balance !== 0).length

  const firstName = user?.name?.split(' ')[0] || user.username

  const profileStats = [
    { label: 'Friends', value: friendCount.toString(), hint: 'Across crews' },
    { label: 'They owe you', value: `৳${owedToYou.toFixed(0)}`, hint: 'Positive balances' },
    { label: 'You owe', value: `৳${youOwe.toFixed(0)}`, hint: 'Settle this week' }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16">
      <section className="rounded-[36px] bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900 p-10 text-white">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm uppercase tracking-[0.5em] text-emerald-200">
              <Sparkles className="h-4 w-4" /> Profile hub
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-semibold">Hi {firstName}, keep the network warm</h1>
              <p className="mt-3 text-white/70 max-w-2xl">Review your identity, tweak notifications, and see who needs a nudge before month close.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button className="rounded-full bg-white text-gray-900 hover:bg-white/90" onClick={onLogout}>
                Sign out everywhere
              </Button>
              <Button
                variant="secondary"
                className="rounded-full border-white/40 text-white hover:bg-white/10"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(user.username)
                  }
                }}
              >
                Copy @handle
              </Button>
            </div>
          </div>
          <div className="grid w-full max-w-sm gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {profileStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.4em] text-white/70">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
                <p className="text-xs text-white/60 mt-1">{stat.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <ProfileCard user={user} onLogout={onLogout} />
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Personal rituals</p>
                <h3 className="text-xl font-semibold text-gray-900">Keep the account healthy</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">Archive receipts weekly to keep AI insights sharp.</div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">Settle any friend where |balance| ≥ ৳2K using the quick settle action.</div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">Review notification stack monthly.</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <NotificationPreferences userId={user.id} />
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Friend ledger</p>
                <h3 className="text-xl font-semibold text-gray-900">My friends</h3>
                <p className="text-sm text-gray-600">{friendCount} connections • {neutral} settled</p>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading friends...</div>
              ) : (
                <FriendList friends={roster} onSettle={onSettle} />
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
