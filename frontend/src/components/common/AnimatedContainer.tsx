import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { useAnimation } from './AnimationProvider'

interface AnimatedContainerProps extends Omit<HTMLMotionProps<"div">, 'variants' | 'initial' | 'animate' | 'exit'> {
  children: React.ReactNode
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'bounceIn' | 'rotateIn'
  delay?: number
  duration?: 'fast' | 'normal' | 'slow'
  stagger?: boolean
  className?: string
}

const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  animation = 'fadeIn',
  delay = 0,
  duration = 'normal',
  stagger = false,
  className = '',
  ...props
}) => {
  const { variants, transitions, isAnimated } = useAnimation()

  const animationVariants = stagger 
    ? variants.stagger.container 
    : variants.components[animation]

  const transition = {
    ...transitions[duration],
    delay: isAnimated ? delay : 0
  }

  if (!isAnimated) {
    return (
      <div className={className} {...(props as any)}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={animationVariants}
      transition={transition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default AnimatedContainer