import React from 'react'
import { 
  ClockIcon, 
  CurrencyDollarIcon, 
  FireIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline'

interface TransferSummaryProps {
  amount: string
  fromChain: string
  toChain: string
  fee: string
  estimatedTime: string
  gasPrice: string
}

const TransferSummary: React.FC<TransferSummaryProps> = ({
  amount,
  fromChain,
  toChain,
  fee,
  estimatedTime,
  gasPrice
}) => {
  const calculateReceiveAmount = () => {
    const sendAmount = parseFloat(amount)
    const feeAmount = parseFloat(fee)
    return Math.max(0, sendAmount - feeAmount).toFixed(6)
  }

  const calculateUsdValue = (tokenAmount: string) => {
    return (parseFloat(tokenAmount) * 1.25).toFixed(2) // Mock BTM price at $1.25
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
      <div className="flex items-center space-x-2 mb-3">
        <InformationCircleIcon className="h-5 w-5 text-blue-500" />
        <h3 className="font-medium text-gray-900 dark:text-gray-100">
          Transfer Summary
        </h3>
      </div>

      <div className="space-y-3">
        {/* Route */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Route</span>
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            <span>{fromChain}</span>
            <span className="text-gray-400">→</span>
            <span>{toChain}</span>
          </div>
        </div>

        {/* Send Amount */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">You send</span>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {amount} BTM
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              ≈ ${calculateUsdValue(amount)} USD
            </div>
          </div>
        </div>

        {/* Fees */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Network fee</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {fee} ETH
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              ≈ ${(parseFloat(fee) * 2000).toFixed(2)} USD
            </div>
          </div>
        </div>

        {/* Gas Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <FireIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Gas price</span>
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {gasPrice}
          </div>
        </div>

        {/* Estimated Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <ClockIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Estimated time</span>
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {estimatedTime}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
          {/* Receive Amount */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              You receive
            </span>
            <div className="text-right">
              <div className="text-sm font-bold text-green-600">
                {calculateReceiveAmount()} BTM
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                ≈ ${calculateUsdValue(calculateReceiveAmount())} USD
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <InformationCircleIcon className="h-4 w-4 text-yellow-500 mt-0.5" />
          <div className="text-xs text-yellow-700 dark:text-yellow-300">
            <p className="font-medium mb-1">Important Notes:</p>
            <ul className="space-y-1">
              <li>• Double-check the destination address</li>
              <li>• This transaction cannot be reversed</li>
              <li>• Network congestion may affect transfer time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransferSummary