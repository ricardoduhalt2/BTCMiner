import React, { ButtonHTMLAttributes } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { useAnimation } from './AnimationProvider'
import { useTheme } from './ThemeProvider'

interface AnimatedButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animation?: 'ripple' | 'pulse' | 'bounce' | 'glow' | 'shake' | 'rotate'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  gradient?: boolean
  children: React.ReactNode
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  variant = 'primary',
  size = 'md',
  animation = 'ripple',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  gradient = false,
  children,
  className = '',
  disabled,
  onClick,
  ...props
}) => {
  const { variants, isAnimated } = useAnimation()
  const { theme } = useTheme()

  // Base styles for different variants
  const variantStyles = {
    primary: gradient 
      ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25'
      : 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/25',
    secondary: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600',
    danger: gradient
      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25'
      : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25',
    success: gradient
      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/25'
      : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/25',
    warning: gradient
      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg shadow-yellow-500/25'
      : 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg shadow-yellow-500/25'
  }

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  }

  // Animation variants
  const buttonVariants = {
    ripple: {
      hover: { scale: 1.02 },
      tap: { scale: 0.98 }
    },
    pulse: {
      hover: { 
        scale: [1, 1.05, 1],
        transition: { 
          duration: 0.6, 
          repeat: Infinity 
        }
      },
      tap: { scale: 0.95 }
    },
    bounce: {
      hover: { 
        y: [0, -4, 0],
        transition: { 
          duration: 0.6, 
          repeat: Infinity 
        }
      },
      tap: { y: 2 }
    },
    glow: {
      hover: {
        boxShadow: theme === 'dark' 
          ? '0 0 30px rgba(251, 191, 36, 0.6)'
          : '0 0 30px rgba(251, 191, 36, 0.4)',
        scale: 1.02
      },
      tap: { scale: 0.98 }
    },
    shake: {
      hover: {
        x: [0, -2, 2, -2, 2, 0],
        transition: { duration: 0.5 }
      },
      tap: { scale: 0.95 }
    },
    rotate: {
      hover: { 
        rotate: [0, 5, -5, 0],
        transition: { duration: 0.5 }
      },
      tap: { scale: 0.95 }
    }
  }

  const loadingVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  }

  const rippleVariants = {
    initial: { scale: 0, opacity: 0.5 },
    animate: { 
      scale: 4, 
      opacity: 0,
      transition: { duration: 0.6 }
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return
    
    // Create ripple effect
    if (animation === 'ripple' && isAnimated) {
      const button = e.currentTarget
      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2
      
      const ripple = document.createElement('span')
      ripple.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
      `
      
      button.appendChild(ripple)
      setTimeout(() => ripple.remove(), 600)
    }
    
    onClick?.(e)
  }

  const baseClasses = `
    relative overflow-hidden font-semibold rounded-lg transition-all duration-200 ease-out
    focus:outline-none focus:ring-4 focus:ring-orange-500/30
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${className}
  `

  const buttonContent = (
    <>
      {loading && (
        <motion.div
          variants={isAnimated ? loadingVariants : {}}
          animate={isAnimated ? "animate" : {}}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
        </motion.div>
      )}
      
      <div className={`flex items-center justify-center space-x-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {icon && iconPosition === 'left' && (
          <motion.span
            animate={isAnimated ? {
              rotate: [0, 10, -10, 0]
            } : {}}
            transition={isAnimated ? {
              duration: 2,
              repeat: Infinity
            } : {}}
          >
            {icon}
          </motion.span>
        )}
        
        <span>{children}</span>
        
        {icon && iconPosition === 'right' && (
          <motion.span
            animate={isAnimated ? {
              rotate: [0, -10, 10, 0]
            } : {}}
            transition={isAnimated ? {
              duration: 2,
              repeat: Infinity
            } : {}}
          >
            {icon}
          </motion.span>
        )}
      </div>
    </>
  )

  if (!isAnimated) {
    return (
      <button
        className={baseClasses}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {buttonContent}
      </button>
    )
  }

  return (
    <motion.button
      className={baseClasses}
      variants={buttonVariants[animation]}
      whileHover={disabled || loading ? {} : "hover"}
      whileTap={disabled || loading ? {} : "tap"}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {buttonContent}
      
      {/* Gradient overlay for extra shine */}
      {gradient && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
      )}
    </motion.button>
  )
}

// Predefined button components
export const PrimaryButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (props) => (
  <AnimatedButton variant="primary" {...props} />
)

export const SecondaryButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (props) => (
  <AnimatedButton variant="secondary" {...props} />
)

export const GhostButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (props) => (
  <AnimatedButton variant="ghost" {...props} />
)

export const DangerButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (props) => (
  <AnimatedButton variant="danger" {...props} />
)

export const SuccessButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (props) => (
  <AnimatedButton variant="success" {...props} />
)

export const WarningButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (props) => (
  <AnimatedButton variant="warning" {...props} />
)

// Floating Action Button
export const FloatingActionButton: React.FC<{
  children: React.ReactNode
  onClick?: () => void
  className?: string
}> = ({ children, onClick, className = '' }) => {
  const { isAnimated } = useAnimation()
  
  return (
    <motion.button
      className={`
        fixed bottom-6 right-6 w-14 h-14 bg-orange-600 hover:bg-orange-700 
        text-white rounded-full shadow-lg shadow-orange-500/25 
        flex items-center justify-center text-xl z-50
        focus:outline-none focus:ring-4 focus:ring-orange-500/30
        ${className}
      `}
      whileHover={isAnimated ? { 
        scale: 1.1,
        rotate: 15,
        boxShadow: '0 10px 30px rgba(251, 191, 36, 0.4)'
      } : {}}
      whileTap={isAnimated ? { scale: 0.9 } : {}}
      animate={isAnimated ? {
        y: [0, -5, 0],
        boxShadow: [
          '0 5px 15px rgba(251, 191, 36, 0.3)',
          '0 10px 25px rgba(251, 191, 36, 0.4)',
          '0 5px 15px rgba(251, 191, 36, 0.3)'
        ]
      } : {}}
      transition={isAnimated ? {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      } : {}}
      onClick={onClick}
    >
      {children}
    </motion.button>
  )
}

export default AnimatedButton