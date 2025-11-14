import { useState, useEffect, useCallback } from 'react';
import WeatherDisplay from './components/WeatherDisplay';
import TemperatureSlider from './components/TemperatureSlider';
import TemperatureChart from './components/TemperatureChart';
import SettingsPanel from './components/SettingsPanel';
import OnboardingFlow from './components/OnboardingFlow';
import ApiKeyPrompt from './components/ApiKeyPrompt';
import { storage } from './utils/storage';
import { getLocation } from './services/geolocationService';
import {
  fetchAllWeatherData,
  getWeatherBackground,
  hasApiKey,
  setApiKey as saveApiKey,
} from './services/weatherService';
import {
  requestNotificationPermission,
  checkAndNotify,
  snoozeNotifications,
  getRemainingSnoozeTime,
} from './services/notificationService';

function App() {
  // State management
  const [apiKeyConfigured, setApiKeyConfigured] = useState(hasApiKey());
  const [showOnboarding, setShowOnboarding] = useState(!storage.isOnboardingComplete());
  const [showSettings, setShowSettings] = useState(false);
  const [weatherData, setWeatherData] = useState(storage.getLastWeatherData());
  const [idealTemp, setIdealTemp] = useState(storage.getIdealTemp());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [snoozedMinutes, setSnoozedMinutes] = useState(getRemainingSnoozeTime());

  // Background gradient class
  const bgClass = getWeatherBackground(weatherData);

  // Fetch weather data
  const fetchWeather = useCallback(async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setIsLoading(true);
      }
      setError(null);

      // Get location
      const loc = await getLocation();
      setLocation(loc);

      // Fetch weather data
      const data = await fetchAllWeatherData(loc.lat, loc.lon);
      setWeatherData(data);

      // Save to localStorage for offline access
      storage.setLastWeatherData(data);

      // Check if we should send a notification
      checkAndNotify(data, idealTemp);
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError(err.message);

      // Try to use cached data if available
      const cachedData = storage.getLastWeatherData();
      if (cachedData && !weatherData) {
        setWeatherData(cachedData);
      }
    } finally {
      setIsLoading(false);
    }
  }, [idealTemp, weatherData]);

  // Initialize app
  useEffect(() => {
    if (!apiKeyConfigured || showOnboarding) return;

    // Request notification permission
    requestNotificationPermission();

    // Initial weather fetch
    fetchWeather();

    // Set up periodic weather checks (every 15 minutes)
    const interval = setInterval(() => {
      fetchWeather(false); // Silent refresh
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [apiKeyConfigured, showOnboarding, fetchWeather]);

  // Update snooze status every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setSnoozedMinutes(getRemainingSnoozeTime());
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle API key submission
  const handleApiKeySubmit = (key) => {
    saveApiKey(key);
    setApiKeyConfigured(true);
  };

  // Handle onboarding complete
  const handleOnboardingComplete = () => {
    storage.setOnboardingComplete();
    setShowOnboarding(false);

    // Request notification permission after onboarding
    requestNotificationPermission();
  };

  // Handle ideal temperature change
  const handleIdealTempChange = (newTemp) => {
    setIdealTemp(newTemp);
    storage.setIdealTemp(newTemp);

    // Recheck notification logic with new temperature
    if (weatherData) {
      checkAndNotify(weatherData, newTemp);
    }
  };

  // Handle snooze
  const handleSnooze = () => {
    snoozeNotifications(30);
    setSnoozedMinutes(30);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchWeather(true);
  };

  // Show API key prompt if not configured
  if (!apiKeyConfigured) {
    return <ApiKeyPrompt onSubmit={handleApiKeySubmit} />;
  }

  return (
    <div className={`min-h-screen ${bgClass} transition-smooth`}>
      {/* Onboarding */}
      {showOnboarding && (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      )}

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          onSettingsChange={() => {
            // Refresh weather after settings change
            fetchWeather(false);
          }}
        />
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              🪟 Window Weather
            </h1>
            {location && (
              <p className="text-white/60 text-sm mt-1">
                📍 {weatherData?.current?.cityName || 'Locating...'}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="glass rounded-full p-3 hover:bg-white/20 transition-smooth"
            aria-label="Settings"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-400/50 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <div className="text-red-400 font-semibold mb-1">Error</div>
                <div className="text-white/70 text-sm">{error}</div>
                {weatherData && (
                  <div className="text-white/50 text-xs mt-2">
                    Showing cached data
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Default Location Indicator */}
        {location?.isDefault && !error && (
          <div className="bg-blue-500/20 border border-blue-400/50 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📍</span>
              <div className="flex-1">
                <div className="text-blue-400 font-semibold mb-1">Using Default Location</div>
                <div className="text-white/70 text-sm">
                  Auto-detection unavailable. Showing weather for Phoenix, AZ.
                </div>
                <div className="text-white/50 text-xs mt-2">
                  Enable location services in System Settings to use your actual location
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Snooze Indicator */}
        {snoozedMinutes > 0 && (
          <div className="bg-purple-500/20 border border-purple-400/50 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">😴</span>
                <div>
                  <div className="text-purple-400 font-semibold">
                    Notifications Snoozed
                  </div>
                  <div className="text-white/70 text-sm">
                    {snoozedMinutes} minutes remaining
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Temperature Slider */}
        <div className="mb-6">
          <TemperatureSlider
            idealTemp={idealTemp}
            currentTemp={weatherData?.current?.temp}
            onChange={handleIdealTempChange}
          />
        </div>

        {/* Snooze Button */}
        {snoozedMinutes === 0 && (
          <div className="mb-6">
            <button
              onClick={handleSnooze}
              className="w-full glass rounded-2xl p-4 text-white font-semibold hover:bg-white/20 transition-smooth flex items-center justify-center gap-2"
            >
              😴 Snooze Notifications (30 min)
            </button>
          </div>
        )}

        {/* Weather Display */}
        <div className="mb-6">
          <WeatherDisplay
            weatherData={weatherData}
            idealTemp={idealTemp}
            onRefresh={handleRefresh}
            isLoading={isLoading}
          />
        </div>

        {/* Temperature Chart */}
        {weatherData && (
          <div className="mb-6">
            <TemperatureChart
              weatherData={weatherData}
              idealTemp={idealTemp}
            />
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-white/40 text-xs mt-8 mb-4">
          <p>Made for perfect window weather</p>
          <p className="mt-2">
            Optimized for Arizona's intense sun ☀️
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
