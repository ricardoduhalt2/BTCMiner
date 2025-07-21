import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'

interface PriceDataPoint {
  timestamp: number
  price: number
  volume: number
  high: number
  low: number
  open: number
  close: number
}

interface PriceChartProps {
  symbol?: string
  data: PriceDataPoint[]
  timeframe: '1H' | '24H' | '7D' | '30D' | '1Y'
  onTimeframeChange: (timeframe: '1H' | '24H' | '7D' | '30D' | '1Y') => void
  isLoading?: boolean
}

const PriceChart: React.FC<PriceChartProps> = ({
  symbol = 'BTM',
  data,
  timeframe,
  onTimeframeChange,
  isLoading = false
}) => {
  const [showTechnicalIndicators, setShowTechnicalIndicators] = useState(false)
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [priceChange, setPriceChange] = useState<number>(0)
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0)

  // Calculate price statistics
  useEffect(() => {
    if (data.length > 0) {
      const latest = data[data.length - 1]
      const previous = data[0]
      
      setCurrentPrice(latest.price)
      const change = latest.price - previous.price
      const changePercent = (change / previous.price) * 100
      
      setPriceChange(change)
      setPriceChangePercent(changePercent)
    }
  }, [data])

  // Calculate moving averages for technical indicators
  const calculateMovingAverage = (data: PriceDataPoint[], period: number) => {
    return data.map((_, index) => {
      if (index < period - 1) return null
      
      const sum = data.slice(index - period + 1, index + 1)
        .reduce((acc, point) => acc + point.price, 0)
      
      return sum / period
    })
  }

  const ma20 = calculateMovingAverage(data, 20)
  const ma50 = calculateMovingAverage(data, 50)

  const timeframes = [
    { key: '1H', label: '1H', description: 'Last hour' },
    { key: '24H', label: '24H', description: 'Last 24 hours' },
    { key: '7D', label: '7D', description: 'Last 7 days' },
    { key: '30D', label: '30D', description: 'Last 30 days' },
    { key: '1Y', label: '1Y', description: 'Last year' },
  ] as const

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value)
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    
    switch (timeframe) {
      case '1H':
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      case '24H':
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      case '7D':
        return date.toLocaleDateString('en-US', { 
          weekday: 'short' 
        })
      case '30D':
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      case '1Y':
        return date.toLocaleDateString('en-US', { 
          month: 'short' 
        })
      default:
        return date.toLocaleDateString()
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {new Date(label).toLocaleString()}
          </p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-gray-600 dark:text-gray-400">Price: </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatPrice(data.price)}
              </span>
            </p>
            <p className="text-sm">
              <span className="text-gray-600 dark:text-gray-400">Volume: </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                ${data.volume.toLocaleString()}
              </span>
            </p>
            {showTechnicalIndicators && (
              <>
                <p className="text-sm">
                  <span className="text-gray-600 dark:text-gray-400">High: </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatPrice(data.high)}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Low: </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatPrice(data.low)}
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {symbol} Price Chart
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatPrice(currentPrice)}
            </span>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${
              priceChange >= 0 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {priceChange >= 0 ? (
                <ArrowTrendingUpIcon className="h-3 w-3" />
              ) : (
                <ArrowTrendingDownIcon className="h-3 w-3" />
              )}
              <span>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(4)} 
                ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowTechnicalIndicators(!showTechnicalIndicators)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              showTechnicalIndicators
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Technical Indicators
          </button>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex items-center space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {timeframes.map((tf) => (
          <button
            key={tf.key}
            onClick={() => onTimeframeChange(tf.key)}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              timeframe === tf.key
                ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            title={tf.description}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-80 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="timestamp"
              tickFormatter={formatTimestamp}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              tickFormatter={(value) => `$${value.toFixed(2)}`}
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Main price line */}
            <Line
              type="monotone"
              dataKey="price"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#2563eb' }}
            />
            
            {/* Technical indicators */}
            {showTechnicalIndicators && (
              <>
                <Line
                  type="monotone"
                  dataKey={(_, index) => ma20[index]}
                  stroke="#f59e0b"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  name="MA20"
                />
                <Line
                  type="monotone"
                  dataKey={(_, index) => ma50[index]}
                  stroke="#ef4444"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  name="MA50"
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Info */}
      {showTechnicalIndicators && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <InformationCircleIcon className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">Technical Indicators:</p>
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <div className="w-3 h-0.5 bg-amber-500"></div>
                  <span>MA20 (20-period moving average)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-3 h-0.5 bg-red-500"></div>
                  <span>MA50 (50-period moving average)</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PriceChart