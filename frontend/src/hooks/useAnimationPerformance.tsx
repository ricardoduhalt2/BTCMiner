import { useEffect, useRef, useState, useCallback } from 'react'
import { useSystemPreferences } from './useSystemPreferences'

interface PerformanceMetrics {
  fps: number
  frameTime: number
  memoryUsage: number
  animationCount: number
  droppedFrames: number
}

interface PerformanceConfig {
  targetFPS: number
  maxAnimations: number
  enableProfiling: boolean
  autoOptimize: boolean
}

export const useAnimationPerformance = (config?: Partial<PerformanceConfig>) => {
  const { prefersReducedMotion } = useSystemPreferences()
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    animationCount: 0,
    droppedFrames: 0
  })

  const [performanceLevel, setPerformanceLevel] = useState<'high' | 'medium' | 'low'>('high')
  const [isOptimizing, setIsOptimizing] = useState(false)

  const defaultConfig: PerformanceConfig = {
    targetFPS: 60,
    maxAnimations: 10,
    enableProfiling: true,
    autoOptimize: true,
    ...config
  }

  // Performance monitoring refs
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const fpsHistory = useRef<number[]>([])
  const animationRegistry = useRef<Set<string>>(new Set())
  const performanceObserver = useRef<PerformanceObserver | null>(null)

  // Register animation
  const registerAnimation = useCallback((id: string) => {
    animationRegistry.current.add(id)
    setMetrics(prev => ({
      ...prev,
      animationCount: animationRegistry.current.size
    }))
  }, [])

  // Unregister animation
  const unregisterAnimation = useCallback((id: string) => {
    animationRegistry.current.delete(id)
    setMetrics(prev => ({
      ...prev,
      animationCount: animationRegistry.current.size
    }))
  }, [])

  // Calculate performance metrics
  const updateMetrics = useCallback(() => {
    const now = performance.now()
    const deltaTime = now - lastTime.current
    frameCount.current++

    if (deltaTime >= 1000) {
      const fps = (frameCount.current * 1000) / deltaTime
      fpsHistory.current.push(fps)
      
      // Keep only last 60 FPS measurements
      if (fpsHistory.current.length > 60) {
        fpsHistory.current.shift()
      }

      const avgFPS = fpsHistory.current.reduce((sum, fps) => sum + fps, 0) / fpsHistory.current.length
      const frameTime = deltaTime / frameCount.current

      // Calculate memory usage if available
      let memoryUsage = 0
      if ('memory' in performance) {
        const memory = (performance as any).memory
        memoryUsage = memory.usedJSHeapSize / 1024 / 1024 // MB
      }

      setMetrics(prev => ({
        ...prev,
        fps: Math.round(avgFPS),
        frameTime: Math.round(frameTime),
        memoryUsage: Math.round(memoryUsage)
      }))

      // Auto-optimize performance if enabled
      if (defaultConfig.autoOptimize) {
        optimizePerformance(avgFPS)
      }

      frameCount.current = 0
      lastTime.current = now
    }

    requestAnimationFrame(updateMetrics)
  }, [defaultConfig.autoOptimize])

  // Performance optimization logic
  const optimizePerformance = useCallback((currentFPS: number) => {
    const targetFPS = defaultConfig.targetFPS
    const animationCount = animationRegistry.current.size

    if (currentFPS < targetFPS * 0.7) {
      // Performance is poor
      if (performanceLevel !== 'low') {
        setPerformanceLevel('low')
        setIsOptimizing(true)
        
        // Reduce animation complexity
        document.documentElement.style.setProperty('--animation-duration-multiplier', '0.5')
        document.documentElement.style.setProperty('--animation-complexity', 'low')
        
        setTimeout(() => setIsOptimizing(false), 1000)
      }
    } else if (currentFPS < targetFPS * 0.85) {
      // Performance is moderate
      if (performanceLevel !== 'medium') {
        setPerformanceLevel('medium')
        setIsOptimizing(true)
        
        document.documentElement.style.setProperty('--animation-duration-multiplier', '0.75')
        document.documentElement.style.setProperty('--animation-complexity', 'medium')
        
        setTimeout(() => setIsOptimizing(false), 1000)
      }
    } else if (currentFPS >= targetFPS * 0.95 && performanceLevel !== 'high') {
      // Performance is good
      setPerformanceLevel('high')
      
      document.documentElement.style.setProperty('--animation-duration-multiplier', '1')
      document.documentElement.style.setProperty('--animation-complexity', 'high')
    }
  }, [performanceLevel, defaultConfig.targetFPS])

  // Monitor long tasks
  useEffect(() => {
    if (!defaultConfig.enableProfiling || !('PerformanceObserver' in window)) {
      return
    }

    try {
      performanceObserver.current = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        let droppedFrames = 0
        
        entries.forEach((entry) => {
          if (entry.entryType === 'longtask' && entry.duration > 16.67) {
            // Frame took longer than 16.67ms (60fps threshold)
            droppedFrames++
          }
        })

        if (droppedFrames > 0) {
          setMetrics(prev => ({
            ...prev,
            droppedFrames: prev.droppedFrames + droppedFrames
          }))
        }
      })

      performanceObserver.current.observe({ entryTypes: ['longtask'] })
    } catch (error) {
      console.warn('Performance monitoring not available:', error)
    }

    return () => {
      if (performanceObserver.current) {
        performanceObserver.current.disconnect()
      }
    }
  }, [defaultConfig.enableProfiling])

  // Start performance monitoring
  useEffect(() => {
    if (prefersReducedMotion) {
      return
    }

    const animationFrame = requestAnimationFrame(updateMetrics)
    
    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [updateMetrics, prefersReducedMotion])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      animationRegistry.current.clear()
      if (performanceObserver.current) {
        performanceObserver.current.disconnect()
      }
    }
  }, [])

  // Performance recommendations
  const getRecommendations = useCallback(() => {
    const recommendations: string[] = []

    if (metrics.fps < defaultConfig.targetFPS * 0.7) {
      recommendations.push('Consider reducing animation complexity')
      recommendations.push('Limit concurrent animations')
    }

    if (metrics.animationCount > defaultConfig.maxAnimations) {
      recommendations.push(`Too many animations (${metrics.animationCount}/${defaultConfig.maxAnimations})`)
    }

    if (metrics.memoryUsage > 100) {
      recommendations.push('High memory usage detected')
    }

    if (metrics.droppedFrames > 10) {
      recommendations.push('Frequent frame drops detected')
    }

    return recommendations
  }, [metrics, defaultConfig])

  // Force optimization
  const forceOptimization = useCallback(() => {
    setIsOptimizing(true)
    optimizePerformance(metrics.fps)
    setTimeout(() => setIsOptimizing(false), 1000)
  }, [metrics.fps, optimizePerformance])

  // Reset performance metrics
  const resetMetrics = useCallback(() => {
    setMetrics({
      fps: 0,
      frameTime: 0,
      memoryUsage: 0,
      animationCount: animationRegistry.current.size,
      droppedFrames: 0
    })
    fpsHistory.current = []
  }, [])

  return {
    metrics,
    performanceLevel,
    isOptimizing,
    registerAnimation,
    unregisterAnimation,
    getRecommendations,
    forceOptimization,
    resetMetrics,
    config: defaultConfig
  }
}