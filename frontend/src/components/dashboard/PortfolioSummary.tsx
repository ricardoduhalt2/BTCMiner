import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { ConnectedWallet } from '@types/wallet'
import AnimatedCounter from '@components/common/AnimatedCounter'

interface PortfolioSummaryProps {
  totalValue: number
  connectedWallets: ConnectedWallet[]
  balances: Record<string, any>
  isLoading: boolean
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  totalValue,
  connectedWallets,
  balances,
  isLoading
}) => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const [previousTotalValue, setPreviousTotalValue] = useState(totalValue)
  const [previousTotalTokens, setPreviousTotalTokens] = useState(0)
  const [animationTrigger, setAnimationTrigger] = useState(false)

  // Calculate portfolio metrics
  const totalTokens = Object.values(balances).reduce((sum, balance) => {
    return sum + parseFloat(balance.nativeBalance || '0')
  }, 0)

  const activeChains = new Set(connectedWallets.map(w => w.chainId)).size
  const totalValueChange = Math.random() * 10 - 5 // Mock data - would come from price API
  const tokenChange = Math.random() * 8 - 4 // Mock data - would come from historical data

  // Trigger animations when values change
  useEffect(() => {
    if (totalValue !== previousTotalValue || totalTokens !== previousTotalTokens) {
      setAnimationTrigger(true)
      setPreviousTotalValue(totalValue)
      setPreviousTotalTokens(totalTokens)
      
      // Reset trigger after animation
      setTimeout(() => setAnimationTrigger(false), 100)
    }
  }, [totalValue, totalTokens, previousTotalValue, previousTotalTokens])

  const stats = [
    {
      title: 'Total Portfolio Value',
      value: isBalanceVisible ? `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••',
      change: totalValueChange,
      changeLabel: '24h',
      icon: '◇',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Token Balance',
      value: isBalanceVisible ? `${totalTokens.toFixed(4)} BTM` : '••••••',
      change: tokenChange,
      changeLabel: '24h',
      icon: '🪙',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Chains',
      value: activeChains.toString(),
      subtitle: `${connectedWallets.length} wallet${connectedWallets.length !== 1 ? 's' : ''} connected`,
      icon: '🔗',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Liquidity Positions',
      value: isBalanceVisible ? '$0.00' : '••••••',
      subtitle: '0 active positions',
      icon: '💧',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Portfolio Overview
        </h2>
        <button
          onClick={() => setIsBalanceVisible(!isBalanceVisible)}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title={isBalanceVisible ? 'Hide balances' : 'Show balances'}
        >
          {isBalanceVisible ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <div className="mt-2">
                  {isLoading ? (
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stat.title === 'Total Portfolio Value' && isBalanceVisible ? (
                        <AnimatedCounter
                          value={totalValue}
                          prefix="$"
                          decimals={2}
                          duration={1.2}
                          triggerAnimation={animationTrigger}
                        />
                      ) : stat.title === 'Total Token Balance' && isBalanceVisible ? (
                        <AnimatedCounter
                          value={totalTokens}
                          suffix=" BTM"
                          decimals={4}
                          duration={1.2}
                          triggerAnimation={animationTrigger}
                        />
                      ) : stat.title === 'Active Chains' ? (
                        <AnimatedCounter
                          value={activeChains}
                          decimals={0}
                          duration={0.8}
                          triggerAnimation={animationTrigger}
                        />
                      ) : (
                        <span>{isBalanceVisible ? stat.value : '••••••'}</span>
                      )}
                    </div>
                  )}
                </div>
                {stat.change !== undefined ? (
                  <div className="mt-2 flex items-center">
                    {stat.change >= 0 ? (
                      <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change >= 0 ? '+' : ''}{stat.change.toFixed(2)}%
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                      ({stat.changeLabel})
                    </span>
                  </div>
                ) : stat.subtitle ? (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {stat.subtitle}
                  </p>
                ) : null}
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center ml-4`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats Bar */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Today's P&L</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isBalanceVisible ? '$0.00' : '••••••'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">0</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Gas Spent</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isBalanceVisible ? '$0.00' : '••••••'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
            <p className="text-lg font-semibold text-green-600">100%</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PortfolioSummary