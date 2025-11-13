import { useState } from 'react';

const ApiKeyPrompt = ({ onSubmit }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    if (apiKey.length < 20) {
      setError('API key seems too short');
      return;
    }

    onSubmit(apiKey.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center p-4">
      <div className="glass rounded-3xl p-8 max-w-md w-full animate-fade-in">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🪟</div>
          <h1 className="text-3xl font-bold text-white mb-2">Window Weather</h1>
          <p className="text-white/80 text-sm">Smart alerts for opening your windows</p>
        </div>

        <div className="bg-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-3">Setup Required</h2>
          <p className="text-white/80 text-sm mb-4">
            To get started, you'll need a free OpenWeatherMap API key.
          </p>

          <div className="space-y-2 text-sm text-white/70">
            <p>1. Visit <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline">openweathermap.org/api</a></p>
            <p>2. Sign up for a free account</p>
            <p>3. Generate an API key</p>
            <p>4. Paste it below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError('');
              }}
              placeholder="Enter your API key"
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-smooth"
            />
            {error && (
              <p className="text-red-300 text-sm mt-2">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-white/90 transition-smooth"
          >
            Get Started
          </button>
        </form>

        <p className="text-white/60 text-xs text-center mt-6">
          Your API key is stored locally and never sent anywhere except OpenWeatherMap
        </p>
      </div>
    </div>
  );
};

export default ApiKeyPrompt;
