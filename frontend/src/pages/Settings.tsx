import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Tab } from '@headlessui/react'
import { 
  BellIcon, 
  Cog6ToothIcon, 
  UserCircleIcon,
  ShieldCheckIcon,
  BeakerIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { NotificationSettings } from '../components/notifications/NotificationSettings'
import { NotificationDemo } from '../components/notifications/NotificationDemo'
import { AlertManager } from '../components/notifications/AlertManager'
import { NotificationHistory } from '../components/notifications/NotificationHistory'

const Settings: React.FC = () => {
  const tabs = [
    {
      name: 'Notifications',
      icon: BellIcon,
      component: <NotificationSettings />,
    },
    {
      name: 'Alerts',
      icon: ExclamationTriangleIcon,
      component: <AlertManager />,
    },
    {
      name: 'History',
      icon: ClockIcon,
      component: <NotificationHistory />,
    },
    {
      name: 'Demo & Testing',
      icon: BeakerIcon,
      component: <NotificationDemo />,
    },
    {
      name: 'General',
      icon: Cog6ToothIcon,
      component: (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-gray-600 dark:text-gray-400">
            General settings coming soon...
          </p>
        </div>
      ),
    },
    {
      name: 'Profile',
      icon: UserCircleIcon,
      component: (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-gray-600 dark:text-gray-400">
            Profile settings coming soon...
          </p>
        </div>
      ),
    },
    {
      name: 'Security',
      icon: ShieldCheckIcon,
      component: (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-gray-600 dark:text-gray-400">
            Security settings coming soon...
          </p>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </motion.div>

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 ${
                  selected
                    ? 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                }`
              }
            >
              <div className="flex items-center justify-center space-x-2">
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </div>
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-6">
          {tabs.map((tab, idx) => (
            <Tab.Panel
              key={idx}
              className="focus:outline-none"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {tab.component}
              </motion.div>
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}

export default Settings