import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowsRightLeftIcon,
  PlusIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline'
import { useWalletConnection } from '@hooks/useWalletConnection'

const QuickActions: React.FC = () => {
  const { updateBalances } = useWalletConnection()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefreshBalances = async () => {
    setIsRefreshing(true)
    try {
      await updateBalances()
    } catch (error) {
      console.error('Failed to refresh balances:', error)
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000) // Minimum 1s for UX
    }
  }

  const actions = [
    {
      name: 'Bridge',
      description: 'Transfer tokens between chains',
      href: '/bridge',
      icon: ArrowsRightLeftIcon,
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Add Liquidity',
      description: 'Provide liquidity to earn rewards',
      href: '/liquidity',
      icon: PlusIcon,
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Analytics',
      description: 'View detailed portfolio analytics',
      href: '/analytics',
      icon: ChartBarIcon,
      color: 'bg-purple-500 hover:bg-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Trading',
      description: 'Access advanced trading features',
      href: '/trading',
      icon: BeakerIcon,
      color: 'bg-orange-500 hover:bg-orange-600',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="flex items-center space-x-3">
      {/* Refresh Button */}
      <button
        onClick={handleRefreshBalances}
        disabled={isRefreshing}
        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        title="Refresh balances"
      >
        <ArrowPathIcon className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>

      {/* Quick Actions Dropdown */}
      <div className="relative group">
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <PlusIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Quick Actions</span>
        </button>

        {/* Dropdown Menu */}
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="p-2">
            {actions.map((action, index) => (
              <motion.div
                key={action.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={action.href}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group/item"
                >
                  <div className={`w-10 h-10 rounded-lg ${action.bgColor} flex items-center justify-center group-hover/item:scale-110 transition-transform`}>
                    <action.icon className={`h-5 w-5 ${action.textColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {action.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 p-2">
            <Link
              to="/settings"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
            >
              <Cog6ToothIcon className="h-5 w-5" />
              <span className="text-sm">Settings & Preferences</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickActions