import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAnimationDebugger } from '@hooks/useAnimationDebugger'
import AnimationDebugger from './AnimationDebugger'

const AnimationDebugButton: React.FC = () => {
  const {
    isDebuggerOpen,
    openDebugger,
    closeDebugger,
    errorCount,
    performanceStatus,
    hasRecentErrors
  } = useAnimationDebugger()

  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Only show in development mode
  useEffect(() => {
    setIsVisible(process.env.NODE_ENV === 'development')
  }, [])

  // Listen for global debugger open event
  useEffect(() => {
    const handleOpenDebugger = () => {
      openDebugger()
    }

    window.addEventListener('openAnimationDebugger', handleOpenDebugger)
    return () => window.removeEventListener('openAnimationDebugger', handleOpenDebugger)
  }, [openDebugger])

  if (!isVisible) return null

  const getStatusColor = () => {
    if (hasRecentErrors) return 'bg-red-500'
    if (performanceStatus === 'poor') return 'bg-red-500'
    if (performanceStatus === 'fair') return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStatusText = () => {
    if (hasRecentErrors) return `${errorCount} errors`
    if (performanceStatus === 'poor') return 'Poor perf'
    if (performanceStatus === 'fair') return 'Fair perf'
    return 'Good'
  }

  return (
    <>
      {/* Floating Debug Button */}
      <motion.div
        className="fixed bottom-4 right-4 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 300, damping: 30 }}
      >
        <motion.button
          onClick={openDebugger}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className={`relative flex items-center space-x-2 px-3 py-2 rounded-full shadow-lg text-white font-medium text-sm transition-all duration-200 ${
            hasRecentErrors || performanceStatus !== 'good'
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Status Indicator */}
          <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`} />
          
          {/* Icon */}
          <span className="text-lg">🎬</span>
          
          {/* Status Text (shown on hover) */}
          <AnimatePresence>
            {isHovered && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden"
              >
                {getStatusText()}
              </motion.span>
            )}
          </AnimatePresence>
          
          {/* Error Badge */}
          {errorCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
            >
              {errorCount > 9 ? '9+' : errorCount}
            </motion.div>
          )}
        </motion.button>
        
        {/* Tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap"
            >
              Animation Debugger
              <div className="text-xs text-gray-300 mt-1">
                Ctrl+Shift+A to toggle
              </div>
              {/* Arrow */}
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Animation Debugger Modal */}
      <AnimationDebugger isOpen={isDebuggerOpen} onClose={closeDebugger} />
    </>
  )
}

export default AnimationDebugButton