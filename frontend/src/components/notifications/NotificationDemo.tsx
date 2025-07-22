import React from 'react';
import { useNotifications, useNotificationHelpers } from '../../hooks/useNotifications';
import { notificationService } from '../../services/notificationService';

export const NotificationDemo: React.FC = () => {
  const { addNotification } = useNotifications();
  const {
    notifyPriceAlert,
    notifyTransactionUpdate,
    notifySecurityAlert,
    notifyLiquidityWarning,
    notifySystemUpdate,
  } = useNotificationHelpers();

  const demoNotifications = [
    {
      title: 'Price Alert Demo',
      action: () => notifyPriceAlert('BTM', 0.85, 0.80, 'below'),
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      title: 'Transaction Confirmed',
      action: () => notifyTransactionUpdate('confirmed', '0x123...abc', '100', 'BTM'),
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      title: 'Transaction Failed',
      action: () => notifyTransactionUpdate('failed', '0x456...def', '50', 'BTM'),
      color: 'bg-red-600 hover:bg-red-700',
    },
    {
      title: 'Security Alert',
      action: () => notifySecurityAlert('suspicious_login', 'Unusual login detected from new location'),
      color: 'bg-red-600 hover:bg-red-700',
    },
    {
      title: 'Liquidity Warning',
      action: () => notifyLiquidityWarning('BTM/ETH Pool', 'low_liquidity', 'Pool liquidity has dropped below 10%'),
      color: 'bg-yellow-600 hover:bg-yellow-700',
    },
    {
      title: 'System Update',
      action: () => notifySystemUpdate('feature', 'New Feature Available', 'Advanced trading features are now live!'),
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      title: 'High Priority Alert',
      action: () => addNotification({
        type: 'security',
        priority: 'high',
        title: 'Critical Security Alert',
        message: 'Immediate action required - suspicious wallet activity detected',
      }),
      color: 'bg-red-800 hover:bg-red-900',
    },
    {
      title: 'Multiple Notifications',
      action: () => {
        // Add multiple notifications at once
        for (let i = 1; i <= 3; i++) {
          setTimeout(() => {
            addNotification({
              type: 'price',
              priority: 'medium',
              title: `Batch Notification ${i}`,
              message: `This is batch notification number ${i} of 3`,
            });
          }, i * 500);
        }
      },
      color: 'bg-indigo-600 hover:bg-indigo-700',
    },
  ];

  const testBrowserNotification = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Test Browser Notification', {
          body: 'This is a test browser notification from BTCMiner',
          icon: '/logoBTCMINER.png',
        });
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification('Permission Granted!', {
              body: 'You will now receive browser notifications',
              icon: '/logoBTCMINER.png',
            });
          }
        });
      } else {
        alert('Browser notifications are blocked. Please enable them in your browser settings.');
      }
    } else {
      alert('This browser does not support notifications');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Notification System Demo
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Test different types of notifications to see how they appear in the notification center and as toast messages.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {demoNotifications.map((demo, index) => (
          <button
            key={index}
            onClick={demo.action}
            className={`${demo.color} text-white px-4 py-2 rounded-md text-sm font-medium transition-colors`}
          >
            {demo.title}
          </button>
        ))}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
          Browser Notification Test
        </h4>
        <button
          onClick={testBrowserNotification}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Test Browser Notification
        </button>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          This will request permission and show a native browser notification
        </p>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
          Service Methods Test
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => notificationService.createPriceAlert('BTM', 0.75, 0.80, 'above')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Service Price Alert
          </button>
          <button
            onClick={() => notificationService.createTransactionNotification('confirmed', '0x789...ghi', '200', 'BTM', 1)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Service Transaction
          </button>
          <button
            onClick={() => notificationService.createSecurityAlert('Wallet connection from new device detected', 'high')}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Service Security Alert
          </button>
          <button
            onClick={() => notificationService.createSystemNotification('Maintenance Scheduled', 'System maintenance in 1 hour', 'medium')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Service System Update
          </button>
        </div>
      </div>
    </div>
  );
};