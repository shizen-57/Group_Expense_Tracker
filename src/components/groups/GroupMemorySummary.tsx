import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Separator } from '../ui/separator'
import { Avatar, AvatarFallback } from '../ui/avatar'
import {
  PartyPopper,
  TrendingUp,
  Award,
  DollarSign,
  Users,
  Calendar,
  MapPin,
  Download,
  Share2,
  CheckCircle2,
  Heart
} from 'lucide-react'

interface GroupMemorySummaryProps {
  group: {
    id: string
    name: string
    type: string
    description?: string
    location?: string
    startDate?: string
    endDate?: string
  }
  expenses: Array<{
    id: string
    description: string
    amount: number
    paidBy: string
    category: string
    createdAt: string
  }>
  members: Array<{
    id: string
    name: string
    username: string
  }>
  balances: Record<string, number>
  onClose: () => void
  onShare?: () => void
}

export function GroupMemorySummary({ 
  group, 
  expenses, 
  members, 
  balances,
  onClose,
  onShare 
}: GroupMemorySummaryProps) {
  // Calculate statistics
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const avgPerPerson = totalSpent / members.length
  
  // Member spending analysis
  const memberSpending = members.map(member => {
    const paid = expenses
      .filter(exp => exp.paidBy === member.id)
      .reduce((sum, exp) => sum + exp.amount, 0)
    
    const owed = Object.entries(balances)
      .filter(([key]) => key.startsWith(`${member.id}-`))
      .reduce((sum, [_, amount]) => sum + amount, 0)
    
    const owes = Object.entries(balances)
      .filter(([key]) => key.endsWith(`-${member.id}`))
      .reduce((sum, [_, amount]) => sum + amount, 0)
    
    const netBalance = owed - owes
    
    return {
      ...member,
      paid,
      consumed: paid - netBalance,
      fairness: paid > 0 ? Math.min(100, (Math.abs(netBalance) / paid) * 100) : 100
    }
  })

  // Sort by fairness
  const sortedByFairness = [...memberSpending].sort((a, b) => a.fairness - b.fairness)
  const mvp = sortedByFairness[0]

  // Category breakdown
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount
    return acc
  }, {} as Record<string, number>)

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Fairness score (how balanced the group spending is)
  const avgFairness = memberSpending.reduce((sum, m) => sum + (100 - m.fairness), 0) / members.length
  const groupFairnessScore = Math.round(avgFairness)

  const duration = group.startDate && group.endDate 
    ? Math.ceil((new Date(group.endDate).getTime() - new Date(group.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-8 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <PartyPopper className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-1">{group.name}</h2>
                <p className="text-emerald-100 flex items-center gap-2">
                  {group.type === 'trip' && '✈️ Trip'}
                  {group.type === 'event' && '🎉 Event'}
                  {group.type === 'home' && '🏠 Shared Home'}
                  {group.type === 'couple' && '❤️ Couple Budget'}
                  {group.type === 'project' && '💼 Project'}
                  {group.location && (
                    <>
                      <span>•</span>
                      <MapPin className="h-4 w-4" />
                      {group.location}
                    </>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-100 mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Total Spent</span>
              </div>
              <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-100 mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm">Per Person</span>
              </div>
              <p className="text-2xl font-bold">${avgPerPerson.toFixed(2)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-100 mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Expenses</span>
              </div>
              <p className="text-2xl font-bold">{expenses.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-100 mb-1">
                <Award className="h-4 w-4" />
                <span className="text-sm">Fairness</span>
              </div>
              <p className="text-2xl font-bold">{groupFairnessScore}%</p>
            </div>
          </div>

          {duration && (
            <div className="mt-4 flex items-center gap-2 text-emerald-100">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                {duration} {duration === 1 ? 'day' : 'days'} together
              </span>
            </div>
          )}
        </div>

        <div className="p-8 space-y-8">
          {/* MVP Member */}
          {mvp && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 p-6"
            >
              <div className="absolute top-0 right-0 p-4">
                <div className="text-6xl opacity-20">🏆</div>
              </div>
              <div className="relative flex items-center gap-4">
                <Avatar className="h-16 w-16 ring-4 ring-yellow-300">
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                    {mvp.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Most Fair Member</span>
                  </div>
                  <h3 className="text-2xl font-bold text-yellow-900">{mvp.name}</h3>
                  <p className="text-yellow-700 mt-1">
                    Contributed fairly with {(100 - mvp.fairness).toFixed(0)}% balance accuracy! 🎯
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Member Contributions */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              Member Contributions
            </h3>
            <div className="grid gap-4">
              {memberSpending.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 rounded-xl border-2 border-gray-100 hover:border-emerald-200 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700">
                        {member.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">@{member.username}</p>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {(100 - member.fairness).toFixed(0)}% Fair
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Paid:</span>
                      <span className="ml-2 font-medium">${member.paid.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Consumed:</span>
                      <span className="ml-2 font-medium">${member.consumed.toFixed(2)}</span>
                    </div>
                  </div>
                  <Progress 
                    value={100 - member.fairness} 
                    className="mt-3 h-2" 
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Top Spending Categories
            </h3>
            <div className="space-y-3">
              {topCategories.map(([category, amount], index) => {
                const percentage = (amount / totalSpent) * 100
                const emoji = 
                  category === 'food' ? '🍔' :
                  category === 'transport' ? '🚗' :
                  category === 'accommodation' ? '🏨' :
                  category === 'entertainment' ? '🎉' :
                  category === 'shopping' ? '🛍️' :
                  category === 'utilities' ? '⚡' :
                  '📦'
                
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="text-xl">{emoji}</span>
                        <span className="font-medium capitalize">{category}</span>
                      </span>
                      <span className="text-sm font-medium">
                        ${amount.toFixed(2)} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <Separator />
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={onShare}
            >
              <Share2 className="h-4 w-4" />
              Share Summary
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
            >
              <Download className="h-4 w-4" />
              Download Report
            </Button>
            <Button 
              className="flex-1 gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              onClick={onClose}
            >
              <Heart className="h-4 w-4" />
              Great Memories!
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
