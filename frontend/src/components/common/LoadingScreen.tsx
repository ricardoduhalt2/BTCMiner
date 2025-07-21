import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from './ThemeProvider'

const LoadingScreen: React.FC = () => {
  const { isAnimated } = useTheme()

  const logoVariants = {
    animate: {
      rotate: 360,
      scale: [1, 1.1, 1],
      transition: {
        rotate: {
          duration: 2,
          repeat: Infinity,
          ease: 'linear'
        },
        scale: {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      }
    }
  }

  const textVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  }

  const glowVariants = {
    animate: {
      boxShadow: [
        '0 0 20px rgba(251, 191, 36, 0.3)',
        '0 0 40px rgba(251, 191, 36, 0.6)',
        '0 0 20px rgba(251, 191, 36, 0.3)'
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }

  const dotVariants = {
    animate: (i: number) => ({
      scale: [1, 1.5, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1,
        repeat: Infinity,
        delay: i * 0.2,
        ease: 'easeInOut'
      }
    })
  }

  const particleVariants = {
    animate: (i: number) => ({
      y: [0, -30, 0],
      x: [0, Math.sin(i) * 20, 0],
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        delay: i * 0.3,
        ease: 'easeInOut'
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden">
      {/* Background Particles */}
      {isAnimated && (
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={particleVariants}
              animate="animate"
              className="absolute w-2 h-2 bg-orange-500/30 rounded-full"
              style={{
                left: `${20 + i * 10}%`,
                top: `${30 + (i % 3) * 20}%`
              }}
            />
          ))}
        </div>
      )}

      <div className="text-center relative z-10">
        {/* Animated Logo */}
        <motion.div
          variants={isAnimated ? logoVariants : {}}
          animate={isAnimated ? "animate" : {}}
          className="w-20 h-20 mx-auto mb-6 relative"
        >
          <motion.div
            variants={isAnimated ? glowVariants : {}}
            animate={isAnimated ? "animate" : {}}
            className="absolute inset-0 rounded-lg"
          />
          <img 
            src="/logoBTCMINER.png" 
            alt="BTCMiner Logo" 
            className="w-20 h-20 rounded-lg relative z-10"
          />
        </motion.div>
        
        {/* Animated Title */}
        <motion.h2
          variants={isAnimated ? textVariants : {}}
          initial={isAnimated ? "initial" : {}}
          animate={isAnimated ? "animate" : {}}
          className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent mb-3"
        >
          BTCMiner
        </motion.h2>
        
        {/* Animated Subtitle */}
        <motion.p
          variants={isAnimated ? textVariants : {}}
          initial={isAnimated ? "initial" : {}}
          animate={isAnimated ? "animate" : {}}
          transition={{ delay: 0.2 }}
          className="text-gray-300 mb-8 text-lg"
        >
          Loading your multi-chain platform...
        </motion.p>
        
        {/* Animated Loading Dots */}
        <div className="flex items-center justify-center space-x-3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              custom={i}
              variants={isAnimated ? dotVariants : {}}
              animate={isAnimated ? "animate" : {}}
              className="w-3 h-3 bg-orange-500 rounded-full"
            />
          ))}
        </div>

        {/* Progress Indicator */}
        {isAnimated && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 3, ease: 'easeInOut' }}
            className="h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mt-8 mx-auto max-w-xs"
          />
        )}

        {/* Floating Elements */}
        {isAnimated && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 180, 360],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: 'easeInOut'
                }}
                className="absolute w-1 h-1 bg-orange-400 rounded-full"
                style={{
                  left: `${10 + i * 15}%`,
                  top: `${20 + (i % 2) * 60}%`
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LoadingScreen