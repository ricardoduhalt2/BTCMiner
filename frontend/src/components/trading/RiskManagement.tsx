import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CalculatorIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  InformationCircleIcon,
  BellIcon,
  StopIcon
} from '@heroicons/react/24/outline'

interface RiskMetrics {
  portfolioValue: number
  totalRisk: number
  riskLevel: 'low' | 'medium' | 'high' | 'extreme'
  maxDrawdown: number
  sharpeRatio: number
  volatility: number
  beta: number
  var95: number // Value at Risk 95%
  expectedReturn: number
}

interface Position {
  symbol: string
  amount: number
  value: number
  allocation: number
  risk: number
  stopLoss?: number
  takeProfit?: number
}

interface RiskAlert {
  id: string
  type: 'position_size' | 'portfolio_risk' | 'drawdown' | 'volatility'
  severity: 'low' | 'medium' | 'high'
  message: string
  threshold: number
  currentValue: number
  timestamp: string
}

interface RiskManagementProps {
  positions?: Position[]
  riskMetrics?: RiskMetrics
  onUpdateStopLoss?: (symbol: string, stopLoss: number) => Promise<void>
  onUpdateTakeProfit?: (symbol: string, takeProfit: number) => Promise<void>
  onClosePosition?: (symbol: string, percentage: number) => Promise<void>
}

