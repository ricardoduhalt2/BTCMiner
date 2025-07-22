import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LiquidityPool, LiquidityPosition } from '../../types/liquidity'
import { 
  ArrowPathIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'

interface RebalanceStrategy {
  id: string
  name: string
  description: string
  threshold: number
  enabled: boolean
  lastExecuted?: string
}

interface RebalanceRecommendation {
  poolAddress: string
  currentRatio: number
  targetRatio: number
  action: 'add' | 'remove' | 'rebalance'
  amount: string
  estimatedGas: string
  priority: 'high' | 'medium' | 'low'
  reason: string
}

interface LiquidityRebalancingProps {
  pools: LiquidityPool[]
  positions: LiquidityPosition[]
  isLoading?: boolean
  onExecuteRebalance?: (poolAddress: string, action: string, amount: string) => Promise<void>
  onUpdateStrategy?: (strategy: RebalanceStrategy) => void
}

const LiquidityRebalancing: React.FC<LiquidityRebalancingProps> = ({
  pools,
  positions,
  isLoading = false,
  onExecuteRebalance,
  onUpdateStrategy
}) => {
  const [strategies, setStrategies] = useState<RebalanceStrategy[]>([
    {
      id: 'auto-20',
      name: 'Auto Rebalance (20%)',
      description: 'Automatically rebalance when liquidity drops below 20%',
      threshold: 20,
      enabled: true,
      lastExecuted: '2024-01-15T10:30:00Z'
    },
    {
      id: 'emergency-5',
      name: 'Emergency Rebalance (5%)',
      description: 'Emergency rebalancing for critical liquidity levels',
      threshold: 5,
      enabled: true
    },
    {
      id: 'optimal-50',
      name: 'Optimal Balance (50%)',
      description: 'Maintain optimal 50% liquidity distribution',
      threshold: 50,
      enabled: false
    }
  ])

  const [recommendations, setRecommendations] = useState<RebalanceRecommendation[]>([])
  const [isExecuting, setIsExecuting] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  // Generate rebalancing recommendations
  useEffect(() => {
    const newRecommendations: RebalanceRecommendation[] = []
    
    pools.forEach(pool => {
      const utilizationRate = pool.utilizationRate
      const availableRatio = (parseFloat(pool.availableLiquidity) / parseFloat(pool.totalLiquidity)) * 100
      
      if (pool.warningLevel === 'critical') {
        newRecommendations.push({
          poolAddress: pool.address,
          currentRatio: availableRatio,
          targetRatio: 30,
          action: 'add',
          amount: (parseFloat(pool.totalLiquidity) * 0.2).toFixed(2),
          estimatedGas: '0.015',
          priority: 'high',
          reason: 'Critical liquidity shortage detected'
        })
      } else if (pool.warningLevel === 'low') {
        newRecommendations.push({
          poolAddress: pool.address,
          currentRatio: availableRatio,
          targetRatio: 25,
          action: 'add',
          amount: (parseFloat(pool.totalLiquidity) * 0.1).toFixed(2),
          estimatedGas: '0.008',
          priority: 'medium',
          reason: 'Low liquidity levels require attention'
        })
      } else if (availableRatio > 80) {
        newRecommendations.push({
          poolAddress: pool.address,
          currentRatio: availableRatio,
          targetRatio: 50,
          action: 'remove',
          amount: (parseFloat(pool.totalLiquidity) * 0.3).toFixed(2),
          estimatedGas: '0.012',
          priority: 'low',
          reason: 'Excess liquidity can be optimized'
        })
      }
    })
    
    setRecommendations(newRecommendations)
  }, [pools])

  const handleExecuteRebalance = async (recommendation: RebalanceRecommendation) => {
    if (!onExecuteRebalance) return
    
    setIsExecuting(recommendation.poolAddress)
    try {
      await onExecuteRebalance(
        recommendation.poolAddress,
        recommendation.action,
        recommendation.amount
      )
    } catch (error) {
      console.error('Rebalance failed:', error)
    } finally {
      setIsExecuting(null)
    }
  }

  const handleToggleStrategy = (strategyId: string) => {
    setStrategies(prev => prev.map(strategy => 
      strategy.id === strategyId 
        ? { ...strategy, enabled: !strategy.enabled }
        : strategy
    ))
  }

  const handleUpdateThreshold = (strategyId: string, threshold: number) => {
    setStrategies(prev => prev.map(strategy => 
      strategy.id === strategyId 
        ? { ...strategy, threshold }
        : strategy
    ))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'add': return '+'
      case 'remove': return '-'
      case 'rebalance': return '⚖️'
      default: return '•'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Liquidity Rebalancing
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <CogIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Strategy Settings */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
        >
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Rebalancing Strategies</h4>
          <div className="space-y-4">
            {strategies.map(strategy => (
              <div key={strategy.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleToggleStrategy(strategy.id)}
                    className={`p-1 rounded ${
                      strategy.enabled 
                        ? 'text-green-600 hover:text-green-700' 
                        : 'text-gray-400 hover:text-gray-500'
                    }`}
                  >
                    {strategy.enabled ? <PlayIcon className="w-4 h-4" /> : <PauseIcon className="w-4 h-4" />}
                  </button>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{strategy.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{strategy.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="5"
                    max="80"
                    value={strategy.threshold}
                    onChange={(e) => handleUpdateThreshold(strategy.id, parseInt(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-8">
                    {strategy.threshold}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Active Strategies Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Active Strategies</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {strategies.filter(s => s.enabled).length}
              </p>
            </div>
            <AdjustmentsHorizontalIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">Recommendations</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {recommendations.length}
              </p>
            </div>
            <ArrowPathIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Auto Rebalances</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {strategies.filter(s => s.enabled && s.lastExecuted).length}
              </p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">Rebalancing Recommendations</h4>
        
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">All pools are optimally balanced</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.poolAddress}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                        {rec.priority.toUpperCase()}
                      </span>
                      <span className="text-lg font-mono">
                        {getActionIcon(rec.action)}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        Pool {rec.poolAddress.slice(0, 8)}...{rec.poolAddress.slice(-6)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {rec.reason}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Current Ratio:</span>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {rec.currentRatio.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Target Ratio:</span>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {rec.targetRatio}%
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          ${parseFloat(rec.amount).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Est. Gas:</span>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {rec.estimatedGas} ETH
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <button
                      onClick={() => handleExecuteRebalance(rec)}
                      disabled={isExecuting === rec.poolAddress}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        rec.priority === 'high'
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : rec.priority === 'medium'
                          ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isExecuting === rec.poolAddress ? (
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="w-4 h-4 animate-spin" />
                          <span>Executing...</span>
                        </div>
                      ) : (
                        `Execute ${rec.action}`
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Recent Rebalancing Activity</h4>
        <div className="space-y-2">
          {strategies
            .filter(s => s.lastExecuted)
            .map(strategy => (
              <div key={strategy.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span className="text-gray-900 dark:text-gray-100">{strategy.name}</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400">
                  {strategy.lastExecuted && new Date(strategy.lastExecuted).toLocaleString()}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default LiquidityRebalancing