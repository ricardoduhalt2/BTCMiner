import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification,
  clearAllNotifications 
} from '../../store/slices/notificationSlice';
import { BellIcon, XMarkIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose
}) => {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount } = useAppSelector(state => state.notifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'price' | 'transaction' | 'security'>('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.type === filter;
  });

  const handleMarkAsRead = (id: string) => {
    dispatch(markNotificationAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const handleDelete = (id: string) => {
    dispatch(deleteNotification(id));
  };

  const handleClearAll = () => {
    dispatch(clearAllNotifications());
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'price':
        return '📈';
      case 'transaction':
        return '💸';
      case 'security':
        return '🔒';
      case 'liquidity':
        return '💧';
      case 'system':
        return '⚙️';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return 'border-l-red-500 bg-red-50';
    if (priority === 'medium') return 'border-l-yellow-500 bg-yellow-50';
    
    switch (type) {
      case 'price':
        return 'border-l-blue-500 bg-blue-50';
      case 'transaction':
        return 'border-l-green-500 bg-green-50';
      case 'security':
        return 'border-l-red-500 bg-red-50';
      case 'liquidity':
        return 'border-l-purple-500 bg-purple-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-25" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BellIcon className="h-6 w-6 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="mt-4 flex space-x-1 rounded-lg bg-gray-100 p-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'unread', label: 'Unread' },
                { key: 'price', label: 'Price' },
                { key: 'transaction', label: 'Tx' },
                { key: 'security', label: 'Security' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    filter === key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Actions */}
            {notifications.length > 0 && (
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center space-x-1 rounded-md bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100"
                >
                  <CheckIcon className="h-4 w-4" />
                  <span>Mark all read</span>
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex items-center space-x-1 rounded-md bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Clear all</span>
                </button>
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No notifications
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {filter === 'all' 
                      ? "You're all caught up!" 
                      : `No ${filter} notifications`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border-l-4 p-4 ${getNotificationColor(
                      notification.type,
                      notification.priority
                    )} ${!notification.isRead ? 'bg-opacity-100' : 'bg-opacity-50'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <span className="text-lg">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="h-2 w-2 rounded-full bg-blue-600" />
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true
                            })}
                          </p>
                          {notification.actionUrl && (
                            <button
                              onClick={() => window.open(notification.actionUrl, '_blank')}
                              className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                            >
                              View Details →
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="rounded-md p-1 text-gray-400 hover:text-gray-600"
                            title="Mark as read"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="rounded-md p-1 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};