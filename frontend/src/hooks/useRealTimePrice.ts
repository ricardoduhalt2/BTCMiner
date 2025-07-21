import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppDispatch } from './redux'
import { addNotification } from '@store/slices/uiSlice'

interface PriceData {
  symbol: string
  price: number
  change24h: number
  changePercent24h: number
  volume24h: number
  high24h: number
  low24h: number
  timestamp: number
}

interface PriceSubscription {
  symbol: string
  callback: (data: PriceData) => void
}

interface UseRealTimePriceOptions {
  symbol: string
  autoConnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

interface UseRealTimePriceReturn {
  price: number | null
  change24h: number
  changePercent24h: number
  volume24h: number
  high24h: number
  low24h: number
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  lastUpdate: Date | null
  connect: () => void
  disconnect: () => void
  subscribe: (symbol: string, callback: (data: PriceData) => void) => () => void
}

// Mock WebSocket URL - in production this would be your actual WebSocket endpoint
const WS_URL = 'wss://api.btcminer.com/ws/prices'

export const useRealTimePrice = ({
  symbol,
  autoConnect = true,
  reconnectInterval = 5000,
  maxReconnectAttempts = 5
}: UseRealTimePriceOptions): UseRealTimePriceReturn => {
  const dispatch = useAppDispatch()
  
  // State
  const [price, setPrice] = useState<number | null>(null)
  const [change24h, setChange24h] = useState<number>(0)
  const [changePercent24h, setChangePercent24h] = useState<number>(0)
  const [volume24h, setVolume24h] = useState<number>(0)
  const [high24h, setHigh24h] = useState<number>(0)
  const [low24h, setLow24h] = useState<number>(0)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isConnecting, setIsConnecting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Refs
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef<number>(0)
  const subscriptionsRef = useRef<Map<string, PriceSubscription[]>>(new Map())
  const mockIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Mock price data generator (for development)
  const generateMockPriceData = useCallback((symbol: string): PriceData => {
    const basePrice = 25.75
    const volatility = 0.02
    const randomChange = (Math.random() - 0.5) * volatility
    const newPrice = basePrice * (1 + randomChange)
    
    const change24h = (Math.random() - 0.5) * 2
    const changePercent24h = (change24h / basePrice) * 100
    
    return {
      symbol,
      price: newPrice,
      change24h,
      changePercent24h,
      volume24h: Math.random() * 10000000 + 5000000,
      high24h: newPrice * (1 + Math.random() * 0.05),
      low24h: newPrice * (1 - Math.random() * 0.05),
      timestamp: Date.now()
    }
  }, [])

  // Update price data
  const updatePriceData = useCallback((data: PriceData) => {
    if (data.symbol === symbol) {
      setPrice(data.price)
      setChange24h(data.change24h)
      setChangePercent24h(data.changePercent24h)
      setVolume24h(data.volume24h)
      setHigh24h(data.high24h)
      setLow24h(data.low24h)
      setLastUpdate(new Date(data.timestamp))
    }

    // Notify subscribers
    const symbolSubscriptions = subscriptionsRef.current.get(data.symbol) || []
    symbolSubscriptions.forEach(sub => sub.callback(data))
  }, [symbol])

  // Mock WebSocket connection (for development)
  const startMockConnection = useCallback(() => {
    setIsConnecting(true)
    setError(null)

    // Simulate connection delay
    setTimeout(() => {
      setIsConnected(true)
      setIsConnecting(false)
      reconnectAttemptsRef.current = 0

      // Start sending mock data
      mockIntervalRef.current = setInterval(() => {
        const mockData = generateMockPriceData(symbol)
        updatePriceData(mockData)

        // Occasionally generate data for other symbols
        if (Math.random() > 0.7) {
          const otherSymbols = ['ETH', 'BTC', 'USDC']
          const randomSymbol = otherSymbols[Math.floor(Math.random() * otherSymbols.length)]
          const otherData = generateMockPriceData(randomSymbol)
          updatePriceData(otherData)
        }
      }, 2000) // Update every 2 seconds

      dispatch(addNotification({
        type: 'success',
        message: 'Connected to price feed'
      }))
    }, 1000)
  }, [symbol, generateMockPriceData, updatePriceData, dispatch])

  // Real WebSocket connection (for production)
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      // In development, use mock connection
      if (process.env.NODE_ENV === 'development') {
        startMockConnection()
        return
      }

      // Production WebSocket connection
      wsRef.current = new WebSocket(WS_URL)

      wsRef.current.onopen = () => {
        setIsConnected(true)
        setIsConnecting(false)
        setError(null)
        reconnectAttemptsRef.current = 0

        // Subscribe to symbol
        wsRef.current?.send(JSON.stringify({
          type: 'subscribe',
          symbol: symbol
        }))

        dispatch(addNotification({
          type: 'success',
          message: 'Connected to price feed'
        }))
      }

      wsRef.current.onmessage = (event) => {
        try {
          const data: PriceData = JSON.parse(event.data)
          updatePriceData(data)
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
        }
      }

      wsRef.current.onclose = () => {
        setIsConnected(false)
        setIsConnecting(false)

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket()
          }, reconnectInterval)
        } else {
          setError('Failed to connect after multiple attempts')
          dispatch(addNotification({
            type: 'error',
            message: 'Lost connection to price feed'
          }))
        }
      }

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setError('Connection error')
        setIsConnecting(false)
      }

    } catch (err) {
      setError('Failed to establish connection')
      setIsConnecting(false)
    }
  }, [symbol, startMockConnection, updatePriceData, dispatch, maxReconnectAttempts, reconnectInterval])

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current)
      mockIntervalRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    setIsConnected(false)
    setIsConnecting(false)
    setError(null)
  }, [])

  // Subscribe to price updates for any symbol
  const subscribe = useCallback((symbol: string, callback: (data: PriceData) => void) => {
    const subscription: PriceSubscription = { symbol, callback }
    
    if (!subscriptionsRef.current.has(symbol)) {
      subscriptionsRef.current.set(symbol, [])
    }
    
    subscriptionsRef.current.get(symbol)!.push(subscription)

    // Return unsubscribe function
    return () => {
      const subscriptions = subscriptionsRef.current.get(symbol)
      if (subscriptions) {
        const index = subscriptions.indexOf(subscription)
        if (index > -1) {
          subscriptions.splice(index, 1)
        }
        
        if (subscriptions.length === 0) {
          subscriptionsRef.current.delete(symbol)
        }
      }
    }
  }, [])

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connectWebSocket()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, connectWebSocket, disconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    price,
    change24h,
    changePercent24h,
    volume24h,
    high24h,
    low24h,
    isConnected,
    isConnecting,
    error,
    lastUpdate,
    connect: connectWebSocket,
    disconnect,
    subscribe
  }
}