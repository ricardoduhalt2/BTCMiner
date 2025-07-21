import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import AnimatedList from '@components/common/AnimatedList'
import AnimatedCounter from '@components/common/AnimatedCounter'
import {
  ArrowsRightLeftIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

interface Transaction {
  id: string
  type: 'bridge' | 'swap' | 'transfer' | 'liquidity'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  fromChain: string
  toChain?: string
  amount: string
  token: string
  hash: string
  timestamp: Date
  gasUsed?: string
  fee: string
}

const RecentTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all')

  // Mock transaction data
  useEffect(() => {
    const generateMockTransactions = () => {
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'bridge',
          status: 'completed',
          fromChain: 'Ethereum',
          toChain: 'BNB Chain',
          amount: '100.0',
          token: 'BTM',
          hash: '0x1234...5678',
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          gasUsed: '0.005',
          fee: '0.01'
        },
        {
          id: '2',
          type: 'swap',
          status: 'processing',
          fromChain: 'Solana',
          amount: '50.0',
          token: 'SOL',
          hash: '0xabcd...efgh',
          timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
          fee: '0.002'
        },
        {
          id: '3',
          type: 'transfer',
          status: 'completed',
          fromChain: 'Base',
          amount: '25.5',
          token: 'ETH',
          hash: '0x9876...5432',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          gasUsed: '0.003',
          fee: '0.008'
        },
        {
          id: '4',
          type: 'liquidity',
          status: 'failed',
          fromChain: 'Polygon',
          amount: '200.0',
          token: 'MATIC',
          hash: '0xfeed...beef',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          fee: '0.015'
        },
        {
          id: '5',
          type: 'bridge',
          status: 'pending',
          fromChain: 'Arbitrum',
          toChain: 'Ethereum',
          amount: '75.0',
          token: 'BTM',
          hash: '0xdead...beef',
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          fee: '0.012'
        }
      ]

      setTransactions(mockTransactions)
      setIsLoading(false)
    }

    generateMockTransactions()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case 'processing':
        return <ClockIcon className="h-4 w-4 text-yellow-500 animate-pulse" />
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-blue-500" />
      case 'failed':
        return <XCircleIcon className="h-4 w-4 text-red-500" />
      default:
        return <ExclamationTriangleIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bridge':
        return <ArrowsRightLeftIcon className="h-4 w-4 text-blue-600" />
      case 'swap':
        return <ArrowsRightLeftIcon className="h-4 w-4 text-purple-600" />
      case 'transfer':
        return <ArrowTopRightOnSquareIcon className="h-4 w-4 text-green-600" />
      case 'liquidity':
        return <ArrowsRightLeftIcon className="h-4 w-4 text-cyan-600" />
      default:
        return <ArrowsRightLeftIcon className="h-4 w-4 text-gray-600" />
    }
  }

  const getChainColor = (chain: string) => {
    const colors: Record<string, string> = {
      'Ethereum': 'bg-blue-500',
      'BNB Chain': 'bg-yellow-500',
      'Base': 'bg-blue-600',
      'Solana': 'bg-purple-500',
      'Polygon': 'bg-purple-600',
      'Arbitrum': 'bg-blue-400',
    }
    return colors[chain] || 'bg-gray-500'
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true
    return tx.status === filter
  })

  const filterOptions = [
    { value: 'all', label: 'All', count: transactions.length },
    { value: 'pending', label: 'Pending', count: transactions.filter(t => t.status === 'pending').length },
    { value: 'completed', label: 'Completed', count: transactions.filter(t => t.status === 'completed').length },
    { value: 'failed', label: 'Failed', count: transactions.filter(t => t.status === 'failed').length },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Recent Transactions
        </h2>
        <Link
          to="/portfolio"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          View all →
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value as any)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === option.value
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            {option.label}
            {option.count > 0 && (
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                filter === option.value
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
              }`}>
                {option.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowsRightLeftIcon className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'all' ? 'No transactions yet' : `No ${filter} transactions`}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Your transaction history will appear here
            </p>
          </div>
        ) : (
          <AnimatedList
            staggerDelay={0.05}
            animationType="slide"
            direction="up"
            duration={0.4}
          >
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {getTypeIcon(transaction.type)}
                  </motion.div>
                  <motion.div
                    animate={transaction.status === 'processing' ? { 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    } : {}}
                    transition={transaction.status === 'processing' ? { 
                      duration: 2, 
                      repeat: Infinity 
                    } : {}}
                  >
                    {getStatusIcon(transaction.status)}
                  </motion.div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <motion.span 
                      className="font-medium text-gray-900 dark:text-gray-100 capitalize"
                      whileHover={{ scale: 1.02 }}
                    >
                      {transaction.type}
                    </motion.span>
                    {transaction.toChain && (
                      <motion.div 
                        className="flex items-center space-x-1"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <motion.div 
                          className={`w-3 h-3 rounded-full ${getChainColor(transaction.fromChain)}`}
                          whileHover={{ scale: 1.3 }}
                        />
                        <motion.div
                          animate={{ x: [0, 3, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <ArrowsRightLeftIcon className="h-3 w-3 text-gray-400" />
                        </motion.div>
                        <motion.div 
                          className={`w-3 h-3 rounded-full ${getChainColor(transaction.toChain)}`}
                          whileHover={{ scale: 1.3 }}
                        />
                      </motion.div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <AnimatedCounter
                      value={parseFloat(transaction.amount)}
                      suffix={` ${transaction.token}`}
                      decimals={transaction.token === 'BTM' ? 4 : 2}
                      duration={0.8}
                      className="font-mono"
                    />
                    {transaction.toChain && (
                      <span> • {transaction.fromChain} → {transaction.toChain}</span>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <motion.div 
                    className="text-sm font-medium text-gray-900 dark:text-gray-100"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {formatTimeAgo(transaction.timestamp)}
                  </motion.div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Fee: <AnimatedCounter
                      value={parseFloat(transaction.fee)}
                      suffix=" ETH"
                      decimals={4}
                      duration={0.6}
                      className="font-mono"
                    />
                  </div>
                </div>
                
                <motion.a
                  href={`https://etherscan.io/tx/${transaction.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md"
                  title="View on explorer"
                  whileHover={{ 
                    scale: 1.1, 
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    color: "#3b82f6"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </motion.a>
              </div>
            ))}
          </AnimatedList>
        )}
      </div>

      {/* Summary Stats */}
      {!isLoading && transactions.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Total Transactions</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {transactions.length}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Success Rate</p>
              <p className="font-semibold text-green-600">
                {Math.round((transactions.filter(t => t.status === 'completed').length / transactions.length) * 100)}%
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Total Fees</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {transactions.reduce((sum, tx) => sum + parseFloat(tx.fee), 0).toFixed(4)} ETH
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecentTransactions