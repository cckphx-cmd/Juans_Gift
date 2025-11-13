# 🪟 Window Weather

A smart, mobile-first web application that sends intelligent notifications about when to open or close your windows based on real-time weather conditions. Optimized for Arizona's intense sun and heat!

![Window Weather](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg?logo=vite)

## ✨ Features

### Smart Notifications
- **Temperature-based alerts**: Get notified when conditions are perfect for opening your windows
- **UV Index awareness**: Factors in sun intensity to prevent your home from heating up
- **Storm warnings**: Alerts when severe weather is expected
- **Quiet hours**: Customize when you want to receive notifications
- **Snooze functionality**: Pause notifications for 30 minutes when you're away

### Weather Intelligence
- **Real-time data**: Temperature, wind speed, UV index, and air quality
- **24-hour forecast**: See temperature trends to plan ahead
- **Arizona-optimized**: Smart logic that considers 80°F + high UV = too hot!
- **Offline support**: Shows cached data when internet is unavailable

### Beautiful UI
- **iPhone Weather app style**: Clean, minimal design with large readable text
- **Dynamic backgrounds**: Colors change based on weather conditions (sunny, cloudy, night, rainy)
- **Smooth animations**: Polished transitions and fade effects
- **Mobile-first**: Perfect on phones, great on desktop

### User Controls
- **Easy temperature slider**: Set your ideal temperature with a large, intuitive slider
- **Settings panel**: Configure quiet hours and notification preferences
- **First-time onboarding**: Clear explanation of how the app works
- **Location detection**: Automatic geolocation with manual override option

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A free OpenWeatherMap API key ([get one here](https://openweathermap.org/api))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd window-weather
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your API key** (Optional - you can also enter it in the app)
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenWeatherMap API key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in your browser**
   - Navigate to `http://localhost:5173`
   - Allow location permissions when prompted
   - Enter your API key if you didn't set it in .env
   - Complete the onboarding flow

## 🔧 Configuration

### Getting an API Key

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to "API keys" in your account dashboard
4. Generate a new API key
5. Copy and paste it into the app (or add to `.env` file)

**Note**: Free tier includes:
- 1,000 API calls per day
- Current weather data
- 5-day forecast
- UV index
- Air quality index

### Notification Logic

The app uses smart rules to determine when to send alerts:

**Open Windows Alert** 🪟✅
- Temperature within 2° of your ideal AND
- Either nighttime OR UV index < 5

**Close Windows Alert** 🪟❌
- Temperature > ideal + 3°F, OR
- UV index > 7 AND temperature > ideal

**No Duplicate Alerts**
- Same alert type won't repeat within 1 hour
- Respects quiet hours settings
- Can be snoozed for 30 minutes

### Customization

**Ideal Temperature**
- Default: 75°F
- Range: 50°F - 90°F
- Adjustable with slider in app

**Quiet Hours**
- Default: 8 AM - 10 PM (notifications allowed)
- Customize in Settings panel
- Can be disabled completely

**Weather Refresh**
- Automatic: Every 15 minutes
- Manual: Tap "Refresh Weather" button
- Cached data available offline

## 📱 Mobile Installation

### iOS (Safari)
1. Open the app in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"
5. Launch from your home screen like a native app!

### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home Screen"
4. Tap "Add"
5. Launch from your home screen!

## 🏗️ Project Structure

```
window-weather/
├── src/
│   ├── components/          # React components
│   │   ├── ApiKeyPrompt.jsx
│   │   ├── OnboardingFlow.jsx
│   │   ├── WeatherDisplay.jsx
│   │   ├── TemperatureSlider.jsx
│   │   ├── TemperatureChart.jsx
│   │   └── SettingsPanel.jsx
│   ├── services/            # Business logic
│   │   ├── weatherService.js
│   │   ├── notificationService.js
│   │   └── geolocationService.js
│   ├── utils/               # Utilities
│   │   └── storage.js
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── public/                  # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
└── README.md              # This file
```

## 🛠️ Tech Stack

- **React 18.3** - UI framework
- **Vite 5.4** - Build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Recharts 2.10** - Temperature chart visualization
- **OpenWeatherMap API** - Weather data source
- **Browser APIs**:
  - Geolocation API - Location detection
  - Notification API - Push notifications
  - LocalStorage API - Data persistence

## 🎨 Design Philosophy

**Mobile-First**
- Designed for phones, perfect on desktop
- Large touch targets and readable text
- Smooth animations and transitions

**Arizona-Optimized**
- Considers UV index for sun intensity
- Prevents home heating from strong sun
- Perfect for hot, sunny climates

**Privacy-Focused**
- All data stored locally
- API key never leaves your device
- No tracking or analytics

**Offline-Capable**
- Caches weather data
- Works without internet (with cached data)
- Graceful error handling

## 🔔 Browser Notification Permissions

The app requires notification permissions to send window alerts. Here's how to manage them:

### Chrome/Edge
1. Click the lock icon in the address bar
2. Find "Notifications"
3. Select "Allow"

### Firefox
1. Click the lock icon in the address bar
2. Click "Permissions"
3. Change Notifications to "Allow"

### Safari (macOS)
1. Safari → Settings → Websites
2. Go to Notifications
3. Find your site and select "Allow"

### Safari (iOS)
1. Settings → Safari → Notifications
2. Enable "Allow Websites to Ask for Permission to Send Push Notifications"

## 🐛 Troubleshooting

**"Invalid API key" error**
- Verify your API key is correct
- New keys can take a few minutes to activate
- Check you're using the correct API product (free tier)

**Location not detected**
- Ensure location permissions are granted
- Try refreshing the page
- Check your device's location services are enabled

**Notifications not working**
- Check notification permissions in browser settings
- Verify notifications are enabled in app settings
- Make sure you're not in quiet hours
- Check if notifications are snoozed

**Weather data not loading**
- Check your internet connection
- Verify API key is valid
- Try refreshing the page
- Check browser console for errors

**Chart not displaying**
- Ensure forecast data is loaded
- Try refreshing weather data
- Check browser console for errors

## 📊 API Usage

The app makes the following API calls:
- **Current weather**: 1 call per refresh
- **UV index**: 1 call per refresh
- **Air quality**: 1 call per refresh
- **Forecast**: 1 call per refresh

**Total**: ~4 calls per refresh × 96 refreshes/day = ~384 calls/day (well within free tier)

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Deploy to Static Hosting

The app is a static site and can be deployed to:
- **Vercel**: `vercel deploy`
- **Netlify**: Drag & drop `dist/` folder
- **GitHub Pages**: Push `dist/` to `gh-pages` branch
- **Cloudflare Pages**: Connect repository
- **Any static host**: Upload `dist/` contents

### Environment Variables

If deploying, set `VITE_OPENWEATHER_API_KEY` in your hosting provider's environment variables. Users can also enter their own API key in the app.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Icons and emojis from system fonts
- Inspired by iOS Weather app design
- Built for Juan's gift 🎁

## 📞 Support

If you encounter any issues or have questions:
1. Check the Troubleshooting section above
2. Review OpenWeatherMap API documentation
3. Open an issue on GitHub
4. Check browser console for error messages

---

**Made with ❤️ for perfect window weather!**

Enjoy your perfectly temperature-controlled home! 🪟🌤️
