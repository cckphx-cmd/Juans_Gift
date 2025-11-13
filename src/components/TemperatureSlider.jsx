import { useState, useEffect } from 'react';

const TemperatureSlider = ({ idealTemp, currentTemp, onChange }) => {
  const [value, setValue] = useState(idealTemp);

  useEffect(() => {
    setValue(idealTemp);
  }, [idealTemp]);

  const handleChange = (e) => {
    const newValue = parseInt(e.target.value);
    setValue(newValue);
  };

  const handleRelease = () => {
    onChange(value);
  };

  const difference = currentTemp - value;
  const getDifferenceText = () => {
    if (Math.abs(difference) < 2) {
      return 'Perfect temperature! 🎯';
    }
    if (difference > 0) {
      return `Currently ${Math.abs(difference)}° warmer than ideal`;
    }
    return `Currently ${Math.abs(difference)}° cooler than ideal`;
  };

  const getDifferenceColor = () => {
    if (Math.abs(difference) < 2) return 'text-green-400';
    if (Math.abs(difference) < 5) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Your Ideal Temperature</h3>
        <div className="text-3xl font-bold text-white">{value}°F</div>
      </div>

      {/* Slider */}
      <div className="mb-4">
        <input
          type="range"
          min="50"
          max="90"
          value={value}
          onChange={handleChange}
          onMouseUp={handleRelease}
          onTouchEnd={handleRelease}
          className="w-full h-3 rounded-full appearance-none cursor-pointer bg-white/20"
          style={{
            background: `linear-gradient(to right,
              #3b82f6 0%,
              #10b981 ${((value - 50) / 40) * 100}%,
              #ef4444 100%)`,
          }}
        />
        <div className="flex justify-between text-white/60 text-xs mt-2">
          <span>50°F</span>
          <span>90°F</span>
        </div>
      </div>

      {/* Difference indicator */}
      {currentTemp && (
        <div className={`text-center ${getDifferenceColor()} font-medium text-sm`}>
          {getDifferenceText()}
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
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }

        input[type="range"]::-webkit-slider-thumb:active {
          transform: scale(0.95);
        }

        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s;
        }

        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.1);
        }

        input[type="range"]::-moz-range-thumb:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
};

export default TemperatureSlider;
