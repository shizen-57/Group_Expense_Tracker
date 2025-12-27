import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import { Slider } from '../ui/slider'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { ScrollArea } from '../ui/scroll-area'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Users, 
  DollarSign, 
  Receipt, 
  Calendar,
  Percent,
  Scale,
  Sparkles,
  User,
  CheckCircle2,
  AlertCircle,
  Camera,
  FileText
} from 'lucide-react'

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

interface SmartSplitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: Member[]
  onAddExpense: (data: {
    description: string
    amount: number
    paidBy: string
    splitWith: string[]
    splitType: 'equal' | 'itemized' | 'weighted' | 'duration' | 'participation'
    splitAmounts?: Record<string, number>
    itemSplits?: ItemSplit[]
    category: string
    notes?: string
    participants?: string[]
    duration?: Record<string, number>
  }) => void
}

const SPLIT_TYPES = [
  { 
    value: 'equal', 
    label: 'Equal Split', 
    icon: Scale, 
    description: 'Everyone pays the same amount',
    color: 'text-blue-500'
  },
  { 
    value: 'participation', 
    label: 'Who Joined', 
    icon: Users, 
    description: 'Only include people who participated',
    color: 'text-purple-500'
  },
  { 
    value: 'itemized', 
    label: 'Itemized', 
    icon: Receipt, 
    description: 'Split by individual items consumed',
    color: 'text-emerald-500'
  },
  { 
    value: 'weighted', 
    label: 'Custom %', 
    icon: Percent, 
    description: 'Set custom percentages for each person',
    color: 'text-orange-500'
  },
  { 
    value: 'duration', 
    label: 'By Duration', 
    icon: Calendar, 
    description: 'Based on days/hours spent',
    color: 'text-pink-500'
  },
]

const EXPENSE_CATEGORIES = [
  { value: 'food', label: '🍔 Food & Dining', color: 'bg-orange-100 text-orange-700' },
  { value: 'transport', label: '🚗 Transport', color: 'bg-blue-100 text-blue-700' },
  { value: 'accommodation', label: '🏨 Accommodation', color: 'bg-purple-100 text-purple-700' },
  { value: 'entertainment', label: '🎉 Entertainment', color: 'bg-pink-100 text-pink-700' },
  { value: 'shopping', label: '🛍️ Shopping', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'utilities', label: '⚡ Utilities', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'other', label: '📦 Other', color: 'bg-gray-100 text-gray-700' },
]

