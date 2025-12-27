import { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import { Textarea } from '../ui/textarea'
import { Slider } from '../ui/slider'
import { Plus, X, Scale, Users, Receipt, Percent, CalendarDays, Trash2, ChevronRight, Check, AlertCircle } from 'lucide-react'
import { expenseCategories } from './ExpenseCategories'

interface Member {
  id: string
  name: string
  username: string
}

interface SplitAmounts {
  [memberId: string]: number
}

interface ItemSplit {
  item: string
  amount: number
  selectedBy: string[]
}

interface DurationData {
  [memberId: string]: number
}

type SplitType = 'equal' | 'who-joined' | 'itemized' | 'custom-percentage' | 'by-duration'

interface EnhancedAddExpenseDialogProps {
  members: Member[]
  currentUserId: string
  onAddExpense: (data: { 
    description: string
    amount: number
    paidBy: string
    splitWith: string[]
    splitType?: SplitType
    splitAmounts?: SplitAmounts
    category?: string
    notes?: string
    itemSplits?: ItemSplit[]
    duration?: DurationData
  }) => Promise<void>
}

const SPLIT_TYPES = [
  { value: 'equal' as const, label: 'Equal', icon: Scale, color: 'blue', desc: 'Split equally among everyone', example: '৳300 ÷ 3 = ৳100 each' },
  { value: 'who-joined' as const, label: 'Select People', icon: Users, color: 'purple', desc: 'Only those who participated', example: 'Choose who was there' },
  { value: 'itemized' as const, label: 'By Items', icon: Receipt, color: 'emerald', desc: 'Assign specific items', example: 'Pizza → Ali, Burger → Sara' },
  { value: 'custom-percentage' as const, label: 'Percentage', icon: Percent, color: 'orange', desc: 'Custom % for each person', example: 'Ali 60%, Sara 40%' },
  { value: 'by-duration' as const, label: 'By Duration', icon: CalendarDays, color: 'pink', desc: 'Based on days/hours', example: 'Rent by days stayed' },
]

export function EnhancedAddExpenseDialog({ members, currentUserId, onAddExpense }: EnhancedAddExpenseDialogProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1) // 1 = details, 2 = split
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState(currentUserId)
  const [splitType, setSplitType] = useState<SplitType>('equal')
  const [category, setCategory] = useState('other')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Who Joined
  const [participants, setParticipants] = useState<string[]>(members.map(m => m.id))
  const [whoJoinedMode, setWhoJoinedMode] = useState<'equal' | 'manual'>('equal')
  const [participantAmounts, setParticipantAmounts] = useState<Record<string, number>>(
    Object.fromEntries(members.map(m => [m.id, 0]))
  )
  
  // Custom Percentage
  const [percentages, setPercentages] = useState<Record<string, number>>(
    Object.fromEntries(members.map(m => [m.id, Math.round(100 / members.length)]))
  )
  
  // By Duration
  const [durations, setDurations] = useState<DurationData>(
    Object.fromEntries(members.map(m => [m.id, 1]))
  )
  
  // Itemized
  const [items, setItems] = useState<ItemSplit[]>([
    { item: '', amount: 0, selectedBy: [] }
  ])

  const handleToggleParticipant = (memberId: string) => {
    setParticipants(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId)
      } else {
        return [...prev, memberId]
      }
    })
  }

  const handleParticipantAmountChange = (memberId: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setParticipantAmounts(prev => ({ ...prev, [memberId]: numValue }))
  }

  const handlePercentageChange = (memberId: string, value: number[]) => {
    setPercentages({ ...percentages, [memberId]: value[0] })
  }

  const handleDurationChange = (memberId: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setDurations({ ...durations, [memberId]: numValue })
  }

  const handleAddItem = () => {
    setItems([...items, { item: '', amount: 0, selectedBy: [] }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const handleItemChange = (index: number, field: 'item' | 'amount', value: string) => {
    const newItems = [...items]
    if (field === 'amount') {
      newItems[index].amount = parseFloat(value) || 0
    } else {
      newItems[index].item = value
    }
    setItems(newItems)
  }

  const handleToggleItemPerson = (itemIndex: number, memberId: string) => {
    const newItems = [...items]
    const item = newItems[itemIndex]
    if (item.selectedBy.includes(memberId)) {
      item.selectedBy = item.selectedBy.filter(id => id !== memberId)
    } else {
      item.selectedBy = [...item.selectedBy, memberId]
    }
    setItems(newItems)
  }

  const calculateSplitAmounts = (): SplitAmounts => {
    const totalAmount = parseFloat(amount) || 0
    const splitAmounts: SplitAmounts = {}

    switch (splitType) {
      case 'equal':
        // All members split equally
        const equalShare = totalAmount / members.length
        members.forEach(m => {
          splitAmounts[m.id] = equalShare
        })
        break

      case 'who-joined':
        // Only selected participants
        if (whoJoinedMode === 'equal') {
          // Split equally among participants
          if (participants.length > 0) {
            const participantShare = totalAmount / participants.length
            participants.forEach(id => {
              splitAmounts[id] = participantShare
            })
          }
        } else {
          // Manual amounts for each participant
          participants.forEach(id => {
            splitAmounts[id] = participantAmounts[id] || 0
          })
        }
        break

      case 'itemized':
        // Split based on items ordered
        members.forEach(m => splitAmounts[m.id] = 0)
        items.forEach(item => {
          if (item.selectedBy.length > 0) {
            const itemShare = item.amount / item.selectedBy.length
            item.selectedBy.forEach(id => {
              splitAmounts[id] = (splitAmounts[id] || 0) + itemShare
            })
          }
        })
        break

      case 'custom-percentage':
        // Split based on custom percentages
        members.forEach(m => {
          const percent = percentages[m.id] || 0
          splitAmounts[m.id] = (totalAmount * percent) / 100
        })
        break

      case 'by-duration':
        // Split based on duration/days
        const totalDuration = Object.values(durations).reduce((sum, val) => sum + val, 0)
        if (totalDuration > 0) {
          members.forEach(m => {
            const duration = durations[m.id] || 0
            splitAmounts[m.id] = (totalAmount * duration) / totalDuration
          })
        }
        break
    }

    return splitAmounts
  }

  const validateSplit = (): string | null => {
    if (splitType === 'who-joined' && participants.length === 0) {
      return 'Please select at least one participant'
    }

    if (splitType === 'custom-percentage') {
      const totalPercent = Object.values(percentages).reduce((sum, val) => sum + val, 0)
      if (Math.abs(totalPercent - 100) > 0.5) {
        return `Percentages must add up to 100% (currently ${totalPercent.toFixed(1)}%)`
      }
    }

    if (splitType === 'itemized') {
      const hasItems = items.some(item => item.item.trim() && item.amount > 0)
      if (!hasItems) {
        return 'Please add at least one item with a name and amount'
      }
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const validationError = validateSplit()
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return
    }

    try {
      const splitAmounts = calculateSplitAmounts()
      const splitWith = splitType === 'who-joined' 
        ? participants 
        : splitType === 'itemized'
          ? members.filter(m => splitAmounts[m.id] > 0).map(m => m.id)
          : members.map(m => m.id)
      
      await onAddExpense({
        description,
        amount: parseFloat(amount),
        paidBy,
        splitWith,
        splitType,
        splitAmounts,
        category,
        notes,
        itemSplits: splitType === 'itemized' ? items : undefined,
        duration: splitType === 'by-duration' ? durations : undefined
      })
      
      // Reset form
      setStep(1)
      setDescription('')
      setAmount('')
      setPaidBy(currentUserId)
      setSplitType('equal')
      setParticipants(members.map(m => m.id))
      setPercentages(Object.fromEntries(members.map(m => [m.id, Math.round(100 / members.length)])))
      setDurations(Object.fromEntries(members.map(m => [m.id, 1])))
      setItems([{ item: '', amount: 0, selectedBy: [] }])
      setCategory('other')
      setNotes('')
      setError('')
      setOpen(false)
    } catch (err: any) {
      setError(err.message || 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  const splitAmounts = calculateSplitAmounts()
  const totalPercent = Object.values(percentages).reduce((sum, val) => sum + val, 0)
  const totalAmount = parseFloat(amount) || 0
  const paidByMember = members.find(m => m.id === paidBy)

  const handleNext = () => {
    if (!description.trim()) {
      setError('Please enter a description')
      return
    }
    if (!totalAmount || totalAmount <= 0) {
      setError('Please enter an amount greater than zero')
      return
    }
    setError('')
    setStep(2)
  }

  const handleBack = () => {
    setError('')
    setStep(1)
  }

  // Reset on dialog open
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setStep(1)
      setDescription('')
      setAmount('')
      setPaidBy(currentUserId)
      setSplitType('equal')
      setParticipants(members.map(m => m.id))
      setPercentages(Object.fromEntries(members.map(m => [m.id, Math.round(100 / members.length)])))
      setDurations(Object.fromEntries(members.map(m => [m.id, 1])))
      setItems([{ item: '', amount: 0, selectedBy: [] }])
      setCategory('other')
      setNotes('')
      setError('')
    }
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl p-0 gap-0 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Accessibility - Hidden from visual but available for screen readers */}
        <DialogTitle className="sr-only">Add Group Expense</DialogTitle>
        <DialogDescription className="sr-only">
          Record a group expense with flexible splitting options
        </DialogDescription>
        
        {/* Header with Step Indicator */}
        <div className="px-6 pt-5 pb-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add Expense</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              step >= 1 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step > 1 ? <Check className="h-4 w-4" /> : <span>1</span>}
              <span>Details</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              step >= 2 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              <span>2</span>
              <span>Split</span>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* STEP 1: Basic Details */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Amount - Big and prominent */}
              <div className="text-center py-4">
                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                  How much was spent?
                </Label>
                <div className="relative inline-flex items-center">
                  <span className="text-3xl font-bold text-gray-400 mr-2">৳</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-4xl font-bold text-center border-0 border-b-2 rounded-none bg-transparent w-48 h-16 focus-visible:ring-0 focus-visible:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  What was it for?
                </Label>
                <Input
                  id="description"
                  placeholder="e.g., Dinner, Groceries, Movie tickets..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="h-12 text-base"
                />
              </div>

              {/* Category and Paid By */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-12">
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
                  <Label className="text-sm font-medium">Who paid?</Label>
                  <Select value={paidBy} onValueChange={setPaidBy}>
                    <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.id === currentUserId ? `${member.name} (You)` : member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-500">
                  Notes (optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add any details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Split Configuration */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Summary Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm opacity-90">Total Amount</p>
                    <p className="text-2xl font-bold">৳{totalAmount.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90">Paid by</p>
                    <p className="font-semibold">{paidByMember?.name || 'Unknown'}</p>
                  </div>
                </div>
                <p className="text-sm mt-2 opacity-90">{description}</p>
              </div>

            {/* Split Method Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">How to split?</Label>
              <div className="grid grid-cols-5 gap-2">
                {SPLIT_TYPES.map((type) => {
                  const TypeIcon = type.icon
                  const isSelected = splitType === type.value
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setSplitType(type.value)}
                      className={`p-2 rounded-xl border-2 text-center transition-all ${
                        isSelected
                          ? type.value === 'equal' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' :
                            type.value === 'who-joined' ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20' :
                            type.value === 'itemized' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' :
                            type.value === 'custom-percentage' ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' :
                            'border-pink-500 bg-pink-50 dark:bg-pink-950/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <TypeIcon className={`h-5 w-5 mx-auto mb-1 ${
                        isSelected 
                          ? type.value === 'equal' ? 'text-blue-600 dark:text-blue-400' :
                            type.value === 'who-joined' ? 'text-purple-600 dark:text-purple-400' :
                            type.value === 'itemized' ? 'text-emerald-600 dark:text-emerald-400' :
                            type.value === 'custom-percentage' ? 'text-orange-600 dark:text-orange-400' :
                            'text-pink-600 dark:text-pink-400'
                          : 'text-gray-400'
                      }`} />
                      <p className="text-xs font-medium truncate">{type.label}</p>
                    </button>
                  )
                })}
              </div>
              {/* Split type description */}
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {SPLIT_TYPES.find(t => t.value === splitType)?.desc}
                </p>
                <p className="text-xs text-gray-500 mt-1 italic">
                  {SPLIT_TYPES.find(t => t.value === splitType)?.example}
                </p>
              </div>
            </div>

            {/* Split Configuration */}
            <div className="transition-all duration-200">
              {/* Equal Split */}
              {splitType === 'equal' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Each person pays:</span>
                    <span className="font-bold text-emerald-600 text-lg">
                      ৳{(totalAmount / (members.length || 1)).toFixed(2)}
                    </span>
                  </div>
                  {members.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800 border">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-semibold text-sm">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{member.id === currentUserId ? `${member.name} (You)` : member.name}</span>
                      </div>
                      <span className="font-bold text-emerald-600">৳{(splitAmounts[member.id] || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Who Joined */}
              {splitType === 'who-joined' && (
                <div className="space-y-3">
                  {/* Mode Toggle */}
                  <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setWhoJoinedMode('equal')}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        whoJoinedMode === 'equal'
                          ? 'bg-purple-500 text-white shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      <Scale className="h-4 w-4 inline mr-2" />
                      Split Equally
                    </button>
                    <button
                      type="button"
                      onClick={() => setWhoJoinedMode('manual')}
                      className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        whoJoinedMode === 'manual'
                          ? 'bg-purple-500 text-white shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      <Receipt className="h-4 w-4 inline mr-2" />
                      Manual Amounts
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {whoJoinedMode === 'equal' 
                      ? 'Select members and split the cost equally among them.'
                      : 'Select members and manually enter the amount each person spent.'}
                  </p>

                  {/* Participants List */}
                  <div className="space-y-2">
                    {members.map(member => {
                      const isParticipant = participants.includes(member.id)
                      return (
                        <div 
                          key={member.id} 
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                            isParticipant 
                              ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500 dark:border-purple-600' 
                              : 'border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <Checkbox
                              checked={isParticipant}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setParticipants(prev => [...prev, member.id])
                                } else {
                                  setParticipants(prev => prev.filter(id => id !== member.id))
                                }
                              }}
                              className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                            />
                            <label 
                              className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer flex-1"
                              onClick={() => handleToggleParticipant(member.id)}
                            >
                              {member.name}
                            </label>
                          </div>

                          {isParticipant && (
                            whoJoinedMode === 'manual' ? (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">৳</span>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  value={participantAmounts[member.id] || ''}
                                  onChange={(e) => handleParticipantAmountChange(member.id, e.target.value)}
                                  className="w-28 h-9 text-right"
                                  step="0.01"
                                  min="0"
                                />
                              </div>
                            ) : (
                              <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800">
                                ৳{(splitAmounts[member.id] || 0).toFixed(2)}
                              </div>
                            )
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Summary for Manual Mode */}
                  {whoJoinedMode === 'manual' && participants.length > 0 && (
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Total Entered:</span>
                        <span className={`text-sm font-semibold ${
                          participants.reduce((sum, id) => sum + (participantAmounts[id] || 0), 0) === parseFloat(amount || '0')
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          ৳{participants.reduce((sum, id) => sum + (participantAmounts[id] || 0), 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Expected Total:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          ৳{parseFloat(amount || '0').toFixed(2)}
                        </span>
                      </div>
                      {participants.reduce((sum, id) => sum + (participantAmounts[id] || 0), 0) !== parseFloat(amount || '0') && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                          ⚠️ Amounts don't match the total expense
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Itemized Split */}
              {splitType === 'itemized' && (
                <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <Receipt className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">What did each person order?</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add items and assign them to the people who ordered them.
                  </p>
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={index} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Item name (e.g., Pizza)"
                            value={item.item}
                            onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                            className="flex-1 h-10"
                          />
                          <div className="relative w-32">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">৳</span>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={item.amount || ''}
                              onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                              className="pl-8 h-10"
                              step="0.01"
                            />
                          </div>
                          {items.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(index)}
                              className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-2 block">Who ordered this?</Label>
                          <div className="flex flex-wrap gap-2">
                            {members.map(member => {
                              const isSelected = item.selectedBy.includes(member.id)
                              return (
                                <button
                                  key={member.id}
                                  type="button"
                                  onClick={() => handleToggleItemPerson(index, member.id)}
                                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                                    isSelected
                                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                  }`}
                                >
                                  {member.name}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddItem}
                      className="w-full border-dashed border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Item
                    </Button>
                  </div>
                  
                  {/* Item Summary */}
                  <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Split Summary:</p>
                    <div className="space-y-2">
                      {members.map(member => {
                        const memberAmount = splitAmounts[member.id] || 0
                        if (memberAmount === 0) return null
                        return (
                          <div key={member.id} className="flex justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">{member.name}</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">৳{memberAmount.toFixed(2)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Percentage */}
              {splitType === 'custom-percentage' && (
                <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                        <Percent className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Set custom percentages</h3>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      Math.abs(totalPercent - 100) < 0.5
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800'
                    }`}>
                      Total: {totalPercent.toFixed(0)}%
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Adjust the percentage each person should pay. Must total 100%.
                  </p>
                  <div className="space-y-4">
                    {members.map(member => {
                      const percentage = percentages[member.id] || 0
                      const memberAmount = splitAmounts[member.id] || 0
                      return (
                        <div key={member.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900 dark:text-gray-100">{member.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{percentage}%</span>
                              <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800">
                                ৳{memberAmount.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          <Slider
                            value={[percentage]}
                            onValueChange={(value) => handlePercentageChange(member.id, value)}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* By Duration */}
              {splitType === 'by-duration' && (
                <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
                      <CalendarDays className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Days/hours each person spent</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enter how many days or hours each person participated, and the cost will be split proportionally.
                  </p>
                  <div className="space-y-2">
                    {members.map(member => {
                      const duration = durations[member.id] || 0
                      const memberAmount = splitAmounts[member.id] || 0
                      return (
                        <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                          <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <CalendarDays className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <span className="font-medium flex-1 text-gray-900 dark:text-gray-100">{member.name}</span>
                          <Input
                            type="number"
                            value={duration || ''}
                            onChange={(e) => handleDurationChange(member.id, e.target.value)}
                            className="w-24 h-9 text-center"
                            step="0.5"
                            min="0"
                            placeholder="0"
                          />
                          <span className="text-sm text-muted-foreground w-12">days</span>
                          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-semibold min-w-[80px] text-center border border-emerald-200 dark:border-emerald-800">
                            ৳{memberAmount.toFixed(2)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 dark:bg-gray-900/50 flex gap-3">
          {step === 2 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              Back
            </Button>
          )}
          {step === 1 ? (
            <Button
              onClick={handleNext}
              className="flex-1 h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold"
            >
              Next: Choose Split
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="flex-1 h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}