import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BellIcon, 
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { useAppSelector, useAppDispatch } from '@hooks/redux'
import { markNotificationAsRead, removeNotification, clearNotifications } from '@store/slices/uiSlice'
import { useAnimation } from './AnimationProvider'
import AnimatedButton from './AnimatedButton'

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dispatch = useAppDispatch()
  const { notifications } = useAppSelector((state: any) => state.ui)
  const { variants, isAnimated } = useAnimation()

  const unreadCount = notifications.filter((n: any) => !n.read).length

  const getNotificationIcon = (type: string) => {
    const iconVariants = {
      animate: {
        scale: [1, 1.2, 1],
        rotate: [0, 10, -10, 0],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      }
    }

    const iconComponent = {
      success: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
      error: <XCircleIcon className="h-5 w-5 text-red-500" />,
      warning: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />,
      info: <InformationCircleIcon className="h-5 w-5 text-blue-500" />
    }[type] || <InformationCircleIcon className="h-5 w-5 text-blue-500" />

    return (
      <motion.div
        variants={isAnimated ? iconVariants : {}}
        animate={isAnimated ? "animate" : {}}
      >
        {iconComponent}
      </motion.div>
    )
  }

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const handleMarkAsRead = (id: string) => {
    dispatch(markNotificationAsRead(id))
  }

  const handleRemove = (id: string) => {
    dispatch(removeNotification(id))
  }

  const handleClearAll = () => {
    dispatch(clearNotifications())
  }

  const bellVariants = {
    animate: {
      rotate: [0, 15, -15, 0],
      transition: {
        duration: 0.5,
        ease: 'easeInOut'
      }
    }
  }

  const badgeVariants = {
    initial: { scale: 0 },
    animate: { 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 15
      }
    },
    pulse: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }

  const dropdownVariants = {
    initial: { 
      opacity: 0, 
      scale: 0.95, 
      y: -20,
      rotateX: -15
    },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        staggerChildren: 0.05
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: -10,
      rotateX: -10,
      transition: {
        duration: 0.2
      }
    }
  }

  const notificationItemVariants = {
    initial: { opacity: 0, x: 50, scale: 0.9 },
    animate: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      x: -50, 
      scale: 0.9,
      transition: {
        duration: 0.2
      }
    },
    hover: {
      scale: 1.02,
      x: 5,
      transition: {
        duration: 0.2
      }
    }
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
        whileHover={isAnimated ? { scale: 1.05 } : {}}
        whileTap={isAnimated ? { scale: 0.95 } : {}}
      >
        <motion.div
          variants={isAnimated && unreadCount > 0 ? bellVariants : {}}
          animate={isAnimated && unreadCount > 0 ? "animate" : {}}
        >
          <BellIcon className="h-6 w-6" />
        </motion.div>
        
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              variants={badgeVariants}
              initial="initial"
              animate={["animate", "pulse"]}
              exit="initial"
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={isAnimated ? dropdownVariants : variants.modal.content}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50 overflow-hidden"
            style={{ perspective: '1000px' }}
          >
            {/* Header */}
            <motion.div 
              className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20"
              variants={isAnimated ? { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 } } : {}}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={isAnimated ? {
                      rotate: [0, 10, -10, 0]
                    } : {}}
                    transition={isAnimated ? {
                      duration: 2,
                      repeat: Infinity
                    } : {}}
                  >
                    🔔
                  </motion.div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <motion.span
                      initial={isAnimated ? { scale: 0 } : {}}
                      animate={isAnimated ? { scale: 1 } : {}}
                      className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full font-bold"
                    >
                      {unreadCount} new
                    </motion.span>
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <AnimatedButton
                    size="sm"
                    variant="ghost"
                    animation="pulse"
                    onClick={handleClearAll}
                    className="text-xs"
                  >
                    Clear all
                  </AnimatedButton>
                )}
              </div>
            </motion.div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {notifications.length === 0 ? (
                  <motion.div
                    variants={isAnimated ? variants.components.fadeIn : {}}
                    initial="initial"
                    animate="animate"
                    className="px-4 py-12 text-center"
                  >
                    <motion.div
                      animate={isAnimated ? {
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0]
                      } : {}}
                      transition={isAnimated ? {
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      } : {}}
                      className="text-4xl mb-3"
                    >
                      🔕
                    </motion.div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      All caught up!
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No new notifications
                    </p>
                  </motion.div>
                ) : (
                  notifications.map((notification: any, index: number) => (
                    <motion.div
                      key={notification.id}
                      variants={isAnimated ? notificationItemVariants : {}}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      whileHover={isAnimated ? "hover" : {}}
                      layout
                      className={`px-4 py-4 border-l-4 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        notification.read 
                          ? 'border-transparent bg-gray-50/50 dark:bg-gray-800/50' 
                          : notification.type === 'success' 
                          ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10'
                          : notification.type === 'error'
                          ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10'
                          : notification.type === 'warning'
                          ? 'border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10'
                          : 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        
                        <div className="flex-1 min-w-0">
                          <motion.p 
                            className={`text-sm leading-relaxed ${
                              notification.read 
                                ? 'text-gray-600 dark:text-gray-400' 
                                : 'text-gray-900 dark:text-gray-100 font-medium'
                            }`}
                            initial={isAnimated ? { opacity: 0, y: 5 } : {}}
                            animate={isAnimated ? { opacity: 1, y: 0 } : {}}
                            transition={isAnimated ? { delay: index * 0.05 } : {}}
                          >
                            {notification.message}
                          </motion.p>
                          
                          <motion.p 
                            className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center space-x-1"
                            initial={isAnimated ? { opacity: 0 } : {}}
                            animate={isAnimated ? { opacity: 1 } : {}}
                            transition={isAnimated ? { delay: index * 0.05 + 0.1 } : {}}
                          >
                            <span>⏰</span>
                            <span>{formatTimeAgo(notification.timestamp)}</span>
                          </motion.p>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {!notification.read && (
                            <motion.button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-all duration-200"
                              title="Mark as read"
                              whileHover={isAnimated ? { scale: 1.1, rotate: 15 } : {}}
                              whileTap={isAnimated ? { scale: 0.9 } : {}}
                            >
                              <CheckIcon className="h-4 w-4" />
                            </motion.button>
                          )}
                          
                          <motion.button
                            onClick={() => handleRemove(notification.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all duration-200"
                            title="Remove"
                            whileHover={isAnimated ? { scale: 1.1, rotate: -15 } : {}}
                            whileTap={isAnimated ? { scale: 0.9 } : {}}
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>
                      
                      {/* Notification glow effect */}
                      {!notification.read && isAnimated && (
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          animate={{
                            boxShadow: [
                              'inset 0 0 0 0 rgba(251, 191, 36, 0)',
                              'inset 0 0 20px 0 rgba(251, 191, 36, 0.1)',
                              'inset 0 0 0 0 rgba(251, 191, 36, 0)'
                            ]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut'
                          }}
                        />
                      )}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <motion.div 
                className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                variants={isAnimated ? { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } } : {}}
              >
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    {notifications.length} total notification{notifications.length > 1 ? 's' : ''}
                  </span>
                  <motion.span
                    animate={isAnimated ? {
                      opacity: [0.5, 1, 0.5]
                    } : {}}
                    transition={isAnimated ? {
                      duration: 2,
                      repeat: Infinity
                    } : {}}
                  >
                    ✨ Stay updated
                  </motion.span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationDropdown