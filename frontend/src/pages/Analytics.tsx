import React from 'react'
import { motion } from 'framer-motion'

const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Analytics & Reports
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analytics and reporting features coming soon...
        </p>
      </motion.div>
    </div>
  )
}

export default Analytics