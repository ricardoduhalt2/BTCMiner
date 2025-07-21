import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowsRightLeftIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

interface Transfer {
  id: string
  fromChain: string
  toChain: string
  amount: string
  token: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  hash: string
  timestamp: Date
  fee: string
  estimatedTime: string
  actualTime?: string
}

const TransferHistory: React.FC = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Mock transfer data
  useEffect(() => {
    const mockTransfers: Transfer[] = [
      {
        id: '1',
        fromChain: 'Ethereum',
        toChain: 'BNB Chain',
        amount: '100.0',
        token: 'BTM',
        status: 'completed',
        hash: '0x1234567890abcdef1234567890abcdef12345678',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        fee: '0.005',
        estimatedTime: '3-5 minutes',
        actualTime: '4 minutes'
      },
      {
        id: '2',
        fromChain: 'BNB Chain',
        toChain: 'Base',
        amount: '50.0',
        token: 'BTM',
        status: 'processing',
        hash: '0xabcdef1234567890abcdef1234567890abcdef12',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        fee: '0.003',
        estimatedTime: '2-4 minutes'
      },
      {
        id: '3',
        fromChain: 'Base',
        toChain: 'Solana',
        amount: '25.5',
        token: 'BTM',
        status: 'pending',
        hash: '0x9876543210fedcba9876543210fedcba98765432',
        timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        fee: '0.008',
        estimatedTime: '5-8 minutes'
      },
      {
        id: '4',
        fromChain: 'Ethereum',
        toChain: 'Solana',
        amount: '200.0',
        token: 'BTM',
        status: 'failed',
        hash: '0xfedcba0987654321fedcba0987654321fedcba09',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        fee: '0.012',
        estimatedTime: '5-8 minutes'
      }
    ]

    setTimeout(() => {
      setTransfers(mockTransfers)
      setIsLoading(false)
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
        return <ClockIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20'
      case 'processing':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
      case 'pending':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
      case 'failed':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
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

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`
  }

  const filteredTransfers = transfers.filter(transfer => {
    const matchesFilter = filter === 'all' || transfer.status === filter
    const matchesSearch = searchTerm === '' || 
      transfer.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.fromChain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.toChain.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const filterOptions = [
    { value: 'all', label: 'All', count: transfers.length },
    { value: 'pending', label: 'Pending', count: transfers.filter(t => t.status === 'pending').length },
    { value: 'completed', label: 'Completed', count: transfers.filter(t => t.status === 'completed').length },
    { value: 'failed', label: 'Failed', count: transfers.filter(t => t.status === 'failed').length },
  ]

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by hash, chain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as any)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === option.value
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              {option.label}
              {option.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  filter === option.value
                    ? 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                }`}>
                  {option.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Transfer List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {isLoading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
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
          </div>
        ) : filteredTransfers.length === 0 ? (
          <div className="p-12 text-center">
            <ArrowsRightLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {searchTerm || filter !== 'all' ? 'No transfers found' : 'No transfers yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Your cross-chain transfer history will appear here'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTransfers.map((transfer, index) => (
              <motion.div
                key={transfer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(transfer.status)}
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {transfer.amount} {transfer.token}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {transfer.fromChain} → {transfer.toChain}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>{formatTimeAgo(transfer.timestamp)}</span>
                        <span>•</span>
                        <span>Fee: {transfer.fee} ETH</span>
                        <span>•</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(transfer.hash)}
                          className="hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          {formatHash(transfer.hash)}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transfer.status)}`}>
                      {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
                    </span>
                    
                    <a
                      href={`https://etherscan.io/tx/${transfer.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="View on explorer"
                    >
                      <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                    </a>
                  </div>
                </div>
                
                {transfer.status === 'processing' && (
                  <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-700 dark:text-blue-300">
                        Estimated completion: {transfer.estimatedTime}
                      </span>
                      <div className="w-32 bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full w-2/3 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TransferHistory