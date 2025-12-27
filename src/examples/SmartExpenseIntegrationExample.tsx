/**
 * Example: How to integrate AddSmartExpenseDialog
 * 
 * This shows the complete integration pattern for the new Smart Expense Dialog
 * with all 5 split types (Equal, Who Joined, Itemized, Custom %, By Duration)
 */

import { useState } from 'react'
import { Button } from '../components/ui/button'
import { AddSmartExpenseDialog } from '../components/groups/AddSmartExpenseDialog'
import { Plus, Sparkles } from 'lucide-react'

// Example component showing integration
export function GroupExpenseManager() {
  const [dialogOpen, setDialogOpen] = useState(false)
  
  // Example group data
  const groupMembers = [
    { id: '1', name: 'Yuki Bhuiyan', username: 'yuki', email: 'yuki@example.com' },
    { id: '2', name: 'Sifat Rahman', username: 'sifat', email: 'sifat@example.com' },
    { id: '3', name: 'Alice Chen', username: 'alice', email: 'alice@example.com' },
  ]
  
  const currentUserId = '1' // Yuki Bhuiyan
  
  // Handler for adding expense
  const handleAddExpense = async (expenseData: any) => {
    console.log('📝 New Smart Expense:', expenseData)
    
    // Example of what data you'll receive based on split type:
    
    if (expenseData.splitType === 'equal') {
      console.log('🔵 Equal Split:', {
        description: expenseData.description,
        amount: expenseData.amount,
        splitAmounts: expenseData.splitAmounts
        // Example: { '1': 166.67, '2': 166.67, '3': 166.67 }
      })
    }
    
    if (expenseData.splitType === 'who-joined') {
      console.log('🟣 Who Joined:', {
        participants: expenseData.splitWith,
        splitAmounts: expenseData.splitAmounts
        // Example: splitWith: ['1', '3'], amounts: { '1': 250, '3': 250 }
      })
    }
    
    if (expenseData.splitType === 'itemized') {
      console.log('🟢 Itemized Split:', {
        items: expenseData.itemSplits,
        splitAmounts: expenseData.splitAmounts
        // Example: itemSplits: [
        //   { item: 'Pizza', amount: 300, selectedBy: ['1', '2'] }
        // ]
      })
    }
    
    if (expenseData.splitType === 'custom-percentage') {
      console.log('🟠 Custom Percentage:', {
        splitAmounts: expenseData.splitAmounts
        // Example: { '1': 200, '2': 150, '3': 150 } (40%, 30%, 30%)
      })
    }
    
    if (expenseData.splitType === 'by-duration') {
      console.log('🩷 By Duration:', {
        duration: expenseData.duration,
        splitAmounts: expenseData.splitAmounts
        // Example: duration: { '1': 1, '2': 1.5, '3': 2 }
      })
    }
    
    // Your API call here
    try {
      const response = await fetch('/api/groups/123/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to add expense')
      }
      
      const result = await response.json()
      console.log('✅ Expense added successfully:', result)
      
      // Close dialog on success
      setDialogOpen(false)
      
    } catch (error) {
      console.error('❌ Failed to add expense:', error)
      throw error // Dialog will show error
    }
  }
  
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Group Expenses</h2>
        
        {/* Trigger Button - Style 1: Simple */}
        <Button 
          onClick={() => setDialogOpen(true)}
          className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Smart Expense
        </Button>
      </div>
      
      {/* Alternative Trigger Button - Style 2: With Icon */}
      <Button 
        onClick={() => setDialogOpen(true)}
        variant="outline"
        className="w-full border-2 border-dashed border-teal-300 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950/20"
      >
        <Sparkles className="h-4 w-4 mr-2 text-teal-600" />
        <span className="text-teal-700 dark:text-teal-300">
          Add Expense with Smart Split
        </span>
      </Button>
      
      {/* The Dialog Component */}
      <AddSmartExpenseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        members={groupMembers}
        currentUserId={currentUserId}
        onAddExpense={handleAddExpense}
      />
      
      {/* Expense List would go here */}
      <div className="space-y-2">
        {/* Your existing expense cards */}
      </div>
    </div>
  )
}

// ===================================================
// Example: Integration in existing GroupDetail.tsx
// ===================================================

/*
Step 1: Import the component
import { AddSmartExpenseDialog } from './AddSmartExpenseDialog'

Step 2: Add state for dialog
const [smartDialogOpen, setSmartDialogOpen] = useState(false)

Step 3: Find where EnhancedAddExpenseDialog is used (around line 350)
Replace this:

  <EnhancedAddExpenseDialog 
    members={group.members} 
    currentUserId={currentUserId}
    onAddExpense={onAddExpense} 
  />

With this:

  <Button 
    onClick={() => setSmartDialogOpen(true)}
    className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700"
    size="sm"
  >
    <Plus className="h-4 w-4 mr-2" />
    Add Expense
  </Button>

Step 4: Add the dialog component anywhere in your JSX:

  <AddSmartExpenseDialog
    open={smartDialogOpen}
    onOpenChange={setSmartDialogOpen}
    members={group.members}
    currentUserId={currentUserId}
    onAddExpense={onAddExpense}
  />

Step 5: Update your onAddExpense handler to handle new split types
*/

