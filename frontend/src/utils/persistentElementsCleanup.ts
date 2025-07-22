/**
 * Persistent Elements Cleanup Utility
 * Solución específica para eliminar elementos persistentes de transición de tema
 * Resuelve el problema de la media luna (🌙) y texto "DARK MODE" que persistían
 */

export const cleanupPersistentThemeElements = () => {
  if (typeof document === 'undefined') return 0

  const debugEnabled = process.env.NODE_ENV === 'development' && localStorage.getItem('debug-theme') === 'true'
  
  if (debugEnabled) {
    console.log('🧹 Limpiando elementos persistentes de tema...')
  }
  
  let removedCount = 0
  
  // 1. Eliminar elementos específicos que causan persistencia
  const persistentSelectors = [
    '[data-theme-transition="indicator"]',
    '[data-theme-transition="indicator-icon"]', 
    '.theme-change-indicator',
    '.theme-transition-overlay',
    '[data-theme-indicator]'
  ]
  
  persistentSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector)
      elements.forEach(element => {
        if (debugEnabled) {
          console.log(`🗑️ Eliminando elemento persistente: ${selector}`)
        }
        element.remove()
        removedCount++
      })
    } catch (error) {
      // Ignorar errores de selectores
    }
  })
  
  // 2. Buscar elementos con contenido específico de tema
  const allElements = document.querySelectorAll('*')
  allElements.forEach(element => {
    try {
      const textContent = element.textContent?.trim() || ''
      
      // Buscar contenido exacto que causa problemas
      const problematicContent = [
        '🌙', '☀️', 'Dark Mode', 'Light Mode', 'DARK MODE', 'LIGHT MODE'
      ]
      
      if (problematicContent.some(content => textContent === content)) {
        const computedStyle = window.getComputedStyle(element)
        const isFloating = (
          computedStyle.position === 'fixed' || 
          computedStyle.position === 'absolute' ||
          parseInt(computedStyle.zIndex) > 50
        )
        
        if (isFloating) {
          if (debugEnabled) {
            console.log(`🗑️ Eliminando contenido persistente: "${textContent}"`)
          }
          element.remove()
          removedCount++
        }
      }
    } catch (error) {
      // Ignorar errores
    }
  })
  
  // 3. Limpiar elementos de Framer Motion huérfanos
  const framerElements = document.querySelectorAll('[data-framer-name], [data-projection-id]')
  framerElements.forEach(element => {
    const textContent = element.textContent || ''
    if (textContent.includes('🌙') || textContent.includes('Dark Mode')) {
      if (debugEnabled) {
        console.log('🗑️ Eliminando elemento Framer Motion huérfano con contenido de tema')
      }
      element.remove()
      removedCount++
    }
  })
  
  if (removedCount > 0 && debugEnabled) {
    console.log(`✅ Limpieza completada: ${removedCount} elementos persistentes eliminados`)
  }
  
  return removedCount
}

// Función de verificación para confirmar que no hay elementos persistentes
export const verifyNoPersistentElements = () => {
  if (typeof document === 'undefined') return true
  
  const debugEnabled = process.env.NODE_ENV === 'development' && localStorage.getItem('debug-theme') === 'true'
  
  const problematicSelectors = [
    '[data-theme-transition="indicator"]',
    '.theme-change-indicator',
    '[data-theme-indicator]'
  ]
  
  let foundPersistent = false
  
  problematicSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector)
    if (elements.length > 0) {
      if (debugEnabled) {
        console.warn(`⚠️ Elementos persistentes encontrados: ${selector} (${elements.length})`)
      }
      foundPersistent = true
    }
  })
  
  // Verificar contenido de texto problemático
  const allElements = document.querySelectorAll('*')
  allElements.forEach(element => {
    const textContent = element.textContent?.trim() || ''
    if ((textContent === '🌙' || textContent === 'Dark Mode') && 
        window.getComputedStyle(element).position === 'fixed') {
      if (debugEnabled) {
        console.warn(`⚠️ Elemento persistente con contenido: "${textContent}"`)
      }
      foundPersistent = true
    }
  })
  
  if (!foundPersistent && debugEnabled) {
    console.log('✅ Verificación exitosa: No se encontraron elementos persistentes')
  }
  
  return !foundPersistent
}

// Auto-ejecutar en desarrollo
if (process.env.NODE_ENV === 'development') {
  if (typeof window !== 'undefined') {
    // Función global para debugging
    ;(window as any).cleanupPersistentThemeElements = cleanupPersistentThemeElements
    ;(window as any).verifyNoPersistentElements = verifyNoPersistentElements
    
    // Verificación inicial después de cargar
    window.addEventListener('load', () => {
      setTimeout(() => {
        cleanupPersistentThemeElements()
        verifyNoPersistentElements()
      }, 1000)
    })
  }
}