import { useState } from 'react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { UserPlus, Check } from 'lucide-react'
import { ScrollArea } from '../ui/scroll-area'
import { Input } from '../ui/input'

interface Friend {
  id: string
  name: string
  email: string
  username: string
}

interface AddFriendToGroupDialogProps {
  friends: Friend[]
  existingMemberIds: string[]
  onAddMember: (friendId: string) => Promise<void>
}

export function AddFriendToGroupDialog({ friends, existingMemberIds, onAddMember }: AddFriendToGroupDialogProps) {
  const [open, setOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter friends who are not already in the group
  const availableFriends = friends.filter(friend => !existingMemberIds.includes(friend.id))
  
  // Filter by search query
  const filteredFriends = availableFriends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddMember = async (friendId: string) => {
    setAdding(true)
    try {
      await onAddMember(friendId)
      // Don't close dialog, allow adding multiple friends
    } catch (error) {
      console.error('Failed to add member:', error)
    } finally {
      setAdding(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 border-0"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Friend
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Friend to Group</DialogTitle>
          <DialogDescription>
            Select a friend from your list to add them to this group.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          {filteredFriends.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {availableFriends.length === 0 
                  ? "All your friends are already in this group!"
                  : "No friends found matching your search"
                }
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {filteredFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{friend.name}</p>
                      <p className="text-sm text-muted-foreground">@{friend.username}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddMember(friend.id)}
                      disabled={adding}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
