import { Coffee, ShoppingBag, Home, Utensils, Car, Film, Plane, Gift, Heart, Zap } from 'lucide-react'

export const expenseCategories = [
  { id: 'food', label: 'Food & Dining', icon: Utensils, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { id: 'groceries', label: 'Groceries', icon: ShoppingBag, color: 'text-green-600', bgColor: 'bg-green-50' },
  { id: 'transport', label: 'Transport', icon: Car, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { id: 'entertainment', label: 'Entertainment', icon: Film, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { id: 'utilities', label: 'Utilities', icon: Zap, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  { id: 'housing', label: 'Housing', icon: Home, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  { id: 'travel', label: 'Travel', icon: Plane, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
  { id: 'gifts', label: 'Gifts', icon: Gift, color: 'text-pink-600', bgColor: 'bg-pink-50' },
  { id: 'healthcare', label: 'Healthcare', icon: Heart, color: 'text-red-600', bgColor: 'bg-red-50' },
  { id: 'other', label: 'Other', icon: Coffee, color: 'text-gray-600', bgColor: 'bg-gray-50' }
]

export function getCategoryInfo(categoryId: string) {
  return expenseCategories.find(cat => cat.id === categoryId) || expenseCategories[expenseCategories.length - 1]
}
