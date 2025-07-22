import { useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { UserService } from '../services/supabaseService'
import { useAppDispatch } from './redux'
import { addNotification } from '../store/slices/notificationSlice'
import { Database } from '../types/supabase'

type UserRow = Database['public']['Tables']['users']['Row']

interface AuthState {
  user: User | null
  userProfile: UserRow | null
  loading: boolean
  error: string | null
}

export const useSupabaseAuth = () => {
  const dispatch = useAppDispatch()
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userProfile: null,
    loading: true,
    error: null
  })

  // Initialize auth state
  useEffect(() => {
    let subscription: any = null;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { supabase } = await import('../lib/supabase');
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setAuthState(prev => ({ ...prev, loading: false, error: error.message }))
          return
        }

        if (session?.user) {
          await handleUserSession(session.user)
        } else {
          setAuthState(prev => ({ ...prev, loading: false }))
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        setAuthState(prev => ({ ...prev, loading: false, error: 'Failed to initialize authentication' }))
      }
    }

    const initializeAuth = async () => {
      try {
        const { supabase } = await import('../lib/supabase');
        
        await getInitialSession();

        // Listen for auth changes
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.id)
          
          if (event === 'SIGNED_IN' && session?.user) {
            await handleUserSession(session.user)
          } else if (event === 'SIGNED_OUT') {
            setAuthState({
              user: null,
              userProfile: null,
              loading: false,
              error: null
            })
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            await handleUserSession(session.user)
          }
        })

        subscription = authSubscription;
      } catch (error) {
        console.error('Error initializing auth:', error)
        setAuthState(prev => ({ ...prev, loading: false, error: 'Failed to initialize authentication' }))
      }
    }

    initializeAuth();

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const handleUserSession = async (user: User) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      // Try to get existing user profile
      let userProfile: UserRow | null = null
      
      try {
        userProfile = await UserService.getUserById(user.id)
      } catch (error) {
        // User doesn't exist, create new profile
        const walletAddress = user.user_metadata?.wallet_address
        const internetIdentityPrincipal = user.user_metadata?.internet_identity_principal
        
        userProfile = await UserService.createUser({
          id: user.id,
          wallet_address: walletAddress || null,
          internet_identity_principal: internetIdentityPrincipal || null,
          email: user.email || null,
          preferences: {
            defaultChain: 'ethereum',
            currency: 'USD',
            language: 'en',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            notifications: {
              email: false,
              push: true,
              sms: false,
              priceAlerts: true,
              transactionUpdates: true,
              liquidityWarnings: true,
              securityAlerts: true
            },
            privacy: {
              shareAnalytics: true,
              shareUsageData: false,
              publicProfile: false
            }
          },
          is_verified: false
        })
        
        dispatch(addNotification({
          type: 'system',
          priority: 'medium',
          title: 'Welcome to BTCMiner!',
          message: 'Your account has been created successfully. Start by connecting your wallets.'
        }))
      }
      
      // Update last active time
      if (userProfile) {
        UserService.updateLastActive(userProfile.id)
      }
      
      setAuthState({
        user,
        userProfile,
        loading: false,
        error: null
      })
      
    } catch (error: any) {
      console.error('Error handling user session:', error)
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Failed to load user profile' 
      }))
    }
  }

  const signInWithWalletAddress = useCallback(async (
    walletAddress: string, 
    signature: string, 
    message: string
  ) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const { signInWithWallet } = await import('../lib/supabase');
      const { user } = await signInWithWallet(walletAddress, signature, message)
      
      if (!user) {
        throw new Error('Failed to authenticate with wallet')
      }
      
      dispatch(addNotification({
        type: 'system',
        priority: 'medium',
        title: 'Wallet Connected',
        message: 'Successfully authenticated with your wallet!'
      }))
      
      return user
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign in with wallet'
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
      
      dispatch(addNotification({
        type: 'security',
        priority: 'high',
        title: 'Authentication Failed',
        message: errorMessage
      }))
      
      throw error
    }
  }, [dispatch])

  const signOut = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }
      
      dispatch(addNotification({
        type: 'system',
        priority: 'low',
        title: 'Signed Out',
        message: 'You have been signed out successfully.'
      }))
      
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign out'
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
      
      dispatch(addNotification({
        type: 'system',
        priority: 'medium',
        title: 'Sign Out Failed',
        message: errorMessage
      }))
    }
  }, [dispatch])

  const updateUserProfile = useCallback(async (updates: Partial<UserRow>) => {
    if (!authState.userProfile) {
      throw new Error('No user profile to update')
    }
    
    try {
      const updatedProfile = await UserService.updateUser(authState.userProfile.id, updates)
      
      setAuthState(prev => ({
        ...prev,
        userProfile: updatedProfile
      }))
      
      dispatch(addNotification({
        type: 'system',
        priority: 'low',
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully.'
      }))
      
      return updatedProfile
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update profile'
      
      dispatch(addNotification({
        type: 'system',
        priority: 'medium',
        title: 'Update Failed',
        message: errorMessage
      }))
      
      throw error
    }
  }, [authState.userProfile, dispatch])

  const refreshUserProfile = useCallback(async () => {
    if (!authState.user) {
      return null
    }
    
    try {
      const userProfile = await UserService.getUserById(authState.user.id)
      
      setAuthState(prev => ({
        ...prev,
        userProfile
      }))
      
      return userProfile
    } catch (error: any) {
      console.error('Error refreshing user profile:', error)
      return null
    }
  }, [authState.user])

  return {
    user: authState.user,
    userProfile: authState.userProfile,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.user,
    signInWithWalletAddress,
    signOut,
    updateUserProfile,
    refreshUserProfile
  }
}