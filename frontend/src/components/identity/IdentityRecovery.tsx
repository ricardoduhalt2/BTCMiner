import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  KeyIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { useAppDispatch } from '@hooks/redux'
import { addNotification } from '@store/slices/uiSlice'

interface RecoveryMethod {
  id: string
  type: 'email' | 'phone' | 'recovery_phrase' | 'backup_device' | 'trusted_contact'
  title: string
  description: string
  value: string
  isVerified: boolean
  isPrimary: boolean
  createdAt: Date
  lastUsed?: Date
  icon: React.ComponentType<any>
}

interface RecoveryAttempt {
  id: string
  method: string
  timestamp: Date
  status: 'success' | 'failed' | 'pending'
  ipAddress: string
  location: string
}

const IdentityRecovery: React.FC = () => {
  const dispatch = useAppDispatch()
  const [recoveryMethods, setRecoveryMethods] = useState<RecoveryMethod[]>([])
  const [recoveryAttempts, setRecoveryAttempts] = useState<RecoveryAttempt[]>([])
  const [isAddingMethod, setIsAddingMethod] = useState(false)
  const [selectedMethodType, setSelectedMethodType] = useState<string>('')
  const [newMethodValue, setNewMethodValue] = useState('')
  const [isGeneratingPhrase, setIsGeneratingPhrase] = useState(false)
  const [recoveryPhrase, setRecoveryPhrase] = useState<string[]>([])
  const [showRecoveryPhrase, setShowRecoveryPhrase] = useState(false)

  const availableMethodTypes = [
    {
      id: 'email',
      title: 'Email Address',
      description: 'Receive recovery codes via email',
      icon: EnvelopeIcon,
      placeholder: 'Enter email address',
    },
    {
      id: 'phone',
      title: 'Phone Number',
      description: 'Receive recovery codes via SMS',
      icon: DevicePhoneMobileIcon,
      placeholder: 'Enter phone number',
    },
    {
      id: 'recovery_phrase',
      title: 'Recovery Phrase',
      description: '12-word recovery phrase for account restoration',
      icon: DocumentTextIcon,
      placeholder: 'Generate recovery phrase',
    },
    {
      id: 'backup_device',
      title: 'Backup Device',
      description: 'Register a backup device for recovery',
      icon: ShieldCheckIcon,
      placeholder: 'Register current device',
    },
    {
      id: 'trusted_contact',
      title: 'Trusted Contact',
      description: 'Designate a trusted contact for account recovery',
      icon: KeyIcon,
      placeholder: 'Enter contact email',
    },
  ]

  useEffect(() => {
    const initializeRecoveryMethods = () => {
      const methods: RecoveryMethod[] = [
        {
          id: '1',
          type: 'email',
          title: 'Primary Email',
          description: 'Recovery codes sent to this email',
          value: 'user@example.com',
          isVerified: true,
          isPrimary: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          icon: EnvelopeIcon,
        },
        {
          id: '2',
          type: 'phone',
          title: 'Mobile Phone',
          description: 'SMS recovery codes',
          value: '+1 (555) 123-4567',
          isVerified: true,
          isPrimary: false,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          icon: DevicePhoneMobileIcon,
        },
      ]
      
      const attempts: RecoveryAttempt[] = [
        {
          id: '1',
          method: 'Email',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: 'success',
          ipAddress: '192.168.1.1',
          location: 'New York, US',
        },
        {
          id: '2',
          method: 'SMS',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          status: 'failed',
          ipAddress: '10.0.0.1',
          location: 'Unknown',
        },
      ]
      
      setRecoveryMethods(methods)
      setRecoveryAttempts(attempts)
    }

    initializeRecoveryMethods()
  }, [])

  const handleAddRecoveryMethod = async () => {
    if (!selectedMethodType || (!newMethodValue && selectedMethodType !== 'recovery_phrase' && selectedMethodType !== 'backup_device')) {
      dispatch(addNotification({
        type: 'error',
        message: 'Please fill in all required fields'
      }))
      return
    }

    setIsAddingMethod(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const methodType = availableMethodTypes.find(m => m.id === selectedMethodType)
      if (!methodType) return
      
      let value = newMethodValue
      if (selectedMethodType === 'backup_device') {
        value = 'Current Device (Chrome on Windows)'
      } else if (selectedMethodType === 'recovery_phrase') {
        value = 'Generated 12-word phrase'
      }
      
      const newMethod: RecoveryMethod = {
        id: Date.now().toString(),
        type: selectedMethodType as any,
        title: methodType.title,
        description: methodType.description,
        value,
        isVerified: selectedMethodType === 'backup_device',
        isPrimary: false,
        createdAt: new Date(),
        icon: methodType.icon,
      }
      
      setRecoveryMethods(prev => [...prev, newMethod])
      setSelectedMethodType('')
      setNewMethodValue('')
      
      dispatch(addNotification({
        type: 'success',
        message: `${methodType.title} added successfully!`
      }))
      
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to add recovery method'
      }))
    } finally {
      setIsAddingMethod(false)
    }
  }

  const handleRemoveRecoveryMethod = async (methodId: string) => {
    try {
      setRecoveryMethods(prev => prev.filter(method => method.id !== methodId))
      
      dispatch(addNotification({
        type: 'info',
        message: 'Recovery method removed'
      }))
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to remove recovery method'
      }))
    }
  }

  const handleSetPrimary = async (methodId: string) => {
    try {
      setRecoveryMethods(prev => 
        prev.map(method => ({
          ...method,
          isPrimary: method.id === methodId
        }))
      )
      
      dispatch(addNotification({
        type: 'success',
        message: 'Primary recovery method updated'
      }))
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to update primary method'
      }))
    }
  }

  const handleVerifyMethod = async (methodId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setRecoveryMethods(prev => 
        prev.map(method => 
          method.id === methodId 
            ? { ...method, isVerified: true }
            : method
        )
      )
      
      dispatch(addNotification({
        type: 'success',
        message: 'Recovery method verified successfully!'
      }))
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to verify recovery method'
      }))
    }
  }

  const handleGenerateRecoveryPhrase = async () => {
    setIsGeneratingPhrase(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate mock recovery phrase
      const words = [
        'abandon', 'ability', 'able', 'about', 'above', 'absent',
        'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident'
      ]
      
      setRecoveryPhrase(words)
      setShowRecoveryPhrase(true)
      
      dispatch(addNotification({
        type: 'success',
        message: 'Recovery phrase generated successfully!'
      }))
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to generate recovery phrase'
      }))
    } finally {
      setIsGeneratingPhrase(false)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case 'failed':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Recovery Methods */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recovery Methods ({recoveryMethods.length})
          </h2>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {recoveryMethods.filter(m => m.isVerified).length} verified
          </div>
        </div>

        {recoveryMethods.length === 0 ? (
          <div className="text-center py-8">
            <KeyIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No recovery methods set up
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Add recovery methods to secure your account and enable account recovery
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recoveryMethods.map((method) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <method.icon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {method.title}
                        </h3>
                        {method.isPrimary && (
                          <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 rounded">
                            Primary
                          </span>
                        )}
                        {method.isVerified ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {method.value}
                      </div>
                      
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Added {formatTimeAgo(method.createdAt)}
                        {method.lastUsed && ` • Last used ${formatTimeAgo(method.lastUsed)}`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!method.isVerified && (
                      <button
                        onClick={() => handleVerifyMethod(method.id)}
                        className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
                      >
                        Verify
                      </button>
                    )}
                    
                    {!method.isPrimary && method.isVerified && (
                      <button
                        onClick={() => handleSetPrimary(method.id)}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        Set Primary
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleRemoveRecoveryMethod(method.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove recovery method"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Recovery Method */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Add Recovery Method
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recovery Method Type
            </label>
            <select
              value={selectedMethodType}
              onChange={(e) => setSelectedMethodType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select a recovery method</option>
              {availableMethodTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.title}
                </option>
              ))}
            </select>
          </div>
          
          {selectedMethodType && selectedMethodType !== 'recovery_phrase' && selectedMethodType !== 'backup_device' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {availableMethodTypes.find(t => t.id === selectedMethodType)?.title}
              </label>
              <input
                type={selectedMethodType === 'email' ? 'email' : selectedMethodType === 'phone' ? 'tel' : 'text'}
                value={newMethodValue}
                onChange={(e) => setNewMethodValue(e.target.value)}
                placeholder={availableMethodTypes.find(t => t.id === selectedMethodType)?.placeholder}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          )}
          
          {selectedMethodType === 'recovery_phrase' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">
                    <h3 className="font-medium mb-1">Important Security Notice</h3>
                    <p>Your recovery phrase is the master key to your account. Store it securely and never share it with anyone.</p>
                  </div>
                </div>
              </div>
              
              {!showRecoveryPhrase ? (
                <button
                  onClick={handleGenerateRecoveryPhrase}
                  disabled={isGeneratingPhrase}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {isGeneratingPhrase ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating...</span>
                    </div>
                  ) : (
                    'Generate Recovery Phrase'
                  )}
                </button>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Your Recovery Phrase
                  </h4>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {recoveryPhrase.map((word, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded"
                      >
                        <span className="text-xs text-gray-500 w-4">{index + 1}.</span>
                        <span className="text-sm font-mono">{word}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Write down these words in order and store them in a safe place.
                  </div>
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={handleAddRecoveryMethod}
            disabled={isAddingMethod || !selectedMethodType}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isAddingMethod ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                <span>Add Recovery Method</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recovery Attempts Log */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Recent Recovery Attempts
        </h2>
        
        {recoveryAttempts.length === 0 ? (
          <div className="text-center py-8">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No recovery attempts
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Recovery attempts will appear here for security monitoring
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recoveryAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(attempt.status)}
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {attempt.method} Recovery
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {attempt.location} • {attempt.ipAddress}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimeAgo(attempt.timestamp)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recovery Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <KeyIcon className="h-5 w-5 text-blue-500 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <h3 className="font-medium mb-1">Account Recovery Best Practices</h3>
            <ul className="space-y-1 text-xs">
              <li>• Set up multiple recovery methods for better security</li>
              <li>• Keep your recovery phrase in a secure, offline location</li>
              <li>• Verify all recovery methods to ensure they work when needed</li>
              <li>• Regularly review and update your recovery methods</li>
              <li>• Never share your recovery information with anyone</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IdentityRecovery