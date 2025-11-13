import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';

const SettingsPanel = ({ onClose, onSettingsChange }) => {
  const [quietHours, setQuietHours] = useState(storage.getQuietHours());
  const [notificationsEnabled, setNotificationsEnabled] = useState(storage.isNotificationEnabled());

  const handleSave = () => {
    storage.setQuietHours(quietHours);
    storage.setNotificationEnabled(notificationsEnabled);
    onSettingsChange?.();
    onClose();
  };

  const handleQuietHoursToggle = (e) => {
    setQuietHours({ ...quietHours, enabled: e.target.checked });
  };

  const handleStartTimeChange = (e) => {
    setQuietHours({ ...quietHours, start: e.target.value });
  };

  const handleEndTimeChange = (e) => {
    setQuietHours({ ...quietHours, end: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md sm:w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-xl font-bold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-smooth"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Notifications Toggle */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p className="text-sm text-gray-600">
              Enable browser notifications for window alerts
            </p>
          </div>

          {/* Quiet Hours */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Quiet Hours</h3>
                <p className="text-sm text-gray-600">
                  Don't send notifications outside these hours
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={quietHours.enabled}
                  onChange={handleQuietHoursToggle}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={quietHours.start}
                    onChange={handleStartTimeChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={quietHours.end}
                    onChange={handleEndTimeChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notification Permission Status */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Permission Status</h3>
            <div className="flex items-center gap-2">
              {Notification.permission === 'granted' ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Notifications allowed</span>
                </>
              ) : Notification.permission === 'denied' ? (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Notifications blocked - please enable in browser settings</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Notification permission not granted</span>
                </>
              )}
            </div>
          </div>

          {/* About */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-2">About</h3>
            <p className="text-sm text-gray-600 mb-2">
              Window Weather helps you know the perfect time to open or close your windows based on temperature, UV index, and weather conditions.
            </p>
            <p className="text-xs text-gray-500">
              Version 1.0.0 • Data from OpenWeatherMap
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-3xl">
          <button
            onClick={handleSave}
            className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-smooth"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
