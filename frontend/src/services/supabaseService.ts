import { Database } from '../types/supabase'
import { store } from '../store'
import { addNotification } from '../store/slices/notificationSlice'

// Helper function to get Supabase client dynamically
const getSupabase = async () => {
  const { supabase, handleSupabaseError, createRealtimeSubscription } = await import('../lib/supabase');
  return { supabase, handleSupabaseError, createRealtimeSubscription };
};

type Tables = Database['public']['Tables']

// User Service
export class UserService {
  static async createUser(userData: Tables['users']['Insert']) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async getUserById(id: string) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async getUserByWalletAddress(walletAddress: string) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async updateUser(id: string, updates: Tables['users']['Update']) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async updateLastActive(id: string) {
    try {
      const { supabase } = await getSupabase();
      const { error } = await supabase
        .from('users')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      console.error('Failed to update last active:', error)
    }
  }
}

// Connected Wallets Service
export class ConnectedWalletsService {
  static async addWallet(walletData: Tables['connected_wallets']['Insert']) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('connected_wallets')
        .insert(walletData)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async getUserWallets(userId: string) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('connected_wallets')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('connected_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async updateWalletBalance(id: string, balance: string) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('connected_wallets')
        .update({ 
          balance, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async deactivateWallet(id: string) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('connected_wallets')
        .update({ 
          is_active: false, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async subscribeToWalletChanges(userId: string, callback: (payload: any) => void) {
    const { createRealtimeSubscription } = await getSupabase();
    return createRealtimeSubscription(
      'connected_wallets',
      callback,
      `user_id=eq.${userId}`
    )
  }
}

// Transactions Service
export class TransactionsService {
  static async createTransaction(transactionData: Tables['transactions']['Insert']) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async getUserTransactions(userId: string, page = 1, limit = 20) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const offset = (page - 1) * limit
      
      const { data, error, count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      if (error) throw error
      
      return {
        data: data || [],
        total: count || 0,
        page,
        limit,
        hasNext: (count || 0) > offset + limit,
        hasPrev: page > 1
      }
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async updateTransactionStatus(
    id: string, 
    status: Tables['transactions']['Row']['status'],
    updates?: Partial<Tables['transactions']['Update']>
  ) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('transactions')
        .update({ 
          status, 
          ...updates,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async subscribeToTransactionUpdates(userId: string, callback: (payload: any) => void) {
    const { createRealtimeSubscription } = await getSupabase();
    return createRealtimeSubscription(
      'transactions',
      callback,
      `user_id=eq.${userId}`
    )
  }
}

// Price Data Service
export class PriceDataService {
  static async getLatestPrices(symbols: string[] = ['BTM']) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('price_data')
        .select('*')
        .in('symbol', symbols)
        .order('created_at', { ascending: false })
        .limit(symbols.length)
      
      if (error) throw error
      return data || []
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async getPriceHistory(symbol: string, timeframe: string = '24H') {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      let hours = 24
      
      switch (timeframe) {
        case '1H': hours = 1; break
        case '24H': hours = 24; break
        case '7D': hours = 24 * 7; break
        case '30D': hours = 24 * 30; break
        case '1Y': hours = 24 * 365; break
      }
      
      const startTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
      
      const { data, error } = await supabase
        .from('price_data')
        .select('*')
        .eq('symbol', symbol)
        .gte('created_at', startTime)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data || []
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async insertPriceData(priceData: Tables['price_data']['Insert']) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('price_data')
        .insert(priceData)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async subscribeToPriceUpdates(callback: (payload: any) => void) {
    const { createRealtimeSubscription } = await getSupabase();
    return createRealtimeSubscription('price_data', callback)
  }
}

// Price Alerts Service
export class PriceAlertsService {
  static async createAlert(alertData: Tables['price_alerts']['Insert']) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('price_alerts')
        .insert(alertData)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async getUserAlerts(userId: string) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async updateAlert(id: string, updates: Tables['price_alerts']['Update']) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('price_alerts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async triggerAlert(id: string) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('price_alerts')
        .update({ 
          triggered_at: new Date().toISOString(),
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async deleteAlert(id: string) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { error } = await supabase
        .from('price_alerts')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }
}

// Liquidity Positions Service
export class LiquidityPositionsService {
  static async createPosition(positionData: Tables['liquidity_positions']['Insert']) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('liquidity_positions')
        .insert(positionData)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async getUserPositions(userId: string) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('liquidity_positions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async updatePosition(id: string, updates: Tables['liquidity_positions']['Update']) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('liquidity_positions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async subscribeToPositionUpdates(userId: string, callback: (payload: any) => void) {
    const { createRealtimeSubscription } = await getSupabase();
    return createRealtimeSubscription(
      'liquidity_positions',
      callback,
      `user_id=eq.${userId}`
    )
  }
}

// Liquidity Pools Service
export class LiquidityPoolsService {
  static async getAllPools() {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('liquidity_pools')
        .select('*')
        .order('apy', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async getPoolsByChain(chainId: number) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('liquidity_pools')
        .select('*')
        .eq('chain_id', chainId)
        .order('apy', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async updatePool(id: string, updates: Tables['liquidity_pools']['Update']) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('liquidity_pools')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async subscribeToPoolUpdates(callback: (payload: any) => void) {
    const { createRealtimeSubscription } = await getSupabase();
    return createRealtimeSubscription('liquidity_pools', callback)
  }
}

// Notifications Service
export class NotificationsService {
  static async createNotification(notificationData: Tables['notifications']['Insert']) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async getUserNotifications(userId: string, page = 1, limit = 20) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const offset = (page - 1) * limit
      
      const { data, error, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      if (error) throw error
      
      return {
        data: data || [],
        total: count || 0,
        page,
        limit,
        hasNext: (count || 0) > offset + limit,
        hasPrev: page > 1
      }
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async markAsRead(id: string) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async markAllAsRead(userId: string) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select()
      
      if (error) throw error
      return data || []
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async deleteNotification(id: string) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    const { createRealtimeSubscription } = await getSupabase();
    return createRealtimeSubscription(
      'notifications',
      callback,
      `user_id=eq.${userId}`
    )
  }
}

// Portfolio Snapshots Service
export class PortfolioSnapshotsService {
  static async createSnapshot(snapshotData: Tables['portfolio_snapshots']['Insert']) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('portfolio_snapshots')
        .insert(snapshotData)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async getLatestSnapshot(userId: string) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('portfolio_snapshots')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async getSnapshotHistory(userId: string, days = 30) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      
      const { data, error } = await supabase
        .from('portfolio_snapshots')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data || []
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }
}

// Trading History Service
export class TradingHistoryService {
  static async createTrade(tradeData: Tables['trading_history']['Insert']) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('trading_history')
        .insert(tradeData)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async getUserTrades(userId: string, page = 1, limit = 20) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const offset = (page - 1) * limit
      
      const { data, error, count } = await supabase
        .from('trading_history')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      if (error) throw error
      
      return {
        data: data || [],
        total: count || 0,
        page,
        limit,
        hasNext: (count || 0) > offset + limit,
        hasPrev: page > 1
      }
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async updateTrade(id: string, updates: Tables['trading_history']['Update']) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('trading_history')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }
}

// Bridge Transfers Service
export class BridgeTransfersService {
  static async createTransfer(transferData: Tables['bridge_transfers']['Insert']) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('bridge_transfers')
        .insert(transferData)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async getUserTransfers(userId: string, page = 1, limit = 20) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const offset = (page - 1) * limit
      
      const { data, error, count } = await supabase
        .from('bridge_transfers')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      if (error) throw error
      
      return {
        data: data || [],
        total: count || 0,
        page,
        limit,
        hasNext: (count || 0) > offset + limit,
        hasPrev: page > 1
      }
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async updateTransferStatus(
    id: string, 
    status: Tables['bridge_transfers']['Row']['status'],
    updates?: Partial<Tables['bridge_transfers']['Update']>
  ) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('bridge_transfers')
        .update({ 
          status, 
          ...updates,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }

  static async subscribeToTransferUpdates(userId: string, callback: (payload: any) => void) {
    const { createRealtimeSubscription } = await getSupabase();
    return createRealtimeSubscription(
      'bridge_transfers',
      callback,
      `user_id=eq.${userId}`
    )
  }
}

// Analytics Events Service
export class AnalyticsEventsService {
  static async trackEvent(eventData: Tables['analytics_events']['Insert']) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      const { data, error } = await supabase
        .from('analytics_events')
        .insert(eventData)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      // Don't throw errors for analytics to avoid disrupting user experience
      console.error('Failed to track analytics event:', error)
      return null
    }
  }

  static async getUserEvents(userId: string, eventType?: string, limit = 100) {
    try {
      const { supabase, handleSupabaseError } = await getSupabase();
      let query = supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (eventType) {
        query = query.eq('event_type', eventType)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data || []
    } catch (error) {
      const { handleSupabaseError } = await getSupabase();
      throw new Error(handleSupabaseError(error))
    }
  }
}