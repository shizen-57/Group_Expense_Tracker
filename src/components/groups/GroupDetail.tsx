import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { ArrowLeft, Users, Receipt, Calculator, Search, Filter, Download, Crown, Trash2, AlertTriangle } from 'lucide-react'
import { AddFriendToGroupDialog } from './AddFriendToGroupDialog'
import { EnhancedAddExpenseDialog } from './EnhancedAddExpenseDialog'
import { SettleGroupBillDialog } from './SettleGroupBillDialog'
import { getCategoryInfo } from './ExpenseCategories'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog'
import { Badge } from '../ui/badge'

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
  splitType?: 'equal' | 'unequal' | 'percentage'
  splitAmounts?: Record<string, number>
  createdBy: string
  createdAt: string
  category?: string
  notes?: string
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
  }
  currentUserId: string
  friends: Friend[]
  onBack: () => void
  onAddMember: (friendId: string) => Promise<void>
  onAddExpense: (data: { 
    description: string
    amount: number
    paidBy: string
    splitWith: string[]
    splitType?: 'equal' | 'unequal' | 'percentage'
    splitAmounts?: Record<string, number>
    category?: string
    notes?: string
  }) => Promise<void>
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
  onSimplify,
  onSettleAndSync,
  onDeleteGroup
}: GroupDetailProps) {
  const [simplifying, setSimplifying] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [deleting, setDeleting] = useState(false)

  const isCreator = group.createdBy === currentUserId

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
    const member = group.members.find(m => m.id === userId)
    return member?.name || 'Unknown'
  }

  const filterExpenses = (expenses: Expense[], search: string, category: string) => {
    return expenses.filter(expense => {
      const matchesSearch = search === '' || 
        expense.description.toLowerCase().includes(search.toLowerCase()) ||
        getMemberName(expense.paidBy).toLowerCase().includes(search.toLowerCase())
      
      const matchesCategory = category === 'all' || expense.category === category
      
      return matchesSearch && matchesCategory
    })
  }

  const generateExpenseCSV = (expenses: Expense[], members: Member[]) => {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Paid By', 'Split With', 'Notes']
    const rows = expenses.map(expense => [
      new Date(expense.createdAt).toLocaleDateString(),
      expense.description,
      getCategoryInfo(expense.category || 'other').label,
      expense.amount.toFixed(2),
      getMemberName(expense.paidBy),
      expense.splitWith.map(id => getMemberName(id)).join('; '),
      expense.notes || ''
    ])
    
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

  const getBalanceDisplay = () => {
    const balances = group.balances || {}
    const entries = Object.entries(balances).filter(([_, amount]) => Math.abs(amount as number) > 0.01)
    
    if (entries.length === 0) {
      return <p className="text-muted-foreground">All settled up! 🎉</p>
    }

    return (
      <div className="space-y-2">
        {entries.map(([key, amount]) => {
          const [creditorId, debtorId] = key.split('-')
          const creditor = getMemberName(creditorId)
          const debtor = getMemberName(debtorId)
          
          return (
            <div key={key} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-sm">
                {debtor} owes {creditor}
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">${(amount as number).toFixed(2)}</span>
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

      {/* Total Bill Display */}
      {totalBill > 0 && (
        <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Group Bill</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  ${totalBill.toFixed(2)}
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
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
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
                <div key={member.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">@{member.username}</p>
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

        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
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

      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Expenses</CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                const csv = generateExpenseCSV(group.expenses, group.members)
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
                        {expense.splitType && expense.splitType !== 'equal' && expense.splitAmounts && (
                          <div className="mt-2 text-xs text-muted-foreground bg-gray-50 dark:bg-gray-900 p-2 rounded">
                            <p className="font-medium mb-1">
                              {expense.splitType === 'unequal' ? 'Custom Split:' : 'Percentage Split:'}
                            </p>
                            <div className="space-y-0.5">
                              {expense.splitWith.map(memberId => (
                                <div key={memberId} className="flex justify-between">
                                  <span>{getMemberName(memberId)}</span>
                                  <span>${(expense.splitAmounts![memberId] || 0).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-lg">${expense.amount.toFixed(2)}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className={`px-2 py-0.5 rounded text-xs ${categoryInfo.bgColor} ${categoryInfo.color}`}>
                        {categoryInfo.label}
                      </span>
                      <span className="mx-2">•</span>
                      {expense.splitType === 'equal' ? 'Equal split' : expense.splitType === 'unequal' ? 'Custom split' : 'Percentage split'}
                      <span className="mx-2">•</span>
                      {expense.splitWith.length} people
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
    </div>
  )
}
