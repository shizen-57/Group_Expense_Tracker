import { GroupList } from '../groups/GroupList'
import { GroupDetail } from '../groups/GroupDetail'
import { CreateGroupDialog } from '../groups/CreateGroupDialog'
import { AddFriendDialog } from '../friends/AddFriendDialog'

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
  console.log('GroupsPage render:', { selectedGroupId, hasSelectedGroup: !!selectedGroup, loading })
  
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {selectedGroupId && selectedGroup ? (
        <GroupDetail
          group={selectedGroup}
          currentUserId={currentUserId}
          friends={friends || []}
          onBack={onBackToGroups}
          onAddMember={onAddMember}
          onAddExpense={onAddExpense}
          onSimplify={onSimplify}
          onSettleAndSync={onSettleAndSync}
          onDeleteGroup={onDeleteGroup}
        />
      ) : selectedGroupId && loading ? (
        // Loading specific group
        <div className="text-center py-12">
          <div className="inline-flex p-8 rounded-full bg-emerald-100 mb-4 animate-pulse">
            <svg className="h-12 w-12 text-emerald-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-600">Loading group details...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl">My Groups</h1>
            <div className="flex gap-3">
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
              <CreateGroupDialog onCreateGroup={onCreateGroup} />
            </div>
          </div>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : (
            <GroupList groups={groups} onSelectGroup={onSelectGroup} />
          )}
        </>
      )}
    </div>
  )
}