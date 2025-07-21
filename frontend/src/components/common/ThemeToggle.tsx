import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useTheme } from './ThemeProvider'

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme, isAnimated, isTransitioning } = useTheme()
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])
  const buttonRef = useRef<HTMLButtonElement>(null)
  const rippleIdRef = useRef(0)

  const toggleVariants = {
    light: { 
      x: 0,
      rotate: 0,
      scale: 1
    },
    dark: { 
      x: 28,
      rotate: 180,
      scale: 1.1
    }
  }

  const backgroundVariants = {
    light: {
      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
      boxShadow: '0 4px 20px rgba(251, 191, 36, 0.3)'
    },
    dark: {
      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
      boxShadow: '0 4px 20px rgba(30, 41, 59, 0.5)'
    }
  }

  const iconVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.5, 
      rotate: -180 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.5, 
      rotate: 180,
      transition: {
        duration: 0.2
      }
    }
  }

  const glowVariants = {
    light: {
      opacity: [0.5, 1, 0.5],
      scale: [1, 1.2, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    dark: {
      opacity: [0.3, 0.8, 0.3],
      scale: [1, 1.1, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  // Handle click with ripple effect
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isTransitioning || !isAnimated) {
      toggleTheme()
      return
    }

    const button = buttonRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const newRipple = {
      id: rippleIdRef.current++,
      x,
      y
    }

    setRipples(prev => [...prev, newRipple])

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
    }, 600)

    toggleTheme()
  }

  return (
    <div className="relative">
      {/* Glow Effect */}
      {isAnimated && (
        <motion.div
          className="absolute inset-0 rounded-full blur-md"
          variants={glowVariants}
          animate={theme}
          style={{
            background: theme === 'dark' 
              ? 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%)'
          }}
        />
      )}
      
      {/* Main Toggle Button */}
      <motion.button
        ref={buttonRef}
        onClick={handleClick}
        disabled={isTransitioning}
        className={`
          relative w-16 h-8 rounded-full p-1 cursor-pointer overflow-hidden
          focus:outline-none focus:ring-4 focus:ring-orange-500/30
          transition-all duration-200 ease-out
          ${isTransitioning ? 'cursor-wait' : 'hover:scale-105'}
          ${isAnimated ? 'btn-animated' : ''}
        `}
        variants={isAnimated ? backgroundVariants : undefined}
        animate={isAnimated ? theme : undefined}
        initial={false}
        whileTap={isAnimated ? { scale: 0.95 } : undefined}
        style={{
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, #1e293b, #0f172a)'
            : 'linear-gradient(135deg, #fbbf24, #f59e0b)'
        }}
      >
        {/* Ripple Effects */}
        {isAnimated && ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
        {/* Toggle Circle */}
        <motion.div
          className="w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center relative overflow-hidden"
          variants={isAnimated ? toggleVariants : undefined}
          animate={isAnimated ? theme : undefined}
          initial={false}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
        >
          {/* Icon Container */}
          <div className="relative w-4 h-4">
            <AnimatePresence mode="wait">
              {theme === 'light' ? (
                <motion.div
                  key="sun"
                  variants={isAnimated ? iconVariants : undefined}
                  initial={isAnimated ? "hidden" : undefined}
                  animate={isAnimated ? "visible" : undefined}
                  exit={isAnimated ? "exit" : undefined}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <SunIcon className="w-4 h-4 text-yellow-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  variants={isAnimated ? iconVariants : undefined}
                  initial={isAnimated ? "hidden" : undefined}
                  animate={isAnimated ? "visible" : undefined}
                  exit={isAnimated ? "exit" : undefined}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <MoonIcon className="w-4 h-4 text-blue-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sparkle Effects */}
          {isAnimated && (
            <>
              <motion.div
                className="absolute top-0 right-0 w-1 h-1 bg-yellow-300 rounded-full"
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [0, 3, 0],
                  y: [0, -3, 0]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: 0.5
                }}
              />
              <motion.div
                className="absolute bottom-0 left-0 w-1 h-1 bg-blue-300 rounded-full"
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [0, -2, 0],
                  y: [0, 2, 0]
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: 0.8
                }}
              />
            </>
          )}
        </motion.div>

        {/* Background Pattern */}
        <div className="absolute inset-0 rounded-full opacity-20">
          {theme === 'dark' ? (
            <div className="w-full h-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full" />
          )}
        </div>
      </motion.button>

      {/* Tooltip */}
      <motion.div
        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded opacity-0 pointer-events-none"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
      </motion.div>
    </div>
  )
}

export default ThemeToggle