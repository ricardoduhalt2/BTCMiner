import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowTopRightOnSquareIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { ConnectedWallet } from '@types/wallet'

interface ChainOverviewProps {
  connectedWallets: ConnectedWallet[]
  balances: Record<string, any>
}

const ChainOverview: React.FC<ChainOverviewProps> = ({
  connectedWallets,
  balances
}) => {
  const getChainInfo = (chainId: number) => {
    const chainInfo: Record<number, {
      name: string
      symbol: string
      color: string
      bgColor: string
      explorerUrl: string
      status: 'healthy' | 'warning' | 'error'
    }> = {
      1: {
        name: 'Ethereum',
        symbol: 'ETH',
        color: 'text-blue-600',
        bgColor: 'bg-blue-500',
        explorerUrl: 'https://etherscan.io',
        status: 'healthy'
      },
      56: {
        name: 'BNB Chain',
        symbol: 'BNB',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-500',
        explorerUrl: 'https://bscscan.com',
        status: 'healthy'
      },
      8453: {
        name: 'Base',
        symbol: 'ETH',
        color: 'text-blue-600',
        bgColor: 'bg-blue-600',
        explorerUrl: 'https://basescan.org',
        status: 'healthy'
      },
      101: {
        name: 'Solana',
        symbol: 'SOL',
        color: 'text-purple-600',
        bgColor: 'bg-purple-500',
        explorerUrl: 'https://explorer.solana.com',
        status: 'healthy'
      },
      137: {
        name: 'Polygon',
        symbol: 'MATIC',
        color: 'text-purple-600',
        bgColor: 'bg-purple-600',
        explorerUrl: 'https://polygonscan.com',
        status: 'healthy'
      },
      42161: {
        name: 'Arbitrum',
        symbol: 'ETH',
        color: 'text-blue-600',
        bgColor: 'bg-blue-400',
        explorerUrl: 'https://arbiscan.io',
        status: 'healthy'
      },
      10: {
        name: 'Optimism',
        symbol: 'ETH',
        color: 'text-red-600',
        bgColor: 'bg-red-500',
        explorerUrl: 'https://optimistic.etherscan.io',
        status: 'healthy'
      }
    }
    
    return chainInfo[chainId] || {
      name: `Chain ${chainId}`,
      symbol: 'UNKNOWN',
      color: 'text-gray-600',
      bgColor: 'bg-gray-500',
      explorerUrl: '',
      status: 'warning' as const
    }
  }

  // Group wallets by chain
  const chainGroups = connectedWallets.reduce((groups, wallet) => {
    const chainId = wallet.chainId
    if (!groups[chainId]) {
      groups[chainId] = []
    }
    groups[chainId].push(wallet)
    return groups
  }, {} as Record<number, ConnectedWallet[]>)

  const chains = Object.entries(chainGroups).map(([chainId, wallets]) => {
    const id = parseInt(chainId)
    const chainInfo = getChainInfo(id)
    const totalBalance = wallets.reduce((sum, wallet) => {
      const balance = balances[wallet.id]
      return sum + (balance?.totalUsdValue || 0)
    }, 0)

    return {
      id,
      ...chainInfo,
      wallets,
      totalBalance,
      walletCount: wallets.length
    }
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  if (chains.length === 0) {
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Chain Overview
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {chains.length} chain{chains.length !== 1 ? 's' : ''} active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chains.map((chain, index) => (
          <motion.div
            key={chain.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full ${chain.bgColor} flex items-center justify-center`}>
                  <span className="text-white text-sm font-bold">
                    {chain.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {chain.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {chain.walletCount} wallet{chain.walletCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(chain.status)}
                {chain.explorerUrl && (
                  <a
                    href={chain.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="View on explorer"
                  >
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Value</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  ${chain.totalBalance.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Native Balance</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {chain.wallets.reduce((sum, w) => sum + parseFloat(w.balance), 0).toFixed(4)} {chain.symbol}
                </span>
              </div>
            </div>

            {/* Wallet List */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-1">
                {chain.wallets.map((wallet) => (
                  <div key={wallet.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                    </span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {parseFloat(wallet.balance).toFixed(4)} {chain.symbol}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <Link
                  to="/bridge"
                  className="flex-1 text-center px-3 py-1 text-xs bg-primary-50 text-primary-700 rounded hover:bg-primary-100 transition-colors"
                >
                  Bridge
                </Link>
                <Link
                  to="/trading"
                  className="flex-1 text-center px-3 py-1 text-xs bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  Trade
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {chains.reduce((sum, chain) => sum + chain.totalBalance, 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total USD Value</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {chains.reduce((sum, chain) => sum + chain.walletCount, 0)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Connected Wallets</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {chains.filter(c => c.status === 'healthy').length}/{chains.length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Healthy Chains</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChainOverview