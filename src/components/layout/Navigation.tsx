import { Home, Users, Activity, User, Wallet, Receipt, Sparkles, PanelsTopLeft } from 'lucide-react'
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
    <nav className="sticky top-0 z-50 border-b border-white/20 bg-white/80 backdrop-blur-2xl shadow-[0_20px_80px_-40px_rgba(16,185,129,0.6)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-[70px] items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-400 p-2 text-white shadow-lg">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-600">Expense OS</p>
              <p className="text-lg font-semibold text-gray-900">ExpenseFlow</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationCenter />
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gray-900 text-white shadow-lg shadow-emerald-200/40'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
