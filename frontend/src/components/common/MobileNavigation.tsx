import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  HomeIcon,
  ArrowsRightLeftIcon,
  UserIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  WalletIcon,
  BeakerIcon,
  CurrencyDollarIcon,
  Bars3Icon,
  XMarkIcon,
  RocketLaunchIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { useMobileDetection } from '../../hooks/useMobileDetection';
import { useAppSelector } from '../../hooks/redux';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  color?: string;
}

const navigationItems: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, color: 'text-blue-500' },
  { name: 'Bridge', href: '/bridge', icon: ArrowsRightLeftIcon, color: 'text-purple-500' },
  { name: 'Trading', href: '/trading', icon: CurrencyDollarIcon, color: 'text-green-500' },
  { name: 'Liquidity', href: '/liquidity', icon: BeakerIcon, color: 'text-cyan-500' },
  { name: 'Portfolio', href: '/portfolio', icon: WalletIcon, color: 'text-yellow-500' },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, color: 'text-indigo-500' },
  { name: 'Price Monitor', href: '/price-monitoring', icon: EyeIcon, color: 'text-orange-500' },
  { name: 'Deployment', href: '/deployment', icon: RocketLaunchIcon, color: 'text-red-500' },
  { name: 'Identity', href: '/identity', icon: UserIcon, color: 'text-pink-500' },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, color: 'text-gray-500' },
];

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { isMobile, touchSupported, orientation, userAgent } = useMobileDetection();
  const { unreadCount } = useAppSelector(state => state.notifications);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });

  // Update navigation items with notification badge
  const updatedNavigationItems = navigationItems.map(item => 
    item.name === 'Settings' && unreadCount > 0 
      ? { ...item, badge: unreadCount }
      : item
  );

  // Handle drag constraints for swipe gestures
  useEffect(() => {
    if (isMobile) {
      setDragConstraints({ left: -100, right: 100 });
    }
  }, [isMobile]);

  // Handle swipe to close
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -100) {
      onClose();
    }
  };

  // Only render on mobile devices
  if (!isMobile) return null;

  const getActiveRoute = () => {
    return location.pathname === '/' ? '/dashboard' : location.pathname;
  };

  return (
    <>
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop with blur effect */}
            <motion.div
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              onClick={onClose}
              className="fixed inset-0 bg-black bg-opacity-30 z-40 backdrop-blur-sm"
            />

            {/* Menu Panel with swipe support */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              drag={touchSupported ? 'x' : false}
              dragConstraints={dragConstraints}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              transition={{ 
                type: 'spring', 
                damping: 25, 
                stiffness: 200,
                mass: 0.8
              }}
              className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto ${
                orientation === 'portrait' ? 'w-80' : 'w-96'
              } ${userAgent.isIOS ? 'pb-safe-area-inset-bottom' : ''}`}
              style={{
                maxWidth: '85vw',
                borderTopRightRadius: '20px',
                borderBottomRightRadius: '20px',
              }}
            >
              {/* Drag indicator */}
              {touchSupported && (
                <div className="absolute top-4 right-4 w-1 h-8 bg-gray-300 dark:bg-gray-600 rounded-full opacity-50" />
              )}

              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <motion.img 
                      src="/logoBTCMINER.png" 
                      alt="BTCMiner Logo" 
                      className="w-12 h-12 rounded-xl shadow-md"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    />
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        BTCMiner
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Multi-Chain Platform
                      </p>
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={onClose}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 touch-manipulation"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </motion.button>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="p-4 flex-1">
                <div className="space-y-1">
                  {updatedNavigationItems.map((item, index) => {
                    const isActive = getActiveRoute() === item.href;
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={item.href}
                          onClick={onClose}
                          className={`flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-200 touch-manipulation relative overflow-hidden ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 shadow-md'
                              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700'
                          }`}
                        >
                          {/* Active indicator */}
                          {isActive && (
                            <motion.div
                              layoutId="mobileActiveIndicator"
                              className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full"
                              initial={false}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                          )}
                          
                          <div className={`p-2 rounded-lg ${isActive ? 'bg-white/50 dark:bg-gray-800/50' : ''}`}>
                            <item.icon className={`h-6 w-6 ${isActive ? item.color : ''}`} />
                          </div>
                          
                          <div className="flex-1">
                            <span className="font-medium text-base">{item.name}</span>
                          </div>
                          
                          {item.badge && (
                            <motion.span 
                              className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            >
                              {item.badge > 99 ? '99+' : item.badge}
                            </motion.span>
                          )}
                          
                          {/* Ripple effect for touch */}
                          {touchSupported && (
                            <motion.div
                              className="absolute inset-0 bg-gray-200 dark:bg-gray-600 rounded-xl opacity-0"
                              whileTap={{ opacity: 0.3, scale: 0.95 }}
                              transition={{ duration: 0.1 }}
                            />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    BTCMiner v1.0.0
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Multi-Chain DeFi Platform
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar - Always visible on mobile */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 z-30 ${
        userAgent.isIOS ? 'pb-safe-area-inset-bottom' : 'pb-2'
      }`}>
        <div className="flex justify-around items-center py-2 px-2">
          {updatedNavigationItems.slice(0, 5).map((item) => {
            const isActive = getActiveRoute() === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-lg transition-all duration-200 touch-manipulation relative ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 transform scale-105'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <motion.div
                  className="relative"
                  whileTap={{ scale: 0.9 }}
                  animate={isActive ? { y: -2 } : { y: 0 }}
                >
                  <item.icon className="h-6 w-6" />
                  {item.badge && (
                    <motion.span 
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </motion.span>
                  )}
                </motion.div>
                
                <span className={`text-xs font-medium transition-all duration-200 ${
                  isActive ? 'opacity-100' : 'opacity-70'
                }`}>
                  {item.name}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="bottomNavActiveIndicator"
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Safe area spacer for bottom navigation */}
      <div className={`h-20 ${userAgent.isIOS ? 'pb-safe-area-inset-bottom' : ''}`} />
    </>
  );
};