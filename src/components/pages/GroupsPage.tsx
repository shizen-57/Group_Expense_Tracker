import { GroupList } from '../groups/GroupList'
import { GroupDetail } from '../groups/GroupDetail'
import { CreateGroupDialog } from '../groups/CreateGroupDialog'
import { AddFriendDialog } from '../friends/AddFriendDialog'
import type { GroupExpensePayload, GroupPaymentPayload } from '@/types/groups'

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
  onAddExpense: (data: GroupExpensePayload) => Promise<void>
  onRecordPayment: (data: GroupPaymentPayload) => Promise<void>
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
  onRecordPayment,
  onSimplify,
  onSettleAndSync,
  onDeleteGroup,
  onAddFriend,
  onAddFriendByEmail,
  onAddFriendByCode,
  onSearchSuggestions,
}: GroupsPageProps) {
  const tiles = [
    { label: 'Active crews', value: groups.length },
    { label: 'Friends invited', value: friends?.length ?? 0 },
    { label: 'Awaiting settlements', value: groups.filter(group => group.outstandingBalance > 0).length }
  ]

  if (selectedGroupId && selectedGroup) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        <section className="rounded-[32px] bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 p-8 text-white">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">Group detail</p>
              <h1 className="mt-2 text-4xl font-semibold">{selectedGroup.name}</h1>
              <p className="mt-2 text-white/70">{selectedGroup.description || 'Shared expenses, consolidated.'}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onBackToGroups}
                className="rounded-full border border-white/30 px-5 py-2 text-sm text-white hover:bg-white/10"
              >
                Back to crews
              </button>
              <button
                onClick={onSimplify}
                className="rounded-full bg-white px-6 py-2 text-sm font-medium text-gray-900 hover:bg-white/90"
              >
                Simplify balances
              </button>
            </div>
          </div>
        </section>

        <GroupDetail
          group={selectedGroup}
          currentUserId={currentUserId}
          friends={friends || []}
          onBack={onBackToGroups}
          onAddMember={onAddMember}
          onAddExpense={onAddExpense}
          onRecordPayment={onRecordPayment}
          onSimplify={onSimplify}
          onSettleAndSync={onSettleAndSync}
          onDeleteGroup={onDeleteGroup}
        />
      </div>
    )
  }

  if (selectedGroupId && loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center py-12">
          <div className="inline-flex p-8 rounded-full bg-emerald-100 mb-4 animate-pulse">
            <svg className="h-12 w-12 text-emerald-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-600">Loading group details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16">
      <section className="rounded-[36px] bg-gradient-to-br from-teal-900 via-emerald-900 to-gray-900 p-10 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Crews & rituals</p>
            <h1 className="mt-3 text-4xl font-semibold">Group operations lounge</h1>
            <p className="mt-4 max-w-2xl text-white/70">
              Spin up travel pods, rent squads, or project crews and keep every split, settlement, and recap synced.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {onAddFriend && onAddFriendByEmail && onAddFriendByCode && onSearchSuggestions && (
              <AddFriendDialog 
                onAddFriend={onAddFriend}
                onAddFriendByEmail={onAddFriendByEmail}
                onAddFriendByCode={onAddFriendByCode}
                onSearchSuggestions={onSearchSuggestions}
                userFriendCode={currentUserId}
                variant="outline"
              />
            )}
            <div className="rounded-full bg-white/10 px-4 py-2">
              <CreateGroupDialog onCreateGroup={onCreateGroup} />
            </div>
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {tiles.map((tile) => (
            <div key={tile.label} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">{tile.label}</p>
              <p className="mt-3 text-3xl font-semibold">{tile.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-gray-200 bg-white p-4 shadow-lg">
          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading your crews...</div>
          ) : groups.length > 0 ? (
            <GroupList groups={groups} onSelectGroup={onSelectGroup} />
          ) : (
            <div className="py-12 text-center text-gray-500">No groups yet. Spin up your first crew.</div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-gray-200 bg-gray-50 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Playbook</p>
            <h3 className="mt-2 text-2xl font-semibold text-gray-900">Run the setup ritual</h3>
            <p className="mt-2 text-sm text-gray-600">Invite friends, add expenses, then simplify balances in one sweep.</p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-600">
              <span className="rounded-full bg-white px-3 py-1">Invite members</span>
              <span className="rounded-full bg-white px-3 py-1">Log first tab</span>
              <span className="rounded-full bg-white px-3 py-1">Simplify</span>
            </div>
          </div>
          <div className="rounded-[28px] border border-dashed border-gray-300 p-6 text-sm text-gray-600">
            Need bespoke flows? Use the group detail view to configure custom split types, observers, and sync schedules.
          </div>
        </div>
      </section>
    </div>
  )
}