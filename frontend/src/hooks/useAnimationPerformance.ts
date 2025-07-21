import { useEffect, useState, useCallback, useRef } from 'react'
import { useSystemPreferences } from './useSystemPreferences'

interface PerformanceMetrics {
  frameRate: number
  averageFrameTime: number
  droppedFrames: number
  memoryUsage: number
  animationCount: number
  lastMeasurement: number
}

interface PerformanceThresholds {
  minFrameRate: number
  maxFrameTime: number
  maxMemoryUsage: number
  maxAnimationCount: number
}

interface AnimationPerformanceConfig {
  enableMonitoring: boolean
  sampleInterval: number
  thresholds: PerformanceThresholds
  autoOptimize: boolean
}

const DEFAULT_CONFIG: AnimationPerformanceConfig = {
  enableMonitoring: true,
  sampleInterval: 1000, // 1 second
  thresholds: {
    minFrameRate: 30,
    maxFrameTime: 33.33, // ~30fps
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB
    maxAnimationCount: 10
  },
  autoOptimize: true
}

export const useAnimationPerformance = (config: Partial<AnimationPerformanceConfig> = {}) => {
  const { prefersReducedMotion } = useSystemPreferences()
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    frameRate: 60,
    averageFrameTime: 16.67,
    droppedFrames: 0,
    memoryUsage: 0,
    animationCount: 0,
    lastMeasurement: Date.now()
  })
  
  const [isOptimized, setIsOptimized] = useState(false)
  const [warnings, setWarnings] = useState<string[]>([])
  
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const frameTimesRef = useRef<number[]>([])
  const lastFrameTimeRef = useRef(performance.now())
  const animationFrameRef = useRef<number>()
  const intervalRef = useRef<NodeJS.Timeout>()
  const observerRef = useRef<PerformanceObserver | null>(null)

  // Measure frame rate and performance
  const measurePerformance = useCallback(() => {
    const now = performance.now()
    const frameTime = now - lastFrameTimeRef.current
    lastFrameTimeRef.current = now

    // Collect frame times for averaging
    frameTimesRef.current.push(frameTime)
    if (frameTimesRef.current.length > 60) { // Keep last 60 frames
      frameTimesRef.current.shift()
    }

    // Calculate metrics
    const averageFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length
    const frameRate = 1000 / averageFrameTime
    const droppedFrames = frameTimesRef.current.filter(ft => ft > 33.33).length

    // Get memory usage if available
    let memoryUsage = 0
    if ('memory' in performance) {
      const memInfo = (performance as any).memory
      memoryUsage = memInfo.usedJSHeapSize
    }

    // Count active animations (simplified)
    const animationCount = document.querySelectorAll('[data-framer-motion]').length

    setMetrics({
      frameRate: Math.round(frameRate),
      averageFrameTime: Math.round(averageFrameTime * 100) / 100,
      droppedFrames,
      memoryUsage,
      animationCount,
      lastMeasurement: Date.now()
    })

    // Check for performance issues
    checkPerformanceThresholds(frameRate, averageFrameTime, memoryUsage, animationCount)

    if (finalConfig.enableMonitoring) {
      animationFrameRef.current = requestAnimationFrame(measurePerformance)
    }
  }, [finalConfig.enableMonitoring])

  // Check performance thresholds and trigger warnings
  const checkPerformanceThresholds = useCallback((
    frameRate: number,
    frameTime: number,
    memoryUsage: number,
    animationCount: number
  ) => {
    const newWarnings: string[] = []

    if (frameRate < finalConfig.thresholds.minFrameRate) {
      newWarnings.push(`Low frame rate detected: ${frameRate}fps (minimum: ${finalConfig.thresholds.minFrameRate}fps)`)
    }

    if (frameTime > finalConfig.thresholds.maxFrameTime) {
      newWarnings.push(`High frame time detected: ${frameTime}ms (maximum: ${finalConfig.thresholds.maxFrameTime}ms)`)
    }

    if (memoryUsage > finalConfig.thresholds.maxMemoryUsage) {
      newWarnings.push(`High memory usage: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB (maximum: ${(finalConfig.thresholds.maxMemoryUsage / 1024 / 1024).toFixed(2)}MB)`)
    }

    if (animationCount > finalConfig.thresholds.maxAnimationCount) {
      newWarnings.push(`Too many concurrent animations: ${animationCount} (maximum: ${finalConfig.thresholds.maxAnimationCount})`)
    }

    setWarnings(newWarnings)

    // Auto-optimize if enabled and performance is poor
    if (finalConfig.autoOptimize && newWarnings.length > 0 && !isOptimized) {
      optimizePerformance()
    }
  }, [finalConfig.thresholds, finalConfig.autoOptimize, isOptimized])

  // Optimize performance by reducing animation complexity
  const optimizePerformance = useCallback(() => {
    setIsOptimized(true)

    // Add performance optimization class to body
    document.body.classList.add('animation-performance-mode')

    // Reduce animation complexity via CSS
    const style = document.createElement('style')
    style.id = 'animation-performance-optimization'
    style.textContent = `
      .animation-performance-mode * {
        animation-duration: 0.1s !important;
        transition-duration: 0.1s !important;
      }
      .animation-performance-mode [data-framer-motion] {
        will-change: auto !important;
      }
    `
    document.head.appendChild(style)

    console.warn('Animation performance optimization enabled due to poor performance')
  }, [])

  // Restore normal performance
  const restorePerformance = useCallback(() => {
    setIsOptimized(false)
    document.body.classList.remove('animation-performance-mode')
    
    const optimizationStyle = document.getElementById('animation-performance-optimization')
    if (optimizationStyle) {
      document.head.removeChild(optimizationStyle)
    }

    console.info('Animation performance optimization disabled')
  }, [])

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (!finalConfig.enableMonitoring || prefersReducedMotion) return

    // Start frame rate monitoring
    animationFrameRef.current = requestAnimationFrame(measurePerformance)

    // Set up performance observer for detailed metrics
    if ('PerformanceObserver' in window) {
      observerRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'measure' && entry.name.includes('animation')) {
            if (entry.duration > finalConfig.thresholds.maxFrameTime) {
              console.warn(`Slow animation detected: ${entry.name} took ${entry.duration}ms`)
            }
          }
        })
      })

      try {
        observerRef.current.observe({ entryTypes: ['measure', 'navigation', 'paint'] })
      } catch (error) {
        console.warn('Performance observer not fully supported:', error)
      }
    }

    // Set up periodic reporting
    intervalRef.current = setInterval(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Animation Performance Metrics:', metrics)
      }
    }, finalConfig.sampleInterval)
  }, [finalConfig.enableMonitoring, finalConfig.sampleInterval, finalConfig.thresholds.maxFrameTime, prefersReducedMotion, measurePerformance, metrics])

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    if (observerRef.current) {
      observerRef.current.disconnect()
    }
  }, [])

  // Get performance recommendations
  const getRecommendations = useCallback(() => {
    const recommendations: string[] = []

    if (metrics.frameRate < 30) {
      recommendations.push('Consider reducing animation complexity or duration')
      recommendations.push('Use transform and opacity properties for better performance')
      recommendations.push('Avoid animating layout properties (width, height, margin, padding)')
    }

    if (metrics.animationCount > 5) {
      recommendations.push('Reduce the number of concurrent animations')
      recommendations.push('Use animation batching to group similar animations')
    }

    if (metrics.memoryUsage > 30 * 1024 * 1024) {
      recommendations.push('Monitor for memory leaks in animation cleanup')
      recommendations.push('Use will-change property sparingly')
    }

    if (prefersReducedMotion) {
      recommendations.push('User prefers reduced motion - consider disabling animations')
    }

    return recommendations
  }, [metrics, prefersReducedMotion])

  // Get performance score (0-100)
  const getPerformanceScore = useCallback(() => {
    let score = 100

    // Frame rate score (0-40 points)
    const frameRateScore = Math.min(40, (metrics.frameRate / 60) * 40)
    score = frameRateScore

    // Memory usage score (0-30 points)
    const memoryScore = Math.max(0, 30 - (metrics.memoryUsage / (50 * 1024 * 1024)) * 30)
    score += memoryScore

    // Animation count score (0-20 points)
    const animationScore = Math.max(0, 20 - (metrics.animationCount / 10) * 20)
    score += animationScore

    // Dropped frames penalty (0-10 points)
    const droppedFramesScore = Math.max(0, 10 - metrics.droppedFrames)
    score += droppedFramesScore

    return Math.round(Math.max(0, Math.min(100, score)))
  }, [metrics])

  // Initialize monitoring on mount
  useEffect(() => {
    startMonitoring()
    return stopMonitoring
  }, [startMonitoring, stopMonitoring])

  return {
    metrics,
    warnings,
    isOptimized,
    optimizePerformance,
    restorePerformance,
    startMonitoring,
    stopMonitoring,
    getRecommendations,
    getPerformanceScore,
    config: finalConfig
  }
}

export default useAnimationPerformance