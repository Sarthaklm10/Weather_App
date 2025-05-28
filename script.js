const bodyElt = document.querySelector("body")
let isCelsius = true;

let weather = {
    fetchWeather: function (cityName) {
        if (!cityName || cityName.trim() === "") {
            this.showError("Please enter a city name");
            return;
        }

        this.showLoading();
        const baseURL = "https://api.openweathermap.org/data/2.5/weather?";
        const apiKey = this.getApiKey();
        if (!apiKey) {
            this.showError("API key not found. Please check your configuration.");
            return;
        }
        const fullURL = baseURL + "q=" + cityName + "&units=metric&appid=" + apiKey;

        fetch(fullURL)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('City not found. Please check spelling and try again.');
                    } else if (response.status === 401) {
                        throw new Error('API key error. Please check your configuration.');
                    } else {
                        throw new Error('Error fetching weather data: ' + response.statusText);
                    }
                }
                return response.json();
            })
            .then(weatherData => {
                this.displayWeather(weatherData);
                this.fetchAirQuality(weatherData.coord.lat, weatherData.coord.lon);
            })
            .catch(error => {
                this.showError(error.message);
                console.error("Weather fetch error:", error);
            })
            .finally(() => {
                this.hideLoading();
            });
    },

    fetchAirQuality: function (lat, lon) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            console.error("API key not found");
            return;
        }
        const aqiURL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

        fetch(aqiURL)
            .then(response => response.json())
            .then(data => {
                this.displayAirQuality(data.list[0].main.aqi);
            })
            .catch(error => {
                console.error("Error fetching air quality:", error);
            });
    },

    displayAirQuality: function (aqi) {
        const aqiElement = document.getElementById('air-quality-level');
        const aqiText = document.getElementById('air-quality-text');

        const aqiLevels = {
            1: { text: 'Good', width: '20%', color: '#4CAF50' },
            2: { text: 'Fair', width: '40%', color: '#FFC107' },
            3: { text: 'Moderate', width: '60%', color: '#FF9800' },
            4: { text: 'Poor', width: '80%', color: '#FF5722' },
            5: { text: 'Very Poor', width: '100%', color: '#F44336' }
        };

        const level = aqiLevels[aqi] || aqiLevels[1];
        aqiElement.style.width = level.width;
        aqiElement.style.backgroundColor = level.color;
        aqiText.textContent = level.text;
    },

    displayWeather: function (data) {
        setCardCompact(false);
        const cityName = data.name;
        const weatherIcon = data.weather[0].icon;
        const bodyElt = document.querySelector("body");
        const weatherDescription = data.weather[0].description;

        // Update page title with city and weather
        document.title = `${cityName} Weather - ${weatherDescription}`;

        // Add transition class for smooth change
        bodyElt.classList.add('weather-changing');
        
        setTimeout(() => {
            // Remove all weather-related classes first
            bodyElt.classList.remove(
                'weather-clear-day', 'weather-clear-night',
                'weather-clouds-day', 'weather-clouds-night',
                'weather-rain-day', 'weather-rain-night',
                'weather-thunderstorm', 'weather-snow',
                'weather-mist', 'weather-default', 'weather-changing'
            );

            // Add appropriate weather class based on condition
            switch (weatherIcon) {
                case "01d": // clear sky - day
                    bodyElt.classList.add('weather-clear-day');
                    break;
                case "01n": // clear sky - night
                    bodyElt.classList.add('weather-clear-night');
                    break;
                case "02d": // few clouds - day
                case "03d": // scattered clouds - day
                case "04d": // broken clouds - day
                    bodyElt.classList.add('weather-clouds-day');
                    break;
                case "02n": // few clouds - night
                case "03n": // scattered clouds - night
                case "04n": // broken clouds - night
                    bodyElt.classList.add('weather-clouds-night');
                    break;
                case "09d": // shower rain - day
                case "10d": // rain - day
                    bodyElt.classList.add('weather-rain-day');
                    break;
                case "09n": // shower rain - night
                case "10n": // rain - night
                    bodyElt.classList.add('weather-rain-night');
                    break;
                case "11d": // thunderstorm - day
                case "11n": // thunderstorm - night
                    bodyElt.classList.add('weather-thunderstorm');
                    break;
                case "13d": // snow - day
                case "13n": // snow - night
                    bodyElt.classList.add('weather-snow');
                    break;
                case "50d": // mist - day
                case "50n": // mist - night
                    bodyElt.classList.add('weather-mist');
                    break;
                default:
                    bodyElt.classList.add('weather-default');
                    break;
            }
        }, 100);

        const temperature = data.main.temp;
        const feelsLike = data.main.feels_like;
        const humidityLevel = data.main.humidity;
        const windSpeed = data.wind.speed;
        const pressure = data.main.pressure;

        const cityElement = document.querySelector(".city");
        const iconElement = document.querySelector(".icon");
        const descriptionElement = document.querySelector(".description");
        const tempElement = document.querySelector(".temp");
        const feelsLikeElement = document.getElementById("feels-like");
        const humidityElement = document.getElementById("humidity-info");
        const windElement = document.getElementById("wind-info");
        const pressureElement = document.getElementById("pressure-info");
        const weatherCard = document.querySelector(".weather");

        cityElement.innerText = cityName;
        iconElement.src = "https://openweathermap.org/img/wn/" + weatherIcon + ".png";
        descriptionElement.innerText = weatherDescription;
        tempElement.innerText = this.formatTemperature(temperature);
        feelsLikeElement.innerText = this.formatTemperature(feelsLike);
        humidityElement.innerText = "Humidity: " + humidityLevel + "%";
        windElement.innerText = "Wind speed: " + windSpeed + " m/s";
        pressureElement.innerText = "Pressure: " + pressure + " hPa";

        weatherCard.classList.remove("loading", "visible");
        setTimeout(() => {
            weatherCard.classList.add("visible");
        }, 200);
    },

    formatTemperature: function (temp) {
        if (!isCelsius) {
            temp = (temp * 9 / 5) + 32;
        }
        return Math.round(temp) + (isCelsius ? "°C" : "°F");
    },

    fetchForecast: function (cityName) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            console.error("API key not found");
            return;
        }
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${apiKey}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.cod !== "200") {
                    throw new Error("Forecast fetch failed");
                }
                this.displayForecast(data.list);
            })
            .catch(error => {
                console.error("Error fetching forecast data:", error);
            });
    },

    displayForecast: function (forecastList) {
        const forecastContainer = document.querySelector(".forecast");
        forecastContainer.innerHTML = "";

        const dailyData = {};
        forecastList.forEach(entry => {
            if (entry.dt_txt.includes("12:00:00")) {
                const date = entry.dt_txt.split(" ")[0];
                if (!dailyData[date]) {
                    dailyData[date] = entry;
                }
            }
        });

        const dates = Object.keys(dailyData).slice(0, 4);
        dates.forEach(day => {
            const forecast = dailyData[day];
            const forecastCard = document.createElement("div");
            forecastCard.classList.add("forecast-card");

            forecastCard.innerHTML = `
                <h4>${new Date(forecast.dt_txt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</h4>
                <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="${forecast.weather[0].description}">
                <p>${forecast.weather[0].main}</p>
                <p>Temp: ${this.formatTemperature(forecast.main.temp)}</p>
                <p>Humidity: ${forecast.main.humidity}%</p>
            `;

            forecastContainer.appendChild(forecastCard);
            forecastCard.classList.add("visible");
        });
    },

    search: function () {
        const inputElement = document.querySelector(".searchbar");
        const userCity = inputElement.value.trim();

        if (userCity === "") {
            this.showError("Please enter a city name.");
        } else {
            this.fetchWeather(userCity);
            this.fetchForecast(userCity);
        }
        inputElement.blur();
    },

    getCurrentLocation: function () {
        if (navigator.geolocation) {
            this.showLoading();
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    this.fetchWeatherByCoords(latitude, longitude);
                },
                error => {
                    this.showError("Unable to get your location. Please enter a city manually.");
                    this.hideLoading();
                }
            );
        } else {
            this.showError("Geolocation is not supported by your browser.");
        }
    },

    fetchWeatherByCoords: function (lat, lon) {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${CONFIG.API_KEY}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                this.displayWeather(data);
                this.fetchAirQuality(lat, lon);
                this.fetchForecast(data.name);
            })
            .catch(error => {
                this.showError("Error fetching weather data");
            })
            .finally(() => {
                this.hideLoading();
            });
    },

    showLoading: function () {
        setCardCompact(true);
        document.getElementById('loading-animation').style.display = 'block';
        document.getElementById('error-message').style.display = 'none';
    },

    hideLoading: function () {
        document.getElementById('loading-animation').style.display = 'none';
    },

    showError: function (message) {
        setCardCompact(true);
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = message;
        errorElement.style.display = 'block';

        // Hide loading animation if it's showing
        this.hideLoading();

        // Hide weather data if it's showing
        document.querySelector(".weather").classList.remove("visible");
        document.querySelector(".weather").classList.add("loading");

        // Clear forecast
        document.querySelector(".forecast").innerHTML = "";

        // Auto-dismiss error after 5 seconds
        setTimeout(() => {
            if (errorElement.style.display === 'block') {
                errorElement.style.opacity = '0';
                setTimeout(() => {
                    errorElement.style.display = 'none';
                    errorElement.style.opacity = '1';
                }, 500);
            }
        }, 5000);
    },

    toggleUnit: function () {
        isCelsius = !isCelsius;

        // Get the current search input value
        const searchInput = document.querySelector(".searchbar").value.trim();

        // If we have an active search result, refresh it with the new unit
        if (searchInput) {
            this.fetchWeather(searchInput);
            this.fetchForecast(searchInput);
        }
    },

    getApiKey: function () {
        return '9b7c759da968a70964d50985292991e8';
    }
};

const searchButton = document.querySelector(".search button");
searchButton.addEventListener("click", function () {
    weather.search();
});

const searchInput = document.querySelector(".searchbar");
searchInput.addEventListener("keyup", function (event) {
    const pressedKey = event.key;
    if (pressedKey === "Enter") {
        weather.search();
    }
});

document.getElementById("location-button").addEventListener("click", () => weather.getCurrentLocation());

document.getElementById("unit-toggle").addEventListener("click", () => weather.toggleUnit());

function setCardCompact(isCompact) {
    const card = document.querySelector('.card');
    if (isCompact) {
        card.classList.add('compact');
    }
    else {
        card.classList.remove('compact');
    }
}

setCardCompact(true);
document.querySelector(".weather").classList.add("loading");
document.querySelector(".weather").classList.remove("visible");

// Set default background
document.querySelector("body").classList.add("weather-default");
