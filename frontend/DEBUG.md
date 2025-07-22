# Debug Configuration

Este documento explica cómo habilitar diferentes tipos de debug en la aplicación BTCMiner Frontend.

## Logs de Debug Disponibles

Por defecto, todos los logs de debug están deshabilitados en desarrollo para mantener la consola limpia. Puedes habilitarlos individualmente según necesites.

### 1. Debug de Animaciones

Para habilitar logs detallados de animaciones y errores de Framer Motion:

```javascript
localStorage.setItem('debug-animations', 'true')
```

Para deshabilitar:
```javascript
localStorage.removeItem('debug-animations')
```

**Qué incluye:**
- Errores de animación de Framer Motion
- Warnings de backgroundColor
- Problemas de performance en animaciones
- Fixes automáticos aplicados

### 2. Debug de Tema

Para habilitar logs de limpieza de elementos de tema:

```javascript
localStorage.setItem('debug-theme', 'true')
```

Para deshabilitar:
```javascript
localStorage.removeItem('debug-theme')
```

**Qué incluye:**
- Limpieza de elementos persistentes de tema
- Elementos de transición eliminados
- Verificación de elementos huérfanos
- Elementos de Framer Motion problemáticos

### 3. Debug de Real-time Updates

Para habilitar logs de conexiones en tiempo real:

```javascript
localStorage.setItem('debug-realtime', 'true')
```

Para deshabilitar:
```javascript
localStorage.removeItem('debug-realtime')
```

**Qué incluye:**
- Inicialización de WebSocket
- Limpieza de conexiones
- Updates en tiempo real

## Funciones de Debug Globales

Cuando el debug está habilitado, tienes acceso a estas funciones globales en la consola:

### Animaciones
```javascript
// Ver resumen de errores de animación
window.animationErrorHandler.getErrorSummary()

// Limpiar errores de animación
window.animationErrorHandler.clearErrors()

// Ver errores recientes (últimos 5 minutos)
window.animationErrorHandler.getRecentErrors()
```

### Tema
```javascript
// Limpiar elementos persistentes de tema
window.cleanupPersistentThemeElements()

// Verificar que no hay elementos persistentes
window.verifyNoPersistentElements()

// Limpieza forzada de todos los elementos de tema
window.forceCleanupTheme()
```

## Problemas Comunes Solucionados

### 1. Logs Spam en Consola
**Problema:** La consola se llenaba de logs de debug innecesarios.
**Solución:** Todos los logs están ahora condicionados a flags de debug específicos.

### 2. Warnings de Framer Motion
**Problema:** Warnings sobre animación de backgroundColor de "transparent" a valores numéricos.
**Solución:** El sistema detecta y suprime estos warnings automáticamente, aplicando fixes cuando es posible.

### 3. Elementos Persistentes de Tema
**Problema:** Elementos de transición de tema (🌙, ☀️) que persistían en el DOM.
**Solución:** Sistema automático de limpieza que elimina elementos huérfanos.

### 4. Performance de Animaciones
**Problema:** Frames largos de animación que afectaban el rendimiento.
**Solución:** Detección automática y logging opcional de problemas de performance.

## Recomendaciones

1. **Desarrollo Normal:** Mantén todos los debug flags deshabilitados para una consola limpia.

2. **Debug de Animaciones:** Habilita `debug-animations` solo cuando trabajes en componentes con animaciones complejas.

3. **Debug de Tema:** Habilita `debug-theme` solo si experimentas problemas con el cambio de tema.

4. **Producción:** Todos los logs de debug están automáticamente deshabilitados en producción.

## Ejemplo de Uso

```javascript
// Habilitar debug completo temporalmente
localStorage.setItem('debug-animations', 'true')
localStorage.setItem('debug-theme', 'true')
localStorage.setItem('debug-realtime', 'true')

// Recargar la página para ver los logs
location.reload()

// Después del debug, limpiar
localStorage.removeItem('debug-animations')
localStorage.removeItem('debug-theme')
localStorage.removeItem('debug-realtime')
```