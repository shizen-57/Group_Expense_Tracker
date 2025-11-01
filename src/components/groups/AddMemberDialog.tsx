import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { UserPlus } from 'lucide-react'

interface AddMemberDialogProps {
  onAddMember: (username: string) => Promise<void>
}

export function AddMemberDialog({ onAddMember }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await onAddMember(username)
      setUsername('')
      setOpen(false)
    } catch (err: any) {
      setError(err.message || 'Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-emerald-500/20 hover:bg-emerald-50 dark:hover:bg-emerald-950">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Member to Group</DialogTitle>
          <DialogDescription>
            Enter the username of a friend you want to add to this group. Make sure they're already in your friends list.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="e.g., @johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Tip: You can add friends using the "Add Friend" button on the Groups page
            </p>
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700" disabled={loading}>
            {loading ? 'Adding...' : 'Add Member'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
