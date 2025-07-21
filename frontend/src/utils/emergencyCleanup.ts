/**
 * Emergency Cleanup Utility
 * Limpia inmediatamente todos los elementos persistentes de transición de tema
 */

export const emergencyCleanup = () => {
  if (typeof document === 'undefined') return 0
  
  console.log('🚨 EMERGENCY CLEANUP: Eliminando todos los elementos persistentes de tema...')
  
  let removedCount = 0
  
  // 1. Eliminar por atributos de datos específicos
  const dataElements = document.querySelectorAll('[data-theme-transition], [data-theme-indicator], [data-framer-name*="theme"], [data-projection-id]')
  console.log(`Encontrados ${dataElements.length} elementos con atributos de tema`)
  dataElements.forEach(element => {
    const textContent = element.textContent || ''
    if (textContent.includes('🌙') || textContent.includes('☀️') || 
        textContent.includes('Dark Mode') || textContent.includes('Light Mode')) {
      element.remove()
      removedCount++
    }
  })
  
  // 2. Buscar elementos con z-index alto y contenido de tema
  const allElements = document.querySelectorAll('*')
  allElements.forEach(element => {
    try {
      const textContent = element.textContent || ''
      const computedStyle = window.getComputedStyle(element)
      const zIndex = parseInt(computedStyle.zIndex) || 0
      
      const hasThemeEmoji = textContent.includes('🌙') || textContent.includes('☀️')
      const hasThemeText = textContent.includes('Dark Mode') || textContent.includes('Light Mode')
      
      if (hasThemeEmoji || hasThemeText) {
        const isHighZIndex = zIndex >= 50
        const isFixed = computedStyle.position === 'fixed'
        const isAbsolute = computedStyle.position === 'absolute'
        const hasTransform = computedStyle.transform !== 'none'
        
        // Más agresivo: eliminar cualquier elemento flotante con contenido de tema
        if (isFixed || isAbsolute || isHighZIndex || hasTransform) {
          console.log('🗑️ Eliminando elemento persistente:', {
            element: element.tagName,
            textContent: textContent.substring(0, 30),
            zIndex,
            position: computedStyle.position,
            transform: computedStyle.transform !== 'none'
          })
          element.remove()
          removedCount++
        }
      }
    } catch (error) {
      // Ignorar errores de elementos que ya fueron eliminados
    }
  })
  
  // 3. Eliminar elementos específicos por clases conocidas
  const classSelectors = [
    '.theme-change-indicator',
    '.theme-transition-overlay',
    '.theme-indicator',
    '[class*="theme-transition"]',
    '[class*="ThemeIndicator"]',
    '[class*="theme-indicator"]'
  ]
  
  classSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector)
      elements.forEach(element => {
        console.log('🗑️ Eliminando por clase:', selector, element)
        element.remove()
        removedCount++
      })
    } catch (error) {
      // Ignorar selectores inválidos
    }
  })
  
  // 4. Buscar elementos con texto exacto de tema (más específico)
  const textElements = document.querySelectorAll('div, span, p, button')
  textElements.forEach(element => {
    try {
      const text = element.textContent?.trim()
      const exactMatches = [
        'Dark Mode', 'Light Mode', 'DARK MODE', 'LIGHT MODE',
        '🌙', '☀️', 'Switch to Dark', 'Switch to Light'
      ]
      
      if (exactMatches.includes(text || '')) {
        const computedStyle = window.getComputedStyle(element)
        const isFloating = computedStyle.position === 'fixed' || 
                          computedStyle.position === 'absolute' ||
                          parseInt(computedStyle.zIndex) > 10
        
        if (isFloating) {
          console.log('🗑️ Eliminando texto exacto:', text, element)
          element.remove()
          removedCount++
        }
      }
    } catch (error) {
      // Ignorar errores
    }
  })
  
  // 5. Limpiar elementos huérfanos de Framer Motion
  const framerSelectors = [
    '[data-framer-name]',
    '[data-projection-id]',
    '.framer-motion-div',
    '[style*="transform"]'
  ]
  
  framerSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector)
      elements.forEach(element => {
        const textContent = element.textContent || ''
        if (textContent.includes('🌙') || textContent.includes('☀️') || 
            textContent.includes('Dark Mode') || textContent.includes('Light Mode')) {
          console.log('🗑️ Eliminando Framer Motion huérfano:', element)
          element.remove()
          removedCount++
        }
      })
    } catch (error) {
      // Ignorar errores
    }
  })
  
  console.log(`✅ EMERGENCY CLEANUP COMPLETADO: Se eliminaron ${removedCount} elementos persistentes`)
  
  return removedCount
}

// Ejecutar limpieza inmediata si estamos en desarrollo
if (process.env.NODE_ENV === 'development') {
  if (typeof window !== 'undefined') {
    // Ejecutar después de que la página cargue
    window.addEventListener('load', () => {
      setTimeout(() => {
        emergencyCleanup()
      }, 1000)
    })
    
    // Agregar función global para debugging
    ;(window as any).emergencyCleanup = emergencyCleanup
    
    // Ejecutar cada 10 segundos en desarrollo para mantener limpio (menos agresivo)
    const cleanupInterval = setInterval(() => {
      const removed = emergencyCleanup()
      if (removed > 0) {
        console.log(`🧹 Limpieza automática: eliminados ${removed} elementos`)
      }
    }, 10000)
    
    // También limpiar cuando se detecten cambios en el DOM
    const observer = new MutationObserver((mutations) => {
      let shouldCleanup = false
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element
            const textContent = element.textContent || ''
            
            if (textContent.includes('🌙') || textContent.includes('☀️') || 
                textContent.includes('Dark Mode') || textContent.includes('Light Mode')) {
              shouldCleanup = true
            }
          }
        })
      })
      
      if (shouldCleanup) {
        setTimeout(() => emergencyCleanup(), 100)
      }
    })
    
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      })
    }
    
    // Cleanup al cerrar la página
    window.addEventListener('beforeunload', () => {
      clearInterval(cleanupInterval)
      observer.disconnect()
    })
  }
}