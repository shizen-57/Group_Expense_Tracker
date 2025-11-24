import { Home, Users, UserCircle2, Activity, User, Wallet, Receipt, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { NotificationCenter } from '../notifications/NotificationCenter'

interface NavigationProps {
  currentPage: 'dashboard' | 'expenses' | 'groups' | 'friends' | 'activity' | 'profile' | 'ai-insights'
  onNavigate: (page: 'dashboard' | 'expenses' | 'groups' | 'friends' | 'activity' | 'profile' | 'ai-insights') => void
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const navItems = [
    { id: 'expenses' as const, label: 'Expenses', icon: Receipt },
    { id: 'ai-insights' as const, label: 'AI Insights', icon: Sparkles },
    { id: 'dashboard' as const, label: 'Overview', icon: Home },
    { id: 'groups' as const, label: 'Groups', icon: Users },
    { id: 'activity' as const, label: 'Activity', icon: Activity },
    { id: 'profile' as const, label: 'Profile', icon: User }
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl">ExpenseFlow</h1>
              <p className="text-xs text-gray-500 -mt-1">Smart Expense Manager</p>
            </div>
          </div>
          
          {/* Navigation Items */}
          <div className="flex items-center gap-2">
            {/* Notification Center */}
            <NotificationCenter />
            
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    isActive 
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="hidden sm:inline font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
