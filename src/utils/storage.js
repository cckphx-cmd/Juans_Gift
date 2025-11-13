// LocalStorage utility for persisting user preferences and app state

const STORAGE_KEYS = {
  IDEAL_TEMP: 'windowWeather_idealTemp',
  QUIET_HOURS: 'windowWeather_quietHours',
  LOCATION: 'windowWeather_location',
  LAST_NOTIFICATION: 'windowWeather_lastNotification',
  NOTIFICATION_SNOOZE: 'windowWeather_notificationSnooze',
  ONBOARDING_COMPLETE: 'windowWeather_onboardingComplete',
  LAST_WEATHER_DATA: 'windowWeather_lastWeatherData',
  NOTIFICATION_ENABLED: 'windowWeather_notificationEnabled',
};

// Default values
const DEFAULTS = {
  idealTemp: 75, // Fahrenheit
  quietHours: {
    start: '08:00',
    end: '22:00',
    enabled: true,
  },
  notificationEnabled: true,
};

export const storage = {
  // Ideal temperature
  getIdealTemp: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.IDEAL_TEMP);
    return stored ? parseFloat(stored) : DEFAULTS.idealTemp;
  },
  setIdealTemp: (temp) => {
    localStorage.setItem(STORAGE_KEYS.IDEAL_TEMP, temp.toString());
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
