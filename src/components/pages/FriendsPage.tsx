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
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">My Friends</h1>
        <AddFriendDialog
          onAddFriend={onAddFriend}
          onAddFriendByEmail={onAddFriendByEmail}
          onAddFriendByCode={onAddFriendByCode}
          onSearchSuggestions={onSearchSuggestions}
          userFriendCode={userId}
        />
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading your friends...</div>
      ) : (
        <FriendList friends={friends} onSettle={onSettle} />
      )}
    </div>
  )
}
