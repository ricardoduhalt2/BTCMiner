import React from 'react'
import { motion } from 'framer-motion'
import { useAnimation } from './AnimationProvider'

interface AnimatedPageProps {
  children: React.ReactNode
  className?: string
  animation?: 'fade' | 'slide' | 'scale' | 'bounce' | 'spiral'
}

const AnimatedPage: React.FC<AnimatedPageProps> = ({ 
  children, 
  className = '', 
  animation = 'fade' 
}) => {
  const { variants, transitions, isAnimated } = useAnimation()

  const pageVariants = variants.pageTransitions[animation]
  const transition = transitions.normal

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={transition}
      className={`min-h-screen ${className}`}
      style={{
        perspective: isAnimated ? '1000px' : 'none',
        transformStyle: isAnimated ? 'preserve-3d' : 'flat'
      }}
    >
      {children}
    </motion.div>
  )
}

export default AnimatedPage