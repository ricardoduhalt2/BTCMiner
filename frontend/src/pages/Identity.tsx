import React from 'react'
import { motion } from 'framer-motion'
import IdentityManager from '@components/identity/IdentityManager'

const Identity: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Identity Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your digital identity and linked wallets with Internet Identity
          </p>
        </div>
      </motion.div>

      {/* Identity Manager Component */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <IdentityManager />
      </motion.div>
    </div>
  )
}

export default Identity