import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HomeIcon,
  ArrowsRightLeftIcon,
  UserCircleIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  BeakerIcon,
  CogIcon,
} from '@heroicons/react/24/outline'

interface NavigationIndicatorProps {
  className?: string
}

const NavigationIndicator: React.FC<NavigationIndicatorProps> = ({ className = '' }) => {
  const location = useLocation()
  const [showIndicator, setShowIndicator] = useState(false)
  const [currentPage, setCurrentPage] = useState('')

  const pageIcons: Record<string, React.ComponentType<any>> = {
    '/dashboard': HomeIcon,
    '/': HomeIcon,
    '/bridge': ArrowsRightLeftIcon,
    '/identity': UserCircleIcon,
    '/portfolio': ChartBarIcon,
    '/liquidity': BeakerIcon,
    '/price-monitoring': CurrencyDollarIcon,
    '/settings': CogIcon,
  }

  const pageNames: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/': 'Dashboard',
    '/bridge': 'Bridge',
    '/identity': 'Identity',
    '/portfolio': 'Portfolio',
    '/liquidity': 'Liquidity',
    '/price-monitoring': 'Price Monitor',
    '/settings': 'Settings',
  }

  const pageColors: Record<string, string> = {
    '/dashboard': 'from-blue-500 to-blue-600',
    '/': 'from-blue-500 to-blue-600',
    '/bridge': 'from-purple-500 to-purple-600',
    '/identity': 'from-green-500 to-green-600',
    '/portfolio': 'from-yellow-500 to-yellow-600',
    '/liquidity': 'from-cyan-500 to-cyan-600',
    '/price-monitoring': 'from-orange-500 to-orange-600',
    '/settings': 'from-gray-500 to-gray-600',
  }

  useEffect(() => {
    const pageName = pageNames[location.pathname] || 'Page'
    setCurrentPage(pageName)
    setShowIndicator(true)

    const timer = setTimeout(() => {
      setShowIndicator(false)
    }, 2500)

    return () => clearTimeout(timer)
  }, [location.pathname])

  const IconComponent = pageIcons[location.pathname] || HomeIcon
  const gradientColor = pageColors[location.pathname] || 'from-blue-500 to-blue-600'

  const indicatorVariants = {
    hidden: {
      opacity: 0,
      scale: 0.5,
      y: 50,
      rotate: -180
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        duration: 0.6
      }
    },
    exit: {
      opacity: 0,
      scale: 0.5,
      y: -50,
      rotate: 180,
      transition: {
        duration: 0.4,
        ease: "easeIn"
      }
    }
  }

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 15,
        delay: 0.2
      }
    }
  }

  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: 0.4, duration: 0.3 }
    }
  }

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          className={`fixed bottom-6 left-6 z-50 pointer-events-none ${className}`}
          variants={indicatorVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className={`flex items-center space-x-3 px-4 py-3 rounded-full backdrop-blur-sm border border-white/20 bg-gradient-to-r ${gradientColor} shadow-lg`}
            whileHover={{ scale: 1.05 }}
          >
            {/* Page Icon */}
            <motion.div
              variants={iconVariants}
              className="text-white"
            >
              <IconComponent className="h-6 w-6" />
            </motion.div>

            {/* Page Name */}
            <motion.div
              className="text-white font-medium text-sm"
              variants={textVariants}
            >
              {currentPage}
            </motion.div>

            {/* Animated dots */}
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 bg-white/60 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Glow effect */}
          <motion.div
            className={`absolute inset-0 rounded-full bg-gradient-to-r ${gradientColor} opacity-30 blur-lg`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NavigationIndicator