import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline'

interface Network {
  id: number
  name: string
  symbol: string
  color: string
}

const NetworkSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState<Network>({
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    color: 'bg-blue-500'
  })

  const networks: Network[] = [
    { id: 1, name: 'Ethereum', symbol: 'ETH', color: 'bg-blue-500' },
    { id: 56, name: 'BNB Chain', symbol: 'BNB', color: 'bg-yellow-500' },
    { id: 8453, name: 'Base', symbol: 'BASE', color: 'bg-blue-600' },
    { id: 137, name: 'Polygon', symbol: 'MATIC', color: 'bg-purple-600' },
    { id: 42161, name: 'Arbitrum', symbol: 'ARB', color: 'bg-blue-400' },
    { id: 10, name: 'Optimism', symbol: 'OP', color: 'bg-red-500' },
  ]

  const handleSelect = (network: Network) => {
    setSelectedNetwork(network)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
      >
        <div className={`w-3 h-3 rounded-full ${selectedNetwork.color}`}></div>
        <span className="text-sm font-medium text-gray-700">
          {selectedNetwork.name}
        </span>
        <ChevronDownIcon className="h-4 w-4 text-gray-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
          >
            {networks.map((network) => (
              <button
                key={network.id}
                onClick={() => handleSelect(network)}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${network.color}`}></div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {network.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {network.symbol}
                    </div>
                  </div>
                </div>
                {selectedNetwork.id === network.id && (
                  <CheckIcon className="h-4 w-4 text-primary-600" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NetworkSelector