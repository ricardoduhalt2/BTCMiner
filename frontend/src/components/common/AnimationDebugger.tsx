import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AnimationErrorHandler, { getAnimationErrorSummary } from '@utils/animationErrorHandler'
import { AnimationPerformanceMonitor } from '@utils/animationUtils'

interface AnimationDebuggerProps {
  isOpen: boolean
  onClose: () => void
}

const AnimationDebugger: React.FC<AnimationDebuggerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'errors' | 'performance' | 'config'>('errors')
  const [errorSummary, setErrorSummary] = useState<any>({})
  const [performanceReport, setPerformanceReport] = useState<any>({})
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  const errorHandler = AnimationErrorHandler.getInstance()
  const performanceMonitor = AnimationPerformanceMonitor.getInstance()

  // Refresh data periodically
  useEffect(() => {
    if (isOpen) {
      const updateData = () => {
        setErrorSummary(getAnimationErrorSummary())
        setPerformanceReport(performanceMonitor.getReport())
      }

      updateData() // Initial load
      const interval = setInterval(updateData, 2000) // Update every 2 seconds
      setRefreshInterval(interval)

      return () => {
        if (interval) clearInterval(interval)
      }
    }
  }, [isOpen, errorHandler, performanceMonitor])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [refreshInterval])

  const handleClearErrors = () => {
    errorHandler.clearErrors()
    setErrorSummary(getAnimationErrorSummary())
  }

  const getErrorTypeColor = (type: string) => {
    const colors = {
      'framer-motion': 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
      'css': 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
      'performance': 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
      'unknown': 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30'
    }
    return colors[type as keyof typeof colors] || colors.unknown
  }

  const getPerformanceStatus = () => {
    const avgDuration = parseFloat(performanceReport.averageDuration || '0')
    const worstFrame = parseFloat(performanceReport.worstFrame || '0')
    
    if (avgDuration > 20 || worstFrame > 50) {
      return { status: 'Poor', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' }
    } else if (avgDuration > 10 || worstFrame > 25) {
      return { status: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' }
    } else {
      return { status: 'Good', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' }
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🎬</span>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Animation Debugger
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-4">
                {[
                  { id: 'errors', label: 'Errors', icon: '⚠️' },
                  { id: 'performance', label: 'Performance', icon: '📊' },
                  { id: 'config', label: 'Config', icon: '⚙️' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {activeTab === 'errors' && (
                <div className="space-y-4">
                  {/* Error Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {errorSummary.total || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Errors</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {errorSummary.fixed || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Auto-Fixed</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {errorSummary.components?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Components Affected</div>
                    </div>
                  </div>

                  {/* Error Types */}
                  {errorSummary.byType && Object.keys(errorSummary.byType).length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                        Error Types
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(errorSummary.byType).map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getErrorTypeColor(type)}`}>
                                {type}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {type === 'framer-motion' && 'Framer Motion warnings'}
                                {type === 'css' && 'CSS animation issues'}
                                {type === 'performance' && 'Performance problems'}
                                {type === 'unknown' && 'Other animation errors'}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {count as number}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Errors */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Recent Errors
                      </h3>
                      <button
                        onClick={handleClearErrors}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {errorHandler.getRecentErrors().length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          No recent errors found
                        </div>
                      ) : (
                        errorHandler.getRecentErrors().slice(0, 10).map((error, index) => (
                          <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getErrorTypeColor(error.type)}`}>
                                    {error.type}
                                  </span>
                                  {error.component && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {error.component}
                                    </span>
                                  )}
                                  {error.fixed && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs">
                                      Fixed
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                  {error.message}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                {new Date(error.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="space-y-4">
                  {/* Performance Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {performanceReport.totalEntries || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Frames</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {performanceReport.longFrames || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Long Frames</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {performanceReport.averageDuration || '0'}ms
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Avg Duration</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {performanceReport.worstFrame || '0'}ms
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Worst Frame</div>
                    </div>
                  </div>

                  {/* Performance Status */}
                  <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Performance Status
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceStatus().color} ${getPerformanceStatus().bgColor}`}>
                        {getPerformanceStatus().status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {getPerformanceStatus().status === 'Good' && 'Animations are performing well with smooth frame rates.'}
                      {getPerformanceStatus().status === 'Fair' && 'Some performance issues detected. Consider reducing animation complexity.'}
                      {getPerformanceStatus().status === 'Poor' && 'Significant performance issues. Animations may be causing frame drops.'}
                    </div>
                  </div>

                  {/* Performance Tips */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Performance Tips
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Use transform and opacity for animations when possible</li>
                      <li>• Avoid animating layout properties (width, height, padding)</li>
                      <li>• Use will-change CSS property sparingly</li>
                      <li>• Consider reducing animation complexity on low-end devices</li>
                      <li>• Use AnimationBatcher to optimize multiple animations</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'config' && (
                <div className="space-y-4">
                  {/* Animation Settings */}
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Current Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Error Handling
                        </label>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {process.env.NODE_ENV === 'development' ? 'Enabled' : 'Disabled'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Performance Monitoring
                        </label>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {process.env.NODE_ENV === 'development' ? 'Enabled' : 'Disabled'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Debug Commands */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Debug Commands
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        window.animationErrorHandler.getErrors()
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Get all animation errors in console
                      </div>
                      <div className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        window.animationErrorHandler.clearErrors()
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Clear all stored errors
                      </div>
                    </div>
                  </div>

                  {/* Environment Info */}
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Environment
                    </h4>
                    <div className="text-sm space-y-1">
                      <div>Node Environment: <span className="font-mono">{process.env.NODE_ENV}</span></div>
                      <div>User Agent: <span className="font-mono text-xs">{navigator.userAgent}</span></div>
                      <div>Reduced Motion: <span className="font-mono">{window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'Yes' : 'No'}</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}

export default AnimationDebugger