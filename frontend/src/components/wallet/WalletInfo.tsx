import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import {
  ClipboardDocumentIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  WifiIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline'
import { ConnectedWallet } from '@types/wallet'
import { useWalletConnection } from '@hooks/useWalletConnection'
import { useBalances } from '@hooks/useBalances'
import toast from 'react-hot-toast'

interface WalletInfoProps {
  wallet: ConnectedWallet
  onClose?: () => void
}

const WalletInfo: React.FC<WalletInfoProps> = ({ wallet, onClose }) => {
  const { disconnectWallet, switchChain, signMessage } = useWalletConnection()
  const { getBalancesByChain } = useBalances()
  const [isSigningMessage, setIsSigningMessage] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [balanceAnimation, setBalanceAnimation] = useState(false)
  const headerAnimation = useAnimation()
  const balanceCounterAnimation = useAnimation()

  const chainBalance = getBalancesByChain(wallet.chainId)

  // Trigger balance animation when balance changes
  useEffect(() => {
    if (wallet.balance !== '0') {
      setBalanceAnimation(true)
      balanceCounterAnimation.start({
        scale: [1, 1.05, 1],
        transition: { duration: 0.6 }
      })
      setTimeout(() => setBalanceAnimation(false), 600)
    }
  }, [wallet.balance, balanceCounterAnimation])

  // Header pulse animation on mount
  useEffect(() => {
    headerAnimation.start({
      scale: [1, 1.02, 1],
      transition: { duration: 0.8, ease: "easeOut" }
    })
  }, [headerAnimation])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Address copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy address')
    }
  }

  const getBlockExplorerUrl = (address: string, chainId: number) => {
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io/address/',
      5: 'https://goerli.etherscan.io/address/',
      11155111: 'https://sepolia.etherscan.io/address/',
      56: 'https://bscscan.com/address/',
      97: 'https://testnet.bscscan.com/address/',
      137: 'https://polygonscan.com/address/',
      80001: 'https://mumbai.polygonscan.com/address/',
      8453: 'https://basescan.org/address/',
      84531: 'https://goerli.basescan.org/address/',
      42161: 'https://arbiscan.io/address/',
      421613: 'https://goerli.arbiscan.io/address/',
      10: 'https://optimistic.etherscan.io/address/',
      420: 'https://goerli-optimism.etherscan.io/address/',
      101: 'https://explorer.solana.com/address/',
    }
    
    const baseUrl = explorers[chainId]
    return baseUrl ? `${baseUrl}${address}` : null
  }

  const getWalletIcon = (type: string) => {
    const icons: Record<string, string> = {
      metamask: '🦊',
      phantom: '👻',
      walletconnect: '⟐',
      'internet-identity': '⬢'
    }
    return icons[type] || '◆'
  }

  const getChainColor = (chainId: number) => {
    const colors: Record<number, string> = {
      1: 'bg-blue-500',
      56: 'bg-yellow-500',
      8453: 'bg-blue-600',
      101: 'bg-purple-500',
      137: 'bg-purple-600',
      42161: 'bg-blue-400',
      10: 'bg-red-500',
    }
    return colors[chainId] || 'bg-gray-500'
  }

  const handleDisconnect = async () => {
    try {
      await disconnectWallet(wallet.id)
      if (onClose) onClose()
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  const handleSwitchNetwork = async (chainId: number) => {
    try {
      await switchChain(wallet.id, chainId)
    } catch (error) {
      console.error('Failed to switch network:', error)
    }
  }

  const handleSignMessage = async () => {
    setIsSigningMessage(true)
    try {
      const message = `Welcome to BTCMiner!\n\nThis signature verifies your wallet ownership.\n\nTimestamp: ${new Date().toISOString()}`
      const signature = await signMessage(wallet.id, message)
      if (signature) {
        toast.success('Message signed successfully!')
      }
    } catch (error) {
      console.error('Failed to sign message:', error)
    } finally {
      setIsSigningMessage(false)
    }
  }

  const supportedChains = [
    { id: 1, name: 'Ethereum', symbol: 'ETH' },
    { id: 56, name: 'BNB Chain', symbol: 'BNB' },
    { id: 8453, name: 'Base', symbol: 'ETH' },
    { id: 137, name: 'Polygon', symbol: 'MATIC' },
  ]

  const explorerUrl = getBlockExplorerUrl(wallet.address, wallet.chainId)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-md w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getWalletIcon(wallet.type)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)}
            </h3>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getChainColor(wallet.chainId)}`} />
              <span className="text-sm text-gray-600">{wallet.chainName}</span>
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Address */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Wallet Address
        </label>
        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
          <code className="flex-1 text-sm font-mono text-gray-900">
            {formatAddress(wallet.address)}
          </code>
          <button
            onClick={() => copyToClipboard(wallet.address)}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Copy address"
          >
            <ClipboardDocumentIcon className="h-4 w-4" />
          </button>
          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-gray-400 hover:text-gray-600"
              title="View on explorer"
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      {/* Balance */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Balance
        </label>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {parseFloat(wallet.balance).toFixed(4)} {wallet.chainId === 101 ? 'SOL' : 'ETH'}
          </div>
          {chainBalance && (
            <div className="text-sm text-gray-600">
              ≈ ${chainBalance.totalUsdValue.toFixed(2)} USD
            </div>
          )}
        </div>
      </div>

      {/* Network Switching (for EVM wallets) */}
      {['metamask', 'walletconnect'].includes(wallet.type) && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Switch Network
          </label>
          <div className="grid grid-cols-2 gap-2">
            {supportedChains.map((chain) => (
              <button
                key={chain.id}
                onClick={() => handleSwitchNetwork(chain.id)}
                disabled={chain.id === wallet.chainId}
                className={`p-2 text-sm rounded-lg border transition-colors ${
                  chain.id === wallet.chainId
                    ? 'border-primary-300 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getChainColor(chain.id)}`} />
                  <span>{chain.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={handleSignMessage}
          disabled={isSigningMessage}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSigningMessage ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Signing...</span>
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-4 w-4" />
              <span>Sign Message</span>
            </>
          )}
        </button>

        <button
          onClick={handleDisconnect}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <XMarkIcon className="h-4 w-4" />
          <span>Disconnect Wallet</span>
        </button>
      </div>

      {/* Connection Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Connected</span>
          <span>{wallet.connectedAt.toLocaleString()}</span>
        </div>
        <div className="flex items-center space-x-1 mt-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-600">Active</span>
        </div>
      </div>
    </motion.div>
  )
}

export default WalletInfo