import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { LiquidityPosition } from '../../types/liquidity'
import LoadingSpinner from '../common/LoadingSpinner'

interface LiquidityPositionsProps {
  positions: LiquidityPosition[]
  isLoading: boolean
}

const LiquidityPositions: React.FC<LiquidityPositionsProps> = ({
  positions,
  isLoading
}) => {
  const [sortBy, setSortBy] = useState<'liquidity' | 'apy' | 'rewards'>('liquidity')
  const [filterChain, setFilterChain] = useState<number | 'all'>('all')

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  const filteredPositions = positions.filter(pos => 
    filterChain === 'all' || pos.chainId === filterChain
  )

  const sortedPositions = [...filteredPositions].sort((a, b) => {
    switch (sortBy) {
      case 'liquidity':
        return parseFloat(b.liquidity) - parseFloat(a.liquidity)
      case 'apy':
        return b.apy - a.apy
      case 'rewards':
        return parseFloat(b.rewards) - parseFloat(a.rewards)
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

  const getChainColor = (chainId: number) => {
    switch (chainId) {
      case 1: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 56: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 137: return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
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
            value={filterChain}
            onChange={(e) => setFilterChain(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Chains</option>
            <option value={1}>Ethereum</option>
            <option value={56}>BSC</option>
            <option value={137}>Polygon</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="liquidity">Sort by Liquidity</option>
            <option value="apy">Sort by APY</option>
            <option value="rewards">Sort by Rewards</option>
          </select>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          {sortedPositions.length} position{sortedPositions.length !== 1 ? 's' : ''}
        </div>
      </motion.div>

      {/* Positions Grid */}
      {sortedPositions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">≋</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No liquidity positions found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Start by adding liquidity to earn rewards
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedPositions.map((position, index) => (
            <motion.div
              key={position.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-200"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 dark:text-orange-400 text-sm font-medium">
                        {position.tokenA[0]}
                      </span>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center -ml-2">
                      <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                        {position.tokenB[0]}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {position.tokenA}/{position.tokenB}
                    </h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getChainColor(position.chainId)}`}>
                      {getChainName(position.chainId)}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    ${position.liquidity}
                  </div>
                  <div className="text-sm text-gray-500">
                    {(position.share * 100).toFixed(3)}% share
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">APY</div>
                  <div className={`text-lg font-semibold ${
                    position.apy > 15 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {position.apy.toFixed(1)}%
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Rewards</div>
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                    ${position.rewards}
                  </div>
                </div>
              </div>

              {/* Impermanent Loss */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Impermanent Loss
                  </span>
                  <span className={`text-sm font-medium ${
                    position.impermanentLoss < 0 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {position.impermanentLoss > 0 ? '+' : ''}{position.impermanentLoss.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      position.impermanentLoss < 0 ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ 
                      width: `${Math.min(Math.abs(position.impermanentLoss) * 10, 100)}%` 
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Add More
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Remove
                </motion.button>
              </div>

              {/* Created Date */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500">
                  Created {position.createdAt.toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LiquidityPositions