import React from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { updateNotificationSettings, toggleNotifications } from '../../store/slices/notificationSlice';
import { Switch } from '@headlessui/react';
import { 
  BellIcon, 
  EnvelopeIcon, 
  DevicePhoneMobileIcon,
  SpeakerWaveIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ArrowsRightLeftIcon,
  BeakerIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

export const NotificationSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { settings, isEnabled } = useAppSelector(state => state.notifications);

  const handleToggleNotifications = () => {
    dispatch(toggleNotifications());
  };

  const handleUpdateSetting = (key: keyof typeof settings, value: boolean) => {
    dispatch(updateNotificationSettings({ [key]: value }));
  };

  const notificationTypes = [
    {
      key: 'priceAlerts' as const,
      title: 'Price Alerts',
      description: 'Get notified when prices reach your target levels',
      icon: CurrencyDollarIcon,
      color: 'text-blue-500',
    },
    {
      key: 'transactionUpdates' as const,
      title: 'Transaction Updates',
      description: 'Receive updates on transaction status and confirmations',
      icon: ArrowsRightLeftIcon,
      color: 'text-green-500',
    },
    {
      key: 'securityAlerts' as const,
      title: 'Security Alerts',
      description: 'Important security notifications and warnings',
      icon: ShieldCheckIcon,
      color: 'text-red-500',
    },
    {
      key: 'liquidityWarnings' as const,
      title: 'Liquidity Warnings',
      description: 'Alerts about liquidity pool health and risks',
      icon: BeakerIcon,
      color: 'text-purple-500',
    },
    {
      key: 'systemUpdates' as const,
      title: 'System Updates',
      description: 'Platform updates, maintenance, and new features',
      icon: Cog6ToothIcon,
      color: 'text-gray-500',
    },
  ];

  const deliveryMethods = [
    {
      key: 'pushNotifications' as const,
      title: 'Browser Notifications',
      description: 'Show notifications in your browser',
      icon: BellIcon,
    },
    {
      key: 'emailNotifications' as const,
      title: 'Email Notifications',
      description: 'Send notifications to your email address',
      icon: EnvelopeIcon,
    },
    {
      key: 'soundEnabled' as const,
      title: 'Sound Alerts',
      description: 'Play sound for high-priority notifications',
      icon: SpeakerWaveIcon,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Master Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BellIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Notifications
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enable or disable all notifications
              </p>
            </div>
          </div>
          <Switch
            checked={isEnabled}
            onChange={handleToggleNotifications}
            className={`${
              isEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>
      </div>

      {/* Notification Types */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Notification Types
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Choose which types of notifications you want to receive
          </p>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {notificationTypes.map(({ key, title, description, icon: Icon, color }) => (
            <div key={key} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon className={`h-5 w-5 ${color}`} />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings[key]}
                  onChange={(value) => handleUpdateSetting(key, value)}
                  disabled={!isEnabled}
                  className={`${
                    settings[key] && isEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50`}
                >
                  <span
                    className={`${
                      settings[key] && isEnabled ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Methods */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Delivery Methods
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Choose how you want to receive notifications
          </p>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {deliveryMethods.map(({ key, title, description, icon: Icon }) => (
            <div key={key} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings[key]}
                  onChange={(value) => handleUpdateSetting(key, value)}
                  disabled={!isEnabled}
                  className={`${
                    settings[key] && isEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50`}
                >
                  <span
                    className={`${
                      settings[key] && isEnabled ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Browser Permission Status */}
      {'Notification' in window && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Browser Permission
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Current status: {Notification.permission}
              </p>
            </div>
            {Notification.permission === 'default' && (
              <button
                onClick={() => Notification.requestPermission()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Request Permission
              </button>
            )}
            {Notification.permission === 'denied' && (
              <span className="text-red-600 text-sm">
                Permission denied. Enable in browser settings.
              </span>
            )}
            {Notification.permission === 'granted' && (
              <span className="text-green-600 text-sm">
                ✓ Permission granted
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};