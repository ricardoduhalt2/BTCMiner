import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { 
  WalletIcon, 
  ChevronDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useWalletConnection } from '@hooks/useWalletConnection'
import WalletModalSimple from './WalletModalSimple'

const WalletConnectorFixed: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const { connectedWallets, disconnectWallet, isConnecting } = useWalletConnection()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pulseAnimation = useAnimation()

  // Component is working correctly

  // Update connection status based on wallet state
  useEffect(() => {
    if (isConnecting) {
      setConnectionStatus('connecting')
    } else if (connectedWallets.length > 0) {
      setConnectionStatus('connected')
      // Trigger success animation
      pulseAnimation.start({
        scale: [1, 1.05, 1],
        transition: { duration: 0.6, ease: "easeOut" }
      })
    } else {
      setConnectionStatus('idle')
    }
  }, [connectedWallets.length, isConnecting, pulseAnimation])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getWalletIcon = (type: string) => {
    const icons: Record<string, string> = {
      metamask: '🦊',
      phantom: '👻',
      'walletconnect': '⟐',
      'internet-identity': '⬢'
    }
    return icons[type] || '◆'
  }

  const handleConnectClick = () => {
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  // No wallets connected - show connect button
  if (connectedWallets.length === 0) {
    return (
      <>
        <motion.button
          ref={buttonRef}
          onClick={handleConnectClick}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          animate={pulseAnimation}
          disabled={isConnecting}
        >
          <motion.div
            animate={isConnecting ? { rotate: 360 } : { rotate: 0 }}
            transition={isConnecting ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
          >
            <WalletIcon className="h-5 w-5" />
          </motion.div>
          <span className="hidden sm:inline">
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </span>
          
          {/* Connection status indicator */}
          <AnimatePresence>
            {connectionStatus === 'connecting' && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"
              />
            )}
          </AnimatePresence>
        </motion.button>
        
        <WalletModalSimple
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      </>
    )
  }

  // Single wallet connected
  if (connectedWallets.length === 1) {
    const wallet = connectedWallets[0]
    return (
      <div className="relative">
        <motion.button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 px-3 py-2 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800 transition-colors relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          animate={pulseAnimation}
        >
          {/* Connection success indicator */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-full h-full bg-green-400 rounded-full"
            />
          </motion.div>
          
          <div className="flex items-center space-x-2">
            <motion.span 
              className="text-lg"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              {getWalletIcon(wallet.type)}
            </motion.span>
            <div className="text-left">
              <motion.div 
                className="text-sm font-medium text-green-800 dark:text-green-200"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                {formatAddress(wallet.address)}
              </motion.div>
              <motion.div 
                className="text-xs text-green-600 dark:text-green-400"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {wallet.chainName}
              </motion.div>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDownIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 overflow-hidden"
            >
              <motion.div 
                className="px-4 py-2 border-b border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Connected Wallet
                  </span>
                  <motion.button
                    onClick={() => setIsModalOpen(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Add Wallet
                  </motion.button>
                </div>
              </motion.div>
              
              <motion.div 
                className="px-4 py-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <motion.span 
                      className="text-2xl"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    >
                      {getWalletIcon(wallet.type)}
                    </motion.span>
                    <div>
                      <motion.div 
                        className="text-sm font-medium text-gray-900 dark:text-gray-100"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        {wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)}
                      </motion.div>
                      <motion.div 
                        className="text-xs text-gray-500 dark:text-gray-400"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        {formatAddress(wallet.address)}
                      </motion.div>
                      <motion.div 
                        className="text-xs text-gray-500 dark:text-gray-400"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        {wallet.chainName}
                      </motion.div>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => {
                      disconnectWallet(wallet.id)
                      setIsDropdownOpen(false)
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <WalletModalSimple
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      </div>
    )
  }

  // Multiple wallets connected - simplified version for now
  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-sm font-medium text-green-800 dark:text-green-200">
          {connectedWallets.length} Wallets
        </span>
        <ChevronDownIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
      </motion.button>

      <WalletModalSimple
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  )
}

export default WalletConnectorFixed