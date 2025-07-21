import { useEffect, useState, useCallback, useRef } from 'react'
import { useSystemPreferences } from './useSystemPreferences'

interface AccessibilityConfig {
  respectReducedMotion: boolean
  enableHighContrast: boolean
  enableFocusManagement: boolean
  enableScreenReaderSupport: boolean
  enableKeyboardNavigation: boolean
}

interface AccessibilityState {
  reducedMotion: boolean
  highContrast: boolean
  screenReaderActive: boolean
  keyboardNavigation: boolean
  focusVisible: boolean
}

export const useAnimationAccessibility = (config?: Partial<AccessibilityConfig>) => {
  const { prefersReducedMotion, prefersHighContrast } = useSystemPreferences()
  const [accessibilityState, setAccessibilityState] = useState<AccessibilityState>({
    reducedMotion: prefersReducedMotion,
    highContrast: prefersHighContrast,
    screenReaderActive: false,
    keyboardNavigation: false,
    focusVisible: false
  })

  const defaultConfig: AccessibilityConfig = {
    respectReducedMotion: true,
    enableHighContrast: true,
    enableFocusManagement: true,
    enableScreenReaderSupport: true,
    enableKeyboardNavigation: true,
    ...config
  }

  const focusedElement = useRef<Element | null>(null)
  const keyboardNavigationTimeout = useRef<NodeJS.Timeout | null>(null)

  // Detect screen reader usage
  const detectScreenReader = useCallback(() => {
    // Check for common screen reader indicators
    const hasAriaLive = document.querySelector('[aria-live]') !== null
    const hasAriaLabel = document.querySelector('[aria-label]') !== null
    const hasRole = document.querySelector('[role]') !== null
    const hasTabIndex = document.querySelector('[tabindex]') !== null

    // Check for screen reader specific APIs
    const hasAccessibilityAPI = 'speechSynthesis' in window || 'webkitSpeechSynthesis' in window

    // Heuristic: if page has accessibility attributes, likely using screen reader
    const screenReaderLikely = hasAriaLive || hasAriaLabel || hasRole || hasTabIndex || hasAccessibilityAPI

    setAccessibilityState(prev => ({
      ...prev,
      screenReaderActive: screenReaderLikely
    }))
  }, [])

  // Handle keyboard navigation detection
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!defaultConfig.enableKeyboardNavigation) return

    // Detect keyboard navigation
    if (event.key === 'Tab' || event.key === 'ArrowUp' || event.key === 'ArrowDown' || 
        event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
      
      setAccessibilityState(prev => ({
        ...prev,
        keyboardNavigation: true,
        focusVisible: true
      }))

      // Clear keyboard navigation flag after inactivity
      if (keyboardNavigationTimeout.current) {
        clearTimeout(keyboardNavigationTimeout.current)
      }
      
      keyboardNavigationTimeout.current = setTimeout(() => {
        setAccessibilityState(prev => ({
          ...prev,
          keyboardNavigation: false,
          focusVisible: false
        }))
      }, 3000)
    }
  }, [defaultConfig.enableKeyboardNavigation])

  // Handle mouse interaction (disable keyboard navigation indicators)
  const handleMouseDown = useCallback(() => {
    setAccessibilityState(prev => ({
      ...prev,
      focusVisible: false
    }))
  }, [])

  // Focus management
  const manageFocus = useCallback((element: Element | null) => {
    if (!defaultConfig.enableFocusManagement) return

    focusedElement.current = element

    if (element) {
      // Ensure element is focusable
      if (!element.hasAttribute('tabindex') && 
          !['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA', 'A'].includes(element.tagName)) {
        element.setAttribute('tabindex', '-1')
      }

      // Focus the element
      if ('focus' in element && typeof element.focus === 'function') {
        (element as HTMLElement).focus()
      }

      // Announce to screen readers
      if (accessibilityState.screenReaderActive) {
        announceToScreenReader(`Focused on ${element.tagName.toLowerCase()}`)
      }
    }
  }, [defaultConfig.enableFocusManagement, accessibilityState.screenReaderActive])

  // Screen reader announcements
  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!defaultConfig.enableScreenReaderSupport) return

    // Create or update aria-live region
    let liveRegion = document.getElementById('animation-announcements')
    if (!liveRegion) {
      liveRegion = document.createElement('div')
      liveRegion.id = 'animation-announcements'
      liveRegion.setAttribute('aria-live', priority)
      liveRegion.setAttribute('aria-atomic', 'true')
      liveRegion.style.position = 'absolute'
      liveRegion.style.left = '-10000px'
      liveRegion.style.width = '1px'
      liveRegion.style.height = '1px'
      liveRegion.style.overflow = 'hidden'
      document.body.appendChild(liveRegion)
    }

    // Update the message
    liveRegion.textContent = message

    // Clear after announcement
    setTimeout(() => {
      if (liveRegion) {
        liveRegion.textContent = ''
      }
    }, 1000)
  }, [defaultConfig.enableScreenReaderSupport])

  // Get animation variants based on accessibility preferences
  const getAccessibleVariants = useCallback((variants: any) => {
    if (!defaultConfig.respectReducedMotion || !accessibilityState.reducedMotion) {
      return variants
    }

    // Create reduced motion variants
    const reducedVariants = { ...variants }
    
    Object.keys(reducedVariants).forEach(key => {
      if (typeof reducedVariants[key] === 'object' && reducedVariants[key] !== null) {
        // Remove or reduce animations
        const variant = { ...reducedVariants[key] }
        
        // Remove scale, rotate, and complex transforms
        delete variant.scale
        delete variant.rotate
        delete variant.rotateX
        delete variant.rotateY
        delete variant.rotateZ
        
        // Reduce opacity transitions
        if (variant.opacity !== undefined) {
          variant.transition = { duration: 0.1 }
        }
        
        // Reduce position changes
        if (variant.x !== undefined) variant.x = 0
        if (variant.y !== undefined) variant.y = 0
        
        reducedVariants[key] = variant
      }
    })

    return reducedVariants
  }, [defaultConfig.respectReducedMotion, accessibilityState.reducedMotion])

  // Get accessible transition settings
  const getAccessibleTransition = useCallback((transition: any = {}) => {
    if (!defaultConfig.respectReducedMotion || !accessibilityState.reducedMotion) {
      return transition
    }

    return {
      ...transition,
      duration: Math.min(transition.duration || 0.3, 0.1),
      type: 'tween',
      ease: 'linear'
    }
  }, [defaultConfig.respectReducedMotion, accessibilityState.reducedMotion])

  // Apply high contrast styles
  const applyHighContrastStyles = useCallback(() => {
    if (!defaultConfig.enableHighContrast || !accessibilityState.highContrast) return

    const style = document.createElement('style')
    style.id = 'high-contrast-animations'
    style.textContent = `
      /* High contrast animation styles */
      .motion-safe\\:animate-pulse,
      .motion-safe\\:animate-bounce,
      .motion-safe\\:animate-spin {
        animation-duration: 0.1s !important;
      }
      
      /* Ensure focus indicators are visible */
      *:focus {
        outline: 3px solid currentColor !important;
        outline-offset: 2px !important;
      }
      
      /* High contrast colors for animations */
      .animate-gradient {
        background: currentColor !important;
      }
    `

    // Remove existing high contrast styles
    const existing = document.getElementById('high-contrast-animations')
    if (existing) {
      existing.remove()
    }

    document.head.appendChild(style)
  }, [defaultConfig.enableHighContrast, accessibilityState.highContrast])

  // Initialize accessibility features
  useEffect(() => {
    detectScreenReader()
    applyHighContrastStyles()

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
      
      if (keyboardNavigationTimeout.current) {
        clearTimeout(keyboardNavigationTimeout.current)
      }

      // Clean up high contrast styles
      const style = document.getElementById('high-contrast-animations')
      if (style) {
        style.remove()
      }

      // Clean up announcements
      const liveRegion = document.getElementById('animation-announcements')
      if (liveRegion) {
        liveRegion.remove()
      }
    }
  }, [detectScreenReader, applyHighContrastStyles, handleKeyDown, handleMouseDown])

  // Update accessibility state when system preferences change
  useEffect(() => {
    setAccessibilityState(prev => ({
      ...prev,
      reducedMotion: prefersReducedMotion,
      highContrast: prefersHighContrast
    }))
  }, [prefersReducedMotion, prefersHighContrast])

  // Validate animation accessibility
  const validateAnimationAccessibility = useCallback((element: Element) => {
    const issues: string[] = []

    // Check for missing ARIA labels on interactive animated elements
    if (element.matches('button, [role="button"], a, [tabindex]')) {
      if (!element.hasAttribute('aria-label') && !element.hasAttribute('aria-labelledby') && !element.textContent?.trim()) {
        issues.push('Interactive animated element missing accessible name')
      }
    }

    // Check for animations that might cause seizures
    const computedStyle = window.getComputedStyle(element)
    const animationName = computedStyle.animationName
    if (animationName && animationName !== 'none') {
      const animationDuration = parseFloat(computedStyle.animationDuration)
      const animationIterationCount = computedStyle.animationIterationCount
      
      if (animationIterationCount === 'infinite' && animationDuration < 0.5) {
        issues.push('Fast infinite animation may cause seizures')
      }
    }

    // Check for proper focus management
    if (element.hasAttribute('tabindex') && element.getAttribute('tabindex') === '0') {
      if (!element.hasAttribute('role') && !['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA', 'A'].includes(element.tagName)) {
        issues.push('Focusable element should have appropriate role')
      }
    }

    return issues
  }, [])

  return {
    accessibilityState,
    config: defaultConfig,
    manageFocus,
    announceToScreenReader,
    getAccessibleVariants,
    getAccessibleTransition,
    validateAnimationAccessibility,
    isAccessible: accessibilityState.reducedMotion ? false : true
  }
}