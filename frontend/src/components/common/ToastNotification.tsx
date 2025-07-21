import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useAppSelector, useAppDispatch } from '@hooks/redux'
import { removeNotification } from '@store/slices/uiSlice'
import { useAnimation } from './AnimationProvider'

interface ToastProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
  onClose: (id: string) => void
}

const Toast: React.FC<ToastProps> = ({ id, type, message, duration = 5000, onClose }) => {
  const { isAnimated } = useAnimation()

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const getIcon = () => {
    const iconProps = "h-6 w-6"
    switch (type) {
      case 'success':
        return <CheckCircleIcon className={`${iconProps} text-green-500`} />
      case 'error':
        return <XCircleIcon className={`${iconProps} text-red-500`} />
      case 'warning':
        return <ExclamationTriangleIcon className={`${iconProps} text-yellow-500`} />
      case 'info':
      default:
        return <InformationCircleIcon className={`${iconProps} text-blue-500`} />
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    }
  }

  const toastVariants = {
    initial: { 
      opacity: 0, 
      x: 300, 
      scale: 0.8,
      rotateY: 90
    },
    animate: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      rotateY: 0,
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
      rotateY: -90,
      transition: {
        duration: 0.3
      }
    }
  }

  const progressVariants = {
    initial: { width: '100%' },
    animate: { 
      width: '0%',
      transition: {
        duration: duration / 1000,
        ease: 'linear'
      }
    }
  }

  return (
    <motion.div
      variants={isAnimated ? toastVariants : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`
        relative max-w-sm w-full rounded-lg shadow-lg border p-4 mb-4
        ${getStyles()}
        hover-lift transition-all duration-200
      `}
      whileHover={isAnimated ? { scale: 1.02, x: -5 } : {}}
      style={{ perspective: '1000px' }}
    >
      <div className="flex items-start space-x-3">
        <motion.div
          animate={isAnimated ? {
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          } : {}}
          transition={isAnimated ? {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          } : {}}
        >
          {getIcon()}
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <motion.p 
            className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed"
            initial={isAnimated ? { opacity: 0, y: 5 } : {}}
            animate={isAnimated ? { opacity: 1, y: 0 } : {}}
            transition={isAnimated ? { delay: 0.1 } : {}}
          >
            {message}
          </motion.p>
        </div>
        
        <motion.button
          onClick={() => onClose(id)}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md transition-colors"
          whileHover={isAnimated ? { scale: 1.1, rotate: 90 } : {}}
          whileTap={isAnimated ? { scale: 0.9 } : {}}
        >
          <XMarkIcon className="h-4 w-4" />
        </motion.button>
      </div>
      
      {/* Progress Bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg"
        variants={isAnimated ? progressVariants : {}}
        initial="initial"
        animate="animate"
        style={{
          color: type === 'success' ? '#10b981' : 
                 type === 'error' ? '#ef4444' : 
                 type === 'warning' ? '#f59e0b' : '#3b82f6'
        }}
      />
      
      {/* Glow Effect */}
      {isAnimated && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          animate={{
            boxShadow: [
              `0 0 0 0 ${type === 'success' ? 'rgba(16, 185, 129, 0)' : 
                         type === 'error' ? 'rgba(239, 68, 68, 0)' : 
                         type === 'warning' ? 'rgba(245, 158, 11, 0)' : 'rgba(59, 130, 246, 0)'}`,
              `0 0 20px 0 ${type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 
                            type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 
                            type === 'warning' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`,
              `0 0 0 0 ${type === 'success' ? 'rgba(16, 185, 129, 0)' : 
                         type === 'error' ? 'rgba(239, 68, 68, 0)' : 
                         type === 'warning' ? 'rgba(245, 158, 11, 0)' : 'rgba(59, 130, 246, 0)'}`
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
    </motion.div>
  )
}

const ToastContainer: React.FC = () => {
  const dispatch = useAppDispatch()
  const { notifications } = useAppSelector((state: any) => state.ui)
  const { isAnimated } = useAnimation()

  // Only show recent notifications as toasts (last 3)
  const recentNotifications = notifications.slice(-3).filter((n: any) => !n.read)

  const handleClose = (id: string) => {
    dispatch(removeNotification(id))
  }

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="fixed top-4 right-4 z-[100] max-w-sm">
      <motion.div
        variants={isAnimated ? containerVariants : {}}
        animate="animate"
      >
        <AnimatePresence mode="popLayout">
          {recentNotifications.map((notification: any) => (
            <Toast
              key={notification.id}
              id={notification.id}
              type={notification.type}
              message={notification.message}
              onClose={handleClose}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default ToastContainer