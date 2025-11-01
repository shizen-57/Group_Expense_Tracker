import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Plus } from 'lucide-react'

interface CreateGroupDialogProps {
  onCreateGroup: (data: { name: string; description: string }) => Promise<void>
}

export function CreateGroupDialog({ onCreateGroup }: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onCreateGroup({ name, description })
      setName('')
      setDescription('')
      setOpen(false)
    } catch (error) {
      console.error('Failed to create group:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Create a group to split expenses with friends, roommates, or travel companions. You can add members after creating the group.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              placeholder="e.g., Weekend Trip, Roommates, Vacation 2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="What's this group for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700" disabled={loading}>
            {loading ? 'Creating...' : 'Create Group'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
