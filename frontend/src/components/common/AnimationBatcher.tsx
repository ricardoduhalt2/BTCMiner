import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { useSystemPreferences } from '@hooks/useSystemPreferences'

interface AnimationBatcherContextType {
  batchAnimation: (callback: () => void, priority?: 'high' | 'normal' | 'low') => void
  cancelAnimation: (id: string) => void
  isAnimating: boolean
  performanceMode: 'high' | 'balanced' | 'performance'
  setPerformanceMode: (mode: 'high' | 'balanced' | 'performance') => void
}

const AnimationBatcherContext = createContext<AnimationBatcherContextType | undefined>(undefined)

export const useAnimationBatcher = () => {
  const context = useContext(AnimationBatcherContext)
  if (context === undefined) {
    throw new Error('useAnimationBatcher must be used within an AnimationBatcherProvider')
  }
  return context
}

interface AnimationBatcherProps {
  children: React.ReactNode
}

interface QueuedAnimation {
  id: string
  callback: () => void
  priority: 'high' | 'normal' | 'low'
  timestamp: number
}

export const AnimationBatcher: React.FC<AnimationBatcherProps> = ({ children }) => {
  const { prefersReducedMotion } = useSystemPreferences()
  const [isAnimating, setIsAnimating] = useState(false)
  const [performanceMode, setPerformanceMode] = useState<'high' | 'balanced' | 'performance'>('balanced')
  
  const animationQueue = useRef<QueuedAnimation[]>([])
  const frameId = useRef<number | null>(null)
  const lastFrameTime = useRef<number>(0)
  const animationIdCounter = useRef<number>(0)

  // Performance monitoring
  const frameCount = useRef<number>(0)
  const fpsHistory = useRef<number[]>([])
  const performanceThreshold = useRef<number>(30) // Target FPS

  // Calculate target frame rate based on performance mode
  const getTargetFrameRate = useCallback(() => {
    if (prefersReducedMotion) return 0
    
    switch (performanceMode) {
      case 'high':
        return 60
      case 'balanced':
        return 30
      case 'performance':
        return 15
      default:
        return 30
    }
  }, [performanceMode, prefersReducedMotion])

  // Monitor performance and adjust settings
  const monitorPerformance = useCallback(() => {
    const now = performance.now()
    const deltaTime = now - lastFrameTime.current
    const fps = 1000 / deltaTime
    
    fpsHistory.current.push(fps)
    if (fpsHistory.current.length > 60) {
      fpsHistory.current.shift()
    }
    
    // Calculate average FPS over last 60 frames
    const avgFps = fpsHistory.current.reduce((sum, fps) => sum + fps, 0) / fpsHistory.current.length
    
    // Auto-adjust performance mode based on FPS
    if (avgFps < performanceThreshold.current && performanceMode === 'high') {
      setPerformanceMode('balanced')
    } else if (avgFps < performanceThreshold.current / 2 && performanceMode === 'balanced') {
      setPerformanceMode('performance')
    } else if (avgFps > performanceThreshold.current * 1.5 && performanceMode === 'performance') {
      setPerformanceMode('balanced')
    } else if (avgFps > performanceThreshold.current * 2 && performanceMode === 'balanced') {
      setPerformanceMode('high')
    }
    
    lastFrameTime.current = now
  }, [performanceMode])

  // Process animation queue
  const processAnimationQueue = useCallback(() => {
    if (animationQueue.current.length === 0) {
      setIsAnimating(false)
      return
    }

    setIsAnimating(true)
    monitorPerformance()

    const targetFrameRate = getTargetFrameRate()
    const frameInterval = targetFrameRate > 0 ? 1000 / targetFrameRate : 0

    // Sort by priority and timestamp
    animationQueue.current.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      return a.timestamp - b.timestamp
    })

    // Process animations based on performance mode
    const maxAnimationsPerFrame = performanceMode === 'high' ? 10 : performanceMode === 'balanced' ? 5 : 2
    const animationsToProcess = animationQueue.current.splice(0, maxAnimationsPerFrame)

    // Execute animations
    animationsToProcess.forEach(animation => {
      try {
        animation.callback()
      } catch (error) {
        console.warn('Animation error:', error)
      }
    })

    // Schedule next frame
    if (frameInterval > 0) {
      frameId.current = requestAnimationFrame(() => {
        setTimeout(processAnimationQueue, frameInterval)
      })
    } else {
      frameId.current = requestAnimationFrame(processAnimationQueue)
    }
  }, [getTargetFrameRate, monitorPerformance, performanceMode])

  // Batch animation function
  const batchAnimation = useCallback((callback: () => void, priority: 'high' | 'normal' | 'low' = 'normal') => {
    if (prefersReducedMotion) {
      // Execute immediately if reduced motion is preferred
      callback()
      return
    }

    const id = `anim_${animationIdCounter.current++}`
    const animation: QueuedAnimation = {
      id,
      callback,
      priority,
      timestamp: performance.now()
    }

    animationQueue.current.push(animation)

    // Start processing if not already running
    if (!frameId.current) {
      processAnimationQueue()
    }

    return id
  }, [prefersReducedMotion, processAnimationQueue])

  // Cancel animation function
  const cancelAnimation = useCallback((id: string) => {
    animationQueue.current = animationQueue.current.filter(anim => anim.id !== id)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current)
      }
      animationQueue.current = []
    }
  }, [])

  // Auto-pause animations when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (frameId.current) {
          cancelAnimationFrame(frameId.current)
          frameId.current = null
        }
      } else if (animationQueue.current.length > 0) {
        processAnimationQueue()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [processAnimationQueue])

  // Memory cleanup for performance history
  useEffect(() => {
    const cleanup = setInterval(() => {
      if (fpsHistory.current.length > 120) {
        fpsHistory.current = fpsHistory.current.slice(-60)
      }
    }, 5000)

    return () => clearInterval(cleanup)
  }, [])

  const value: AnimationBatcherContextType = {
    batchAnimation,
    cancelAnimation,
    isAnimating,
    performanceMode,
    setPerformanceMode,
  }

  return (
    <AnimationBatcherContext.Provider value={value}>
      {children}
    </AnimationBatcherContext.Provider>
  )
}