export function SmartSplitDialog({ open, onOpenChange, members, onAddExpense }: SmartSplitDialogProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState(members[0]?.id || '')
  const [splitType, setSplitType] = useState<'equal' | 'itemized' | 'weighted' | 'duration' | 'participation'>('participation')
  const [category, setCategory] = useState('food')
  const [notes, setNotes] = useState('')
  
  // Participation-based
  const [participants, setParticipants] = useState<string[]>(members.map(m => m.id))
  
  // Weighted split
  const [weights, setWeights] = useState<Record<string, number>>(
    Object.fromEntries(members.map(m => [m.id, 100 / members.length]))
  )
  
  // Duration-based
  const [durations, setDurations] = useState<Record<string, number>>(
    Object.fromEntries(members.map(m => [m.id, 1]))
  )
  
  // Itemized split
  const [items, setItems] = useState<ItemSplit[]>([
    { item: '', amount: 0, selectedBy: [] }
  ])

  useEffect(() => {
    if (members.length > 0 && !paidBy) {
      setPaidBy(members[0].id)
    }
  }, [members, paidBy])

  const handleAddItem = () => {
    setItems([...items, { item: '', amount: 0, selectedBy: [] }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof ItemSplit, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const toggleItemParticipant = (itemIndex: number, memberId: string) => {
    const newItems = [...items]
    const selectedBy = newItems[itemIndex].selectedBy
    if (selectedBy.includes(memberId)) {
      newItems[itemIndex].selectedBy = selectedBy.filter(id => id !== memberId)
    } else {
      newItems[itemIndex].selectedBy = [...selectedBy, memberId]
    }
    setItems(newItems)
  }

  const toggleParticipant = (memberId: string) => {
    setParticipants(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  const calculateSplitAmounts = (): Record<string, number> => {
    const totalAmount = parseFloat(amount) || 0

    switch (splitType) {
      case 'equal':
        const equalShare = totalAmount / members.length
        return Object.fromEntries(members.map(m => [m.id, equalShare]))

      case 'participation':
        const participantShare = totalAmount / participants.length
        return Object.fromEntries(
          participants.map(id => [id, participantShare])
        )

      case 'weighted':
        const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0)
        return Object.fromEntries(
          Object.entries(weights).map(([id, weight]) => [
            id,
            (weight / totalWeight) * totalAmount
          ])
        )

      case 'duration':
        const totalDuration = Object.values(durations).reduce((sum, d) => sum + d, 0)
        return Object.fromEntries(
          Object.entries(durations).map(([id, days]) => [
            id,
            (days / totalDuration) * totalAmount
          ])
        )

      case 'itemized':
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

      default:
        return {}
    }
  }

  const splitAmounts = calculateSplitAmounts()
  const totalSplit = Object.values(splitAmounts).reduce((sum, amt) => sum + amt, 0)
  const isBalanced = Math.abs(totalSplit - parseFloat(amount || '0')) < 0.01

  const handleSubmit = () => {
    if (!description.trim() || !amount || !paidBy) return

    const splitWith = splitType === 'participation' 
      ? participants 
      : splitType === 'itemized'
        ? members.filter(m => splitAmounts[m.id] > 0).map(m => m.id)
        : members.map(m => m.id)

    onAddExpense({
      description: description.trim(),
      amount: parseFloat(amount),
      paidBy,
      splitWith,
      splitType,
      splitAmounts,
      itemSplits: splitType === 'itemized' ? items : undefined,
      category,
      notes: notes.trim(),
      participants: splitType === 'participation' ? participants : undefined,
      duration: splitType === 'duration' ? durations : undefined,
    })

    // Reset form
    setDescription('')
    setAmount('')
    setNotes('')
    setSplitType('participation')
    setParticipants(members.map(m => m.id))
    setItems([{ item: '', amount: 0, selectedBy: [] }])
  }

  const selectedSplitType = SPLIT_TYPES.find(t => t.value === splitType) || SPLIT_TYPES[0]
  const SplitIcon = selectedSplitType.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
              <SplitIcon className={`h-6 w-6 ${selectedSplitType.color}`} />
            </div>
            <div>
              <DialogTitle className="text-2xl">Add Smart Expense</DialogTitle>
              <DialogDescription>
                {selectedSplitType.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">What did you buy? *</Label>
                  <Input
                    id="description"
                    placeholder="Lunch at restaurant"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Paid by</Label>
                  <Select value={paidBy} onValueChange={setPaidBy}>
                    <SelectTrigger>
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
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Split Type Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                How should we split this?
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SPLIT_TYPES.map((type) => {
                  const TypeIcon = type.icon
                  return (
                    <motion.button
                      key={type.value}
                      type="button"
                      onClick={() => setSplitType(type.value as any)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        splitType === type.value
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <TypeIcon className={`h-5 w-5 mb-1 ${
                        splitType === type.value ? 'text-emerald-600' : 'text-gray-400'
                      }`} />
                      <p className={`text-sm font-medium ${
                        splitType === type.value ? 'text-emerald-900' : 'text-gray-700'
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
                className="space-y-4"
              >
                {splitType === 'participation' && (
                  <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                    <Label className="mb-3 flex items-center gap-2 text-purple-900">
                      <Users className="h-4 w-4" />
                      Who joined this expense?
                    </Label>
                    <div className="space-y-2">
                      {members.map(member => (
                        <div key={member.id} className="flex items-center gap-3 p-2 rounded bg-white">
                          <Checkbox
                            checked={participants.includes(member.id)}
                            onCheckedChange={() => toggleParticipant(member.id)}
                          />
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="flex-1">{member.name}</span>
                          {participants.includes(member.id) && (
                            <Badge variant="secondary" className="text-xs">
                              ${(splitAmounts[member.id] || 0).toFixed(2)}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {splitType === 'weighted' && (
                  <div className="p-4 rounded-lg bg-orange-50 border border-orange-100">
                    <Label className="mb-3 flex items-center gap-2 text-orange-900">
                      <Percent className="h-4 w-4" />
                      Set custom percentages
                    </Label>
                    <div className="space-y-4">
                      {members.map(member => (
                        <div key={member.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{member.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {weights[member.id]?.toFixed(0)}%
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                ${(splitAmounts[member.id] || 0).toFixed(2)}
                              </Badge>
                            </div>
                          </div>
                          <Slider
                            value={[weights[member.id] || 0]}
                            onValueChange={(value) => setWeights({ ...weights, [member.id]: value[0] })}
                            max={100}
                            step={5}
                            className="w-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {splitType === 'duration' && (
                  <div className="p-4 rounded-lg bg-pink-50 border border-pink-100">
                    <Label className="mb-3 flex items-center gap-2 text-pink-900">
                      <Calendar className="h-4 w-4" />
                      Days/hours each person spent
                    </Label>
                    <div className="space-y-3">
                      {members.map(member => (
                        <div key={member.id} className="flex items-center gap-3 p-2 rounded bg-white">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="flex-1">{member.name}</span>
                          <Input
                            type="number"
                            value={durations[member.id] || 0}
                            onChange={(e) => setDurations({ 
                              ...durations, 
                              [member.id]: parseFloat(e.target.value) || 0 
                            })}
                            className="w-24"
                            step="0.5"
                            min="0"
                          />
                          <span className="text-sm text-muted-foreground w-16">days</span>
                          <Badge variant="secondary" className="text-xs w-20 justify-center">
                            ${(splitAmounts[member.id] || 0).toFixed(2)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {splitType === 'itemized' && (
                  <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                    <Label className="mb-3 flex items-center gap-2 text-emerald-900">
                      <Receipt className="h-4 w-4" />
                      What did each person order?
                    </Label>
                    <div className="space-y-3">
                      {items.map((item, index) => (
                        <div key={index} className="p-3 rounded-lg bg-white border border-emerald-200 space-y-3">
                          <div className="flex gap-3">
                            <Input
                              placeholder="Item name"
                              value={item.item}
                              onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                              className="flex-1"
                            />
                            <div className="relative w-32">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={item.amount || ''}
                                onChange={(e) => handleItemChange(index, 'amount', parseFloat(e.target.value) || 0)}
                                className="pl-10"
                                step="0.01"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(index)}
                              disabled={items.length === 1}
                            >
                              ×
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {members.map(member => (
                              <Badge
                                key={member.id}
                                variant={item.selectedBy.includes(member.id) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => toggleItemParticipant(index, member.id)}
                              >
                                {member.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={handleAddItem}
                        className="w-full border-dashed"
                      >
                        + Add Item
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Split Summary */}
            {amount && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-gray-900">Split Summary</Label>
                  {isBalanced ? (
                    <Badge className="gap-1 bg-emerald-500">
                      <CheckCircle2 className="h-3 w-3" />
                      Balanced
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      ${Math.abs(parseFloat(amount) - totalSplit).toFixed(2)} off
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  {Object.entries(splitAmounts)
                    .filter(([_, amt]) => amt > 0)
                    .map(([memberId, amt]) => {
                      const member = members.find(m => m.id === memberId)
                      return (
                        <div key={memberId} className="flex items-center justify-between p-2 rounded bg-white">
                          <span className="text-sm">{member?.name}</span>
                          <span className="font-medium">${amt.toFixed(2)}</span>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* Notes */}
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
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!description.trim() || !amount || !paidBy || !isBalanced}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            Add Expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
