import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RocketLaunchIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  FireIcon,
  LinkIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline'
import AnimatedPage from '@components/common/AnimatedPage'
import AnimatedCounter from '@components/common/AnimatedCounter'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { useDeployment, ChainStatus, LogEntry } from '@hooks/useDeployment'

const Deployment: React.FC = () => {
  const {
    chains,
    logs,
    isDeploying,
    stats,
    startDeployment,
    resetDeployment
  } = useDeployment()

  // Copy contract address to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const getStatusIcon = (status: ChainStatus['status']) => {
    switch (status) {
      case 'success': return <CheckCircleIcon className="w-5 h-5 text-green-400" />
      case 'failed': return <XCircleIcon className="w-5 h-5 text-red-400" />
      case 'deploying': return <LoadingSpinner size="sm" />
      default: return <ClockIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      default: return 'ℹ️'
    }
  }

  return (
    <AnimatedPage>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-3 mb-4"
          >
            <RocketLaunchIcon className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Multi-Chain Deployment
            </h1>
          </motion.div>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time deployment monitoring across the blockchain multiverse
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Target Chains', value: stats.totalChains, icon: LinkIcon },
            { label: 'Successful', value: stats.successCount, icon: CheckCircleIcon },
            { label: 'Total Time', value: `${stats.totalTime}s`, icon: ClockIcon },
            { label: 'Total Gas Used', value: stats.totalGas.toLocaleString(), icon: FireIcon }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {typeof stat.value === 'number' && stat.label !== 'Total Time' ? (
                      <AnimatedCounter value={stat.value} decimals={0} />
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
                <stat.icon className="w-8 h-8 text-orange-500" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Deployment Controls */}
        <div className="flex justify-center space-x-4">
          <motion.button
            onClick={startDeployment}
            disabled={isDeploying}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              px-8 py-3 rounded-lg font-semibold flex items-center space-x-2
              ${isDeploying
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
              }
              transition-colors duration-200
            `}
          >
            {isDeploying ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Deploying...</span>
              </>
            ) : (
              <>
                <RocketLaunchIcon className="w-5 h-5" />
                <span>Start Deployment</span>
              </>
            )}
          </motion.button>

          <motion.button
            onClick={resetDeployment}
            disabled={isDeploying}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon className="w-5 h-5" />
            <span>Reset</span>
          </motion.button>
        </div>

        {/* Chains Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {chains.map((chain, index) => (
            <motion.div
              key={chain.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              {/* Chain Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{chain.emoji}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{chain.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{chain.status}</p>
                  </div>
                </div>
                {getStatusIcon(chain.status)}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-orange-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${chain.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Chain Details */}
              <div className="space-y-3">
                {chain.contractAddress && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Contract:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {chain.contractAddress.substring(0, 10)}...
                        </span>
                        <motion.button
                          onClick={() => copyToClipboard(chain.contractAddress!)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 text-gray-400 hover:text-orange-500 transition-colors"
                          title="Copy contract address"
                        >
                          <DocumentDuplicateIcon className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                    {chain.explorerUrl && (
                      <div className="flex justify-end">
                        <motion.a
                          href={chain.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.05 }}
                          className="text-xs text-orange-500 hover:text-orange-400 flex items-center space-x-1"
                        >
                          <LinkIcon className="w-3 h-3" />
                          <span>View on Explorer</span>
                        </motion.a>
                      </div>
                    )}
                  </div>
                )}
                {chain.gasUsed && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Gas Used:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{chain.gasUsed}</span>
                  </div>
                )}
                {chain.deploymentTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Deploy Time:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{chain.deploymentTime}s</span>
                  </div>
                )}
                {chain.status === 'failed' && (
                  <div className="flex items-center space-x-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600 dark:text-red-400">Deployment failed</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Logs */}
        <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <span>📋</span>
            <span>Deployment Logs</span>
          </h3>
          <div className="bg-black rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
            <AnimatePresence>
              {logs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`mb-2 ${log.type === 'success' ? 'text-green-400' :
                    log.type === 'error' ? 'text-red-400' :
                      log.type === 'warning' ? 'text-yellow-400' :
                        'text-blue-400'
                    }`}
                >
                  <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                  <span>{getLogIcon(log.type)} {log.message}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AnimatedPage>
  )
}

export default Deployment