import { FriendList } from '../friends/FriendList'
import { AddFriendDialog } from '../friends/AddFriendDialog'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Sparkles, Users, ArrowUpRight } from 'lucide-react'

interface FriendsPageProps {
  friends: any[]
  loading: boolean
  userId: string
  onAddFriend: (username: string) => Promise<void>
  onAddFriendByEmail: (email: string) => Promise<void>
  onAddFriendByCode: (code: string) => Promise<void>
  onSearchSuggestions: (query: string) => Promise<any[]>
  onSettle: (friendId: string, amount: number, method: string) => Promise<void>
}

export function FriendsPage({
  friends,
  loading,
  userId,
  onAddFriend,
  onAddFriendByEmail,
  onAddFriendByCode,
  onSearchSuggestions,
  onSettle,
}: FriendsPageProps) {
  const aggregates = friends.reduce(
    (acc, friend) => {
      if (friend.balance > 0) acc.theyOwe += friend.balance
      if (friend.balance < 0) acc.youOwe += Math.abs(friend.balance)
      return acc
    },
    { theyOwe: 0, youOwe: 0 }
  )

  const highlightChips = [
    {
      label: 'Connected friends',
      value: friends.length,
      helper: 'Active collaborators'
    },
    {
      label: 'They owe you',
      value: `৳${aggregates.theyOwe.toFixed(0)}`,
      helper: 'Pending repayments'
    },
    {
      label: 'You owe',
      value: `৳${aggregates.youOwe.toFixed(0)}`,
      helper: 'Settle soon'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16">
      <section className="rounded-[36px] bg-gradient-to-br from-slate-900 via-emerald-950 to-gray-900 p-10 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.4em] text-white/60">
              <Sparkles className="h-4 w-4" />
              Friends
            </div>
            <h1 className="mt-3 text-4xl font-semibold">Shared circles</h1>
            <p className="mt-3 max-w-2xl text-white/70">
              Invite friends, settle balances, and keep every split transparent across study trips, rent squads, and weekend plans.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <AddFriendDialog
              onAddFriend={onAddFriend}
              onAddFriendByEmail={onAddFriendByEmail}
              onAddFriendByCode={onAddFriendByCode}
              onSearchSuggestions={onSearchSuggestions}
              userFriendCode={userId}
            />
            <div className="rounded-full border border-white/30 px-4 py-2 text-xs text-white/70">
              Friend code: <span className="font-semibold tracking-widest">{userId}</span>
            </div>
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {highlightChips.map((chip) => (
            <div key={chip.label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">{chip.label}</p>
              <p className="mt-3 text-3xl font-semibold">{chip.value}</p>
              <p className="text-xs text-white/70 mt-1">{chip.helper}</p>
            </div>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="rounded-3xl border border-gray-200 bg-white py-12 text-center text-gray-500">
          Loading your friends...
        </div>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-[32px] border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Roster</p>
                  <h2 className="text-2xl font-semibold text-gray-900">Friend ledger</h2>
                </div>
              </div>
              <div className="mt-6">
                <FriendList friends={friends} onSettle={onSettle} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border border-gray-200 bg-white">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-100 p-3">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Relationship tips</h3>
                  <p className="text-sm text-gray-500">Keep every crew in sync</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="rounded-2xl border border-gray-100 bg-gray-50 p-3">Remind top debtors once balances cross ৳500.</li>
                <li className="rounded-2xl border border-gray-100 bg-gray-50 p-3">Use settle actions when someone pays cash offline.</li>
                <li className="rounded-2xl border border-gray-100 bg-gray-50 p-3">Share your friend code for quick onboarding.</li>
              </ul>
              <Button
                variant="outline"
                className="w-full rounded-full"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <ArrowUpRight className="mr-2 h-4 w-4" />
                View activity
              </Button>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  )
}
