import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  CameraIcon,
  UserIcon,
  GlobeAltIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import { useAppDispatch } from '@hooks/redux'
import { addNotification } from '@store/slices/uiSlice'

interface VerificationStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  icon: React.ComponentType<any>
  required: boolean
  estimatedTime: string
}

interface VerificationLevel {
  id: 'basic' | 'verified' | 'premium'
  title: string
  description: string
  benefits: string[]
  requirements: string[]
  color: string
  bgColor: string
}

const IdentityVerification: React.FC = () => {
  const dispatch = useAppDispatch()
  const [currentLevel, setCurrentLevel] = useState<'basic' | 'verified' | 'premium'>('basic')
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([])
  const [isVerifying, setIsVerifying] = useState(false)
  const [selectedStep, setSelectedStep] = useState<string | null>(null)

  const verificationLevels: VerificationLevel[] = [
    {
      id: 'basic',
      title: 'Basic Identity',
      description: 'Basic Internet Identity authentication',
      benefits: [
        'Secure login with Internet Identity',
        'Basic wallet linking',
        'Standard transaction limits',
      ],
      requirements: [
        'Internet Identity account',
        'Email verification',
      ],
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    {
      id: 'verified',
      title: 'Verified Identity',
      description: 'Enhanced verification with additional security',
      benefits: [
        'All Basic benefits',
        'Higher transaction limits',
        'Priority customer support',
        'Advanced security features',
      ],
      requirements: [
        'Phone number verification',
        'Identity document verification',
        'Address verification',
      ],
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      id: 'premium',
      title: 'Premium Identity',
      description: 'Maximum security and premium features',
      benefits: [
        'All Verified benefits',
        'Unlimited transaction limits',
        'VIP customer support',
        'Early access to new features',
        'Reduced fees',
      ],
      requirements: [
        'All Verified requirements',
        'Biometric verification',
        'Enhanced KYC process',
        'Proof of funds',
      ],
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  useEffect(() => {
    const initializeVerificationSteps = () => {
      const steps: VerificationStep[] = [
        {
          id: 'email',
          title: 'Email Verification',
          description: 'Verify your email address for account security',
          status: 'completed',
          icon: DocumentTextIcon,
          required: true,
          estimatedTime: '2 minutes',
        },
        {
          id: 'phone',
          title: 'Phone Verification',
          description: 'Add and verify your phone number',
          status: currentLevel === 'basic' ? 'pending' : 'completed',
          icon: UserIcon,
          required: false,
          estimatedTime: '3 minutes',
        },
        {
          id: 'identity',
          title: 'Identity Document',
          description: 'Upload a government-issued ID',
          status: currentLevel === 'basic' ? 'pending' : currentLevel === 'verified' ? 'completed' : 'in_progress',
          icon: CameraIcon,
          required: false,
          estimatedTime: '5 minutes',
        },
        {
          id: 'address',
          title: 'Address Verification',
          description: 'Verify your residential address',
          status: currentLevel === 'premium' ? 'completed' : 'pending',
          icon: GlobeAltIcon,
          required: false,
          estimatedTime: '10 minutes',
        },
        {
          id: 'biometric',
          title: 'Biometric Verification',
          description: 'Complete biometric identity verification',
          status: currentLevel === 'premium' ? 'completed' : 'pending',
          icon: ShieldCheckIcon,
          required: false,
          estimatedTime: '15 minutes',
        },
      ]
      
      setVerificationSteps(steps)
    }

    initializeVerificationSteps()
  }, [currentLevel])

  const handleStartVerification = async (stepId: string) => {
    setIsVerifying(true)
    setSelectedStep(stepId)
    
    try {
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      setVerificationSteps(prev => 
        prev.map(step => 
          step.id === stepId 
            ? { ...step, status: 'completed' }
            : step
        )
      )
      
      dispatch(addNotification({
        type: 'success',
        message: 'Verification step completed successfully!'
      }))
      
      // Check if we can upgrade verification level
      const completedSteps = verificationSteps.filter(s => s.status === 'completed').length + 1
      if (completedSteps >= 3 && currentLevel === 'basic') {
        setCurrentLevel('verified')
        dispatch(addNotification({
          type: 'success',
          message: 'Congratulations! You\'ve been upgraded to Verified status!'
        }))
      } else if (completedSteps >= 5 && currentLevel === 'verified') {
        setCurrentLevel('premium')
        dispatch(addNotification({
          type: 'success',
          message: 'Congratulations! You\'ve achieved Premium status!'
        }))
      }
      
    } catch (error: any) {
      setVerificationSteps(prev => 
        prev.map(step => 
          step.id === stepId 
            ? { ...step, status: 'failed' }
            : step
        )
      )
      
      dispatch(addNotification({
        type: 'error',
        message: 'Verification failed. Please try again.'
      }))
    } finally {
      setIsVerifying(false)
      setSelectedStep(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'in_progress':
        return <ClockIcon className="h-5 w-5 text-yellow-500 animate-pulse" />
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in_progress':
        return 'In Progress'
      case 'failed':
        return 'Failed'
      default:
        return 'Pending'
    }
  }

  const getCurrentLevelData = () => {
    return verificationLevels.find(level => level.id === currentLevel)
  }

  const getNextLevelData = () => {
    const currentIndex = verificationLevels.findIndex(level => level.id === currentLevel)
    return currentIndex < verificationLevels.length - 1 
      ? verificationLevels[currentIndex + 1] 
      : null
  }

  const completedSteps = verificationSteps.filter(step => step.status === 'completed').length
  const totalSteps = verificationSteps.length
  const progressPercentage = (completedSteps / totalSteps) * 100

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Verification Status
          </h2>
          
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCurrentLevelData()?.bgColor} ${getCurrentLevelData()?.color}`}>
              {getCurrentLevelData()?.title}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Verification Progress</span>
            <span>{completedSteps}/{totalSteps} completed</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
              className="bg-primary-600 h-2 rounded-full"
            />
          </div>
        </div>

        {/* Current Level Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Current Benefits
            </h3>
            <ul className="space-y-2">
              {getCurrentLevelData()?.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {getNextLevelData() && (
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                Unlock with {getNextLevelData()?.title}
              </h3>
              <ul className="space-y-2">
                {getNextLevelData()?.benefits.slice(getCurrentLevelData()?.benefits.length || 0).map((benefit, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <StarIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Verification Steps */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Verification Steps
        </h2>
        
        <div className="space-y-4">
          {verificationSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border rounded-lg p-4 transition-colors ${
                step.status === 'completed'
                  ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                  : step.status === 'failed'
                  ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <step.icon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {step.title}
                      </h3>
                      {step.required && (
                        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {step.description}
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Estimated time: {step.estimatedTime}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(step.status)}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {getStatusText(step.status)}
                    </span>
                  </div>
                  
                  {step.status === 'pending' && (
                    <button
                      onClick={() => handleStartVerification(step.id)}
                      disabled={isVerifying}
                      className="px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isVerifying && selectedStep === step.id ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Verifying...</span>
                        </div>
                      ) : (
                        'Start Verification'
                      )}
                    </button>
                  )}
                  
                  {step.status === 'failed' && (
                    <button
                      onClick={() => handleStartVerification(step.id)}
                      disabled={isVerifying}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Verification Levels */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Verification Levels
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {verificationLevels.map((level) => (
            <div
              key={level.id}
              className={`border rounded-lg p-4 ${
                level.id === currentLevel
                  ? 'border-primary-300 bg-primary-50 dark:border-primary-700 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2 mb-3">
                <h3 className={`font-medium ${level.color}`}>
                  {level.title}
                </h3>
                {level.id === currentLevel && (
                  <CheckCircleIcon className="h-4 w-4 text-primary-600" />
                )}
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {level.description}
              </p>
              
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Requirements
                </h4>
                <ul className="space-y-1">
                  {level.requirements.map((requirement, index) => (
                    <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <ShieldCheckIcon className="h-5 w-5 text-blue-500 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <h3 className="font-medium mb-1">About Identity Verification</h3>
            <ul className="space-y-1 text-xs">
              <li>• Your personal information is encrypted and stored securely</li>
              <li>• Verification helps protect your account and enables higher limits</li>
              <li>• All verification steps are optional except for basic email verification</li>
              <li>• You can upgrade your verification level at any time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IdentityVerification