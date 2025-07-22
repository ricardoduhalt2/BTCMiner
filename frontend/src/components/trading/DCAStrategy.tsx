import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

interface DCAStrategy {
  id: string
  name: string
  asset: string
  amount: number
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  status: 'active' | 'paused'
  nextExecution: string
  totalInvested: number
  averagePrice: number
  totalUnits: number
  createdAt: string
}

interface DCAStrategyProps {
  strategies?: DCAStrategy[]
  availableAssets?: Array<{
    symbol: string
    name: string
    price: number
  }>
  onCreateStrategy?: (strategy: Omit<DCAStrategy, 'id' | 'status' | 'nextExecution' | 'totalInvested' | 'averagePrice' | 'totalUnits' | 'createdAt'>) => Promise<void>
  onUpdateStrategy?: (id: string, updates: Partial<DCAStrategy>) => Promise<void>
  onDeleteStrategy?: (id: string) => Promise<void>
}

const DCAStrategy: React.FC<DCAStrategyProps> = ({
  strategies = [
    {
      id: '1',
      name: 'Weekly BTM',
      asset: 'BTM',
      amount: 50,
      frequency: 'weekly',
      status: 'active',
      nextExecution: '2024-01-22T10:00:00Z',
      totalInvested: 650,
      averagePrice: 0.42,
      totalUnits: 1547.62,
      createdAt: '2023-12-01T10:00:00Z'
    },
    {
      id: '2',
      name: 'Monthly ETH',
      asset: 'ETH',
      amount: 200,
      frequency: 'monthly',
      status: 'active',
      nextExecution: '2024-02-01T10:00:00Z',
      totalInvested: 600,
      averagePrice: 2350,
      totalUnits: 0.2553,
      createdAt: '2023-11-01T10:00:00Z'
    }
  ],
  availableAssets = [
    { symbol: 'BTM', name: 'BTCMiner', price: 0.45 },
    { symbol: 'ETH', name: 'Ethereum', price: 2400 },
    { symbol: 'BNB', name: 'BNB', price: 310 },
    { symbol: 'SOL', name: 'Solana', price: 95 }
  ],
  onCreateStrategy,
  onUpdateStrategy,
  onDeleteStrategy
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingStrategy, setEditingStrategy] = useState<DCAStrategy | null>(null)
  const [newStrategy, setNewStrategy] = useState({
    name: '',
    asset: availableAssets[0]?.symbol || '',
    amount: 50,
    frequency: 'weekly' as const
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateStrategy = async () => {
    if (!newStrategy.name || !newStrategy.asset || newStrategy.amount <= 0) return

    setIsSubmitting(true)
    try {
      if (onCreateStrategy) {
        await onCreateStrategy(newStrategy)
      }

      // Reset form and close modal
      setNewStrategy({
        name: '',
        asset: availableAssets[0]?.symbol || '',
        amount: 50,
        frequency: 'weekly'
      })
      setShowCreateModal(false)
    } catch (error) {
      console.error('Failed to create strategy:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateStrategy = async () => {
    if (!editingStrategy) return

    setIsSubmitting(true)
    try {
      if (onUpdateStrategy) {
        await onUpdateStrategy(editingStrategy.id, {
          name: editingStrategy.name,
          amount: editingStrategy.amount,
          frequency: editingStrategy.frequency
        })
      }
      setEditingStrategy(null)
    } catch (error) {
      console.error('Failed to update strategy:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteStrategy = async (id: string) => {
    if (!onDeleteStrategy) return
    try {
      await onDeleteStrategy(id)
    } catch (error) {
      console.error('Failed to delete strategy:', error)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: 'active' | 'paused') => {
    if (!onUpdateStrategy) return
    try {
      await onUpdateStrategy(id, {
        status: currentStatus === 'active' ? 'paused' : 'active'
      })
    } catch (error) {
      console.error('Failed to toggle status:', error)
    }
  }

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Daily'
      case 'weekly': return 'Weekly'
      case 'biweekly': return 'Bi-weekly'
      case 'monthly': return 'Monthly'
      default: return frequency
    }
  }

  const getNextExecutionText = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 7) return `In ${diffDays} days`
    return date.toLocaleDateString()
  }

  const totalInvested = strategies.reduce((sum, strategy) => sum + strategy.totalInvested, 0)
  const activeStrategies = strategies.filter(s => s.status === 'active').length

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            DCA Strategy
          </h3>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Active Strategies: <span className="font-medium text-gray-900 dark:text-gray-100">
              {activeStrategies}
            </span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Invested: <span className="font-medium text-gray-900 dark:text-gray-100">
              ${totalInvested.toLocaleString()}
            </span>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm flex items-center space-x-1"
          >
            <PlusIcon className="w-4 h-4" />
            <span>New Strategy</span>
          </button>
        </div>
      </div>

      {/* Strategies List */}
      <div className="space-y-4">
        {strategies.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No DCA strategies found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
            >
              Create your first strategy
            </button>
          </div>
        ) : (
          strategies.map((strategy, index) => (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border rounded-lg p-4 ${
                strategy.status === 'active' 
                  ? 'border-green-200 dark:border-green-800' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {strategy.name}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      strategy.status === 'active' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                      {strategy.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Asset</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{strategy.asset}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">${strategy.amount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Frequency</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {getFrequencyLabel(strategy.frequency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Next Execution</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {getNextExecutionText(strategy.nextExecution)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total Invested</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        ${strategy.totalInvested.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Average Price</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        ${strategy.averagePrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total Units</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {strategy.totalUnits.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => handleToggleStatus(strategy.id, strategy.status)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      strategy.status === 'active'
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {strategy.status === 'active' ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    onClick={() => setEditingStrategy(strategy)}
                    className="px-3 py-1 rounded-md text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/30"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteStrategy(strategy.id)}
                    className="px-3 py-1 rounded-md text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/30"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Strategy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Create DCA Strategy
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Strategy Name
                </label>
                <input
                  type="text"
                  value={newStrategy.name}
                  onChange={(e) => setNewStrategy(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Weekly ETH Investment"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Asset
                </label>
                <select
                  value={newStrategy.asset}
                  onChange={(e) => setNewStrategy(prev => ({ ...prev, asset: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {availableAssets.map(asset => (
                    <option key={asset.symbol} value={asset.symbol}>
                      {asset.symbol} - {asset.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  value={newStrategy.amount}
                  onChange={(e) => setNewStrategy(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  min="1"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Frequency
                </label>
                <select
                  value={newStrategy.frequency}
                  onChange={(e) => setNewStrategy(prev => ({ ...prev, frequency: e.target.value as any }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <CurrencyDollarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      You will invest ${newStrategy.amount} in {newStrategy.asset} {getFrequencyLabel(newStrategy.frequency).toLowerCase()}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateStrategy}
                disabled={!newStrategy.name || !newStrategy.asset || newStrategy.amount <= 0 || isSubmitting}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Strategy'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Strategy Modal */}
      {editingStrategy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Edit Strategy
              </h3>
              <button
                onClick={() => setEditingStrategy(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Strategy Name
                </label>
                <input
                  type="text"
                  value={editingStrategy.name}
                  onChange={(e) => setEditingStrategy(prev => ({ ...prev!, name: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Asset
                </label>
                <input
                  type="text"
                  value={editingStrategy.asset}
                  disabled
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Asset cannot be changed after creation
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  value={editingStrategy.amount}
                  onChange={(e) => setEditingStrategy(prev => ({ ...prev!, amount: parseFloat(e.target.value) || 0 }))}
                  min="1"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Frequency
                </label>
                <select
                  value={editingStrategy.frequency}
                  onChange={(e) => setEditingStrategy(prev => ({ ...prev!, frequency: e.target.value as any }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setEditingStrategy(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStrategy}
                disabled={!editingStrategy.name || editingStrategy.amount <= 0 || isSubmitting}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Updating...' : 'Update Strategy'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Information Panel */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">About Dollar-Cost Averaging</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• DCA reduces the impact of volatility on your investments</li>
                <li>• Invest a fixed amount at regular intervals regardless of price</li>
                <li>• Helps avoid emotional decision-making in volatile markets</li>
                <li>• Builds positions over time without timing the market</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DCAStrategy