const RiskManagement: React.FC<RiskManagementProps> = ({
  positions = [
    { symbol: 'BTM', amount: 1250.5, value: 562.73, allocation: 45, risk: 0.15, stopLoss: 0.38, takeProfit: 0.55 },
    { symbol: 'ETH', amount: 0.25, value: 600, allocation: 48, risk: 0.22, stopLoss: 2200, takeProfit: 2800 },
    { symbol: 'BNB', amount: 0.28, value: 86.8, allocation: 7, risk: 0.18, stopLoss: 280, takeProfit: 350 }
  ],
  riskMetrics = {
    portfolioValue: 1249.53,
    totalRisk: 0.18,
    riskLevel: 'medium',
    maxDrawdown: -12.5,
    sharpeRatio: 1.45,
    volatility: 0.28,
    beta: 1.15,
    var95: -89.2,
    expectedReturn: 0.15
  },
  onUpdateStopLoss,
  onUpdateTakeProfit,
  onClosePosition
}) => {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([
    {
      id: '1',
      type: 'position_size',
      severity: 'medium',
      message: 'ETH position exceeds 40% of portfolio',
      threshold: 40,
      currentValue: 48,
      timestamp: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      type: 'portfolio_risk',
      severity: 'low',
      message: 'Portfolio volatility is within acceptable range',
      threshold: 30,
      currentValue: 28,
      timestamp: '2024-01-15T09:15:00Z'
    }
  ])
  const [positionSizeCalculator, setPositionSizeCalculator] = useState({
    accountSize: 10000,
    riskPerTrade: 2,
    entryPrice: 0,
    stopLoss: 0,
    symbol: 'BTM'
  })
  const [showCalculator, setShowCalculator] = useState(false)

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20'
      case 'extreme': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const calculatePositionSize = () => {
    const { accountSize, riskPerTrade, entryPrice, stopLoss } = positionSizeCalculator
    if (!entryPrice || !stopLoss || entryPrice === stopLoss) return 0

    const riskAmount = (accountSize * riskPerTrade) / 100
    const riskPerShare = Math.abs(entryPrice - stopLoss)
    const positionSize = riskAmount / riskPerShare

    return positionSize
  }

  const handleUpdateStopLoss = async (position: Position, newStopLoss: number) => {
    try {
      if (onUpdateStopLoss) {
        await onUpdateStopLoss(position.symbol, newStopLoss)
      }
      // Update local state
      const updatedPositions = positions.map(p => 
        p.symbol === position.symbol ? { ...p, stopLoss: newStopLoss } : p
      )
      // This would normally update the parent state
    } catch (error) {
      console.error('Failed to update stop loss:', error)
    }
  }

  const handleUpdateTakeProfit = async (position: Position, newTakeProfit: number) => {
    try {
      if (onUpdateTakeProfit) {
        await onUpdateTakeProfit(position.symbol, newTakeProfit)
      }
      // Update local state
      const updatedPositions = positions.map(p => 
        p.symbol === position.symbol ? { ...p, takeProfit: newTakeProfit } : p
      )
      // This would normally update the parent state
    } catch (error) {
      console.error('Failed to update take profit:', error)
    }
  }

  const handleClosePosition = async (position: Position, percentage: number) => {
    try {
      if (onClosePosition) {
        await onClosePosition(position.symbol, percentage)
      }
    } catch (error) {
      console.error('Failed to close position:', error)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <ShieldCheckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Risk Management
          </h3>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            <CalculatorIcon className="w-4 h-4" />
            <span>Position Calculator</span>
          </button>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Portfolio Risk: <span className={`font-medium px-2 py-1 rounded-full text-xs ${getRiskLevelColor(riskMetrics.riskLevel)}`}>
              {riskMetrics.riskLevel.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Risk Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Risk</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {(riskMetrics.totalRisk * 100).toFixed(1)}%
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Max Drawdown</p>
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                {riskMetrics.maxDrawdown.toFixed(1)}%
              </p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sharpe Ratio</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                {riskMetrics.sharpeRatio.toFixed(2)}
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">VaR (95%)</p>
              <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                ${Math.abs(riskMetrics.var95).toFixed(0)}
              </p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </div>

      {/* Position Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Position Size Calculator
              </h3>
              <button
                onClick={() => setShowCalculator(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Size ($)
                </label>
                <input
                  type="number"
                  value={positionSizeCalculator.accountSize}
                  onChange={(e) => setPositionSizeCalculator(prev => ({ 
                    ...prev, 
                    accountSize: parseFloat(e.target.value) || 0 
                  }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Risk Per Trade (%)
                </label>
                <input
                  type="number"
                  value={positionSizeCalculator.riskPerTrade}
                  onChange={(e) => setPositionSizeCalculator(prev => ({ 
                    ...prev, 
                    riskPerTrade: parseFloat(e.target.value) || 0 
                  }))}
                  min="0.1"
                  max="10"
                  step="0.1"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Entry Price ($)
                </label>
                <input
                  type="number"
                  value={positionSizeCalculator.entryPrice}
                  onChange={(e) => setPositionSizeCalculator(prev => ({ 
                    ...prev, 
                    entryPrice: parseFloat(e.target.value) || 0 
                  }))}
                  step="0.0001"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stop Loss ($)
                </label>
                <input
                  type="number"
                  value={positionSizeCalculator.stopLoss}
                  onChange={(e) => setPositionSizeCalculator(prev => ({ 
                    ...prev, 
                    stopLoss: parseFloat(e.target.value) || 0 
                  }))}
                  step="0.0001"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CalculatorIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-medium text-blue-800 dark:text-blue-300">Calculated Position Size</h4>
                </div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {calculatePositionSize().toFixed(4)} {positionSizeCalculator.symbol}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Risk Amount: ${((positionSizeCalculator.accountSize * positionSizeCalculator.riskPerTrade) / 100).toFixed(2)}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCalculator(false)}
              className="w-full mt-6 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      {/* Risk Alerts */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Risk Alerts</h4>
        <div className="space-y-2">
          {riskAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-lg p-3 ${
                alert.severity === 'high' 
                  ? 'border-red-200 dark:border-red-800' 
                  : alert.severity === 'medium'
                  ? 'border-yellow-200 dark:border-yellow-800'
                  : 'border-blue-200 dark:border-blue-800'
              }`}
            >
              <div className="flex items-start space-x-3">
                <BellIcon className={`w-5 h-5 mt-0.5 ${
                  alert.severity === 'high' 
                    ? 'text-red-600 dark:text-red-400' 
                    : alert.severity === 'medium'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{alert.message}</p>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Current: {alert.currentValue}% | Threshold: {alert.threshold}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Position Management */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">Position Management</h4>
        
        {positions.map((position, index) => (
          <motion.div
            key={position.symbol}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-gray-100">{position.symbol}</h5>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {position.amount.toLocaleString()} tokens • ${position.value.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Allocation</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{position.allocation}%</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Stop Loss
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={position.stopLoss || ''}
                    onChange={(e) => {
                      const newStopLoss = parseFloat(e.target.value)
                      if (!isNaN(newStopLoss)) {
                        handleUpdateStopLoss(position, newStopLoss)
                      }
                    }}
                    step="0.01"
                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <StopIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Take Profit
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={position.takeProfit || ''}
                    onChange={(e) => {
                      const newTakeProfit = parseFloat(e.target.value)
                      if (!isNaN(newTakeProfit)) {
                        handleUpdateTakeProfit(position, newTakeProfit)
                      }
                    }}
                    step="0.01"
                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <ChartBarIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Position Risk
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        position.risk < 0.1 ? 'bg-green-500' :
                        position.risk < 0.2 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(position.risk * 500, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {(position.risk * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleClosePosition(position, 25)}
                className="flex-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 py-2 px-3 rounded-md text-sm hover:bg-yellow-200 dark:hover:bg-yellow-800/30"
              >
                Close 25%
              </button>
              <button
                onClick={() => handleClosePosition(position, 50)}
                className="flex-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 py-2 px-3 rounded-md text-sm hover:bg-orange-200 dark:hover:bg-orange-800/30"
              >
                Close 50%
              </button>
              <button
                onClick={() => handleClosePosition(position, 100)}
                className="flex-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 py-2 px-3 rounded-md text-sm hover:bg-red-200 dark:hover:bg-red-800/30"
              >
                Close All
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Risk Management Tips */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Risk Management Best Practices</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Never risk more than 1-2% of your account on a single trade</li>
                <li>• Always use stop losses to limit downside risk</li>
                <li>• Diversify across different assets and chains</li>
                <li>• Monitor portfolio correlation to avoid concentration risk</li>
                <li>• Regularly review and adjust risk parameters</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RiskManagement