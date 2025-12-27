import { useMemo, useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { ArrowLeft, Users, Receipt, Calculator, Search, Filter, Download, Crown, Trash2, AlertTriangle, ArrowRight, Clock, DollarSign, Banknote } from 'lucide-react'
import { AddFriendToGroupDialog } from './AddFriendToGroupDialog'
import { EnhancedAddExpenseDialog } from './EnhancedAddExpenseDialog'
import { SettleGroupBillDialog } from './SettleGroupBillDialog'
import { RecordPaymentDialog } from './RecordPaymentDialog'
import { getCategoryInfo } from './ExpenseCategories'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog'
import { Badge } from '../ui/badge'
import type {
  GroupExpensePayload,
  GroupPaymentPayload,
  GroupSplitType,
  ItemSplit,
  DurationData,
  GroupSummary,
  GroupActivityEntry,
  GroupMemberSummary
} from '@/types/groups'

interface Member {
  id: string
  name: string
  email: string
  username: string
}

interface Friend {
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
  splitType?: GroupSplitType
  splitAmounts?: Record<string, number>
  itemSplits?: ItemSplit[]
  duration?: DurationData
  createdBy: string
  createdAt: string
  category?: string
  notes?: string
}

interface Payment {
  id: string
  fromMemberId: string
  toMemberId: string
  amount: number
  note?: string
  createdBy: string
  createdAt: string
}

interface GroupDetailProps {
  group: {
    id: string
    name: string
    description: string
    createdBy: string
    members: Member[]
    expenses: Expense[]
    balances: Record<string, number>
    payments?: Payment[]
    summary?: GroupSummary
    activity?: GroupActivityEntry[]
  }
  currentUserId: string
  friends: Friend[]
  onBack: () => void
  onAddMember: (friendId: string) => Promise<void>
  onAddExpense: (data: GroupExpensePayload) => Promise<void>
  onRecordPayment: (data: GroupPaymentPayload) => Promise<void>
  onSimplify: () => Promise<void>
  onSettleAndSync: () => Promise<void>
  onDeleteGroup: () => Promise<void>
}

export function GroupDetail({ 
  group, 
  currentUserId, 
  friends,
  onBack, 
  onAddMember, 
  onAddExpense, 
  onRecordPayment,
  onSimplify,
  onSettleAndSync,
  onDeleteGroup
}: GroupDetailProps) {
  const [simplifying, setSimplifying] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [deleting, setDeleting] = useState(false)

  const isCreator = group.createdBy === currentUserId
  const balanceKeySeparator = '__'

  // Define parseBalanceKey early so it can be used in useMemo
  const parseBalanceKey = (key: string) => {
    if (key.includes(balanceKeySeparator)) {
      const [creditorId, debtorId] = key.split(balanceKeySeparator)
      return { creditorId, debtorId }
    }

    const parts = key.split('-')
    if (parts.length >= 10) {
      return {
        creditorId: parts.slice(0, 5).join('-'),
        debtorId: parts.slice(5).join('-'),
      }
    }

    if (parts.length >= 2) {
      return {
        creditorId: parts[0],
        debtorId: parts.slice(1).join('-'),
      }
    }

    return { creditorId: key, debtorId: key }
  }

  const memberSummaries = group.summary?.memberSummaries || []

  // Calculate your balances from the balance map directly
  const yourBalanceDetails = useMemo(() => {
    const balances = group.balances || {}
    const memberIds = new Set(group.members.map(m => m.id))
    let youOweTotal = 0
    let youAreOwedTotal = 0
    const whoYouOwe: { memberId: string; amount: number }[] = []
    const whoOwesYou: { memberId: string; amount: number }[] = []

    Object.entries(balances).forEach(([key, amount]) => {
      if (typeof amount !== 'number' || Math.abs(amount) < 0.01) return
      const { creditorId, debtorId } = parseBalanceKey(key)

      // Skip balances involving members who are no longer in the group
      if (!memberIds.has(creditorId) || !memberIds.has(debtorId)) return

      // Key format: creditor__debtor means debtor owes creditor
      if (debtorId === currentUserId) {
        // You are the debtor, you owe this amount
        youOweTotal += amount
        whoYouOwe.push({ memberId: creditorId, amount })
      } else if (creditorId === currentUserId) {
        // You are the creditor, someone owes you
        youAreOwedTotal += amount
        whoOwesYou.push({ memberId: debtorId, amount })
      }
    })

    return {
      youOwe: parseFloat(youOweTotal.toFixed(2)),
      youAreOwed: parseFloat(youAreOwedTotal.toFixed(2)),
      netBalance: parseFloat((youAreOwedTotal - youOweTotal).toFixed(2)),
      whoYouOwe,
      whoOwesYou
    }
  }, [group.balances, group.members, currentUserId])

  const { youOwe, youAreOwed, netBalance: yourNetBalance, whoYouOwe, whoOwesYou } = yourBalanceDetails

  const outstandingBalance = group.summary
    ? group.summary.outstandingBalance
    : Object.values(group.balances || {}).reduce((sum, value) => sum + (typeof value === 'number' ? value : 0), 0)

  const netBalanceColor = yourNetBalance > 0
    ? 'text-emerald-600'
    : yourNetBalance < 0
      ? 'text-red-600'
      : 'text-muted-foreground'

  const netBalanceDescription = yourNetBalance > 0
    ? 'You are owed money overall'
    : yourNetBalance < 0
      ? 'You still owe money overall'
      : 'All settled up!'

  const memberDirectory = useMemo(() => {
    const directory: Record<string, { name?: string; username?: string; email?: string }> = {}

    const register = (id: string, data: { name?: string; username?: string; email?: string }) => {
      if (!id) return
      directory[id] = {
        name: data.name || directory[id]?.name,
        username: data.username || directory[id]?.username,
        email: data.email || directory[id]?.email,
      }
    }

    group.members.forEach(member => {
      register(member.id, { name: member.name, username: member.username, email: member.email })
    })

    friends.forEach(friend => {
      register(friend.id, { name: friend.name, username: friend.username, email: friend.email })
    })

    return directory
  }, [group.members, friends])

  const formatUsername = (username?: string) => {
    if (!username) return ''
    return username.startsWith('@') ? username : `@${username}`
  }

  const deriveEmailHandle = (email?: string) => {
    if (!email) return ''
    const [handle] = email.split('@')
    return handle || ''
  }

  const handleSimplify = async () => {
    setSimplifying(true)
    try {
      await onSimplify()
    } catch (error) {
      console.error('Failed to simplify debts:', error)
    } finally {
      setSimplifying(false)
    }
  }

  const handleDeleteGroup = async () => {
    setDeleting(true)
    try {
      await onDeleteGroup()
    } catch (error) {
      console.error('Failed to delete group:', error)
    } finally {
      setDeleting(false)
    }
  }

  const getMemberName = (userId: string) => {
    if (userId === currentUserId) {
      return 'You'
    }
    const entry = memberDirectory[userId]
    const display = entry?.name?.trim()
      || formatUsername(entry?.username)
      || deriveEmailHandle(entry?.email)
    if (display) {
      return display
    }
    const shortId = userId ? `${userId.substring(0, 6)}…` : 'member'
    return `Member ${shortId}`
  }

  const getMemberInitial = (user: Member) => {
    const source = user.name?.trim()
      || formatUsername(user.username)
      || deriveEmailHandle(user.email)
      || '?'
    return source.charAt(0).toUpperCase()
  }

  const getMemberLabel = (user: Member) => {
    return user.name?.trim()
      || formatUsername(user.username)
      || deriveEmailHandle(user.email)
      || 'Member'
  }

  const resolveSplitParticipants = (expense: Expense) => {
    if (expense.splitAmounts && Object.keys(expense.splitAmounts).length > 0) {
      return Array.from(new Set(Object.keys(expense.splitAmounts)))
    }
    return Array.from(new Set(expense.splitWith || []))
  }

  const getSplitDetailsHeading = (expense: Expense) => {
    switch (expense.splitType) {
      case 'itemized':
        return 'Item totals'
      case 'custom-percentage':
      case 'percentage':
        return 'Percentage split'
      case 'by-duration':
        return 'Duration-based split'
      case 'who-joined':
        return 'Participants'
      case 'unequal':
        return 'Custom split'
      default:
        return 'Split details'
    }
  }

  const getParticipantSplitMeta = (expense: Expense, memberId: string) => {
    if (!expense.splitAmounts) {
      return ''
    }

    if ((expense.splitType === 'custom-percentage' || expense.splitType === 'percentage') && expense.amount > 0) {
      const memberAmount = expense.splitAmounts[memberId] || 0
      const percent = (memberAmount / expense.amount) * 100
      return ` (${percent.toFixed(1)}%)`
    }

    if (expense.splitType === 'by-duration' && expense.duration?.[memberId]) {
      return ` (${expense.duration[memberId]} days)`
    }

    return ''
  }

  const renderSplitDetails = (expense: Expense) => {
    if (!expense.splitType || expense.splitType === 'equal' || !expense.splitAmounts) {
      if (expense.splitType === 'itemized' && expense.itemSplits?.length) {
        // Fall through to show item list even if splitAmounts missing
      } else {
        return null
      }
    }

    const participants = resolveSplitParticipants(expense).filter(memberId => {
      const amount = expense.splitAmounts?.[memberId] || 0
      return Math.abs(amount) > 0.009
    })

    const hasSplitSummary = participants.length > 0 && expense.splitAmounts
    const hasItemDetails = expense.splitType === 'itemized' && expense.itemSplits && expense.itemSplits.length > 0

    if (!hasSplitSummary && !hasItemDetails) {
      return null
    }

    return (
      <div className="mt-2 space-y-2">
        {hasSplitSummary && (
          <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
            <p className="font-medium mb-1">{getSplitDetailsHeading(expense)}</p>
            <div className="space-y-0.5">
              {participants.map(memberId => (
                <div key={memberId} className="flex justify-between">
                  <span>
                    {getMemberName(memberId)}
                    {getParticipantSplitMeta(expense, memberId)}
                  </span>
                  <span>৳{(expense.splitAmounts![memberId] || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {hasItemDetails && (
          <div className="text-xs bg-emerald-50/80 text-emerald-900 p-2 rounded border border-emerald-100">
            <p className="font-medium mb-1">Itemized breakdown</p>
            <div className="space-y-1">
              {expense.itemSplits!.map((item, index) => (
                <div key={`${item.item}-${index}`} className="border border-emerald-100 rounded px-2 py-1 bg-white/60">
                  <div className="flex justify-between text-[13px] text-gray-900">
                    <span className="font-semibold">{item.item || 'Item'}</span>
                    <span className="font-semibold">৳{(item.amount || 0).toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {(item.selectedBy || []).length > 0
                      ? item.selectedBy.map(getMemberName).join(', ')
                      : 'No attendees selected'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const filterExpenses = (expenses: Expense[], search: string, category: string) => {
    return expenses.filter(expense => {
      const matchesSearch = search === '' || 
        expense.description.toLowerCase().includes(search.toLowerCase()) ||
        getMemberName(expense.paidBy).toLowerCase().includes(search.toLowerCase()) ||
        expense.notes?.toLowerCase().includes(search.toLowerCase())
      
      const matchesCategory = category === 'all' || expense.category === category
      
      return matchesSearch && matchesCategory
    })
  }

  const buildSplitDetailsText = (expense: Expense) => {
    if (!expense.splitAmounts) {
      return ''
    }

    const participants = resolveSplitParticipants(expense)
    const participantRows = participants
      .map(memberId => {
        const amount = expense.splitAmounts![memberId] || 0
        if (Math.abs(amount) <= 0.009) {
          return null
        }
        const meta = getParticipantSplitMeta(expense, memberId)
        return `${getMemberName(memberId)}: ৳${amount.toFixed(2)}${meta}`
      })
      .filter(Boolean) as string[]

    let summary = participantRows.join(' | ')

    if (expense.splitType === 'itemized' && expense.itemSplits?.length) {
      const itemSummary = expense.itemSplits
        .map(item => {
          const attendees = (item.selectedBy || []).map(getMemberName).join(', ') || 'Unassigned'
          return `${item.item || 'Item'} ৳${(item.amount || 0).toFixed(2)} → ${attendees}`
        })
        .join(' | ')
      summary = summary
        ? `${summary} || Items: ${itemSummary}`
        : `Items: ${itemSummary}`
    }

    if (expense.splitType === 'by-duration' && expense.duration) {
      const durationSummary = Object.entries(expense.duration)
        .map(([memberId, value]) => `${getMemberName(memberId)}: ${value} days`)
        .join(' | ')
      summary = summary
        ? `${summary} || Duration: ${durationSummary}`
        : `Duration: ${durationSummary}`
    }

    return summary
  }

  const generateExpenseCSV = (expenses: Expense[]) => {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Paid By', 'Split Type', 'Participants', 'Split Details', 'Notes']
    const rows = expenses.map(expense => {
      const participants = resolveSplitParticipants(expense)
      return [
        new Date(expense.createdAt).toLocaleDateString(),
        expense.description,
        getCategoryInfo(expense.category || 'other').label,
        expense.amount.toFixed(2),
        getMemberName(expense.paidBy),
        getSplitTypeLabel(expense.splitType),
        participants.map(id => getMemberName(id)).join('; '),
        buildSplitDetailsText(expense),
        expense.notes || ''
      ]
    })
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  }

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const splitTypeLabels: Record<GroupSplitType, string> = {
    equal: 'Equal split',
    unequal: 'Custom split',
    percentage: 'Percentage split',
    'who-joined': 'Who Joined',
    itemized: 'Itemized split',
    'custom-percentage': 'Custom % split',
    'by-duration': 'Duration-based split',
  }

  const getSplitTypeLabel = (type?: GroupSplitType) => {
    if (!type) return 'Equal split'
    return splitTypeLabels[type] || 'Custom split'
  }

  const getBalanceDisplay = () => {
    const balances = group.balances || {}
    const memberIds = new Set(group.members.map(m => m.id))
    
    // Filter out entries with invalid amounts or where either party is not a current group member
    const entries = Object.entries(balances).filter(([key, amount]) => {
      if (Math.abs(amount as number) <= 0.01) return false
      const { creditorId, debtorId } = parseBalanceKey(key)
      // Only show balances where both parties are current group members
      return memberIds.has(creditorId) && memberIds.has(debtorId)
    })
    
    if (entries.length === 0) {
      return (
        <div className="text-center py-4">
          <div className="inline-flex p-3 rounded-full bg-emerald-100 mb-2">
            <DollarSign className="h-6 w-6 text-emerald-600" />
          </div>
          <p className="text-muted-foreground">All settled up! 🎉</p>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {entries.map(([key, amount]) => {
          const { creditorId, debtorId } = parseBalanceKey(key)
          const creditorName = getMemberName(creditorId)
          const debtorName = getMemberName(debtorId)
          const isYouDebtor = debtorId === currentUserId
          const isYouCreditor = creditorId === currentUserId
          
          return (
            <div 
              key={key} 
              className={`flex justify-between items-center p-3 rounded-lg border transition-colors ${
                isYouDebtor 
                  ? 'bg-red-50 border-red-200' 
                  : isYouCreditor 
                    ? 'bg-emerald-50 border-emerald-200' 
                    : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${
                  isYouDebtor ? 'text-red-700' : isYouCreditor ? 'text-emerald-700' : 'text-gray-700'
                }`}>
                  {debtorName}
                </span>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <span className={`text-sm font-medium ${
                  isYouCreditor ? 'text-emerald-700' : isYouDebtor ? 'text-red-700' : 'text-gray-700'
                }`}>
                  {creditorName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${
                  isYouDebtor ? 'text-red-600' : isYouCreditor ? 'text-emerald-600' : 'text-gray-700'
                }`}>
                  ৳{(amount as number).toFixed(2)}
                </span>
                {(isYouDebtor || isYouCreditor) && (
                  <RecordPaymentDialog
                    members={group.members}
                    currentUserId={currentUserId}
                    defaultFromId={isYouDebtor ? currentUserId : debtorId}
                    defaultToId={isYouDebtor ? creditorId : currentUserId}
                    defaultAmount={amount as number}
                    onRecordPayment={onRecordPayment}
                    triggerVariant="icon"
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Calculate total bill
  const totalBill = group.expenses.reduce((sum, exp) => sum + exp.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-emerald-100 dark:hover:bg-emerald-900/30">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2>{group.name}</h2>
              {isCreator && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0">
                  <Crown className="h-3 w-3 mr-1" />
                  Leader
                </Badge>
              )}
            </div>
            {group.description && (
              <p className="text-muted-foreground text-sm">{group.description}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Created by {getMemberName(group.createdBy)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <RecordPaymentDialog
            members={group.members}
            currentUserId={currentUserId}
            onRecordPayment={onRecordPayment}
          />
          <SettleGroupBillDialog
            expenses={group.expenses}
            members={group.members}
            currentUserId={currentUserId}
            groupName={group.name}
            onSettle={onSettleAndSync}
          />
          {isCreator && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Group
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Delete Group?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the group "{group.name}" and all its expenses. 
                    This action cannot be undone. All members will lose access to this group.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteGroup}
                    disabled={deleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deleting ? 'Deleting...' : 'Delete Group'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
              You owe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-semibold ${youOwe > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
              ৳{youOwe.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Amount you need to settle across the group.</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
              You are owed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-semibold ${youAreOwed > 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
              ৳{youAreOwed.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total others should pay you back.</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
              Net balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-semibold ${netBalanceColor}`}>
              ৳{yourNetBalance.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{netBalanceDescription}</p>
          </CardContent>
        </Card>
      </section>

      {/* Total Bill Display */}
      {totalBill > 0 && (
        <Card className="border-2 border-emerald-200 bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Group Bill</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  ৳{totalBill.toFixed(2)}
                </p>
              </div>
              <div className="p-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
                <Receipt className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Members</CardTitle>
            <div className="flex items-center gap-2">
              <AddFriendToGroupDialog
                friends={friends}
                existingMemberIds={group.members.map(m => m.id)}
                onAddMember={onAddMember}
              />
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {group.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold">
                      {getMemberInitial(member)}
                    </div>
                    <div>
                      <p className="font-medium">{getMemberLabel(member)}</p>
                      <p className="text-sm text-muted-foreground">@{member.username}</p>
                      {(() => {
                        const summary = memberSummaries.find(entry => entry.memberId === member.id)
                        if (!summary) {
                          return null
                        }
                        const net = summary.netBalance
                        const netText = net > 0
                          ? `Owed ৳${net.toFixed(2)}`
                          : net < 0
                            ? `Owes ৳${Math.abs(net).toFixed(2)}`
                            : 'Settled up'
                        const netClass = net > 0
                          ? 'text-emerald-600'
                          : net < 0
                            ? 'text-red-600'
                            : 'text-muted-foreground'
                        return (
                          <p className={`text-xs font-medium ${netClass}`}>
                            {netText}
                          </p>
                        )
                      })()}
                    </div>
                  </div>
                  {member.id === group.createdBy && (
                    <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400">
                      <Crown className="h-3 w-3 mr-1" />
                      Leader
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Balances</CardTitle>
            <Calculator className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {getBalanceDisplay()}
            {Object.keys(group.balances || {}).length > 0 && (
              <Button 
                className="w-full mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700" 
                variant="outline"
                onClick={handleSimplify}
                disabled={simplifying}
              >
                <Calculator className="h-4 w-4 mr-2" />
                {simplifying ? 'Simplifying...' : 'Simplify Debts'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Expenses</CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                const csv = generateExpenseCSV(group.expenses)
                downloadCSV(csv, `${group.name}-expenses.csv`)
              }}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <EnhancedAddExpenseDialog 
              members={group.members} 
              currentUserId={currentUserId}
              onAddExpense={onAddExpense} 
            />
            <Receipt className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {group.expenses.length > 0 && (
            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="food">Food & Dining</SelectItem>
                  <SelectItem value="groceries">Groceries</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="housing">Housing</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="gifts">Gifts</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {group.expenses.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No expenses yet</p>
          ) : (
            <div className="space-y-3">
              {filterExpenses(group.expenses, searchQuery, categoryFilter).map((expense) => {
                const categoryInfo = getCategoryInfo(expense.category || 'other')
                const CategoryIcon = categoryInfo.icon
                const isPaidByMe = expense.paidBy === currentUserId
                const splitParticipants = resolveSplitParticipants(expense)
                
                return (
                  <div key={expense.id} className={`p-4 border rounded-lg hover:shadow-sm transition-shadow ${isPaidByMe ? 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-800' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`p-1 rounded ${categoryInfo.bgColor}`}>
                            <CategoryIcon className={`h-4 w-4 ${categoryInfo.color}`} />
                          </div>
                          <p className="font-medium">{expense.description}</p>
                          {isPaidByMe && (
                            <Badge className="bg-emerald-500 text-white text-xs">
                              You paid
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Paid by {getMemberName(expense.paidBy)}
                        </p>
                        {expense.notes && (
                          <p className="text-sm text-muted-foreground mt-1 italic">{expense.notes}</p>
                        )}
                        {renderSplitDetails(expense)}
                      </div>
                      <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-lg">৳{expense.amount.toFixed(2)}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className={`px-2 py-0.5 rounded text-xs ${categoryInfo.bgColor} ${categoryInfo.color}`}>
                        {categoryInfo.label}
                      </span>
                      <span className="mx-2">•</span>
                      {getSplitTypeLabel(expense.splitType)}
                      <span className="mx-2">•</span>
                      {splitParticipants.length || expense.splitWith.length} people
                      <span className="mx-2">•</span>
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Feed */}
      {group.activity && group.activity.length > 0 && (
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {group.activity.slice(0, 10).map((entry) => {
                const isExpense = entry.type === 'expense'
                const isPayment = entry.type === 'payment'

                return (
                  <div 
                    key={entry.id} 
                    className={`p-3 rounded-lg border ${
                      isExpense 
                        ? 'bg-blue-50 border-blue-100' 
                        : 'bg-emerald-50 border-emerald-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          isExpense ? 'bg-blue-100' : 'bg-emerald-100'
                        }`}>
                          {isExpense ? (
                            <Receipt className={`h-4 w-4 ${isExpense ? 'text-blue-600' : 'text-emerald-600'}`} />
                          ) : (
                            <Banknote className="h-4 w-4 text-emerald-600" />
                          )}
                        </div>
                        <div>
                          {isExpense && (
                            <>
                              <p className="font-medium text-sm">{entry.description || 'Expense'}</p>
                              <p className="text-xs text-muted-foreground">
                                Paid by {getMemberName(entry.paidBy || '')}
                              </p>
                            </>
                          )}
                          {isPayment && (
                            <>
                              <p className="font-medium text-sm">Payment recorded</p>
                              <p className="text-xs text-muted-foreground">
                                {getMemberName(entry.fromMemberId || '')} paid {getMemberName(entry.toMemberId || '')}
                              </p>
                              {entry.note && (
                                <p className="text-xs text-muted-foreground italic mt-1">{entry.note}</p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${isExpense ? 'text-blue-600' : 'text-emerald-600'}`}>
                          ৳{entry.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}