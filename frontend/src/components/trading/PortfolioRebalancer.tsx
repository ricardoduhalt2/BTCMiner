import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ScaleIcon,
  ArrowPathIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'

interface Asset {
  symbol: string
  name: string
  balance: string
  value: number
  allocation: number
  targetAllocation: number
  price: number
  change24h: number
}

interface RebalanceAction {
  symbol: string
  action: 'buy' | 'sell'
  amount: string
  value: number
  fromSymbol?: string
  toSymbol?: string
}

interface PortfolioRebalancerProps {
  assets?: Asset[]
  onRebalance?: (actions: RebalanceAction[]) => Promise<void>
}

const PortfolioRebalancer: React.FC<PortfolioRebalancerProps> = ({
  assets = [
    { symbol: 'BTM', name: 'BTCMiner', balance: '1,250.50', value: 562.73, allocation: 45, targetAllocation: 40, price: 0.45, change24h: 12.5 },
    { symbol: 'ETH', name: 'Ethereum', balance: '0.25', value: 600, allocation: 48, targetAllocation: 35, price: 2400, change24h: -2.3 },
    { symbol: 'BNB', name: 'BNB', balance: '0.28', value: 86.8, allocation: 7, targetAllocation: 15, price: 310, change24h: 5.7 },
    { symbol: 'SOL', name: 'Solana', balance: '0.0', value: 0, allocation: 0, targetAllocation: 10, price: 95, change24h: 8.9 }
  ],
  onRebalance
}) => {
  const [isRebalancing, setIsRebalancing] = useState(false)
  const [rebalanceActions, setRebalanceActions] = useState<RebalanceAction[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [customAllocations, setCustomAllocations] = useState<Record<string, number>>({})
  const [rebalanceHistory, setRebalanceHistory] = useState<Array<{
    id: string
    timestamp: string
    actions: RebalanceAction[]
  }>>([])

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0)

  // Calculate rebalance actions when assets or custom allocations change
  useEffect(() => {
    const actions: RebalanceAction[] = []
    
    // Calculate current allocations
    const currentAllocations = assets.reduce((acc, asset) => {
      acc[asset.symbol] = asset.allocation
      return acc
    }, {} as Record<string, number>)

    // Use custom allocations if set, otherwise use target allocations
    const targetAllocations = assets.reduce((acc, asset) => {
      acc[asset.symbol] = customAllocations[asset.symbol] !== undefined 
        ? customAllocations[asset.symbol] 
        : asset.targetAllocation
      return acc
    }, {} as Record<string, number>)

    // Calculate differences
    const differences = assets.map(asset => {
      const target = targetAllocations[asset.symbol]
      const current = currentAllocations[asset.symbol]
      const difference = target - current
      return { symbol: asset.symbol, difference, value: (difference / 100) * totalValue }
    })

    // Sort by absolute difference (largest first)
    differences.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))

    // Generate buy/sell actions
    differences.forEach(diff => {
      if (Math.abs(diff.difference) < 1) return // Skip small differences

      const asset = assets.find(a => a.symbol === diff.symbol)
      if (!asset) return

      if (diff.difference > 0) {
        // Need to buy
        actions.push({
          symbol: diff.symbol,
          action: 'buy',
          amount: (diff.value / asset.price).toFixed(4),
          value: diff.value
        })
      } else if (diff.difference < 0) {
        // Need to sell
        actions.push({
          symbol: diff.symbol,
          action: 'sell',
          amount: (Math.abs(diff.value) / asset.price).toFixed(4),
          value: Math.abs(diff.value)
        })
      }
    })

    setRebalanceActions(actions)
  }, [assets, customAllocations, totalValue])

  const handleRebalance = async () => {
    if (rebalanceActions.length === 0) return

    setIsRebalancing(true)
    try {
      if (onRebalance) {
        await onRebalance(rebalanceActions)
      }

      // Add to history
      const historyEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        actions: [...rebalanceActions]
      }
      setRebalanceHistory(prev => [historyEntry, ...prev])

      // Reset custom allocations
      setCustomAllocations({})
    } catch (error) {
      console.error('Rebalance failed:', error)
    } finally {
      setIsRebalancing(false)
    }
  }

  const handleCustomAllocationChange = (symbol: string, value: number) => {
    setCustomAllocations(prev => ({ ...prev, [symbol]: value }))
  }

  const getAllocationColor = (current: number, target: number) => {
    const diff = Math.abs(current - target)
    if (diff < 3) return 'text-green-600 dark:text-green-400'
    if (diff < 10) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getTotalCustomAllocation = () => {
    return assets.reduce((sum, asset) => {
      return sum + (customAllocations[asset.symbol] !== undefined 
        ? customAllocations[asset.symbol] 
        : asset.targetAllocation)
    }, 0)
  }

  const isValidAllocation = getTotalCustomAllocation() === 100

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <ScaleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Portfolio Rebalancer
          </h3>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
            <span>{showAdvanced ? 'Simple' : 'Advanced'}</span>
          </button>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Value: <span className="font-medium text-gray-900 dark:text-gray-100">
              ${totalValue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Current Portfolio</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Asset</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current %</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target %</th>
                {showAdvanced && (
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Custom %</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {assets.map((asset, index) => (
                <tr key={asset.symbol} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700/50' : ''}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                          {asset.symbol[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{asset.symbol}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{asset.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{asset.balance}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      ${asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      ${asset.value.toLocaleString()}
                    </div>
                    <div className={`text-sm ${asset.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{asset.allocation}%</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className={`font-medium ${getAllocationColor(asset.allocation, asset.targetAllocation)}`}>
                      {asset.targetAllocation}%
                    </div>
                  </td>
                  {showAdvanced && (
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={customAllocations[asset.symbol] !== undefined ? customAllocations[asset.symbol] : asset.targetAllocation}
                        onChange={(e) => handleCustomAllocationChange(asset.symbol, parseInt(e.target.value) || 0)}
                        className="w-16 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-right"
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {showAdvanced && (
          <div className="mt-2 text-right">
            <span className={`text-sm font-medium ${isValidAllocation ? 'text-green-600' : 'text-red-600'}`}>
              Total: {getTotalCustomAllocation()}%
              {!isValidAllocation && ' (must equal 100%)'}
            </span>
          </div>
        )}
      </div>

      {/* Rebalance Actions */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Rebalance Actions</h4>
        {rebalanceActions.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Portfolio is already balanced</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rebalanceActions.map((action, index) => (
              <motion.div
                key={`${action.symbol}-${action.action}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-lg p-4 ${
                  action.action === 'buy' 
                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                    : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      action.action === 'buy' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                        : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    }`}>
                      {action.action === 'buy' ? '+' : '-'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {action.action === 'buy' ? 'Buy' : 'Sell'} {action.amount} {action.symbol}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Value: ${action.value.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleRebalance}
                disabled={isRebalancing || !isValidAllocation}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isRebalancing ? (
                  <>
                    <ClockIcon className="w-4 h-4 animate-spin" />
                    <span>Rebalancing...</span>
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="w-4 h-4" />
                    <span>Rebalance Portfolio</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rebalance History */}
      {rebalanceHistory.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Rebalance History</h4>
          <div className="space-y-2">
            {rebalanceHistory.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span className="text-gray-900 dark:text-gray-100">
                    Rebalanced {entry.actions.length} assets
                  </span>
                </div>
                <span className="text-gray-500 dark:text-gray-400">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Information Panel */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">About Portfolio Rebalancing</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Rebalancing helps maintain your desired risk level</li>
                <li>• Regular rebalancing can improve long-term returns</li>
                <li>• Consider tax implications before rebalancing</li>
                <li>• Advanced mode allows custom allocation targets</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PortfolioRebalancer