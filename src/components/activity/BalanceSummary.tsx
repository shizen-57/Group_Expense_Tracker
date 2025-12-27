import { Card, CardContent } from '../ui/card'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

interface BalanceSummaryProps {
  totalBalance: number
  totalOwed: number
  totalReceiving: number
}

export function BalanceSummary({ totalBalance, totalOwed, totalReceiving }: BalanceSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Total Balance</div>
            <DollarSign className={`h-5 w-5 ${totalBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
          </div>
          <div className={`text-2xl mb-1 ${totalBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            ৳{Math.abs(totalBalance).toFixed(0)}
          </div>
          <div className="text-xs text-gray-500">
            {totalBalance >= 0 ? 'Net receiving' : 'Net owing'}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">You Owe</div>
            <TrendingDown className="h-5 w-5 text-red-500" />
          </div>
          <div className="text-2xl text-red-600 mb-1">৳{totalOwed.toFixed(0)}</div>
          <div className="text-xs text-gray-500">Total debts</div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Owe You</div>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="text-2xl text-emerald-600 mb-1">৳{totalReceiving.toFixed(0)}</div>
          <div className="text-xs text-gray-500">Total credits</div>
        </CardContent>
      </Card>
    </div>
  )
}
