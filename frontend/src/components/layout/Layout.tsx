import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'
import Breadcrumbs from './Breadcrumbs'
import NavigationProgress from './NavigationProgress'
import NavigationIndicator from './NavigationIndicator'
import { MobileNavigation } from '../common/MobileNavigation'
import { useAppSelector } from '@hooks/redux'
import { useMobileDetection } from '@hooks/useMobileDetection'
import { useSystemPreferences } from '@hooks/useSystemPreferences'
import { useMobilePerformance } from '@hooks/useMobilePerformance'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { theme } = useAppSelector(state => state.ui)
  const { isMobile, isTouchDevice } = useMobileDetection()
  const { prefersReducedMotion, saveData } = useSystemPreferences()
  const { optimizations } = useMobilePerformance()

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Apply theme to document with safety check
  useEffect(() => {
    if (document.documentElement && document.documentElement.classList) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [theme])

  // Close sidebar when clicking outside (mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!sidebarOpen || !event.target) return
      
      const sidebar = document.getElementById('sidebar')
      const menuButton = document.getElementById('menu-button')
      const target = event.target as Node
      
      // Only close if we have valid elements and the click is outside both
      if (
        sidebar &&
        !sidebar.contains(target) &&
        (!menuButton || !menuButton.contains(target))
      ) {
        setSidebarOpen(false)
      }
    }

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [sidebarOpen])

  const shouldShowBreadcrumbs = () => {
    const path = location.pathname
    return path !== '/' && path !== '/dashboard'
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    } ${isTouchDevice ? 'touch-manipulation' : ''}`}>
      {/* Navigation Progress Indicator */}
      {!saveData && <NavigationProgress />}
      
      <Header 
        onMenuClick={() => setSidebarOpen(true)}
        sidebarOpen={sidebarOpen}
      />
      
      <div className="flex pt-16">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sidebar 
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Mobile Navigation */}
        {isMobile && (
          <MobileNavigation
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}
        
        <main className={`flex-1 ${!isMobile ? 'lg:ml-64' : ''} min-h-[calc(100vh-4rem)]`}>
          <div className="flex flex-col min-h-full">
            {/* Breadcrumbs */}
            {shouldShowBreadcrumbs() && !isMobile && (
              <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200 dark:border-gray-700">
                <Breadcrumbs />
              </div>
            )}

            {/* Main Content */}
            <div className={`flex-1 px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-4' : 'py-8'}`}>
              <motion.div
                key={location.pathname}
                initial={prefersReducedMotion || optimizations.shouldReduceAnimations ? false : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion || optimizations.shouldReduceAnimations ? false : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion || optimizations.shouldReduceAnimations ? false : { opacity: 0, y: -20 }}
                transition={
                  prefersReducedMotion || optimizations.shouldReduceAnimations 
                    ? { duration: 0 } 
                    : { duration: optimizations.shouldLimitUpdates ? 0.15 : 0.3 }
                }
              >
                {children}
              </motion.div>
            </div>

            {/* Footer - Hidden on mobile to save space */}
            {!isMobile && <Footer />}
          </div>
        </main>
      </div>

      {/* Navigation Indicator - Only on desktop */}
      {!isMobile && <NavigationIndicator />}

      {/* Loading overlay for theme transitions */}
      {!prefersReducedMotion && (
        <motion.div
          initial={false}
          animate={{ opacity: 0 }}
          className="fixed inset-0 bg-white dark:bg-gray-900 pointer-events-none z-50"
        />
      )}
    </div>
  )
}

export default Layout