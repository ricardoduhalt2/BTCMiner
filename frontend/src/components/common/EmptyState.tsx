import React from 'react'
import { motion } from 'framer-motion'
import { useAnimation } from './AnimationProvider'
import AnimatedButton from './AnimatedButton'
import AnimatedContainer from './AnimatedContainer'

interface EmptyStateProps {
  icon?: React.ReactNode | string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'ghost'
  }
  animation?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  type?: 'default' | 'search' | 'error' | 'success' | 'wallet' | 'transaction'
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  animation = true,
  className = '',
  size = 'md',
  type = 'default'
}) => {
  const { isAnimated } = useAnimation()

  // Predefined icons and styles for different types
  const typeConfig = {
    default: {
      icon: '📭',
      bgColor: 'bg-gray-50 dark:bg-gray-800/50',
      iconColor: 'text-gray-400',
      titleColor: 'text-gray-900 dark:text-gray-100',
      descColor: 'text-gray-600 dark:text-gray-400'
    },
    search: {
      icon: '🔍',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-900 dark:text-blue-100',
      descColor: 'text-blue-700 dark:text-blue-300'
    },
    error: {
      icon: '❌',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-500',
      titleColor: 'text-red-900 dark:text-red-100',
      descColor: 'text-red-700 dark:text-red-300'
    },
    success: {
      icon: '✅',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-500',
      titleColor: 'text-green-900 dark:text-green-100',
      descColor: 'text-green-700 dark:text-green-300'
    },
    wallet: {
      icon: '◆',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-500',
      titleColor: 'text-orange-900 dark:text-orange-100',
      descColor: 'text-orange-700 dark:text-orange-300'
    },
    transaction: {
      icon: '📊',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-500',
      titleColor: 'text-purple-900 dark:text-purple-100',
      descColor: 'text-purple-700 dark:text-purple-300'
    }
  }

  const config = typeConfig[type]
  const displayIcon = icon || config.icon

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'py-8 px-6',
      iconSize: 'text-4xl',
      titleSize: 'text-lg',
      descSize: 'text-sm',
      maxWidth: 'max-w-sm'
    },
    md: {
      container: 'py-12 px-8',
      iconSize: 'text-6xl',
      titleSize: 'text-xl',
      descSize: 'text-base',
      maxWidth: 'max-w-md'
    },
    lg: {
      container: 'py-16 px-10',
      iconSize: 'text-8xl',
      titleSize: 'text-2xl',
      descSize: 'text-lg',
      maxWidth: 'max-w-lg'
    }
  }

  const sizeStyles = sizeConfig[size]

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  }

  const iconVariants = {
    animate: {
      y: [0, -10, 0],
      rotate: [0, 5, -5, 0],
      scale: [1, 1.1, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }

  const floatingVariants = {
    animate: (i: number) => ({
      y: [0, -15, 0],
      x: [0, Math.sin(i) * 10, 0],
      opacity: [0.3, 0.8, 0.3],
      scale: [0.8, 1.2, 0.8],
      transition: {
        duration: 2 + i * 0.5,
        repeat: Infinity,
        delay: i * 0.3,
        ease: 'easeInOut'
      }
    })
  }

  return (
    <AnimatedContainer
      animation="scaleIn"
      className={`
        text-center ${config.bgColor} rounded-2xl ${sizeStyles.container} 
        ${sizeStyles.maxWidth} mx-auto relative overflow-hidden
        ${className}
      `}
    >
      {/* Floating background elements */}
      {animation && isAnimated && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={floatingVariants}
              animate="animate"
              className="absolute w-2 h-2 bg-current opacity-10 rounded-full"
              style={{
                left: `${20 + i * 12}%`,
                top: `${30 + (i % 3) * 20}%`,
                color: config.iconColor.split(' ')[0].replace('text-', '')
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        variants={isAnimated && animation ? containerVariants : {}}
        initial={isAnimated && animation ? "initial" : {}}
        animate={isAnimated && animation ? "animate" : {}}
        className="relative z-10"
      >
        {/* Icon */}
        <motion.div
          variants={isAnimated && animation ? itemVariants : {}}
          className="mb-6"
        >
          <motion.div
            variants={isAnimated && animation ? iconVariants : {}}
            animate={isAnimated && animation ? "animate" : {}}
            className={`${sizeStyles.iconSize} ${config.iconColor} inline-block`}
          >
            {typeof displayIcon === 'string' ? (
              <span>{displayIcon}</span>
            ) : (
              displayIcon
            )}
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h3
          variants={isAnimated && animation ? itemVariants : {}}
          className={`${sizeStyles.titleSize} font-bold ${config.titleColor} mb-3`}
        >
          {title}
        </motion.h3>

        {/* Description */}
        <motion.p
          variants={isAnimated && animation ? itemVariants : {}}
          className={`${sizeStyles.descSize} ${config.descColor} mb-6 leading-relaxed`}
        >
          {description}
        </motion.p>

        {/* Action Button */}
        {action && (
          <motion.div
            variants={isAnimated && animation ? itemVariants : {}}
          >
            <AnimatedButton
              variant={action.variant || 'primary'}
              animation="glow"
              onClick={action.onClick}
              size={size}
            >
              {action.label}
            </AnimatedButton>
          </motion.div>
        )}
      </motion.div>

      {/* Decorative elements */}
      {animation && isAnimated && (
        <>
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute top-4 right-4 w-8 h-8 border-2 border-current rounded-full"
            style={{ color: config.iconColor.split(' ')[0].replace('text-', '') }}
          />
          <motion.div
            animate={{
              rotate: [360, 0],
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute bottom-4 left-4 w-6 h-6 border border-current rounded-full"
            style={{ color: config.iconColor.split(' ')[0].replace('text-', '') }}
          />
        </>
      )}
    </AnimatedContainer>
  )
}

// Predefined empty state components
export const NoWalletsEmpty: React.FC<{ onConnect: () => void }> = ({ onConnect }) => (
  <EmptyState
    type="wallet"
    title="No Wallets Connected"
    description="Connect your first wallet to start using BTCMiner's cross-chain features and manage your digital assets."
    action={{
      label: "Connect Wallet",
      onClick: onConnect,
      variant: "primary"
    }}
    size="md"
  />
)

export const NoTransactionsEmpty: React.FC<{ onCreateTransaction?: () => void }> = ({ onCreateTransaction }) => (
  <EmptyState
    type="transaction"
    title="No Transactions Yet"
    description="Your transaction history will appear here once you start using the platform."
    action={onCreateTransaction ? {
      label: "Make First Transaction",
      onClick: onCreateTransaction,
      variant: "primary"
    } : undefined}
    size="md"
  />
)

export const SearchEmpty: React.FC<{ query: string; onClear?: () => void }> = ({ query, onClear }) => (
  <EmptyState
    type="search"
    title="No Results Found"
    description={`We couldn't find anything matching "${query}". Try adjusting your search terms.`}
    action={onClear ? {
      label: "Clear Search",
      onClick: onClear,
      variant: "secondary"
    } : undefined}
    size="sm"
  />
)

export const ErrorEmpty: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <EmptyState
    type="error"
    title="Something Went Wrong"
    description="We encountered an error while loading your data. Please try again."
    action={{
      label: "Try Again",
      onClick: onRetry,
      variant: "primary"
    }}
    size="md"
  />
)

export const SuccessEmpty: React.FC<{ title: string; description: string; onContinue?: () => void }> = ({ 
  title, 
  description, 
  onContinue 
}) => (
  <EmptyState
    type="success"
    title={title}
    description={description}
    action={onContinue ? {
      label: "Continue",
      onClick: onContinue,
      variant: "primary"
    } : undefined}
    size="md"
  />
)

export default EmptyState