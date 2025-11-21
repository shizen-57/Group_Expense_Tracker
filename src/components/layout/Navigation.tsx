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
    <nav className="glass border-b border-white/20 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl shadow-lg">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">ExpenseFlow</h1>
              <p className="text-xs text-muted-foreground -mt-1">Smart Expense Manager</p>
            </div>
          </motion.div>
          
          {/* Navigation Items */}
          <div className="flex items-center gap-2">
            {/* Notification Center */}
            <NotificationCenter />
            
            {navItems.map((item, index) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              const isAI = item.id === 'ai-insights'
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? isAI
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                      : isAI
                        ? 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/10'
                  }`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className={`h-5 w-5 ${isAI && !isActive ? 'animate-pulse' : ''}`} />
                  <span className="hidden sm:inline font-medium">{item.label}</span>
                  
                  {isActive && (
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${
                        isAI ? 'from-purple-500 to-pink-600' : 'from-emerald-500 to-teal-600'
                      } rounded-xl -z-10`}
                      layoutId="activeNav"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}