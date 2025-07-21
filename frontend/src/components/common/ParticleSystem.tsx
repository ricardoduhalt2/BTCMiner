import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from './ThemeProvider'

interface Particle {
  id: string
  x: number
  y: number
  size: number
  color: string
  duration: number
  delay: number
}

const ParticleSystem: React.FC = () => {
  const { theme, isTransitioning, isAnimated } = useTheme()
  const [particles, setParticles] = useState<Particle[]>([])

  const createParticles = () => {
    if (!isAnimated) return []

    const particleCount = 20
    const colors = theme === 'dark' 
      ? ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'] // Blue, Purple, Cyan, Green
      : ['#f59e0b', '#ef4444', '#f97316', '#eab308'] // Orange, Red, Orange-Red, Yellow

    return Array.from({ length: particleCount }, (_, i) => ({
      id: `particle-${i}-${Date.now()}`,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 2 + 1,
      delay: Math.random() * 0.5
    }))
  }

  useEffect(() => {
    if (isTransitioning && isAnimated) {
      const newParticles = createParticles()
      setParticles(newParticles)

      // Clear particles after animation
      const timer = setTimeout(() => {
        setParticles([])
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isTransitioning, theme, isAnimated])

  if (!isAnimated) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              x: particle.x,
              y: particle.y,
              scale: 0,
              opacity: 0,
              rotate: 0
            }}
            animate={{
              x: particle.x + (Math.random() - 0.5) * 200,
              y: particle.y - Math.random() * 300 - 100,
              scale: [0, 1, 0.8, 0],
              opacity: [0, 1, 0.8, 0],
              rotate: Math.random() * 360
            }}
            exit={{
              scale: 0,
              opacity: 0
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: "easeOut"
            }}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}40`
            }}
          />
        ))}
      </AnimatePresence>

      {/* Theme Change Ripple Effect */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: '200px',
              height: '200px',
              background: theme === 'dark' 
                ? 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)'
            }}
          />
        )}
      </AnimatePresence>

      {/* Floating Orbs */}
      <AnimatePresence>
        {isTransitioning && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`orb-${i}`}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 50,
                  scale: 0,
                  opacity: 0
                }}
                animate={{
                  y: -50,
                  scale: [0, 1, 0.8, 0],
                  opacity: [0, 0.6, 0.4, 0],
                  x: Math.random() * window.innerWidth
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 3,
                  delay: i * 0.2,
                  ease: "easeOut"
                }}
                className="absolute w-4 h-4 rounded-full blur-sm"
                style={{
                  background: theme === 'dark' 
                    ? 'linear-gradient(45deg, #3b82f6, #8b5cf6)'
                    : 'linear-gradient(45deg, #f59e0b, #ef4444)'
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ParticleSystem