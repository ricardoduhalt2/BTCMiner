import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline'

interface BridgeStats {
  totalVolume24h: string
  totalTransactions24h: number
  averageTransferTime: number
  totalValueLocked: string
  activeChains: number
  successRate: number
  topRoutes: Array<{
    from: string
    to: string
    volume: string
    count: number
  }>
  volumeByChain: Array<{
    chainId: number
    chainName: string
    volume: string
    percentage: number
    color: string
  }>
  feeComparison: Array<{
    route: string
    averageFee: string
    gasPrice: string
    estimatedTime: number
  }>
}

const BridgeStats: React.FC = () => {
  const [stats, setStats] = useState<BridgeStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h')

  // Mock stats data
  useEffect(() => {
    const generateMockStats = (): BridgeStats => ({
      totalVolume24h: '2,450,000',
      totalTransactions24h: 1247,
      averageTransferTime: 4.2,
      totalValueLocked: '15,800,000',
      activeChains: 6,
      successRate: 99.2,
      topRoutes: [
        { from: 'Ethereum', to: 'BNB Chain', volume: '850,000', count: 342 },
        { from: 'BNB Chain', to: 'Base', volume: '620,000', count: 278 },
        { from: 'Base', to: 'Polygon', volume: '480,000', count: 195 },
        { from: 'Polygon', to: 'Arbitrum', volume: '320,000', count: 156 },
        { from: 'Arbitrum', to: 'Ethereum', volume: '180,000', count: 89 },
      ],
      volumeByChain: [
        { chainId: 1, chainName: 'Ethereum', volume: '980,000', percentage: 40, color: 'bg-blue-500' },
        { chainId: 56, chainName: 'BNB Chain', volume: '735,000', percentage: 30, color: 'bg-yellow-500' },
        { chainId: 8453, chainName: 'Base', volume: '490,000', percentage: 20, color: 'bg-blue-600' },
        { chainId: 137, chainName: 'Polygon', volume: '245,000', percentage: 10, color: 'bg-purple-600' },
      ],
      feeComparison: [
        { route: 'ETH → BNB', averageFee: '0.012', gasPrice: '45', estimatedTime: 5 },
        { route: 'BNB → BASE', averageFee: '0.003', gasPrice: '12', estimatedTime: 2 },
        { route: 'BASE → POLY', averageFee: '0.008', gasPrice: '28', estimatedTime: 3 },
        { route: 'POLY → ARB', averageFee: '0.005', gasPrice: '18', estimatedTime: 2 },
      ],
    })

    setTimeout(() => {
      setStats(generateMockStats())
      setIsLoading(false)
    }, 1000)
  }, [timeframe])

  const formatTime = (minutes: number) => {
    if (minutes < 1) return `${Math.round(minutes * 60)}s`
    return `${minutes.toFixed(1)}m`
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Bridge Statistics
        </h2>
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {(['24h', '7d', '30d'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                timeframe === period
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Volume ({timeframe})
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ${stats.totalVolume24h}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowTrendingUpIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Transactions ({timeframe})
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.totalTransactions24h.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Avg Transfer Time
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatTime(stats.averageTransferTime)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Value Locked
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ${stats.totalValueLocked}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <GlobeAltIcon className="h-8 w-8 text-indigo-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Active Chains
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.activeChains}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 font-bold text-sm">
                  {stats.successRate}%
                </span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Success Rate
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.successRate}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Volume by Chain */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Volume by Chain
        </h3>
        <div className="space-y-4">
          {stats.volumeByChain.map((chain, index) => (
            <div key={chain.chainId} className="flex items-center">
              <div className="flex items-center flex-1">
                <div className={`w-4 h-4 rounded-full ${chain.color} mr-3`}></div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {chain.chainName}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ${chain.volume}
                </span>
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${chain.percentage}%` }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                    className={`h-2 rounded-full ${chain.color}`}
                  ></motion.div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-8">
                  {chain.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Top Routes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Top Routes
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Route
                </th>
                <th className="text-right py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Volume
                </th>
                <th className="text-right py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Transactions
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.topRoutes.map((route, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 text-sm text-gray-900 dark:text-gray-100">
                    {route.from} → {route.to}
                  </td>
                  <td className="py-3 text-sm text-gray-900 dark:text-gray-100 text-right">
                    ${route.volume}
                  </td>
                  <td className="py-3 text-sm text-gray-900 dark:text-gray-100 text-right">
                    {route.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Fee Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Fee Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Route
                </th>
                <th className="text-right py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Avg Fee
                </th>
                <th className="text-right py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Gas Price
                </th>
                <th className="text-right py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Est. Time
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.feeComparison.map((fee, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 text-sm text-gray-900 dark:text-gray-100">
                    {fee.route}
                  </td>
                  <td className="py-3 text-sm text-gray-900 dark:text-gray-100 text-right">
                    {fee.averageFee} ETH
                  </td>
                  <td className="py-3 text-sm text-gray-900 dark:text-gray-100 text-right">
                    {fee.gasPrice} Gwei
                  </td>
                  <td className="py-3 text-sm text-gray-900 dark:text-gray-100 text-right">
                    {formatTime(fee.estimatedTime)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

export default BridgeStats