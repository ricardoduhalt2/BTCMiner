import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon,
  ArrowsRightLeftIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'

interface TradingOrder {
  id: string
  type: 'market' | 'limit' | 'stop-loss' | 'take-profit'
  side: 'buy' | 'sell'
  tokenPair: string
  amount: string
  price?: string
  stopPrice?: string
  status: 'pending' | 'filled' | 'cancelled' | 'partial'
  createdAt: string
  filledAmount?: string
  averagePrice?: string
}

interface TradingInterfaceProps {
  availableTokens?: Array<{
    symbol: string
    name: string
    balance: string
    price: number
    change24h: number
  }>
  onPlaceOrder?: (order: Omit<TradingOrder, 'id' | 'status' | 'createdAt'>) => Promise<void>
  onCancelOrder?: (orderId: string) => Promise<void>
}

const TradingInterface: React.FC<TradingInterfaceProps> = ({
  availableTokens = [
    { symbol: 'BTM', name: 'BTCMiner', balance: '1,250.50', price: 0.45, change24h: 12.5 },
    { symbol: 'ETH', name: 'Ethereum', balance: '2.45', price: 2400, change24h: -2.3 },
    { symbol: 'BNB', name: 'BNB', balance: '15.8', price: 310, change24h: 5.7 },
    { symbol: 'SOL', name: 'Solana', balance: '45.2', price: 95, change24h: 8.9 }
  ],
  onPlaceOrder,
  onCancelOrder
}) => {
  const [selectedPair, setSelectedPair] = useState('BTM/ETH')
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop-loss' | 'take-profit'>('market')
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState('')
  const [price, setPrice] = useState('')
  const [stopPrice, setStopPrice] = useState('')
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [activeOrders, setActiveOrders] = useState<TradingOrder[]>([
    {
      id: '1',
      type: 'limit',
      side: 'buy',
      tokenPair: 'BTM/ETH',
      amount: '1000',
      price: '0.42',
      status: 'pending',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      type: 'stop-loss',
      side: 'sell',
      tokenPair: 'BTM/ETH',
      amount: '500',
      price: '0.40',
      stopPrice: '0.41',
      status: 'pending',
      createdAt: '2024-01-15T09:15:00Z'
    }
  ])

  const [baseToken, quoteToken] = selectedPair.split('/')
  const baseTokenData = availableTokens.find(t => t.symbol === baseToken)
  const quoteTokenData = availableTokens.find(t => t.symbol === quoteToken)
  const currentPrice = baseTokenData ? baseTokenData.price : 0

  const handlePlaceOrder = async () => {
    if (!amount || (orderType !== 'market' && !price)) return

    setIsPlacingOrder(true)
    try {
      const orderData = {
        type: orderType,
        side: orderSide,
        tokenPair: selectedPair,
        amount,
        price: orderType !== 'market' ? price : undefined,
        stopPrice: orderType === 'stop-loss' || orderType === 'take-profit' ? stopPrice : undefined
      }

      if (onPlaceOrder) {
        await onPlaceOrder(orderData)
      }

      // Add to active orders (mock)
      const newOrder: TradingOrder = {
        id: Date.now().toString(),
        ...orderData,
        status: orderType === 'market' ? 'filled' : 'pending',
        createdAt: new Date().toISOString(),
        filledAmount: orderType === 'market' ? amount : undefined,
        averagePrice: orderType === 'market' ? currentPrice.toString() : undefined
      }
      setActiveOrders(prev => [newOrder, ...prev])

      // Reset form
      setAmount('')
      setPrice('')
      setStopPrice('')
    } catch (error) {
      console.error('Failed to place order:', error)
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    try {
      if (onCancelOrder) {
        await onCancelOrder(orderId)
      }
      setActiveOrders(prev => prev.filter(order => order.id !== orderId))
    } catch (error) {
      console.error('Failed to cancel order:', error)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filled': return 'text-green-600'
      case 'pending': return 'text-yellow-600'
      case 'cancelled': return 'text-red-600'
      case 'partial': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const calculateTotal = () => {
    const amountNum = parseFloat(amount) || 0
    const priceNum = orderType === 'market' ? currentPrice : parseFloat(price) || 0
    return (amountNum * priceNum).toFixed(6)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Advanced Trading
        </h3>
        <div className="flex items-center space-x-2">
          <ChartBarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {selectedPair} • ${currentPrice.toFixed(4)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trading Pair
            </label>
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="BTM/ETH">BTM/ETH</option>
              <option value="BTM/BNB">BTM/BNB</option>
              <option value="BTM/SOL">BTM/SOL</option>
              <option value="ETH/BNB">ETH/BNB</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setOrderSide('buy')}
              className={`py-2 px-4 rounded-md font-medium transition-colors ${
                orderSide === 'buy'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setOrderSide('sell')}
              className={`py-2 px-4 rounded-md font-medium transition-colors ${
                orderSide === 'sell'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Sell
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Order Type
            </label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as any)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="market">Market Order</option>
              <option value="limit">Limit Order</option>
              <option value="stop-loss">Stop Loss</option>
              <option value="take-profit">Take Profit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount ({baseToken})
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-16 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">{baseToken}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Available: {baseTokenData?.balance || '0.00'} {baseToken}
            </div>
          </div>

          {orderType !== 'market' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price ({quoteToken})
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={currentPrice.toString()}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          )}

          {(orderType === 'stop-loss' || orderType === 'take-profit') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stop Price ({quoteToken})
              </label>
              <input
                type="number"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Total:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {calculateTotal()} {quoteToken}
              </span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={!amount || isPlacingOrder || (orderType !== 'market' && !price)}
            className={`w-full py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              orderSide === 'buy'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isPlacingOrder ? (
              <div className="flex items-center justify-center space-x-2">
                <ClockIcon className="w-4 h-4 animate-spin" />
                <span>Placing Order...</span>
              </div>
            ) : (
              `${orderSide.toUpperCase()} ${baseToken}`
            )}
          </button>
        </div>

        {/* Active Orders */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Active Orders</h4>
          
          {activeOrders.length === 0 ? (
            <div className="text-center py-8">
              <AdjustmentsHorizontalIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No active orders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderTypeColor(order.type)}`}>
                          {order.type.toUpperCase()}
                        </span>
                        <span className={`text-sm font-medium ${
                          order.side === 'buy' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {order.side.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {order.tokenPair}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                          <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                            {order.amount}
                          </span>
                        </div>
                        {order.price && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Price:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                              {order.price}
                            </span>
                          </div>
                        )}
                        {order.stopPrice && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Stop:</span>
                            <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                              {order.stopPrice}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Status:</span>
                          <span className={`ml-1 font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {new Date(order.createdAt).toLocaleString()}
                      </div>
                    </div>
                    
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="ml-4 text-red-600 hover:text-red-700 text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Type Information */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Order Types</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• <strong>Market:</strong> Execute immediately at current market price</li>
                <li>• <strong>Limit:</strong> Execute only at specified price or better</li>
                <li>• <strong>Stop Loss:</strong> Sell when price drops to stop price</li>
                <li>• <strong>Take Profit:</strong> Sell when price rises to target price</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TradingInterface