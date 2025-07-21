import { Variants, Transition } from 'framer-motion'

/**
 * Animation utilities to handle common animation issues and provide safe defaults
 */

// Safe color values for animations
export const SAFE_COLORS = {
  transparent: 'rgba(0, 0, 0, 0)',
  white: 'rgba(255, 255, 255, 1)',
  black: 'rgba(0, 0, 0, 1)',
  primary: 'rgba(59, 130, 246, 1)',
  secondary: 'rgba(139, 92, 246, 1)',
  success: 'rgba(34, 197, 94, 1)',
  warning: 'rgba(245, 158, 11, 1)',
  danger: 'rgba(239, 68, 68, 1)',
  info: 'rgba(6, 182, 212, 1)'
} as const

/**
 * Safely converts color values for animation
 * Fixes the "transparent" to "1" animation issue
 */
export const safeColorValue = (color: string | number): string => {
  if (typeof color === 'number') {
    return `rgba(0, 0, 0, ${Math.max(0, Math.min(1, color))})`
  }
  
  if (color === 'transparent') {
    return SAFE_COLORS.transparent
  }
  
  // Handle hex colors
  if (color.startsWith('#')) {
    return color
  }
  
  // Handle rgb/rgba colors
  if (color.startsWith('rgb')) {
    return color
  }
  
  // Handle named colors by converting to safe values
  if (color in SAFE_COLORS) {
    return SAFE_COLORS[color as keyof typeof SAFE_COLORS]
  }
  
  // Default fallback
  return color
}

/**
 * Creates safe animation variants that handle common issues
 */
export const createSafeVariants = (variants: Variants): Variants => {
  const safeVariants: Variants = {}
  
  Object.keys(variants).forEach(key => {
    const variant = variants[key]
    if (typeof variant === 'object' && variant !== null) {
      const safeVariant: any = { ...variant }
      
      // Fix backgroundColor animation issues
      if ('backgroundColor' in safeVariant) {
        safeVariant.backgroundColor = safeColorValue(safeVariant.backgroundColor)
      }
      
      // Fix color animation issues
      if ('color' in safeVariant) {
        safeVariant.color = safeColorValue(safeVariant.color)
      }
      
      // Fix borderColor animation issues
      if ('borderColor' in safeVariant) {
        safeVariant.borderColor = safeColorValue(safeVariant.borderColor)
      }
      
      // Ensure opacity is within valid range
      if ('opacity' in safeVariant) {
        safeVariant.opacity = Math.max(0, Math.min(1, safeVariant.opacity))
      }
      
      // Ensure scale is positive
      if ('scale' in safeVariant) {
        safeVariant.scale = Math.max(0, safeVariant.scale)
      }
      
      safeVariants[key] = safeVariant
    } else {
      safeVariants[key] = variant
    }
  })
  
  return safeVariants
}

/**
 * Safe transition defaults that prevent common issues
 */
export const SAFE_TRANSITIONS: Record<string, Transition> = {
  default: {
    type: 'tween',
    duration: 0.3,
    ease: 'easeInOut'
  },
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    mass: 1
  },
  bounce: {
    type: 'spring',
    stiffness: 400,
    damping: 10,
    mass: 0.8
  },
  smooth: {
    type: 'tween',
    duration: 0.5,
    ease: [0.4, 0, 0.2, 1]
  },
  fast: {
    type: 'tween',
    duration: 0.15,
    ease: 'easeOut'
  },
  slow: {
    type: 'tween',
    duration: 0.8,
    ease: 'easeInOut'
  }
}

/**
 * Creates a safe transition with fallbacks
 */
export const createSafeTransition = (transition?: Transition): Transition => {
  if (!transition) {
    return SAFE_TRANSITIONS.default
  }
  
  const safeTransition: Transition = { ...transition }
  
  // Ensure duration is reasonable
  if (safeTransition.duration && safeTransition.duration > 5) {
    console.warn('Animation duration > 5s detected, capping at 5s')
    safeTransition.duration = 5
  }
  
  // Ensure spring values are reasonable
  if (safeTransition.type === 'spring') {
    if (safeTransition.stiffness && safeTransition.stiffness > 1000) {
      safeTransition.stiffness = 1000
    }
    if (safeTransition.damping && safeTransition.damping > 100) {
      safeTransition.damping = 100
    }
  }
  
  return safeTransition
}

/**
 * Common animation presets for consistent usage
 */
