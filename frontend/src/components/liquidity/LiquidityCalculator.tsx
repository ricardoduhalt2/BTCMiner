import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  CalculatorIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'

interface CalculationResult {
  liquidityValue: number
  tokenAAmount: number
  tokenBAmount: number
  shareOfPool: number
  estimatedAPY: number
  dailyRewards: number
  impermanentLoss: number
  breakEvenPrice: number
  riskScore: number
}

interface LiquidityCalculatorProps {
  tokenPairs?: Array<{
    id: string
    name: string
    tokenA: string
    tokenB: string
    priceA: number
    priceB: number
    poolLiquidity: number
    currentAPY: number
    volatility: number
  }>
}

const LiquidityCalculator: React.FC<LiquidityCalculatorProps> = ({
  tokenPairs = [
    {
      id: 'btm-eth',
      name: 'BTCMiner/ETH',
      tokenA: 'BTM',
      tokenB: 'ETH',
      priceA: 0.45,
      priceB: 2400,
      poolLiquidity: 2450000,
      currentAPY: 145.2,
      volatility: 0.35
    },
    {
      id: 'btm-bnb',
      name: 'BTCMiner/BNB',
      tokenA: 'BTM',
      tokenB: 'BNB',
      priceA: 0.45,
      priceB: 310,
      poolLiquidity: 1890000,
      currentAPY: 89.7,
      volatility: 0.28
    },
    {
      id: 'btm-base',
      name: 'BTCMiner/BASE',
      tokenA: 'BTM',
      tokenB: 'BASE',
      priceA: 0.45,
      priceB: 1.2,
      poolLiquidity: 890000,
      currentAPY: 234.8,
      volatility: 0.52
    }
  ]
}) => {
  const [selectedPair, setSelectedPair] = useState(tokenPairs[0])
  const [investmentAmount, setInvestmentAmount] = useState<string>('1000')
  const [timeHorizon, setTimeHorizon] = useState<number>(30) // days
  const [priceChangeA, setPriceChangeA] = useState<number>(0) // percentage
  const [priceChangeB, setPriceChangeB] = useState<number>(0) // percentage
  const [showAdvanced, setShowAdvanced] = useState(false)

  const calculation = useMemo((): CalculationResult => {
    const investment = parseFloat(investmentAmount) || 0
    if (investment <= 0) {
      return {
        liquidityValue: 0,
        tokenAAmount: 0,
        tokenBAmount: 0,
        shareOfPool: 0,
        estimatedAPY: 0,
        dailyRewards: 0,
        impermanentLoss: 0,
        breakEvenPrice: 0,
        riskScore: 0
      }
    }

    // Calculate token amounts for 50/50 split
    const halfInvestment = investment / 2
    const tokenAAmount = halfInvestment / selectedPair.priceA
    const tokenBAmount = halfInvestment / selectedPair.priceB

    // Calculate share of pool
    const shareOfPool = (investment / selectedPair.poolLiquidity) * 100

    // Calculate rewards
    const dailyAPY = selectedPair.currentAPY / 365
    const dailyRewards = (investment * dailyAPY) / 100

    // Calculate impermanent loss with price changes
    const newPriceA = selectedPair.priceA * (1 + priceChangeA / 100)
    const newPriceB = selectedPair.priceB * (1 + priceChangeB / 100)
    
    const priceRatio = (newPriceA / selectedPair.priceA) / (newPriceB / selectedPair.priceB)
    const impermanentLoss = (2 * Math.sqrt(priceRatio) / (1 + priceRatio) - 1) * 100

    // Calculate break-even price (simplified)
    const breakEvenPrice = selectedPair.priceA * (1 + (selectedPair.currentAPY / 100) * (timeHorizon / 365))

    // Risk score based on volatility and IL
    const riskScore = Math.min(100, (selectedPair.volatility * 100 + Math.abs(impermanentLoss)) / 2)

    return {
      liquidityValue: investment,
      tokenAAmount,
      tokenBAmount,
      shareOfPool,
      estimatedAPY: selectedPair.currentAPY,
      dailyRewards,
      impermanentLoss,
      breakEvenPrice,
      riskScore
    }
  }, [selectedPair, investmentAmount, timeHorizon, priceChangeA, priceChangeB])

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600 bg-green-100 dark:bg-green-900/20'
    if (score < 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
    return 'text-red-600 bg-red-100 dark:bg-red-900/20'
  }

  const getRiskLabel = (score: number) => {
    if (score < 30) return 'Low Risk'
    if (score < 60) return 'Medium Risk'
    return 'High Risk'
  }

  const projectedValue = useMemo(() => {
    const rewards = calculation.dailyRewards * timeHorizon
    const ilLoss = (calculation.liquidityValue * Math.abs(calculation.impermanentLoss)) / 100
    return calculation.liquidityValue + rewards - ilLoss
  }, [calculation, timeHorizon])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <CalculatorIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Liquidity Calculator
          </h3>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <AdjustmentsHorizontalIcon className="w-4 h-4" />
          <span>{showAdvanced ? 'Simple' : 'Advanced'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Token Pair
            </label>
            <select
              value={selectedPair.id}
              onChange={(e) => setSelectedPair(tokenPairs.find(p => p.id === e.target.value) || tokenPairs[0])}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {tokenPairs.map(pair => (
                <option key={pair.id} value={pair.id}>
                  {pair.name} (APY: {pair.currentAPY.toFixed(1)}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Investment Amount (USD)
            </label>
            <input
              type="number"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Horizon (Days)
            </label>
            <input
              type="range"
              min="1"
              max="365"
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1 day</span>
              <span className="font-medium">{timeHorizon} days</span>
              <span>1 year</span>
            </div>
          </div>

          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expected {selectedPair.tokenA} Price Change (%)
                </label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={priceChangeA}
                  onChange={(e) => setPriceChangeA(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {priceChangeA > 0 ? '+' : ''}{priceChangeA}%
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expected {selectedPair.tokenB} Price Change (%)
                </label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={priceChangeB}
                  onChange={(e) => setPriceChangeB(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {priceChangeB > 0 ? '+' : ''}{priceChangeB}%
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Position Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{selectedPair.tokenA} Amount:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {calculation.tokenAAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{selectedPair.tokenB} Amount:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {calculation.tokenBAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Pool Share:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {calculation.shareOfPool.toFixed(4)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h4 className="font-medium text-green-800 dark:text-green-300 mb-3">Rewards Projection</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-600 dark:text-green-400">Current APY:</span>
                <span className="font-medium text-green-800 dark:text-green-300">
                  {calculation.estimatedAPY.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600 dark:text-green-400">Daily Rewards:</span>
                <span className="font-medium text-green-800 dark:text-green-300">
                  ${calculation.dailyRewards.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600 dark:text-green-400">Total Rewards ({timeHorizon}d):</span>
                <span className="font-medium text-green-800 dark:text-green-300">
                  ${(calculation.dailyRewards * timeHorizon).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">Risk Analysis</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-yellow-600 dark:text-yellow-400">Impermanent Loss:</span>
                    <span className={`font-medium ${calculation.impermanentLoss < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {calculation.impermanentLoss.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-600 dark:text-yellow-400">Risk Score:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(calculation.riskScore)}`}>
                      {getRiskLabel(calculation.riskScore)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Projected Value */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3">Projection Summary</h4>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-sm text-blue-600 dark:text-blue-400">Initial</p>
                <p className="text-lg font-bold text-blue-800 dark:text-blue-300">
                  ${calculation.liquidityValue.toLocaleString()}
                </p>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div className="text-center">
                <p className="text-sm text-blue-600 dark:text-blue-400">After {timeHorizon} days</p>
                <p className={`text-lg font-bold ${
                  projectedValue > calculation.liquidityValue 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  ${projectedValue.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
              <div className="flex justify-between text-sm">
                <span className="text-blue-600 dark:text-blue-400">Net Profit/Loss:</span>
                <span className={`font-medium ${
                  projectedValue > calculation.liquidityValue 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {projectedValue > calculation.liquidityValue ? '+' : ''}
                  ${(projectedValue - calculation.liquidityValue).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Information Panel */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Important Notes</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Calculations are estimates based on current market conditions</li>
                <li>• Impermanent loss occurs when token prices diverge from initial ratio</li>
                <li>• APY rates can fluctuate based on pool utilization and market conditions</li>
                <li>• Consider gas fees for entering and exiting positions</li>
                <li>• Higher APY often correlates with higher risk</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiquidityCalculator