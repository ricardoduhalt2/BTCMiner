import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMobileDetection } from '../../hooks/useMobileDetection';
import { useMobilePerformance } from '../../hooks/useMobilePerformance';
import { initializeMobileOptimizations } from '../../utils/mobileOptimizations';

interface MobileOptimizationContextType {
  isMobile: boolean;
  isOptimized: boolean;
  performanceLevel: 'high' | 'medium' | 'low';
  shouldReduceAnimations: boolean;
  shouldOptimizeImages: boolean;
  shouldLimitUpdates: boolean;
}

const MobileOptimizationContext = createContext<MobileOptimizationContextType | undefined>(undefined);

interface MobileOptimizationProviderProps {
  children: React.ReactNode;
}

export const MobileOptimizationProvider: React.FC<MobileOptimizationProviderProps> = ({ children }) => {
  const { isMobile } = useMobileDetection();
  const { metrics, optimizations } = useMobilePerformance();
  const [isOptimized, setIsOptimized] = useState(false);
  const [performanceLevel, setPerformanceLevel] = useState<'high' | 'medium' | 'low'>('high');

  // Initialize mobile optimizations
  useEffect(() => {
    if (isMobile) {
      initializeMobileOptimizations();
      setIsOptimized(true);
    }
  }, [isMobile]);

  // Determine performance level based on metrics
  useEffect(() => {
    const { fps, memoryUsage, networkSpeed, batteryLevel } = metrics;
    
    let level: 'high' | 'medium' | 'low' = 'high';
    
    if (
      fps < 30 ||
      memoryUsage > 0.8 ||
      networkSpeed === 'slow-2g' ||
      networkSpeed === '2g' ||
      (batteryLevel && batteryLevel < 20)
    ) {
      level = 'low';
    } else if (
      fps < 45 ||
      memoryUsage > 0.6 ||
      networkSpeed === '3g' ||
      (batteryLevel && batteryLevel < 50)
    ) {
      level = 'medium';
    }
    
    setPerformanceLevel(level);
  }, [metrics]);

  // Apply CSS custom properties based on optimization level
  useEffect(() => {
    const root = document.documentElement;
    
    if (performanceLevel === 'low') {
      root.style.setProperty('--animation-duration', '0.1s');
      root.style.setProperty('--transition-duration', '0.1s');
      root.style.setProperty('--blur-amount', '0px');
      root.style.setProperty('--shadow-intensity', '0.1');
    } else if (performanceLevel === 'medium') {
      root.style.setProperty('--animation-duration', '0.2s');
      root.style.setProperty('--transition-duration', '0.2s');
      root.style.setProperty('--blur-amount', '2px');
      root.style.setProperty('--shadow-intensity', '0.3');
    } else {
      root.style.setProperty('--animation-duration', '0.3s');
      root.style.setProperty('--transition-duration', '0.3s');
      root.style.setProperty('--blur-amount', '8px');
      root.style.setProperty('--shadow-intensity', '0.5');
    }
  }, [performanceLevel]);

  const contextValue: MobileOptimizationContextType = {
    isMobile,
    isOptimized,
    performanceLevel,
    shouldReduceAnimations: optimizations.shouldReduceAnimations,
    shouldOptimizeImages: optimizations.shouldOptimizeImages,
    shouldLimitUpdates: optimizations.shouldLimitUpdates,
  };

  return (
    <MobileOptimizationContext.Provider value={contextValue}>
      {children}
    </MobileOptimizationContext.Provider>
  );
};

export const useMobileOptimization = (): MobileOptimizationContextType => {
  const context = useContext(MobileOptimizationContext);
  if (context === undefined) {
    throw new Error('useMobileOptimization must be used within a MobileOptimizationProvider');
  }
  return context;
};

// HOC for components that need mobile optimization
export const withMobileOptimization = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { shouldReduceAnimations, shouldLimitUpdates, performanceLevel } = useMobileOptimization();
    
    const optimizedProps = {
      ...props,
      shouldReduceAnimations,
      shouldLimitUpdates,
      performanceLevel,
    };
    
    return <Component {...optimizedProps} />;
  };
};