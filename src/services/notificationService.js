// Notification service for sending smart window alerts

import { storage } from '../utils/storage';

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Check if notifications are available and permitted
export const canSendNotifications = () => {
  return (
    'Notification' in window &&
    Notification.permission === 'granted' &&
    storage.isNotificationEnabled()
  );
};

// Check if current time is within quiet hours
const isQuietHours = () => {
  const quietHours = storage.getQuietHours();
  if (!quietHours.enabled) return false;

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return currentTime < quietHours.start || currentTime > quietHours.end;
};

// Check if we should suppress duplicate notifications
const shouldSuppressDuplicate = (notificationType) => {
  const lastNotification = storage.getLastNotification();
  const oneHourAgo = Date.now() - (60 * 60 * 1000);

  // Don't send same notification type within 1 hour
  return (
    lastNotification.type === notificationType &&
    lastNotification.timestamp > oneHourAgo
  );
};

// Check if notifications are snoozed
const isSnoozed = () => {
  const snoozeUntil = storage.getNotificationSnooze();
  return snoozeUntil !== null && snoozeUntil > Date.now();
};

// Determine if windows should be open or closed
// tempRange should be { min, max } - the comfortable temperature range
export const evaluateWindowCondition = (weatherData, tempRange) => {
  if (!weatherData?.current || !weatherData?.uv) {
    return { action: null, reason: 'No weather data' };
  }

  const { current } = weatherData;
  const currentUV = weatherData.uv.current;
  const temp = current.temp;

  const now = Date.now() / 1000;
  const isNight = now < current.sunrise || now > current.sunset;
  const isEvening = now > current.sunset - 3600; // Within 1 hour of sunset

  // Temperature range from user settings
  const minTemp = tempRange.min;
  const maxTemp = tempRange.max;
  const rangeMiddle = (minTemp + maxTemp) / 2;

  // Check for storms
  const hasStorms = weatherData.forecast?.hasStorms;

  // Decision logic

  // Priority 1: Close if storms are coming
  if (hasStorms) {
    return {
      action: 'close',
      reason: 'Storm warning in effect',
      priority: 'high',
    };
  }

  // Priority 2: Close if too hot (above max range)
  if (temp > maxTemp + 3) {
    return {
      action: 'close',
      reason: `It's ${temp}°F - too hot (max: ${maxTemp}°F)`,
      priority: 'high',
    };
  }

  // Priority 3: Close if too cold (below min range)
  if (temp < minTemp - 5) {
    return {
      action: 'close',
      reason: `It's ${temp}°F - too cold (min: ${minTemp}°F)`,
      priority: 'medium',
    };
  }

  // Priority 4: Close if high UV and above middle of range (Arizona sun consideration)
  if (currentUV > 7 && temp > rangeMiddle) {
    return {
      action: 'close',
      reason: `High UV (${currentUV.toFixed(1)}) and ${temp}°F - will heat up fast`,
      priority: 'medium',
    };
  }

  // Priority 5: OPEN if temperature is within the perfect range
  if (temp >= minTemp && temp <= maxTemp) {
    // Check UV if it's daytime
    if (!isNight && !isEvening && currentUV > 5) {
      return {
        action: 'neutral',
        reason: `Temperature is in range (${temp}°F) but UV is ${currentUV.toFixed(1)}`,
        priority: 'low',
      };
    }

    return {
      action: 'open',
      reason: `Perfect weather! ${temp}°F is in your range (${minTemp}-${maxTemp}°F)`,
      priority: 'high',
    };
  }

  // Priority 6: Slightly out of range but comfortable
  if (temp >= minTemp - 3 && temp <= maxTemp + 3 && (isNight || currentUV < 5)) {
    return {
      action: 'open',
      reason: `Pleasant at ${temp}°F (close to your range)`,
      priority: 'low',
    };
  }

  // Default: No strong recommendation
  return {
    action: 'neutral',
    reason: `Current: ${temp}°F (Your range: ${minTemp}-${maxTemp}°F)`,
    priority: 'low',
  };
};

// Send a notification
const sendNotification = (title, body, tag, icon = '🪟') => {
  if (!canSendNotifications()) return null;

  try {
    const notification = new Notification(title, {
      body,
      icon: '/window-icon.svg',
      badge: '/window-icon.svg',
      tag, // Tag prevents duplicate notifications
      requireInteraction: false,
      silent: false,
    });

    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
};

// Check weather and send appropriate notification if needed
// tempRange should be { min, max } - the comfortable temperature range
export const checkAndNotify = (weatherData, tempRange) => {
  // Don't notify if notifications are disabled or we can't send them
  if (!canSendNotifications()) {
    return null;
  }

  // Don't notify during quiet hours
  if (isQuietHours()) {
    return null;
  }

  // Don't notify if snoozed
  if (isSnoozed()) {
    return null;
  }

  // Evaluate window condition
  const condition = evaluateWindowCondition(weatherData, tempRange);

  // Only send notifications for high priority actions
  if (condition.priority !== 'high' && condition.priority !== 'medium') {
    return null;
  }

  // Determine notification type
  let notificationType = null;
  let title = '';
  let body = '';

  if (condition.action === 'open') {
    notificationType = 'open';
    title = '🪟 Perfect! Time to open your windows!';
    body = condition.reason;
  } else if (condition.action === 'close') {
    notificationType = 'close';
    title = '🪟 Time to close your windows';
    body = condition.reason;
  }

  // Don't send if no notification type determined
  if (!notificationType) {
    return null;
  }

  // Check for duplicate suppression
  if (shouldSuppressDuplicate(notificationType)) {
    return null;
  }

  // Send the notification
  const notification = sendNotification(title, body, notificationType);

  if (notification) {
    // Record that we sent this notification
    storage.setLastNotification(notificationType);

    // Add click handler to focus the app
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  return notification;
};

// Snooze notifications for specified minutes
export const snoozeNotifications = (minutes = 30) => {
  storage.setNotificationSnooze(minutes);
};

// Get remaining snooze time in minutes
export const getRemainingSnoozeTime = () => {
  const snoozeUntil = storage.getNotificationSnooze();
  if (!snoozeUntil) return 0;

  const remaining = snoozeUntil - Date.now();
  if (remaining <= 0) return 0;

  return Math.ceil(remaining / (60 * 1000));
};
