export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export interface Chain {
  id: number
  name: string
  symbol: string
  iconUrl: string
  rpcUrl: string
  blockExplorerUrl: string
  isTestnet: boolean
}

export interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  iconUrl: string
  chainId: number
}

export interface Transaction {
  id: string
  hash: string
  type: 'transfer' | 'bridge' | 'swap' | 'liquidity' | 'mint' | 'burn'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  fromChain: string
  toChain?: string
  fromAddress: string
  toAddress: string
  amount: string
  token: Token
  gasUsed?: string
  gasPrice?: string
  fee: string
  timestamp: Date
  blockNumber?: number
  confirmations?: number
  estimatedTime?: number
  actualTime?: number
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  priceAlerts: boolean
  transactionUpdates: boolean
  liquidityWarnings: boolean
  securityAlerts: boolean
}

export interface UserPreferences {
  defaultChain: string
  currency: 'USD' | 'EUR' | 'BTC' | 'ETH'
  language: string
  timezone: string
  notifications: NotificationSettings
  privacy: {
    shareAnalytics: boolean
    shareUsageData: boolean
    publicProfile: boolean
  }
}

export interface User {
  id: string
  address?: string
  internetIdentityPrincipal?: string
  preferences: UserPreferences
  createdAt: Date
  lastActiveAt: Date
  isVerified: boolean
}

export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  key: string
  direction: SortDirection
}

export interface FilterConfig {
  [key: string]: any
}

export interface TableColumn<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, item: T) => React.ReactNode
  width?: string
}

export interface ChartDataPoint {
  timestamp: Date
  value: number
  label?: string
}

export interface TimeRange {
  start: Date
  end: Date
  label: string
}