export const ANIMATION_PRESETS = {
  fadeIn: createSafeVariants({
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }),
  
  slideUp: createSafeVariants({
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }),
  
  slideDown: createSafeVariants({
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 }
  }),
  
  slideLeft: createSafeVariants({
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 }
  }),
  
  slideRight: createSafeVariants({
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }),
  
  scaleIn: createSafeVariants({
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  }),
  
  scaleOut: createSafeVariants({
    visible: { opacity: 1, scale: 1 },
    hidden: { opacity: 0, scale: 0.8 }
  }),
  
  flip: createSafeVariants({
    hidden: { opacity: 0, rotateX: -90 },
    visible: { opacity: 1, rotateX: 0 }
  }),
  
  bounce: createSafeVariants({
    hidden: { opacity: 0, scale: 0.3 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: SAFE_TRANSITIONS.bounce
    }
  }),
  
  hover: createSafeVariants({
    rest: { scale: 1 },
    hover: { scale: 1.05 }
  }),
  
  tap: createSafeVariants({
    rest: { scale: 1 },
    tap: { scale: 0.95 }
  })
}

/**
 * Validates animation properties to prevent common errors
 */
export const validateAnimationProps = (props: any): boolean => {
  try {
    // Check for invalid color values
    if (props.backgroundColor && typeof props.backgroundColor === 'string') {
      if (props.backgroundColor === 'transparent' || props.backgroundColor === '1') {
        console.warn('Invalid backgroundColor value detected:', props.backgroundColor)
        return false
      }
    }
    
    // Check for invalid opacity values
    if (props.opacity !== undefined) {
      const opacity = Number(props.opacity)
      if (isNaN(opacity) || opacity < 0 || opacity > 1) {
        console.warn('Invalid opacity value detected:', props.opacity)
        return false
      }
    }
    
    // Check for invalid scale values
    if (props.scale !== undefined) {
      const scale = Number(props.scale)
      if (isNaN(scale) || scale < 0) {
        console.warn('Invalid scale value detected:', props.scale)
        return false
      }
    }
    
    return true
  } catch (error) {
    console.error('Error validating animation props:', error)
    return false
  }
}

/**
 * Error handler for animation-related console warnings
 */
export const handleAnimationWarning = (message: string) => {
  // Handle framer-motion backgroundColor warnings
  if (message.includes('You are trying to animate backgroundColor from "transparent" to "1"')) {
    console.warn('🎬 Animation Fix: Use safeColorValue() to fix backgroundColor animation')
    return true
  }
  
  // Handle other common animation warnings
  if (message.includes('framer-motion') && message.includes('animate')) {
    console.warn('🎬 Animation Warning:', message)
    return true
  }
  
  return false
}

/**
 * Performance monitoring for animations
 */
export class AnimationPerformanceMonitor {
  private static instance: AnimationPerformanceMonitor
  private performanceEntries: PerformanceEntry[] = []
  private observer?: PerformanceObserver
  
  static getInstance(): AnimationPerformanceMonitor {
    if (!AnimationPerformanceMonitor.instance) {
      AnimationPerformanceMonitor.instance = new AnimationPerformanceMonitor()
    }
    return AnimationPerformanceMonitor.instance
  }
  
  start() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return
    }
    
    try {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        this.performanceEntries.push(...entries)
        
        // Check for long animation frames
        entries.forEach(entry => {
          if (entry.duration > 16.67) { // More than one frame at 60fps
            console.warn(`🎬 Performance: Long animation frame detected: ${entry.duration.toFixed(2)}ms`)
          }
        })
        
        // Keep only recent entries
        if (this.performanceEntries.length > 100) {
          this.performanceEntries = this.performanceEntries.slice(-50)
        }
      })
      
      this.observer.observe({ entryTypes: ['measure', 'navigation'] })
    } catch (error) {
      console.warn('Animation performance monitoring not available:', error)
    }
  }
  
  stop() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
  
  getReport() {
    const longFrames = this.performanceEntries.filter(entry => entry.duration > 16.67)
    const averageDuration = this.performanceEntries.reduce((sum, entry) => sum + entry.duration, 0) / this.performanceEntries.length
    
    return {
      totalEntries: this.performanceEntries.length,
      longFrames: longFrames.length,
      averageDuration: averageDuration.toFixed(2),
      worstFrame: Math.max(...this.performanceEntries.map(entry => entry.duration)).toFixed(2)
    }
  }
}

// Initialize performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  AnimationPerformanceMonitor.getInstance().start()
}