import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import { Textarea } from '../ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Plus, DollarSign, Percent, Calculator } from 'lucide-react'
import { expenseCategories } from './ExpenseCategories'

interface Member {
  id: string
  name: string
  username: string
}

interface SplitAmounts {
  [memberId: string]: number
}

interface EnhancedAddExpenseDialogProps {
  members: Member[]
  currentUserId: string
  onAddExpense: (data: { 
    description: string
    amount: number
    paidBy: string
    splitWith: string[]
    splitType?: 'equal' | 'unequal' | 'percentage'
    splitAmounts?: SplitAmounts
    category?: string
    notes?: string
  }) => Promise<void>
}

export function EnhancedAddExpenseDialog({ members, currentUserId, onAddExpense }: EnhancedAddExpenseDialogProps) {
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState(currentUserId)
  const [splitWith, setSplitWith] = useState<string[]>([currentUserId])
  const [splitType, setSplitType] = useState<'equal' | 'unequal' | 'percentage'>('equal')
  const [customAmounts, setCustomAmounts] = useState<SplitAmounts>({})
  const [percentages, setPercentages] = useState<SplitAmounts>({})
  const [category, setCategory] = useState('other')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleToggleMember = (memberId: string) => {
    if (splitWith.includes(memberId)) {
      const newSplitWith = splitWith.filter(id => id !== memberId)
      setSplitWith(newSplitWith)
      
      // Remove from custom amounts/percentages
      const newCustom = { ...customAmounts }
      delete newCustom[memberId]
      setCustomAmounts(newCustom)
      
      const newPercent = { ...percentages }
      delete newPercent[memberId]
      setPercentages(newPercent)
    } else {
      setSplitWith([...splitWith, memberId])
    }
  }

  const handleCustomAmountChange = (memberId: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setCustomAmounts({ ...customAmounts, [memberId]: numValue })
  }

  const handlePercentageChange = (memberId: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setPercentages({ ...percentages, [memberId]: numValue })
  }

  const calculateSplitAmounts = (): SplitAmounts => {
    const totalAmount = parseFloat(amount) || 0
    const splitAmounts: SplitAmounts = {}

    switch (splitType) {
      case 'equal':
        const equalShare = totalAmount / splitWith.length
        splitWith.forEach(id => {
          splitAmounts[id] = equalShare
        })
        break

      case 'unequal':
        splitWith.forEach(id => {
          splitAmounts[id] = customAmounts[id] || 0
        })
        break

      case 'percentage':
        splitWith.forEach(id => {
          const percent = percentages[id] || 0
          splitAmounts[id] = (totalAmount * percent) / 100
        })
        break
    }

    return splitAmounts
  }

  const validateSplit = (): string | null => {
    const totalAmount = parseFloat(amount) || 0
    const splitAmounts = calculateSplitAmounts()
    const totalSplit = Object.values(splitAmounts).reduce((sum, val) => sum + val, 0)

    if (splitType === 'unequal') {
      if (Math.abs(totalSplit - totalAmount) > 0.01) {
        return `Split amounts (৳${totalSplit.toFixed(2)}) don't match total amount (৳${totalAmount.toFixed(2)})`
      }
    }

    if (splitType === 'percentage') {
      const totalPercent = Object.values(percentages).reduce((sum, val) => sum + val, 0)
      if (Math.abs(totalPercent - 100) > 0.01) {
        return `Percentages must add up to 100% (currently ${totalPercent.toFixed(1)}%)`
      }
    }

    return null
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

    const validationError = validateSplit()
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return
    }

    try {
      const splitAmounts = calculateSplitAmounts()
      
      await onAddExpense({
        description,
        amount: parseFloat(amount),
        paidBy,
        splitWith,
        splitType,
        splitAmounts,
        category,
        notes
      })
      
      // Reset form
      setDescription('')
      setAmount('')
      setPaidBy(currentUserId)
      setSplitWith([currentUserId])
      setSplitType('equal')
      setCustomAmounts({})
      setPercentages({})
      setCategory('other')
      setNotes('')
      setOpen(false)
    } catch (err: any) {
      setError(err.message || 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  const getSplitPreview = () => {
    const totalAmount = parseFloat(amount) || 0
    if (!totalAmount || splitWith.length === 0) return null

    const splitAmounts = calculateSplitAmounts()
    
    return (
      <div className="mt-2 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-lg border border-emerald-200 dark:border-emerald-800">
        <p className="text-sm font-medium mb-2">Split Preview:</p>
        <div className="space-y-1">
          {splitWith.map(memberId => {
            const member = members.find(m => m.id === memberId)
            const memberAmount = splitAmounts[memberId] || 0
            return (
              <div key={memberId} className="flex justify-between text-sm">
                <span>{member?.name}</span>
                <span className="font-medium">৳{memberAmount.toFixed(2)}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Group Expense</DialogTitle>
          <DialogDescription>
            Record a group expense with flexible splitting options
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="amount">Total Amount ($)</Label>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="space-y-2">
            <Label>Split Method</Label>
            <Tabs value={splitType} onValueChange={(v) => setSplitType(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="equal">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Equal
                </TabsTrigger>
                <TabsTrigger value="unequal">
                  <Calculator className="h-4 w-4 mr-1" />
                  Unequal
                </TabsTrigger>
                <TabsTrigger value="percentage">
                  <Percent className="h-4 w-4 mr-1" />
                  Percentage
                </TabsTrigger>
              </TabsList>

              <TabsContent value="equal" className="space-y-2 mt-4">
                <Label>Split With (Equal Shares)</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`member-equal-${member.id}`}
                        checked={splitWith.includes(member.id)}
                        onCheckedChange={() => handleToggleMember(member.id)}
                      />
                      <Label htmlFor={`member-equal-${member.id}`} className="cursor-pointer flex-1">
                        {member.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {getSplitPreview()}
              </TabsContent>

              <TabsContent value="unequal" className="space-y-2 mt-4">
                <Label>Custom Amounts (Must total ৳{amount || '0.00'})</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`member-unequal-${member.id}`}
                        checked={splitWith.includes(member.id)}
                        onCheckedChange={() => handleToggleMember(member.id)}
                      />
                      <Label htmlFor={`member-unequal-${member.id}`} className="flex-1">
                        {member.name}
                      </Label>
                      {splitWith.includes(member.id) && (
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={customAmounts[member.id] || ''}
                          onChange={(e) => handleCustomAmountChange(member.id, e.target.value)}
                          className="w-24"
                        />
                      )}
                    </div>
                  ))}
                </div>
                {getSplitPreview()}
              </TabsContent>

              <TabsContent value="percentage" className="space-y-2 mt-4">
                <Label>Percentage Split (Must total 100%)</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`member-percent-${member.id}`}
                        checked={splitWith.includes(member.id)}
                        onCheckedChange={() => handleToggleMember(member.id)}
                      />
                      <Label htmlFor={`member-percent-${member.id}`} className="flex-1">
                        {member.name}
                      </Label>
                      {splitWith.includes(member.id) && (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            placeholder="0"
                            value={percentages[member.id] || ''}
                            onChange={(e) => handlePercentageChange(member.id, e.target.value)}
                            className="w-20"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {getSplitPreview()}
              </TabsContent>
            </Tabs>
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
            <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700" 
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Expense'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
