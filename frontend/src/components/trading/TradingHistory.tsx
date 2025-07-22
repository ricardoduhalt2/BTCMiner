import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  ClockIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MagnifyingGlassIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

interface Trade {
  id: string
  timestamp: string
  type: 'buy' | 'sell'
  orderType: 'market' | 'limit' | 'stop-loss' | 'take-profit'
  symbol: string
  amount: number
  price: number
  total: number
  fee: number
  status: 'completed' | 'cancelled' | 'partial'
  chain: string
  pnl?: number
  pnlPercentage?: number
}

interface PerformanceMetrics {
  totalTrades: number
  winRate: number
  totalPnL: number
  totalPnLPercentage: number
  avgWin: number
  avgLoss: number
  profitFactor: number
  sharpeRatio: number
  maxDrawdown: number
  totalVolume: number
  totalFees: number
}

interface TradingHistoryProps {
  trades?: Trade[]
  onExportData?: (format: 'csv' | 'pdf' | 'json') => void
}

const TradingHistory: React.FC<TradingHistoryProps> = ({
  trades = [
    {
      id: '1',
      timestamp: '2024-01-15T14:30:00Z',
      type: 'buy',
      orderType: 'market',
      symbol: 'BTM',
      amount: 1000,
      price: 0.45,
      total: 450,
      fee: 2.25,
      status: 'completed',
      chain: 'Ethereum',
      pnl: 25.50,
      pnlPercentage: 5.67
    },
    {
      id: '2',
      timestamp: '2024-01-15T13:15:00Z',
      type: 'sell',
      orderType: 'limit',
      symbol: 'ETH',
      amount: 0.1,
      price: 2400,
      total: 240,
      fee: 1.20,
      status: 'completed',
      chain: 'Ethereum',
      pnl: -12.30,
      pnlPercentage: -4.88
    },
    {
      id: '3',
      timestamp: '2024-01-15T12:00:00Z',
      type: 'buy',
      orderType: 'limit',
      symbol: 'BNB',
      amount: 0.5,
      price: 310,
      total: 155,
      fee: 0.78,
      status: 'completed',
      chain: 'BNB Chain',
      pnl: 18.75,
      pnlPercentage: 12.10
    },
    {
      id: '4',
      timestamp: '2024-01-15T11:30:00Z',
      type: 'sell',
      orderType: 'stop-loss',
      symbol: 'SOL',
      amount: 2,
      price: 95,
      total: 190,
      fee: 0.95,
      status: 'completed',
      chain: 'Solana',
      pnl: -8.45,
      pnlPercentage: -4.26
    },
    {
      id: '5',
      timestamp: '2024-01-15T10:45:00Z',
      type: 'buy',
      orderType: 'market',
      symbol: 'BTM',
      amount: 500,
      price: 0.42,
      total: 210,
      fee: 1.05,
      status: 'partial',
      chain: 'BNB Chain',
      pnl: 15.00,
      pnlPercentage: 7.14
    }
  ],
  onExportData
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'cancelled' | 'partial'>('all')
  const [filterChain, setFilterChain] = useState<'all' | 'Ethereum' | 'BNB Chain' | 'Solana' | 'Base'>('all')
  const [dateRange, setDateRange] = useState<'all' | '24h' | '7d' | '30d' | '90d'>('all')
  const [sortBy, setSortBy] = useState<'timestamp' | 'pnl' | 'volume'>('timestamp')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Filter and sort trades
  const filteredTrades = useMemo(() => {
    let filtered = trades.filter(trade => {
      const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trade.chain.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === 'all' || trade.type === filterType
      const matchesStatus = filterStatus === 'all' || trade.status === filterStatus
      const matchesChain = filterChain === 'all' || trade.chain === filterChain
      
      let matchesDate = true
      if (dateRange !== 'all') {
        const tradeDate = new Date(trade.timestamp)
        const now = new Date()
        const diffHours = (now.getTime() - tradeDate.getTime()) / (1000 * 60 * 60)
        
        switch (dateRange) {
          case '24h':
            matchesDate = diffHours <= 24
            break
          case '7d':
            matchesDate = diffHours <= 24 * 7
            break
          case '30d':
            matchesDate = diffHours <= 24 * 30
            break
          case '90d':
            matchesDate = diffHours <= 24 * 90
            break
        }
      }
      
      return matchesSearch && matchesType && matchesStatus && matchesChain && matchesDate
    })

    // Sort trades
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime()
          bValue = new Date(b.timestamp).getTime()
          break
        case 'pnl':
          aValue = a.pnl || 0
          bValue = b.pnl || 0
          break
        case 'volume':
          aValue = a.total
          bValue = b.total
          break
        default:
          aValue = new Date(a.timestamp).getTime()
          bValue = new Date(b.timestamp).getTime()
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })

    return filtered
  }, [trades, searchTerm, filterType, filterStatus, filterChain, dateRange, sortBy, sortOrder])

  // Calculate performance metrics
  const performanceMetrics = useMemo((): PerformanceMetrics => {
    const completedTrades = filteredTrades.filter(t => t.status === 'completed' && t.pnl !== undefined)
    const winningTrades = completedTrades.filter(t => (t.pnl || 0) > 0)
    const losingTrades = completedTrades.filter(t => (t.pnl || 0) < 0)
    
    const totalPnL = completedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const totalVolume = filteredTrades.reduce((sum, t) => sum + t.total, 0)
    const totalFees = filteredTrades.reduce((sum, t) => sum + t.fee, 0)
    
    const avgWin = winningTrades.length > 0 
      ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length 
      : 0
    const avgLoss = losingTrades.length > 0 
      ? Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)) / losingTrades.length 
      : 0
    
    return {
      totalTrades: completedTrades.length,
      winRate: completedTrades.length > 0 ? (winningTrades.length / completedTrades.length) * 100 : 0,
      totalPnL,
      totalPnLPercentage: totalVolume > 0 ? (totalPnL / totalVolume) * 100 : 0,
      avgWin,
      avgLoss,
      profitFactor: avgLoss > 0 ? avgWin / avgLoss : 0,
      sharpeRatio: 1.45, // This would be calculated from returns
      maxDrawdown: -5.2, // This would be calculated from equity curve
      totalVolume,
      totalFees
    }
  }, [filteredTrades])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'cancelled': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      case 'partial': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getOrderTypeColor = (type: string) => {
    switch (type) {
      case 'market': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      case 'limit': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'stop-loss': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      case 'take-profit': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getChainLogo = (chain: string) => {
    const logos: Record<string, string> = {
      'Ethereum': '🔷',
      'BNB Chain': '🟡',
      'Base': '🔵',
      'Solana': '🟣'
    }
    return logos[chain] || '⚪'
  }

  const handleExport = (format: 'csv' | 'pdf' | 'json') => {
    if (onExportData) {
      onExportData(format)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <ClockIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Trading History
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total P&L</p>
              <p className={`text-lg font-semibold ${
                performanceMetrics.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${performanceMetrics.totalPnL.toFixed(2)}
              </p>
            </div>
            {performanceMetrics.totalPnL >= 0 ? (
              <ArrowTrendingUpIcon className="w-8 h-8 text-green-600" />
            ) : (
              <ArrowTrendingDownIcon className="w-8 h-8 text-red-600" />
            )}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Win Rate</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {performanceMetrics.winRate.toFixed(1)}%
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Volume</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                ${performanceMetrics.totalVolume.toLocaleString()}
              </p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Fees</p>
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                ${performanceMetrics.totalFees.toFixed(2)}
              </p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
        >
          <option value="all">All Types</option>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="partial">Partial</option>
        </select>

        <select
          value={filterChain}
          onChange={(e) => setFilterChain(e.target.value as any)}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
        >
          <option value="all">All Chains</option>
          <option value="Ethereum">Ethereum</option>
          <option value="BNB Chain">BNB Chain</option>
          <option value="Solana">Solana</option>
          <option value="Base">Base</option>
        </select>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
        >
          <option value="all">All Time</option>
          <option value="24h">Last 24h</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>

        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-')
            setSortBy(field as any)
            setSortOrder(order as any)
          }}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
        >
          <option value="timestamp-desc">Newest First</option>
          <option value="timestamp-asc">Oldest First</option>
          <option value="pnl-desc">Highest P&L</option>
          <option value="pnl-asc">Lowest P&L</option>
          <option value="volume-desc">Highest Volume</option>
          <option value="volume-asc">Lowest Volume</option>
        </select>
      </div>

      {/* Trades Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                P&L
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Chain
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTrades.map((trade, index) => (
              <motion.tr
                key={trade.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  <div>
                    <div>{new Date(trade.timestamp).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      trade.type === 'buy' ? 'text-green-800 bg-green-100 dark:bg-green-900/20' : 'text-red-800 bg-red-100 dark:bg-red-900/20'
                    }`}>
                      {trade.type.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderTypeColor(trade.orderType)}`}>
                      {trade.orderType.toUpperCase()}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{trade.symbol}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                  {trade.amount.toLocaleString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                  ${trade.price.toFixed(4)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                  <div>
                    <div>${trade.total.toFixed(2)}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Fee: ${trade.fee.toFixed(2)}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                  {trade.pnl !== undefined ? (
                    <div>
                      <div className={`font-medium ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                      </div>
                      <div className={`text-xs ${trade.pnlPercentage && trade.pnlPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trade.pnlPercentage && trade.pnlPercentage >= 0 ? '+' : ''}{trade.pnlPercentage?.toFixed(2)}%
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trade.status)}`}>
                    {trade.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getChainLogo(trade.chain)}</span>
                    <span>{trade.chain}</span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTrades.length === 0 && (
        <div className="text-center py-8">
          <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No trades found matching your filters</p>
        </div>
      )}

      {/* Additional Performance Metrics */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Detailed Performance</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg Win</p>
            <p className="text-lg font-semibold text-green-600">
              ${performanceMetrics.avgWin.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg Loss</p>
            <p className="text-lg font-semibold text-red-600">
              ${performanceMetrics.avgLoss.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Profit Factor</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {performanceMetrics.profitFactor.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Sharpe Ratio</p>
            <p className="text-lg font-semibold text-blue-600">
              {performanceMetrics.sharpeRatio.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TradingHistory