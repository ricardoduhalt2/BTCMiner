export interface PriceData {
  timestamp: Date
  price: number
  volume24h: number
  marketCap: number
  change1h: number
  change24h: number
  change7d: number
}

export interface PriceAlert {
  id: string
  userId: string
  symbol: string
  condition: 'above' | 'below' | 'change'
  targetPrice?: number
  changePercentage?: number
  isActive: boolean
  createdAt: Date
  triggeredAt?: Date
}