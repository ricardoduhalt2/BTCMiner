import React from 'react'

interface ThemeTransitionProps {
  children: React.ReactNode
}

const ThemeTransition: React.FC<ThemeTransitionProps> = ({ children }) => {
  // SOLUCIÓN: Deshabilitar completamente las transiciones problemáticas
  // Solo devolver los children sin animaciones para evitar elementos persistentes
  // Las transiciones de tema ahora se manejan completamente en el ThemeProvider
  
  return <>{children}</>
}

export default ThemeTransition