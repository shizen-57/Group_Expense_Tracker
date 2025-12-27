/**
 * Smart Expense Dialog Demo & Testing Page
 * 
 * This is a standalone demo page to test all 5 split types
 * You can use this to verify the component works before integration
 */

import { useState } from 'react'
import { AddSmartExpenseDialog } from '../components/groups/AddSmartExpenseDialog'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { 
  Sparkles, 
  Users, 
  DollarSign, 
  Calendar,
  Receipt,
  Scale,
  Percent
} from 'lucide-react'

// Demo data
const DEMO_MEMBERS = [
  { id: '1', name: 'Yuki Bhuiyan', username: 'yuki', email: 'yuki@example.com' },
  { id: '2', name: 'Sifat Rahman', username: 'sifat', email: 'sifat@example.com' },
  { id: '3', name: 'Alice Chen', username: 'alice', email: 'alice@example.com' },
  { id: '4', name: 'Bob Wilson', username: 'bob', email: 'bob@example.com' },
]

const CURRENT_USER_ID = '1' // Yuki Bhuiyan

const SPLIT_TYPE_INFO = [
  {
    type: 'equal',
    icon: Scale,
    name: 'Equal Split',
    description: 'Everyone pays the same amount',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    example: 'Team lunch, shared utilities'
  },
  {
    type: 'who-joined',
    icon: Users,
    name: 'Who Joined',
    description: 'Only participants split the bill',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    example: 'Optional movie night'
  },
  {
    type: 'itemized',
    icon: Receipt,
    name: 'Itemized',
    description: 'Split by individual items',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    example: 'Restaurant with different orders'
  },
  {
    type: 'custom-percentage',
    icon: Percent,
    name: 'Custom %',
    description: 'Set custom percentages',
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    example: 'Rent based on room sizes'
  },
  {
    type: 'by-duration',
    icon: Calendar,
    name: 'By Duration',
    description: 'Based on time spent',
    color: 'bg-pink-100 text-pink-700 border-pink-300',
    example: 'Airbnb with different stay lengths'
  },
]

export default function SmartExpenseDemo() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [expenses, setExpenses] = useState<any[]>([])
  const [selectedExpense, setSelectedExpense] = useState<any>(null)

  const handleAddExpense = async (expenseData: any) => {
    console.log('📝 New expense added:', expenseData)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Add to list
    const newExpense = {
      ...expenseData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    
    setExpenses(prev => [newExpense, ...prev])
    setSelectedExpense(newExpense)
    
    // Show success message
    console.log('✅ Expense saved successfully!')
  }

  const getMemberName = (id: string) => {
    return DEMO_MEMBERS.find(m => m.id === id)?.name || 'Unknown'
  }

  const getSplitTypeInfo = (type: string) => {
    return SPLIT_TYPE_INFO.find(s => s.type === type) || SPLIT_TYPE_INFO[0]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Smart Expense Demo
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Test all 5 splitting methods: Equal, Who Joined, Itemized, Custom %, and By Duration
          </p>
        </div>

        {/* Demo Members */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              Demo Group Members
            </CardTitle>
            <CardDescription>
              These members will be used for testing the split dialog
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {DEMO_MEMBERS.map(member => (
                <div key={member.id} className="p-3 rounded-lg border bg-card hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-semibold">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground">@{member.username}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Split Types Guide */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Available Split Types
            </CardTitle>
            <CardDescription>
              Click "Try It" to test each splitting method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SPLIT_TYPE_INFO.map(split => {
                const Icon = split.icon
                return (
                  <div key={split.type} className={`p-4 rounded-xl border-2 ${split.color} space-y-3`}>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          <h3 className="font-semibold">{split.name}</h3>
                        </div>
                        <p className="text-sm opacity-90">{split.description}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-current/20">
                      <p className="text-xs opacity-75 mb-2">Example: {split.example}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button 
            onClick={() => setDialogOpen(true)}
            size="lg"
            className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-lg px-8 py-6"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Open Smart Expense Dialog
          </Button>
        </div>

        {/* Recent Expenses */}
        {expenses.length > 0 && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-emerald-600" />
                Test Results ({expenses.length} expense{expenses.length !== 1 ? 's' : ''})
              </CardTitle>
              <CardDescription>
                Expenses you've created during this demo session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenses.map(expense => {
                  const splitInfo = getSplitTypeInfo(expense.splitType)
                  const SplitIcon = splitInfo.icon
                  
                  return (
                    <div 
                      key={expense.id} 
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedExpense?.id === expense.id 
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedExpense(expense)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{expense.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            Paid by {getMemberName(expense.paidBy)} • {expense.category}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            ৳{expense.amount.toFixed(2)}
                          </p>
                          <Badge className={splitInfo.color}>
                            <SplitIcon className="h-3 w-3 mr-1" />
                            {splitInfo.name}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Split Details */}
                      <div className="pt-3 border-t space-y-2">
                        <p className="text-sm font-medium mb-2">Split Breakdown:</p>
                        {Object.entries(expense.splitAmounts).map(([memberId, amount]) => (
                          <div key={memberId} className="flex justify-between text-sm">
                            <span>{getMemberName(memberId)}</span>
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                              ৳{(amount as number).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Additional Info */}
                      {expense.splitType === 'itemized' && expense.itemSplits && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm font-medium mb-2">Items:</p>
                          {expense.itemSplits.map((item: any, idx: number) => (
                            <div key={idx} className="text-xs text-muted-foreground">
                              • {item.item} (৳{item.amount}) - {item.selectedBy.length} person(s)
                            </div>
                          ))}
                        </div>
                      )}

                      {expense.splitType === 'by-duration' && expense.duration && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm font-medium mb-2">Duration:</p>
                          {Object.entries(expense.duration).map(([memberId, days]) => (
                            <div key={memberId} className="text-xs text-muted-foreground">
                              • {getMemberName(memberId)}: {days} day(s)
                            </div>
                          ))}
                        </div>
                      )}

                      {expense.notes && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground italic">
                            Note: {expense.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <Sparkles className="h-5 w-5" />
              How to Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="flex items-start gap-2">
              <span className="font-semibold">1.</span>
              <span>Click "Open Smart Expense Dialog" to start</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-semibold">2.</span>
              <span>Fill in expense details (description, amount, category)</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-semibold">3.</span>
              <span>Select one of the 5 split types</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-semibold">4.</span>
              <span>Configure the split (select members, add items, set percentages, etc.)</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-semibold">5.</span>
              <span>Review the split preview showing calculated amounts</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-semibold">6.</span>
              <span>Click "Add Smart Expense" to save</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-semibold">7.</span>
              <span>See the result appear in the test results section below</span>
            </p>
          </CardContent>
        </Card>

        {/* JSON Output */}
        {selectedExpense && (
          <Card className="border-2 border-gray-300 bg-gray-50 dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="text-sm font-mono">Raw JSON Output</CardTitle>
              <CardDescription>
                This is what gets sent to your backend API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-900 dark:bg-black text-green-400 p-4 rounded-lg overflow-x-auto">
                {JSON.stringify(selectedExpense, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>

      {/* The Dialog */}
      <AddSmartExpenseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        members={DEMO_MEMBERS}
        currentUserId={CURRENT_USER_ID}
        onAddExpense={handleAddExpense}
      />
    </div>
  )
}
