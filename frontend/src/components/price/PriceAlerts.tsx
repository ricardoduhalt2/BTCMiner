import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BellIcon,
  BellSlashIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline'
import { useAppDispatch } from '@hooks/redux'
import { addNotification } from '@store/slices/uiSlice'

interface PriceAlert {
  id: string
  symbol: string
  condition: 'above' | 'below' | 'change_up' | 'change_down'
  targetPrice?: number
  changePercentage?: number
  isActive: boolean
  createdAt: Date
  triggeredAt?: Date
  description: string
}

interface PriceAlertsProps {
  symbol?: string
  currentPrice: number
}

const PriceAlerts: React.FC<PriceAlertsProps> = ({
  symbol = 'BTM',
  currentPrice
}) => {
  const dispatch = useAppDispatch()
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newAlert, setNewAlert] = useState({
    condition: 'above' as const,
    targetPrice: '',
    changePercentage: '',
  })

  // Mock initial alerts
  useEffect(() => {
    const mockAlerts: PriceAlert[] = [
      {
        id: '1',
        symbol,
        condition: 'above',
        targetPrice: 30.00,
        isActive: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        description: 'Alert when BTM goes above $30.00'
      },
      {
        id: '2',
        symbol,
        condition: 'below',
        targetPrice: 20.00,
        isActive: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        description: 'Alert when BTM goes below $20.00'
      },
      {
        id: '3',
        symbol,
        condition: 'change_up',
        changePercentage: 10,
        isActive: false,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        triggeredAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        description: 'Alert when BTM increases by 10%'
      }
    ]
    setAlerts(mockAlerts)
  }, [symbol])

  const handleCreateAlert = () => {
    if (newAlert.condition === 'above' || newAlert.condition === 'below') {
      if (!newAlert.targetPrice || parseFloat(newAlert.targetPrice) <= 0) {
        dispatch(addNotification({
          type: 'error',
          message: 'Please enter a valid target price'
        }))
        return
      }
    } else {
      if (!newAlert.changePercentage || parseFloat(newAlert.changePercentage) <= 0) {
        dispatch(addNotification({
          type: 'error',
          message: 'Please enter a valid percentage change'
        }))
        return
      }
    }

    const alert: PriceAlert = {
      id: Date.now().toString(),
      symbol,
      condition: newAlert.condition,
      targetPrice: newAlert.targetPrice ? parseFloat(newAlert.targetPrice) : undefined,
      changePercentage: newAlert.changePercentage ? parseFloat(newAlert.changePercentage) : undefined,
      isActive: true,
      createdAt: new Date(),
      description: generateAlertDescription(newAlert)
    }

    setAlerts(prev => [alert, ...prev])
    setNewAlert({
      condition: 'above',
      targetPrice: '',
      changePercentage: '',
    })
    setShowCreateForm(false)

    dispatch(addNotification({
      type: 'success',
      message: 'Price alert created successfully!'
    }))
  }

  const generateAlertDescription = (alert: typeof newAlert) => {
    switch (alert.condition) {
      case 'above':
        return `Alert when ${symbol} goes above $${alert.targetPrice}`
      case 'below':
        return `Alert when ${symbol} goes below $${alert.targetPrice}`
      case 'change_up':
        return `Alert when ${symbol} increases by ${alert.changePercentage}%`
      case 'change_down':
        return `Alert when ${symbol} decreases by ${alert.changePercentage}%`
      default:
        return 'Price alert'
    }
  }

  const handleDeleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
    dispatch(addNotification({
      type: 'info',
      message: 'Price alert deleted'
    }))
  }

  const handleToggleAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, isActive: !alert.isActive }
        : alert
    ))
  }

  const getAlertIcon = (condition: PriceAlert['condition']) => {
    switch (condition) {
      case 'above':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
      case 'below':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
      case 'change_up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-blue-600" />
      case 'change_down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-orange-600" />
      default:
        return <BellIcon className="h-4 w-4 text-gray-600" />
    }
  }

  const getAlertStatus = (alert: PriceAlert) => {
    if (alert.triggeredAt) {
      return (
        <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
          <CheckCircleIcon className="h-3 w-3" />
          <span>Triggered</span>
        </div>
      )
    }
    
    if (!alert.isActive) {
      return (
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <BellSlashIcon className="h-3 w-3" />
          <span>Disabled</span>
        </div>
      )
    }

    return (
      <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
        <BellIcon className="h-3 w-3" />
        <span>Active</span>
      </div>
    )
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value)
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BellIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Price Alerts
          </h3>
          <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs font-medium px-2 py-1 rounded-full">
            {alerts.filter(a => a.isActive).length} active
          </span>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          <PlusIcon className="h-4 w-4" />
          <span>New Alert</span>
        </button>
      </div>

      {/* Current Price Display */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Current {symbol} Price</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {formatPrice(currentPrice)}
          </span>
        </div>
      </div>

      {/* Create Alert Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6"
          >
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Create New Alert</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alert Condition
                </label>
                <select
                  value={newAlert.condition}
                  onChange={(e) => setNewAlert(prev => ({ 
                    ...prev, 
                    condition: e.target.value as any,
                    targetPrice: '',
                    changePercentage: ''
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="above">Price goes above</option>
                  <option value="below">Price goes below</option>
                  <option value="change_up">Price increases by %</option>
                  <option value="change_down">Price decreases by %</option>
                </select>
              </div>

              {(newAlert.condition === 'above' || newAlert.condition === 'below') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newAlert.targetPrice}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, targetPrice: e.target.value }))}
                    placeholder="Enter target price"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              )}

              {(newAlert.condition === 'change_up' || newAlert.condition === 'change_down') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Percentage Change (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newAlert.changePercentage}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, changePercentage: e.target.value }))}
                    placeholder="Enter percentage"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              )}

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCreateAlert}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Create Alert
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No price alerts
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Create your first alert to get notified about price changes
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-lg p-4 transition-colors ${
                alert.isActive
                  ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getAlertIcon(alert.condition)}
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {alert.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      {getAlertStatus(alert)}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Created {formatTimeAgo(alert.createdAt)}
                      </span>
                      {alert.triggeredAt && (
                        <span className="text-xs text-green-600 dark:text-green-400">
                          Triggered {formatTimeAgo(alert.triggeredAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleAlert(alert.id)}
                    className={`p-1 rounded transition-colors ${
                      alert.isActive
                        ? 'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                        : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    title={alert.isActive ? 'Disable alert' : 'Enable alert'}
                  >
                    {alert.isActive ? (
                      <BellIcon className="h-4 w-4" />
                    ) : (
                      <BellSlashIcon className="h-4 w-4" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Delete alert"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Alert Info */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <ExclamationTriangleIcon className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">About Price Alerts:</p>
            <ul className="space-y-1">
              <li>• Alerts are checked every minute for price changes</li>
              <li>• You'll receive notifications when conditions are met</li>
              <li>• Percentage alerts are based on 24-hour price changes</li>
              <li>• Triggered alerts are automatically disabled</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PriceAlerts