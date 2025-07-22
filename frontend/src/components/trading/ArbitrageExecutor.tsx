import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BoltIcon,
  ArrowRightIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface ArbitrageOpportunity {
  id: string
  tokenPair: string
  buyChain: {
    name: string
    chainId: number
    price: number
    liquidity: string
    exchange: string
  }
  sellChain: {
    name: string
    chainId: number
    price: number
    liquidity: string
    exchange: string
  }
  priceDifference: number
  profitPercentage: number
  estimatedProfit: number
  gasEstimate: number
  minAmount: number
  maxAmount: number
  timeWindow: number // seconds
  riskLevel: 'low' | 'medium' | 'high'
  isActive: boolean
}

interface ArbitrageExecutorProps {
  opportunities?: ArbitrageOpportunity[]
  onExecuteArbitrage?: (opportunityId: string, amount: number) => Promise<void>
}

const ArbitrageExecutor: React.FC<ArbitrageExecutorProps> = ({
  opportunities = [
    {
      id: '1',
      tokenPair: 'BTM/ETH',
      buyChain: {
        name: 'BNB Chain',
        chainId: 56,
        price: 0.4245,
        liquidity: '125,000',
        exchange: 'PancakeSwap'
      },
      sellChain: {
        name: 'Ethereum',
        chainId: 1,
        price: 0.4521,
        liquidity: '89,000',
        exchange: 'Uniswap'
      },
      priceDifference: 0.0276,
      profitPercentage: 6.5,
      estimatedProfit: 245.8,
      gasEstimate: 0.025,
      minAmount: 100,
      maxAmount: 5000,
      timeWindow: 180,
      riskLevel: 'medium',
      isActive: true
    },
    {
      id: '2',
      tokenPair: 'BTM/SOL',
      buyChain: {
        name: 'Solana',
        chainId: 101,
        price: 0.004521,
        liquidity: '67,500',
        exchange: 'Raydium'
      },
      sellChain: {
        name: 'Base',
        chainId: 8453,
        price: 0.004789,
        liquidity: '45,200',
        exchange: 'BaseSwap'
      },
      priceDifference: 0.000268,
      profitPercentage: 5.9,
      estimatedProfit: 189.3,
      gasEstimate: 0.008,
      minAmount: 50,
      maxAmount: 3000,
      timeWindow: 120,
      riskLevel: 'high',
      isActive: true
    },
    {
      id: '3',
      tokenPair: 'BTM/BNB',
      buyChain: {
        name: 'Ethereum',
        chainId: 1,
        price: 0.001456,
        liquidity: '234,000',
        exchange: 'Uniswap'
      },
      sellChain: {
        name: 'BNB Chain',
        chainId: 56,
        price: 0.001523,
        liquidity: '156,000',
        exchange: 'PancakeSwap'
      },
      priceDifference: 0.000067,
      profitPercentage: 4.6,
      estimatedProfit: 156.7,
      gasEstimate: 0.018,
      minAmount: 200,
      maxAmount: 8000,
      timeWindow: 240,
      riskLevel: 'low',
      isActive: true
    }
  ],
  onExecuteArbitrage
}) => {
  const [selectedOpportunity, setSelectedOpportunity] = useState<ArbitrageOpportunity | null>(null)
  const [arbitrageAmount, setArbitrageAmount] = useState('')
  const [isExecuting, setIsExecuting] = useState<string | null>(null)
  const [executionHistory, setExecutionHistory] = useState<Array<{
    id: string
    opportunityId: string
    amount: number
    profit: number
    status: 'success' | 'failed' | 'pending'
    timestamp: string
  }>>([])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update time windows
      opportunities.forEach(opp => {
        if (opp.timeWindow > 0) {
          opp.timeWindow -= 1
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [opportunities])

  const handleExecuteArbitrage = async (opportunity: ArbitrageOpportunity) => {
    const amount = parseFloat(arbitrageAmount)
    if (!amount || amount < opportunity.minAmount || amount > opportunity.maxAmount) return

    setIsExecuting(opportunity.id)
    try {
      if (onExecuteArbitrage) {
        await onExecuteArbitrage(opportunity.id, amount)
      }

      // Add to execution history
      const execution = {
        id: Date.now().toString(),
        opportunityId: opportunity.id,
        amount,
        profit: (amount * opportunity.profitPercentage) / 100,
        status: 'success' as const,
        timestamp: new Date().toISOString()
      }
      setExecutionHistory(prev => [execution, ...prev])

      setSelectedOpportunity(null)
      setArbitrageAmount('')
    } catch (error) {
      console.error('Arbitrage execution failed:', error)
    } finally {
      setIsExecuting(null)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getChainLogo = (chainId: number) => {
    const logos: Record<number, string> = {
      1: '🔷', // Ethereum
      56: '🟡', // BNB
      8453: '🔵', // Base
      101: '🟣' // Solana
    }
    return logos[chainId] || '⚪'
  }

  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const activeOpportunities = opportunities.filter(opp => opp.isActive && opp.timeWindow > 0)
  const totalPotentialProfit = activeOpportunities.reduce((sum, opp) => sum + opp.estimatedProfit, 0)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BoltIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Arbitrage Executor
          </h3>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="text-gray-500 dark:text-gray-400">
            Active Opportunities: <span className="font-medium text-gray-900 dark:text-gray-100">
              {activeOpportunities.length}
            </span>
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            Potential Profit: <span className="font-medium text-green-600 dark:text-green-400">
              ${totalPotentialProfit.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4 mb-6">
        {activeOpportunities.length === 0 ? (
          <div className="text-center py-8">
            <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No arbitrage opportunities available</p>
          </div>
        ) : (
          activeOpportunities.map((opportunity, index) => (
            <motion.div
              key={opportunity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedOpportunity?.id === opportunity.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setSelectedOpportunity(opportunity)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {opportunity.tokenPair}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(opportunity.riskLevel)}`}>
                      {opportunity.riskLevel.toUpperCase()} RISK
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                      <ClockIcon className="w-4 h-4" />
                      <span>{formatTimeRemaining(opportunity.timeWindow)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    {/* Buy Side */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-2xl">{getChainLogo(opportunity.buyChain.chainId)}</span>
                        <div>
                          <p className="text-sm font-medium text-green-800 dark:text-green-300">
                            Buy on {opportunity.buyChain.name}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            {opportunity.buyChain.exchange}
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        ${opportunity.buyChain.price.toFixed(6)}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Liquidity: ${opportunity.buyChain.liquidity}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center justify-center">
                      <ArrowRightIcon className="w-8 h-8 text-gray-400" />
                    </div>

                    {/* Sell Side */}
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-2xl">{getChainLogo(opportunity.sellChain.chainId)}</span>
                        <div>
                          <p className="text-sm font-medium text-red-800 dark:text-red-300">
                            Sell on {opportunity.sellChain.name}
                          </p>
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {opportunity.sellChain.exchange}
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        ${opportunity.sellChain.price.toFixed(6)}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400">
                        Liquidity: ${opportunity.sellChain.liquidity}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Profit:</span>
                      <p className="font-medium text-green-600 dark:text-green-400">
                        {opportunity.profitPercentage.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Est. Profit:</span>
                      <p className="font-medium text-green-600 dark:text-green-400">
                        ${opportunity.estimatedProfit.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Gas Est:</span>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        ${opportunity.gasEstimate.toFixed(3)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Range:</span>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        ${opportunity.minAmount}-${opportunity.maxAmount}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedOpportunity(opportunity)
                    }}
                    disabled={isExecuting === opportunity.id}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    {isExecuting === opportunity.id ? 'Executing...' : 'Execute'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Execution Modal */}
      {selectedOpportunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center space-x-2 mb-4">
              <BoltIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Execute Arbitrage
              </h3>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Pair:</span>
                    <span className="font-medium">{selectedOpportunity.tokenPair}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Profit:</span>
                    <span className="font-medium text-green-600">
                      {selectedOpportunity.profitPercentage.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Time Left:</span>
                    <span className="font-medium text-orange-600">
                      {formatTimeRemaining(selectedOpportunity.timeWindow)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  value={arbitrageAmount}
                  onChange={(e) => setArbitrageAmount(e.target.value)}
                  placeholder={`${selectedOpportunity.minAmount} - ${selectedOpportunity.maxAmount}`}
                  min={selectedOpportunity.minAmount}
                  max={selectedOpportunity.maxAmount}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Range: ${selectedOpportunity.minAmount} - ${selectedOpportunity.maxAmount}
                </div>
              </div>

              {arbitrageAmount && parseFloat(arbitrageAmount) > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-green-600 dark:text-green-400">Estimated Profit:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        ${((parseFloat(arbitrageAmount) * selectedOpportunity.profitPercentage) / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600 dark:text-green-400">After Gas:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        ${((parseFloat(arbitrageAmount) * selectedOpportunity.profitPercentage) / 100 - selectedOpportunity.gasEstimate).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {selectedOpportunity.riskLevel === 'high' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800 dark:text-red-300 mb-1">High Risk</h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        This arbitrage opportunity has high risk due to low liquidity or high volatility.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setSelectedOpportunity(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExecuteArbitrage(selectedOpportunity)}
                disabled={
                  !arbitrageAmount || 
                  parseFloat(arbitrageAmount) < selectedOpportunity.minAmount ||
                  parseFloat(arbitrageAmount) > selectedOpportunity.maxAmount ||
                  isExecuting === selectedOpportunity.id
                }
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExecuting === selectedOpportunity.id ? 'Executing...' : 'Execute Arbitrage'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Execution History */}
      {executionHistory.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Recent Executions</h4>
          <div className="space-y-2">
            {executionHistory.slice(0, 3).map((execution) => (
              <div key={execution.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span className="text-gray-900 dark:text-gray-100">
                    ${execution.amount} arbitrage
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 dark:text-green-400">
                    +${execution.profit.toFixed(2)}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {new Date(execution.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ArbitrageExecutor