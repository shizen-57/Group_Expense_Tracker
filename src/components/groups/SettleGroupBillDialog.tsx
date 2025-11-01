import { useState } from 'react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog'
import { DollarSign, TrendingUp, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '../ui/alert'

interface Member {
  id: string
  name: string
  email: string
  username: string
}

interface Expense {
  id: string
  description: string
  amount: number
  paidBy: string
  splitWith: string[]
  category?: string
  notes?: string
}

interface SettleGroupBillDialogProps {
  expenses: Expense[]
  members: Member[]
  currentUserId: string
  groupName: string
  onSettle: () => Promise<void>
}

export function SettleGroupBillDialog({ 
  expenses, 
  members, 
  currentUserId,
  groupName,
  onSettle 
}: SettleGroupBillDialogProps) {
  const [open, setOpen] = useState(false)
  const [settling, setSettling] = useState(false)

  const getMemberName = (userId: string) => {
    const member = members.find(m => m.id === userId)
    return member?.name || 'Unknown'
  }

  // Calculate totals
  const totalBill = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const myExpenses = expenses.filter(exp => exp.paidBy === currentUserId)
  const myTotal = myExpenses.reduce((sum, exp) => sum + exp.amount, 0)

  // Calculate what each person paid
  const memberTotals = members.map(member => {
    const memberExpenses = expenses.filter(exp => exp.paidBy === member.id)
    const total = memberExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    return {
      member,
      total,
      expenseCount: memberExpenses.length
    }
  }).filter(item => item.total > 0)

  const handleSettle = async () => {
    setSettling(true)
    try {
      await onSettle()
      setOpen(false)
    } catch (error) {
      console.error('Failed to settle bill:', error)
    } finally {
      setSettling(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 border-0"
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Settle & Sync to Tracker
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Settle Group Bill</DialogTitle>
          <DialogDescription>
            Review the bill breakdown and sync expenses to your personal tracker
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-900 dark:text-emerald-100">
              <strong>Total Group Bill:</strong> ${totalBill.toFixed(2)}
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground">Individual Contributions:</h4>
            {memberTotals.map(({ member, total, expenseCount }) => (
              <div 
                key={member.id}
                className={`p-3 rounded-lg border ${
                  member.id === currentUserId 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200' 
                    : 'bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {member.name}
                      {member.id === currentUserId && ' (You)'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {expenseCount} expense{expenseCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                    ${total.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 dark:text-blue-100 text-sm">
              When you settle, your {myExpenses.length} expense{myExpenses.length !== 1 ? 's' : ''} (${myTotal.toFixed(2)}) will be added to your personal expense tracker for analysis and budgeting.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
              onClick={handleSettle}
              disabled={settling || expenses.length === 0}
            >
              {settling ? 'Settling...' : 'Settle & Sync'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
