# Weather App

A weather application that shows current weather conditions, forecast, and air quality data for any city. The app features a responsive design with dynamic backgrounds that change based on weather conditions.

![Weather App Screenshot](https://via.placeholder.com/800x450.png?text=Weather+App+Screenshot)

## Features

- Current weather conditions
- 4-day forecast
- Air quality information
- Dynamic backgrounds based on weather
- Unit toggle (°C/°F)
- Geolocation support
- Responsive design for all devices

## Setup Instructions

1. **Clone the repository**
   ```
   git clone https://github.com/yourusername/weather-app.git
   cd weather-app
   ```

2. **Set up API key**
   - Sign up for a free API key at [OpenWeatherMap](https://openweathermap.org/api)
   - Copy `config.example.js` to `config.js`
   - Replace 'YOUR_API_KEY_HERE' with your actual API key in `config.js`
   ```javascript
   // config.js
   const CONFIG = {
       API_KEY: 'your_actual_api_key_here'
   };
   ```

3. **Open the app**
   - Open `index.html` in your browser
   - OR use a local development server:
     ```
     npx serve
     ```

## Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla)
- OpenWeatherMap API