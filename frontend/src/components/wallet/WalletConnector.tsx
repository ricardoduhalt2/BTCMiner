import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { 
  WalletIcon, 
  ChevronDownIcon,
  LinkIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useWalletConnection } from '@hooks/useWalletConnection'
import WalletModal from './WalletModal'

const WalletConnector: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const { connectedWallets, disconnectWallet, isConnecting } = useWalletConnection()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pulseAnimation = useAnimation()

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

  // Create connection ripple effect
  const createConnectionRipple = () => {
    if (!buttonRef.current) return
    
    const button = buttonRef.current
    const rect = button.getBoundingClientRect()
    
    const ripple = document.createElement('div')
    ripple.className = 'wallet-connection-ripple'
    ripple.style.width = ripple.style.height = `${Math.max(rect.width, rect.height) * 1.5}px`
    ripple.style.left = `${rect.width / 2}px`
    ripple.style.top = `${rect.height / 2}px`
    
    button.appendChild(ripple)
    
    setTimeout(() => {
      if (button.contains(ripple)) {
        button.removeChild(ripple)
      }
    }, 800)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getWalletIcon = (type: string) => {
    // In a real app, these would be actual wallet icons
    const icons: Record<string, string> = {
      metamask: '🦊',
      phantom: '👻',
      'walletconnect': '⟐',
      'internet-identity': '⬢'
    }
    return icons[type] || '◆'
  }

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connecting':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'connected':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  if (connectedWallets.length === 0) {
    return (
      <>
        <motion.button
          ref={buttonRef}
          onClick={() => {
            createConnectionRipple()
            setIsModalOpen(true)
          }}
          className={`btn-primary flex items-center space-x-2 relative overflow-hidden ${getConnectionStatusColor()}`}
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
        
        <WalletModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    )
  }

  if (connectedWallets.length === 1) {
    const wallet = connectedWallets[0]
    return (
      <div className="relative">
        <motion.button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 px-3 py-2 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors relative overflow-hidden"
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
                className="text-sm font-medium text-green-800"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                {formatAddress(wallet.address)}
              </motion.div>
              <motion.div 
                className="text-xs text-green-600"
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
            <ChevronDownIcon className="h-4 w-4 text-green-600" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 overflow-hidden"
            >
              <motion.div 
                className="px-4 py-2 border-b border-gray-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    Connected Wallet
                  </span>
                  <motion.button
                    onClick={() => setIsModalOpen(true)}
                    className="text-sm text-primary-600 hover:text-primary-700"
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
                        className="text-sm font-medium text-gray-900"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        {wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)}
                      </motion.div>
                      <motion.div 
                        className="text-xs text-gray-500"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        {formatAddress(wallet.address)}
                      </motion.div>
                      <motion.div 
                        className="text-xs text-gray-500"
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

        <WalletModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    )
  }

  // Multiple wallets connected
  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors relative overflow-hidden"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={pulseAnimation}
      >
        {/* Multiple wallets success indicator */}
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

        <div className="flex -space-x-1">
          {connectedWallets.slice(0, 3).map((wallet, index) => (
            <motion.div
              key={wallet.id}
              className="w-6 h-6 bg-white rounded-full border-2 border-green-200 flex items-center justify-center text-xs"
              style={{ zIndex: 10 - index }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.2, 
                zIndex: 20,
                transition: { duration: 0.2 }
              }}
            >
              <motion.span
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  repeatDelay: 3 + index * 0.5 
                }}
              >
                {getWalletIcon(wallet.type)}
              </motion.span>
            </motion.div>
          ))}
          {connectedWallets.length > 3 && (
            <motion.div
              className="w-6 h-6 bg-green-100 rounded-full border-2 border-green-200 flex items-center justify-center text-xs font-medium text-green-700"
              style={{ zIndex: 7 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.2 }}
            >
              +{connectedWallets.length - 3}
            </motion.div>
          )}
        </div>
        <motion.span 
          className="text-sm font-medium text-green-800"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {connectedWallets.length} Wallets
        </motion.span>
        <motion.div
          animate={{ rotate: isDropdownOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className="h-4 w-4 text-green-600" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 overflow-hidden"
          >
            <motion.div 
              className="px-4 py-2 border-b border-gray-200"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Connected Wallets ({connectedWallets.length})
                </span>
                <motion.button
                  onClick={() => setIsModalOpen(true)}
                  className="text-sm text-primary-600 hover:text-primary-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Add Wallet
                </motion.button>
              </div>
            </motion.div>
            
            <div className="max-h-64 overflow-y-auto">
              {connectedWallets.map((wallet, index) => (
                <motion.div 
                  key={wallet.id} 
                  className="px-4 py-3 hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <motion.span 
                        className="text-lg"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ 
                          delay: 0.2 + index * 0.05, 
                          type: "spring", 
                          stiffness: 200 
                        }}
                        whileHover={{ 
                          scale: 1.2, 
                          rotate: [0, 10, -10, 0],
                          transition: { duration: 0.3 }
                        }}
                      >
                        {getWalletIcon(wallet.type)}
                      </motion.span>
                      <div>
                        <motion.div 
                          className="text-sm font-medium text-gray-900"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.05 }}
                        >
                          {wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)}
                        </motion.div>
                        <motion.div 
                          className="text-xs text-gray-500"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + index * 0.05 }}
                        >
                          {formatAddress(wallet.address)}
                        </motion.div>
                        <motion.div 
                          className="text-xs text-gray-500"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + index * 0.05 }}
                        >
                          {wallet.chainName}
                        </motion.div>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => disconnectWallet(wallet.id)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                      whileHover={{ 
                        scale: 1.1, 
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        rotate: [0, -10, 10, 0]
                      }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <WalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

export default WalletConnector