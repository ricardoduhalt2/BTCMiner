import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bars3Icon,
  ChevronDownIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { useWalletConnection } from '@hooks/useWalletConnection'
import { useAppSelector } from '@hooks/redux'
import NetworkSelector from '@components/common/NetworkSelector'
import { NotificationDropdown } from '@components/common/NotificationDropdown'
import WalletConnectorFixed from '@components/wallet/WalletConnectorFixed'
import ThemeToggle from '@components/common/ThemeToggle'

interface HeaderProps {
  onMenuClick: () => void
  sidebarOpen: boolean
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, sidebarOpen }) => {
  const location = useLocation()
  const { connectedWallets } = useWalletConnection()
  const { unreadCount } = useAppSelector(state => state.notifications)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const getPageTitle = () => {
    const path = location.pathname
    switch (path) {
      case '/':
      case '/dashboard':
        return 'Dashboard'
      case '/bridge':
        return 'Cross-Chain Bridge'
      case '/identity':
        return 'Identity Management'
      case '/portfolio':
        return 'Portfolio'
      case '/liquidity':
        return 'Liquidity Management'
      case '/trading':
        return 'Advanced Trading'
      case '/analytics':
        return 'Analytics & Reports'
      case '/settings':
        return 'Settings'
      default:
        return 'BTCMiner'
    }
  }

  return (
    <header className="bg-gray-900 shadow-sm border-b border-gray-800 fixed w-full top-0 z-40 lg:pl-64">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            <motion.button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-300 hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={sidebarOpen ? { rotate: 90 } : { rotate: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                animate={sidebarOpen ? { 
                  rotate: [0, 90, 180],
                  scale: [1, 1.1, 1]
                } : { 
                  rotate: 0,
                  scale: 1
                }}
                transition={{ duration: 0.3 }}
              >
                <Bars3Icon className="h-6 w-6" />
              </motion.div>
            </motion.button>

            {/* Logo y título - Solo en mobile, en desktop está en sidebar */}
            <div className="flex items-center ml-4 lg:hidden">
              <Link to="/" className="flex items-center space-x-3">
                <img 
                  src="/logoBTCMINER.png" 
                  alt="BTCMiner Logo" 
                  className="w-8 h-8 rounded-lg"
                />
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">BTCMiner</h1>
                  <p className="text-xs text-gray-400 -mt-1">Multi-Chain Platform</p>
                </div>
              </Link>
            </div>

            {/* Page Title - Más prominente en desktop */}
            <div className="hidden lg:block">
              <motion.h2 
                key={location.pathname}
                className="text-xl font-semibold text-gray-100"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                {getPageTitle()}
              </motion.h2>
            </div>
          </div>

          {/* Center - Network Selector */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-center">
            <NetworkSelector />
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <div className="relative">
              <NotificationDropdown />
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.div>
              )}
            </div>

            {/* Wallet Connection */}
            <WalletConnectorFixed />

            {/* User Menu */}
            {connectedWallets.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-800 transition-colors"
                >
                  <UserCircleIcon className="h-6 w-6 text-gray-400" />
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg border border-gray-700 py-1 z-50"
                    >
                      <Link
                        to="/identity"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <UserCircleIcon className="h-4 w-4 mr-3" />
                        Identity
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Cog6ToothIcon className="h-4 w-4 mr-3" />
                        Settings
                      </Link>
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                        onClick={() => {
                          // Disconnect all wallets
                          setUserMenuOpen(false)
                        }}
                      >
                        <ArrowRightStartOnRectangleIcon className="h-4 w-4 mr-3" />
                        Disconnect
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Page Title */}
      <div className="md:hidden px-4 pb-2">
        <motion.h2 
          key={location.pathname}
          className="text-lg font-semibold text-gray-100"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          {getPageTitle()}
        </motion.h2>
      </div>
    </header>
  )
}

export default Header