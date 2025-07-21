import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from './ThemeProvider'

const WelcomeAnimation: React.FC = () => {
  const { theme, isAnimated } = useTheme()
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    // Show welcome animation only on first load and if it's dark theme
    const hasSeenWelcome = localStorage.getItem('btcminer-welcome-seen')
    
    if (!hasSeenWelcome && theme === 'dark' && isAnimated) {
      setShowWelcome(true)
      localStorage.setItem('btcminer-welcome-seen', 'true')
      
      // Hide after 4 seconds
      const timer = setTimeout(() => {
        setShowWelcome(false)
      }, 4000)
      
      return () => {
        clearTimeout(timer)
        setShowWelcome(false) // Asegurar que se oculte al limpiar
      }
    }
  }, [theme, isAnimated])

  // Efecto adicional para limpiar la animación si el tema cambia
  useEffect(() => {
    if (theme !== 'dark' && showWelcome) {
      setShowWelcome(false)
    }
  }, [theme, showWelcome])

  if (!showWelcome || !isAnimated) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {showWelcome && (
          <>
            {/* Welcome Text */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{ 
                duration: 0.8, 
                ease: "easeOut",
                type: "spring",
                stiffness: 100
              }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
            >
              {/* Logo Animation */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                  y: [0, -10, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
                className="mb-6"
              >
                <img 
                  src="/logoBTCMINER.png" 
                  alt="BTCMiner Logo" 
                  className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-lg shadow-xl"
                />
              </motion.div>
              
              <motion.div
                animate={{ 
                  textShadow: [
                    '0 0 20px rgba(251, 191, 36, 0.5)',
                    '0 0 40px rgba(251, 191, 36, 0.8)',
                    '0 0 20px rgba(251, 191, 36, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent"
              >
                Welcome to BTCMiner
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-lg md:text-xl text-gray-300 mt-4"
              >
                🌙 Dark Mode Activated
              </motion.div>
            </motion.div>

            {/* Confetti Explosion */}
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={`confetti-${i}`}
                initial={{
                  x: window.innerWidth / 2,
                  y: window.innerHeight / 2,
                  scale: 0,
                  rotate: 0,
                  opacity: 1
                }}
                animate={{
                  x: window.innerWidth / 2 + (Math.random() - 0.5) * window.innerWidth,
                  y: window.innerHeight / 2 + (Math.random() - 0.5) * window.innerHeight,
                  scale: [0, 1, 0.8, 0],
                  rotate: Math.random() * 720,
                  opacity: [1, 1, 0.8, 0]
                }}
                transition={{
                  duration: 3,
                  delay: Math.random() * 0.5,
                  ease: "easeOut"
                }}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: [
                    '#f59e0b', '#ef4444', '#3b82f6', '#10b981', 
                    '#8b5cf6', '#f97316', '#06b6d4', '#eab308'
                  ][Math.floor(Math.random() * 8)]
                }}
              />
            ))}

            {/* Sparkle Effects */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  scale: 0,
                  opacity: 0
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 2,
                  repeat: 1,
                  ease: "easeInOut"
                }}
                className="absolute text-2xl"
              >
                ✨
              </motion.div>
            ))}

            {/* Floating Orbs */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`orb-${i}`}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 100,
                  scale: 0,
                  opacity: 0
                }}
                animate={{
                  y: -100,
                  scale: [0, 1, 0.8, 0],
                  opacity: [0, 0.8, 0.6, 0],
                  x: Math.random() * window.innerWidth
                }}
                transition={{
                  duration: 4,
                  delay: i * 0.3,
                  ease: "easeOut"
                }}
                className="absolute w-6 h-6 rounded-full blur-sm"
                style={{
                  background: 'linear-gradient(45deg, #f59e0b, #ef4444)',
                  boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)'
                }}
              />
            ))}

            {/* Ripple Effect */}
            <motion.div
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 6, opacity: 0 }}
              transition={{ duration: 3, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: '100px',
                height: '100px',
                background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)'
              }}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default WelcomeAnimation