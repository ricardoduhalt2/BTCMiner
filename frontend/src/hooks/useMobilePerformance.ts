import { useState, useEffect, useCallback } from 'react';
import { useMobileDetection } from './useMobileDetection';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  fps: number;
  networkSpeed: string;
  batteryLevel?: number;
  isLowPowerMode?: boolean;
}

interface PerformanceOptimizations {
  shouldReduceAnimations: boolean;
  shouldOptimizeImages: boolean;
  shouldLimitUpdates: boolean;
  shouldUseSimpleComponents: boolean;
}

export const useMobilePerformance = () => {
  const { isMobile, userAgent } = useMobileDetection();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    fps: 60,
    networkSpeed: 'unknown',
  });
  const [optimizations, setOptimizations] = useState<PerformanceOptimizations>({
    shouldReduceAnimations: false,
    shouldOptimizeImages: false,
    shouldLimitUpdates: false,
    shouldUseSimpleComponents: false,
  });

  // Monitor FPS
  const monitorFPS = useCallback(() => {
    let frames = 0;
    let lastTime = performance.now();
    
    const countFrames = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        setMetrics(prev => ({ ...prev, fps }));
        
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(countFrames);
    };
    
    requestAnimationFrame(countFrames);
  }, []);

  // Monitor memory usage
  const monitorMemory = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      setMetrics(prev => ({ ...prev, memoryUsage }));
    }
  }, []);

  // Monitor network conditions
  const monitorNetwork = useCallback(() => {
    const connection = (navigator as any).connection;
    if (connection) {
      const networkSpeed = connection.effectiveType || 'unknown';
      setMetrics(prev => ({ ...prev, networkSpeed }));
    }
  }, []);

  // Monitor battery status
  const monitorBattery = useCallback(async () => {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        setMetrics(prev => ({
          ...prev,
          batteryLevel: battery.level * 100,
          isLowPowerMode: battery.level < 0.2,
        }));
        
        // Listen for battery changes
        battery.addEventListener('levelchange', () => {
          setMetrics(prev => ({
            ...prev,
            batteryLevel: battery.level * 100,
            isLowPowerMode: battery.level < 0.2,
          }));
        });
      } catch (error) {
        console.warn('Battery API not available:', error);
      }
    }
  }, []);

  // Calculate performance optimizations
  const calculateOptimizations = useCallback(() => {
    const { fps, memoryUsage, networkSpeed, isLowPowerMode, batteryLevel } = metrics;
    
    const shouldReduceAnimations = 
      fps < 30 || 
      memoryUsage > 0.8 || 
      isLowPowerMode ||
      (batteryLevel && batteryLevel < 20) ||
      networkSpeed === 'slow-2g' ||
      networkSpeed === '2g';

    const shouldOptimizeImages = 
      networkSpeed === 'slow-2g' || 
      networkSpeed === '2g' || 
      memoryUsage > 0.7;

    const shouldLimitUpdates = 
      fps < 45 || 
      memoryUsage > 0.6 || 
      isLowPowerMode;

    const shouldUseSimpleComponents = 
      fps < 20 || 
      memoryUsage > 0.9 || 
      (batteryLevel && batteryLevel < 10);

    setOptimizations({
      shouldReduceAnimations,
      shouldOptimizeImages,
      shouldLimitUpdates,
      shouldUseSimpleComponents,
    });
  }, [metrics]);

  // Measure page load time
  useEffect(() => {
    const measureLoadTime = () => {
      if (performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        setMetrics(prev => ({ ...prev, loadTime }));
      }
    };

    if (document.readyState === 'complete') {
      measureLoadTime();
    } else {
      window.addEventListener('load', measureLoadTime);
      return () => window.removeEventListener('load', measureLoadTime);
    }
  }, []);

  // Initialize monitoring on mobile devices
  useEffect(() => {
    if (isMobile) {
      monitorFPS();
      monitorBattery();
      
      // Monitor memory and network periodically
      const interval = setInterval(() => {
        monitorMemory();
        monitorNetwork();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isMobile, monitorFPS, monitorMemory, monitorNetwork, monitorBattery]);

  // Recalculate optimizations when metrics change
  useEffect(() => {
    calculateOptimizations();
  }, [calculateOptimizations]);

  // Performance optimization functions
  const optimizeForLowEnd = useCallback(() => {
    // Disable non-essential animations
    document.documentElement.style.setProperty('--animation-duration', '0.1s');
    document.documentElement.style.setProperty('--transition-duration', '0.1s');
    
    // Reduce image quality
    document.documentElement.classList.add('low-performance');
    
    // Limit concurrent network requests
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.active?.postMessage({ 
          type: 'OPTIMIZE_PERFORMANCE',
          level: 'low-end'
        });
      });
    }
  }, []);

  const optimizeForBattery = useCallback(() => {
    // Reduce update frequency
    document.documentElement.style.setProperty('--update-frequency', '2s');
    
    // Disable background processes
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.active?.postMessage({ 
          type: 'BATTERY_OPTIMIZATION',
          enabled: true
        });
      });
    }
  }, []);

  const optimizeForNetwork = useCallback(() => {
    const { networkSpeed } = metrics;
    
    if (networkSpeed === 'slow-2g' || networkSpeed === '2g') {
      // Disable auto-refresh
      document.documentElement.classList.add('slow-network');
      
      // Reduce image quality
      document.documentElement.style.setProperty('--image-quality', '50');
      
      // Limit real-time updates
      document.documentElement.style.setProperty('--realtime-updates', 'disabled');
    }
  }, [metrics]);

  // Auto-optimize based on conditions
  useEffect(() => {
    if (optimizations.shouldReduceAnimations || optimizations.shouldUseSimpleComponents) {
      optimizeForLowEnd();
    }
    
    if (metrics.isLowPowerMode || (metrics.batteryLevel && metrics.batteryLevel < 20)) {
      optimizeForBattery();
    }
    
    if (optimizations.shouldOptimizeImages) {
      optimizeForNetwork();
    }
  }, [optimizations, metrics, optimizeForLowEnd, optimizeForBattery, optimizeForNetwork]);

  return {
    metrics,
    optimizations,
    isMobile,
    userAgent,
    optimizeForLowEnd,
    optimizeForBattery,
    optimizeForNetwork,
  };
};

// Hook for component-level performance optimization
export const useComponentPerformance = (componentName: string) => {
  const { optimizations } = useMobilePerformance();
  const [renderCount, setRenderCount] = useState(0);
  const [lastRenderTime, setLastRenderTime] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    setRenderCount(prev => prev + 1);
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      setLastRenderTime(renderTime);
      
      // Log slow renders in development
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    };
  });

  const shouldOptimize = optimizations.shouldUseSimpleComponents || optimizations.shouldLimitUpdates;

  return {
    renderCount,
    lastRenderTime,
    shouldOptimize,
    shouldReduceAnimations: optimizations.shouldReduceAnimations,
    shouldLimitUpdates: optimizations.shouldLimitUpdates,
  };
};