import { useState, useEffect } from 'react'

interface SystemPreferences {
  prefersReducedMotion: boolean
  prefersDarkMode: boolean
  prefersHighContrast: boolean
  devicePixelRatio: number
}

export const useSystemPreferences = (): SystemPreferences => {
  const [preferences, setPreferences] = useState<SystemPreferences>({
    prefersReducedMotion: false,
    prefersDarkMode: true, // Default to dark mode
    prefersHighContrast: false,
    devicePixelRatio: 1,
  })

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return

    const updatePreferences = () => {
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)')

      setPreferences({
        prefersReducedMotion: reducedMotionQuery.matches,
        prefersDarkMode: darkModeQuery.matches,
        prefersHighContrast: highContrastQuery.matches,
        devicePixelRatio: window.devicePixelRatio || 1,
      })
    }

    // Initial check
    updatePreferences()

    // Set up listeners
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')

    const handleChange = () => updatePreferences()

    reducedMotionQuery.addEventListener('change', handleChange)
    darkModeQuery.addEventListener('change', handleChange)
    highContrastQuery.addEventListener('change', handleChange)

    // Listen for device pixel ratio changes (zoom, different displays)
    const handlePixelRatioChange = () => {
      setPreferences(prev => ({
        ...prev,
        devicePixelRatio: window.devicePixelRatio || 1
      }))
    }

    window.addEventListener('resize', handlePixelRatioChange)

    return () => {
      reducedMotionQuery.removeEventListener('change', handleChange)
      darkModeQuery.removeEventListener('change', handleChange)
      highContrastQuery.removeEventListener('change', handleChange)
      window.removeEventListener('resize', handlePixelRatioChange)
    }
  }, [])

  return preferences
}

// Hook específico para reduced motion (más simple para usar en componentes)
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}