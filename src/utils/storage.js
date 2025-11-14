// LocalStorage utility for persisting user preferences and app state

const STORAGE_KEYS = {
  TEMP_RANGE: 'juansWindowApp_tempRange',
  IDEAL_TEMP: 'windowWeather_idealTemp', // Legacy - for migration
  QUIET_HOURS: 'juansWindowApp_quietHours',
  LOCATION: 'juansWindowApp_location',
  LAST_NOTIFICATION: 'juansWindowApp_lastNotification',
  NOTIFICATION_SNOOZE: 'juansWindowApp_notificationSnooze',
  ONBOARDING_COMPLETE: 'juansWindowApp_onboardingComplete',
  LAST_WEATHER_DATA: 'juansWindowApp_lastWeatherData',
  NOTIFICATION_ENABLED: 'juansWindowApp_notificationEnabled',
};

// Default values
const DEFAULTS = {
  tempRange: {
    min: 65, // Minimum comfortable temperature (Fahrenheit)
    max: 78, // Maximum comfortable temperature (Fahrenheit)
  },
  quietHours: {
    start: '08:00',
    end: '22:00',
    enabled: true,
  },
  notificationEnabled: true,
};

export const storage = {
  // Temperature range (min/max for comfortable window-opening temps)
  getTempRange: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.TEMP_RANGE);
    if (stored) {
      return JSON.parse(stored);
    }

    // Migration: Check if old idealTemp exists
    const oldIdealTemp = localStorage.getItem(STORAGE_KEYS.IDEAL_TEMP);
    if (oldIdealTemp) {
      const temp = parseFloat(oldIdealTemp);
      // Convert single temp to range (±5 degrees)
      return {
        min: temp - 5,
        max: temp + 5,
      };
    }

    return DEFAULTS.tempRange;
  },
  setTempRange: (range) => {
    localStorage.setItem(STORAGE_KEYS.TEMP_RANGE, JSON.stringify(range));
  },

  // Legacy support - deprecated
  getIdealTemp: () => {
    const range = storage.getTempRange();
    return (range.min + range.max) / 2; // Return midpoint
  },
  setIdealTemp: (temp) => {
    storage.setTempRange({ min: temp - 5, max: temp + 5 });
  },

  // Quiet hours
  getQuietHours: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.QUIET_HOURS);
    return stored ? JSON.parse(stored) : DEFAULTS.quietHours;
  },
  setQuietHours: (quietHours) => {
    localStorage.setItem(STORAGE_KEYS.QUIET_HOURS, JSON.stringify(quietHours));
  },

  // Location
  getLocation: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.LOCATION);
    return stored ? JSON.parse(stored) : null;
  },
  setLocation: (location) => {
    localStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(location));
  },

  // Last notification timestamp
  getLastNotification: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_NOTIFICATION);
    return stored ? JSON.parse(stored) : { timestamp: 0, type: null };
  },
  setLastNotification: (type) => {
    const data = {
      timestamp: Date.now(),
      type,
    };
    localStorage.setItem(STORAGE_KEYS.LAST_NOTIFICATION, JSON.stringify(data));
  },

  // Notification snooze
  getNotificationSnooze: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SNOOZE);
    if (!stored) return null;
    const snoozeUntil = parseInt(stored);
    // Clear if expired
    if (snoozeUntil < Date.now()) {
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATION_SNOOZE);
      return null;
    }
    return snoozeUntil;
  },
  setNotificationSnooze: (minutes = 30) => {
    const snoozeUntil = Date.now() + (minutes * 60 * 1000);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATION_SNOOZE, snoozeUntil.toString());
  },
  clearNotificationSnooze: () => {
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATION_SNOOZE);
  },

  // Onboarding
  isOnboardingComplete: () => {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE) === 'true';
  },
  setOnboardingComplete: () => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
  },

  // Last weather data (for offline mode)
  getLastWeatherData: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_WEATHER_DATA);
    return stored ? JSON.parse(stored) : null;
  },
  setLastWeatherData: (data) => {
    localStorage.setItem(STORAGE_KEYS.LAST_WEATHER_DATA, JSON.stringify(data));
  },

  // Notification enabled
  isNotificationEnabled: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_ENABLED);
    return stored === null ? DEFAULTS.notificationEnabled : stored === 'true';
  },
  setNotificationEnabled: (enabled) => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATION_ENABLED, enabled.toString());
  },
};
