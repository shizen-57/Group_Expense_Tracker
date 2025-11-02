import { useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Mail, ArrowLeft, KeyRound } from 'lucide-react'

interface ForgotPasswordFormProps {
  onResetPassword: (email: string) => Promise<void>
  onBack: () => void
}

export function ForgotPasswordForm({ onResetPassword, onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await onResetPassword(email)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-md border-0 shadow-[0_20px_70px_-10px_rgba(16,185,129,0.3)] bg-white/95 backdrop-blur-xl">
        <CardHeader className="text-center pb-8 pt-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex mx-auto mb-6 p-5 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)]"
          >
            <KeyRound className="h-10 w-10 text-white" />
          </motion.div>
          <CardTitle className="text-4xl gradient-text mb-2">Reset Password</CardTitle>
          <CardDescription className="text-base text-gray-600">
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <p className="text-emerald-600">
                  Password reset instructions have been sent to your email!
                </p>
              </div>
              <Button
                onClick={onBack}
                variant="outline"
                className="w-full h-12"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Login
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-white border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-[0_10px_30px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_15px_40px_-5px_rgba(16,185,129,0.5)] transition-all duration-300 text-base font-semibold"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <Button
                type="button"
                onClick={onBack}
                variant="ghost"
                className="w-full h-12"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Login
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
