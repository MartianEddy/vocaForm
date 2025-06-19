import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, supabaseHelpers } from '../lib/supabase'
import { analytics } from '../lib/analytics'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'user' | 'agent' | 'admin'
  subscription_status: 'free' | 'premium' | 'enterprise'
  created_at: string
  updated_at: string
  last_login: string | null
  preferences: any | null
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, metadata?: any) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  isAuthenticated: boolean
  hasRole: (role: string) => boolean
  hasSubscription: (level: 'premium' | 'enterprise') => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize analytics
    analytics.initialize()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await loadUserProfile(session.user.id)
        
        // Track authentication events
        if (event === 'SIGNED_IN') {
          analytics.setUser(session.user.id, {
            email: session.user.email,
            role: profile?.role || 'user'
          })
          analytics.track('user_signed_in')
        }
      } else {
        setProfile(null)
        if (event === 'SIGNED_OUT') {
          analytics.track('user_signed_out')
        }
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const profileData = await supabaseHelpers.getUserProfile(userId)
      setProfile(profileData)
    } catch (error) {
      console.error('Failed to load user profile:', error)
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) throw error

      if (data.user) {
        // Create user profile
        const profileData = {
          id: data.user.id,
          email: data.user.email!,
          full_name: metadata?.full_name || null,
          role: 'user' as const,
          subscription_status: 'free' as const,
          preferences: {}
        }

        await supabaseHelpers.updateUserProfile(data.user.id, profileData)
        
        // Track signup
        analytics.track('user_signed_up', {
          email: data.user.email,
          method: 'email'
        })
      }
    } catch (error: any) {
      analytics.trackError('signup_failed', error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Update last login
      if (data.user) {
        await supabaseHelpers.updateUserProfile(data.user.id, {
          last_login: new Date().toISOString()
        })
      }
    } catch (error: any) {
      analytics.trackError('signin_failed', error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error: any) {
      analytics.trackError('signout_failed', error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) throw error
      
      analytics.track('password_reset_requested', { email })
    } catch (error: any) {
      analytics.trackError('password_reset_failed', error.message)
      throw error
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in')

    try {
      const updatedProfile = await supabaseHelpers.updateUserProfile(user.id, {
        ...updates,
        updated_at: new Date().toISOString()
      })
      
      setProfile(updatedProfile)
      
      analytics.track('profile_updated', {
        fields_updated: Object.keys(updates)
      })
    } catch (error: any) {
      analytics.trackError('profile_update_failed', error.message)
      throw error
    }
  }

  const hasRole = (role: string): boolean => {
    return profile?.role === role
  }

  const hasSubscription = (level: 'premium' | 'enterprise'): boolean => {
    if (!profile) return false
    
    if (level === 'premium') {
      return ['premium', 'enterprise'].includes(profile.subscription_status)
    }
    
    if (level === 'enterprise') {
      return profile.subscription_status === 'enterprise'
    }
    
    return false
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updateProfile,
      isAuthenticated,
      hasRole,
      hasSubscription
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-8">Please sign in to access this page.</p>
            <a href="/auth/signin" className="btn-primary">
              Sign In
            </a>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}