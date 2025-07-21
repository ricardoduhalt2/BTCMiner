import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AddLiquidityModalProps {
  isOpen: boolean
  onClose: () => void
}

const AddLiquidityModal: React.FC<AddLiquidityModalProps> = ({
  isOpen,
  onClose
}) => {
  const [step, setStep] = useState<'select' | 'amounts' | 'confirm'>('select')
  const [selectedChain, setSelectedChain] = useState<number>(1)
  const [tokenA, setTokenA] = useState('BTCM')
  const [tokenB, setTokenB] = useState('ETH')
  const [amountA, setAmountA] = useState('')
  const [amountB, setAmountB] = useState('')
  const [slippage, setSlippage] = useState(0.5)

  const chains = [
    { id: 1, name: 'Ethereum', icon: '⟠' },
    { id: 56, name: 'BSC', icon: '🟡' },
    { id: 137, name: 'Polygon', icon: '🟣' }
  ]

  const tokens = ['BTCM', 'ETH', 'BNB', 'USDC', 'USDT', 'MATIC']

  const handleNext = () => {
    if (step === 'select') setStep('amounts')
    else if (step === 'amounts') setStep('confirm')
  }

  const handleBack = () => {
    if (step === 'amounts') setStep('select')
    else if (step === 'confirm') setStep('amounts')
  }

  const handleConfirm = () => {
    // Here you would implement the actual liquidity addition logic
    console.log('Adding liquidity:', {
      chain: selectedChain,
      tokenA,
      tokenB,
      amountA,
      amountB,
      slippage
    })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Add Liquidity
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-2">
                {['select', 'amounts', 'confirm'].map((s, index) => (
                  <React.Fragment key={s}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === s 
                        ? 'bg-orange-500 text-white' 
                        : index < ['select', 'amounts', 'confirm'].indexOf(step)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {index < ['select', 'amounts', 'confirm'].indexOf(step) ? '✓' : index + 1}
                    </div>
                    {index < 2 && (
                      <div className={`w-8 h-0.5 ${
                        index < ['select', 'amounts', 'confirm'].indexOf(step)
                          ? 'bg-green-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              {step === 'select' && (
                <motion.div
                  key="select"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Chain
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {chains.map((chain) => (
                        <button
                          key={chain.id}
                          onClick={() => setSelectedChain(chain.id)}
                          className={`p-3 rounded-lg border-2 transition-colors ${
                            selectedChain === chain.id
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <div className="text-2xl mb-1">{chain.icon}</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {chain.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Token A
                      </label>
                      <select
                        value={tokenA}
                        onChange={(e) => setTokenA(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        {tokens.map((token) => (
                          <option key={token} value={token}>{token}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Token B
                      </label>
                      <select
                        value={tokenB}
                        onChange={(e) => setTokenB(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        {tokens.filter(t => t !== tokenA).map((token) => (
                          <option key={token} value={token}>{token}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 'amounts' && (
                <motion.div
                  key="amounts"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {tokenA} Amount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amountA}
                        onChange={(e) => setAmountA(e.target.value)}
                        placeholder="0.0"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 pr-16"
                      />
                      <div className="absolute right-3 top-2 text-sm text-gray-500">
                        {tokenA}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Balance: 1,234.56 {tokenA}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="inline-block p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                      ⇅
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {tokenB} Amount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amountB}
                        onChange={(e) => setAmountB(e.target.value)}
                        placeholder="0.0"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 pr-16"
                      />
                      <div className="absolute right-3 top-2 text-sm text-gray-500">
                        {tokenB}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Balance: 5.67 {tokenB}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Slippage Tolerance
                    </label>
                    <div className="flex space-x-2">
                      {[0.1, 0.5, 1.0].map((value) => (
                        <button
                          key={value}
                          onClick={() => setSlippage(value)}
                          className={`px-3 py-1 rounded text-sm ${
                            slippage === value
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {value}%
                        </button>
                      ))}
                      <input
                        type="number"
                        value={slippage}
                        onChange={(e) => setSlippage(parseFloat(e.target.value))}
                        className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        step="0.1"
                        min="0.1"
                        max="50"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 'confirm' && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Chain:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {chains.find(c => c.id === selectedChain)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Pair:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {tokenA}/{tokenB}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{tokenA} Amount:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {amountA} {tokenA}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{tokenB} Amount:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {amountB} {tokenB}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Slippage:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {slippage}%
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-500">◉</span>
                      <span className="text-sm text-blue-700 dark:text-blue-400">
                        You will receive LP tokens representing your share of the pool.
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex space-x-3 mt-6">
              {step !== 'select' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBack}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Back
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={step === 'confirm' ? handleConfirm : handleNext}
                disabled={
                  (step === 'amounts' && (!amountA || !amountB)) ||
                  (step === 'select' && (!tokenA || !tokenB))
                }
                className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200"
              >
                {step === 'confirm' ? 'Add Liquidity' : 'Next'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AddLiquidityModal