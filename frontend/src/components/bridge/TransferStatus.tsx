import React from 'react'
import { motion } from 'framer-motion'
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline'

interface Chain {
  id: number
  name: string
  symbol: string
  iconUrl: string
  color: string
}

interface TransferStatusProps {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  txHash: string
  error: string
  fromChain: Chain | null
  toChain: Chain | null
  amount: string
  onReset: () => void
}

const TransferStatus: React.FC<TransferStatusProps> = ({
  status,
  txHash,
  error,
  fromChain,
  toChain,
  amount,
  onReset,
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return (
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <ArrowPathIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
        )
      case 'processing':
        return (
          <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
            <ArrowPathIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400 animate-spin" />
          </div>
        )
      case 'completed':
        return (
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        )
      case 'failed':
        return (
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <XCircleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        )
    }
  }

  const getStatusTitle = () => {
    switch (status) {
      case 'pending':
        return 'Initiating Transfer'
      case 'processing':
        return 'Transfer in Progress'
      case 'completed':
        return 'Transfer Completed'
      case 'failed':
        return 'Transfer Failed'
    }
  }

  const getStatusDescription = () => {
    switch (status) {
      case 'pending':
        return 'Your transfer is being initiated. Please wait...'
      case 'processing':
        return 'Your transfer is being processed. This may take a few minutes.'
      case 'completed':
        return 'Your transfer has been completed successfully!'
      case 'failed':
        return error || 'Your transfer failed. Please try again.'
    }
  }

  const getExplorerUrl = (chain: Chain, hash: string) => {
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io/tx/',
      56: 'https://bscscan.com/tx/',
      8453: 'https://basescan.org/tx/',
      137: 'https://polygonscan.com/tx/',
      42161: 'https://arbiscan.io/tx/',
      10: 'https://optimistic.etherscan.io/tx/',
    }
    
    return explorers[chain.id] ? `${explorers[chain.id]}${hash}` : '#'
  }

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
      <div className="flex flex-col items-center text-center">
        {getStatusIcon()}
        
        <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
          {getStatusTitle()}
        </h2>
        
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {getStatusDescription()}
        </p>
        
        {/* Transfer Details */}
        {fromChain && toChain && (
          <div className="mt-6 w-full max-w-sm">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-500 dark:text-gray-400">Amount</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {parseFloat(amount).toFixed(6)} BTM
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400">From</div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full ${fromChain.color}`}></div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {fromChain.name}
                    </div>
                  </div>
                </div>
                
                <ArrowsRightLeftIcon className="h-4 w-4 text-gray-400" />
                
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400">To</div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full ${toChain.color}`}></div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {toChain.name}
                    </div>
                  </div>
                </div>
              </div>
              
              {txHash && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Transaction</div>
                  <a
                    href={getExplorerUrl(fromChain, txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700"
                  >
                    <span>{txHash.slice(0, 6)}...{txHash.slice(-4)}</span>
                    <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Status Progress */}
        {(status === 'pending' || status === 'processing') && (
          <div className="mt-6 w-full max-w-sm">
            <div className="relative">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                <motion.div
                  initial={{ width: status === 'pending' ? '30%' : '60%' }}
                  animate={{ width: status === 'pending' ? '60%' : '90%' }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-600"
                ></motion.div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              {status === 'pending' ? 'Initiating transaction...' : 'Waiting for confirmations...'}
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="mt-8 flex space-x-4">
          {status === 'completed' || status === 'failed' ? (
            <>
              <button
                onClick={onReset}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                New Transfer
              </button>
              
              {status === 'failed' && (
                <button
                  onClick={onReset}
                  className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Try Again
                </button>
              )}
            </>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Please don't close this window until the transfer is complete
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TransferStatus