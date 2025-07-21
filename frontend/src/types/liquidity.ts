export interface LiquidityPosition {
  id: string
  chainId: number
  poolAddress: string
  tokenA: string
  tokenB: string
  liquidity: string
  share: number
  apy: number
  rewards: string
  impermanentLoss: number
  createdAt: string // ISO string format
}

export interface LiquidityPool {
  chainId: number
  address: string
  totalLiquidity: string
  availableLiquidity: string
  utilizationRate: number
  apy: number
  healthScore: number
  warningLevel: 'normal' | 'low' | 'critical'
  lastRebalance: string // ISO string format
}