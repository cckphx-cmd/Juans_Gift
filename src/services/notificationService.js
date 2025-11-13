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
export const evaluateWindowCondition = (weatherData, idealTemp) => {
  if (!weatherData?.current || !weatherData?.uv) {
    return { action: null, reason: 'No weather data' };
  }

  const { current } = weatherData;
  const currentUV = weatherData.uv.current;
  const temp = current.temp;

  const now = Date.now() / 1000;
  const isNight = now < current.sunrise || now > current.sunset;
  const isEvening = now > current.sunset - 3600; // Within 1 hour of sunset

  // Temperature thresholds
  const idealLow = idealTemp - 2;
  const idealHigh = idealTemp + 2;
  const tooHot = idealTemp + 3;

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

  // Priority 2: Close if way too hot
  if (temp > tooHot) {
    return {
      action: 'close',
      reason: `It's ${temp}°F - too hot outside`,
      priority: 'medium',
    };
  }

  // Priority 3: Close if high UV and warm (Arizona sun consideration)
  if (currentUV > 7 && temp > idealTemp) {
    return {
      action: 'close',
      reason: `High UV (${currentUV.toFixed(1)}) and ${temp}°F - will heat up fast`,
      priority: 'medium',
    };
  }

  // Priority 4: Open if temperature is ideal
  if (temp >= idealLow && temp <= idealHigh) {
    // Check UV if it's daytime
    if (!isNight && !isEvening && currentUV > 5) {
      return {
        action: 'neutral',
        reason: `Temperature is perfect (${temp}°F) but UV is ${currentUV.toFixed(1)}`,
        priority: 'low',
      };
    }

    return {
      action: 'open',
      reason: `Perfect weather! ${temp}°F with ${isNight ? 'no sun' : 'low UV (' + currentUV.toFixed(1) + ')'}`,
      priority: 'high',
    };
  }

  // Priority 5: Open if cooler than ideal with low UV or nighttime
  if (temp < idealLow && (isNight || currentUV < 5)) {
    return {
      action: 'open',
      reason: `Cool and pleasant at ${temp}°F`,
      priority: 'low',
    };
  }

  // Default: No strong recommendation
  return {
    action: 'neutral',
    reason: `Current: ${temp}°F, UV: ${currentUV.toFixed(1)}`,
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
export const checkAndNotify = (weatherData, idealTemp) => {
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
  const condition = evaluateWindowCondition(weatherData, idealTemp);

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
