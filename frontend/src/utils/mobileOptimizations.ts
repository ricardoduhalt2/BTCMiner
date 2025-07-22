/**
 * Mobile Performance Optimizations
 * Utilities for optimizing performance on mobile devices
 */

// Debounce function for touch events
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Optimize images for mobile
export const optimizeImageForMobile = (src: string, isMobile: boolean): string => {
  if (!isMobile) return src;
  
  // Add mobile-specific image parameters
  const url = new URL(src, window.location.origin);
  url.searchParams.set('w', '800'); // Max width for mobile
  url.searchParams.set('q', '80'); // Quality optimization
  url.searchParams.set('f', 'webp'); // Modern format
  
  return url.toString();
};

// Preload critical resources
export const preloadCriticalResources = () => {
  const criticalResources = [
    '/logoBTCMINER.png',
    '/manifest.json',
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.png') ? 'image' : 'fetch';
    document.head.appendChild(link);
  });
};

// Optimize touch events for better responsiveness
export const optimizeTouchEvents = () => {
  // Add passive event listeners for better scroll performance
  const passiveEvents = ['touchstart', 'touchmove', 'wheel'];
  
  passiveEvents.forEach(event => {
    document.addEventListener(event, () => {}, { passive: true });
  });

  // Prevent zoom on double tap for better UX
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = new Date().getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
};

// Memory management for mobile devices
export const optimizeMemoryUsage = () => {
  // Clear unused images from memory
  const clearUnusedImages = () => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.complete || img.naturalHeight === 0) {
        img.src = '';
      }
    });
  };

  // Clear cache periodically on mobile
  const clearCache = () => {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('old') || name.includes('temp')) {
            caches.delete(name);
          }
        });
      });
    }
  };

  // Run cleanup every 5 minutes
  setInterval(() => {
    clearUnusedImages();
    clearCache();
  }, 5 * 60 * 1000);
};

// Reduce animations on low-end devices
export const adaptAnimationsForDevice = () => {
  const isLowEndDevice = () => {
    // Check for low-end device indicators
    const memory = (navigator as any).deviceMemory;
    const cores = navigator.hardwareConcurrency;
    const connection = (navigator as any).connection;
    
    return (
      memory && memory < 4 || // Less than 4GB RAM
      cores && cores < 4 || // Less than 4 CPU cores
      connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')
    );
  };

  if (isLowEndDevice()) {
    document.documentElement.style.setProperty('--animation-duration', '0.1s');
    document.documentElement.style.setProperty('--transition-duration', '0.1s');
  }
};

// Optimize bundle loading for mobile
export const optimizeBundleLoading = () => {
  // Preload next likely routes based on current route
  const preloadRoutes = {
    '/': ['/bridge', '/portfolio'],
    '/bridge': ['/portfolio', '/trading'],
    '/portfolio': ['/analytics', '/liquidity'],
    '/trading': ['/analytics', '/bridge'],
    '/liquidity': ['/trading', '/portfolio'],
  };

  const currentPath = window.location.pathname;
  const routesToPreload = preloadRoutes[currentPath as keyof typeof preloadRoutes];

  if (routesToPreload) {
    routesToPreload.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });
  }
};

// Network-aware loading
export const adaptToNetworkConditions = () => {
  const connection = (navigator as any).connection;
  
  if (connection) {
    const { effectiveType, downlink } = connection;
    
    // Reduce quality on slow connections
    if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 1) {
      document.documentElement.classList.add('low-bandwidth');
      
      // Disable non-critical animations
      document.documentElement.style.setProperty('--enable-animations', '0');
      
      // Reduce image quality
      document.documentElement.style.setProperty('--image-quality', '60');
    }
    
    // Listen for network changes
    connection.addEventListener('change', () => {
      adaptToNetworkConditions();
    });
  }
};

// Initialize all mobile optimizations
export const initializeMobileOptimizations = () => {
  // Only run on mobile devices
  if (window.innerWidth < 768) {
    preloadCriticalResources();
    optimizeTouchEvents();
    optimizeMemoryUsage();
    adaptAnimationsForDevice();
    optimizeBundleLoading();
    adaptToNetworkConditions();
    
    console.log('Mobile optimizations initialized');
  }
};

// Cleanup function
export const cleanupMobileOptimizations = () => {
  // Remove event listeners and clear intervals
  // This would be called on component unmount
};