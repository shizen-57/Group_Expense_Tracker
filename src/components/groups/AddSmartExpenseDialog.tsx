import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Separator } from '../ui/separator'
import { ScrollArea } from '../ui/scroll-area'
import { motion, AnimatePresence } from 'motion/react'
import { 
  CalendarDays,
  Scale,
  Users,
  Receipt,
  Percent,
  X,
  ChevronRight,
  DollarSign
} from 'lucide-react'
import { expenseCategories } from './ExpenseCategories'

interface Member {
  id: string
  name: string
  username: string
}

interface ItemSplit {
  item: string
  amount: number
  selectedBy: string[]
}

interface DurationData {
  [memberId: string]: number
}

interface AddSmartExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: Member[]
  currentUserId: string
  onAddExpense: (data: {
    description: string
    amount: number
    paidBy: string
    splitWith: string[]
    splitType: 'equal' | 'who-joined' | 'itemized' | 'custom-percentage' | 'by-duration'
    splitAmounts?: Record<string, number>
    itemSplits?: ItemSplit[]
    category: string
    notes?: string
    duration?: DurationData
  }) => Promise<void>
}

type SplitType = 'equal' | 'who-joined' | 'itemized' | 'custom-percentage' | 'by-duration'

const SPLIT_TYPES = [
  { 
    value: 'equal' as const, 
    label: 'Equal Split', 
    icon: Scale,
    description: 'Everyone pays the same amount'
  },
  { 
    value: 'who-joined' as const, 
    label: 'Who Joined', 
    icon: Users,
    description: 'Only include people who participated'
  },
  { 
    value: 'itemized' as const, 
    label: 'Itemized', 
    icon: Receipt,
    description: 'Split by individual items consumed'
  },
  { 
    value: 'custom-percentage' as const, 
    label: 'Custom %', 
    icon: Percent,
    description: 'Set custom percentages for each person'
  },
  { 
    value: 'by-duration' as const, 
    label: 'By Duration', 
    icon: CalendarDays,
    description: 'Based on days/hours spent'
  },
]

