import { motion, AnimatePresence } from 'motion/react'
import { Loader2, Sparkles } from 'lucide-react'
import { LoginForm } from '../auth/LoginForm'
import { SignupForm } from '../auth/SignupForm'
import { ForgotPasswordForm } from '../auth/ForgotPasswordForm'
import { Toaster } from '../ui/sonner'

interface AuthLayoutProps {
  authMode: 'login' | 'signup' | 'forgot-password'
  isAuthenticating: boolean
  onLogin: (email: string, password: string) => Promise<void>
  onSignup: (data: { name: string; email: string; password: string; phone: string; username: string }) => Promise<void>
  onResetPassword: (email: string) => Promise<void>
  onSwitchMode: (mode: 'login' | 'signup' | 'forgot-password') => void
}

export function AuthLayout({ authMode, isAuthenticating, onLogin, onSignup, onResetPassword, onSwitchMode }: AuthLayoutProps) {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-950 dark:to-teal-950" />
      
      {/* Floating gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-300/30 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-300/20 rounded-full blur-3xl animate-pulse delay-500" />
      
      <div className="relative z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          {isAuthenticating ? (
            <motion.div
              key="authenticating"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-12 border border-white/20"
            >
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg mb-6">
                <Loader2 className="w-12 h-12 animate-spin text-white" />
              </div>
              <p className="text-lg font-medium">
                {authMode === 'login' ? 'Signing in...' : authMode === 'signup' ? 'Creating your account...' : 'Sending reset email...'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Please wait a moment</p>
            </motion.div>
          ) : (
            <motion.div
              key={authMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {authMode === 'login' ? (
                <LoginForm
                  onLogin={onLogin}
                  onSwitchToSignup={() => onSwitchMode('signup')}
                  onForgotPassword={() => onSwitchMode('forgot-password')}
                />
              ) : authMode === 'signup' ? (
                <SignupForm
                  onSignup={onSignup}
                  onSwitchToLogin={() => onSwitchMode('login')}
                />
              ) : (
                <ForgotPasswordForm
                  onResetPassword={onResetPassword}
                  onBack={() => onSwitchMode('login')}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Bottom branding */}
      <motion.div 
        className="absolute bottom-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-500" />
          <span className="gradient-text font-semibold">SplitWise</span> - Your smart personal expense manager
        </p>
      </motion.div>
      
      <Toaster />
    </div>
  )
}
