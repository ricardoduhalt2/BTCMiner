import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'

interface BreadcrumbsProps {
  className?: string
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ className = '' }) => {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter(x => x)

  // Map routes to readable names
  const getPageName = (path: string): string => {
    const routeMap: Record<string, string> = {
      'dashboard': 'Dashboard',
      'bridge': 'Cross-Chain Bridge',
      'identity': 'Identity Management',
      'portfolio': 'Portfolio',
      'liquidity': 'Liquidity Management',
      'trading': 'Advanced Trading',
      'analytics': 'Analytics & Reports',
      'price-monitoring': 'Price Monitoring',
      'settings': 'Settings',
    }
    
    return routeMap[path] || path.charAt(0).toUpperCase() + path.slice(1)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: -10,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  }

  const separatorVariants = {
    hidden: { 
      opacity: 0, 
      rotate: -90,
      scale: 0
    },
    visible: { 
      opacity: 1, 
      rotate: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  }

  return (
    <motion.nav 
      className={`flex items-center text-sm ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label="Breadcrumb"
    >
      {/* Home */}
      <motion.div variants={itemVariants}>
        <Link 
          to="/dashboard"
          className="flex items-center text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors group"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 rounded-md group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors"
          >
            <HomeIcon className="h-4 w-4" aria-hidden="true" />
          </motion.div>
          <span className="sr-only">Home</span>
        </Link>
      </motion.div>

      {/* Breadcrumb items */}
      <AnimatePresence>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
          const isLast = index === pathnames.length - 1
          
          return (
            <React.Fragment key={name}>
              {/* Separator */}
              <motion.div 
                variants={separatorVariants}
                className="flex items-center mx-2"
              >
                <ChevronRightIcon 
                  className="h-4 w-4 text-gray-400 dark:text-gray-500" 
                  aria-hidden="true" 
                />
              </motion.div>
              
              {/* Breadcrumb item */}
              <motion.div 
                variants={itemVariants}
                className="relative"
              >
                {isLast ? (
                  <motion.span 
                    className="text-gray-900 dark:text-gray-100 font-medium px-2 py-1 rounded-md bg-primary-50 dark:bg-primary-900/20"
                    whileHover={{ scale: 1.05 }}
                    initial={{ backgroundColor: "transparent" }}
                    animate={{ backgroundColor: "var(--tw-bg-opacity)" }}
                    transition={{ duration: 0.2 }}
                  >
                    {getPageName(name)}
                    
                    {/* Active indicator */}
                    <motion.div
                      className="absolute -bottom-1 left-1/2 w-1 h-1 bg-primary-500 rounded-full"
                      initial={{ scale: 0, x: "-50%" }}
                      animate={{ scale: 1, x: "-50%" }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
                    />
                  </motion.span>
                ) : (
                  <Link
                    to={routeTo}
                    className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 relative group"
                  >
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className="relative z-10"
                    >
                      {getPageName(name)}
                    </motion.span>
                    
                    {/* Hover background */}
                    <motion.div
                      className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20 rounded-md opacity-0 group-hover:opacity-100"
                      initial={false}
                      transition={{ duration: 0.2 }}
                    />
                  </Link>
                )}
              </motion.div>
            </React.Fragment>
          )
        })}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Breadcrumbs