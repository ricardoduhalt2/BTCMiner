import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  UserGroupIcon,
  CogIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { useAppDispatch } from '@hooks/redux'
import { addNotification } from '@store/slices/uiSlice'

interface PrivacySetting {
  id: string
  title: string
  description: string
  category: 'visibility' | 'data' | 'communication' | 'security'
  enabled: boolean
  icon: React.ComponentType<any>
  level: 'basic' | 'advanced'
}

interface DataRetentionSetting {
  id: string
  title: string
  description: string
  period: '30d' | '90d' | '1y' | 'forever'
  canDelete: boolean
}

const PrivacySettings: React.FC = () => {
  const dispatch = useAppDispatch()
  const [privacySettings, setPrivacySettings] = useState<PrivacySetting[]>([])
  const [dataRetentionSettings, setDataRetentionSettings] = useState<DataRetentionSetting[]>([])
  const [activeCategory, setActiveCategory] = useState<'all' | 'visibility' | 'data' | 'communication' | 'security'>('all')
  const [isExporting, setIsExporting] = useState(false)
  const [isDeletingData, setIsDeletingData] = useState(false)

  useEffect(() => {
    const initializeSettings = () => {
      const settings: PrivacySetting[] = [
        // Visibility Settings
        {
          id: 'profile_visibility',
          title: 'Profile Visibility',
          description: 'Control who can see your profile information',
          category: 'visibility',
          enabled: false,
          icon: EyeIcon,
          level: 'basic',
        },
        {
          id: 'wallet_visibility',
          title: 'Wallet Address Visibility',
          description: 'Show wallet addresses in your public profile',
          category: 'visibility',
          enabled: false,
          icon: EyeSlashIcon,
          level: 'basic',
        },
        {
          id: 'transaction_visibility',
          title: 'Transaction History Visibility',
          description: 'Allow others to view your transaction history',
          category: 'visibility',
          enabled: false,
          icon: GlobeAltIcon,
          level: 'advanced',
        },
        
        // Data Settings
        {
          id: 'analytics_tracking',
          title: 'Analytics Tracking',
          description: 'Allow collection of usage analytics to improve the platform',
          category: 'data',
          enabled: true,
          icon: CogIcon,
          level: 'basic',
        },
        {
          id: 'personalized_ads',
          title: 'Personalized Recommendations',
          description: 'Use your data to provide personalized recommendations',
          category: 'data',
          enabled: false,
          icon: UserGroupIcon,
          level: 'basic',
        },
        {
          id: 'third_party_sharing',
          title: 'Third-Party Data Sharing',
          description: 'Share anonymized data with trusted partners',
          category: 'data',
          enabled: false,
          icon: GlobeAltIcon,
          level: 'advanced',
        },
        
        // Communication Settings
        {
          id: 'marketing_emails',
          title: 'Marketing Emails',
          description: 'Receive emails about new features and promotions',
          category: 'communication',
          enabled: true,
          icon: InformationCircleIcon,
          level: 'basic',
        },
        {
          id: 'security_notifications',
          title: 'Security Notifications',
          description: 'Receive notifications about security events',
          category: 'communication',
          enabled: true,
          icon: ShieldCheckIcon,
          level: 'basic',
        },
        
        // Security Settings
        {
          id: 'login_notifications',
          title: 'Login Notifications',
          description: 'Get notified when someone logs into your account',
          category: 'security',
          enabled: true,
          icon: ShieldCheckIcon,
          level: 'basic',
        },
        {
          id: 'device_tracking',
          title: 'Device Tracking',
          description: 'Track devices used to access your account',
          category: 'security',
          enabled: true,
          icon: CogIcon,
          level: 'advanced',
        },
      ]
      
      const dataRetention: DataRetentionSetting[] = [
        {
          id: 'transaction_history',
          title: 'Transaction History',
          description: 'How long to keep your transaction records',
          period: 'forever',
          canDelete: false,
        },
        {
          id: 'login_logs',
          title: 'Login Logs',
          description: 'Security logs of account access',
          period: '1y',
          canDelete: true,
        },
        {
          id: 'analytics_data',
          title: 'Analytics Data',
          description: 'Usage patterns and behavior data',
          period: '90d',
          canDelete: true,
        },
        {
          id: 'communication_logs',
          title: 'Communication Logs',
          description: 'Records of emails and notifications sent',
          period: '30d',
          canDelete: true,
        },
      ]
      
      setPrivacySettings(settings)
      setDataRetentionSettings(dataRetention)
    }

    initializeSettings()
  }, [])

  const handleToggleSetting = (settingId: string) => {
    setPrivacySettings(prev => 
      prev.map(setting => 
        setting.id === settingId 
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    )
    
    dispatch(addNotification({
      type: 'success',
      message: 'Privacy setting updated successfully'
    }))
  }

  const handleUpdateRetentionPeriod = (settingId: string, period: '30d' | '90d' | '1y' | 'forever') => {
    setDataRetentionSettings(prev => 
      prev.map(setting => 
        setting.id === settingId 
          ? { ...setting, period }
          : setting
      )
    )
    
    dispatch(addNotification({
      type: 'success',
      message: 'Data retention period updated'
    }))
  }

  const handleExportData = async () => {
    setIsExporting(true)
    
    try {
      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      dispatch(addNotification({
        type: 'success',
        message: 'Your data export has been prepared and will be sent to your email'
      }))
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to export data. Please try again.'
      }))
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteData = async (dataType: string) => {
    setIsDeletingData(true)
    
    try {
      // Simulate data deletion
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      dispatch(addNotification({
        type: 'success',
        message: `${dataType} data has been deleted successfully`
      }))
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to delete data. Please try again.'
      }))
    } finally {
      setIsDeletingData(false)
    }
  }

  const categories = [
    { id: 'all', label: 'All Settings', count: privacySettings.length },
    { id: 'visibility', label: 'Visibility', count: privacySettings.filter(s => s.category === 'visibility').length },
    { id: 'data', label: 'Data Usage', count: privacySettings.filter(s => s.category === 'data').length },
    { id: 'communication', label: 'Communication', count: privacySettings.filter(s => s.category === 'communication').length },
    { id: 'security', label: 'Security', count: privacySettings.filter(s => s.category === 'security').length },
  ]

  const filteredSettings = activeCategory === 'all' 
    ? privacySettings 
    : privacySettings.filter(setting => setting.category === activeCategory)

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '30d': return '30 days'
      case '90d': return '90 days'
      case '1y': return '1 year'
      case 'forever': return 'Forever'
      default: return period
    }
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Privacy & Data Settings
        </h2>
        
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id as any)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeCategory === category.id
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category.label}
              <span className="ml-2 px-2 py-0.5 text-xs bg-white dark:bg-gray-800 rounded-full">
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
          Privacy Controls
        </h3>
        
        <div className="space-y-4">
          {filteredSettings.map((setting, index) => (
            <motion.div
              key={setting.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <setting.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {setting.title}
                    </h4>
                    {setting.level === 'advanced' && (
                      <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 rounded">
                        Advanced
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {setting.description}
                  </p>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <button
                  onClick={() => handleToggleSetting(setting.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    setting.enabled
                      ? 'bg-primary-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      setting.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Data Retention Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
          Data Retention
        </h3>
        
        <div className="space-y-4">
          {dataRetentionSettings.map((setting, index) => (
            <motion.div
              key={setting.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {setting.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {setting.description}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <select
                  value={setting.period}
                  onChange={(e) => handleUpdateRetentionPeriod(setting.id, e.target.value as any)}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="30d">30 days</option>
                  <option value="90d">90 days</option>
                  <option value="1y">1 year</option>
                  <option value="forever">Forever</option>
                </select>
                
                {setting.canDelete && (
                  <button
                    onClick={() => handleDeleteData(setting.title)}
                    disabled={isDeletingData}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                    title="Delete this data"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Data Export & Deletion */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
          Data Management
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <ArrowDownTrayIcon className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                Export Your Data
              </h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Download a copy of all your personal data stored in our system.
            </p>
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Preparing Export...</span>
                </div>
              ) : (
                'Export Data'
              )}
            </button>
          </div>
          
          <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <TrashIcon className="h-5 w-5 text-red-600" />
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                Delete Account
              </h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Permanently delete your account and all associated data.
            </p>
            <button className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors">
              Request Account Deletion
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <h3 className="font-medium mb-1">Privacy & Data Protection</h3>
            <ul className="space-y-1 text-xs">
              <li>• We use industry-standard encryption to protect your data</li>
              <li>• You have full control over your privacy settings</li>
              <li>• Data retention periods can be customized based on your preferences</li>
              <li>• You can export or delete your data at any time</li>
              <li>• We never sell your personal information to third parties</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacySettings