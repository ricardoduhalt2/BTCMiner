export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          wallet_address: string | null
          internet_identity_principal: string | null
          email: string | null
          preferences: Json
          is_verified: boolean
          created_at: string
          updated_at: string
          last_active_at: string
        }
        Insert: {
          id?: string
          wallet_address?: string | null
          internet_identity_principal?: string | null
          email?: string | null
          preferences?: Json
          is_verified?: boolean
          created_at?: string
          updated_at?: string
          last_active_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string | null
          internet_identity_principal?: string | null
          email?: string | null
          preferences?: Json
          is_verified?: boolean
          created_at?: string
          updated_at?: string
          last_active_at?: string
        }
      }
      connected_wallets: {
        Row: {
          id: string
          user_id: string
          wallet_type: 'metamask' | 'phantom' | 'walletconnect' | 'internet-identity'
          address: string
          chain_id: number
          chain_name: string
          balance: string
          public_key: string | null
          principal: string | null
          is_active: boolean
          connected_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          wallet_type: 'metamask' | 'phantom' | 'walletconnect' | 'internet-identity'
          address: string
          chain_id: number
          chain_name: string
          balance?: string
          public_key?: string | null
          principal?: string | null
          is_active?: boolean
          connected_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          wallet_type?: 'metamask' | 'phantom' | 'walletconnect' | 'internet-identity'
          address?: string
          chain_id?: number
          chain_name?: string
          balance?: string
          public_key?: string | null
          principal?: string | null
          is_active?: boolean
          connected_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          hash: string
          type: 'transfer' | 'bridge' | 'swap' | 'liquidity' | 'mint' | 'burn'
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          from_chain: string
          to_chain: string | null
          from_address: string
          to_address: string
          amount: string
          token_address: string
          token_symbol: string
          token_name: string
          token_decimals: number
          gas_used: string | null
          gas_price: string | null
          fee: string
          block_number: number | null
          confirmations: number | null
          estimated_time: number | null
          actual_time: number | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          hash: string
          type: 'transfer' | 'bridge' | 'swap' | 'liquidity' | 'mint' | 'burn'
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          from_chain: string
          to_chain?: string | null
          from_address: string
          to_address: string
          amount: string
          token_address: string
          token_symbol: string
          token_name: string
          token_decimals: number
          gas_used?: string | null
          gas_price?: string | null
          fee: string
          block_number?: number | null
          confirmations?: number | null
          estimated_time?: number | null
          actual_time?: number | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          hash?: string
          type?: 'transfer' | 'bridge' | 'swap' | 'liquidity' | 'mint' | 'burn'
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          from_chain?: string
          to_chain?: string | null
          from_address?: string
          to_address?: string
          amount?: string
          token_address?: string
          token_symbol?: string
          token_name?: string
          token_decimals?: number
          gas_used?: string | null
          gas_price?: string | null
          fee?: string
          block_number?: number | null
          confirmations?: number | null
          estimated_time?: number | null
          actual_time?: number | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      price_data: {
        Row: {
          id: string
          symbol: string
          chain_id: number
          price: number
          volume_24h: number
          market_cap: number
          change_1h: number
          change_24h: number
          change_7d: number
          source: string
          created_at: string
        }
        Insert: {
          id?: string
          symbol: string
          chain_id: number
          price: number
          volume_24h?: number
          market_cap?: number
          change_1h?: number
          change_24h?: number
          change_7d?: number
          source: string
          created_at?: string
        }
        Update: {
          id?: string
          symbol?: string
          chain_id?: number
          price?: number
          volume_24h?: number
          market_cap?: number
          change_1h?: number
          change_24h?: number
          change_7d?: number
          source?: string
          created_at?: string
        }
      }
      price_alerts: {
        Row: {
          id: string
          user_id: string
          symbol: string
          condition: 'above' | 'below' | 'change'
          target_price: number | null
          change_percentage: number | null
          is_active: boolean
          triggered_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          symbol: string
          condition: 'above' | 'below' | 'change'
          target_price?: number | null
          change_percentage?: number | null
          is_active?: boolean
          triggered_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          symbol?: string
          condition?: 'above' | 'below' | 'change'
          target_price?: number | null
          change_percentage?: number | null
          is_active?: boolean
          triggered_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      liquidity_positions: {
        Row: {
          id: string
          user_id: string
          chain_id: number
          pool_address: string
          token_a: string
          token_b: string
          liquidity: string
          share: number
          apy: number
          rewards: string
          impermanent_loss: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          chain_id: number
          pool_address: string
          token_a: string
          token_b: string
          liquidity: string
          share: number
          apy: number
          rewards?: string
          impermanent_loss?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          chain_id?: number
          pool_address?: string
          token_a?: string
          token_b?: string
          liquidity?: string
          share?: number
          apy?: number
          rewards?: string
          impermanent_loss?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      liquidity_pools: {
        Row: {
          id: string
          chain_id: number
          address: string
          name: string
          token_a: string
          token_b: string
          total_liquidity: string
          available_liquidity: string
          utilization_rate: number
          apy: number
          health_score: number
          warning_level: 'normal' | 'low' | 'critical'
          last_rebalance: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chain_id: number
          address: string
          name: string
          token_a: string
          token_b: string
          total_liquidity: string
          available_liquidity: string
          utilization_rate: number
          apy: number
          health_score: number
          warning_level?: 'normal' | 'low' | 'critical'
          last_rebalance: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chain_id?: number
          address?: string
          name?: string
          token_a?: string
          token_b?: string
          total_liquidity?: string
          available_liquidity?: string
          utilization_rate?: number
          apy?: number
          health_score?: number
          warning_level?: 'normal' | 'low' | 'critical'
          last_rebalance?: string
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'price' | 'transaction' | 'security' | 'liquidity' | 'system'
          priority: 'low' | 'medium' | 'high'
          title: string
          message: string
          is_read: boolean
          action_url: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'price' | 'transaction' | 'security' | 'liquidity' | 'system'
          priority: 'low' | 'medium' | 'high'
          title: string
          message: string
          is_read?: boolean
          action_url?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'price' | 'transaction' | 'security' | 'liquidity' | 'system'
          priority?: 'low' | 'medium' | 'high'
          title?: string
          message?: string
          is_read?: boolean
          action_url?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      portfolio_snapshots: {
        Row: {
          id: string
          user_id: string
          total_value: number
          total_value_change: number
          total_tokens: number
          token_change: number
          active_chains: number
          connected_wallets: number
          liquidity_value: number
          liquidity_positions: number
          chain_balances: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_value: number
          total_value_change: number
          total_tokens: number
          token_change: number
          active_chains: number
          connected_wallets: number
          liquidity_value: number
          liquidity_positions: number
          chain_balances: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_value?: number
          total_value_change?: number
          total_tokens?: number
          token_change?: number
          active_chains?: number
          connected_wallets?: number
          liquidity_value?: number
          liquidity_positions?: number
          chain_balances?: Json
          created_at?: string
        }
      }
      trading_history: {
        Row: {
          id: string
          user_id: string
          symbol: string
          type: 'buy' | 'sell' | 'swap'
          amount: string
          price: number
          total_value: number
          fee: string
          status: 'pending' | 'completed' | 'failed' | 'cancelled'
          chain_id: number
          transaction_hash: string | null
          pnl: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          symbol: string
          type: 'buy' | 'sell' | 'swap'
          amount: string
          price: number
          total_value: number
          fee: string
          status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          chain_id: number
          transaction_hash?: string | null
          pnl?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          symbol?: string
          type?: 'buy' | 'sell' | 'swap'
          amount?: string
          price?: number
          total_value?: number
          fee?: string
          status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          chain_id?: number
          transaction_hash?: string | null
          pnl?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      bridge_transfers: {
        Row: {
          id: string
          user_id: string
          from_chain: number
          to_chain: number
          from_address: string
          to_address: string
          amount: string
          token_symbol: string
          status: 'pending' | 'processing' | 'completed' | 'failed'
          source_tx_hash: string | null
          destination_tx_hash: string | null
          fee: string
          estimated_time: number | null
          actual_time: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          from_chain: number
          to_chain: number
          from_address: string
          to_address: string
          amount: string
          token_symbol: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          source_tx_hash?: string | null
          destination_tx_hash?: string | null
          fee: string
          estimated_time?: number | null
          actual_time?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          from_chain?: number
          to_chain?: number
          from_address?: string
          to_address?: string
          amount?: string
          token_symbol?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          source_tx_hash?: string | null
          destination_tx_hash?: string | null
          fee?: string
          estimated_time?: number | null
          actual_time?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          user_id: string | null
          event_type: string
          event_data: Json
          session_id: string | null
          user_agent: string | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: string
          event_data: Json
          session_id?: string | null
          user_agent?: string | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: string
          event_data?: Json
          session_id?: string | null
          user_agent?: string | null
          ip_address?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      wallet_type: 'metamask' | 'phantom' | 'walletconnect' | 'internet-identity'
      transaction_type: 'transfer' | 'bridge' | 'swap' | 'liquidity' | 'mint' | 'burn'
      transaction_status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
      notification_type: 'price' | 'transaction' | 'security' | 'liquidity' | 'system'
      notification_priority: 'low' | 'medium' | 'high'
      alert_condition: 'above' | 'below' | 'change'
      warning_level: 'normal' | 'low' | 'critical'
      trading_type: 'buy' | 'sell' | 'swap'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}