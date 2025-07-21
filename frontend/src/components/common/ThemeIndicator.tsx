import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from './ThemeProvider'

const ThemeIndicator: React.FC = () => {
  const { theme, isTransitioning, isAnimated } = useTheme()
  const [showIndicator, setShowIndicator] = useState(false)
  const [previousTheme, setPreviousTheme] = useState<'light' | 'dark' | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const elementRef = useRef<HTMLDivElement | null>(null)

  // Función de limpieza agresiva
  const forceHideIndicator = () => {
    setShowIndicator(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    // Limpiar cualquier elemento DOM persistente
    if (elementRef.current && document.contains(elementRef.current)) {
      elementRef.current.remove()
    }
  }

  useEffect(() => {
    // SOLUCIÓN: Deshabilitar completamente el indicador para evitar elementos persistentes
    // El ThemeToggle ya proporciona feedback visual suficiente
    return () => {
      forceHideIndicator()
    }
  }, [])

  useEffect(() => {
    // Limpieza al cambiar tema
    forceHideIndicator()
    
    // Solo mostrar si realmente es necesario y está habilitado
    if (isTransitioning && isAnimated && previousTheme && previousTheme !== theme) {
      // DESHABILITADO: No mostrar indicador para evitar elementos persistentes
      // setShowIndicator(true)
      
      // Actualizar tema anterior
      setPreviousTheme(theme)
    } else if (previousTheme !== theme) {
      setPreviousTheme(theme)
    }
  }, [theme, isTransitioning, isAnimated, previousTheme])

  // Limpieza adicional cuando no está en transición
  useEffect(() => {
    if (!isTransitioning) {
      forceHideIndicator()
    }
  }, [isTransitioning])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      forceHideIndicator()
    }
  }, [])

  const indicatorVariants = {
    hidden: {
      opacity: 0,
      scale: 0.5,
      y: 50,
      rotate: -180
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        duration: 0.6
      }
    },
    exit: {
      opacity: 0,
      scale: 0.5,
      y: -50,
      rotate: 180,
      transition: {
        duration: 0.4,
        ease: "easeIn"
      }
    }
  }

  const backgroundVariants = {
    light: {
      background: 'linear-gradient(135deg, #fef3c7, #fbbf24)',
      boxShadow: '0 10px 40px rgba(251, 191, 36, 0.3)'
    },
    dark: {
      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
      boxShadow: '0 10px 40px rgba(30, 41, 59, 0.5)'
    }
  }

  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: 0.3, duration: 0.3 }
    }
  }

  // SOLUCIÓN: Retornar null para deshabilitar completamente el indicador
  // Esto previene cualquier elemento persistente de tema
  return null
}

export default ThemeIndicator