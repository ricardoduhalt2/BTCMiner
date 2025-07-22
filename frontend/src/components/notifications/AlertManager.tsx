import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { addNotification } from '../../store/slices/notificationSlice';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  BellIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Switch } from '@headlessui/react';

interface PriceAlert {
  id: string;
  symbol: string;
  condition: 'above' | 'below';
  targetPrice: number;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
}

export const AlertManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { settings, isEnabled } = useAppSelector(state => state.notifications);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: 'BTM',
    condition: 'above' as 'above' | 'below',
    targetPrice: '',
  });

  // Load alerts from localStorage on component mount
  useEffect(() => {
    const savedAlerts = localStorage.getItem('btcminer-price-alerts');
    if (savedAlerts) {
      try {
        setAlerts(JSON.parse(savedAlerts));
      } catch (error) {
        console.error('Failed to load price alerts:', error);
      }
    }
  }, []);

  // Save alerts to localStorage whenever alerts change
  useEffect(() => {
    localStorage.setItem('btcminer-price-alerts', JSON.stringify(alerts));
  }, [alerts]);

  const handleCreateAlert = () => {
    if (!newAlert.targetPrice || isNaN(Number(newAlert.targetPrice))) {
      dispatch(addNotification({
        type: 'system',
        priority: 'medium',
        title: 'Invalid Price',
        message: 'Please enter a valid target price',
      }));
      return;
    }

    const alert: PriceAlert = {
      id: Date.now().toString(),
      symbol: newAlert.symbol,
      condition: newAlert.condition,
      targetPrice: Number(newAlert.targetPrice),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setAlerts(prev => [alert, ...prev]);
    setNewAlert({ symbol: 'BTM', condition: 'above', targetPrice: '' });
    setIsCreating(false);

    dispatch(addNotification({
      type: 'price',
      priority: 'low',
      title: 'Price Alert Created',
      message: `Alert set for ${alert.symbol} ${alert.condition} $${alert.targetPrice}`,
    }));
  };

  const handleToggleAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
    dispatch(addNotification({
      type: 'system',
      priority: 'low',
      title: 'Alert Deleted',
      message: 'Price alert has been removed',
    }));
  };

  const testAlert = (alert: PriceAlert) => {
    dispatch(addNotification({
      type: 'price',
      priority: 'high',
      title: `Price Alert: ${alert.symbol}`,
      message: `${alert.symbol} is now ${alert.condition} $${alert.targetPrice} (Test Alert)`,
      metadata: { alert, isTest: true },
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BellIcon className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Alert Manager
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage your price alerts and notification preferences
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          disabled={!isEnabled || !settings.priceAlerts}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>New Alert</span>
        </button>
      </div>

      {!isEnabled && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              Notifications are disabled. Enable them in settings to receive alerts.
            </p>
          </div>
        </div>
      )}

      {!settings.priceAlerts && isEnabled && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center space-x-2">
            <BellIcon className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-blue-800">
              Price alerts are disabled. Enable them in notification settings.
            </p>
          </div>
        </div>
      )}

      {/* Create Alert Form */}
      {isCreating && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
            Create New Price Alert
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Symbol
              </label>
              <select
                value={newAlert.symbol}
                onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-100"
              >
                <option value="BTM">BTM</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
                <option value="BNB">BNB</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Condition
              </label>
              <select
                value={newAlert.condition}
                onChange={(e) => setNewAlert(prev => ({ ...prev, condition: e.target.value as 'above' | 'below' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-100"
              >
                <option value="above">Above</option>
                <option value="below">Below</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={newAlert.targetPrice}
                onChange={(e) => setNewAlert(prev => ({ ...prev, targetPrice: e.target.value }))}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-100"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateAlert}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create Alert
            </button>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              No price alerts
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Create your first price alert to get notified when prices change.
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 border rounded-lg ${
                alert.isActive 
                  ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' 
                  : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={alert.isActive}
                    onChange={() => handleToggleAlert(alert.id)}
                    className={`${
                      alert.isActive ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        alert.isActive ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {alert.symbol} {alert.condition} ${alert.targetPrice}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Created {new Date(alert.createdAt).toLocaleDateString()}
                      {alert.triggeredAt && (
                        <span> • Triggered {new Date(alert.triggeredAt).toLocaleDateString()}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => testAlert(alert)}
                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    title="Test alert"
                  >
                    <BellIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    title="Delete alert"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};