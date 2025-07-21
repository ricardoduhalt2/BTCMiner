import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useWalletConnection } from '@hooks/useWalletConnection'

interface WalletModalSimpleProps {
  isOpen: boolean
  onClose: () => void
}

const WalletModalSimple: React.FC<WalletModalSimpleProps> = ({ isOpen, onClose }) => {
  const { connectWallet, isConnecting } = useWalletConnection()
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null)

  console.log('🔧 WalletModal: isOpen =', isOpen)

  const walletOptions = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      description: 'Connect using MetaMask wallet',
      popular: true,
    },
    {
      id: 'phantom',
      name: 'Phantom',
      icon: '👻',
      description: 'Connect using Phantom wallet',
      popular: true,
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      description: 'Connect using WalletConnect',
      popular: false,
    },
    {
      id: 'internet-identity',
      name: 'Internet Identity',
      icon: '⬢',
      description: 'Connect using Internet Identity',
      popular: false,
    },
  ]

  const handleConnect = async (walletType: string) => {
    console.log('🔧 Connecting to wallet:', walletType)
    try {
      setConnectingWallet(walletType)
      await connectWallet(walletType as any)
      
      // Close modal after successful connection
      setTimeout(() => {
        onClose()
        setConnectingWallet(null)
      }, 1000)
      
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      setConnectingWallet(null)
    }
  }

  // Don't render anything if not open
  if (!isOpen) {
    console.log('🔧 Modal not open, not rendering')
    return null
  }

  console.log('🔧 Modal is open, rendering...')

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">💳</span>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Connect Wallet
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Wallet Options */}
          <div className="space-y-3">
            {walletOptions.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleConnect(wallet.id)}
                disabled={isConnecting}
                className={`w-full flex items-center space-x-4 p-4 border rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative ${
                  connectingWallet === wallet.id
                    ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}
              >
                {/* Popular badge */}
                {wallet.popular && (
                  <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Popular
                  </div>
                )}
                
                {/* Wallet Icon */}
                <span className="text-2xl">
                  {connectingWallet === wallet.id ? '⏳' : wallet.icon}
                </span>
                
                {/* Wallet Info */}
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {wallet.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {wallet.description}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By connecting a wallet, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default WalletModalSimple