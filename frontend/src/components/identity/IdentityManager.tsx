import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  UserCircleIcon,
  ShieldCheckIcon,
  LinkIcon,
  CogIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { useAppDispatch, useAppSelector } from '@hooks/redux'
import { useWalletConnection } from '@hooks/useWalletConnection'
import { addNotification } from '@store/slices/uiSlice'
import WalletLinking from './WalletLinking'
import IdentityVerification from './IdentityVerification'
import PrivacySettings from './PrivacySettings'
import IdentityRecovery from './IdentityRecovery'

interface IdentityProfile {
  principal: string
  alias?: string
  createdAt: Date
  lastLoginAt: Date
  verificationLevel: 'basic' | 'verified' | 'premium'
  linkedWallets: number
  recoveryMethods: number
}

interface IdentityManagerProps {
  onClose?: () => void
}

const IdentityManager: React.FC<IdentityManagerProps> = ({ onClose }) => {
  const dispatch = useAppDispatch()
  const { connectedWallets } = useWalletConnection()
  const [activeTab, setActiveTab] = useState<'profile' | 'wallets' | 'verification' | 'privacy' | 'recovery'>('profile')
  const [isLoading, setIsLoading] = useState(true)
  const [identityProfile, setIdentityProfile] = useState<IdentityProfile | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // Mock identity profile data
  useEffect(() => {
    const loadIdentityProfile = async () => {
      setIsLoading(true)
      try {
        // Simulate API call to get identity profile
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const mockProfile: IdentityProfile = {
          principal: 'rdmx6-jaaaa-aaaah-qacaa-cai',
          alias: 'BTCMiner User',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          verificationLevel: 'verified',
          linkedWallets: connectedWallets.length,
          recoveryMethods: 2,
        }
        
        setIdentityProfile(mockProfile)
      } catch (error) {
        console.error('Failed to load identity profile:', error)
        dispatch(addNotification({
          type: 'error',
          message: 'Failed to load identity profile'
        }))
      } finally {
        setIsLoading(false)
      }
    }

    loadIdentityProfile()
  }, [dispatch, connectedWallets.length])

  const handleConnectIdentity = async () => {
    setIsConnecting(true)
    try {
      // Simulate Internet Identity connection
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      dispatch(addNotification({
        type: 'success',
        message: 'Successfully connected to Internet Identity!'
      }))
      
      // Reload profile after connection
      const mockProfile: IdentityProfile = {
        principal: 'rdmx6-jaaaa-aaaah-qacaa-cai',
        alias: 'New BTCMiner User',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        verificationLevel: 'basic',
        linkedWallets: 0,
        recoveryMethods: 1,
      }
      
      setIdentityProfile(mockProfile)
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Failed to connect to Internet Identity'
      }))
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnectIdentity = async () => {
    try {
      // Simulate disconnection
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIdentityProfile(null)
      dispatch(addNotification({
        type: 'info',
        message: 'Disconnected from Internet Identity'
      }))
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to disconnect from Internet Identity'
      }))
    }
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

  const getVerificationBadge = (level: string) => {
    switch (level) {
      case 'basic':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            <UserCircleIcon className="w-3 h-3 mr-1" />
            Basic
          </span>
        )
      case 'verified':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Verified
          </span>
        )
      case 'premium':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
            <ShieldCheckIcon className="w-3 h-3 mr-1" />
            Premium
          </span>
        )
      default:
        return null
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserCircleIcon },
    { id: 'wallets', label: 'Wallets', icon: LinkIcon },
    { id: 'verification', label: 'Verification', icon: ShieldCheckIcon },
    { id: 'privacy', label: 'Privacy', icon: CogIcon },
    { id: 'recovery', label: 'Recovery', icon: KeyIcon },
  ] as const

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!identityProfile) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserCircleIcon className="h-8 w-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Connect Your Digital Identity
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Use Internet Identity to create a secure, unified identity across all blockchain networks. 
            Link your wallets and manage your digital presence with enhanced security.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <ShieldCheckIcon className="w-4 h-4 text-green-500" />
              <span>Secure Authentication</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <LinkIcon className="w-4 h-4 text-blue-500" />
              <span>Multi-Chain Linking</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <KeyIcon className="w-4 h-4 text-purple-500" />
              <span>Recovery Options</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <CogIcon className="w-4 h-4 text-gray-500" />
              <span>Privacy Controls</span>
            </div>
          </div>
          
          <button
            onClick={handleConnectIdentity}
            disabled={isConnecting}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <UserCircleIcon className="w-5 h-5" />
                <span>Connect Internet Identity</span>
              </>
            )}
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <UserCircleIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {identityProfile.alias || 'BTCMiner Identity'}
                </h1>
                {getVerificationBadge(identityProfile.verificationLevel)}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Principal: {identityProfile.principal}
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                Last login: {formatTimeAgo(identityProfile.lastLoginAt)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {identityProfile.linkedWallets} Wallets Linked
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {identityProfile.recoveryMethods} Recovery Methods
              </div>
            </div>
            
            <button
              onClick={handleDisconnectIdentity}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Disconnect Identity"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6"
      >
        <div className="flex space-x-1 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Profile Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={identityProfile.alias || ''}
                  onChange={(e) => setIdentityProfile(prev => prev ? { ...prev, alias: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter display name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Principal ID
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                  <code className="text-sm text-gray-600 dark:text-gray-400">
                    {identityProfile.principal}
                  </code>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Created
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {identityProfile.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verification Level
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                  {getVerificationBadge(identityProfile.verificationLevel)}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'wallets' && <WalletLinking />}
        {activeTab === 'verification' && <IdentityVerification />}
        {activeTab === 'privacy' && <PrivacySettings />}
        {activeTab === 'recovery' && <IdentityRecovery />}
      </motion.div>
    </div>
  )
}

export default IdentityManager