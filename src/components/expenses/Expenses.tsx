import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Plus, Search, TrendingUp, AlertTriangle, Receipt, Download, Upload } from 'lucide-react'
import { MonthlySpendingSummary } from './MonthlySpendingSummary'
import { BudgetManager } from './BudgetManager'
import { ExpenseList } from './ExpenseList'
import { AddExpenseDialog } from './AddExpenseDialog'
import { ReceiptScannerDialog } from './ReceiptScannerDialog'
import { NaturalLanguageSearch } from './NaturalLanguageSearch'
import { TrendAnalytics } from './TrendAnalytics'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

interface ExpensesProps {
  expenses: any[]
  budgets: any[]
  trends: any
  stats: any
  loading: boolean
  onCreateExpense: (data: any) => Promise<any>
  onDeleteExpense: (id: string) => void
  onCreateBudget: (data: any) => Promise<any>
  onDeleteBudget: (id: string) => void
  onSearch: (query: string) => Promise<any>
  onScanReceipt: (file: File) => Promise<any>
  onGetAIInsights?: () => Promise<any>
}

export function Expenses({
  expenses,
  budgets,
  trends,
  stats,
  onCreateExpense,
  onDeleteExpense,
  onCreateBudget,
  onDeleteBudget,
  onSearch,
  onScanReceipt,
  onGetAIInsights
}: ExpensesProps) {
  const [addExpenseOpen, setAddExpenseOpen] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)

  const handleExportCSV = () => {
    // Ensure expenses is an array
    const expensesArray = Array.isArray(expenses) ? expenses : []
    
    const headers = ['Date', 'Description', 'Amount', 'Category', 'Notes']
    const rows = expensesArray.map(exp => [
      new Date(exp.createdAt).toLocaleDateString(),
      exp.description,
      `৳${exp.amount.toFixed(2)}`,
      exp.category,
      exp.notes || ''
    ])
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `personal-expenses-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">My Expenses</h1>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleExportCSV}
            className="rounded-full"
          >
            <Download className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline"
            onClick={() => setScannerOpen(true)}
            className="rounded-full px-4"
          >
            <Upload className="h-4 w-4 mr-2" />
            Scan Receipt
          </Button>
          <Button 
            onClick={() => setAddExpenseOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Natural Language Search */}
      <NaturalLanguageSearch onSearch={onSearch} />

      {/* Monthly Summary */}
      <MonthlySpendingSummary expenses={expenses} budgets={budgets} stats={stats} />

      {/* Tabs for different views */}
      <Tabs defaultValue="expenses" className="space-y-6">
        <TabsList className="bg-white rounded-full p-1 shadow-sm border border-gray-200">
          <TabsTrigger value="expenses" className="rounded-full data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            Expenses
          </TabsTrigger>
          <TabsTrigger value="budgets" className="rounded-full data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            Budgets
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-full data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          <ExpenseList 
            expenses={expenses} 
            onDelete={onDeleteExpense}
          />
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4">
          <BudgetManager 
            budgets={budgets}
            expenses={expenses}
            onCreateBudget={onCreateBudget}
            onDeleteBudget={onDeleteBudget}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <TrendAnalytics trends={trends} expenses={expenses} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddExpenseDialog 
        open={addExpenseOpen}
        onOpenChange={setAddExpenseOpen}
        onCreate={onCreateExpense}
      />

      <ReceiptScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={onScanReceipt}
        onCreate={onCreateExpense}
      />
    </div>
  )
}