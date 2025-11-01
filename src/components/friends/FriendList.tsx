import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { UserCircle2, DollarSign } from 'lucide-react'
import { SettleDebtDialog } from './SettleDebtDialog'

interface Friend {
  id: string
  name: string
  username: string
  email: string
  balance: number
}

interface FriendListProps {
  friends: Friend[]
  onSettle: (friendId: string, amount: number, method: string) => Promise<void>
}

export function FriendList({ friends, onSettle }: FriendListProps) {
  if (friends.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <UserCircle2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>No friends yet. Add friends to start splitting expenses!</p>
      </div>
    )
  }

  const totalOwed = friends.reduce((sum, f) => f.balance < 0 ? sum + Math.abs(f.balance) : sum, 0)
  const totalReceiving = friends.reduce((sum, f) => f.balance > 0 ? sum + f.balance : sum, 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">You Owe</p>
                <p className="text-red-600 text-2xl">${totalOwed.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Owe You</p>
                <p className="text-green-600 text-2xl">${totalReceiving.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {friends.map((friend) => (
          <Card key={friend.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserCircle2 className="h-10 w-10 text-gray-400" />
                <div>
                  <p>{friend.name}</p>
                  <p className="text-sm text-gray-500">@{friend.username}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {friend.balance !== 0 && (
                  <div className="text-right">
                    {friend.balance > 0 ? (
                      <p className="text-green-600">
                        Owes you ${Math.abs(friend.balance).toFixed(2)}
                      </p>
                    ) : (
                      <p className="text-red-600">
                        You owe ${Math.abs(friend.balance).toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
                
                {friend.balance !== 0 && (
                  <SettleDebtDialog
                    friend={friend}
                    onSettle={onSettle}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
