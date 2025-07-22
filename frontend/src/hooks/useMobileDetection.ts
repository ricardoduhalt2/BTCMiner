import { useState, useEffect } from 'react';

interface MobileDetection {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  orientation: 'portrait' | 'landscape';
  touchSupported: boolean;
  userAgent: {
    isIOS: boolean;
    isAndroid: boolean;
    isSafari: boolean;
    isChrome: boolean;
    isFirefox: boolean;
  };
}

export const useMobileDetection = (): MobileDetection => {
  const [detection, setDetection] = useState<MobileDetection>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenSize: 'lg',
    orientation: 'landscape',
    touchSupported: false,
    userAgent: {
      isIOS: false,
      isAndroid: false,
      isSafari: false,
      isChrome: false,
      isFirefox: false,
    },
  });

  useEffect(() => {
    const updateDetection = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent.toLowerCase();

      // Screen size detection based on Tailwind breakpoints
      let screenSize: MobileDetection['screenSize'] = 'xs';
      if (width >= 1536) screenSize = '2xl';
      else if (width >= 1280) screenSize = 'xl';
      else if (width >= 1024) screenSize = 'lg';
      else if (width >= 768) screenSize = 'md';
      else if (width >= 640) screenSize = 'sm';

      // Device type detection
      const isMobile = width < 768; // Below md breakpoint
      const isTablet = width >= 768 && width < 1024; // md to lg breakpoint
      const isDesktop = width >= 1024; // lg breakpoint and above

      // Orientation detection
      const orientation = height > width ? 'portrait' : 'landscape';

      // Touch support detection
      const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // User agent detection
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
      const isChrome = /chrome/.test(userAgent) && !/edge/.test(userAgent);
      const isFirefox = /firefox/.test(userAgent);

      setDetection({
        isMobile,
        isTablet,
        isDesktop,
        screenSize,
        orientation,
        touchSupported,
        userAgent: {
          isIOS,
          isAndroid,
          isSafari,
          isChrome,
          isFirefox,
        },
      });
    };

    // Initial detection
    updateDetection();

    // Listen for resize events
    window.addEventListener('resize', updateDetection);
    window.addEventListener('orientationchange', updateDetection);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDetection);
      window.removeEventListener('orientationchange', updateDetection);
    };
  }, []);

  return detection;
};

// Utility hook for specific mobile checks
export const useIsMobile = (): boolean => {
  const { isMobile } = useMobileDetection();
  return isMobile;
};

export const useIsTablet = (): boolean => {
  const { isTablet } = useMobileDetection();
  return isTablet;
};

export const useIsDesktop = (): boolean => {
  const { isDesktop } = useMobileDetection();
  return isDesktop;
};

export const useTouchSupported = (): boolean => {
  const { touchSupported } = useMobileDetection();
  return touchSupported;
};