import { useState, useEffect } from 'react'
import { createClient } from '../utils/supabase/client'
import { api } from '../utils/api'
import { toast } from 'sonner@2.0.3'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  username: string
}

export function useAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      setIsCheckingSession(true)
      console.log('Checking for existing session...')
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.access_token) {
        console.log('Found existing session, fetching user profile...')
        setAccessToken(session.access_token)
        await fetchUserProfile(session.access_token)
      } else {
        console.log('No existing session found')
      }
      setIsCheckingSession(false)
    }
    
    checkSession()
    
    // Listen for auth state changes (handles token refresh, sign out, etc.)
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
      
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in, updating state...')
        setAccessToken(session.access_token)
        await fetchUserProfile(session.access_token)
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing state...')
        setAccessToken(null)
        setUser(null)
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('Token refreshed, updating access token...')
        setAccessToken(session.access_token)
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (token: string) => {
    try {
      const userData = await api.getProfile(token)
      if (userData.id) {
        setUser(userData)
        console.log('User profile loaded:', userData)
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }
  }

  const handleLogin = async (email: string, password: string) => {
    setIsAuthenticating(true)
    console.log('=== LOGIN ATTEMPT ===')
    console.log('Email:', email)
    
    try {
      console.log('Calling Supabase auth login...')
      const supabase = createClient()
      
      // Sign in with Supabase directly (this persists the session in the browser)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('Supabase auth error:', error)
        let errorMessage = error.message
        
        if (errorMessage.toLowerCase().includes('invalid login credentials')) {
          errorMessage = 'Invalid email or password. If you don\'t have an account, please sign up first.'
        }
        toast.error(errorMessage)
        throw new Error(errorMessage)
      }

      if (!data.session?.access_token) {
        console.error('No access token in Supabase response')
        toast.error('Login failed: No access token received')
        throw new Error('No access token received')
      }

      console.log('✅ Supabase login successful!')
      console.log('Access token:', data.session.access_token)
      
      // Set the access token first
      setAccessToken(data.session.access_token)
      
      // Fetch user profile from our backend
      try {
        const userData = await api.getProfile(data.session.access_token)
        if (userData.id) {
          console.log('User profile loaded:', userData)
          setUser(userData)
          toast.success(`Welcome back, ${userData.name}!`)
        } else {
          console.error('No user data returned from profile endpoint')
          toast.error('Failed to load user profile')
        }
      } catch (profileError) {
        console.error('Failed to fetch user profile:', profileError)
        toast.error('Login successful but failed to load profile')
      }
    } catch (error: any) {
      console.error('❌ Login error:', error.message || error)
      throw error
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleSignup = async (data: { name: string; email: string; password: string; phone: string; username: string }) => {
    setIsAuthenticating(true)
    console.log('=== SIGNUP ATTEMPT ===')
    console.log('Data:', { name: data.name, email: data.email, username: data.username })
    
    try {
      console.log('Calling API signup...')
      const response = await api.signup(data)
      console.log('Signup API response:', response)
      
      if (response.error) {
        console.error('Signup API returned error:', response.error)
        toast.error(response.error)
        throw new Error(response.error)
      }

      console.log('✅ Signup successful!')
      toast.success('Account created successfully! Logging you in...')
      
      // Automatically log in after successful signup
      console.log('Auto-login after signup...')
      await handleLogin(data.email, data.password)
      return true
    } catch (error: any) {
      console.error('❌ Signup error:', error.message || error)
      throw error
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleLogout = async () => {
    console.log('Logging out...')
    const supabase = createClient()
    await supabase.auth.signOut()
    setAccessToken(null)
    setUser(null)
    toast.success('Logged out successfully')
  }

  return {
    accessToken,
    user,
    isAuthenticating,
    isCheckingSession,
    handleLogin,
    handleSignup,
    handleLogout,
  }
}