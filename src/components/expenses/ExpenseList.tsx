import { memo, useMemo, useState } from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Trash2, Receipt, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
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

const ITEMS_PER_PAGE = 20

export const ExpenseList = memo(function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  
  // Ensure expenses is an array
  const expensesArray = Array.isArray(expenses) ? expenses : []
  
  // Memoize sorted expenses to prevent re-sorting on every render
  const sortedExpenses = useMemo(() => {
    return [...expensesArray].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [expensesArray])

  // Pagination
  const totalPages = Math.ceil(sortedExpenses.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedExpenses = sortedExpenses.slice(startIndex, endIndex)

  if (expensesArray.length === 0) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="py-12">
          <div className="text-center">
            <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">No expenses yet</p>
            <p className="text-sm text-gray-500 mt-1">Add your first expense to get started</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {paginatedExpenses.map((expense) => {
          const categoryInfo = getCategoryInfo(expense.category || 'other')
          const CategoryIcon = categoryInfo.icon

          return (
            <Card 
              key={expense.id}
              className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-white border border-gray-200">
                      <CategoryIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900 truncate">{expense.description}</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-700 whitespace-nowrap">
                          {categoryInfo.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(expense.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                      {expense.notes && (
                        <div className="flex items-start gap-2 mt-2">
                          <FileText className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-600">{expense.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-right">
                      <p className="text-lg font-medium text-gray-900">
                        ৳{expense.amount.toFixed(2)}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="rounded-full hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
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
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <p className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} • {sortedExpenses.length} total expenses
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
})