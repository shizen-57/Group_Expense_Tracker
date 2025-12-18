import { useMemo, useState } from 'react'
import { Button } from '../ui/button'
import { Plus, Download, Upload } from 'lucide-react'
import { MonthlySpendingSummary } from './MonthlySpendingSummary'
import { BudgetManager } from './BudgetManager'
import { ExpenseList } from './ExpenseList'
import { AddExpenseDialog } from './AddExpenseDialog'
import { ReceiptScannerDialog } from './ReceiptScannerDialog'
import { NaturalLanguageSearch } from './NaturalLanguageSearch'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion'

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
  type LedgerFilter = 'all' | 'month' | 'large' | 'receipt'

  const [addExpenseOpen, setAddExpenseOpen] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState<LedgerFilter>('all')

  const expensesArray = Array.isArray(expenses) ? expenses : []
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const currentMonthExpenses = useMemo(
    () =>
      expensesArray.filter((exp) => {
        const date = new Date(exp.createdAt)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      }),
    [expensesArray, currentMonth, currentYear]
  )

  const monthlyTotal = useMemo(
    () => currentMonthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0),
    [currentMonthExpenses]
  )

  const lifetimeTotal = useMemo(
    () => expensesArray.reduce((sum, exp) => sum + (exp.amount || 0), 0),
    [expensesArray]
  )

  const largestExpense = useMemo(
    () => expensesArray.reduce((max, exp) => Math.max(max, exp.amount || 0), 0),
    [expensesArray]
  )

  const averageTicket = currentMonthExpenses.length > 0 ? monthlyTotal / currentMonthExpenses.length : 0

  const filteredExpenses = useMemo(() => {
    if (activeFilter === 'month') {
      return currentMonthExpenses
    }

    if (activeFilter === 'large') {
      return expensesArray.filter((exp) => (exp.amount || 0) >= 5000)
    }

    if (activeFilter === 'receipt') {
      return expensesArray.filter((exp) => Boolean(exp.receiptUrl || exp.attachmentUrl || exp.receiptId))
    }

    return expensesArray
  }, [activeFilter, currentMonthExpenses, expensesArray])

  const filterPills: { id: LedgerFilter; label: string }[] = [
    { id: 'all', label: 'All spend' },
    { id: 'month', label: 'This month' },
    { id: 'large', label: '> ৳5K' },
    { id: 'receipt', label: 'With receipt' }
  ]

  const formatAmount = (value?: number) => `৳${Math.abs(value ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`

  const handleRunAIInsights = async () => {
    if (!onGetAIInsights) return
    try {
      setAiLoading(true)
      await onGetAIInsights()
    } finally {
      setAiLoading(false)
    }
  }

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
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <section className="grid gap-8 lg:grid-cols-2 xl:grid-cols-[1.5fr_0.9fr] items-stretch">
        <div className="rounded-[32px] border border-gray-200 bg-white p-8 xl:p-10 shadow-sm flex flex-col justify-between">
          <p className="text-xs uppercase tracking-[0.5em] text-gray-500">Expenses</p>
          <h1 className="mt-4 text-4xl font-semibold text-gray-900">Personal workspace</h1>
          <p className="mt-3 text-gray-600 max-w-2xl">
            Capture every slip, normalize FX, and keep budgets honest without losing the human context.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">This month</p>
              <p className="mt-3 text-2xl font-semibold text-gray-900">{formatAmount(monthlyTotal)}</p>
              <p className="text-sm text-gray-500">{currentMonthExpenses.length} entries</p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Lifetime personal</p>
              <p className="mt-3 text-2xl font-semibold text-gray-900">{formatAmount(lifetimeTotal)}</p>
              <p className="text-sm text-gray-500">Total captured spend</p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Avg. ticket</p>
              <p className="mt-3 text-2xl font-semibold text-gray-900">{formatAmount(averageTicket)}</p>
              <p className="text-sm text-gray-500">Largest {formatAmount(largestExpense)}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6" onClick={() => setAddExpenseOpen(true)}>
              <Plus className="h-4 w-4" />
              Log expense
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-4"
              onClick={() => setScannerOpen(true)}
            >
              <Upload className="h-4 w-4" />
              Scan receipt
            </Button>
            <Button
              variant="ghost"
              className="rounded-full px-4 text-gray-600 hover:text-gray-900"
              onClick={handleExportCSV}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="rounded-[32px] border border-gray-200 bg-white p-8 xl:p-10 shadow-sm">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.5em] text-gray-500">Budget guardrails</p>
            <h2 className="text-3xl font-semibold text-gray-900">Keep envelopes honest</h2>
            <p className="text-gray-600">
              Set envelopes, watch utilization, and adjust spend categories without leaving your personal view.
            </p>
          </div>

          <div className="mt-6 rounded-3xl border border-gray-200 bg-gray-50 p-4 xl:p-6 shadow-inner">
            <Accordion type="multiple" defaultValue={['budgets']}>
              <AccordionItem value="budgets">
                <AccordionTrigger className="text-base font-medium text-gray-900">
                  Budget guardrails
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <BudgetManager
                    budgets={budgets}
                    expenses={expenses}
                    onCreateBudget={onCreateBudget}
                    onDeleteBudget={onDeleteBudget}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 xl:p-8 shadow-sm space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Expense ledger</p>
                <h2 className="text-2xl font-semibold text-gray-900">Detailed timeline</h2>
                <p className="text-sm text-gray-500">Showing {filteredExpenses.length} of {expensesArray.length} entries</p>
              </div>
              <Button variant="outline" className="rounded-full" onClick={handleExportCSV}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>

            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4">
              <NaturalLanguageSearch onSearch={onSearch} />
            </div>

            <div className="flex flex-wrap gap-2">
              {filterPills.map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setActiveFilter(pill.id)}
                  className={`rounded-full border px-4 py-1 text-sm transition ${
                    activeFilter === pill.id
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <ExpenseList expenses={filteredExpenses} onDelete={onDeleteExpense} />
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 xl:p-8 shadow-sm">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Monthly pulse</p>
              <h3 className="text-xl font-semibold text-gray-900">Budgets vs actual</h3>
            </div>
            <MonthlySpendingSummary expenses={expenses} budgets={budgets} stats={stats} />
          </div>

          
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