import { Expenses } from '../expenses/Expenses'

interface ExpensesPageProps {
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

export function ExpensesPage(props: ExpensesPageProps) {
  if (props.loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>
  }

  return <Expenses {...props} />
}
