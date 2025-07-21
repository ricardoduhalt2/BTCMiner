import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useWalletConnection } from '@hooks/useWalletConnection'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { connectWallet, isConnecting, error } = useWalletConnection()
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle')
  const modalAnimation = useAnimation()

  const walletOptions = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      description: 'Connect using MetaMask wallet',
      color: 'from-orange-400 to-orange-600',
      popular: true,
    },
    {
      id: 'phantom',
      name: 'Phantom',
      icon: '👻',
      description: 'Connect using Phantom wallet',
      color: 'from-purple-400 to-purple-600',
      popular: true,
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      description: 'Connect using WalletConnect',
      color: 'from-blue-400 to-blue-600',
      popular: false,
    },
    {
      id: 'internet-identity',
      name: 'Internet Identity',
      icon: '⬢',
      description: 'Connect using Internet Identity',
      color: 'from-green-400 to-green-600',
      popular: false,
    },
  ]

  // Reset states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setConnectionStatus('idle')
      setConnectingWallet(null)
    }
  }, [isOpen])

  // Handle connection status changes
  useEffect(() => {
    if (isConnecting) {
      setConnectionStatus('connecting')
    } else if (error) {
      setConnectionStatus('error')
      setConnectingWallet(null)
    } else {
      setConnectionStatus('idle')
      setConnectingWallet(null)
    }
  }, [isConnecting, error])

  const handleConnect = async (walletType: string) => {
    try {
      setConnectingWallet(walletType)
      setConnectionStatus('connecting')
      
      await connectWallet(walletType as any)
      
      setConnectionStatus('success')
      
      // Success animation and close
      await modalAnimation.start({
        scale: [1, 1.05, 1],
        transition: { duration: 0.5 }
      })
      
      setTimeout(() => {
        onClose()
      }, 1000)
      
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      setConnectionStatus('error')
      setConnectingWallet(null)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Enhanced Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 wallet-modal-backdrop"
              onClick={onClose}
            />

            {/* Enhanced Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              animate={modalAnimation}
              className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700"
            >
              {/* Header with enhanced animations */}
              <motion.div 
                className="flex items-center justify-between mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="text-2xl"
                  >
                    💳
                  </motion.div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Connect Wallet
                  </h2>
                </div>
                <motion.button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <XMarkIcon className="h-5 w-5" />
                </motion.button>
              </motion.div>

              {/* Connection Status Indicator */}
              <AnimatePresence>
                {connectionStatus !== 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 rounded-lg"
                  >
                    {connectionStatus === 'connecting' && (
                      <div className="flex items-center space-x-3 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full"
                        />
                        <span className="text-sm font-medium">
                          Connecting to {connectingWallet}...
                        </span>
                      </div>
                    )}
                    
                    {connectionStatus === 'success' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center space-x-3 text-green-600 bg-green-50 dark:bg-green-900/20"
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">
                          Successfully connected!
                        </span>
                      </motion.div>
                    )}
                    
                    {connectionStatus === 'error' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center space-x-3 text-red-600 bg-red-50 dark:bg-red-900/20"
                      >
                        <ExclamationTriangleIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">
                          Connection failed. Please try again.
                        </span>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Enhanced Wallet Options */}
              <div className="space-y-3">
                {walletOptions.map((wallet, index) => (
                  <motion.button
                    key={wallet.id}
                    onClick={() => handleConnect(wallet.id)}
                    disabled={isConnecting}
                    className={`wallet-option-card w-full flex items-center space-x-4 p-4 border rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative ${
                      connectingWallet === wallet.id
                        ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Popular badge */}
                    {wallet.popular && (
                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-orange-600 text-white text-xs px-2 py-1 rounded-full font-medium"
                      >
                        Popular
                      </motion.div>
                    )}
                    
                    {/* Wallet Icon with enhanced animations */}
                    <motion.div
                      className="relative"
                      animate={connectingWallet === wallet.id ? { rotate: 360 } : {}}
                      transition={connectingWallet === wallet.id ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                    >
                      <motion.span 
                        className="text-2xl wallet-icon-hover"
                        whileHover={{ scale: 1.2, rotate: 10 }}
                      >
                        {wallet.icon}
                      </motion.span>
                      
                      {/* Connection status indicator */}
                      {connectingWallet === wallet.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"
                        />
                      )}
                    </motion.div>
                    
                    {/* Wallet Info */}
                    <div className="flex-1 text-left">
                      <motion.div 
                        className="font-medium text-gray-900 dark:text-gray-100"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                      >
                        {wallet.name}
                      </motion.div>
                      <motion.div 
                        className="text-sm text-gray-500 dark:text-gray-400"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                      >
                        {wallet.description}
                      </motion.div>
                    </div>
                    
                    {/* Gradient accent */}
                    <div className={`w-1 h-8 bg-gradient-to-b ${wallet.color} rounded-full opacity-60`} />
                  </motion.button>
                ))}
              </div>

              {/* Enhanced Footer */}
              <motion.div 
                className="mt-6 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  By connecting a wallet, you agree to our{' '}
                  <motion.span 
                    className="text-primary-600 hover:text-primary-700 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                  >
                    Terms of Service
                  </motion.span>
                  {' '}and{' '}
                  <motion.span 
                    className="text-primary-600 hover:text-primary-700 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                  >
                    Privacy Policy
                  </motion.span>
                  .
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default WalletModal