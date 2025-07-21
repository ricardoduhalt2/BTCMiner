import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from './ThemeProvider'

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'ring' | 'orbit' | 'wave' | 'bounce'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'white' | 'current'
  text?: string
  className?: string
  fullScreen?: boolean
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  text,
  className = '',
  fullScreen = false
}) => {
  const { isAnimated, theme } = useTheme()

  // Size configurations
  const sizeConfig = {
    xs: { spinner: 'w-4 h-4', text: 'text-xs', gap: 'gap-2' },
    sm: { spinner: 'w-6 h-6', text: 'text-sm', gap: 'gap-3' },
    md: { spinner: 'w-8 h-8', text: 'text-base', gap: 'gap-4' },
    lg: { spinner: 'w-12 h-12', text: 'text-lg', gap: 'gap-5' },
    xl: { spinner: 'w-16 h-16', text: 'text-xl', gap: 'gap-6' }
  }

  // Color configurations
  const colorConfig = {
    primary: 'text-orange-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    white: 'text-white',
    current: 'text-current'
  }

  const sizeStyles = sizeConfig[size]
  const colorStyles = colorConfig[color]

  // Animation variants for different spinner types
  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  }

  const dotsVariants = {
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

  const pulseVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }

  const barsVariants = {
    animate: (i: number) => ({
      scaleY: [1, 2, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        delay: i * 0.1,
        ease: 'easeInOut'
      }
    })
  }

  const ringVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  }

  const orbitVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  }

  const waveVariants = {
    animate: (i: number) => ({
      y: [0, -10, 0],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        delay: i * 0.1,
        ease: 'easeInOut'
      }
    })
  }

  const bounceVariants = {
    animate: (i: number) => ({
      y: [0, -20, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        delay: i * 0.1,
        ease: 'easeInOut'
      }
    })
  }

  // Render different spinner variants
  const renderSpinner = () => {
    if (!isAnimated) {
      return (
        <div className={`${sizeStyles.spinner} ${colorStyles} opacity-75`}>
          <div className="w-full h-full border-2 border-current border-t-transparent rounded-full" />
        </div>
      )
    }

    switch (variant) {
      case 'spinner':
        return (
          <motion.div
            variants={spinnerVariants}
            animate="animate"
            className={`${sizeStyles.spinner} ${colorStyles}`}
          >
            <div className="w-full h-full border-2 border-current border-t-transparent rounded-full" />
          </motion.div>
        )

      case 'dots':
        return (
          <div className={`flex ${sizeStyles.gap} ${colorStyles}`}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                custom={i}
                variants={dotsVariants}
                animate="animate"
                className="w-2 h-2 bg-current rounded-full"
              />
            ))}
          </div>
        )

      case 'pulse':
        return (
          <motion.div
            variants={pulseVariants}
            animate="animate"
            className={`${sizeStyles.spinner} ${colorStyles}`}
          >
            <div className="w-full h-full bg-current rounded-full" />
          </motion.div>
        )

      case 'bars':
        return (
          <div className={`flex items-end ${sizeStyles.gap} ${colorStyles}`}>
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                custom={i}
                variants={barsVariants}
                animate="animate"
                className="w-1 h-4 bg-current rounded-full origin-bottom"
              />
            ))}
          </div>
        )

      case 'ring':
        return (
          <motion.div
            variants={ringVariants}
            animate="animate"
            className={`${sizeStyles.spinner} ${colorStyles}`}
          >
            <div className="w-full h-full border-2 border-transparent border-t-current border-r-current rounded-full" />
          </motion.div>
        )

      case 'orbit':
        return (
          <div className={`${sizeStyles.spinner} ${colorStyles} relative`}>
            <motion.div
              variants={orbitVariants}
              animate="animate"
              className="w-full h-full"
            >
              <div className="absolute top-0 left-1/2 w-2 h-2 bg-current rounded-full transform -translate-x-1/2" />
              <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-current rounded-full transform -translate-x-1/2 opacity-60" />
            </motion.div>
          </div>
        )

      case 'wave':
        return (
          <div className={`flex items-center ${sizeStyles.gap} ${colorStyles}`}>
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                custom={i}
                variants={waveVariants}
                animate="animate"
                className="w-1 h-6 bg-current rounded-full"
              />
            ))}
          </div>
        )

      case 'bounce':
        return (
          <div className={`flex ${sizeStyles.gap} ${colorStyles}`}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                custom={i}
                variants={bounceVariants}
                animate="animate"
                className="w-3 h-3 bg-current rounded-full"
              />
            ))}
          </div>
        )

      default:
        return renderSpinner()
    }
  }

  const content = (
    <div className={`flex flex-col items-center justify-center ${sizeStyles.gap} ${className}`}>
      {renderSpinner()}
      {text && (
        <motion.p
          initial={isAnimated ? { opacity: 0, y: 10 } : {}}
          animate={isAnimated ? { opacity: 1, y: 0 } : {}}
          transition={isAnimated ? { delay: 0.2 } : {}}
          className={`${sizeStyles.text} ${colorStyles} font-medium`}
        >
          {text}
        </motion.p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <motion.div
        initial={isAnimated ? { opacity: 0 } : {}}
        animate={isAnimated ? { opacity: 1 } : {}}
        className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50"
      >
        {content}
      </motion.div>
    )
  }

  return content
}

// Predefined loading components
export const PageLoader: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
  <LoadingSpinner
    variant="spinner"
    size="lg"
    color="primary"
    text={text}
    fullScreen
  />
)

export const ButtonLoader: React.FC = () => (
  <LoadingSpinner
    variant="spinner"
    size="sm"
    color="white"
  />
)

export const InlineLoader: React.FC<{ text?: string }> = ({ text }) => (
  <LoadingSpinner
    variant="dots"
    size="sm"
    color="current"
    text={text}
    className="py-4"
  />
)

export const CardLoader: React.FC<{ text?: string }> = ({ text = "Loading data..." }) => (
  <div className="flex items-center justify-center py-12">
    <LoadingSpinner
      variant="ring"
      size="md"
      color="primary"
      text={text}
    />
  </div>
)

export const TableLoader: React.FC = () => (
  <div className="flex items-center justify-center py-8">
    <LoadingSpinner
      variant="bars"
      size="md"
      color="primary"
      text="Loading table data..."
    />
  </div>
)

export const WalletLoader: React.FC = () => (
  <LoadingSpinner
    variant="orbit"
    size="lg"
    color="primary"
    text="Connecting wallet..."
  />
)

export const TransactionLoader: React.FC = () => (
  <LoadingSpinner
    variant="wave"
    size="md"
    color="primary"
    text="Processing transaction..."
  />
)

export default LoadingSpinner