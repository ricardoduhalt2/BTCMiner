import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  InformationCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import AnimatedCounter from '@components/common/AnimatedCounter'

interface PriceChartProps {
  timeframe: '1H' | '24H' | '7D' | '30D' | '1Y'
  onTimeframeChange: (timeframe: '1H' | '24H' | '7D' | '30D' | '1Y') => void
}

interface PriceDataPoint {
  timestamp: string
  price: number
  volume: number
  time: number
}

const PriceChart: React.FC<PriceChartProps> = ({
  timeframe,
  onTimeframeChange
}) => {
  const [priceData, setPriceData] = useState<PriceDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPrice, setCurrentPrice] = useState(0)
  const [priceChange, setPriceChange] = useState(0)
  const [priceChangePercent, setPriceChangePercent] = useState(0)

  // Mock data generation
  useEffect(() => {
    const generateMockData = () => {
      setIsLoading(true)
      
      const now = Date.now()
      const dataPoints: PriceDataPoint[] = []
      let basePrice = 1.25 // Mock BTCMiner price
      
      const intervals = {
        '1H': { points: 60, interval: 60 * 1000 }, // 1 minute intervals
        '24H': { points: 24, interval: 60 * 60 * 1000 }, // 1 hour intervals
        '7D': { points: 7, interval: 24 * 60 * 60 * 1000 }, // 1 day intervals
        '30D': { points: 30, interval: 24 * 60 * 60 * 1000 }, // 1 day intervals
        '1Y': { points: 52, interval: 7 * 24 * 60 * 60 * 1000 }, // 1 week intervals
      }
      
      const config = intervals[timeframe]
      
      for (let i = config.points; i >= 0; i--) {
        const timestamp = now - (i * config.interval)
        const randomChange = (Math.random() - 0.5) * 0.1
        basePrice = Math.max(0.1, basePrice + randomChange)
        
        dataPoints.push({
          timestamp: new Date(timestamp).toISOString(),
          price: basePrice,
          volume: Math.random() * 1000000,
          time: timestamp,
        })
      }
      
      setPriceData(dataPoints)
      
      if (dataPoints.length > 0) {
        const latest = dataPoints[dataPoints.length - 1]
        const previous = dataPoints[0]
        
        setCurrentPrice(latest.price)
        setPriceChange(latest.price - previous.price)
        setPriceChangePercent(((latest.price - previous.price) / previous.price) * 100)
      }
      
      setTimeout(() => setIsLoading(false), 500)
    }

    generateMockData()
  }, [timeframe])

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem)
    
    switch (timeframe) {
      case '1H':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      case '24H':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      case '7D':
      case '30D':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
      case '1Y':
        return date.toLocaleDateString([], { month: 'short', year: '2-digit' })
      default:
        return date.toLocaleDateString()
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
          className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm"
        >
          <motion.p 
            className="text-sm text-gray-600 dark:text-gray-400 mb-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {new Date(label).toLocaleString()}
          </motion.p>
          <motion.div
            className="flex items-center space-x-2 mb-1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              <AnimatedCounter
                value={data.price}
                prefix="$"
                decimals={4}
                duration={0.5}
                className="font-mono"
              />
            </span>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-2 h-2 bg-blue-500 rounded-full"
            />
          </motion.div>
          <motion.p 
            className="text-sm text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Volume: <AnimatedCounter
              value={data.volume}
              prefix="$"
              decimals={0}
              duration={0.5}
              formatValue={(val) => val.toLocaleString()}
              className="font-mono"
            />
          </motion.p>
        </motion.div>
      )
    }
    return null
  }

  const timeframeOptions = [
    { value: '1H', label: '1H' },
    { value: '24H', label: '24H' },
    { value: '7D', label: '7D' },
    { value: '30D', label: '30D' },
    { value: '1Y', label: '1Y' },
  ] as const

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            BTCMiner Price Chart
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <motion.div
                className="text-2xl font-bold text-gray-900 dark:text-gray-100"
                key={currentPrice}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.3 }}
              >
                <AnimatedCounter
                  value={currentPrice}
                  prefix="$"
                  decimals={4}
                  duration={1.0}
                  className="font-mono"
                />
              </motion.div>
              <AnimatePresence mode="wait">
                <motion.div 
                  key={priceChange >= 0 ? 'positive' : 'negative'}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
                    priceChange >= 0 
                      ? 'text-green-600 bg-green-50 dark:bg-green-900/20' 
                      : 'text-red-600 bg-red-50 dark:bg-red-900/20'
                  }`}
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                >
                  <motion.div
                    animate={{ 
                      rotate: priceChange >= 0 ? [0, -5, 5, 0] : [0, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {priceChange >= 0 ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </motion.div>
                  <span className="text-sm font-medium">
                    <AnimatedCounter
                      value={Math.abs(priceChange)}
                      prefix={priceChange >= 0 ? '+' : '-'}
                      decimals={4}
                      duration={0.8}
                      className="font-mono"
                    />
                    {' '}(
                    <AnimatedCounter
                      value={Math.abs(priceChangePercent)}
                      prefix={priceChange >= 0 ? '+' : '-'}
                      suffix="%"
                      decimals={2}
                      duration={0.8}
                      className="font-mono"
                    />
                    )
                  </span>
                  
                  {/* Sparkle effect for significant changes */}
                  {Math.abs(priceChangePercent) > 5 && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                      <SparklesIcon className="h-3 w-3" />
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 relative">
            {timeframeOptions.map((option, index) => (
              <motion.button
                key={option.value}
                onClick={() => onTimeframeChange(option.value)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors relative z-10 ${
                  timeframe === option.value
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {option.label}
                
                {/* Active indicator */}
                {timeframe === option.value && (
                  <motion.div
                    layoutId="activeTimeframe"
                    className="absolute inset-0 bg-white dark:bg-gray-600 rounded-md shadow-sm"
                    style={{ zIndex: -1 }}
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-80">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceData}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="timestamp"
                tickFormatter={formatXAxis}
                stroke="#6B7280"
                fontSize={12}
              />
              <YAxis 
                domain={['dataMin - 0.01', 'dataMax + 0.01']}
                tickFormatter={(value) => `$${value.toFixed(3)}`}
                stroke="#6B7280"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#priceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Chart Info */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <InformationCircleIcon className="h-4 w-4" />
            <span>Price data is updated in real-time</span>
          </div>
          <div>
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PriceChart