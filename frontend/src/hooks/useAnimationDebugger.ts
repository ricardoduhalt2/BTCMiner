import { useState, useCallback, useEffect } from 'react'
import AnimationErrorHandler from '@utils/animationErrorHandler'
import { AnimationPerformanceMonitor } from '@utils/animationUtils'

interface UseAnimationDebuggerReturn {
  isDebuggerOpen: boolean
  openDebugger: () => void
  closeDebugger: () => void
  toggleDebugger: () => void
  errorCount: number
  performanceStatus: 'good' | 'fair' | 'poor'
  hasRecentErrors: boolean
}

export const useAnimationDebugger = (): UseAnimationDebuggerReturn => {
  const [isDebuggerOpen, setIsDebuggerOpen] = useState(false)
  const [errorCount, setErrorCount] = useState(0)
  const [performanceStatus, setPerformanceStatus] = useState<'good' | 'fair' | 'poor'>('good')
  const [hasRecentErrors, setHasRecentErrors] = useState(false)

  const errorHandler = AnimationErrorHandler.getInstance()
  const performanceMonitor = AnimationPerformanceMonitor.getInstance()

  // Update stats periodically
  useEffect(() => {
    const updateStats = () => {
      // Update error count
      const recentErrors = errorHandler.getRecentErrors(5) // Last 5 minutes
      setErrorCount(recentErrors.length)
      setHasRecentErrors(recentErrors.length > 0)

      // Update performance status
      const report = performanceMonitor.getReport()
      const avgDuration = parseFloat(report.averageDuration || '0')
      const worstFrame = parseFloat(report.worstFrame || '0')

      if (avgDuration > 20 || worstFrame > 50) {
        setPerformanceStatus('poor')
      } else if (avgDuration > 10 || worstFrame > 25) {
        setPerformanceStatus('fair')
      } else {
        setPerformanceStatus('good')
      }
    }

    updateStats() // Initial update
    const interval = setInterval(updateStats, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [errorHandler, performanceMonitor])

  const openDebugger = useCallback(() => {
    setIsDebuggerOpen(true)
  }, [])

  const closeDebugger = useCallback(() => {
    setIsDebuggerOpen(false)
  }, [])

  const toggleDebugger = useCallback(() => {
    setIsDebuggerOpen(prev => !prev)
  }, [])

  // Keyboard shortcut to open debugger (Ctrl/Cmd + Shift + A)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'A') {
        event.preventDefault()
        toggleDebugger()
      }
    }

    if (process.env.NODE_ENV === 'development') {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [toggleDebugger])

  return {
    isDebuggerOpen,
    openDebugger,
    closeDebugger,
    toggleDebugger,
    errorCount,
    performanceStatus,
    hasRecentErrors
  }
}

// Global function to open debugger from console
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  ;(window as any).openAnimationDebugger = () => {
    // Dispatch a custom event that components can listen to
    window.dispatchEvent(new CustomEvent('openAnimationDebugger'))
  }
}