import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ClockIcon,
  WifiIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface WalletConnectionStatusProps {
  status: 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting'
  walletName?: string
  className?: string
}

const WalletConnectionStatus: React.FC<WalletConnectionStatusProps> = ({ 
  status, 
  walletName = 'Wallet',
  className = '' 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connecting':
        return {
          icon: ClockIcon,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          message: `Connecting to ${walletName}...`,
          animation: { rotate: 360 },
          animationConfig: { duration: 2, repeat: Infinity, ease: "linear" }
        }
      case 'connected':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          message: `${walletName} connected successfully`,
          animation: { scale: [1, 1.1, 1] },
          animationConfig: { duration: 0.5 }
        }
      case 'disconnected':
        return {
          icon: XCircleIcon,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          message: `${walletName} disconnected`,
          animation: { opacity: [1, 0.5, 1] },
          animationConfig: { duration: 1 }
        }
      case 'error':
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          message: `Failed to connect to ${walletName}`,
          animation: { x: [-2, 2, -2, 2, 0] },
          animationConfig: { duration: 0.5 }
        }
      case 'reconnecting':
        return {
          icon: WifiIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          message: `Reconnecting to ${walletName}...`,
          animation: { scale: [1, 1.1, 1] },
          animationConfig: { duration: 1, repeat: Infinity }
        }
      default:
        return {
          icon: ClockIcon,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          message: 'Unknown status',
          animation: {},
          animationConfig: {}
        }
    }
  }

  const config = getStatusConfig()
  const IconComponent = config.icon

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`flex items-center space-x-3 p-3 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}
      >
        <motion.div
          animate={config.animation}
          transition={config.animationConfig}
          className={`flex-shrink-0 ${config.color}`}
        >
          <IconComponent className="w-5 h-5" />
        </motion.div>
        
        <motion.span 
          className={`text-sm font-medium ${config.color}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {config.message}
        </motion.span>
        
        {/* Animated progress bar for connecting states */}
        {(status === 'connecting' || status === 'reconnecting') && (
          <motion.div
            className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className={`h-full ${status === 'connecting' ? 'bg-yellow-400' : 'bg-blue-400'} rounded-full`}
              initial={{ width: '0%' }}
              animate={{ width: ['0%', '100%', '0%'] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          </motion.div>
        )}
        
        {/* Success checkmark animation */}
        {status === 'connected' && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: 0.2, 
              type: "spring", 
              stiffness: 200, 
              damping: 15 
            }}
            className="flex-shrink-0"
          >
            <div className="w-6 h-6 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
                className="w-3 h-3 text-green-600"
              >
                ✓
              </motion.div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default WalletConnectionStatus