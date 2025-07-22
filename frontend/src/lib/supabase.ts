import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

// Get environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tvnmsaqpyrsbauodpfrh.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2bm1zYXFweXJzYmF1b2RwZnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTMyNzYsImV4cCI6MjA2ODY2OTI3Nn0.DbaHDC77UtkM9jKtcpKPFwwZefrFEwDQ21WfTS6cbxU'

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  })
}

// Create Supabase client with error handling
let supabase: any = null;

try {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  });
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Create a mock client to prevent crashes
  supabase = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: null } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not initialized') }),
      signUp: () => Promise.resolve({ data: null, error: new Error('Supabase not initialized') })
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not initialized') }) }) }),
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not initialized') }) }) }),
      update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not initialized') }) }) }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: new Error('Supabase not initialized') }) })
    }),
    channel: () => ({
      on: () => ({ subscribe: () => null })
    }),
    removeChannel: () => {}
  };
}

export { supabase }

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error)
  
  if (error?.code === 'PGRST301') {
    return 'Resource not found'
  }
  
  if (error?.code === '23505') {
    return 'This record already exists'
  }
  
  if (error?.code === '23503') {
    return 'Referenced record does not exist'
  }
  
  if (error?.code === '42501') {
    return 'Permission denied'
  }
  
  return error?.message || 'An unexpected error occurred'
}

// Helper function for real-time subscriptions
export const createRealtimeSubscription = (
  table: string,
  callback: (payload: any) => void,
  filter?: string
) => {
  const channel = supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter
      },
      callback
    )
    .subscribe()

  return channel
}

// Helper function to get user session
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Helper function to sign in with wallet
export const signInWithWallet = async (walletAddress: string, signature: string, message: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: `${walletAddress}@wallet.btcminer.com`,
    password: signature
  })
  
  if (error && error.message.includes('Invalid login credentials')) {
    // User doesn't exist, create account
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: `${walletAddress}@wallet.btcminer.com`,
      password: signature,
      options: {
        data: {
          wallet_address: walletAddress,
          signed_message: message
        }
      }
    })
    
    if (signUpError) throw signUpError
    return signUpData
  }
  
  if (error) throw error
  return data
}

export default supabase