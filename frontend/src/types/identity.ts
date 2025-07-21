export interface UserProfile {
  principal: string
  wallets: WalletInfo[]
  createdAt: Date
  lastUpdated: Date
}

export interface WalletInfo {
  address: string
  chainId: number
  verified: boolean
  timestamp: Date
}