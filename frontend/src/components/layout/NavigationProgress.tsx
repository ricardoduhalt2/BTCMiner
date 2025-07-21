import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface NavigationProgressProps {
  className?: string
}

const NavigationProgress: React.FC<NavigationProgressProps> = ({ className = '' }) => {
  const location = useLocation()
  const [progress, setProgress] = useState(0)
  const [isNavigating, setIsNavigating] = useState(false)

  // Navigation progress simulation
  useEffect(() => {
    setIsNavigating(true)
    setProgress(0)

    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setTimeout(() => setIsNavigating(false), 200)
          return 100
        }
        return prev + Math.random() * 30
      })
    }, 50)

    return () => {
      clearInterval(progressInterval)
    }
  }, [location.pathname])

  const progressVariants = {
    hidden: { 
      scaleX: 0,
      opacity: 0
    },
    visible: { 
      scaleX: progress / 100,
      opacity: 1,
      transition: {
        scaleX: { duration: 0.1, ease: "easeOut" },
        opacity: { duration: 0.2 }
      }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 }
    }
  }

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          className={`fixed top-0 left-0 right-0 z-50 h-1 ${className}`}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600 origin-left"
            variants={progressVariants}
            style={{
              boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
            }}
          />
          
          {/* Shimmer effect */}
          <motion.div
            className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: [-80, window.innerWidth + 80]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NavigationProgress