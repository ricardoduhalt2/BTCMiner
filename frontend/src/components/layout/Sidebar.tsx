import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'framer-motion'
import {
  HomeIcon,
  ArrowsRightLeftIcon,
  UserCircleIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  BeakerIcon,
  CogIcon,
  XMarkIcon,
  SparklesIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const location = useLocation()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const logoAnimation = useAnimation()
  const sidebarX = useMotionValue(0)
  const sidebarOpacity = useTransform(sidebarX, [-320, 0], [0, 1])

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, color: 'text-blue-400' },
    { name: 'Bridge', href: '/bridge', icon: ArrowsRightLeftIcon, color: 'text-purple-400' },
    { name: 'Identity', href: '/identity', icon: UserCircleIcon, color: 'text-green-400' },
    { name: 'Portfolio', href: '/portfolio', icon: ChartBarIcon, color: 'text-yellow-400' },
    { name: 'Liquidity', href: '/liquidity', icon: BeakerIcon, color: 'text-cyan-400' },
    { name: 'Price Monitor', href: '/price-monitoring', icon: CurrencyDollarIcon, color: 'text-orange-400' },
    { name: 'Settings', href: '/settings', icon: CogIcon, color: 'text-gray-400' },
  ]

  const isActive = (href: string) => {
    return location.pathname === href || (href === '/dashboard' && location.pathname === '/')
  }

  // Animate logo on mount
  useEffect(() => {
    logoAnimation.start({
      rotate: [0, 360],
      scale: [1, 1.1, 1],
      transition: { duration: 1, ease: "easeOut" }
    })
  }, [logoAnimation])

  // Navigation item variants
  const navItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (index: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.3,
        ease: "easeOut"
      }
    }),
    hover: {
      x: 4,
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  }

  // Enhanced sidebar variants for mobile
  const sidebarVariants = {
    closed: {
      x: -320,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    },
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.07,
        delayChildren: 0.1
      }
    }
  }

  // Enhanced backdrop variants
  const backdropVariants = {
    closed: { 
      opacity: 0,
      backdropFilter: "blur(0px)",
      transition: { duration: 0.2 }
    },
    open: { 
      opacity: 1,
      backdropFilter: "blur(4px)",
      transition: { duration: 0.3 }
    }
  }

  // Componente de navegación reutilizable
  const NavigationContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <motion.div 
      className="flex flex-col h-full"
      initial="hidden"
      animate="visible"
    >
      {/* Header - Solo en mobile */}
      {isMobile && (
        <motion.div 
          className="flex items-center justify-between p-4 border-b border-gray-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center space-x-3">
            <motion.img 
              src="/logoBTCMINER.png" 
              alt="BTCMiner Logo" 
              className="w-8 h-8 rounded-lg"
              animate={logoAnimation}
              whileHover={{ scale: 1.1, rotate: 5 }}
            />
            <motion.span 
              className="text-lg font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              BTCMiner
            </motion.span>
          </div>
          <motion.button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <XMarkIcon className="h-6 w-6" />
          </motion.button>
        </motion.div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item, index) => {
          const isItemActive = isActive(item.href)
          return (
            <motion.div
              key={item.name}
              custom={index}
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              onHoverStart={() => setHoveredItem(item.name)}
              onHoverEnd={() => setHoveredItem(null)}
              className="relative"
            >
              <Link
                to={item.href}
                onClick={isMobile ? onClose : undefined}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                  isItemActive
                    ? 'bg-primary-900/20 text-primary-400'
                    : 'text-gray-300 hover:text-gray-100 hover:bg-gray-800'
                }`}
              >
                {/* Active indicator */}
                {isItemActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-r-full"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}
                
                {/* Hover background */}
                {hoveredItem === item.name && !isItemActive && (
                  <motion.div
                    layoutId="hoverBackground"
                    className="absolute inset-0 bg-gray-800 rounded-lg"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30
                    }}
                  />
                )}

                <motion.div
                  className="relative z-10 flex items-center space-x-3"
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div
                    animate={isItemActive ? {
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    } : {}}
                    transition={isItemActive ? {
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3
                    } : {}}
                    className={`${isItemActive ? item.color : ''}`}
                  >
                    <item.icon className="h-5 w-5" />
                  </motion.div>
                  <span className="relative">
                    {item.name}
                    {/* Sparkle effect for active item */}
                    {isItemActive && (
                      <motion.div
                        className="absolute -top-1 -right-1"
                        animate={{
                          scale: [0, 1, 0],
                          rotate: [0, 180, 360]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 4
                        }}
                      >
                        <SparklesIcon className="h-3 w-3 text-primary-400" />
                      </motion.div>
                    )}
                  </span>
                </motion.div>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Footer */}
      <motion.div 
        className="p-4 border-t border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <motion.div 
          className="text-xs text-gray-400 text-center"
          whileHover={{ scale: 1.05, color: "#9CA3AF" }}
        >
          BTCMiner v1.0.0
        </motion.div>
      </motion.div>
    </motion.div>
  )

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black bg-opacity-25 lg:hidden z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Siempre visible */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:block">
        <div className="flex h-full w-64 flex-col bg-gray-900 border-r border-gray-800">
          <NavigationContent isMobile={false} />
        </div>
      </div>

      {/* Mobile Sidebar - Solo visible cuando open=true */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 lg:hidden shadow-2xl"
            style={{ x: sidebarX, opacity: sidebarOpacity }}
          >
            <NavigationContent isMobile={true} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar