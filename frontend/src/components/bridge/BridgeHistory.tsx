import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowsRightLeftIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'

interface Transaction {
  id: string
  type: 'bridge'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  fromChain: {
    id: number
    name: string
    color: string
  }
  toChain: {
    id: number
    name: string
    color: string
  }
  amount: string
  token: string
  hash: string
  timestamp: Date
  fee: string
  estimatedTime?: number
  actualTime?: number
}

const BridgeHistory: React.FC = () => {
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
          fromChain: {
            id: 1,
            name: 'Ethereum',
            color: 'bg-blue-500',
          },
          toChain: {
            id: 56,
            name: 'BNB Chain',
            color: 'bg-yellow-500',
          },
          amount: '100.0',
          token: 'BTM',
          hash: '0x1234...5678',
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          fee: '0.01',
          estimatedTime: 5 * 60,
          actualTime: 4 * 60 + 32,
        },
        {
          id: '2',
          type: 'bridge',
          status: 'processing',
          fromChain: {
            id: 56,
            name: 'BNB Chain',
            color: 'bg-yellow-500',
          },
          toChain: {
            id: 8453,
            name: 'Base',
            color: 'bg-blue-600',
          },
          amount: '50.0',
          token: 'BTM',
          hash: '0xabcd...efgh',
          timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
          fee: '0.002',
          estimatedTime: 2 * 60,
        },
        {
          id: '3',
          type: 'bridge',
          status: 'completed',
          fromChain: {
            id: 8453,
            name: 'Base',
            color: 'bg-blue-600',
          },
          toChain: {
            id: 137,
            name: 'Polygon',
            color: 'bg-purple-600',
          },
          amount: '25.5',
          token: 'BTM',
          hash: '0x9876...5432',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          fee: '0.008',
          estimatedTime: 1 * 60,
          actualTime: 1 * 60 + 12,
        },
        {
          id: '4',
          type: 'bridge',
          status: 'failed',
          fromChain: {
            id: 137,
            name: 'Polygon',
            color: 'bg-purple-600',
          },
          toChain: {
            id: 42161,
            name: 'Arbitrum',
            color: 'bg-blue-400',
          },
          amount: '200.0',
          token: 'BTM',
          hash: '0xfeed...beef',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          fee: '0.015',
          estimatedTime: 1 * 60,
        },
        {
          id: '5',
          type: 'bridge',
          status: 'pending',
          fromChain: {
            id: 42161,
            name: 'Arbitrum',
            color: 'bg-blue-400',
          },
          toChain: {
            id: 1,
            name: 'Ethereum',
            color: 'bg-blue-500',
          },
          amount: '75.0',
          token: 'BTM',
          hash: '0xdead...beef',
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          fee: '0.012',
          estimatedTime: 5 * 60,
        }
      ]

      setTransactions(mockTransactions)
      setIsLoading(false)
    }

    setTimeout(() => {
      generateMockTransactions()
    }, 1000)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-yellow-500 animate-pulse" />
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-blue-500" />
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'processing':
        return 'Processing'
      case 'pending':
        return 'Pending'
      case 'failed':
        return 'Failed'
      default:
        return 'Unknown'
    }
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

  const formatTime = (seconds?: number) => {
    if (!seconds) return 'N/A'
    if (seconds < 60) return `${seconds} seconds`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getExplorerUrl = (chainId: number, hash: string) => {
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io/tx/',
      56: 'https://bscscan.com/tx/',
      8453: 'https://basescan.org/tx/',
      137: 'https://polygonscan.com/tx/',
      42161: 'https://arbiscan.io/tx/',
      10: 'https://optimistic.etherscan.io/tx/',
    }
    
    return explorers[chainId] ? `${explorers[chainId]}${hash}` : '#'
  }

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true
    if (filter === 'pending') return tx.status === 'pending' || tx.status === 'processing'
    return tx.status === filter
  })

  const filterOptions = [
    { value: 'all', label: 'All', count: transactions.length },
    { value: 'pending', label: 'Pending', count: transactions.filter(t => t.status === 'pending' || t.status === 'processing').length },
    { value: 'completed', label: 'Completed', count: transactions.filter(t => t.status === 'completed').length },
    { value: 'failed', label: 'Failed', count: transactions.filter(t => t.status === 'failed').length },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Bridge History
        </h2>
        
        {/* Filter */}
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value as any)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filter === option.value
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {option.label}
                {option.count > 0 && (
                  <span className="ml-1 text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                    {option.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Transaction List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowsRightLeftIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No transactions found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'all' 
              ? "You haven't made any bridge transfers yet."
              : `No ${filter} transactions found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((tx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(tx.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {parseFloat(tx.amount).toFixed(4)} {tx.token}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {getStatusText(tx.status)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center space-x-1">
                          <div className={`w-3 h-3 rounded-full ${tx.fromChain.color}`}></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {tx.fromChain.name}
                          </span>
                        </div>
                        <ArrowsRightLeftIcon className="h-3 w-3 text-gray-400" />
                        <div className="flex items-center space-x-1">
                          <div className={`w-3 h-3 rounded-full ${tx.toChain.color}`}></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {tx.toChain.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatTimeAgo(tx.timestamp)}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Fee: {tx.fee} ETH
                    </span>
                    {tx.actualTime && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        • {formatTime(tx.actualTime)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Transaction Details */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-4">
                    <a
                      href={getExplorerUrl(tx.fromChain.id, tx.hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-primary-600 hover:text-primary-700"
                    >
                      <span>{tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}</span>
                      <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                    </a>
                    
                    {tx.status === 'processing' && tx.estimatedTime && (
                      <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
                        <ClockIcon className="h-3 w-3" />
                        <span>~{formatTime(tx.estimatedTime)} remaining</span>
                      </div>
                    )}
                  </div>
                  
                  {tx.status === 'completed' && tx.actualTime && tx.estimatedTime && (
                    <div className="text-gray-500 dark:text-gray-400">
                      {tx.actualTime <= tx.estimatedTime ? (
                        <span className="text-green-600 dark:text-green-400">
                          {formatTime(tx.estimatedTime - tx.actualTime)} faster than expected
                        </span>
                      ) : (
                        <span className="text-yellow-600 dark:text-yellow-400">
                          {formatTime(tx.actualTime - tx.estimatedTime)} slower than expected
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Load More */}
      {filteredTransactions.length > 0 && filteredTransactions.length >= 10 && (
        <div className="text-center pt-6">
          <button className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
            Load More Transactions
          </button>
        </div>
      )}
    </div>
  )
}

export default BridgeHistory