// Hook for automatic animation cleanup
export const useAnimationCleanup = () => {
  const { cancelAnimation } = useAnimationBatcher()
  const animationIds = useRef<string[]>([])

  const addAnimation = useCallback((id: string) => {
    animationIds.current.push(id)
  }, [])

  const cleanup = useCallback(() => {
    animationIds.current.forEach(id => cancelAnimation(id))
    animationIds.current = []
  }, [cancelAnimation])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  return { addAnimation, cleanup }
}

// Performance monitoring hook
export const useAnimationPerformance = () => {
  const { performanceMode, setPerformanceMode, isAnimating } = useAnimationBatcher()
  const [metrics, setMetrics] = useState({
    fps: 0,
    frameTime: 0,
    queueLength: 0
  })

  useEffect(() => {
    let lastTime = performance.now()
    let frameCount = 0

    const updateMetrics = () => {
      const now = performance.now()
      const deltaTime = now - lastTime
      frameCount++

      if (deltaTime >= 1000) {
        const fps = (frameCount * 1000) / deltaTime
        setMetrics(prev => ({
          ...prev,
          fps: Math.round(fps),
          frameTime: Math.round(deltaTime / frameCount)
        }))
        
        frameCount = 0
        lastTime = now
      }

      if (isAnimating) {
        requestAnimationFrame(updateMetrics)
      }
    }

    if (isAnimating) {
      updateMetrics()
    }
  }, [isAnimating])

  return {
    metrics,
    performanceMode,
    setPerformanceMode,
    isAnimating
  }
}