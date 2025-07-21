import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowsRightLeftIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline'
import { useAppDispatch } from '@hooks/redux'
import { addNotification } from '@store/slices/uiSlice'

interface ChainPrice {
  chainId: number
  chainName: string
  chainIcon: string
  price: number
  volume24h: number
  lastUpdate: Date
  exchange: string
  liquidity: number
}

interface ArbitrageOpportunity {
  id: string
  buyChain: ChainPrice
  sellChain: ChainPrice
  priceDifference: number
  profitPercentage: number
  estimatedProfit: number
  estimatedGasCost: number
  netProfit: number
  riskLevel: 'low' | 'medium' | 'high'
  timeToExecute: number // in minutes
  liquidityRisk: boolean
}

interface ArbitrageOpportunitiesProps {
  symbol?: string
  refreshInterval?: number
}

const ArbitrageOpportunities: React.FC<ArbitrageOpportunitiesProps> = ({
  symbol = 'BTM',
  refreshInterval = 30000 // 30 seconds
}) => {
  const dispatch = useAppDispatch()
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [selectedAmount, setSelectedAmount] = useState<number>(1000)

  // Mock chain prices data
  const mockChainPrices: ChainPrice[] = [
    {
      chainId: 1,
      chainName: 'Ethereum',
      chainIcon: '/icons/ethereum.svg',
      price: 25.75,
      volume24h: 2500000,
      lastUpdate: new Date(),
      exchange: 'Uniswap V3',
      liquidity: 5000000
    },
    {
      chainId: 56,
      chainName: 'BNB Chain',
      chainIcon: '/icons/bnb.svg',
      price: 25.82,
      volume24h: 1800000,
      lastUpdate: new Date(),
      exchange: 'PancakeSwap',
      liquidity: 3200000
    },
    {
      chainId: 8453,
      chainName: 'Base',
      chainIcon: '/icons/base.svg',
      price: 25.68,
      volume24h: 800000,
      lastUpdate: new Date(),
      exchange: 'BaseSwap',
      liquidity: 1500000
    },
    {
      chainId: 137,
      chainName: 'Polygon',
      chainIcon: '/icons/polygon.svg',
      price: 25.91,
      volume24h: 1200000,
      lastUpdate: new Date(),
      exchange: 'QuickSwap',
      liquidity: 2100000
    },
    {
      chainId: 42161,
      chainName: 'Arbitrum',
      chainIcon: '/icons/arbitrum.svg',
      price: 25.73,
      volume24h: 950000,
      lastUpdate: new Date(),
      exchange: 'Camelot',
      liquidity: 1800000
    }
  ]

  // Calculate arbitrage opportunities
  const calculateOpportunities = (chainPrices: ChainPrice[], amount: number) => {
    const opportunities: ArbitrageOpportunity[] = []

    for (let i = 0; i < chainPrices.length; i++) {
      for (let j = 0; j < chainPrices.length; j++) {
        if (i !== j) {
          const buyChain = chainPrices[i]
          const sellChain = chainPrices[j]
          
          if (sellChain.price > buyChain.price) {
            const priceDifference = sellChain.price - buyChain.price
            const profitPercentage = (priceDifference / buyChain.price) * 100
            const estimatedProfit = (amount / buyChain.price) * priceDifference
            
            // Mock gas costs (would be calculated based on current network conditions)
            const estimatedGasCost = getEstimatedGasCost(buyChain.chainId, sellChain.chainId)
            const netProfit = estimatedProfit - estimatedGasCost
            
            // Determine risk level
            const riskLevel = getRiskLevel(profitPercentage, buyChain.liquidity, sellChain.liquidity)
            
            // Check liquidity risk
            const liquidityRisk = amount > Math.min(buyChain.liquidity, sellChain.liquidity) * 0.1

            opportunities.push({
              id: `${buyChain.chainId}-${sellChain.chainId}`,
              buyChain,
              sellChain,
              priceDifference,
              profitPercentage,
              estimatedProfit,
              estimatedGasCost,
              netProfit,
              riskLevel,
              timeToExecute: getEstimatedTime(buyChain.chainId, sellChain.chainId),
              liquidityRisk
            })
          }
        }
      }
    }

    // Sort by net profit descending
    return opportunities
      .filter(opp => opp.netProfit > 0)
      .sort((a, b) => b.netProfit - a.netProfit)
      .slice(0, 10) // Top 10 opportunities
  }

  const getEstimatedGasCost = (fromChain: number, toChain: number) => {
    // Mock gas cost calculation
    const baseCosts: Record<number, number> = {
      1: 25,    // Ethereum
      56: 2,    // BNB Chain
      8453: 1,  // Base
      137: 0.5, // Polygon
      42161: 3  // Arbitrum
    }
    
    return (baseCosts[fromChain] || 5) + (baseCosts[toChain] || 5) + 10 // Bridge fee
  }

  const getRiskLevel = (profitPercentage: number, buyLiquidity: number, sellLiquidity: number): 'low' | 'medium' | 'high' => {
    const minLiquidity = Math.min(buyLiquidity, sellLiquidity)
    
    if (profitPercentage < 0.5 || minLiquidity < 1000000) return 'high'
    if (profitPercentage < 1.0 || minLiquidity < 2000000) return 'medium'
    return 'low'
  }

  const getEstimatedTime = (fromChain: number, toChain: number) => {
    // Mock time estimation based on chains
    const chainTimes: Record<number, number> = {
      1: 15,    // Ethereum
      56: 3,    // BNB Chain
      8453: 2,  // Base
      137: 2,   // Polygon
      42161: 10 // Arbitrum
    }
    
    return Math.max(chainTimes[fromChain] || 5, chainTimes[toChain] || 5) + 5 // Bridge time
  }

  // Update opportunities periodically
  useEffect(() => {
    const updateOpportunities = () => {
      setIsLoading(true)
      
      // Simulate API delay
      setTimeout(() => {
        const newOpportunities = calculateOpportunities(mockChainPrices, selectedAmount)
        setOpportunities(newOpportunities)
        setLastUpdate(new Date())
        setIsLoading(false)
      }, 1000)
    }

    updateOpportunities()
    const interval = setInterval(updateOpportunities, refreshInterval)

    return () => clearInterval(interval)
  }, [selectedAmount, refreshInterval])

  const handleExecuteArbitrage = (opportunity: ArbitrageOpportunity) => {
    dispatch(addNotification({
      type: 'info',
      message: `Arbitrage execution would be initiated: Buy on ${opportunity.buyChain.chainName}, sell on ${opportunity.sellChain.chainName}`
    }))
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value)
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    return `${diffInMinutes}m ago`
  }

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <ArrowsRightLeftIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Arbitrage Opportunities
          </h3>
          <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs font-medium px-2 py-1 rounded-full">
            {opportunities.length} found
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Amount:</label>
            <select
              value={selectedAmount}
              onChange={(e) => setSelectedAmount(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value={100}>$100</option>
              <option value={500}>$500</option>
              <option value={1000}>$1,000</option>
              <option value={5000}>$5,000</option>
              <option value={10000}>$10,000</option>
            </select>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Updated {formatTimeAgo(lastUpdate)}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Opportunities List */}
          <div className="space-y-4">
            {opportunities.length === 0 ? (
              <div className="text-center py-8">
                <ArrowTrendingUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No arbitrage opportunities
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Price differences are too small or gas costs are too high
                </p>
              </div>
            ) : (
              opportunities.map((opportunity) => (
                <motion.div
                  key={opportunity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Chain Icons and Arrow */}
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                          <img 
                            src={opportunity.buyChain.chainIcon} 
                            alt={opportunity.buyChain.chainName}
                            className="w-6 h-6"
                          />
                          <div className="text-sm">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {opportunity.buyChain.chainName}
                            </div>
                            <div className="text-green-600 dark:text-green-400">
                              Buy: {formatPrice(opportunity.buyChain.price)}
                            </div>
                          </div>
                        </div>
                        
                        <ArrowsRightLeftIcon className="h-4 w-4 text-gray-400" />
                        
                        <div className="flex items-center space-x-2">
                          <img 
                            src={opportunity.sellChain.chainIcon} 
                            alt={opportunity.sellChain.chainName}
                            className="w-6 h-6"
                          />
                          <div className="text-sm">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {opportunity.sellChain.chainName}
                            </div>
                            <div className="text-red-600 dark:text-red-400">
                              Sell: {formatPrice(opportunity.sellChain.price)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Profit Info */}
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          Net Profit: {formatPrice(opportunity.netProfit)}
                        </div>
                        <div className="text-green-600 dark:text-green-400">
                          +{opportunity.profitPercentage.toFixed(2)}%
                        </div>
                      </div>

                      {/* Risk and Time */}
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(opportunity.riskLevel)}`}>
                          {opportunity.riskLevel} risk
                        </span>
                        
                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                          <ClockIcon className="h-3 w-3" />
                          <span>~{opportunity.timeToExecute}m</span>
                        </div>

                        {opportunity.liquidityRisk && (
                          <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" title="Low liquidity warning" />
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleExecuteArbitrage(opportunity)}
                      className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                      <span>Execute</span>
                    </button>
                  </div>

                  {/* Additional Details */}
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="grid grid-cols-4 gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div>
                        <span className="block">Price Diff:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {formatPrice(opportunity.priceDifference)}
                        </span>
                      </div>
                      <div>
                        <span className="block">Est. Profit:</span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {formatPrice(opportunity.estimatedProfit)}
                        </span>
                      </div>
                      <div>
                        <span className="block">Gas Cost:</span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          {formatPrice(opportunity.estimatedGasCost)}
                        </span>
                      </div>
                      <div>
                        <span className="block">Min Liquidity:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          ${Math.min(opportunity.buyChain.liquidity, opportunity.sellChain.liquidity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Info Panel */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <InformationCircleIcon className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Arbitrage Information:</p>
                <ul className="space-y-1">
                  <li>• Opportunities are calculated in real-time based on current prices</li>
                  <li>• Gas costs and bridge fees are estimated and may vary</li>
                  <li>• High-risk opportunities may have slippage or liquidity issues</li>
                  <li>• Execute quickly as price differences can disappear rapidly</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ArbitrageOpportunities