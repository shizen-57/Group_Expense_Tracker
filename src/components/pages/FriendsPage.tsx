import { FriendList } from '../friends/FriendList'
import { AddFriendDialog } from '../friends/AddFriendDialog'

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
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold gradient-text mb-2">My Friends</h2>
          <p className="text-muted-foreground">Manage your connections and settle debts</p>
        </div>
        <AddFriendDialog
          onAddFriend={onAddFriend}
          onAddFriendByEmail={onAddFriendByEmail}
          onAddFriendByCode={onAddFriendByCode}
          onSearchSuggestions={onSearchSuggestions}
          userFriendCode={userId}
        />
      </div>
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 animate-pulse mb-4">
            <div className="w-12 h-12" />
          </div>
          <p className="text-muted-foreground">Loading your friends...</p>
        </div>
      ) : (
        <FriendList friends={friends} onSettle={onSettle} />
      )}
    </div>
  )
}
