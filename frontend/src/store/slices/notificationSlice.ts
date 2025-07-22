import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  type: 'price' | 'transaction' | 'security' | 'liquidity' | 'system';
  priority: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  isEnabled: boolean;
}

interface NotificationSettings {
  priceAlerts: boolean;
  transactionUpdates: boolean;
  securityAlerts: boolean;
  liquidityWarnings: boolean;
  systemUpdates: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  settings: {
    priceAlerts: true,
    transactionUpdates: true,
    securityAlerts: true,
    liquidityWarnings: true,
    systemUpdates: true,
    emailNotifications: false,
    pushNotifications: true,
    soundEnabled: true,
  },
  isEnabled: true,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'createdAt' | 'isRead'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        isRead: false,
      };
      
      state.notifications.unshift(notification);
      state.unreadCount += 1;
      
      // Keep only last 100 notifications
      if (state.notifications.length > 100) {
        const removed = state.notifications.splice(100);
        state.unreadCount -= removed.filter(n => !n.isRead).length;
      }
    },
    
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true;
      });
      state.unreadCount = 0;
    },
    
    deleteNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },
    
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    
    updateNotificationSettings: (state, action: PayloadAction<Partial<NotificationSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    
    toggleNotifications: (state) => {
      state.isEnabled = !state.isEnabled;
    },
    
    // Bulk operations for real-time updates
    addMultipleNotifications: (state, action: PayloadAction<Omit<Notification, 'id' | 'createdAt' | 'isRead'>[]>) => {
      const newNotifications = action.payload.map(notif => ({
        ...notif,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        isRead: false,
      }));
      
      state.notifications.unshift(...newNotifications);
      state.unreadCount += newNotifications.length;
      
      // Keep only last 100 notifications
      if (state.notifications.length > 100) {
        const removed = state.notifications.splice(100);
        state.unreadCount -= removed.filter(n => !n.isRead).length;
      }
    },
  },
});

export const {
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  updateNotificationSettings,
  toggleNotifications,
  addMultipleNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;

// Selectors
export const selectUnreadNotifications = (state: { notifications: NotificationState }) =>
  state.notifications.notifications.filter(n => !n.isRead);

export const selectNotificationsByType = (state: { notifications: NotificationState }, type: Notification['type']) =>
  state.notifications.notifications.filter(n => n.type === type);

export const selectHighPriorityNotifications = (state: { notifications: NotificationState }) =>
  state.notifications.notifications.filter(n => n.priority === 'high' && !n.isRead);