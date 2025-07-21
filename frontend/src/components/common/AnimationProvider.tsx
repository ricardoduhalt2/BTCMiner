import React, { createContext, useContext, useEffect } from 'react'
import { Variants } from 'framer-motion'
import { useTheme } from './ThemeProvider'
import { AnimationBatcher } from './AnimationBatcher'
import AnimationErrorBoundary from './AnimationErrorBoundary'
import AnimationErrorHandler from '@utils/animationErrorHandler'
import { AnimationPerformanceMonitor } from '@utils/animationUtils'

interface AnimationVariants {
  // Page transitions
  pageTransitions: {
    fade: Variants
    slide: Variants
    scale: Variants
    bounce: Variants
    spiral: Variants
  }
  
  // Component animations
  components: {
    fadeIn: Variants
    slideUp: Variants
    slideDown: Variants
    slideLeft: Variants
    slideRight: Variants
    scaleIn: Variants
    bounceIn: Variants
    rotateIn: Variants
  }
  
  // List animations
  stagger: {
    container: Variants
    item: Variants
  }
  
  // Button animations
  button: {
    hover: Variants
    tap: Variants
    loading: Variants
  }
  
  // Modal animations
  modal: {
    backdrop: Variants
    content: Variants
  }
  
  // Notification animations
  notification: {
    slideIn: Variants
    bounce: Variants
    fade: Variants
  }
}

interface AnimationContextType {
  variants: AnimationVariants
  transitions: {
    fast: any
    normal: any
    slow: any
    spring: any
    bounce: any
  }
  isAnimated: boolean
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined)

export const useAnimation = () => {
  const context = useContext(AnimationContext)
  if (context === undefined) {
    // Fallback for components that might render before AnimationProvider is ready
    console.warn('useAnimation called outside of AnimationProvider, using fallback')
    return {
      variants: {
        pageTransitions: {
          fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
          slide: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
          scale: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
          bounce: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
          spiral: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
        },
        components: {
          fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
          slideUp: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
          slideDown: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
          slideLeft: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
          slideRight: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
          scaleIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
          bounceIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
          rotateIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
        },
        stagger: {
          container: { animate: {} },
          item: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
        },
        button: { hover: {}, tap: {}, loading: {} },
        modal: {
          backdrop: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
          content: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
        },
        notification: {
          slideIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
          bounce: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
          fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
        }
      },
      transitions: {
        fast: { duration: 0.15, ease: 'easeOut' },
        normal: { duration: 0.3, ease: 'easeInOut' },
        slow: { duration: 0.5, ease: 'easeInOut' },
        spring: { type: "spring", stiffness: 200, damping: 20 },
        bounce: { type: "spring", stiffness: 400, damping: 15 }
      },
      isAnimated: false
    }
  }
  return context
}

