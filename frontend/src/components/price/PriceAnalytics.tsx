import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  InformationCircleIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
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

interface TechnicalIndicator {
  name: string
  value: number
  signal: 'bullish' | 'bearish' | 'neutral'
  description: string
}

interface MarketInsight {
  id: string
  type: 'trend' | 'support' | 'resistance' | 'volume' | 'volatility'
  title: string
  description: string
  confidence: 'high' | 'medium' | 'low'
  impact: 'positive' | 'negative' | 'neutral'
}

interface PriceAnalyticsProps {
  symbol?: string
  data: PriceDataPoint[]
  timeframe: '1H' | '24H' | '7D' | '30D' | '1Y'
}

const PriceAnalytics: React.FC<PriceAnalyticsProps> = ({
  symbol = 'BTM',
  data,
  timeframe
}) => {
  const [selectedTab, setSelectedTab] = useState<'indicators' | 'insights' | 'patterns'>('indicators')

  // Calculate technical indicators
  const technicalIndicators = useMemo(() => {
    if (data.length < 20) return []

    const indicators: TechnicalIndicator[] = []
    const prices = data.map(d => d.close)
    const volumes = data.map(d => d.volume)

    // RSI (Relative Strength Index)
    const rsi = calculateRSI(prices, 14)
    if (rsi !== null) {
      indicators.push({
        name: 'RSI (14)',
        value: rsi,
        signal: rsi > 70 ? 'bearish' : rsi < 30 ? 'bullish' : 'neutral',
        description: rsi > 70 ? 'Overbought condition' : rsi < 30 ? 'Oversold condition' : 'Neutral momentum'
      })
    }

    // MACD
    const macd = calculateMACD(prices)
    if (macd) {
      indicators.push({
        name: 'MACD',
        value: macd.histogram,
        signal: macd.histogram > 0 ? 'bullish' : 'bearish',
        description: macd.histogram > 0 ? 'Bullish momentum' : 'Bearish momentum'
      })
    }

    // Bollinger Bands
    const bb = calculateBollingerBands(prices, 20, 2)
    if (bb) {
      const currentPrice = prices[prices.length - 1]
      const position = (currentPrice - bb.lower) / (bb.upper - bb.lower)
      
      indicators.push({
        name: 'Bollinger Bands',
        value: position * 100,
        signal: position > 0.8 ? 'bearish' : position < 0.2 ? 'bullish' : 'neutral',
        description: position > 0.8 ? 'Near upper band - potential reversal' : 
                    position < 0.2 ? 'Near lower band - potential bounce' : 
                    'Trading within bands'
      })
    }

    // Volume Analysis
    const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20
    const currentVolume = volumes[volumes.length - 1]
    const volumeRatio = currentVolume / avgVolume

    indicators.push({
      name: 'Volume Analysis',
      value: volumeRatio,
      signal: volumeRatio > 1.5 ? 'bullish' : volumeRatio < 0.5 ? 'bearish' : 'neutral',
      description: volumeRatio > 1.5 ? 'High volume - strong interest' : 
                  volumeRatio < 0.5 ? 'Low volume - weak interest' : 
                  'Normal volume levels'
    })

    return indicators
  }, [data])

  // Generate market insights
  const marketInsights = useMemo(() => {
    if (data.length < 10) return []

    const insights: MarketInsight[] = []
    const prices = data.map(d => d.close)
    const volumes = data.map(d => d.volume)
    const currentPrice = prices[prices.length - 1]

    // Trend Analysis
    const shortMA = calculateSMA(prices.slice(-5), 5)
    const longMA = calculateSMA(prices.slice(-20), 20)
    
    if (shortMA && longMA) {
      if (shortMA > longMA * 1.02) {
        insights.push({
          id: 'trend-bullish',
          type: 'trend',
          title: 'Strong Upward Trend',
          description: 'Short-term moving average is significantly above long-term average, indicating bullish momentum.',
          confidence: 'high',
          impact: 'positive'
        })
      } else if (shortMA < longMA * 0.98) {
        insights.push({
          id: 'trend-bearish',
          type: 'trend',
          title: 'Downward Trend Detected',
          description: 'Short-term moving average is below long-term average, suggesting bearish pressure.',
          confidence: 'high',
          impact: 'negative'
        })
      }
    }

    // Support/Resistance Levels
    const highs = data.slice(-20).map(d => d.high)
    const lows = data.slice(-20).map(d => d.low)
    const resistance = Math.max(...highs)
    const support = Math.min(...lows)

    if (currentPrice > resistance * 0.95) {
      insights.push({
        id: 'resistance-test',
        type: 'resistance',
        title: 'Testing Resistance Level',
        description: `Price is approaching key resistance at $${resistance.toFixed(4)}. Watch for potential breakout or reversal.`,
        confidence: 'medium',
        impact: 'neutral'
      })
    }

    if (currentPrice < support * 1.05) {
      insights.push({
        id: 'support-test',
        type: 'support',
        title: 'Near Support Level',
        description: `Price is close to support at $${support.toFixed(4)}. This could be a buying opportunity if support holds.`,
        confidence: 'medium',
        impact: 'positive'
      })
    }

    // Volume Analysis
    const recentVolume = volumes.slice(-5).reduce((a, b) => a + b, 0) / 5
    const historicalVolume = volumes.slice(-20, -5).reduce((a, b) => a + b, 0) / 15

    if (recentVolume > historicalVolume * 1.5) {
      insights.push({
        id: 'volume-spike',
        type: 'volume',
        title: 'Volume Spike Detected',
        description: 'Recent trading volume is significantly higher than average, indicating increased market interest.',
        confidence: 'high',
        impact: 'positive'
      })
    }

    // Volatility Analysis
    const volatility = calculateVolatility(prices.slice(-20))
    if (volatility > 0.05) {
      insights.push({
        id: 'high-volatility',
        type: 'volatility',
        title: 'High Volatility Period',
        description: 'Price volatility is elevated. Consider risk management strategies and position sizing.',
        confidence: 'high',
        impact: 'negative'
      })
    }

    return insights
  }, [data])

  // Pattern Recognition (simplified)
  const patterns = useMemo(() => {
    if (data.length < 10) return []

    const patterns = []
    const prices = data.map(d => d.close)

    // Double Top/Bottom detection (simplified)
    const recentHigh = Math.max(...prices.slice(-10))
    const recentLow = Math.min(...prices.slice(-10))
    const previousHigh = Math.max(...prices.slice(-20, -10))
    const previousLow = Math.min(...prices.slice(-20, -10))

    if (Math.abs(recentHigh - previousHigh) / previousHigh < 0.02) {
      patterns.push({
        name: 'Potential Double Top',
        description: 'Two similar highs detected, possible reversal pattern',
        reliability: 'medium'
      })
    }

    if (Math.abs(recentLow - previousLow) / previousLow < 0.02) {
      patterns.push({
        name: 'Potential Double Bottom',
        description: 'Two similar lows detected, possible reversal pattern',
        reliability: 'medium'
      })
    }

    return patterns
  }, [data])

  // Helper functions for technical analysis
  function calculateRSI(prices: number[], period: number): number | null {
    if (prices.length < period + 1) return null

    let gains = 0
    let losses = 0

    for (let i = 1; i <= period; i++) {
      const change = prices[prices.length - i] - prices[prices.length - i - 1]
      if (change > 0) gains += change
      else losses -= change
    }

    const avgGain = gains / period
    const avgLoss = losses / period
    const rs = avgGain / avgLoss

    return 100 - (100 / (1 + rs))
  }

  function calculateMACD(prices: number[]) {
    if (prices.length < 26) return null

    const ema12 = calculateEMA(prices, 12)
    const ema26 = calculateEMA(prices, 26)
    
    if (!ema12 || !ema26) return null

    const macdLine = ema12 - ema26
    const signalLine = calculateEMA([macdLine], 9) || 0
    const histogram = macdLine - signalLine

    return { macdLine, signalLine, histogram }
  }

  function calculateEMA(prices: number[], period: number): number | null {
    if (prices.length < period) return null

    const multiplier = 2 / (period + 1)
    let ema = prices[0]

    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier))
    }

    return ema
  }

  function calculateSMA(prices: number[], period: number): number | null {
    if (prices.length < period) return null
    return prices.slice(-period).reduce((a, b) => a + b, 0) / period
  }

  function calculateBollingerBands(prices: number[], period: number, stdDev: number) {
    if (prices.length < period) return null

    const sma = calculateSMA(prices, period)
    if (!sma) return null

    const recentPrices = prices.slice(-period)
    const variance = recentPrices.reduce((acc, price) => acc + Math.pow(price - sma, 2), 0) / period
    const standardDeviation = Math.sqrt(variance)

    return {
      upper: sma + (standardDeviation * stdDev),
      middle: sma,
      lower: sma - (standardDeviation * stdDev)
    }
  }

  function calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0

    const returns = []
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1])
    }

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
    const variance = returns.reduce((acc, ret) => acc + Math.pow(ret - avgReturn, 2), 0) / returns.length

    return Math.sqrt(variance)
  }

  const getSignalColor = (signal: 'bullish' | 'bearish' | 'neutral') => {
    switch (signal) {
      case 'bullish':
        return 'text-green-600 dark:text-green-400'
      case 'bearish':
        return 'text-red-600 dark:text-red-400'
      case 'neutral':
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getSignalIcon = (signal: 'bullish' | 'bearish' | 'neutral') => {
    switch (signal) {
      case 'bullish':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
      case 'bearish':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
      case 'neutral':
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />
    }
  }

  const getInsightIcon = (type: MarketInsight['type']) => {
    switch (type) {
      case 'trend':
        return <ArrowTrendingUpIcon className="h-4 w-4" />
      case 'volume':
        return <ChartBarIcon className="h-4 w-4" />
      default:
        return <LightBulbIcon className="h-4 w-4" />
    }
  }

  const getConfidenceColor = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'low':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    }
  }

  const tabs = [
    { key: 'indicators', label: 'Technical Indicators', count: technicalIndicators.length },
    { key: 'insights', label: 'Market Insights', count: marketInsights.length },
    { key: 'patterns', label: 'Chart Patterns', count: patterns.length },
  ] as const

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <ChartBarIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {symbol} Price Analytics
          </h3>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          {timeframe} analysis
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key)}
            className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedTab === tab.key
                ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className="bg-gray-200 dark:bg-gray-600 text-xs px-1.5 py-0.5 rounded-full">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[300px]">
        {selectedTab === 'indicators' && (
          <div className="space-y-4">
            {technicalIndicators.length === 0 ? (
              <div className="text-center py-8">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Not enough data for technical analysis
                </p>
              </div>
            ) : (
              technicalIndicators.map((indicator, index) => (
                <motion.div
                  key={indicator.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getSignalIcon(indicator.signal)}
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {indicator.name}
                      </h4>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {indicator.value.toFixed(2)}
                      </div>
                      <div className={`text-sm font-medium ${getSignalColor(indicator.signal)}`}>
                        {indicator.signal.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {indicator.description}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        )}

        {selectedTab === 'insights' && (
          <div className="space-y-4">
            {marketInsights.length === 0 ? (
              <div className="text-center py-8">
                <LightBulbIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No significant market insights detected
                </p>
              </div>
            ) : (
              marketInsights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getInsightIcon(insight.type)}
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {insight.title}
                      </h4>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConfidenceColor(insight.confidence)}`}>
                      {insight.confidence} confidence
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {insight.description}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        )}

        {selectedTab === 'patterns' && (
          <div className="space-y-4">
            {patterns.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No chart patterns detected
                </p>
              </div>
            ) : (
              patterns.map((pattern, index) => (
                <motion.div
                  key={pattern.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {pattern.name}
                    </h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConfidenceColor(pattern.reliability as any)}`}>
                      {pattern.reliability} reliability
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {pattern.description}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600 mt-0.5" />
          <div className="text-xs text-yellow-700 dark:text-yellow-300">
            <p className="font-medium mb-1">Disclaimer:</p>
            <p>
              Technical analysis and market insights are for informational purposes only and should not be considered as financial advice. 
              Always conduct your own research and consider consulting with a financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PriceAnalytics