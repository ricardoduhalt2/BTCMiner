import { useState, useEffect } from 'react';

interface SystemPreferences {
  prefersReducedMotion: boolean;
  prefersColorScheme: 'light' | 'dark' | 'no-preference';
  prefersHighContrast: boolean;
  connectionType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  saveData: boolean;
  deviceMemory: number;
  hardwareConcurrency: number;
  maxTouchPoints: number;
  isOnline: boolean;
  batteryLevel?: number;
  isCharging?: boolean;
}

export const useSystemPreferences = (): SystemPreferences => {
  const [preferences, setPreferences] = useState<SystemPreferences>({
    prefersReducedMotion: false,
    prefersColorScheme: 'no-preference',
    prefersHighContrast: false,
    connectionType: 'unknown',
    saveData: false,
    deviceMemory: 4,
    hardwareConcurrency: 4,
    maxTouchPoints: 0,
    isOnline: navigator.onLine,
  });

  useEffect(() => {
    const updatePreferences = () => {
      // Media queries for system preferences
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

      let prefersColorScheme: SystemPreferences['prefersColorScheme'] = 'no-preference';
      if (prefersDark) prefersColorScheme = 'dark';
      else if (prefersLight) prefersColorScheme = 'light';

      // Network information
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      const connectionType = connection?.effectiveType || 'unknown';
      const saveData = connection?.saveData || false;

      // Device capabilities
      const deviceMemory = (navigator as any).deviceMemory || 4;
      const hardwareConcurrency = navigator.hardwareConcurrency || 4;
      const maxTouchPoints = navigator.maxTouchPoints || 0;

      setPreferences(prev => ({
        ...prev,
        prefersReducedMotion,
        prefersColorScheme,
        prefersHighContrast,
        connectionType,
        saveData,
        deviceMemory,
        hardwareConcurrency,
        maxTouchPoints,
        isOnline: navigator.onLine,
      }));
    };

    // Initial update
    updatePreferences();

    // Listen for changes
    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-color-scheme: dark)'),
      window.matchMedia('(prefers-color-scheme: light)'),
      window.matchMedia('(prefers-contrast: high)'),
    ];

    mediaQueries.forEach(mq => mq.addEventListener('change', updatePreferences));

    // Listen for online/offline changes
    window.addEventListener('online', updatePreferences);
    window.addEventListener('offline', updatePreferences);

    // Listen for connection changes
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updatePreferences);
    }

    // Battery API (if available)
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBattery = () => {
          setPreferences(prev => ({
            ...prev,
            batteryLevel: battery.level,
            isCharging: battery.charging,
          }));
        };

        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      });
    }

    // Cleanup
    return () => {
      mediaQueries.forEach(mq => mq.removeEventListener('change', updatePreferences));
      window.removeEventListener('online', updatePreferences);
      window.removeEventListener('offline', updatePreferences);
      
      const connection = (navigator as any).connection;
      if (connection) {
        connection.removeEventListener('change', updatePreferences);
      }
    };
  }, []);

  return preferences;
};

// Utility hooks for specific preferences
export const usePrefersReducedMotion = (): boolean => {
  const { prefersReducedMotion } = useSystemPreferences();
  return prefersReducedMotion;
};

export const usePrefersColorScheme = (): 'light' | 'dark' | 'no-preference' => {
  const { prefersColorScheme } = useSystemPreferences();
  return prefersColorScheme;
};

export const useConnectionType = (): string => {
  const { connectionType } = useSystemPreferences();
  return connectionType;
};

export const useSaveData = (): boolean => {
  const { saveData } = useSystemPreferences();
  return saveData;
};

export const useIsOnline = (): boolean => {
  const { isOnline } = useSystemPreferences();
  return isOnline;
};

export const useBatteryInfo = (): { level?: number; isCharging?: boolean } => {
  const { batteryLevel, isCharging } = useSystemPreferences();
  return { level: batteryLevel, isCharging };
};