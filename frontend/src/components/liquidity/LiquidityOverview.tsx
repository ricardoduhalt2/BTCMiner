import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { LiquidityPosition, LiquidityPool } from '../../types/liquidity'
import LoadingSpinner from '../common/LoadingSpinner'
import { 
  ExclamationTriangleIcon, 
  ArrowRightIcon,
  ClockIcon 
} from '@heroicons/react/24/outline'

interface LiquidityOverviewProps {
  positions: LiquidityPosition[]
  pools: LiquidityPool[]
  totalLiquidity: number
  isLoading: boolean
  onEmergencyWithdraw?: (positionId: string) => Promise<void>
}

const LiquidityOverview: React.FC<LiquidityOverviewProps> = ({
  positions,
  pools,
  totalLiquidity,
  isLoading,
  onEmergencyWithdraw
}) => {
  const [emergencyWithdrawing, setEmergencyWithdrawing] = useState<string | null>(null)
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<LiquidityPosition | null>(null)

  const handleEmergencyWithdraw = async (positionId: string) => {
    if (!onEmergencyWithdraw) return
    
    setEmergencyWithdrawing(positionId)
    try {
      await onEmergencyWithdraw(positionId)
      setShowEmergencyModal(false)
      setSelectedPosition(null)
    } catch (error) {
      console.error('Emergency withdrawal failed:', error)
    } finally {
      setEmergencyWithdrawing(null)
    }
  }
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
          {positions.slice(0, 3).map((position) => {
            const pool = pools.find(p => p.address === position.poolAddress && p.chainId === position.chainId)
            const isCritical = pool?.warningLevel === 'critical'
            
            return (
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
                      Added {new Date(position.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {isCritical && (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center space-x-3">
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
                  {onEmergencyWithdraw && isCritical && (
                    <button
                      onClick={() => {
                        setSelectedPosition(position)
                        setShowEmergencyModal(true)
                      }}
                      className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm flex items-center space-x-1"
                    >
                      <ArrowRightIcon className="w-4 h-4" />
                      <span>Emergency</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Emergency Withdrawal Modal */}
      {showEmergencyModal && selectedPosition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center space-x-3 mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Emergency Withdrawal
              </h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You are about to perform an emergency withdrawal from your liquidity position:
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Position:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedPosition.tokenA}/{selectedPosition.tokenB}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Amount:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    ${selectedPosition.liquidity}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Rewards:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    ${selectedPosition.rewards}
                  </span>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800 dark:text-red-300 mb-1">
                      Warning
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Emergency withdrawal may result in higher fees and potential loss of rewards. 
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowEmergencyModal(false)
                  setSelectedPosition(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEmergencyWithdraw(selectedPosition.id)}
                disabled={emergencyWithdrawing === selectedPosition.id}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {emergencyWithdrawing === selectedPosition.id ? (
                  <>
                    <ClockIcon className="w-4 h-4 animate-spin" />
                    <span>Withdrawing...</span>
                  </>
                ) : (
                  <>
                    <ArrowRightIcon className="w-4 h-4" />
                    <span>Confirm Withdrawal</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default LiquidityOverview