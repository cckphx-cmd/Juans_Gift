import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const TemperatureChart = ({ weatherData, tempRange }) => {
  if (!weatherData?.forecast?.hourly) {
    return (
      <div className="glass rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Temperature Trend</h3>
        <div className="text-white/60 text-center py-8">
          Loading forecast data...
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = weatherData.forecast.hourly.map((item) => {
    const date = new Date(item.dt * 1000);
    return {
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      temp: item.temp,
      feelsLike: item.feelsLike,
      timestamp: item.dt,
    };
  });

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass rounded-lg p-3 border border-white/20">
          <p className="text-white font-semibold text-sm">{data.time}</p>
          <p className="text-blue-300 text-sm">Temp: {data.temp}°F</p>
          <p className="text-purple-300 text-sm">Feels: {data.feelsLike}°F</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-white font-semibold mb-4">24-Hour Temperature Trend</h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="time"
              stroke="rgba(255,255,255,0.6)"
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="rgba(255,255,255,0.6)"
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Minimum comfortable temperature reference line */}
            <ReferenceLine
              y={tempRange.min}
              stroke="#10b981"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: `Min ${tempRange.min}°F`,
                fill: '#10b981',
                fontSize: 11,
                position: 'insideBottomRight',
              }}
            />

            {/* Maximum comfortable temperature reference line */}
            <ReferenceLine
              y={tempRange.max}
              stroke="#10b981"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: `Max ${tempRange.max}°F`,
                fill: '#10b981',
                fontSize: 11,
                position: 'insideTopRight',
              }}
            />

            <Line
              type="monotone"
              dataKey="temp"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Temperature"
            />
            <Line
              type="monotone"
              dataKey="feelsLike"
              stroke="#a855f7"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Feels Like"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-blue-500 rounded"></div>
          <span className="text-white/70">Temperature</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-purple-500 rounded" style={{ backgroundImage: 'repeating-linear-gradient(to right, #a855f7 0, #a855f7 5px, transparent 5px, transparent 10px)' }}></div>
          <span className="text-white/70">Feels Like</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-green-500 rounded" style={{ backgroundImage: 'repeating-linear-gradient(to right, #10b981 0, #10b981 5px, transparent 5px, transparent 10px)' }}></div>
          <span className="text-white/70">Your Range ({tempRange.min}-{tempRange.max}°F)</span>
        </div>
      </div>
    </div>
  );
};

export default TemperatureChart;
