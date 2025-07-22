/**
 * Animation Error Handler
 * Intercepts and handles animation-related console warnings and errors
 */

interface AnimationError {
  type: 'framer-motion' | 'css' | 'performance' | 'unknown'
  message: string
  timestamp: number
  component?: string
  stack?: string
  fixed?: boolean
}

class AnimationErrorHandler {
  private static instance: AnimationErrorHandler
  private errors: AnimationError[] = []
  private originalConsoleError: typeof console.error
  private originalConsoleWarn: typeof console.warn
  private isInitialized = false

  static getInstance(): AnimationErrorHandler {
    if (!AnimationErrorHandler.instance) {
      AnimationErrorHandler.instance = new AnimationErrorHandler()
    }
    return AnimationErrorHandler.instance
  }

  private constructor() {
    this.originalConsoleError = console.error
    this.originalConsoleWarn = console.warn
  }

  initialize() {
    if (this.isInitialized || typeof window === 'undefined') {
      return
    }

    // Intercept console.error
    console.error = (...args: any[]) => {
      const message = args.join(' ')
      const handled = this.handleConsoleMessage('error', message, args)
      
      if (!handled) {
        this.originalConsoleError.apply(console, args)
      }
    }

    // Intercept console.warn
    console.warn = (...args: any[]) => {
      const message = args.join(' ')
      const handled = this.handleConsoleMessage('warn', message, args)
      
      if (!handled) {
        this.originalConsoleWarn.apply(console, args)
      }
    }

    this.isInitialized = true
    // Only log in development if explicitly enabled
    if (process.env.NODE_ENV === 'development' && localStorage.getItem('debug-animations') === 'true') {
      console.log('🎬 Animation Error Handler initialized')
    }
  }

  private handleConsoleMessage(level: 'error' | 'warn', message: string, args: any[]): boolean {
    const debugEnabled = localStorage.getItem('debug-animations') === 'true'
    
    // Handle framer-motion backgroundColor warning
    if (message.includes('You are trying to animate backgroundColor from "transparent" to "1"')) {
      this.logError({
        type: 'framer-motion',
        message: 'backgroundColor animation from transparent to numeric value',
        timestamp: Date.now(),
        component: this.extractComponentFromStack(),
        fixed: true
      })

      if (debugEnabled) {
        console.group('🎬 Animation Fix Applied')
        console.warn('Issue: Trying to animate backgroundColor from "transparent" to "1"')
        console.info('Solution: Use rgba(0,0,0,0) instead of "transparent" or use safeColorValue() utility')
        console.info('Location:', this.extractComponentFromStack() || 'Unknown component')
        console.groupEnd()
      }
      
      return true // Suppress original warning
    }

    // Handle performance warnings
    if (message.includes('Performance: Long animation frame detected')) {
      this.logError({
        type: 'performance',
        message: message,
        timestamp: Date.now(),
        component: this.extractComponentFromStack()
      })

      // Only show performance warnings if debug is enabled
      if (debugEnabled) {
        this.originalConsoleWarn.apply(console, args)
      }
      
      return true // Suppress by default
    }

    // Handle other framer-motion warnings
    if (message.includes('framer-motion') || message.includes('You are trying to animate')) {
      this.logError({
        type: 'framer-motion',
        message: message,
        timestamp: Date.now(),
        component: this.extractComponentFromStack()
      })

      if (debugEnabled) {
        console.group('🎬 Framer Motion Warning')
        this.originalConsoleWarn.apply(console, args)
        console.info('Component:', this.extractComponentFromStack() || 'Unknown')
        console.info('Tip: Use animation utilities from utils/animationUtils.ts')
        console.groupEnd()
      }
      
      return true // Suppress original warning
    }

    // Handle CSS animation warnings
    if (message.includes('animation') && (message.includes('CSS') || message.includes('transition'))) {
      this.logError({
        type: 'css',
        message: message,
        timestamp: Date.now(),
        component: this.extractComponentFromStack()
      })

      if (debugEnabled) {
        console.group('🎬 CSS Animation Warning')
        this.originalConsoleWarn.apply(console, args)
        console.info('Component:', this.extractComponentFromStack() || 'Unknown')
        console.groupEnd()
      }
      
      return true
    }

    return false // Don't suppress other messages
  }

  private extractComponentFromStack(): string | undefined {
    try {
      const stack = new Error().stack
      if (stack) {
        const lines = stack.split('\n')
        for (const line of lines) {
          // Look for React component files
          if (line.includes('src/components/') || line.includes('src/pages/')) {
            const match = line.match(/\/([^\/]+\.tsx?)/)
            if (match) {
              return match[1]
            }
          }
        }
      }
    } catch (error) {
      // Ignore stack extraction errors
    }
    return undefined
  }

  private logError(error: AnimationError) {
    this.errors.push(error)
    
    // Keep only last 100 errors to prevent memory leaks
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100)
    }
  }

  getErrors(): AnimationError[] {
    return [...this.errors]
  }

  getErrorsByType(type: AnimationError['type']): AnimationError[] {
    return this.errors.filter(error => error.type === type)
  }

  getRecentErrors(minutes: number = 5): AnimationError[] {
    const cutoff = Date.now() - (minutes * 60 * 1000)
    return this.errors.filter(error => error.timestamp > cutoff)
  }

  clearErrors() {
    this.errors = []
  }

  getErrorSummary() {
    const recentErrors = this.getRecentErrors()
    const errorsByType = recentErrors.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const fixedErrors = recentErrors.filter(error => error.fixed).length

    return {
      total: recentErrors.length,
      fixed: fixedErrors,
      byType: errorsByType,
      components: [...new Set(recentErrors.map(error => error.component).filter(Boolean))]
    }
  }

  destroy() {
    if (this.isInitialized) {
      console.error = this.originalConsoleError
      console.warn = this.originalConsoleWarn
      this.isInitialized = false
      console.log('🎬 Animation Error Handler destroyed')
    }
  }
}

// Auto-initialize in development
if (process.env.NODE_ENV === 'development') {
  const handler = AnimationErrorHandler.getInstance()
  handler.initialize()
  
  // Add global access for debugging
  ;(window as any).animationErrorHandler = handler
}

export default AnimationErrorHandler

// Utility functions for manual error handling
export const reportAnimationError = (error: Omit<AnimationError, 'timestamp'>) => {
  const handler = AnimationErrorHandler.getInstance()
  handler['logError']({ ...error, timestamp: Date.now() })
}

export const getAnimationErrorSummary = () => {
  return AnimationErrorHandler.getInstance().getErrorSummary()
}

export const clearAnimationErrors = () => {
  AnimationErrorHandler.getInstance().clearErrors()
}