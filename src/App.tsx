import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Toaster } from './components/ui/sonner'
import { LoadingScreen } from './components/layout/LoadingScreen'
import { AuthLayout } from './components/layout/AuthLayout'
import { Navigation } from './components/layout/Navigation'
import { DashboardPage } from './components/pages/DashboardPage'
import { ExpensesPage } from './components/pages/ExpensesPage'
import { GroupsPage } from './components/pages/GroupsPage'
import { FriendsPage } from './components/pages/FriendsPage'
import { ActivityPage } from './components/pages/ActivityPage'
import { ProfilePage } from './components/pages/ProfilePage'
import { useAuth } from './hooks/useAuth'
import { useGroups } from './hooks/useGroups'
import { useFriends } from './hooks/useFriends'
import { useDashboard } from './hooks/useDashboard'
import { useActivity } from './hooks/useActivity'
import { usePersonalExpenses } from './hooks/usePersonalExpenses'

type Page = 'dashboard' | 'expenses' | 'groups' | 'friends' | 'activity' | 'profile'

export default function App() {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot-password'>('login')
  const [currentPage, setCurrentPage] = useState<Page>('expenses')
  
  // Custom hooks for state management
  const { accessToken, user, isAuthenticating, isCheckingSession, handleLogin, handleSignup, handleLogout } = useAuth()
  const groups = useGroups(accessToken)
  const friends = useFriends(accessToken)
  const dashboard = useDashboard(accessToken)
  const activity = useActivity(accessToken)
  const personalExpenses = usePersonalExpenses(accessToken)

  // Fetch data based on current page
  useEffect(() => {
    if (!accessToken) return

    const fetchData = async () => {
      switch (currentPage) {
        case 'dashboard':
          await dashboard.fetchDashboard()
          break
        case 'expenses':
          await personalExpenses.fetchExpenses()
          await personalExpenses.fetchBudgets()
          await personalExpenses.fetchTrends()
          await dashboard.fetchDashboard()
          break
        case 'groups':
          await groups.fetchGroups()
          await friends.fetchFriends()
          break
        case 'friends':
          await friends.fetchFriends()
          break
        case 'activity':
          await activity.fetchActivity()
          break
        case 'profile':
          await friends.fetchFriends()
          break
      }
    }

    fetchData()
  }, [currentPage, accessToken])

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
      className="min-h-screen"
    >
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      
      <main className="max-w-7xl mx-auto px-4 py-8 pb-20">
        {currentPage === 'dashboard' && (
          <DashboardPage 
            stats={dashboard.dashboardStats}
            loading={dashboard.loading}
            onNavigate={setCurrentPage}
          />
        )}

        {currentPage === 'expenses' && (
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
          />
        )}

        {currentPage === 'groups' && (
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
        )}

        {currentPage === 'friends' && (
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
        )}

        {currentPage === 'activity' && (
          <ActivityPage
            activityData={activity.activityData}
            loading={activity.loading}
            onGroupClick={handleActivityGroupClick}
          />
        )}

        {currentPage === 'profile' && (
          <ProfilePage 
            user={user} 
            friends={friends.friends}
            loading={friends.loading}
            onLogout={handleLogout}
            onSettle={friends.handleSettleDebt}
          />
        )}
      </main>

      <Toaster />
    </motion.div>
  )
}