interface AnimationProviderProps {
  children: React.ReactNode
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({ children }) => {
  const { isAnimated, animationConfig } = useTheme()

  // Initialize error handler and performance monitor
  useEffect(() => {
    const errorHandler = AnimationErrorHandler.getInstance()
    const performanceMonitor = AnimationPerformanceMonitor.getInstance()
    
    if (process.env.NODE_ENV === 'development') {
      errorHandler.initialize()
      performanceMonitor.start()
    }

    return () => {
      if (process.env.NODE_ENV === 'development') {
        errorHandler.destroy()
        performanceMonitor.stop()
      }
    }
  }, [])

  // Define all animation variants
  const variants: AnimationVariants = {
    pageTransitions: {
      fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      },
      slide: {
        initial: { opacity: 0, x: 50, y: 20 },
        animate: { opacity: 1, x: 0, y: 0 },
        exit: { opacity: 0, x: -50, y: -20 }
      },
      scale: {
        initial: { opacity: 0, scale: 0.9, rotateX: 10 },
        animate: { opacity: 1, scale: 1, rotateX: 0 },
        exit: { opacity: 0, scale: 1.1, rotateX: -10 }
      },
      bounce: {
        initial: { opacity: 0, y: 100, scale: 0.8 },
        animate: { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 200,
            damping: 20
          }
        },
        exit: { opacity: 0, y: -50, scale: 0.9 }
      },
      spiral: {
        initial: { 
          opacity: 0, 
          scale: 0.5, 
          rotate: -180,
          x: 100,
          y: 100
        },
        animate: { 
          opacity: 1, 
          scale: 1, 
          rotate: 0,
          x: 0,
          y: 0,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 15,
            staggerChildren: 0.1
          }
        },
        exit: { 
          opacity: 0, 
          scale: 0.8, 
          rotate: 180,
          x: -100,
          y: -100
        }
      }
    },

    components: {
      fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      },
      slideUp: {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -30 }
      },
      slideDown: {
        initial: { opacity: 0, y: -30 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 30 }
      },
      slideLeft: {
        initial: { opacity: 0, x: 30 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -30 }
      },
      slideRight: {
        initial: { opacity: 0, x: -30 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 30 }
      },
      scaleIn: {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 }
      },
      bounceIn: {
        initial: { opacity: 0, scale: 0.3 },
        animate: { 
          opacity: 1, 
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 20
          }
        },
        exit: { opacity: 0, scale: 0.8 }
      },
      rotateIn: {
        initial: { opacity: 0, rotate: -180, scale: 0.8 },
        animate: { opacity: 1, rotate: 0, scale: 1 },
        exit: { opacity: 0, rotate: 180, scale: 0.8 }
      }
    },

    stagger: {
      container: {
        animate: {
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
          }
        }
      },
      item: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
      }
    },

    button: {
      hover: {
        scale: 1.05,
        transition: { duration: 0.2 }
      },
      tap: {
        scale: 0.95,
        transition: { duration: 0.1 }
      },
      loading: {
        initial: { scale: 1 },
        animate: { 
          scale: [1, 1.05, 1],
          transition: {
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }
      }
    },

    modal: {
      backdrop: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      },
      content: {
        initial: { opacity: 0, scale: 0.8, y: 50 },
        animate: { 
          opacity: 1, 
          scale: 1, 
          y: 0,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 25
          }
        },
        exit: { 
          opacity: 0, 
          scale: 0.9, 
          y: 30,
          transition: {
            duration: 0.2
          }
        }
      }
    },

    notification: {
      slideIn: {
        initial: { opacity: 0, x: 300, scale: 0.8 },
        animate: { 
          opacity: 1, 
          x: 0, 
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 200,
            damping: 20
          }
        },
        exit: { 
          opacity: 0, 
          x: 300, 
          scale: 0.8,
          transition: {
            duration: 0.3
          }
        }
      },
      bounce: {
        initial: { opacity: 0, scale: 0.3, y: -100 },
        animate: { 
          opacity: 1, 
          scale: 1, 
          y: 0,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 15
          }
        },
        exit: { 
          opacity: 0, 
          scale: 0.8, 
          y: -50
        }
      },
      fade: {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
      }
    }
  }

  // Define transition presets
  const transitions = {
    fast: {
      duration: animationConfig.duration.fast / 1000,
      ease: animationConfig.easing.easeOut
    },
    normal: {
      duration: animationConfig.duration.normal / 1000,
      ease: animationConfig.easing.easeInOut
    },
    slow: {
      duration: animationConfig.duration.slow / 1000,
      ease: animationConfig.easing.easeInOut
    },
    spring: {
      type: "spring",
      stiffness: 200,
      damping: 20
    },
    bounce: {
      type: "spring",
      stiffness: 400,
      damping: 15
    }
  }

  // If animations are disabled, return simplified variants
  const reducedMotionVariants: AnimationVariants = {
    pageTransitions: {
      fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
      slide: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
      scale: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
      bounce: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
      spiral: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    },
    components: {
      fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
      slideUp: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
      slideDown: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
      slideLeft: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
      slideRight: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
      scaleIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
      bounceIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
      rotateIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    },
    stagger: {
      container: { animate: {} },
      item: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    },
    button: {
      hover: {},
      tap: {},
      loading: {}
    },
    modal: {
      backdrop: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
      content: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    },
    notification: {
      slideIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
      bounce: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
      fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    }
  }

  const value: AnimationContextType = {
    variants: isAnimated ? variants : reducedMotionVariants,
    transitions,
    isAnimated
  }

  return (
    <AnimationContext.Provider value={value}>
      <AnimationErrorBoundary>
        <AnimationBatcher>
          {children}
        </AnimationBatcher>
      </AnimationErrorBoundary>
    </AnimationContext.Provider>
  )
}