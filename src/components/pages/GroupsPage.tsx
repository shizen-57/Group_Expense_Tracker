import { GroupList } from '../groups/GroupList'
import { GroupDetail } from '../groups/GroupDetail'
import { CreateGroupDialog } from '../groups/CreateGroupDialog'
import { AddFriendDialog } from '../friends/AddFriendDialog'
import { Button } from '../ui/button'

interface GroupsPageProps {
  groups: any[]
  selectedGroupId: string | null
  selectedGroup: any | null
  currentUserId: string
  loading: boolean
  friends: any[]
  onSelectGroup: (groupId: string) => void
  onCreateGroup: (data: { name: string; description: string }) => Promise<void>
  onBackToGroups: () => void
  onAddMember: (friendId: string) => Promise<void>
  onAddExpense: (data: { 
    description: string
    amount: number
    paidBy: string
    splitWith: string[]
    splitType?: 'equal' | 'unequal' | 'percentage'
    splitAmounts?: Record<string, number>
    category?: string
    notes?: string
  }) => Promise<void>
  onSimplify: () => Promise<void>
  onSettleAndSync: () => Promise<void>
  onDeleteGroup: () => Promise<void>
  onAddFriend?: (username: string) => Promise<void>
  onAddFriendByEmail?: (email: string) => Promise<void>
  onAddFriendByCode?: (code: string) => Promise<void>
  onSearchSuggestions?: (query: string) => Promise<any[]>
}

export function GroupsPage({
  groups,
  selectedGroupId,
  selectedGroup,
  currentUserId,
  loading,
  friends,
  onSelectGroup,
  onCreateGroup,
  onBackToGroups,
  onAddMember,
  onAddExpense,
  onSimplify,
  onSettleAndSync,
  onDeleteGroup,
  onAddFriend,
  onAddFriendByEmail,
  onAddFriendByCode,
  onSearchSuggestions,
}: GroupsPageProps) {
  const safeGroups = Array.isArray(groups) ? groups : []
  const friendRoster = Array.isArray(friends) ? friends : []
  const totalGroups = safeGroups.length
  const totalMembers = safeGroups.reduce((sum, group) => sum + (group.memberCount || 0), 0)
  const totalExpenses = safeGroups.reduce((sum, group) => sum + (group.expenseCount || 0), 0)
  const avgHeadcount = totalGroups > 0 ? Math.max(1, Math.round(totalMembers / totalGroups)) : 0

  const heroStats = [
    {
      label: 'Active crews',
      value: totalGroups.toString(),
      hint: 'Organized spaces'
    },
    {
      label: 'People inside',
      value: totalMembers.toString(),
      hint: `${avgHeadcount} avg. per crew`
    },
    {
      label: 'Shared entries',
      value: totalExpenses.toString(),
      hint: 'Tracked expenses'
    }
  ]

  if (selectedGroupId && selectedGroup) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        <section className="rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Group cockpit</p>
              <h1 className="mt-2 text-3xl font-semibold text-gray-900">{selectedGroup.name}</h1>
              <p className="mt-2 text-sm text-gray-600">{selectedGroup.description || 'Manage members, balances, and rituals from a single lane.'}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="rounded-full" onClick={onBackToGroups}>
                Back to crews
              </Button>
              <Button className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600" onClick={onSimplify}>
                Simplify balances
              </Button>
              <Button variant="secondary" className="rounded-full" onClick={onSettleAndSync}>
                Settle & sync
              </Button>
            </div>
          </div>
        </section>
        <GroupDetail
          group={selectedGroup}
          currentUserId={currentUserId}
          friends={friendRoster}
          onBack={onBackToGroups}
          onAddMember={onAddMember}
          onAddExpense={onAddExpense}
          onSimplify={onSimplify}
          onSettleAndSync={onSettleAndSync}
          onDeleteGroup={onDeleteGroup}
        />
      </div>
    )
  }

  if (selectedGroupId && loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        <section className="rounded-[32px] border border-dashed border-emerald-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <svg className="h-10 w-10 animate-spin text-emerald-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="mt-6 text-gray-600">Loading group details…</p>
        </section>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16">
      <section className="rounded-[36px] bg-gradient-to-br from-gray-900 via-teal-950 to-gray-900 p-10 text-white">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.6em] text-emerald-200">Crews</p>
              <h1 className="mt-3 text-4xl lg:text-5xl font-semibold leading-tight">Command center for every shared balance</h1>
              <p className="mt-3 text-white/70 max-w-2xl">Spin up squads, keep rituals tight, and broadcast settlements without hopping between tabs.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {onAddFriend && onAddFriendByEmail && onAddFriendByCode && onSearchSuggestions && (
                <AddFriendDialog
                  onAddFriend={onAddFriend}
                  onAddFriendByEmail={onAddFriendByEmail}
                  onAddFriendByCode={onAddFriendByCode}
                  onSearchSuggestions={onSearchSuggestions}
                  userFriendCode={currentUserId}
                  variant="secondary"
                />
              )}
              <CreateGroupDialog onCreateGroup={onCreateGroup} />
            </div>
          </div>
          <div className="grid w-full max-w-md gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
                <p className="text-xs text-white/60 mt-1">{stat.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <section className="rounded-3xl border border-gray-200 bg-white p-12 text-center text-gray-500 shadow-sm">
          Pulling your group ledger...
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Group stack</p>
              <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">Choose a crew</h2>
                <span className="text-sm text-gray-500">{totalGroups} active • sorted by recency</span>
              </div>
            </div>
            <GroupList groups={safeGroups} onSelectGroup={onSelectGroup} />
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-gray-200 bg-gray-50/70 p-5 shadow-inner">
              <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Network health</p>
              <div className="mt-4 grid gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Roster reach</p>
                    <p className="text-lg font-semibold text-gray-900">{friendRoster.length} friends</p>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-xs text-gray-500">{Math.max(friendRoster.length - totalMembers, 0)} unassigned</div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Avg. headcount</p>
                    <p className="text-lg font-semibold text-gray-900">{avgHeadcount} per crew</p>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-xs text-gray-500">Balance coverage</div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Ledger velocity</p>
                    <p className="text-lg font-semibold text-gray-900">{totalExpenses} entries</p>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-xs text-gray-500">Past 90 days</div>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Playbook</p>
              <div className="mt-4 space-y-3 text-sm text-gray-600">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                  1. Invite or find friends → assign them into crews.
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                  2. Log expenses fast, then tap Simplify when balances look messy.
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                  3. Hit Settle & sync to broadcast closing numbers.
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}