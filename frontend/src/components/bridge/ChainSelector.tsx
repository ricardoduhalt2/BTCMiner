import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline'

interface Chain {
  id: number
  name: string
  symbol: string
  iconUrl: string
  color: string
}

interface ChainSelectorProps {
  chains: Chain[]
  selectedChain: Chain | null
  onSelect: (chain: Chain) => void
  balance?: string
  label: string
}

const ChainSelector: React.FC<ChainSelectorProps> = ({
  chains,
  selectedChain,
  onSelect,
  balance,
  label
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (chain: Chain) => {
    onSelect(chain)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
      >
        {selectedChain ? (
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full ${selectedChain.color} flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">
                {selectedChain.name.charAt(0)}
              </span>
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {selectedChain.name}
              </div>
              {balance && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Balance: {parseFloat(balance).toFixed(4)} {selectedChain.symbol}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-400">
            Select {label.toLowerCase()} chain
          </div>
        )}
        
        <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-60 overflow-y-auto"
          >
            {chains.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No chains available. Connect more wallets to see options.
              </div>
            ) : (
              <div className="py-2">
                {chains.map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => handleSelect(chain)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full ${chain.color} flex items-center justify-center`}>
                        <span className="text-white font-bold text-sm">
                          {chain.name.charAt(0)}
                        </span>
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {chain.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {chain.symbol}
                        </div>
                      </div>
                    </div>
                    
                    {selectedChain?.id === chain.id && (
                      <CheckIcon className="h-5 w-5 text-primary-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ChainSelector