import { useState, useEffect } from 'react';

const TemperatureSlider = ({ tempRange, currentTemp, onChange }) => {
  const [minValue, setMinValue] = useState(tempRange.min);
  const [maxValue, setMaxValue] = useState(tempRange.max);

  useEffect(() => {
    setMinValue(tempRange.min);
    setMaxValue(tempRange.max);
  }, [tempRange.min, tempRange.max]);

  const handleMinChange = (e) => {
    const newMin = parseInt(e.target.value);
    // Don't allow min to exceed max
    if (newMin < maxValue) {
      setMinValue(newMin);
    }
  };

  const handleMaxChange = (e) => {
    const newMax = parseInt(e.target.value);
    // Don't allow max to go below min
    if (newMax > minValue) {
      setMaxValue(newMax);
    }
  };

  const handleRelease = () => {
    onChange({ min: minValue, max: maxValue });
  };

  const isInRange = currentTemp >= minValue && currentTemp <= maxValue;
  const getRangeText = () => {
    if (!currentTemp) return '';

    if (isInRange) {
      return `Perfect! ${currentTemp}°F is in your range 🎯`;
    }
    if (currentTemp < minValue) {
      return `${minValue - currentTemp}° below your minimum`;
    }
    return `${currentTemp - maxValue}° above your maximum`;
  };

  const getRangeColor = () => {
    if (!currentTemp) return 'text-white/60';
    if (isInRange) return 'text-green-400';
    if (Math.abs(currentTemp - minValue) < 5 || Math.abs(currentTemp - maxValue) < 5) {
      return 'text-yellow-400';
    }
    return 'text-orange-400';
  };

  // Calculate percentage for visual display
  const minPercent = ((minValue - 50) / 40) * 100;
  const maxPercent = ((maxValue - 50) / 40) * 100;

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Your Comfortable Range</h3>
        <div className="text-2xl font-bold text-white">
          {minValue}°F - {maxValue}°F
        </div>
      </div>

      {/* Dual Range Slider Container */}
      <div className="mb-4 relative">
        {/* Background track */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-3 rounded-full bg-white/10"></div>

        {/* Active range highlight */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-3 rounded-full bg-green-500"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
        ></div>

        {/* Min slider */}
        <input
          type="range"
          min="50"
          max="90"
          value={minValue}
          onChange={handleMinChange}
          onMouseUp={handleRelease}
          onTouchEnd={handleRelease}
          className="absolute w-full h-3 appearance-none cursor-pointer bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto"
          style={{ zIndex: minValue > 50 + 20 ? 5 : 3 }}
        />

        {/* Max slider */}
        <input
          type="range"
          min="50"
          max="90"
          value={maxValue}
          onChange={handleMaxChange}
          onMouseUp={handleRelease}
          onTouchEnd={handleRelease}
          className="absolute w-full h-3 appearance-none cursor-pointer bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto"
          style={{ zIndex: 4 }}
        />

        {/* Labels */}
        <div className="flex justify-between text-white/60 text-xs mt-10">
          <span>50°F</span>
          <span>70°F</span>
          <span>90°F</span>
        </div>
      </div>

      {/* Individual values */}
      <div className="flex justify-between items-center mb-3 text-sm">
        <div className="text-white/70">
          <span className="text-white/50">Min: </span>
          <span className="text-white font-semibold">{minValue}°F</span>
        </div>
        <div className="text-white/70">
          <span className="text-white/50">Max: </span>
          <span className="text-white font-semibold">{maxValue}°F</span>
        </div>
      </div>

      {/* Current temperature status */}
      {currentTemp && (
        <div className={`text-center ${getRangeColor()} font-medium text-sm mt-4`}>
          {getRangeText()}
        </div>
      )}

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          transition: transform 0.2s;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        input[type="range"]::-webkit-slider-thumb:active {
          transform: scale(1.0);
        }

        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          transition: transform 0.2s;
        }

        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.2);
        }

        input[type="range"]::-moz-range-thumb:active {
          transform: scale(1.0);
        }
      `}</style>
    </div>
  );
};

export default TemperatureSlider;
