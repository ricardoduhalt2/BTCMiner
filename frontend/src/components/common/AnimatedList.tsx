import React from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'

interface AnimatedListProps {
  children: React.ReactNode[]
  className?: string
  itemClassName?: string
  staggerDelay?: number
  animationType?: 'fade' | 'slide' | 'scale' | 'flip'
  direction?: 'up' | 'down' | 'left' | 'right'
  duration?: number
  exitAnimation?: boolean
}

const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  className = '',
  itemClassName = '',
  staggerDelay = 0.1,
  animationType = 'slide',
  direction = 'up',
  duration = 0.5,
  exitAnimation = true
}) => {
  // Animation variants based on type and direction
  const getVariants = (): Variants => {
    const baseTransition = {
      duration,
      ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for smooth animation
    }

    switch (animationType) {
      case 'fade':
        return {
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: baseTransition
          },
          exit: exitAnimation ? { 
            opacity: 0,
            transition: { duration: duration * 0.5 }
          } : {}
        }

      case 'scale':
        return {
          hidden: { 
            opacity: 0, 
            scale: 0.8,
            transformOrigin: 'center'
          },
          visible: { 
            opacity: 1, 
            scale: 1,
            transition: {
              ...baseTransition,
              type: 'spring',
              stiffness: 100,
              damping: 15
            }
          },
          exit: exitAnimation ? { 
            opacity: 0, 
            scale: 0.8,
            transition: { duration: duration * 0.5 }
          } : {}
        }

      case 'flip':
        return {
          hidden: { 
            opacity: 0, 
            rotateX: -90,
            transformOrigin: 'center'
          },
          visible: { 
            opacity: 1, 
            rotateX: 0,
            transition: {
              ...baseTransition,
              type: 'spring',
              stiffness: 100,
              damping: 15
            }
          },
          exit: exitAnimation ? { 
            opacity: 0, 
            rotateX: 90,
            transition: { duration: duration * 0.5 }
          } : {}
        }

      case 'slide':
      default:
        const slideDistance = 30
        const getSlideOffset = () => {
          switch (direction) {
            case 'down': return { y: -slideDistance }
            case 'left': return { x: slideDistance }
            case 'right': return { x: -slideDistance }
            case 'up':
            default: return { y: slideDistance }
          }
        }

        return {
          hidden: { 
            opacity: 0, 
            ...getSlideOffset()
          },
          visible: { 
            opacity: 1, 
            x: 0,
            y: 0,
            transition: baseTransition
          },
          exit: exitAnimation ? { 
            opacity: 0, 
            ...getSlideOffset(),
            transition: { duration: duration * 0.5 }
          } : {}
        }
    }
  }

  const variants = getVariants()

  // Container variants for staggered animation
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    },
    exit: {
      transition: {
        staggerChildren: staggerDelay * 0.5,
        staggerDirection: -1
      }
    }
  }

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <AnimatePresence mode="popLayout">
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            className={itemClassName}
            variants={variants}
            layout
            layoutId={`item-${index}`}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            whileTap={{
              scale: 0.98,
              transition: { duration: 0.1 }
            }}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

export default AnimatedList