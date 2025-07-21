import { useCallback, useEffect, useState } from 'react'
import { useAppSelector } from './redux'
import { walletManager } from '@services/walletManager'

interface TokenBalance {
  symbol: string
  balance: string
  usdValue: number
  decimals: number
  contractAddress?: string
}

interface ChainBalance {
  chainId: number
  chainName: string
  nativeBalance: string
  tokens: TokenBalance[]
  totalUsdValue: number
}

export const useBalances = () => {
  const { connectedWallets } = useAppSelector(state => state.wallet)
  const [balances, setBalances] = useState<Record<string, ChainBalance>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBalances = useCallback(async () => {
    if (connectedWallets.length === 0) {
      setBalances({})
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const balancePromises = connectedWallets.map(async (wallet) => {
        const chainBalance: ChainBalance = {
          chainId: wallet.chainId,
          chainName: wallet.chainName,
          nativeBalance: wallet.balance,
          tokens: [],
          totalUsdValue: 0
        }

        try {
          // Get native token price and calculate USD value
          const nativeTokenPrice = await fetchTokenPrice(wallet.chainId, 'native')
          const nativeUsdValue = parseFloat(wallet.balance) * nativeTokenPrice

          // For Solana wallets, get SPL token balances
          if (wallet.type === 'phantom' && wallet.publicKey) {
            const phantomAdapter = walletManager['adapters'].get('phantom')
            if (phantomAdapter && phantomAdapter.getTokenAccounts) {
              const tokenAccounts = await phantomAdapter.getTokenAccounts(wallet.publicKey)
              
              chainBalance.tokens = await Promise.all(
                tokenAccounts.map(async (account) => {
                  const tokenPrice = await fetchTokenPrice(wallet.chainId, account.mint)
                  return {
                    symbol: await getTokenSymbol(account.mint),
                    balance: account.amount.toString(),
                    usdValue: account.amount * tokenPrice,
                    decimals: account.decimals,
                    contractAddress: account.mint
                  }
                })
              )
            }
          }

          // For EVM wallets, get ERC-20 token balances
          if (['metamask', 'walletconnect'].includes(wallet.type)) {
            // In a real implementation, you would fetch ERC-20 balances here
            // This would involve calling the blockchain to get token balances
            chainBalance.tokens = await fetchERC20Balances(wallet.address, wallet.chainId)
          }

          // Calculate total USD value
          chainBalance.totalUsdValue = nativeUsdValue + 
            chainBalance.tokens.reduce((sum, token) => sum + token.usdValue, 0)

        } catch (error) {
          console.warn(`Failed to fetch detailed balance for ${wallet.type}:`, error)
        }

        return { walletId: wallet.id, balance: chainBalance }
      })

      const results = await Promise.all(balancePromises)
      const newBalances: Record<string, ChainBalance> = {}
      
      results.forEach(({ walletId, balance }) => {
        newBalances[walletId] = balance
      })

      setBalances(newBalances)
    } catch (error: any) {
      setError(error.message || 'Failed to fetch balances')
    } finally {
      setIsLoading(false)
    }
  }, [connectedWallets])

  // Auto-refresh balances
  useEffect(() => {
    fetchBalances()
    
    // Set up periodic refresh
    const interval = setInterval(fetchBalances, 30000) // Refresh every 30 seconds
    
    return () => clearInterval(interval)
  }, [fetchBalances])

  // Listen for wallet manager balance updates
  useEffect(() => {
    const handleBalancesUpdated = () => {
      fetchBalances()
    }

    walletManager.on('balances:updated', handleBalancesUpdated)
    
    return () => {
      walletManager.off('balances:updated', handleBalancesUpdated)
    }
  }, [fetchBalances])

  const getTotalPortfolioValue = useCallback((): number => {
    return Object.values(balances).reduce((total, balance) => total + balance.totalUsdValue, 0)
  }, [balances])

  const getBalancesByChain = useCallback((chainId: number): ChainBalance | null => {
    const chainBalance = Object.values(balances).find(b => b.chainId === chainId)
    return chainBalance || null
  }, [balances])

  const refreshBalances = useCallback(() => {
    fetchBalances()
  }, [fetchBalances])

  return {
    balances,
    isLoading,
    error,
    getTotalPortfolioValue,
    getBalancesByChain,
    refreshBalances,
  }
}

// Helper functions (these would be implemented with real API calls)
async function fetchTokenPrice(chainId: number, tokenAddress: string): Promise<number> {
  try {
    // Mock implementation - in reality, you'd call a price API like CoinGecko
    if (tokenAddress === 'native') {
      // Return mock prices for native tokens
      const nativePrices: Record<number, number> = {
        1: 2000,    // ETH
        56: 300,    // BNB
        8453: 2000, // ETH on Base
        101: 100,   // SOL
      }
      return nativePrices[chainId] || 0
    }
    
    // For other tokens, return mock price
    return Math.random() * 100
  } catch (error) {
    console.warn('Failed to fetch token price:', error)
    return 0
  }
}

async function getTokenSymbol(tokenAddress: string): Promise<string> {
  try {
    // Mock implementation - in reality, you'd query the token contract or a token list
    const knownTokens: Record<string, string> = {
      // Add known token addresses and their symbols
    }
    
    return knownTokens[tokenAddress] || 'UNKNOWN'
  } catch (error) {
    console.warn('Failed to get token symbol:', error)
    return 'UNKNOWN'
  }
}

async function fetchERC20Balances(address: string, chainId: number): Promise<TokenBalance[]> {
  try {
    // Mock implementation - in reality, you'd use a service like Moralis, Alchemy, or Covalent
    // to fetch all ERC-20 token balances for an address
    return []
  } catch (error) {
    console.warn('Failed to fetch ERC-20 balances:', error)
    return []
  }
}