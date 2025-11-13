import { getAQIColor, getUVLevel } from '../services/weatherService';
import { evaluateWindowCondition } from '../services/notificationService';

const WeatherDisplay = ({ weatherData, idealTemp, onRefresh, isLoading }) => {
  if (!weatherData?.current) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <div className="text-white/60">
          {isLoading ? 'Loading weather data...' : 'No weather data available'}
        </div>
      </div>
    );
  }

  const { current, uv, airQuality, forecast } = weatherData;
  const uvLevel = getUVLevel(uv.current);
  const aqiInfo = getAQIColor(airQuality.aqi);
  const windowCondition = evaluateWindowCondition(weatherData, idealTemp);

  // Check if it's nighttime
  const now = Date.now() / 1000;
  const isNight = now < current.sunrise || now > current.sunset;

  // Format time
  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Get wind direction
  const getWindDirection = (deg) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  // Get recommendation icon and text
  const getRecommendation = () => {
    if (windowCondition.action === 'open') {
      return {
        icon: '🪟✅',
        text: 'Perfect! Time to open your windows!',
        color: 'text-green-400',
        bg: 'bg-green-500/20',
      };
    } else if (windowCondition.action === 'close') {
      return {
        icon: '🪟❌',
        text: 'Time to close your windows',
        color: 'text-orange-400',
        bg: 'bg-orange-500/20',
      };
    }
    return {
      icon: '🪟',
      text: 'Monitor conditions',
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
    };
  };

  const recommendation = getRecommendation();

  return (
    <div className="space-y-4">
      {/* Main Temperature Display */}
      <div className="glass rounded-3xl p-8 text-center">
        <div className="mb-4">
          <div className="text-white/80 text-lg mb-2">{current.cityName}</div>
          <div className="text-white/60 text-sm capitalize">{current.description}</div>
        </div>

        {/* Large temperature */}
        <div className="text-8xl font-thin text-white mb-2 animate-fade-in">
          {current.temp}°
        </div>

        <div className="text-white/70 text-lg mb-6">
          Feels like {current.feelsLike}°
        </div>

        {/* High/Low */}
        <div className="flex justify-center gap-8 text-white/80">
          <div>
            <div className="text-sm text-white/60">High</div>
            <div className="text-xl font-semibold">{current.tempMax}°</div>
          </div>
          <div>
            <div className="text-sm text-white/60">Low</div>
            <div className="text-xl font-semibold">{current.tempMin}°</div>
          </div>
        </div>
      </div>

      {/* Window Recommendation */}
      <div className={`${recommendation.bg} border border-white/20 rounded-2xl p-6`}>
        <div className="flex items-center gap-4">
          <div className="text-4xl">{recommendation.icon}</div>
          <div className="flex-1">
            <div className={`font-semibold ${recommendation.color} mb-1`}>
              {recommendation.text}
            </div>
            <div className="text-white/70 text-sm">
              {windowCondition.reason}
            </div>
          </div>
        </div>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* UV Index */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">☀️</span>
            <span className="text-white/70 text-sm">UV Index</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {uv.current.toFixed(1)}
          </div>
          <div className={`text-sm ${uvLevel.color}`}>
            {uvLevel.level}
          </div>
          {!isNight && uv.current > 3 && (
            <div className="text-xs text-white/50 mt-2">
              Sun strength affects heating
            </div>
          )}
        </div>

        {/* Wind */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">💨</span>
            <span className="text-white/70 text-sm">Wind</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {current.windSpeed}
          </div>
          <div className="text-sm text-white/70">
            mph {getWindDirection(current.windDeg)}
          </div>
        </div>

        {/* Air Quality */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🌫️</span>
            <span className="text-white/70 text-sm">Air Quality</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {airQuality.aqi}
          </div>
          <div className={`text-sm ${aqiInfo.color}`}>
            {aqiInfo.label}
          </div>
        </div>

        {/* Humidity */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">💧</span>
            <span className="text-white/70 text-sm">Humidity</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {current.humidity}%
          </div>
          <div className="text-sm text-white/70">
            {current.humidity > 70 ? 'Humid' : current.humidity < 30 ? 'Dry' : 'Comfortable'}
          </div>
        </div>
      </div>

      {/* Storm Warning */}
      {forecast?.hasStorms && (
        <div className="bg-red-500/20 border border-red-400/50 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <div className="text-red-400 font-semibold">Storm Warning</div>
              <div className="text-white/70 text-sm">
                Storms expected in the next 24 hours
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sun Times */}
      <div className="glass rounded-2xl p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌅</span>
            <div>
              <div className="text-white/60 text-xs">Sunrise</div>
              <div className="text-white font-semibold">{formatTime(current.sunrise)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌇</span>
            <div>
              <div className="text-white/60 text-xs">Sunset</div>
              <div className="text-white font-semibold">{formatTime(current.sunset)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="w-full glass rounded-2xl p-4 text-white font-semibold hover:bg-white/20 transition-smooth disabled:opacity-50"
      >
        {isLoading ? 'Refreshing...' : '🔄 Refresh Weather'}
      </button>

      {/* Last Updated */}
      <div className="text-center text-white/40 text-xs">
        Last updated: {new Date(weatherData.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default WeatherDisplay;
