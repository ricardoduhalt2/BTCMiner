import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { LiquidityPool } from '../../types/liquidity'
import LoadingSpinner from '../common/LoadingSpinner'

interface LiquidityPoolsProps {
  pools: LiquidityPool[]
  isLoading: boolean
}

const LiquidityPools: React.FC<LiquidityPoolsProps> = ({
  pools,
  isLoading
}) => {
  const [sortBy, setSortBy] = useState<'liquidity' | 'apy' | 'health'>('liquidity')
  const [filterWarning, setFilterWarning] = useState<'all' | 'normal' | 'low' | 'critical'>('all')

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  const filteredPools = pools.filter(pool => 
    filterWarning === 'all' || pool.warningLevel === filterWarning
  )

  const sortedPools = [...filteredPools].sort((a, b) => {
    switch (sortBy) {
      case 'liquidity':
        return parseFloat(b.totalLiquidity) - parseFloat(a.totalLiquidity)
      case 'apy':
        return b.apy - a.apy
      case 'health':
        return b.healthScore - a.healthScore
      default:
        return 0
    }
  })

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1: return 'Ethereum'
      case 56: return 'BSC'
      case 137: return 'Polygon'
      default: return `Chain ${chainId}`
    }
  }

  const getWarningColor = (level: string) => {
    switch (level) {
      case 'normal':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'low':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const formatLiquidity = (amount: string) => {
    const num = parseFloat(amount)
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`
    }
    return `$${num.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div className="flex flex-wrap gap-3">
          <select
            value={filterWarning}
            onChange={(e) => setFilterWarning(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Pools</option>
            <option value="normal">Healthy</option>
            <option value="low">Warning</option>
            <option value="critical">Critical</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="liquidity">Sort by Liquidity</option>
            <option value="apy">Sort by APY</option>
            <option value="health">Sort by Health</option>
          </select>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          {sortedPools.length} pool{sortedPools.length !== 1 ? 's' : ''}
        </div>
      </motion.div>

      {/* Pools List */}
      {sortedPools.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">≋</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No pools found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your filters
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {sortedPools.map((pool, index) => (
            <motion.div
              key={pool.address}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-200"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Pool Info */}
                <div className="lg:col-span-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {getChainName(pool.chainId)[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {getChainName(pool.chainId)} Pool
                      </h3>
                      <p className="text-sm text-gray-500 font-mono">
                        {pool.address.slice(0, 6)}...{pool.address.slice(-4)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Liquidity */}
                <div className="lg:col-span-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Liquidity</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {formatLiquidity(pool.totalLiquidity)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Available: {formatLiquidity(pool.availableLiquidity)}
                  </div>
                </div>

                {/* Utilization */}
                <div className="lg:col-span-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Utilization</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {pool.utilizationRate}%
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                    <div 
                      className={`h-2 rounded-full ${
                        pool.utilizationRate > 85 
                          ? 'bg-red-500' 
                          : pool.utilizationRate > 70 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${pool.utilizationRate}%` }}
                    />
                  </div>
                </div>

                {/* APY */}
                <div className="lg:col-span-1">
                  <div className="text-sm text-gray-600 dark:text-gray-400">APY</div>
                  <div className={`text-lg font-semibold ${
                    pool.apy > 15 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {pool.apy.toFixed(1)}%
                  </div>
                </div>

                {/* Health Score */}
                <div className="lg:col-span-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Health Score</div>
                  <div className={`text-lg font-semibold ${getHealthColor(pool.healthScore)}`}>
                    {pool.healthScore}/100
                  </div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getWarningColor(pool.warningLevel)}`}>
                    {pool.warningLevel.charAt(0).toUpperCase() + pool.warningLevel.slice(1)}
                  </span>
                </div>

                {/* Actions */}
                <div className="lg:col-span-2">
                  <div className="flex flex-col space-y-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
                    >
                      Add Liquidity
                    </motion.button>
                    <div className="text-xs text-gray-500">
                      Last rebalance: {pool.lastRebalance.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning Message for Critical Pools */}
              {pool.warningLevel === 'critical' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-red-500">⚠</span>
                    <span className="text-sm text-red-700 dark:text-red-400 font-medium">
                      Critical pool health detected. Consider rebalancing or reducing exposure.
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LiquidityPools