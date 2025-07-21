// Animation cleanup utilities for performance optimization

interface AnimationCleanupConfig {
  maxIdleTime: number // ms
  maxMemoryUsage: number // MB
  enableAutoCleanup: boolean
  cleanupInterval: number // ms
}

class AnimationCleanupManager {
  private static instance: AnimationCleanupManager
  private config: AnimationCleanupConfig
  private activeAnimations: Map<string, AnimationData> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null
  private observers: Set<MutationObserver> = new Set()
  private rafCallbacks: Set<number> = new Set()

  private constructor(config?: Partial<AnimationCleanupConfig>) {
    this.config = {
      maxIdleTime: 30000, // 30 seconds
      maxMemoryUsage: 100, // 100 MB
      enableAutoCleanup: true,
      cleanupInterval: 10000, // 10 seconds
      ...config
    }

    if (this.config.enableAutoCleanup) {
      this.startAutoCleanup()
    }

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
    
    // Listen for memory pressure events
    if ('memory' in performance) {
      this.monitorMemoryUsage()
    }
  }

  static getInstance(config?: Partial<AnimationCleanupConfig>): AnimationCleanupManager {
    if (!AnimationCleanupManager.instance) {
      AnimationCleanupManager.instance = new AnimationCleanupManager(config)
    }
    return AnimationCleanupManager.instance
  }

  // Register an animation for tracking
  registerAnimation(id: string, data: Partial<AnimationData> = {}): void {
    const animationData: AnimationData = {
      id,
      startTime: Date.now(),
      lastActivity: Date.now(),
      element: data.element || null,
      type: data.type || 'unknown',
      cleanup: data.cleanup || (() => {}),
      isActive: true,
      memoryUsage: this.estimateMemoryUsage(data)
    }

    this.activeAnimations.set(id, animationData)
  }

  // Unregister an animation
  unregisterAnimation(id: string): void {
    const animation = this.activeAnimations.get(id)
    if (animation) {
      try {
        animation.cleanup()
      } catch (error) {
        console.warn(`Error cleaning up animation ${id}:`, error)
      }
      this.activeAnimations.delete(id)
    }
  }

  // Update animation activity
  updateActivity(id: string): void {
    const animation = this.activeAnimations.get(id)
    if (animation) {
      animation.lastActivity = Date.now()
      animation.isActive = true
    }
  }

  // Mark animation as inactive
  markInactive(id: string): void {
    const animation = this.activeAnimations.get(id)
    if (animation) {
      animation.isActive = false
    }
  }

  // Clean up idle animations
  cleanupIdleAnimations(): number {
    const now = Date.now()
    let cleanedCount = 0

    for (const [id, animation] of this.activeAnimations.entries()) {
      const idleTime = now - animation.lastActivity
      
      if (idleTime > this.config.maxIdleTime || !animation.isActive) {
        // Check if element still exists in DOM
        if (animation.element && !document.contains(animation.element)) {
          this.unregisterAnimation(id)
          cleanedCount++
          continue
        }

        // Clean up long-idle animations
        if (idleTime > this.config.maxIdleTime) {
          this.unregisterAnimation(id)
          cleanedCount++
        }
      }
    }

    return cleanedCount
  }

  // Clean up animations by memory usage
  cleanupByMemoryUsage(): number {
    const animations = Array.from(this.activeAnimations.entries())
      .sort(([, a], [, b]) => b.memoryUsage - a.memoryUsage)

    let cleanedCount = 0
    let totalMemory = this.getTotalMemoryUsage()

    for (const [id, animation] of animations) {
      if (totalMemory <= this.config.maxMemoryUsage) {
        break
      }

      this.unregisterAnimation(id)
      totalMemory -= animation.memoryUsage
      cleanedCount++
    }

    return cleanedCount
  }

  // Force cleanup of all animations
  forceCleanupAll(): void {
    for (const id of this.activeAnimations.keys()) {
      this.unregisterAnimation(id)
    }
  }

  // Clean up animations for specific element
  cleanupElementAnimations(element: Element): number {
    let cleanedCount = 0

    for (const [id, animation] of this.activeAnimations.entries()) {
      if (animation.element === element) {
        this.unregisterAnimation(id)
        cleanedCount++
      }
    }

    return cleanedCount
  }

  // Get animation statistics
  getStats(): AnimationStats {
    const now = Date.now()
    const animations = Array.from(this.activeAnimations.values())

    return {
      total: animations.length,
      active: animations.filter(a => a.isActive).length,
      idle: animations.filter(a => now - a.lastActivity > 5000).length,
      memoryUsage: this.getTotalMemoryUsage(),
      oldestAnimation: Math.min(...animations.map(a => now - a.startTime)),
      averageAge: animations.reduce((sum, a) => sum + (now - a.startTime), 0) / animations.length || 0
    }
  }

