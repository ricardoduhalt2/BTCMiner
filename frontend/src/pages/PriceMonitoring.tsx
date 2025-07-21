import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PriceChart from '@components/price/PriceChart'
import PriceAlerts from '@components/price/PriceAlerts'
import ArbitrageOpportunities from '@components/price/ArbitrageOpportunities'
import PriceAnalytics from '@components/price/PriceAnalytics'
import { useRealTimePrice } from '@hooks/useRealTimePrice'

interface PriceDataPoint {
  timestamp: number
  price: number
  volume: number
  high: number
  low: number
  open: number
  close: number
}

const PriceMonitoring: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1H' | '24H' | '7D' | '30D' | '1Y'>('24H')
  const [chartData, setChartData] = useState<PriceDataPoint[]>([])
  const [isLoadingChart, setIsLoadingChart] = useState(true)

  // Real-time price hook
  const {
    price: currentPrice,
    change24h,
    changePercent24h,
    volume24h,
    high24h,
    low24h,
    isConnected,
    lastUpdate
  } = useRealTimePrice({
    symbol: 'BTM',
    autoConnect: true
  })

  // Generate mock historical data based on timeframe
  const generateMockData = (timeframe: string): PriceDataPoint[] => {
    const now = Date.now()
    let dataPoints: number
    let interval: number

    switch (timeframe) {
      case '1H':
        dataPoints = 60
        interval = 60 * 1000 // 1 minute
        break
      case '24H':
        dataPoints = 24
        interval = 60 * 60 * 1000 // 1 hour
        break
      case '7D':
        dataPoints = 7
        interval = 24 * 60 * 60 * 1000 // 1 day
        break
      case '30D':
        dataPoints = 30
        interval = 24 * 60 * 60 * 1000 // 1 day
        break
      case '1Y':
        dataPoints = 52
        interval = 7 * 24 * 60 * 60 * 1000 // 1 week
        break
      default:
        dataPoints = 24
        interval = 60 * 60 * 1000
    }

    const data: PriceDataPoint[] = []
    let basePrice = 25.75
    
    for (let i = 0; i < dataPoints; i++) {
      const timestamp = now - (dataPoints - 1 - i) * interval
      
      // Generate realistic price movement
      const volatility = 0.02
      const trend = Math.sin(i / dataPoints * Math.PI * 2) * 0.01
      const randomChange = (Math.random() - 0.5) * volatility
      
      basePrice = basePrice * (1 + trend + randomChange)
      
      // Generate OHLC data
      const open = i === 0 ? basePrice : data[i - 1].close
      const close = basePrice
      const high = Math.max(open, close) * (1 + Math.random() * 0.01)
      const low = Math.min(open, close) * (1 - Math.random() * 0.01)
      const volume = Math.random() * 5000000 + 1000000

      data.push({
        timestamp,
        price: close,
        volume,
        high,
        low,
        open,
        close
      })
    }

    return data
  }

  // Load chart data when timeframe changes
  useEffect(() => {
    setIsLoadingChart(true)
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      const newData = generateMockData(selectedTimeframe)
      setChartData(newData)
      setIsLoadingChart(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [selectedTimeframe])

  // Update chart data with real-time price
  useEffect(() => {
    if (currentPrice && chartData.length > 0) {
      const now = Date.now()
      const lastDataPoint = chartData[chartData.length - 1]
      
      // Only update if enough time has passed (to avoid too frequent updates)
      if (now - lastDataPoint.timestamp > 60000) { // 1 minute
        const newDataPoint: PriceDataPoint = {
          timestamp: now,
          price: currentPrice,
          volume: volume24h / 24, // Approximate hourly volume
          high: Math.max(lastDataPoint.high, currentPrice),
          low: Math.min(lastDataPoint.low, currentPrice),
          open: lastDataPoint.close,
          close: currentPrice
        }

        setChartData(prev => [...prev.slice(1), newDataPoint])
      }
    }
  }, [currentPrice, chartData, volume24h])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Price Monitoring
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time price analysis and market insights for BTCMiner token
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {lastUpdate && (
            <span className="text-xs text-gray-500 dark:text-gray-500">
              • Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Current Price Summary */}
      {currentPrice && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Current Price</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ${currentPrice.toFixed(4)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">24h Change</div>
              <div className={`text-lg font-semibold ${
                changePercent24h >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {changePercent24h >= 0 ? '+' : ''}{changePercent24h.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">24h Volume</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                ${volume24h.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">24h High</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                ${high24h.toFixed(4)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">24h Low</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                ${low24h.toFixed(4)}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <PriceChart
          symbol="BTM"
          data={chartData}
          timeframe={selectedTimeframe}
          onTimeframeChange={setSelectedTimeframe}
          isLoading={isLoadingChart}
        />
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Alerts */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PriceAlerts
            symbol="BTM"
            currentPrice={currentPrice || 25.75}
          />
        </motion.div>

        {/* Price Analytics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PriceAnalytics
            symbol="BTM"
            data={chartData}
            timeframe={selectedTimeframe}
          />
        </motion.div>
      </div>

      {/* Arbitrage Opportunities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <ArbitrageOpportunities
          symbol="BTM"
          refreshInterval={30000}
        />
      </motion.div>
    </div>
  )
}

export default PriceMonitoring