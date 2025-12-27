import { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { Banknote, CheckCircle2 } from 'lucide-react'
import type { GroupPaymentPayload } from '@/types/groups'

interface Member {
  id: string
  name: string
  username: string
}

interface RecordPaymentDialogProps {
  members: Member[]
  currentUserId: string
  defaultFromId?: string
  defaultToId?: string
  defaultAmount?: number
  onRecordPayment: (data: GroupPaymentPayload) => Promise<void>
  triggerVariant?: 'button' | 'icon'
}

export function RecordPaymentDialog({
  members,
  currentUserId,
  defaultFromId,
  defaultToId,
  defaultAmount,
  onRecordPayment,
  triggerVariant = 'button'
}: RecordPaymentDialogProps) {
  const [open, setOpen] = useState(false)
  const [fromMemberId, setFromMemberId] = useState(defaultFromId || currentUserId)
  const [toMemberId, setToMemberId] = useState(defaultToId || '')
  const [amount, setAmount] = useState(defaultAmount?.toString() || '')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getMemberLabel = (member: Member) => {
    if (member.id === currentUserId) {
      return `${member.name || member.username} (You)`
    }
    return member.name || member.username || 'Unknown'
  }

  const resetForm = () => {
    setFromMemberId(defaultFromId || currentUserId)
    setToMemberId(defaultToId || '')
    setAmount(defaultAmount?.toString() || '')
    setNote('')
    setError('')
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      resetForm()
    }
  }

  const handleSubmit = async () => {
    setError('')

    if (!fromMemberId || !toMemberId) {
      setError('Please select both payer and recipient')
      return
    }

    if (fromMemberId === toMemberId) {
      setError('Payer and recipient must be different people')
      return
    }

    const numericAmount = parseFloat(amount)
    if (!numericAmount || numericAmount <= 0) {
      setError('Please enter a valid amount greater than zero')
      return
    }

    setLoading(true)
    try {
      await onRecordPayment({
        fromMemberId,
        toMemberId,
        amount: numericAmount,
        note: note.trim() || undefined
      })
      setOpen(false)
      resetForm()
    } catch (err) {
      console.error('Failed to record payment:', err)
      setError('Failed to record payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const otherMembers = members.filter(m => m.id !== fromMemberId)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerVariant === 'icon' ? (
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Settle
          </Button>
        ) : (
          <Button
            variant="outline"
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            <Banknote className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-emerald-600" />
            Record a Payment
          </DialogTitle>
          <DialogDescription>
            Track when someone pays back what they owe. This will update the group balances.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="from-member">Who paid?</Label>
            <Select value={fromMemberId} onValueChange={setFromMemberId}>
              <SelectTrigger id="from-member">
                <SelectValue placeholder="Select payer" />
              </SelectTrigger>
              <SelectContent>
                {members.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {getMemberLabel(member)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="to-member">Paid to whom?</Label>
            <Select value={toMemberId} onValueChange={setToMemberId}>
              <SelectTrigger id="to-member">
                <SelectValue placeholder="Select recipient" />
              </SelectTrigger>
              <SelectContent>
                {otherMembers.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {getMemberLabel(member)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (৳)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              placeholder="e.g., Paid via bKash"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !fromMemberId || !toMemberId || !amount}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {loading ? 'Recording...' : 'Record Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
