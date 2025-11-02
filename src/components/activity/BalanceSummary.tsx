import { Card, CardContent } from '../ui/card'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

interface BalanceSummaryProps {
  totalBalance: number
  totalOwed: number
  totalReceiving: number
}

export function BalanceSummary({ totalBalance, totalOwed, totalReceiving }: BalanceSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Balance</p>
              <p className={`text-2xl ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ৳{Math.abs(totalBalance).toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {totalBalance >= 0 ? 'Net receiving' : 'Net owing'}
              </p>
            </div>
            <DollarSign className={`h-8 w-8 opacity-50 ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">You Owe</p>
              <p className="text-red-600 text-2xl">৳{totalOwed.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1">
                Total debts
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Owe You</p>
              <p className="text-green-600 text-2xl">৳{totalReceiving.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1">
                Total credits
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600 opacity-50" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