  // Register RAF callback for cleanup
  registerRAF(id: number): void {
    this.rafCallbacks.add(id)
  }

  // Unregister RAF callback
  unregisterRAF(id: number): void {
    this.rafCallbacks.delete(id)
    cancelAnimationFrame(id)
  }

  // Register mutation observer for cleanup
  registerObserver(observer: MutationObserver): void {
    this.observers.add(observer)
  }

  // Unregister mutation observer
  unregisterObserver(observer: MutationObserver): void {
    this.observers.delete(observer)
    observer.disconnect()
  }

  // Private methods
  private startAutoCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const idleCleanedCount = this.cleanupIdleAnimations()
      const memoryCleanedCount = this.cleanupByMemoryUsage()
      
      if (idleCleanedCount > 0 || memoryCleanedCount > 0) {
        console.debug(`Animation cleanup: ${idleCleanedCount} idle, ${memoryCleanedCount} memory`)
      }
    }, this.config.cleanupInterval)
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      // Page is hidden, pause/cleanup non-essential animations
      for (const [id, animation] of this.activeAnimations.entries()) {
        if (animation.type !== 'critical') {
          this.markInactive(id)
        }
      }
    }
  }

  private monitorMemoryUsage(): void {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const usedMB = memory.usedJSHeapSize / 1024 / 1024

        if (usedMB > this.config.maxMemoryUsage) {
          this.cleanupByMemoryUsage()
        }
      }
    }

    setInterval(checkMemory, 5000) // Check every 5 seconds
  }

  private estimateMemoryUsage(data: Partial<AnimationData>): number {
    // Rough estimation based on animation type and complexity
    let usage = 1 // Base usage in MB

    if (data.element) {
      const rect = data.element.getBoundingClientRect()
      usage += (rect.width * rect.height) / 1000000 // Size factor
    }

    switch (data.type) {
      case 'complex':
        usage *= 3
        break
      case 'particle':
        usage *= 5
        break
      case 'video':
        usage *= 10
        break
      default:
        usage *= 1
    }

    return usage
  }

  private getTotalMemoryUsage(): number {
    return Array.from(this.activeAnimations.values())
      .reduce((total, animation) => total + animation.memoryUsage, 0)
  }

  // Cleanup on page unload
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    // Clean up all RAF callbacks
    for (const id of this.rafCallbacks) {
      cancelAnimationFrame(id)
    }

    // Clean up all observers
    for (const observer of this.observers) {
      observer.disconnect()
    }

    // Clean up all animations
    this.forceCleanupAll()

    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
  }
}

// Types
interface AnimationData {
  id: string
  startTime: number
  lastActivity: number
  element: Element | null
  type: 'simple' | 'complex' | 'particle' | 'video' | 'critical' | 'unknown'
  cleanup: () => void
  isActive: boolean
  memoryUsage: number
}

interface AnimationStats {
  total: number
  active: number
  idle: number
  memoryUsage: number
  oldestAnimation: number
  averageAge: number
}

// Singleton instance
export const animationCleanup = AnimationCleanupManager.getInstance()

// React hook for animation cleanup
export const useAnimationCleanup = () => {
  const animationIds = React.useRef<string[]>([])

  const registerAnimation = React.useCallback((
    id: string, 
    element?: Element, 
    type?: AnimationData['type'],
    cleanup?: () => void
  ) => {
    animationCleanup.registerAnimation(id, { element, type, cleanup })
    animationIds.current.push(id)
    return id
  }, [])

  const unregisterAnimation = React.useCallback((id: string) => {
    animationCleanup.unregisterAnimation(id)
    animationIds.current = animationIds.current.filter(animId => animId !== id)
  }, [])

  const updateActivity = React.useCallback((id: string) => {
    animationCleanup.updateActivity(id)
  }, [])

  // Cleanup all registered animations on unmount
  React.useEffect(() => {
    return () => {
      animationIds.current.forEach(id => {
        animationCleanup.unregisterAnimation(id)
      })
    }
  }, [])

  return {
    registerAnimation,
    unregisterAnimation,
    updateActivity,
    getStats: () => animationCleanup.getStats()
  }
}

// Utility functions
export const cleanupElementAnimations = (element: Element): number => {
  return animationCleanup.cleanupElementAnimations(element)
}

export const getAnimationStats = (): AnimationStats => {
  return animationCleanup.getStats()
}

export const forceCleanupAll = (): void => {
  animationCleanup.forceCleanupAll()
}

// Initialize cleanup on page load
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    animationCleanup.destroy()
  })
}

// Add React import for the hook
import React from 'react'