export function AddSmartExpenseDialog({ 
  open, 
  onOpenChange, 
  members, 
  currentUserId,
  onAddExpense 
}: AddSmartExpenseDialogProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState(currentUserId)
  const [splitType, setSplitType] = useState<SplitType>('by-duration')
  const [category, setCategory] = useState('food')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Who Joined
  const [participants, setParticipants] = useState<string[]>(members.map(m => m.id))
  
  // Custom Percentage
  const [percentages, setPercentages] = useState<Record<string, number>>(
    Object.fromEntries(members.map(m => [m.id, (100 / members.length)]))
  )
  
  // By Duration
  const [durations, setDurations] = useState<DurationData>(
    Object.fromEntries(members.map(m => [m.id, 1]))
  )
  
  // Itemized
  const [items, setItems] = useState<ItemSplit[]>([
    { item: '', amount: 0, selectedBy: [] }
  ])

  useEffect(() => {
    if (members.length > 0 && !paidBy) {
      setPaidBy(members[0].id)
    }
  }, [members, paidBy])

  const calculateSplitAmounts = (): Record<string, number> => {
    const totalAmount = parseFloat(amount) || 0

    switch (splitType) {
      case 'equal': {
        const equalShare = totalAmount / members.length
        return Object.fromEntries(members.map(m => [m.id, equalShare]))
      }

      case 'who-joined': {
        const participantShare = totalAmount / participants.length
        return Object.fromEntries(
          participants.map(id => [id, participantShare])
        )
      }

      case 'custom-percentage': {
        return Object.fromEntries(
          Object.entries(percentages).map(([id, percent]) => [
            id,
            (totalAmount * percent) / 100
          ])
        )
      }

      case 'by-duration': {
        const totalDuration = Object.values(durations).reduce((sum, d) => sum + d, 0)
        if (totalDuration === 0) return {}
        return Object.fromEntries(
          Object.entries(durations).map(([id, days]) => [
            id,
            (days / totalDuration) * totalAmount
          ])
        )
      }

      case 'itemized': {
        const splitAmounts: Record<string, number> = {}
        members.forEach(m => splitAmounts[m.id] = 0)
        
        items.forEach(item => {
          if (item.selectedBy.length > 0) {
            const itemShare = item.amount / item.selectedBy.length
            item.selectedBy.forEach(id => {
              splitAmounts[id] = (splitAmounts[id] || 0) + itemShare
            })
          }
        })
        return splitAmounts
      }

      default:
        return {}
    }
  }

  const splitAmounts = calculateSplitAmounts()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const splitWith = splitType === 'who-joined' 
        ? participants 
        : splitType === 'itemized'
          ? members.filter(m => splitAmounts[m.id] > 0).map(m => m.id)
          : members.map(m => m.id)

      await onAddExpense({
        description: description.trim(),
        amount: parseFloat(amount),
        paidBy,
        splitWith,
        splitType,
        splitAmounts,
        itemSplits: splitType === 'itemized' ? items : undefined,
        category,
        notes: notes.trim(),
        duration: splitType === 'by-duration' ? durations : undefined,
      })

      // Reset form
      setDescription('')
      setAmount('')
      setNotes('')
      setParticipants(members.map(m => m.id))
      setItems([{ item: '', amount: 0, selectedBy: [] }])
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  const getMemberName = (id: string) => {
    return members.find(m => m.id === id)?.name || 'Unknown'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/20">
              <CalendarDays className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Add Smart Expense</h2>
              <p className="text-sm text-muted-foreground">Based on days/hours spent</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-6">
          <form onSubmit={handleSubmit} className="space-y-5 py-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  What did you buy? <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="description"
                  placeholder="Lunch at restaurant"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">
                  Amount <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    $
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    step="0.01"
                    min="0.01"
                    className="pl-8 h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Paid by</Label>
                <Select value={paidBy} onValueChange={setPaidBy}>
                  <SelectTrigger className="h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
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
            </div>

            {/* Split Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2 text-teal-700 dark:text-teal-300">
                <ChevronRight className="h-4 w-4" />
                How should we split this?
              </Label>
              
              <div className="grid grid-cols-3 gap-3">
                {SPLIT_TYPES.map((type) => {
                  const TypeIcon = type.icon
                  const isSelected = splitType === type.value
                  return (
                    <motion.button
                      key={type.value}
                      type="button"
                      onClick={() => setSplitType(type.value)}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/20 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <TypeIcon className={`h-5 w-5 mb-2 ${
                        isSelected ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400'
                      }`} />
                      <p className={`text-sm ${
                        isSelected 
                          ? 'text-teal-900 dark:text-teal-100 font-medium' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {type.label}
                      </p>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Split Configuration */}
            <AnimatePresence mode="wait">
              <motion.div
                key={splitType}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Equal Split */}
                {splitType === 'equal' && (
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 space-y-3">
                    <Label className="flex items-center gap-2 text-blue-900 dark:text-blue-100 font-medium">
                      <Scale className="h-4 w-4" />
                      Everyone pays equally
                    </Label>
                    <div className="space-y-2">
                      {members.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{member.name}</span>
                          </div>
                          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-md">
                            ৳{(splitAmounts[member.id] || 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Who Joined */}
                {splitType === 'who-joined' && (
                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 space-y-3">
                    <Label className="flex items-center gap-2 text-purple-900 dark:text-purple-100 font-medium">
                      <Users className="h-4 w-4" />
                      Who participated?
                    </Label>
                    <div className="space-y-2">
                      {members.map(member => {
                        const isParticipant = participants.includes(member.id)
                        return (
                          <div 
                            key={member.id} 
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                              isParticipant 
                                ? 'bg-purple-100 dark:bg-purple-900/40 border border-purple-300 dark:border-purple-700' 
                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                            }`}
                            onClick={() => {
                              setParticipants(prev =>
                                prev.includes(member.id)
                                  ? prev.filter(id => id !== member.id)
                                  : [...prev, member.id]
                              )
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{member.name}</span>
                            </div>
                            {isParticipant && (
                              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-md">
                                ৳{(splitAmounts[member.id] || 0).toFixed(2)}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Itemized */}
                {splitType === 'itemized' && (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 space-y-3">
                    <Label className="flex items-center gap-2 text-emerald-900 dark:text-emerald-100 font-medium">
                      <Receipt className="h-4 w-4" />
                      Add items and assign to members
                    </Label>
                    <div className="space-y-3">
                      {items.map((item, index) => (
                        <div key={index} className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-900 space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Item name"
                              value={item.item}
                              onChange={(e) => {
                                const newItems = [...items]
                                newItems[index] = { ...newItems[index], item: e.target.value }
                                setItems(newItems)
                              }}
                              className="flex-1 h-9"
                            />
                            <div className="relative w-28">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">৳</span>
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={item.amount || ''}
                                onChange={(e) => {
                                  const newItems = [...items]
                                  newItems[index] = { ...newItems[index], amount: parseFloat(e.target.value) || 0 }
                                  setItems(newItems)
                                }}
                                className="pl-7 h-9"
                                step="0.01"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (items.length > 1) {
                                  setItems(items.filter((_, i) => i !== index))
                                }
                              }}
                              className="h-9 w-9"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {members.map(member => {
                              const isSelected = item.selectedBy.includes(member.id)
                              return (
                                <button
                                  key={member.id}
                                  type="button"
                                  onClick={() => {
                                    const newItems = [...items]
                                    const selectedBy = newItems[index].selectedBy
                                    if (isSelected) {
                                      newItems[index].selectedBy = selectedBy.filter(id => id !== member.id)
                                    } else {
                                      newItems[index].selectedBy = [...selectedBy, member.id]
                                    }
                                    setItems(newItems)
                                  }}
                                  className={`px-3 py-1 rounded-md text-xs transition-all ${
                                    isSelected
                                      ? 'bg-emerald-500 text-white'
                                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                  }`}
                                >
                                  {member.name}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setItems([...items, { item: '', amount: 0, selectedBy: [] }])}
                        className="w-full border-dashed"
                      >
                        + Add Item
                      </Button>
                    </div>
                  </div>
                )}

                {/* Custom Percentage */}
                {splitType === 'custom-percentage' && (
                  <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/50 space-y-3">
                    <Label className="flex items-center gap-2 text-orange-900 dark:text-orange-100 font-medium">
                      <Percent className="h-4 w-4" />
                      Set custom percentages (must total 100%)
                    </Label>
                    <div className="space-y-3">
                      {members.map(member => (
                        <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm flex-1">{member.name}</span>
                          <Input
                            type="number"
                            value={percentages[member.id] || ''}
                            onChange={(e) => {
                              setPercentages({ 
                                ...percentages, 
                                [member.id]: parseFloat(e.target.value) || 0 
                              })
                            }}
                            className="w-20 h-9"
                            step="0.1"
                            min="0"
                            max="100"
                          />
                          <span className="text-sm text-muted-foreground w-4">%</span>
                          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-md w-24 text-center">
                            ৳{(splitAmounts[member.id] || 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* By Duration */}
                {splitType === 'by-duration' && (
                  <div className="p-4 rounded-xl bg-pink-50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/50 space-y-3">
                    <Label className="flex items-center gap-2 text-pink-900 dark:text-pink-100 font-medium">
                      <CalendarDays className="h-4 w-4" />
                      Days/hours each person spent
                    </Label>
                    <div className="space-y-2">
                      {members.map(member => (
                        <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm flex-1">{member.name}</span>
                          <Input
                            type="number"
                            value={durations[member.id] || ''}
                            onChange={(e) => {
                              setDurations({ 
                                ...durations, 
                                [member.id]: parseFloat(e.target.value) || 0 
                              })
                            }}
                            className="w-20 h-9"
                            step="0.5"
                            min="0"
                          />
                          <span className="text-sm text-muted-foreground w-12">days</span>
                          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-md w-24 text-center">
                            ৳{(splitAmounts[member.id] || 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="resize-none bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}
          </form>
        </ScrollArea>

        {/* Footer */}
        <div className="p-6 pt-4 border-t bg-gray-50 dark:bg-gray-900/50">
          <Button 
            type="submit" 
            onClick={handleSubmit}
            className="w-full h-11 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white" 
            disabled={loading || !description.trim() || !amount}
          >
            {loading ? 'Adding...' : 'Add Smart Expense'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}