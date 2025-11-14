// Weather service for fetching data from OpenWeatherMap API

const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const API_KEY_STORAGE_KEY = 'windowWeather_apiKey';

// Get API key from localStorage or environment
const getApiKey = () => {
  // First check localStorage
  const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
  if (storedKey) return storedKey;

  // Then check import.meta.env (Vite environment variables)
  if (import.meta.env.VITE_OPENWEATHER_API_KEY) {
    return import.meta.env.VITE_OPENWEATHER_API_KEY;
  }

  return null;
};

export const setApiKey = (key) => {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
};

export const hasApiKey = () => {
  return !!getApiKey();
};

// Convert Kelvin to Fahrenheit
const kelvinToFahrenheit = (kelvin) => {
  return Math.round((kelvin - 273.15) * 9/5 + 32);
};

// Convert meters per second to miles per hour
const msToMph = (ms) => {
  return Math.round(ms * 2.237);
};

// Get AQI color coding
export const getAQIColor = (aqi) => {
  if (aqi <= 50) return { color: 'text-green-400', bg: 'bg-green-500/20', label: 'Good' };
  if (aqi <= 100) return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Moderate' };
  if (aqi <= 150) return { color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'Unhealthy for Sensitive' };
  if (aqi <= 200) return { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Unhealthy' };
  if (aqi <= 300) return { color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Very Unhealthy' };
  return { color: 'text-red-600', bg: 'bg-red-600/20', label: 'Hazardous' };
};

// Get UV index level and color
export const getUVLevel = (uvIndex) => {
  if (uvIndex <= 2) return { level: 'Low', color: 'text-green-400', bg: 'bg-green-500/20' };
  if (uvIndex <= 5) return { level: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
  if (uvIndex <= 7) return { level: 'High', color: 'text-orange-400', bg: 'bg-orange-500/20' };
  if (uvIndex <= 10) return { level: 'Very High', color: 'text-red-400', bg: 'bg-red-500/20' };
  return { level: 'Extreme', color: 'text-purple-400', bg: 'bg-purple-500/20' };
};

// Fetch current weather data
export const fetchCurrentWeather = async (lat, lon) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key');
      }
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      temp: kelvinToFahrenheit(data.main.temp),
      feelsLike: kelvinToFahrenheit(data.main.feels_like),
      tempMin: kelvinToFahrenheit(data.main.temp_min),
      tempMax: kelvinToFahrenheit(data.main.temp_max),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: msToMph(data.wind.speed),
      windDeg: data.wind.deg,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      main: data.weather[0].main,
      clouds: data.clouds.all,
      timestamp: data.dt,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      cityName: data.name,
    };
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
};

// Estimate UV index based on time of day and season (FREE tier compatible)
// UV API is not available in free tier, so we use smart estimation
export const fetchUVIndex = async (lat, lon) => {
  // Time-based UV estimation optimized for Arizona/Phoenix climate
  const now = new Date();
  const hour = now.getHours();
  const month = now.getMonth() + 1; // 1-12

  let estimatedUV = 0;

  // Arizona gets very high UV, especially in summer
  // Peak UV: 10 AM - 4 PM
  // Summer months (May-Sep): Higher UV
  // Winter months (Nov-Feb): Lower UV

  const isSummer = month >= 5 && month <= 9;
  const isWinter = month >= 11 || month <= 2;

  if (hour >= 11 && hour <= 15) {
    // Peak sun hours (11 AM - 3 PM)
    estimatedUV = isSummer ? 10 : (isWinter ? 5 : 7);
  } else if (hour >= 10 && hour <= 16) {
    // Strong sun hours (10 AM - 4 PM)
    estimatedUV = isSummer ? 8 : (isWinter ? 4 : 6);
  } else if (hour >= 8 && hour <= 18) {
    // Morning/evening sun
    estimatedUV = isSummer ? 5 : (isWinter ? 2 : 3);
  } else if (hour >= 6 && hour <= 19) {
    // Early morning/late evening
    estimatedUV = isSummer ? 2 : 1;
  }
  // Otherwise estimatedUV stays 0 (nighttime)

  console.log(`UV Index estimated: ${estimatedUV} (Hour: ${hour}, Month: ${month})`);

  return {
    current: estimatedUV,
    hourly: [],
    isEstimated: true, // Flag to indicate this is estimated, not from API
  };
};

