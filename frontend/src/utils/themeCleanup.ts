/**
 * Theme Cleanup Utility
 * Helps clean up any stray theme transition elements that might persist
 */

// Function to remove any stray theme transition elements
export const cleanupThemeIcons = () => {
  if (typeof document === 'undefined') return;
  
  // First, remove all elements with theme transition data attributes
  const themeTransitionElements = document.querySelectorAll('[data-theme-transition]');
  themeTransitionElements.forEach(element => {
    if (process.env.NODE_ENV === 'development' && localStorage.getItem('debug-theme') === 'true') {
      console.log('Removing theme transition element:', element);
    }
    element.remove();
  });
  
  // Find all elements that might contain theme emojis
  const emojiElements = document.querySelectorAll('div, span');
  
  emojiElements.forEach(element => {
    const textContent = element.textContent || '';
    const hasThemeEmoji = textContent.includes('🌙') || textContent.includes('☀️');
    const hasThemeText = textContent.includes('Dark Mode') || textContent.includes('Light Mode');
    
    if (hasThemeEmoji || hasThemeText) {
      const computedStyle = window.getComputedStyle(element);
      const isFloating = (
        computedStyle.position === 'absolute' ||
        computedStyle.position === 'fixed'
      );
      
      // Check if it's in a high z-index (likely a transition overlay)
      const zIndex = parseInt(computedStyle.zIndex) || 0;
      const isHighZIndex = zIndex > 1000;
      
      // If it's a floating element with theme content, remove it completely
      if (isFloating || isHighZIndex) {
        if (process.env.NODE_ENV === 'development' && localStorage.getItem('debug-theme') === 'true') {
          console.log('Removing stray theme element:', element, { textContent, isFloating, zIndex });
        }
        element.remove();
      }
    }
  });
  
  // Also check for any Framer Motion elements that might be stuck
  const framerElements = document.querySelectorAll('[data-framer-name], [data-projection-id]');
  framerElements.forEach(element => {
    const textContent = element.textContent || '';
    if (textContent.includes('🌙') || textContent.includes('☀️') || 
        textContent.includes('Dark Mode') || textContent.includes('Light Mode')) {
      if (process.env.NODE_ENV === 'development' && localStorage.getItem('debug-theme') === 'true') {
        console.log('Removing stuck Framer Motion element:', element);
      }
      element.remove();
    }
  });
};

// Function to monitor and clean up theme transitions with more aggressive approach
export const monitorThemeTransitions = () => {
  if (typeof document === 'undefined') return () => {};
  
  // Clean up immediately
  cleanupThemeIcons();
  
  // Set up more frequent monitoring during development
  const interval = setInterval(() => {
    cleanupThemeIcons();
  }, 1000); // Check every second for more aggressive cleanup
  
  // Also set up a MutationObserver to catch elements as they're added
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          const textContent = element.textContent || '';
          
          // If a new element contains theme content, check if it should be cleaned up
          if (textContent.includes('🌙') || textContent.includes('☀️') || 
              textContent.includes('Dark Mode') || textContent.includes('Light Mode')) {
            
            // Give it a moment to see if it's part of a legitimate transition
            setTimeout(() => {
              if (document.contains(element)) {
                const computedStyle = window.getComputedStyle(element);
                const isFloating = (
                  computedStyle.position === 'absolute' ||
                  computedStyle.position === 'fixed'
                );
                const zIndex = parseInt(computedStyle.zIndex) || 0;
                
                // If it's still there and looks like a stray element, remove it
                if (isFloating && zIndex > 1000) {
                  if (process.env.NODE_ENV === 'development' && localStorage.getItem('debug-theme') === 'true') {
                    console.log('Auto-removing newly added stray theme element:', element);
                  }
                  element.remove();
                }
              }
            }, 2000); // Wait 2 seconds before checking
          }
        }
      });
    });
  });
  
  // Only observe if document.body exists
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Return cleanup function
  return () => {
    clearInterval(interval);
    observer.disconnect();
  };
};

// Enhanced cleanup function that's more thorough
export const forceCleanupAllThemeElements = () => {
  if (typeof document === 'undefined') return;
  
  const debugEnabled = process.env.NODE_ENV === 'development' && localStorage.getItem('debug-theme') === 'true';
  
  if (debugEnabled) {
    console.log('🧹 Force cleaning all theme elements...');
  }
  
  // Remove by data attributes
  const dataElements = document.querySelectorAll('[data-theme-transition]');
  if (debugEnabled) {
    console.log(`Found ${dataElements.length} elements with data-theme-transition`);
  }
  dataElements.forEach(element => element.remove());
  
  // Remove by z-index and content
  const allElements = document.querySelectorAll('*');
  let removedCount = 0;
  
  allElements.forEach(element => {
    const textContent = element.textContent || '';
    const computedStyle = window.getComputedStyle(element);
    const zIndex = parseInt(computedStyle.zIndex) || 0;
    
    const hasThemeContent = (
      textContent.includes('🌙') || 
      textContent.includes('☀️') || 
      textContent.includes('Dark Mode') || 
      textContent.includes('Light Mode')
    );
    
    const isHighZIndex = zIndex >= 9999;
    const isFixed = computedStyle.position === 'fixed';
    const isAbsolute = computedStyle.position === 'absolute';
    
    if (hasThemeContent && (isHighZIndex || (isFixed && zIndex > 100) || (isAbsolute && zIndex > 100))) {
      if (debugEnabled) {
        console.log('Force removing element:', element, { textContent, zIndex, position: computedStyle.position });
      }
      element.remove();
      removedCount++;
    }
  });
  
  if (debugEnabled) {
    console.log(`🧹 Force cleanup complete. Removed ${removedCount} elements.`);
  }
};

// Auto-initialize in development with more aggressive monitoring
if (process.env.NODE_ENV === 'development') {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      const cleanup = monitorThemeTransitions();
      
      // Add global cleanup function for debugging
      (window as any).forceCleanupTheme = forceCleanupAllThemeElements;
      
      // Cleanup on page unload
      window.addEventListener('beforeunload', cleanup);
    });
  }
}