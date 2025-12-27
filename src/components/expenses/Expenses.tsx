import { useState } from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Plus, TrendingUp, Receipt, Download, Upload, Sparkles, Target, Layers, Search, Calendar } from 'lucide-react'
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

  const safeStats = {
    monthlyTotal: stats?.monthlyTotal ?? stats?.totalSpent ?? 0,
    rollingAverage: stats?.rollingAverage ?? stats?.average ?? 0,
    topCategory: stats?.topCategory ?? 'General',
    topCategoryAmount: stats?.topCategoryAmount ?? stats?.largestExpense ?? 0,
    receiptsProcessed: stats?.receiptsProcessed ?? 0,
    activeBudgets: stats?.activeBudgets ?? budgets?.length ?? 0,
    ...stats
  }

  const formatAmount = (value?: number) => `৳${(value ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`

  const quickGlances = [
    {
      label: 'Spend this month',
      value: formatAmount(safeStats.monthlyTotal),
      helper: 'Personal ledger',
      icon: TrendingUp,
      accent: 'from-emerald-500/20 to-teal-500/20'
    },
    {
      label: 'Avg. ticket',
      value: formatAmount(safeStats.rollingAverage),
      helper: '30-day rolling',
      icon: Layers,
      accent: 'from-blue-500/20 to-indigo-500/20'
    },
    {
      label: `${safeStats.topCategory} focus`,
      value: formatAmount(safeStats.topCategoryAmount),
      helper: 'Top category',
      icon: Target,
      accent: 'from-orange-500/20 to-amber-500/20'
    },
    {
      label: 'Receipts parsed',
      value: safeStats.receiptsProcessed,
      helper: 'All time',
      icon: Receipt,
      accent: 'from-purple-500/20 to-pink-500/20'
    }
  ]

  const actionButtons = [
    {
      label: 'Add expense',
      icon: Plus,
      intent: 'primary' as const,
      onClick: () => setAddExpenseOpen(true)
    },
    {
      label: 'Scan receipt',
      icon: Upload,
      intent: 'ghost' as const,
      onClick: () => setScannerOpen(true)
    },
    {
      label: 'Export CSV',
      icon: Download,
      intent: 'ghost' as const,
      onClick: () => handleExportCSV()
    }
  ]

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
    <div className="max-w-7xl mx-auto space-y-10 pb-16">
      <section className="rounded-[36px] bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 p-10 text-white shadow-[0_40px_120px_-60px_rgba(16,185,129,0.8)]">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.4em] text-white/60">
              <Sparkles className="h-4 w-4" />
              Ledger Lab
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-semibold leading-tight">Personal expense studio</h1>
              <p className="mt-4 max-w-2xl text-white/70">
                Capture every slip, scan receipts, and jump between raw entries, budgets, and analytics without ever leaving this control room.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {actionButtons.map((action) => {
                const Icon = action.icon
                return (
                  <Button
                    key={action.label}
                    onClick={action.onClick}
                    variant={action.intent === 'primary' ? 'secondary' : 'outline'}
                    className={`rounded-full ${action.intent === 'primary' ? 'bg-white text-gray-900 hover:bg-white/90' : 'border-white/30 text-white hover:bg-white/10'}`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {action.label}
                  </Button>
                )
              })}
            </div>
          </div>
          <div className="grid w-full max-w-sm gap-4">
            {quickGlances.slice(0, 2).map((metric) => {
              const Icon = metric.icon
              return (
                <div key={metric.label} className={`rounded-3xl border border-white/15 bg-gradient-to-br ${metric.accent} p-6 backdrop-blur-xl`}>
                  <div className="flex items-center justify-between text-white/80">
                    <p className="text-xs uppercase tracking-[0.4em]">{metric.label}</p>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-3xl font-semibold text-white">{metric.value}</p>
                  <p className="text-xs text-white/70 mt-1">{metric.helper}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-3xl border border-gray-200 shadow-lg">
          <CardContent className="p-0">
            <MonthlySpendingSummary expenses={expenses} budgets={budgets} stats={stats} />
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card className="rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <Search className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Search Expenses</h3>
                  <p className="text-xs text-gray-500">Find by keyword, category, or date</p>
                </div>
              </div>
              <NaturalLanguageSearch onSearch={onSearch} />
            </CardContent>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2">
            {quickGlances.slice(2).map((metric) => {
              const Icon = metric.icon
              return (
                <Card key={metric.label} className="rounded-3xl border border-gray-200 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between text-gray-500">
                      <p className="text-sm">{metric.label}</p>
                      <Icon className="h-5 w-5 text-gray-400" />
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-gray-900">{metric.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{metric.helper}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-gray-200 bg-white/70 p-6 shadow-xl backdrop-blur">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Workspace views</p>
            <h2 className="text-2xl font-semibold text-gray-900">Ledger, budgets, analytics</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            Auto-sync every morning at 9:00 AM
          </div>
        </div>
        <Tabs defaultValue="expenses" className="mt-6 space-y-6">
          <TabsList className="flex flex-wrap gap-2 rounded-full bg-gray-100/70 p-1">
            <TabsTrigger value="expenses" className="rounded-full px-5 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900">
              Ledger view
            </TabsTrigger>
            <TabsTrigger value="budgets" className="rounded-full px-5 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900">
              Budgets HQ
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-full px-5 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900">
              Trend lab
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="rounded-3xl border border-gray-100 bg-white p-4 shadow-inner">
            <ExpenseList expenses={expenses} onDelete={onDeleteExpense} />
          </TabsContent>

          <TabsContent value="budgets" className="rounded-3xl border border-gray-100 bg-white p-4 shadow-inner">
            <BudgetManager 
              budgets={budgets}
              expenses={expenses}
              onCreateBudget={onCreateBudget}
              onDeleteBudget={onDeleteBudget}
            />
          </TabsContent>

          <TabsContent value="analytics" className="rounded-3xl border border-gray-100 bg-white p-4 shadow-inner">
            <TrendAnalytics trends={trends} expenses={expenses} />
          </TabsContent>
        </Tabs>
      </section>

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