import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CurrencyDollarIcon,
  FireIcon,
  ClockIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  StarIcon,
  PlusIcon,
  MinusIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface FarmingPool {
  id: string
  name: string
  tokenPair: string
  chainId: number
  chainName: string
  apy: number
  tvl: string
  rewards: string[]
  multiplier: number
  duration: string
  isActive: boolean
  isNew: boolean
  isHot: boolean
  userStaked?: string
  userRewards?: string
  minimumStake: string
  lockPeriod: number // in days
  riskLevel: 'low' | 'medium' | 'high'
}

interface YieldFarmingProps {
  isLoading?: boolean
  onStake?: (poolId: string, amount: string) => Promise<void>
  onUnstake?: (poolId: string, amount: string) => Promise<void>
  onClaimRewards?: (poolId: string) => Promise<void>
}

const YieldFarming: React.FC<YieldFarmingProps> = ({
  isLoading = false,
  onStake,
  onUnstake,
  onClaimRewards
}) => {
  const [farmingPools, setFarmingPools] = useState<FarmingPool[]>([
    {
      id: 'btm-eth-1',
      name: 'BTCMiner-ETH LP',
      tokenPair: 'BTM/ETH',
      chainId: 1,
      chainName: 'Ethereum',
      apy: 145.2,
      tvl: '2,450,000',
      rewards: ['BTM', 'ETH'],
      multiplier: 2.5,
      duration: '30 days',
      isActive: true,
      isNew: true,
      isHot: true,
      userStaked: '1,250.00',
      userRewards: '45.67',
      minimumStake: '100',
      lockPeriod: 7,
      riskLevel: 'medium'
    },
    {
      id: 'btm-bnb-1',
      name: 'BTCMiner-BNB LP',
      tokenPair: 'BTM/BNB',
      chainId: 56,
      chainName: 'BNB Chain',
      apy: 89.7,
      tvl: '1,890,000',
      rewards: ['BTM', 'BNB'],
      multiplier: 1.8,
      duration: '60 days',
      isActive: true,
      isNew: false,
      isHot: true,
      minimumStake: '50',
      lockPeriod: 14,
      riskLevel: 'low'
    },
    {
      id: 'btm-base-1',
      name: 'BTCMiner-BASE LP',
      tokenPair: 'BTM/BASE',
      chainId: 8453,
      chainName: 'Base',
      apy: 234.8,
      tvl: '890,000',
      rewards: ['BTM', 'BASE'],
      multiplier: 3.2,
      duration: '14 days',
      isActive: true,
      isNew: true,
      isHot: true,
      minimumStake: '25',
      lockPeriod: 3,
      riskLevel: 'high'
    },
    {
      id: 'btm-sol-1',
      name: 'BTCMiner-SOL LP',
      tokenPair: 'BTM/SOL',
      chainId: 101,
      chainName: 'Solana',
      apy: 67.3,
      tvl: '1,200,000',
      rewards: ['BTM', 'SOL'],
      multiplier: 1.5,
      duration: '90 days',
      isActive: true,
      isNew: false,
      isHot: false,
      userStaked: '850.00',
      userRewards: '23.45',
      minimumStake: '10',
      lockPeriod: 30,
      riskLevel: 'low'
    }
  ])

  const [selectedPool, setSelectedPool] = useState<FarmingPool | null>(null)
  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const [isStaking, setIsStaking] = useState(false)
  const [isUnstaking, setIsUnstaking] = useState(false)
  const [isClaiming, setIsClaiming] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'apy' | 'tvl' | 'rewards'>('apy')
  const [filterChain, setFilterChain] = useState<number | null>(null)

  const sortedPools = [...farmingPools].sort((a, b) => {
    switch (sortBy) {
      case 'apy': return b.apy - a.apy
      case 'tvl': return parseFloat(b.tvl.replace(/,/g, '')) - parseFloat(a.tvl.replace(/,/g, ''))
      case 'rewards': return b.rewards.length - a.rewards.length
      default: return 0
    }
  })

  const filteredPools = filterChain 
    ? sortedPools.filter(pool => pool.chainId === filterChain)
    : sortedPools

  const totalStaked = farmingPools
    .filter(pool => pool.userStaked)
    .reduce((sum, pool) => sum + parseFloat(pool.userStaked!.replace(/,/g, '')), 0)

  const totalRewards = farmingPools
    .filter(pool => pool.userRewards)
    .reduce((sum, pool) => sum + parseFloat(pool.userRewards!.replace(/,/g, '')), 0)

  const handleStake = async () => {
    if (!selectedPool || !stakeAmount || !onStake) return
    
    setIsStaking(true)
    try {
      await onStake(selectedPool.id, stakeAmount)
      setStakeAmount('')
      setSelectedPool(null)
    } catch (error) {
      console.error('Staking failed:', error)
    } finally {
      setIsStaking(false)
    }
  }

  const handleUnstake = async () => {
    if (!selectedPool || !unstakeAmount || !onUnstake) return
    
    setIsUnstaking(true)
    try {
      await onUnstake(selectedPool.id, unstakeAmount)
      setUnstakeAmount('')
      setSelectedPool(null)
    } catch (error) {
      console.error('Unstaking failed:', error)
    } finally {
      setIsUnstaking(false)
    }
  }

  const handleClaimRewards = async (poolId: string) => {
    if (!onClaimRewards) return
    
    setIsClaiming(poolId)
    try {
      await onClaimRewards(poolId)
    } catch (error) {
      console.error('Claiming rewards failed:', error)
    } finally {
      setIsClaiming(null)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getChainLogo = (chainId: number) => {
    const logos: Record<number, string> = {
      1: '🔷', // Ethereum
      56: '🟡', // BNB
      8453: '🔵', // Base
      101: '🟣' // Solana
    }
    return logos[chainId] || '⚪'
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Yield Farming
        </h3>
        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'apy' | 'tvl' | 'rewards')}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="apy">Sort by APY</option>
            <option value="tvl">Sort by TVL</option>
            <option value="rewards">Sort by Rewards</option>
          </select>
          <select
            value={filterChain || ''}
            onChange={(e) => setFilterChain(e.target.value ? parseInt(e.target.value) : null)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Chains</option>
            <option value="1">Ethereum</option>
            <option value="56">BNB Chain</option>
            <option value="8453">Base</option>
            <option value="101">Solana</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Total Staked</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${totalStaked.toLocaleString()}
              </p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">Pending Rewards</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${totalRewards.toFixed(2)}
              </p>
            </div>
            <TrophyIcon className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Active Farms</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {farmingPools.filter(p => p.userStaked).length}
              </p>
            </div>
            <FireIcon className="w-8 h-8 text-purple-500" />
          </div>
        </motion.div>
      </div>

      {/* Farming Pools */}
      <div className="space-y-4">
        {filteredPools.map((pool, index) => (
          <motion.div
            key={pool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{getChainLogo(pool.chainId)}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {pool.name}
                      </h4>
                      {pool.isNew && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                          NEW
                        </span>
                      )}
                      {pool.isHot && (
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full flex items-center space-x-1">
                          <FireIcon className="w-3 h-3" />
                          <span>HOT</span>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {pool.chainName} • {pool.tokenPair}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">APY</p>
                    <p className="font-bold text-green-600 dark:text-green-400 text-lg">
                      {pool.apy.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">TVL</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      ${pool.tvl}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Multiplier</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {pool.multiplier}x
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Lock Period</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {pool.lockPeriod} days
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Risk</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(pool.riskLevel)}`}>
                      {pool.riskLevel.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Rewards:</span>
                    <div className="flex items-center space-x-1">
                      {pool.rewards.map((reward, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                          {reward}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                    <ClockIcon className="w-4 h-4" />
                    <span>{pool.duration}</span>
                  </div>
                </div>

                {pool.userStaked && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Stake</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          ${pool.userStaked}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pending Rewards</p>
                        <p className="font-medium text-green-600 dark:text-green-400">
                          ${pool.userRewards}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                {pool.userStaked ? (
                  <>
                    <button
                      onClick={() => handleClaimRewards(pool.id)}
                      disabled={isClaiming === pool.id}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
                    >
                      {isClaiming === pool.id ? 'Claiming...' : 'Claim'}
                    </button>
                    <button
                      onClick={() => setSelectedPool(pool)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm"
                    >
                      Manage
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setSelectedPool(pool)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                  >
                    Stake
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stake/Unstake Modal */}
      {selectedPool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {selectedPool.name}
              </h3>
              <button
                onClick={() => setSelectedPool(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Pool Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>APY: <span className="font-medium text-green-600">{selectedPool.apy}%</span></div>
                  <div>Lock: <span className="font-medium">{selectedPool.lockPeriod} days</span></div>
                  <div>Min Stake: <span className="font-medium">${selectedPool.minimumStake}</span></div>
                  <div>Risk: <span className={`font-medium ${selectedPool.riskLevel === 'high' ? 'text-red-600' : selectedPool.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>{selectedPool.riskLevel}</span></div>
                </div>
              </div>

              {/* Stake Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stake Amount
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    onClick={handleStake}
                    disabled={!stakeAmount || isStaking}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isStaking ? 'Staking...' : 'Stake'}
                  </button>
                </div>
              </div>

              {/* Unstake Section (if user has stake) */}
              {selectedPool.userStaked && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Unstake Amount (Current: ${selectedPool.userStaked})
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      placeholder="Enter amount"
                      max={selectedPool.userStaked?.replace(/,/g, '')}
                      className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                    <button
                      onClick={handleUnstake}
                      disabled={!unstakeAmount || isUnstaking}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {isUnstaking ? 'Unstaking...' : 'Unstake'}
                    </button>
                  </div>
                </div>
              )}

              {/* Warning for high risk pools */}
              {selectedPool.riskLevel === 'high' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <InformationCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800 dark:text-red-300 mb-1">High Risk Pool</h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        This pool has higher volatility and potential for impermanent loss. Only stake what you can afford to lose.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default YieldFarming