
let weather = {
    fetchWeather: function (cityName) {
        const baseURL = "https://api.openweathermap.org/data/2.5/weather?";
        const fullURL = baseURL + "q=" + cityName + "&units=metric&appid=" + CONFIG.API_KEY;

        fetch(fullURL)
            .then(function (response) {
                console.log(response);
                return response.json();
            })
            .then(function (weatherData) {

                console.log(weatherData);
                weather.displayWeather(weatherData);
            })
            .catch(function (error) {
                console.error("Error fetching weather data:", error);
            });
    },

    displayWeather: function (data) {
        const cityName = data.name;
        const weatherIcon = data.weather[0].icon;
        const weatherDescription = data.weather[0].description;
        const temperature = data.main.temp;
        const humidityLevel = data.main.humidity;
        const windSpeed = data.wind.speed;

        const cityElement = document.querySelector(".city");
        const iconElement = document.querySelector(".icon");
        const descriptionElement = document.querySelector(".description");
        const tempElement = document.querySelector(".temp");
        const humidityElement = document.querySelector(".humidity");
        const windElement = document.querySelector(".wind");
        const weatherCard = document.querySelector(".weather");

        cityElement.innerText = cityName;
        iconElement.src = "https://openweathermap.org/img/wn/" + weatherIcon + ".png";
        descriptionElement.innerText = weatherDescription;
        tempElement.innerText = temperature + "°C";
        humidityElement.innerText = "Humidity: " + humidityLevel + "%";
        windElement.innerText = "Wind speed: " + windSpeed + " km/h";

        weatherCard.classList.remove("loading", "visible");
        setTimeout(() => {
            weatherCard.classList.add("visible");
        }, 200);
    },

    fetchForecast: function (cityName) {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${CONFIG.API_KEY}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.cod !== "200") {
                    console.error("Forecast fetch failed:", data.message);
                    return;
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
                <h4>${new Date(forecast.dt_txt).toDateString()}</h4>
                <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="${forecast.weather[0].description}">
                <p>${forecast.weather[0].main}</p>
                <p>Temp: ${forecast.main.temp}°C</p>
                <p>Humidity: ${forecast.main.humidity}%</p>
            `;

            forecastContainer.appendChild(forecastCard);

            forecastCard.classList.add("visible")
        });
    },

    search: function () {
        const inputElement = document.querySelector(".searchbar");
        const userCity = inputElement.value;

        if (userCity === "") {
            alert("Please enter a city name.");
        } else {
            this.fetchWeather(userCity);
            this.fetchForecast(userCity);
        }
        inputElement.blur();
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
