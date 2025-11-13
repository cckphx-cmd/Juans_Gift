// Geolocation service for detecting user's location

import { storage } from '../utils/storage';

// Get user's current position using browser API
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        };

        // Save to localStorage
        storage.setLocation(location);

        resolve(location);
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }

        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
};

// Get location from storage or fetch new
export const getLocation = async () => {
  const stored = storage.getLocation();

  // If we have a recent location (less than 1 hour old), use it
  if (stored && stored.timestamp > Date.now() - 3600000) {
    return stored;
  }

  // Otherwise fetch new location
  return await getCurrentPosition();
};

// Watch for location changes (useful for mobile users)
export const watchLocation = (callback, errorCallback) => {
  if (!('geolocation' in navigator)) {
    errorCallback?.(new Error('Geolocation not supported'));
    return null;
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const location = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: Date.now(),
      };

      storage.setLocation(location);
      callback(location);
    },
    (error) => {
      errorCallback?.(error);
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
    }
  );

  return watchId;
};

// Stop watching location
export const stopWatchingLocation = (watchId) => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }
};

// Reverse geocode to get city name (using OpenWeatherMap Geocoding API)
export const getCityName = async (lat, lon, apiKey) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to reverse geocode');
    }

    const data = await response.json();
    if (data.length > 0) {
      return `${data[0].name}, ${data[0].state || data[0].country}`;
    }

    return 'Unknown Location';
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return 'Unknown Location';
  }
};
