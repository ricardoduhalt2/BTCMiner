import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LiquidityPool } from '../../types/liquidity'
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

interface LiquidityHealthMonitorProps {
  pools: LiquidityPool[]
  isLoading?: boolean
  onRebalanceRequest?: (poolAddress: string) => void
}

const LiquidityHealthMonitor: React.FC<LiquidityHealthMonitorProps> = ({
  pools,
  isLoading = false,
  onRebalanceRequest
}) => {
  const [selectedPool, setSelectedPool] = useState<LiquidityPool | null>(null)
  const [healthTrend, setHealthTrend] = useState<Record<string, 'up' | 'down' | 'stable'>>({})

  // Simulate health trend tracking
  useEffect(() => {
    const trends: Record<string, 'up' | 'down' | 'stable'> = {}
    pools.forEach(pool => {
      const random = Math.random()
      if (random < 0.3) trends[pool.address] = 'down'
      else if (random < 0.6) trends[pool.address] = 'up'
      else trends[pool.address] = 'stable'
    })
    setHealthTrend(trends)
  }, [pools])

  const getHealthColor = (warningLevel: string) => {
    switch (warningLevel) {
      case 'normal': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'low': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getHealthIcon = (warningLevel: string) => {
    switch (warningLevel) {
      case 'normal': return <CheckCircleIcon className="w-5 h-5" />
      case 'low': return <ClockIcon className="w-5 h-5" />
      case 'critical': return <ExclamationTriangleIcon className="w-5 h-5" />
      default: return <ChartBarIcon className="w-5 h-5" />
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
      case 'down': return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />
    }
  }

  const criticalPools = pools.filter(pool => pool.warningLevel === 'critical')
  const lowHealthPools = pools.filter(pool => pool.warningLevel === 'low')
  const healthyPools = pools.filter(pool => pool.warningLevel === 'normal')

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
          Liquidity Health Monitor
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <ClockIcon className="w-4 h-4" />
          <span>Updated 2 min ago</span>
        </div>
      </div>

      {/* Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">Healthy Pools</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{healthyPools.length}</p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Low Health</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{lowHealthPools.length}</p>
            </div>
            <ClockIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">Critical</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{criticalPools.length}</p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
          </div>
        </motion.div>
      </div>

      {/* Critical Alerts */}
      {criticalPools.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
        >
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-300 mb-1">
                Critical Health Alert
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                {criticalPools.length} pool{criticalPools.length > 1 ? 's' : ''} require immediate attention
              </p>
              <div className="space-y-1">
                {criticalPools.map(pool => (
                  <div key={pool.address} className="text-sm text-red-600 dark:text-red-400">
                    • Pool {pool.address.slice(0, 8)}... (Health: {pool.healthScore}%)
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pool List */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Pool Health Details</h4>
        {pools.map((pool, index) => (
          <motion.div
            key={pool.address}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedPool?.address === pool.address 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setSelectedPool(selectedPool?.address === pool.address ? null : pool)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${getHealthColor(pool.warningLevel)}`}>
                  {getHealthIcon(pool.warningLevel)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Pool {pool.address.slice(0, 8)}...{pool.address.slice(-6)}
                    </p>
                    {getTrendIcon(healthTrend[pool.address] || 'stable')}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Chain ID: {pool.chainId} • Utilization: {pool.utilizationRate.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className={`text-lg font-bold ${
                    pool.healthScore >= 80 ? 'text-green-600' :
                    pool.healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {pool.healthScore}%
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  APY: {pool.apy.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Expanded Details */}
            {selectedPool?.address === pool.address && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Pool Metrics</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Total Liquidity:</span>
                        <span className="text-gray-900 dark:text-gray-100">${parseFloat(pool.totalLiquidity).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Available:</span>
                        <span className="text-gray-900 dark:text-gray-100">${parseFloat(pool.availableLiquidity).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Last Rebalance:</span>
                        <span className="text-gray-900 dark:text-gray-100">
                          {new Date(pool.lastRebalance).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Health Indicators</h5>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Health Score</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                pool.healthScore >= 80 ? 'bg-green-500' :
                                pool.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${pool.healthScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{pool.healthScore}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Utilization</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-blue-500"
                              style={{ width: `${pool.utilizationRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{pool.utilizationRate.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {(pool.warningLevel === 'critical' || pool.warningLevel === 'low') && onRebalanceRequest && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onRebalanceRequest(pool.address)
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                    >
                      Request Rebalance
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {pools.length === 0 && (
        <div className="text-center py-8">
          <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No liquidity pools found</p>
        </div>
      )}
    </div>
  )
}

export default LiquidityHealthMonitor