import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { DollarSign } from 'lucide-react'

interface Friend {
  id: string
  name: string
  balance: number
}

interface SettleDebtDialogProps {
  friend: Friend
  onSettle: (friendId: string, amount: number, method: string) => Promise<void>
}

export function SettleDebtDialog({ friend, onSettle }: SettleDebtDialogProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(Math.abs(friend.balance).toFixed(2))
  const [method, setMethod] = useState('cash')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isOwing = friend.balance < 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const settleAmount = isOwing ? parseFloat(amount) : -parseFloat(amount)
      await onSettle(friend.id, settleAmount, method)
      setOpen(false)
    } catch (err: any) {
      setError(err.message || 'Failed to settle debt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <DollarSign className="h-4 w-4 mr-1" />
          Settle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settle Debt with {friend.name}</DialogTitle>
          <DialogDescription>
            Record a payment to settle your balance with this friend.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            {isOwing ? (
              <p className="text-sm">
                You owe <span className="text-red-600">${Math.abs(friend.balance).toFixed(2)}</span>
              </p>
            ) : (
              <p className="text-sm">
                {friend.name} owes you <span className="text-green-600">${Math.abs(friend.balance).toFixed(2)}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={Math.abs(friend.balance)}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="simplify">Simplify (Auto-balance)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Settling...' : 'Record Settlement'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
