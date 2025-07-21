import React from 'react'
import { motion } from 'framer-motion'
import { LiquidityPosition, LiquidityPool } from '../../types/liquidity'
import LoadingSpinner from '../common/LoadingSpinner'

interface LiquidityOverviewProps {
  positions: LiquidityPosition[]
  pools: LiquidityPool[]
  totalLiquidity: number
  isLoading: boolean
}

const LiquidityOverview: React.FC<LiquidityOverviewProps> = ({
  positions,
  pools,
  totalLiquidity,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  const totalRewards = positions.reduce((sum, pos) => sum + parseFloat(pos.rewards), 0)
  const avgAPY = positions.length > 0 
    ? positions.reduce((sum, pos) => sum + pos.apy, 0) / positions.length 
    : 0
  const healthyPools = pools.filter(pool => pool.warningLevel === 'normal').length
  const criticalPools = pools.filter(pool => pool.warningLevel === 'critical').length

  const stats = [
    {
      title: 'Total Liquidity',
      value: `$${totalLiquidity.toLocaleString()}`,
      change: '+12.5%',
      positive: true,
      icon: '◇'
    },
    {
      title: 'Total Rewards',
      value: `$${totalRewards.toFixed(2)}`,
      change: '+8.2%',
      positive: true,
      icon: '◆'
    },
    {
      title: 'Average APY',
      value: `${avgAPY.toFixed(1)}%`,
      change: '+2.1%',
      positive: true,
      icon: '⟋'
    },
    {
      title: 'Active Positions',
      value: positions.length.toString(),
      change: '+1',
      positive: true,
      icon: '▦'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stat.value}
                </p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    stat.positive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pool Health Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Pool Health Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {healthyPools}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">Healthy Pools</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {pools.length - healthyPools - criticalPools}
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Warning Pools</div>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {criticalPools}
            </div>
            <div className="text-sm text-red-600 dark:text-red-400">Critical Pools</div>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {positions.slice(0, 3).map((position, index) => (
            <div key={position.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 dark:text-orange-400 text-sm font-medium">
                    {position.tokenA[0]}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {position.tokenA}/{position.tokenB}
                  </div>
                  <div className="text-sm text-gray-500">
                    Added {position.createdAt.toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  ${position.liquidity}
                </div>
                <div className={`text-sm ${
                  position.apy > 15 ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {position.apy}% APY
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default LiquidityOverview