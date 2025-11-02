import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import { Textarea } from '../ui/textarea'
import { Plus } from 'lucide-react'
import { expenseCategories } from './ExpenseCategories'

interface Member {
  id: string
  name: string
  username: string
}

interface AddExpenseDialogProps {
  members: Member[]
  currentUserId: string
  onAddExpense: (data: { description: string; amount: number; paidBy: string; splitWith: string[]; category?: string; notes?: string }) => Promise<void>
}

export function AddExpenseDialog({ members, currentUserId, onAddExpense }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState(currentUserId)
  const [splitWith, setSplitWith] = useState<string[]>([currentUserId])
  const [category, setCategory] = useState('other')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleToggleMember = (memberId: string) => {
    if (splitWith.includes(memberId)) {
      setSplitWith(splitWith.filter(id => id !== memberId))
    } else {
      setSplitWith([...splitWith, memberId])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (splitWith.length === 0) {
      setError('Please select at least one person to split with')
      setLoading(false)
      return
    }

    try {
      await onAddExpense({
        description,
        amount: parseFloat(amount),
        paidBy,
        splitWith,
        category,
        notes
      })
      setDescription('')
      setAmount('')
      setPaidBy(currentUserId)
      setSplitWith([currentUserId])
      setCategory('other')
      setNotes('')
      setOpen(false)
    } catch (err: any) {
      setError(err.message || 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>
            Record a group expense and split it among members.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g., Dinner at restaurant"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((cat) => {
                  const Icon = cat.icon
                  return (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${cat.color}`} />
                        {cat.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidBy">Paid By</Label>
            <Select value={paidBy} onValueChange={setPaidBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Split With</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`member-${member.id}`}
                    checked={splitWith.includes(member.id)}
                    onCheckedChange={() => handleToggleMember(member.id)}
                  />
                  <Label
                    htmlFor={`member-${member.id}`}
                    className="cursor-pointer flex-1"
                  >
                    {member.name}
                  </Label>
                </div>
              ))}
            </div>
            {splitWith.length > 0 && (
              <p className="text-sm text-gray-500">
                ৳{amount ? (parseFloat(amount) / splitWith.length).toFixed(2) : '0.00'} per person
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Adding...' : 'Add Expense'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