// Fetch air quality data
export const fetchAirQuality = async (lat, lon) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Air quality API error: ${response.status}`);
    }

    const data = await response.json();
    const aqi = data.list[0].main.aqi;

    // OpenWeatherMap AQI is 1-5, convert to US AQI scale (0-500)
    const aqiMap = {
      1: 25,   // Good
      2: 75,   // Fair
      3: 125,  // Moderate
      4: 175,  // Poor
      5: 300,  // Very Poor
    };

    return {
      aqi: aqiMap[aqi] || 0,
      components: data.list[0].components,
    };
  } catch (error) {
    console.error('Error fetching air quality:', error);
    // Return default if AQI data unavailable
    return { aqi: 0, components: {} };
  }
};

// Fetch forecast data (5-day, 3-hour intervals)
export const fetchForecast = async (lat, lon) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Forecast API error: ${response.status}`);
    }

    const data = await response.json();

    // Process forecast data for next 24 hours
    const now = Date.now() / 1000;
    const next24Hours = data.list
      .filter(item => item.dt > now && item.dt <= now + 86400)
      .map(item => ({
        dt: item.dt,
        temp: kelvinToFahrenheit(item.main.temp),
        feelsLike: kelvinToFahrenheit(item.main.feels_like),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        main: item.weather[0].main,
        windSpeed: msToMph(item.wind.speed),
        pop: item.pop * 100, // Probability of precipitation
        clouds: item.clouds.all,
      }));

    // Check for storms in next 24 hours
    const hasStorms = data.list.some(item => {
      const isNext24h = item.dt > now && item.dt <= now + 86400;
      const isStormy = ['Thunderstorm', 'Tornado'].includes(item.weather[0].main);
      return isNext24h && isStormy;
    });

    return {
      hourly: next24Hours,
      hasStorms,
    };
  } catch (error) {
    console.error('Error fetching forecast:', error);
    throw error;
  }
};

// Fetch all weather data (using only FREE tier APIs)
export const fetchAllWeatherData = async (lat, lon) => {
  try {
    // Fetch essential data first (current weather and forecast are critical)
    const [current, forecast] = await Promise.all([
      fetchCurrentWeather(lat, lon),
      fetchForecast(lat, lon),
    ]);

    // Fetch optional data (UV and air quality) - don't fail if these error
    let uvData = { current: 0, hourly: [], isEstimated: true };
    let airQuality = { aqi: 0, components: {} };

    try {
      uvData = await fetchUVIndex(lat, lon);
    } catch (error) {
      console.warn('UV data unavailable, using estimation:', error);
    }

    try {
      airQuality = await fetchAirQuality(lat, lon);
    } catch (error) {
      console.warn('Air quality data unavailable:', error);
    }

    return {
      current,
      uv: uvData,
      airQuality,
      forecast,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

// Get weather background class based on conditions
export const getWeatherBackground = (weatherData) => {
  if (!weatherData) return 'bg-clear';

  const { current } = weatherData;
  const now = Date.now() / 1000;

  // Check if it's nighttime
  const isNight = now < current.sunrise || now > current.sunset;

  if (isNight) return 'bg-night';

  // Daytime conditions
  if (current.main === 'Clear') return 'bg-sunny';
  if (current.main === 'Clouds') {
    return current.clouds > 70 ? 'bg-cloudy' : 'bg-clear';
  }
  if (['Rain', 'Drizzle', 'Thunderstorm'].includes(current.main)) return 'bg-rainy';

  return 'bg-clear';
};
