import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LinkIcon,
  LinkSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { useWalletConnection } from '@hooks/useWalletConnection'
import { useAppDispatch } from '@hooks/redux'
import { addNotification } from '@store/slices/uiSlice'

interface LinkedWallet {
  id: string
  type: 'metamask' | 'walletconnect' | 'phantom' | 'coinbase'
  address: string
  chainId: number
  chainName: string
  isVerified: boolean
  linkedAt: Date
  lastUsed: Date
  nickname?: string
}

const WalletLinking: React.FC = () => {
  const dispatch = useAppDispatch()
  const { connectedWallets, connectWallet, disconnectWallet } = useWalletConnection()
  const [linkedWallets, setLinkedWallets] = useState<LinkedWallet[]>([])
  const [isLinking, setIsLinking] = useState(false)
  const [selectedWalletType, setSelectedWalletType] = useState<string>('')

  // Mock linked wallets data
  useEffect(() => {
    const mockLinkedWallets: LinkedWallet[] = connectedWallets.map((wallet, index) => ({
      id: wallet.id,
      type: wallet.type as any,
      address: wallet.address,
      chainId: wallet.chainId,
      chainName: wallet.chainName,
      isVerified: index % 2 === 0, // Mock verification status
      linkedAt: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - index * 2 * 60 * 60 * 1000),
      nickname: index === 0 ? 'Main Wallet' : undefined,
    }))
    
    setLinkedWallets(mockLinkedWallets)
  }, [connectedWallets])

  const availableWalletTypes = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      description: 'Connect your MetaMask wallet',
      chains: ['Ethereum', 'BNB Chain', 'Base', 'Polygon'],
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      description: 'Connect via WalletConnect protocol',
      chains: ['Ethereum', 'BNB Chain', 'Base', 'Polygon'],
    },
    {
      id: 'phantom',
      name: 'Phantom',
      icon: '👻',
      description: 'Connect your Solana wallet',
      chains: ['Solana'],
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '🔵',
      description: 'Connect your Coinbase wallet',
      chains: ['Ethereum', 'Base'],
    },
  ]

  const handleLinkWallet = async (walletType: string) => {
    setIsLinking(true)
    setSelectedWalletType(walletType)
    
    try {
      await connectWallet(walletType as any)
      
      dispatch(addNotification({
        type: 'success',
        message: `${walletType.charAt(0).toUpperCase() + walletType.slice(1)} wallet linked successfully!`
      }))
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || `Failed to link ${walletType} wallet`
      }))
    } finally {
      setIsLinking(false)
      setSelectedWalletType('')
    }
  }

  const handleUnlinkWallet = async (walletId: string, walletType: string) => {
    try {
      await disconnectWallet(walletId)
      
      dispatch(addNotification({
        type: 'info',
        message: `${walletType.charAt(0).toUpperCase() + walletType.slice(1)} wallet unlinked`
      }))
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to unlink wallet'
      }))
    }
  }

  const handleVerifyWallet = async (walletId: string) => {
    try {
      // Mock verification process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setLinkedWallets(prev => 
        prev.map(wallet => 
          wallet.id === walletId 
            ? { ...wallet, isVerified: true }
            : wallet
        )
      )
      
      dispatch(addNotification({
        type: 'success',
        message: 'Wallet verified successfully!'
      }))
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to verify wallet'
      }))
    }
  }

  const handleUpdateNickname = (walletId: string, nickname: string) => {
    setLinkedWallets(prev => 
      prev.map(wallet => 
        wallet.id === walletId 
          ? { ...wallet, nickname }
          : wallet
      )
    )
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const getWalletIcon = (type: string) => {
    const wallet = availableWalletTypes.find(w => w.id === type)
    return wallet?.icon || '◆'
  }

  return (
    <div className="space-y-6">
      {/* Linked Wallets */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Linked Wallets ({linkedWallets.length})
          </h2>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {linkedWallets.filter(w => w.isVerified).length} verified
          </div>
        </div>

        {linkedWallets.length === 0 ? (
          <div className="text-center py-8">
            <LinkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No wallets linked
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Link your first wallet to start using BTCMiner across multiple chains
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {linkedWallets.map((wallet) => (
              <motion.div
                key={wallet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {getWalletIcon(wallet.type)}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {wallet.nickname || wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)}
                        </h3>
                        {wallet.isVerified ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatAddress(wallet.address)} • {wallet.chainName}
                      </div>
                      
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Linked {formatTimeAgo(wallet.linkedAt)} • Last used {formatTimeAgo(wallet.lastUsed)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!wallet.isVerified && (
                      <button
                        onClick={() => handleVerifyWallet(wallet.id)}
                        className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors flex items-center space-x-1"
                      >
                        <ShieldCheckIcon className="h-3 w-3" />
                        <span>Verify</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleUnlinkWallet(wallet.id, wallet.type)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Unlink wallet"
                    >
                      <LinkSlashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Nickname input */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400 w-16">
                      Nickname:
                    </label>
                    <input
                      type="text"
                      value={wallet.nickname || ''}
                      onChange={(e) => handleUpdateNickname(wallet.id, e.target.value)}
                      placeholder="Optional wallet nickname"
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Wallet */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Link New Wallet
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableWalletTypes.map((walletType) => {
            const isAlreadyLinked = linkedWallets.some(w => w.type === walletType.id)
            const isCurrentlyLinking = isLinking && selectedWalletType === walletType.id
            
            return (
              <motion.button
                key={walletType.id}
                onClick={() => !isAlreadyLinked && handleLinkWallet(walletType.id)}
                disabled={isAlreadyLinked || isLinking}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  isAlreadyLinked
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 cursor-not-allowed'
                    : isCurrentlyLinking
                    ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:bg-primary-50 dark:hover:border-primary-700 dark:hover:bg-primary-900/20'
                }`}
                whileHover={!isAlreadyLinked && !isLinking ? { scale: 1.02 } : {}}
                whileTap={!isAlreadyLinked && !isLinking ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {walletType.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {walletType.name}
                      </h3>
                      {isAlreadyLinked && (
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      )}
                      {isCurrentlyLinking && (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {walletType.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {walletType.chains.map((chain) => (
                        <span
                          key={chain}
                          className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                        >
                          {chain}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {isAlreadyLinked ? (
                      <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                        Linked
                      </span>
                    ) : isCurrentlyLinking ? (
                      <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                        Linking...
                      </span>
                    ) : (
                      <PlusIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Wallet Linking Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <LinkIcon className="h-5 w-5 text-blue-500 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <h3 className="font-medium mb-1">About Wallet Linking</h3>
            <ul className="space-y-1 text-xs">
              <li>• Linked wallets are associated with your Internet Identity</li>
              <li>• Verification adds an extra layer of security to your wallets</li>
              <li>• You can link multiple wallets from the same or different chains</li>
              <li>• Unlinked wallets can still be used but won't be associated with your identity</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalletLinking