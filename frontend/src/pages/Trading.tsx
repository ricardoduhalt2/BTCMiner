import React, { useState } from 'react'
import { motion } from 'framer-motion'
import TradingInterface from '../components/trading/TradingInterface'
import ArbitrageExecutor from '../components/trading/ArbitrageExecutor'
import PortfolioRebalancer from '../components/trading/PortfolioRebalancer'
import DCAStrategy from '../components/trading/DCAStrategy'
import RiskManagement from '../components/trading/RiskManagement'
import TradingHistory from '../components/trading/TradingHistory'

const Trading: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trading' | 'arbitrage' | 'rebalance' | 'dca' | 'risk' | 'history'>('trading')

  const tabs = [
    { id: 'trading', label: 'Trading Interface', icon: '📊' },
    { id: 'arbitrage', label: 'Arbitrage', icon: '⚡' },
    { id: 'rebalance', label: 'Rebalancing', icon: '⚖️' },
    { id: 'dca', label: 'DCA Strategy', icon: '📅' },
    { id: 'risk', label: 'Risk Management', icon: '🛡️' },
    { id: 'history', label: 'Trading History', icon: '📈' }
  ]

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'trading':
        return <TradingInterface />
      case 'arbitrage':
        return <ArbitrageExecutor />
      case 'rebalance':
        return <PortfolioRebalancer />
      case 'dca':
        return <DCAStrategy />
      case 'risk':
        return <RiskManagement />
      case 'history':
        return <TradingHistory />
      default:
        return <TradingInterface />
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Advanced Trading
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive trading tools for BTCMiner ecosystem
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Active Component */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {renderActiveComponent()}
      </motion.div>
    </div>
  )
}

export default Trading