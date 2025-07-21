import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useWalletConnection } from '@hooks/useWalletConnection'
import { useRealTimeUpdates } from '@hooks/useRealTimeUpdates'
import { emergencyCleanup } from '@utils/emergencyCleanup'
import { cleanupPersistentThemeElements, verifyNoPersistentElements } from '@utils/persistentElementsCleanup'

// Importar páginas
import Dashboard from '@pages/Dashboard'
import Bridge from '@pages/Bridge'
import Identity from '@pages/Identity'
import Portfolio from '@pages/Portfolio'
import Liquidity from '@pages/Liquidity'
import Trading from '@pages/Trading'
import Analytics from '@pages/Analytics'
import PriceMonitoring from '@pages/PriceMonitoring'
import Settings from '@pages/Settings'
import NotFound from '@pages/NotFound'

// Importar componentes básicos (sin animaciones complejas)
import ErrorBoundary from '@components/common/ErrorBoundary'
import LoadingScreen from '@components/common/LoadingScreen'
import ThemeTransition from '@components/common/ThemeTransition'
import ThemeIndicator from '@components/common/ThemeIndicator'
import WelcomeAnimation from '@components/common/WelcomeAnimation'
import StorageCleanup from '@components/common/StorageCleanup'
import ToastContainer from '@components/common/ToastNotification'
import AnimationDebugButton from '@components/common/AnimationDebugButton'
import Layout from '@components/layout/Layout'

function App() {
  const { isInitializing } = useWalletConnection()
  const location = useLocation()
  const [isReady, setIsReady] = React.useState(false)
  
  // Initialize real-time updates
  useRealTimeUpdates()
  
  // 🚨 EMERGENCY CLEANUP: Limpieza controlada para evitar página en blanco
  React.useEffect(() => {
    // Marcar como listo inmediatamente para evitar página en blanco
    setIsReady(true)
    
    // Ejecutar limpieza más suave después de que la página cargue
    const timer = setTimeout(() => {
      try {
        cleanupPersistentThemeElements()
        verifyNoPersistentElements()
      } catch (error) {
        console.warn('Error en limpieza de elementos persistentes:', error)
      }
    }, 3000) // Esperar más tiempo para que la página cargue completamente
    
    return () => clearTimeout(timer)
  }, [])

  // Show loading screen while initializing
  if (isInitializing || !isReady) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Cargando BTCMiner...</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <ThemeTransition>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Layout completo restaurado */}
          <Layout>
            <AnimatePresence mode="wait" initial={false}>
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/bridge" element={<Bridge />} />
                <Route path="/identity" element={<Identity />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/liquidity" element={<Liquidity />} />
                <Route path="/trading" element={<Trading />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/price-monitoring" element={<PriceMonitoring />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </Layout>
          
          {/* 🧹 One-time storage cleanup */}
          <StorageCleanup />
          
          {/* 🎉 Welcome animation for first-time dark mode users */}
          <WelcomeAnimation />
          
          {/* 🎨 Theme transition indicator */}
          <ThemeIndicator />
          
          {/* 🔔 Toast notifications system */}
          <ToastContainer />
          
          {/* 🎬 Animation debugger (development only) */}
          <AnimationDebugButton />
          

        </div>
      </ThemeTransition>
    </ErrorBoundary>
  )
}

export default App