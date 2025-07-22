import { useState, useEffect, useCallback } from 'react';

interface PWAInstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWACapabilities {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isStandalone: boolean;
  canShare: boolean;
  hasNotificationPermission: boolean;
  supportsPush: boolean;
  supportsBackgroundSync: boolean;
}

interface PWAActions {
  installApp: () => Promise<boolean>;
  shareContent: (data: ShareData) => Promise<boolean>;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  registerForPush: () => Promise<PushSubscription | null>;
  checkForUpdates: () => Promise<boolean>;
}

export const usePWA = (): PWACapabilities & PWAActions => {
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(
    'Notification' in window ? Notification.permission === 'granted' : false
  );

  // Check if app is running in standalone mode (installed)
  const isStandalone = 
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://');

  // Check for native sharing capability
  const canShare = 'share' in navigator;

  // Check for push notification support
  const supportsPush = 'serviceWorker' in navigator && 'PushManager' in window;

  // Check for background sync support
  const supportsBackgroundSync = 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype;

  // Listen for install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as PWAInstallPrompt);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Listen for online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check if app is already installed
  useEffect(() => {
    const checkInstallStatus = () => {
      // Check various indicators that the app might be installed
      const isInstalledPWA = 
        isStandalone ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        localStorage.getItem('pwa-installed') === 'true';
      
      setIsInstalled(isInstalledPWA);
    };

    checkInstallStatus();
  }, [isStandalone]);

  // Install the app
  const installApp = useCallback(async (): Promise<boolean> => {
    if (!installPrompt) {
      return false;
    }

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        localStorage.setItem('pwa-installed', 'true');
        setIsInstalled(true);
        setIsInstallable(false);
        setInstallPrompt(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error installing PWA:', error);
      return false;
    }
  }, [installPrompt]);

  // Share content using Web Share API
  const shareContent = useCallback(async (data: ShareData): Promise<boolean> => {
    if (!canShare) {
      return false;
    }

    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing content:', error);
      }
      return false;
    }
  }, [canShare]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      setHasNotificationPermission(permission === 'granted');
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }, []);

  // Register for push notifications
  const registerForPush = useCallback(async (): Promise<PushSubscription | null> => {
    if (!supportsPush || !hasNotificationPermission) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY, // You'll need to set this
      });

      return subscription;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }, [supportsPush, hasNotificationPermission]);

  // Check for app updates
  const checkForUpdates = useCallback(async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      
      return new Promise((resolve) => {
        const handleUpdateFound = () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                resolve(true);
              }
            });
          }
        };

        registration.addEventListener('updatefound', handleUpdateFound);
        
        // Clean up listener after a timeout
        setTimeout(() => {
          registration.removeEventListener('updatefound', handleUpdateFound);
          resolve(false);
        }, 5000);
      });
    } catch (error) {
      console.error('Error checking for updates:', error);
      return false;
    }
  }, []);

  return {
    // Capabilities
    isInstallable,
    isInstalled,
    isOnline,
    isStandalone,
    canShare,
    hasNotificationPermission,
    supportsPush,
    supportsBackgroundSync,
    
    // Actions
    installApp,
    shareContent,
    requestNotificationPermission,
    registerForPush,
    checkForUpdates,
  };
};

// Hook for managing app updates
export const useAppUpdates = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleUpdateFound = async () => {
      const registration = await navigator.serviceWorker.ready;
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        }
      });
    };

    handleUpdateFound();
  }, []);

  const applyUpdate = useCallback(async () => {
    if (!updateAvailable) return;

    setIsUpdating(true);
    
    try {
      const registration = await navigator.serviceWorker.ready;
      
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Listen for the controlling service worker change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });
      }
    } catch (error) {
      console.error('Error applying update:', error);
      setIsUpdating(false);
    }
  }, [updateAvailable]);

  return {
    updateAvailable,
    isUpdating,
    applyUpdate,
  };
};

// Hook for offline status and data sync
export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger background sync when coming back online
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then((registration) => {
          return registration.sync.register('background-sync');
        }).catch(console.error);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const queueForSync = useCallback(async (data: any) => {
    // Queue data for background sync when offline
    setPendingSync(true);
    
    try {
      // Store in IndexedDB or localStorage for later sync
      localStorage.setItem(`pending-sync-${Date.now()}`, JSON.stringify(data));
      
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('background-sync');
      }
    } catch (error) {
      console.error('Error queuing data for sync:', error);
    } finally {
      setPendingSync(false);
    }
  }, []);

  return {
    isOnline,
    pendingSync,
    queueForSync,
  };
};