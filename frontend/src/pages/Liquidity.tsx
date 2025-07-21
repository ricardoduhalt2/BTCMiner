import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppSelector, useAppDispatch } from '../hooks/redux'
import { setPositions, setTotalLiquidity, setLoading } from '../store/slices/liquiditySlice'
import LiquidityOverview from '../components/liquidity/LiquidityOverview'
import LiquidityPositions from '../components/liquidity/LiquidityPositions'
import LiquidityPools from '../components/liquidity/LiquidityPools'
import AddLiquidityModal from '../components/liquidity/AddLiquidityModal'
import { LiquidityPosition, LiquidityPool } from '../types/liquidity'

const Liquidity: React.FC = () => {
  const dispatch = useAppDispatch()
  const { positions, totalLiquidity, isLoading } = useAppSelector(state => state.liquidity)
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'positions' | 'pools'>('overview')

  // Mock data - replace with real API calls
  const mockPositions: LiquidityPosition[] = [
    {
      id: '1',
      chainId: 1,
      poolAddress: '0x123...',
      tokenA: 'BTCM',
      tokenB: 'ETH',
      liquidity: '1250.50',
      share: 0.025,
      apy: 12.5,
      rewards: '15.75',
      impermanentLoss: -2.3,
      createdAt: '2024-01-15T00:00:00.000Z'
    },
    {
      id: '2',
      chainId: 56,
      poolAddress: '0x456...',
      tokenA: 'BTCM',
      tokenB: 'BNB',
      liquidity: '850.25',
      share: 0.018,
      apy: 18.2,
      rewards: '22.40',
      impermanentLoss: 1.8,
      createdAt: '2024-01-20T00:00:00.000Z'
    }
  ]

  const mockPools: LiquidityPool[] = [
    {
      chainId: 1,
      address: '0x123...',
      totalLiquidity: '2500000',
      availableLiquidity: '1800000',
      utilizationRate: 72,
      apy: 12.5,
      healthScore: 85,
      warningLevel: 'normal',
      lastRebalance: '2024-01-25T00:00:00.000Z'
    },
    {
      chainId: 56,
      address: '0x456...',
      totalLiquidity: '1200000',
      availableLiquidity: '400000',
      utilizationRate: 88,
      apy: 18.2,
      healthScore: 65,
      warningLevel: 'low',
      lastRebalance: '2024-01-24T00:00:00.000Z'
    }
  ]

  useEffect(() => {
    // Simulate loading data
    dispatch(setLoading(true))
    setTimeout(() => {
      dispatch(setPositions(mockPositions))
      dispatch(setTotalLiquidity(2100.75))
      dispatch(setLoading(false))
    }, 1000)
  }, [dispatch])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '▦' },
    { id: 'positions', label: 'My Positions', icon: '◇' },
    { id: 'pools', label: 'Pools', icon: '≋' }
  ]

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
            Liquidity Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your liquidity positions across multiple chains
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          + Add Liquidity
        </motion.button>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border-b border-gray-200 dark:border-gray-700"
      >
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </motion.div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <LiquidityOverview 
            positions={mockPositions}
            pools={mockPools}
            totalLiquidity={totalLiquidity}
            isLoading={isLoading}
          />
        )}
        {activeTab === 'positions' && (
          <LiquidityPositions 
            positions={mockPositions}
            isLoading={isLoading}
          />
        )}
        {activeTab === 'pools' && (
          <LiquidityPools 
            pools={mockPools}
            isLoading={isLoading}
          />
        )}
      </motion.div>

      {/* Add Liquidity Modal */}
      {showAddModal && (
        <AddLiquidityModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}

export default Liquidity