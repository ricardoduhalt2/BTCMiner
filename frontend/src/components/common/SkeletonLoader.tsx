import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from './ThemeProvider'
import { useAnimation } from './AnimationProvider'

interface SkeletonLoaderProps {
  width?: string | number
  height?: string | number
  variant?: 'text' | 'rectangular' | 'circular' | 'card' | 'avatar'
  animation?: boolean
  className?: string
  count?: number
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = '1rem',
  variant = 'text',
  animation = true,
  className = '',
  count = 1
}) => {
  const { isAnimated, theme } = useTheme()

  const shimmerVariants = {
    animate: {
      x: ['-100%', '100%'],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  }

  const pulseVariants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'text':
        return {
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          borderRadius: '0.25rem'
        }
      case 'rectangular':
        return {
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          borderRadius: '0.5rem'
        }
      case 'circular':
        const size = typeof width === 'number' ? `${width}px` : width
        return {
          width: size,
          height: size,
          borderRadius: '50%'
        }
      case 'avatar':
        return {
          width: '3rem',
          height: '3rem',
          borderRadius: '50%'
        }
      case 'card':
        return {
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height || '12rem',
          borderRadius: '0.75rem'
        }
      default:
        return {
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          borderRadius: '0.25rem'
        }
    }
  }

  const baseClasses = theme === 'dark' 
    ? 'bg-gray-700' 
    : 'bg-gray-200'

  const SkeletonElement = ({ index = 0 }: { index?: number }) => (
    <motion.div
      initial={isAnimated ? { opacity: 0 } : {}}
      animate={isAnimated ? { opacity: 1 } : {}}
      transition={isAnimated ? { delay: index * 0.1 } : {}}
      className={`relative overflow-hidden ${baseClasses} ${className}`}
      style={getVariantStyles()}
    >
      {/* Shimmer Effect */}
      {animation && isAnimated && (
        <motion.div
          variants={shimmerVariants}
          animate="animate"
          className="absolute inset-0 -translate-x-full"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)'
          }}
        />
      )}
      
      {/* Pulse Effect (fallback for reduced motion) */}
      {animation && !isAnimated && (
        <motion.div
          variants={pulseVariants}
          animate="animate"
          className="absolute inset-0"
          style={{
            background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
          }}
        />
      )}
    </motion.div>
  )

  if (count === 1) {
    return <SkeletonElement />
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonElement key={index} index={index} />
      ))}
    </div>
  )
}

// Predefined skeleton components for common use cases
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className = '' 
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }, (_, index) => (
      <SkeletonLoader
        key={index}
        width={index === lines - 1 ? '75%' : '100%'}
        height="1rem"
        variant="text"
      />
    ))}
  </div>
)

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    <SkeletonLoader variant="rectangular" height="12rem" />
    <div className="space-y-2">
      <SkeletonLoader width="60%" height="1.25rem" />
      <SkeletonLoader width="80%" height="1rem" />
      <SkeletonLoader width="40%" height="1rem" />
    </div>
  </div>
)

export const SkeletonProfile: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center space-x-4 ${className}`}>
    <SkeletonLoader variant="avatar" />
    <div className="flex-1 space-y-2">
      <SkeletonLoader width="40%" height="1.25rem" />
      <SkeletonLoader width="60%" height="1rem" />
    </div>
  </div>
)

export const SkeletonTable: React.FC<{ rows?: number; columns?: number; className?: string }> = ({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}) => (
  <div className={`space-y-3 ${className}`}>
    {/* Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }, (_, index) => (
        <SkeletonLoader key={index} height="1.5rem" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }, (_, colIndex) => (
          <SkeletonLoader key={colIndex} height="1.25rem" />
        ))}
      </div>
    ))}
  </div>
)

export default SkeletonLoader