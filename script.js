// Added Api key directly here for ease of use
// Note to self: In production, consider using environment variables or a secure vault. If exposed, regenerate the key immediately.
const API_KEY = "4bf3d25ab550b8859fa8aaf699577efb"; 

let currentWeatherData = null;

// Weather icon mapping
const weatherIcons = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️'
};

function updateBackground(weatherMain) {
    const body = document.body;
    const footer = document.getElementById('footer');
    body.className = '';
    footer.className = '';
    
    const weatherLower = weatherMain.toLowerCase();
    
    let weatherClass = 'default';
    if (weatherLower.includes('clear')) {
        weatherClass = 'clear-sky';
    } else if (weatherLower.includes('cloud')) {
        weatherClass = 'clouds';
    } else if (weatherLower.includes('rain') || weatherLower.includes('drizzle')) {
        weatherClass = 'rain';
    } else if (weatherLower.includes('thunderstorm')) {
        weatherClass = 'thunderstorm';
    } else if (weatherLower.includes('snow')) {
        weatherClass = 'snow';
    } else if (weatherLower.includes('mist') || weatherLower.includes('fog') || weatherLower.includes('haze')) {
        weatherClass = 'mist';
    }
    
    body.classList.add(weatherClass);
    footer.classList.add(weatherClass);
}

function formatDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
}

function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

async function getWeather() {
    const city = document.getElementById('cityInput').value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const weatherInfo = document.getElementById('weatherInfo');

    loading.style.display = 'block';
    error.style.display = 'none';
    weatherInfo.style.display = 'none';

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);

        const data = await response.json();

        if (!response.ok) {
            if (data.message) {
                throw new Error(data.message);
            } else if (response.status === 401) {
                throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
            } else if (response.status === 404) {
                throw new Error('City not found. Please check the spelling.');
            } else {
                throw new Error(`Error: ${response.status}`);
            }
        }

        currentWeatherData = data;
        displayWeather(data);
    } catch (err) {
        showError(err.message || 'Failed to fetch weather data');
    } finally {
        loading.style.display = 'none';
    }
}

function displayWeather(data) {
    document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('date').textContent = formatDate();
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('description').textContent = data.weather[0].description;
    document.getElementById('feelsLike').textContent = `${Math.round(data.main.feels_like)}°C`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${data.wind.speed} m/s`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    document.getElementById('clouds').textContent = `${data.clouds.all}%`;
    document.getElementById('weatherIcon').textContent = weatherIcons[data.weather[0].icon] || '🌡️';
    document.getElementById('sunrise').textContent = formatTime(data.sys.sunrise);
    document.getElementById('sunset').textContent = formatTime(data.sys.sunset);

    updateBackground(data.weather[0].main);
    document.getElementById('weatherInfo').style.display = 'block';
}

function showError(message) {
    const error = document.getElementById('error');
    error.textContent = message;
    error.style.display = 'block';
}

function addMessage(text, isUser = false) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    addMessage(message, true);
    input.value = '';
    
    setTimeout(() => {
        const response = generateResponse(message);
        addMessage(response);
    }, 500);
}

function generateResponse(message) {
    const msgLower = message.toLowerCase();
    
    if (!currentWeatherData) {
        return "Please search for a city first so I can provide weather information!";
    }

    const temp = Math.round(currentWeatherData.main.temp);
    const weather = currentWeatherData.weather[0].main.toLowerCase();
    const description = currentWeatherData.weather[0].description;
    const humidity = currentWeatherData.main.humidity;
    const windSpeed = currentWeatherData.wind.speed;

    if (msgLower.includes('wear') || msgLower.includes('outfit') || msgLower.includes('clothes')) {
        if (temp < 10) {
            return `It's quite cold at ${temp}°C! I'd recommend a warm coat, scarf, and gloves. Layer up!`;
        } else if (temp < 20) {
            return `At ${temp}°C, a light jacket or sweater would be perfect. Maybe bring a hoodie just in case!`;
        } else if (temp < 28) {
            return `It's comfortable at ${temp}°C! A t-shirt and jeans should work great. Light and casual is the way to go!`;
        } else {
            return `It's warm at ${temp}°C! Light, breathable clothing is best. Don't forget sunscreen!`;
        }
    }

    if (msgLower.includes('umbrella') || msgLower.includes('rain')) {
        if (weather.includes('rain') || weather.includes('drizzle')) {
            return `Yes! It's ${description} right now, so definitely bring an umbrella! ☔`;
        } else {
            return `No rain expected! The weather is ${description}, so you can leave your umbrella at home. 🌤️`;
        }
    }

    if (msgLower.includes('hot') || msgLower.includes('cold') || msgLower.includes('temperature')) {
        if (temp < 15) {
            return `It's quite cold at ${temp}°C. Bundle up if you're heading out!`;
        } else if (temp > 25) {
            return `It's warm at ${temp}°C. Perfect weather to enjoy outdoors, but stay hydrated!`;
        } else {
            return `The temperature is pleasant at ${temp}°C. Not too hot, not too cold!`;
        }
    }

    if (msgLower.includes('humid')) {
        if (humidity > 70) {
            return `Yes, it's quite humid at ${humidity}%. It might feel a bit sticky outside!`;
        } else {
            return `Humidity is at ${humidity}%, which is pretty comfortable!`;
        }
    }

    if (msgLower.includes('wind')) {
        if (windSpeed > 10) {
            return `It's quite windy with speeds of ${windSpeed} m/s. Hold onto your hat!`;
        } else {
            return `Wind is calm at ${windSpeed} m/s. Nice and gentle!`;
        }
    }

    if (msgLower.includes('activity') || msgLower.includes('do')) {
        if (weather.includes('clear') || weather.includes('sun')) {
            return `Great weather for outdoor activities! Perfect for a walk, picnic, or sports. Enjoy the sunshine! ☀️`;
        } else if (weather.includes('rain')) {
            return `Maybe indoor activities today! How about a cozy cafe, museum visit, or movie? 🏛️`;
        } else if (weather.includes('cloud')) {
            return `Cloudy weather is perfect for outdoor activities without the harsh sun. Great for hiking or exploring!`;
        }
    }

    if (msgLower.includes('thanks') || msgLower.includes('thank you')) {
        return "You're welcome! If you have any more questions about the weather, feel free to ask!";
    }

    // Default response
    return `Currently in ${currentWeatherData.name}, it's ${description} with a temperature of ${temp}°C. ${humidity}% humidity and wind speed of ${windSpeed} m/s. Anything specific you'd like to know?`;
}

// Allow Enter key to search
document.getElementById('cityInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeather();
    }
});

// Allow Enter key to send message
document.getElementById('chatInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Load default city on page load
window.addEventListener('load', () => {
    document.getElementById('cityInput').value = 'Johannesburg';
    getWeather();
});
