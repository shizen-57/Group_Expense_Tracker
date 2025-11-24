import { useState, useEffect, lazy, Suspense } from 'react'
import { motion } from 'motion/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from './components/ui/sonner'
import { LoadingScreen } from './components/layout/LoadingScreen'
import { AuthLayout } from './components/layout/AuthLayout'
import { Navigation } from './components/layout/Navigation'
import { useAuth } from './hooks/useAuth'
import { useOptimizedGroups } from './hooks/useOptimizedGroups'
import { useOptimizedFriends } from './hooks/useOptimizedFriends'
import { useOptimizedDashboard } from './hooks/useOptimizedDashboard'
import { useOptimizedActivity } from './hooks/useOptimizedActivity'
import { useOptimizedPersonalExpenses } from './hooks/useOptimizedPersonalExpenses'
import { useNotificationSystem } from './hooks/useNotificationSystem'
import { defaultNotificationPreferences } from './utils/notifications/NotificationFactory'
import { queryClient } from './utils/queryClient'

// Lazy load pages for better initial load performance
const DashboardPage = lazy(() => import('./components/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const ExpensesPage = lazy(() => import('./components/pages/ExpensesPage').then(m => ({ default: m.ExpensesPage })))
const GroupsPage = lazy(() => import('./components/pages/GroupsPage').then(m => ({ default: m.GroupsPage })))
const FriendsPage = lazy(() => import('./components/pages/FriendsPage').then(m => ({ default: m.FriendsPage })))
const ActivityPage = lazy(() => import('./components/pages/ActivityPage').then(m => ({ default: m.ActivityPage })))
const ProfilePage = lazy(() => import('./components/pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const AIInsightsPage = lazy(() => import('./components/pages/AIInsightsPage').then(m => ({ default: m.AIInsightsPage })))

type Page = 'dashboard' | 'expenses' | 'groups' | 'friends' | 'activity' | 'profile' | 'ai-insights'

// Page loading fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
    </div>
  )
}

function AppContent() {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot-password'>('login')
  const [currentPage, setCurrentPage] = useState<Page>('expenses')
  
  // Custom hooks for state management with React Query
  const { accessToken, user, isAuthenticating, isCheckingSession, handleLogin, handleSignup, handleLogout } = useAuth()
  const groups = useOptimizedGroups(accessToken)
  const friends = useOptimizedFriends(accessToken)
  const dashboard = useOptimizedDashboard(accessToken)
  const activity = useOptimizedActivity(accessToken)
  const personalExpenses = useOptimizedPersonalExpenses(accessToken)
  
  // Initialize notification system (only when user is logged in)
  useNotificationSystem({
    userId: user?.id || '',
    user,
    preferences: user?.id ? {
      ...defaultNotificationPreferences,
      userId: user.id
    } : undefined
  })

  // Activity group click handler
  const handleActivityGroupClick = (groupId: string) => {
    setCurrentPage('groups')
    groups.handleSelectGroup(groupId)
  }

  // Handle signup and switch to login
  const handleSignupWrapper = async (data: { name: string; email: string; password: string; phone: string; username: string }) => {
    await handleSignup(data)
    setAuthMode('login')
  }

  // Handle password reset
  const handleResetPassword = async (email: string) => {
    const { createClient } = await import('./utils/supabase/client')
    const supabase = createClient()
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    })
    
    if (error) {
      throw new Error(error.message)
    }
  }

  // Show loading screen while checking session
  if (isCheckingSession) {
    return <LoadingScreen />
  }

  // Show login/signup forms
  if (!accessToken || !user) {
    return (
      <AuthLayout
        authMode={authMode}
        isAuthenticating={isAuthenticating}
        onLogin={handleLogin}
        onSignup={handleSignupWrapper}
        onResetPassword={handleResetPassword}
        onSwitchMode={setAuthMode}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50"
    >
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      
      <main className="px-4 py-8 pb-20">
        {currentPage === 'dashboard' && (
          <Suspense fallback={<PageLoader />}>
            <DashboardPage 
              stats={dashboard.dashboardStats}
              loading={dashboard.loading}
              onNavigate={setCurrentPage}
            />
          </Suspense>
        )}

        {currentPage === 'expenses' && (
          <Suspense fallback={<PageLoader />}>
            <ExpensesPage
              expenses={personalExpenses.expenses}
              budgets={personalExpenses.budgets}
              trends={personalExpenses.trends}
              stats={dashboard.dashboardStats}
              loading={personalExpenses.loading}
              onCreateExpense={personalExpenses.createExpense}
              onDeleteExpense={personalExpenses.deleteExpense}
              onCreateBudget={personalExpenses.createBudget}
              onDeleteBudget={personalExpenses.deleteBudget}
              onSearch={personalExpenses.searchExpenses}
              onScanReceipt={personalExpenses.scanReceipt}
              onGetAIInsights={personalExpenses.getAIInsights}
            />
          </Suspense>
        )}

        {currentPage === 'groups' && (
          <Suspense fallback={<PageLoader />}>
            <GroupsPage
              groups={groups.groups}
              selectedGroupId={groups.selectedGroupId}
              selectedGroup={groups.selectedGroup}
              currentUserId={user.id}
              loading={groups.loading}
              friends={friends.friends}
              onSelectGroup={groups.handleSelectGroup}
              onCreateGroup={groups.handleCreateGroup}
              onBackToGroups={groups.handleBackToGroups}
              onAddMember={groups.handleAddMember}
              onAddExpense={groups.handleAddExpense}
              onSimplify={groups.handleSimplifyDebts}
              onSettleAndSync={groups.handleSettleAndSync}
              onDeleteGroup={groups.handleDeleteGroup}
              onAddFriend={friends.handleAddFriend}
              onAddFriendByEmail={friends.handleAddFriendByEmail}
              onAddFriendByCode={friends.handleAddFriendByCode}
              onSearchSuggestions={friends.handleSearchSuggestions}
            />
          </Suspense>
        )}

        {currentPage === 'friends' && (
          <Suspense fallback={<PageLoader />}>
            <FriendsPage
              friends={friends.friends}
              loading={friends.loading}
              userId={user.id}
              onAddFriend={friends.handleAddFriend}
              onAddFriendByEmail={friends.handleAddFriendByEmail}
              onAddFriendByCode={friends.handleAddFriendByCode}
              onSearchSuggestions={friends.handleSearchSuggestions}
              onSettle={friends.handleSettleDebt}
            />
          </Suspense>
        )}

        {currentPage === 'activity' && (
          <Suspense fallback={<PageLoader />}>
            <ActivityPage
              activityData={activity.activityData}
              loading={activity.loading}
              onGroupClick={handleActivityGroupClick}
            />
          </Suspense>
        )}

        {currentPage === 'profile' && (
          <Suspense fallback={<PageLoader />}>
            <ProfilePage 
              user={user} 
              friends={friends.friends}
              loading={friends.loading}
              onLogout={handleLogout}
              onSettle={friends.handleSettleDebt}
            />
          </Suspense>
        )}

        {currentPage === 'ai-insights' && (
          <Suspense fallback={<PageLoader />}>
            <AIInsightsPage
              onGetAIInsights={personalExpenses.getAIInsights}
            />
          </Suspense>
        )}
      </main>

      <Toaster />
    </motion.div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  )
}