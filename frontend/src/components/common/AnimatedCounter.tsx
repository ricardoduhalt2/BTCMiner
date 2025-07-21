import React, { useEffect, useState, useRef } from 'react'
import { motion, useAnimation, useInView } from 'framer-motion'

interface AnimatedCounterProps {
  value: number | string
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
  formatValue?: (value: number) => string
  triggerAnimation?: boolean
  onAnimationComplete?: () => void
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1.5,
  decimals = 2,
  prefix = '',
  suffix = '',
  className = '',
  formatValue,
  triggerAnimation = true,
  onAnimationComplete
}) => {
  const [displayValue, setDisplayValue] = useState(0)
  const [previousValue, setPreviousValue] = useState(0)
  const [isIncreasing, setIsIncreasing] = useState(true)
  const controls = useAnimation()
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  // Custom easing function for smooth counting
  const easeOutQuart = (t: number): number => {
    return 1 - Math.pow(1 - t, 4)
  }

  useEffect(() => {
    if (!triggerAnimation || !isInView) return

    // Convert value to number if it's a string
    const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value
    
    // Safety check for invalid numbers
    if (isNaN(numericValue)) {
      setDisplayValue(0)
      return
    }

    const startValue = displayValue
    const endValue = numericValue
    const difference = endValue - startValue
    
    // Determine if value is increasing or decreasing
    setIsIncreasing(endValue >= startValue)
    setPreviousValue(startValue)

    if (Math.abs(difference) < 0.001) {
      setDisplayValue(endValue)
      return
    }

    // Animate the counter
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)
      const easedProgress = easeOutQuart(progress)
      
      const currentValue = startValue + (difference * easedProgress)
      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(endValue)
        onAnimationComplete?.()
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration, triggerAnimation, isInView, onAnimationComplete])

  // Format the display value
  const formatDisplayValue = (val: number): string => {
    // Safety check for undefined or null values
    if (val === undefined || val === null || isNaN(val)) {
      return '0'
    }
    
    if (formatValue) {
      return formatValue(val)
    }
    
    return val.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  }

  // Animation variants for the container
  const containerVariants = {
    idle: { scale: 1 },
    updating: { 
      scale: [1, 1.05, 1],
      transition: { duration: 0.3, ease: "easeOut" }
    }
  }

  // Color animation based on value change
  const getValueChangeColor = () => {
    const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value
    if (Math.abs(numericValue - previousValue) < 0.001) return ''
    
    return isIncreasing 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400'
  }

  return (
    <motion.span
      ref={ref}
      className={`inline-block font-mono transition-colors duration-300 ${getValueChangeColor()} ${className}`}
      variants={containerVariants}
      animate={triggerAnimation && Math.abs((typeof value === 'string' ? parseFloat(value) || 0 : value) - previousValue) > 0.001 ? 'updating' : 'idle'}
    >
      {prefix}
      <motion.span
        key={`${value}-${Date.now()}`}
        initial={{ opacity: 0, y: isIncreasing ? 10 : -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {formatDisplayValue(displayValue)}
      </motion.span>
      {suffix}
      
      {/* Subtle glow effect for significant changes */}
      {(() => {
        const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value
        return Math.abs(numericValue - previousValue) > (numericValue * 0.1) && (
          <motion.div
            className={`absolute inset-0 rounded-md ${
              isIncreasing 
                ? 'bg-green-400/20' 
                : 'bg-red-400/20'
            }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.6, 0], scale: [0.8, 1.2, 1] }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        )
      })()}
    </motion.span>
  )
}

export default AnimatedCounter