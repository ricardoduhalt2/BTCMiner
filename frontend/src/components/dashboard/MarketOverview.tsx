import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'

interface MarketData {
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  icon: string
}

const MarketOverview: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [alerts, setAlerts] = useState<Array<{
    id: string
    type: 'info' | 'warning' | 'error'
    message: string
    timestamp: Date
  }>>([])

  // Mock market data
  useEffect(() => {
    const generateMockData = () => {
      const mockData: MarketData[] = [
        {
          symbol: 'BTM',
          name: 'BTCMiner',
          price: 1.25,
          change24h: 5.67,
          volume24h: 2500000,
          marketCap: 125000000,
          icon: '◇'
        },
        {
          symbol: 'ETH',
          name: 'Ethereum',
          price: 2000.45,
          change24h: -2.34,
          volume24h: 15000000000,
          marketCap: 240000000000,
          icon: '◆'
        },
        {
          symbol: 'BNB',
          name: 'BNB',
          price: 310.22,
          change24h: 1.89,
          volume24h: 800000000,
          marketCap: 47000000000,
          icon: '◉'
        },
        {
          symbol: 'SOL',
          name: 'Solana',
          price: 98.76,
          change24h: 8.45,
          volume24h: 1200000000,
          marketCap: 42000000000,
          icon: '⟋'
        }
      ]

      setMarketData(mockData)
      setIsLoading(false)
    }

    const generateAlerts = () => {
      const mockAlerts = [
        {
          id: '1',
          type: 'info' as const,
          message: 'BTCMiner price increased by 5.67% in the last 24h',
          timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
        },
        {
          id: '2',
          type: 'warning' as const,
          message: 'High volatility detected across multiple chains',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        }
      ]
      setAlerts(mockAlerts)
    }

    generateMockData()
    generateAlerts()

    // Simulate real-time updates
    const interval = setInterval(() => {
      setMarketData(prev => prev.map(item => ({
        ...item,
        price: item.price * (1 + (Math.random() - 0.5) * 0.02),
        change24h: item.change24h + (Math.random() - 0.5) * 0.5
      })))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
      default:
        return <InformationCircleIcon className="h-4 w-4 text-blue-500" />
    }
  }

  const formatNumber = (num: number, decimals = 2) => {
    if (num >= 1e9) {
      return `${(num / 1e9).toFixed(decimals)}B`
    }
    if (num >= 1e6) {
      return `${(num / 1e6).toFixed(decimals)}M`
    }
    if (num >= 1e3) {
      return `${(num / 1e3).toFixed(decimals)}K`
    }
    return num.toFixed(decimals)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Market Overview
        </h2>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
        </div>
      </div>

      {/* Market Data */}
      <div className="space-y-4 mb-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16 mb-1"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-12"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20 mb-1"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          marketData.map((token, index) => (
            <motion.div
              key={token.symbol}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-lg">{token.icon}</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {token.symbol}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {token.name}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  ${token.price.toFixed(token.symbol === 'BTM' ? 4 : 2)}
                </div>
                <div className={`text-sm flex items-center justify-end space-x-1 ${
                  token.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {token.change24h >= 0 ? (
                    <ArrowUpIcon className="h-3 w-3" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3" />
                  )}
                  <span>{Math.abs(token.change24h).toFixed(2)}%</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Market Stats */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">24h Volume</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              ${formatNumber(marketData.reduce((sum, token) => sum + token.volume24h, 0))}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Market Cap</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              ${formatNumber(marketData.reduce((sum, token) => sum + token.marketCap, 0))}
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Market Alerts
          </h3>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start space-x-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {alert.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MarketOverview