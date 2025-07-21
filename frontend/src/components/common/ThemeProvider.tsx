import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppSelector, useAppDispatch } from '@hooks/redux'
import { setTheme } from '@store/slices/uiSlice'
import { useSystemPreferences } from '@hooks/useSystemPreferences'
import ParticleSystem from './ParticleSystem'
import { AnimationProvider } from './AnimationProvider'
import { forceCleanupAllThemeElements, monitorThemeTransitions } from '@utils/themeCleanup'

interface AnimationConfig {
  duration: {
    fast: number
    normal: number
    slow: number
  }
  easing: {
    easeInOut: string
    easeOut: string
    bounce: string
    spring: string
  }
  reducedMotion: boolean
}

interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
  isAnimated: boolean
  animationConfig: AnimationConfig
  isTransitioning: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch()
  const { theme } = useAppSelector(state => state.ui)
  const { prefersReducedMotion } = useSystemPreferences()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Animation configuration that respects user preferences
  const animationConfig: AnimationConfig = {
    duration: {
      fast: prefersReducedMotion ? 0 : 150,
      normal: prefersReducedMotion ? 0 : 300,
      slow: prefersReducedMotion ? 0 : 500,
    },
    easing: {
      easeInOut: 'easeInOut',
      easeOut: 'easeOut',
      bounce: 'backOut',
      spring: 'easeOut',
    },
    reducedMotion: prefersReducedMotion,
  }

  // Initialize theme monitoring and cleanup
  useEffect(() => {
    const cleanup = monitorThemeTransitions()
    return () => cleanup()
  }, [])

  // Initialize theme - DEFAULT TO DARK MODE! 🌙
  useEffect(() => {
    const savedTheme = localStorage.getItem('btcminer-theme') as 'light' | 'dark' | null

    if (savedTheme) {
      dispatch(setTheme(savedTheme))
    } else {
      // 🎉 SURPRISE! Default to dark mode instead of system preference
      dispatch(setTheme('dark'))
      localStorage.setItem('btcminer-theme', 'dark')
    }
    
    setIsInitialized(true)
  }, [dispatch])

  // Apply theme with smooth transitions ✨
  useEffect(() => {
    if (!isInitialized) return

    const applyTheme = async () => {
      setIsTransitioning(true)
      
      // Add CSS custom properties for smooth transitions
      document.documentElement.style.setProperty(
        '--theme-transition-duration', 
        `${animationConfig.duration.normal}ms`
      )
      document.documentElement.style.setProperty(
        '--theme-transition-easing', 
        animationConfig.easing.easeInOut
      )
      
      // Save to localStorage
      localStorage.setItem('btcminer-theme', theme)

      // Create theme change indicator
      if (!prefersReducedMotion) {
        createThemeChangeIndicator(theme)
        
        // Add transition class temporarily
        document.documentElement.classList.add('theme-transitioning')
        
        // Add transition overlay
        createTransitionOverlay(theme)
      }

      // Apply theme
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      } else {
        document.documentElement.classList.add('light')
        document.documentElement.classList.remove('dark')
      }
      
      document.documentElement.setAttribute('data-theme', theme)
      
      // Reset transition state
      setTimeout(() => {
        setIsTransitioning(false)
        
        // Safe access to document.documentElement
        if (document.documentElement && document.documentElement.classList) {
          document.documentElement.classList.remove('theme-transitioning')
        }
        
        removeTransitionOverlay()
        
        // Force cleanup of any remaining theme elements
        setTimeout(() => {
          forceCleanupAllThemeElements()
        }, 500)
      }, animationConfig.duration.normal)
    }

    applyTheme()
  }, [theme, animationConfig.duration.normal, animationConfig.easing.easeInOut, prefersReducedMotion, isInitialized])

  // SOLUCIÓN: Deshabilitar completamente el indicador de cambio de tema
  // Esta función causaba los elementos persistentes (🌙 y "DARK MODE")
  const createThemeChangeIndicator = (currentTheme: 'light' | 'dark') => {
    // NO CREAR INDICADORES - esto previene elementos persistentes
    // El ThemeToggle ya proporciona suficiente feedback visual
    return
  }

  // Create transition overlay with proper cleanup
  const createTransitionOverlay = (currentTheme: 'light' | 'dark') => {
    // Remove any existing overlays first
    const existingOverlays = document.querySelectorAll('[data-theme-transition="overlay"]')
    existingOverlays.forEach(el => el.remove())
    
    const overlay = document.createElement('div')
    overlay.className = `theme-transition-overlay ${currentTheme} active`
    overlay.setAttribute('data-theme-transition', 'overlay')
    document.body.appendChild(overlay)
    
    // Auto-cleanup fallback
    setTimeout(() => {
      if (document.contains(overlay)) {
        overlay.remove()
      }
    }, 2000)
  }

  // Remove transition overlay with enhanced cleanup
  const removeTransitionOverlay = () => {
    const overlays = document.querySelectorAll('[data-theme-transition="overlay"], .theme-transition-overlay')
    overlays.forEach(overlay => {
      if (overlay && overlay.classList) {
        overlay.classList.remove('active')
      }
      setTimeout(() => {
        if (document.contains(overlay)) {
          overlay.remove()
        }
      }, 300)
    })
  }

  // Listen for system theme changes (but don't override user choice)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem('btcminer-theme')
      // Only auto-switch if user hasn't set a preference
      if (!savedTheme) {
        dispatch(setTheme(e.matches ? 'dark' : 'light'))
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [dispatch])

  const toggleTheme = useCallback(() => {
    if (isTransitioning) return // Prevent rapid toggling during transition
    
    dispatch(setTheme(theme === 'light' ? 'dark' : 'light'))
  }, [dispatch, theme, isTransitioning])

  const handleSetTheme = useCallback((newTheme: 'light' | 'dark') => {
    if (isTransitioning) return
    
    dispatch(setTheme(newTheme))
  }, [dispatch, isTransitioning])

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme: handleSetTheme,
    isAnimated: !prefersReducedMotion,
    animationConfig,
    isTransitioning,
  }

  // Show loading screen until theme is initialized
  if (!isInitialized) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1, 
            repeat: Infinity, 
            ease: "linear",
            repeatType: "loop"
          }}
          className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <ThemeContext.Provider value={value}>
      <AnimationProvider>
        <AnimatePresence mode="wait">
          <motion.div
            key={`theme-${theme}`}
            initial={prefersReducedMotion ? {} : { opacity: 0.95, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={prefersReducedMotion ? {} : { opacity: 0.95, scale: 1.01 }}
            transition={{ 
              duration: animationConfig.duration.fast / 1000,
              ease: animationConfig.easing.easeOut
            }}
            className="min-h-screen"
          >
            {children}
          </motion.div>
        </AnimatePresence>
        
        {/* 🎆 SURPRISE! Particle system for theme transitions */}
        <ParticleSystem />
      </AnimationProvider>
    </ThemeContext.Provider>
  )
}