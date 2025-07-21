import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowsUpDownIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { useWalletConnection } from '@hooks/useWalletConnection'
import { useBalances } from '@hooks/useBalances'
import ChainSelector from './ChainSelector'
import AmountInput from './AmountInput'
import TransferSummary from './TransferSummary'
import { useAppDispatch } from '@hooks/redux'
import { addNotification } from '@store/slices/uiSlice'

interface Chain {
  id: number
  name: string
  symbol: string
  iconUrl: string
  color: string
}

const supportedChains: Chain[] = [
  {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    iconUrl: '/icons/ethereum.svg',
    color: 'bg-blue-500'
  },
  {
    id: 56,
    name: 'BNB Chain',
    symbol: 'BNB',
    iconUrl: '/icons/bnb.svg',
    color: 'bg-yellow-500'
  },
  {
    id: 8453,
    name: 'Base',
    symbol: 'BASE',
    iconUrl: '/icons/base.svg',
    color: 'bg-blue-600'
  },
  {
    id: 101,
    name: 'Solana',
    symbol: 'SOL',
    iconUrl: '/icons/solana.svg',
    color: 'bg-purple-500'
  }
]

const BridgeInterface: React.FC = () => {
  const dispatch = useAppDispatch()
  const { connectedWallets } = useWalletConnection()
  const { balances } = useBalances()
  
  const [fromChain, setFromChain] = useState<Chain | null>(null)
  const [toChain, setToChain] = useState<Chain | null>(null)
  const [amount, setAmount] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)
  const [transferFee, setTransferFee] = useState<{
    fee: string
    estimatedTime: string
    gasPrice: string
  } | null>(null)

  // Get available chains based on connected wallets
  const availableChains = supportedChains.filter(chain => 
    connectedWallets.some(wallet => wallet.chainId === chain.id)
  )

  // Get balance for selected chain
  const getChainBalance = (chainId: number) => {
    const wallet = connectedWallets.find(w => w.chainId === chainId)
    if (!wallet) return '0'
    
    const balance = balances[wallet.id]
    return balance?.nativeBalance || wallet.balance || '0'
  }

  // Calculate transfer fee (mock implementation)
  useEffect(() => {
    if (fromChain && toChain && amount && parseFloat(amount) > 0) {
      const calculateFee = async () => {
        // Mock fee calculation
        const baseFee = 0.001
        const crossChainFee = fromChain.id !== toChain.id ? 0.005 : 0
        const totalFee = baseFee + crossChainFee
        
        const estimatedTimes: Record<string, string> = {
          [`${fromChain.id}-${toChain.id}`]: '2-5 minutes',
          [`${toChain.id}-${fromChain.id}`]: '2-5 minutes'
        }
        
        setTransferFee({
          fee: totalFee.toFixed(6),
          estimatedTime: estimatedTimes[`${fromChain.id}-${toChain.id}`] || '2-5 minutes',
          gasPrice: '25 gwei'
        })
      }
      
      const timer = setTimeout(calculateFee, 500)
      return () => clearTimeout(timer)
    } else {
      setTransferFee(null)
    }
  }, [fromChain, toChain, amount])

  const handleSwapChains = () => {
    const temp = fromChain
    setFromChain(toChain)
    setToChain(temp)
  }

  const handleMaxAmount = () => {
    if (fromChain) {
      const balance = getChainBalance(fromChain.id)
      const maxAmount = Math.max(0, parseFloat(balance) - 0.01) // Reserve for gas
      setAmount(maxAmount.toString())
    }
  }

  const validateTransfer = () => {
    if (!fromChain || !toChain) {
      return 'Please select both source and destination chains'
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      return 'Please enter a valid amount'
    }
    
    const balance = parseFloat(getChainBalance(fromChain.id))
    const transferAmount = parseFloat(amount)
    
    if (transferAmount > balance) {
      return 'Insufficient balance'
    }
    
    if (transferAmount < 0.001) {
      return 'Minimum transfer amount is 0.001'
    }
    
    if (fromChain.id === toChain.id) {
      return 'Source and destination chains must be different'
    }
    
    return null
  }

  const handleTransfer = async () => {
    const error = validateTransfer()
    if (error) {
      dispatch(addNotification({
        type: 'error',
        message: error
      }))
      return
    }

    setIsTransferring(true)
    
    try {
      // Mock transfer process
      dispatch(addNotification({
        type: 'info',
        message: 'Initiating cross-chain transfer...'
      }))
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      dispatch(addNotification({
        type: 'success',
        message: 'Transfer initiated successfully!'
      }))
      
      // Reset form
      setAmount('')
      setTransferFee(null)
      
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Transfer failed'
      }))
    } finally {
      setIsTransferring(false)
    }
  }

  const error = validateTransfer()
  const canTransfer = !error && !isTransferring && transferFee

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-6">
          {/* From Chain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From Chain
            </label>
            <ChainSelector
              chains={availableChains}
              selectedChain={fromChain}
              onSelect={setFromChain}
              balance={fromChain ? getChainBalance(fromChain.id) : undefined}
              label="Source"
            />
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSwapChains}
              disabled={!fromChain || !toChain}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Swap chains"
            >
              <ArrowsUpDownIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* To Chain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              To Chain
            </label>
            <ChainSelector
              chains={availableChains.filter(c => c.id !== fromChain?.id)}
              selectedChain={toChain}
              onSelect={setToChain}
              label="Destination"
            />
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount
            </label>
            <AmountInput
              value={amount}
              onChange={setAmount}
              maxAmount={fromChain ? getChainBalance(fromChain.id) : '0'}
              token="BTM"
              onMaxClick={handleMaxAmount}
            />
          </div>

          {/* Transfer Summary */}
          {transferFee && fromChain && toChain && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TransferSummary
                amount={amount}
                fromChain={fromChain.name}
                toChain={toChain.name}
                fee={transferFee.fee}
                estimatedTime={transferFee.estimatedTime}
                gasPrice={transferFee.gasPrice}
              />
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
            </motion.div>
          )}

          {/* Transfer Button */}
          <button
            onClick={handleTransfer}
            disabled={!canTransfer}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              canTransfer
                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {isTransferring ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing Transfer...</span>
              </div>
            ) : (
              'Transfer Tokens'
            )}
          </button>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Cross-Chain Transfer Information</p>
                <ul className="space-y-1 text-xs">
                  <li>• Transfers are secured by LayerZero protocol</li>
                  <li>• Minimum transfer amount: 0.001 BTM</li>
                  <li>• Estimated time: 2-5 minutes</li>
                  <li>• Gas fees are paid in the source chain's native token</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BridgeInterface