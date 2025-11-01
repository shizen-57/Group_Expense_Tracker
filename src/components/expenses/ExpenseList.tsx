import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Trash2, Receipt, FileText } from 'lucide-react'
import { getCategoryInfo } from '../groups/ExpenseCategories'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog'

interface ExpenseListProps {
  expenses: any[]
  onDelete: (id: string) => void
}

export function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  // Ensure expenses is an array
  const expensesArray = Array.isArray(expenses) ? expenses : []
  
  const sortedExpenses = [...expensesArray].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  if (expensesArray.length === 0) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="py-12">
          <div className="text-center">
            <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 mb-4">
              <Receipt className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No expenses yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Add your first expense to get started</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {sortedExpenses.map((expense) => {
        const categoryInfo = getCategoryInfo(expense.category || 'other')
        const CategoryIcon = categoryInfo.icon

        return (
          <Card 
            key={expense.id}
            className="border-0 shadow-lg hover:shadow-xl transition-all card-hover bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${categoryInfo.bgColor} shadow-md`}>
                    <CategoryIcon className={`h-6 w-6 ${categoryInfo.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-lg">{expense.description}</p>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${categoryInfo.bgColor} ${categoryInfo.color}`}>
                        {categoryInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(expense.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                    {expense.notes && (
                      <div className="flex items-start gap-2 mt-2">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <p className="text-sm text-muted-foreground">{expense.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      ${expense.amount.toFixed(2)}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this expense? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(expense.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