// ===================================================
// Example: Backend API Handler
// ===================================================

export async function handleGroupExpenseAPI(request: any) {
  const {
    description,
    amount,
    paidBy,
    splitWith,
    splitType,
    splitAmounts,
    itemSplits,
    duration,
    category,
    notes
  } = request.body
  
  // Validate split type
  const validSplitTypes = [
    'equal',
    'who-joined',
    'itemized',
    'custom-percentage',
    'by-duration'
  ]
  
  if (!validSplitTypes.includes(splitType)) {
    return { error: 'Invalid split type', status: 400 }
  }
  
  // Create expense record
  const expense = {
    id: generateId(),
    description,
    amount,
    paidBy,
    splitWith,
    splitType,
    splitAmounts: JSON.stringify(splitAmounts),
    category,
    notes,
    createdAt: new Date().toISOString(),
    
    // Store metadata based on split type
    ...(splitType === 'itemized' && { itemSplits: JSON.stringify(itemSplits) }),
    ...(splitType === 'by-duration' && { duration: JSON.stringify(duration) })
  }
  
  // Save to database
  // await db.expenses.create(expense)
  
  // Update group balances
  // await updateGroupBalances(groupId, splitAmounts, paidBy)
  
  return { success: true, expense }
}

// ===================================================
// Example: Testing Different Split Types
// ===================================================

export function testAllSplitTypes() {
  const testCases = {
    // Test 1: Equal Split
    equalSplit: {
      description: 'Team Lunch',
      amount: 900,
      paidBy: '1',
      splitWith: ['1', '2', '3'],
      splitType: 'equal',
      category: 'food',
      // Expected splitAmounts: { '1': 300, '2': 300, '3': 300 }
    },
    
    // Test 2: Who Joined (Participation)
    whoJoined: {
      description: 'Movie Night',
      amount: 600,
      paidBy: '1',
      splitWith: ['1', '2'], // Charlie didn't join
      splitType: 'who-joined',
      category: 'entertainment',
      // Expected splitAmounts: { '1': 300, '2': 300, '3': 0 }
    },
    
    // Test 3: Itemized
    itemized: {
      description: 'Restaurant Dinner',
      amount: 1000,
      paidBy: '1',
      splitWith: ['1', '2', '3'],
      splitType: 'itemized',
      itemSplits: [
        { item: 'Pizza', amount: 500, selectedBy: ['1', '2'] },
        { item: 'Pasta', amount: 300, selectedBy: ['3'] },
        { item: 'Dessert', amount: 200, selectedBy: ['1', '2', '3'] }
      ],
      category: 'food',
      // Expected splitAmounts: { '1': 316.67, '2': 316.67, '3': 366.67 }
    },
    
    // Test 4: Custom Percentage
    customPercentage: {
      description: 'Shared Rent',
      amount: 30000,
      paidBy: '1',
      splitWith: ['1', '2', '3'],
      splitType: 'custom-percentage',
      category: 'housing',
      // Expected splitAmounts: { '1': 12000, '2': 9000, '3': 9000 }
      // Percentages: 40%, 30%, 30%
    },
    
    // Test 5: By Duration
    byDuration: {
      description: 'Airbnb Weekend',
      amount: 9000,
      paidBy: '1',
      splitWith: ['1', '2', '3'],
      splitType: 'by-duration',
      duration: {
        '1': 2,    // 2 days
        '2': 1.5,  // 1.5 days
        '3': 1     // 1 day
      },
      category: 'accommodation',
      // Expected splitAmounts: { '1': 4000, '2': 3000, '3': 2000 }
    }
  }
  
  return testCases
}

// ===================================================
// Example: Complete Feature Integration Checklist
// ===================================================

/*
✅ Integration Checklist:

Frontend:
[ ] Import AddSmartExpenseDialog component
[ ] Add state for dialog open/close
[ ] Replace old expense dialog with new one
[ ] Update trigger button
[ ] Test all 5 split types in UI
[ ] Verify animations work
[ ] Check dark mode display
[ ] Test mobile responsiveness

Backend:
[ ] Update expense schema to support new split types
[ ] Add splitType field (string)
[ ] Add splitAmounts field (JSON)
[ ] Add optional itemSplits field (JSON)
[ ] Add optional duration field (JSON)
[ ] Update balance calculation logic
[ ] Add validation for each split type
[ ] Test API with all split type payloads

Database:
[ ] Add migration for new fields
[ ] Update expense table schema
[ ] Add indexes if needed
[ ] Backup existing data
[ ] Test data integrity

Testing:
[ ] Unit tests for split calculations
[ ] Integration tests for API
[ ] E2E tests for UI flows
[ ] Test validation rules
[ ] Test error handling
[ ] Test with real user data

Documentation:
[ ] Update API documentation
[ ] Add user guide for split types
[ ] Update developer docs
[ ] Create migration guide
[ ] Document data structures
*/

export default GroupExpenseManager
