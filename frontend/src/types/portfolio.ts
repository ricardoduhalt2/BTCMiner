export interface PortfolioData {
  totalValue: number
  totalValueChange: number
  totalTokens: number
  tokenChange: number
  activeChains: number
  connectedWallets: number
  liquidityValue: number
  liquidityPositions: number
  chainBalances: Record<string, ChainBalance>
}

export interface ChainBalance {
  chainId: number
  chainName: string
  balance: string
  usdValue: number
  percentage: number
}