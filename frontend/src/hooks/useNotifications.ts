import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { addNotification, addMultipleNotifications } from '../store/slices/notificationSlice';
import type { Notification } from '../store/slices/notificationSlice';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  requestPermission: () => Promise<boolean>;
  showBrowserNotification: (title: string, message: string, options?: NotificationOptions) => void;
}

export const useNotifications = (): UseNotificationsReturn => {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, settings, isEnabled } = useAppSelector(
    state => state.notifications
  );

  const addNotificationHandler = useCallback((
    notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>
  ) => {
    if (!isEnabled) return;
    
    // Check if notification type is enabled in settings
    const typeEnabled = {
      price: settings.priceAlerts,
      transaction: settings.transactionUpdates,
      security: settings.securityAlerts,
      liquidity: settings.liquidityWarnings,
      system: settings.systemUpdates,
    }[notification.type];

    if (!typeEnabled) return;

    dispatch(addNotification(notification));

    // Play sound if enabled
    if (settings.soundEnabled && notification.priority === 'high') {
      playNotificationSound();
    }

    // Show browser notification if enabled and permission granted
    if (settings.pushNotifications && 'Notification' in window && Notification.permission === 'granted') {
      showBrowserNotification(notification.title, notification.message);
    }
  }, [dispatch, isEnabled, settings]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, []);

  const showBrowserNotification = useCallback((
    title: string, 
    message: string, 
    options: NotificationOptions = {}
  ) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const notification = new Notification(title, {
      body: message,
      icon: '/logoBTCMINER.png',
      badge: '/logoBTCMINER.png',
      tag: 'btcminer-notification',
      requireInteraction: false,
      ...options,
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    // Handle click to focus window
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }, []);

  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.3;
      audio.play().catch(console.warn);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }, []);

  // Request permission on first load if push notifications are enabled
  useEffect(() => {
    if (settings.pushNotifications && 'Notification' in window && Notification.permission === 'default') {
      requestPermission();
    }
  }, [settings.pushNotifications, requestPermission]);

  return {
    notifications,
    unreadCount,
    addNotification: addNotificationHandler,
    requestPermission,
    showBrowserNotification,
  };
};

// Utility functions for common notification types
export const useNotificationHelpers = () => {
  const { addNotification } = useNotifications();

  const notifyPriceAlert = useCallback((
    symbol: string,
    currentPrice: number,
    targetPrice: number,
    condition: 'above' | 'below'
  ) => {
    addNotification({
      type: 'price',
      priority: 'medium',
      title: `Price Alert: ${symbol}`,
      message: `${symbol} is now ${condition} $${targetPrice}. Current price: $${currentPrice}`,
      metadata: { symbol, currentPrice, targetPrice, condition },
    });
  }, [addNotification]);

  const notifyTransactionUpdate = useCallback((
    type: 'pending' | 'confirmed' | 'failed',
    txHash: string,
    amount?: string,
    token?: string
  ) => {
    const titles = {
      pending: 'Transaction Pending',
      confirmed: 'Transaction Confirmed',
      failed: 'Transaction Failed',
    };

    const priorities = {
      pending: 'low' as const,
      confirmed: 'medium' as const,
      failed: 'high' as const,
    };

    addNotification({
      type: 'transaction',
      priority: priorities[type],
      title: titles[type],
      message: amount && token 
        ? `${amount} ${token} transaction ${type}`
        : `Transaction ${type}`,
      actionUrl: `https://etherscan.io/tx/${txHash}`,
      metadata: { txHash, amount, token, type },
    });
  }, [addNotification]);

  const notifySecurityAlert = useCallback((
    alertType: 'suspicious_login' | 'wallet_disconnected' | 'large_transaction',
    details: string
  ) => {
    addNotification({
      type: 'security',
      priority: 'high',
      title: 'Security Alert',
      message: details,
      metadata: { alertType },
    });
  }, [addNotification]);

  const notifyLiquidityWarning = useCallback((
    poolName: string,
    warningType: 'low_liquidity' | 'high_slippage' | 'impermanent_loss',
    details: string
  ) => {
    addNotification({
      type: 'liquidity',
      priority: 'medium',
      title: `Liquidity Warning: ${poolName}`,
      message: details,
      metadata: { poolName, warningType },
    });
  }, [addNotification]);

  const notifySystemUpdate = useCallback((
    updateType: 'maintenance' | 'feature' | 'security_patch',
    title: string,
    message: string
  ) => {
    addNotification({
      type: 'system',
      priority: updateType === 'security_patch' ? 'high' : 'low',
      title,
      message,
      metadata: { updateType },
    });
  }, [addNotification]);

  return {
    notifyPriceAlert,
    notifyTransactionUpdate,
    notifySecurityAlert,
    notifyLiquidityWarning,
    notifySystemUpdate,
  };
};