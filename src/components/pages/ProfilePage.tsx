import { ProfileCard } from '../profile/ProfileCard'
import { FriendList } from '../friends/FriendList'
import { NotificationPreferences } from '../notifications/NotificationPreferences'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Users, Sparkles, ArrowUpRight } from 'lucide-react'

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
  const friendBalances = friends.reduce(
    (acc, friend) => {
      if (friend.balance > 0) acc.owed += friend.balance
      if (friend.balance < 0) acc.owing += Math.abs(friend.balance)
      return acc
    },
    { owed: 0, owing: 0 }
  )

  const friendInsights = [
    { label: 'Crew members', value: friends.length },
    { label: 'You are owed', value: `৳${friendBalances.owed.toFixed(0)}` },
    { label: 'You owe', value: `৳${friendBalances.owing.toFixed(0)}` }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16">
      <section className="rounded-[36px] bg-gradient-to-br from-gray-900 via-slate-900 to-emerald-900 p-10 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.4em] text-white/60">
              <Sparkles className="h-4 w-4" />
              Profile
            </div>
            <h1 className="mt-3 text-4xl font-semibold">{user.name}</h1>
            <p className="mt-2 text-white/70">{user.email}</p>
            {user.username && <p className="text-sm text-white/60">@{user.username}</p>}
          </div>
          <div className="grid w-full max-w-sm gap-4">
            {friendInsights.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">{stat.label}</p>
                <p className="mt-3 text-2xl font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-gray-200 bg-white p-4 shadow-lg">
          <ProfileCard user={user} onLogout={onLogout} />
        </div>
        <div className="rounded-[28px] border border-gray-200 bg-white p-4 shadow-sm">
          <NotificationPreferences userId={user.id} />
        </div>
      </section>

      <Card className="rounded-[32px] border border-gray-200 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Friend ledger</h3>
              <p className="text-sm text-gray-600">
                {friends.length} {friends.length === 1 ? 'friend' : 'friends'} connected
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
              <ArrowUpRight className="h-4 w-4" />
              {friendBalances.owed > friendBalances.owing ? 'Net positive' : 'Review debts'}
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
