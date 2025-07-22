import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownTrayIcon,
  XMarkIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ShareIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { usePWA, useAppUpdates } from '../../hooks/usePWA';
import { useMobileDetection } from '../../hooks/useMobileDetection';

export const PWAInstallPrompt: React.FC = () => {
  const { 
    isInstallable, 
    isInstalled, 
    isOnline, 
    isStandalone,
    canShare,
    hasNotificationPermission,
    installApp,
    shareContent,
    requestNotificationPermission
  } = usePWA();
  
  const { updateAvailable, isUpdating, applyUpdate } = useAppUpdates();
  const { isMobile, userAgent } = useMobileDetection();
  const [showPrompt, setShowPrompt] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);

  // Don't show if already installed or not installable
  if (isInstalled || isStandalone || !isInstallable || !showPrompt) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await installApp();
    
    if (success) {
      setShowPrompt(false);
    }
    
    setIsInstalling(false);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'BTCMiner - Multi-Chain DeFi Platform',
      text: 'Check out BTCMiner, the advanced multi-chain DeFi platform!',
      url: window.location.origin,
    };

    const shared = await shareContent(shareData);
    if (!shared) {
      // Fallback to copying URL
      try {
        await navigator.clipboard.writeText(window.location.origin);
        // You could show a toast notification here
      } catch (error) {
        console.error('Failed to copy URL:', error);
      }
    }
  };

  const handleNotificationPermission = async () => {
    await requestNotificationPermission();
  };

  return (
    <>
      {/* Update Available Banner */}
      <AnimatePresence>
        {updateAvailable && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-3"
          >
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center space-x-3">
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span className="text-sm font-medium">
                  App update available
                </span>
              </div>
              <button
                onClick={applyUpdate}
                disabled={isUpdating}
                className="bg-white text-blue-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Update'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install Prompt */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className={`fixed ${isMobile ? 'bottom-20' : 'bottom-4'} left-4 right-4 z-40`}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-w-md mx-auto">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    {isMobile ? (
                      <DevicePhoneMobileIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <ComputerDesktopIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Install BTCMiner
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get the full app experience
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowPrompt(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Works offline</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Fast loading</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Push notifications</span>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2 touch-manipulation"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span>{isInstalling ? 'Installing...' : 'Install'}</span>
                  </button>
                  
                  {canShare && (
                    <button
                      onClick={handleShare}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 touch-manipulation"
                    >
                      <ShareIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Notification permission prompt */}
                {!hasNotificationPermission && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleNotificationPermission}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 touch-manipulation"
                    >
                      <BellIcon className="h-4 w-4" />
                      <span>Enable notifications</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Platform-specific instructions */}
              {isMobile && userAgent.isIOS && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    On iOS: Tap the share button in Safari and select "Add to Home Screen"
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline indicator */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-16 left-4 right-4 z-40"
          >
            <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 max-w-md mx-auto">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  You're offline - some features may be limited
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Component for showing PWA status in settings
export const PWAStatus: React.FC = () => {
  const { 
    isInstalled, 
    isStandalone, 
    isOnline, 
    hasNotificationPermission,
    supportsPush,
    supportsBackgroundSync,
    canShare
  } = usePWA();

  const features = [
    {
      name: 'App Installation',
      status: isInstalled || isStandalone,
      description: 'App is installed and can run offline'
    },
    {
      name: 'Online Status',
      status: isOnline,
      description: 'Connected to the internet'
    },
    {
      name: 'Push Notifications',
      status: hasNotificationPermission && supportsPush,
      description: 'Can receive push notifications'
    },
    {
      name: 'Background Sync',
      status: supportsBackgroundSync,
      description: 'Can sync data when connection is restored'
    },
    {
      name: 'Native Sharing',
      status: canShare,
      description: 'Can use native share functionality'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Progressive Web App Status
      </h3>
      
      <div className="space-y-4">
        {features.map((feature) => (
          <div key={feature.name} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {feature.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
            
            <div className={`w-3 h-3 rounded-full ${
              feature.status ? 'bg-green-500' : 'bg-red-500'
            }`} />
          </div>
        ))}
      </div>
    </div>
  );
};