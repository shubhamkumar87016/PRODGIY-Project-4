// Replace 'YOUR_API_KEY' with your OpenWeatherMap API key!
const apiKey = "YOUR_API_KEY";

document.getElementById('weatherForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const city = document.getElementById('cityInput').value.trim();
    if (city) {
        getWeather(city);
    }
});

function getWeather(city) {
    const weatherResult = document.getElementById('weatherResult');
    weatherResult.innerHTML = "Loading...";

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`)
        .then(response => {
            if (!response.ok) throw new Error("City not found");
            return response.json();
        })
        .then(data => {
            const { name, sys, main, weather } = data;
            weatherResult.innerHTML = `
                <h2>${name}, ${sys.country}</h2>
                <p><strong>${weather[0].main}</strong> - ${weather[0].description}</p>
                <p>Temperature: <strong>${main.temp}°C</strong></p>
                <p>Humidity: <strong>${main.humidity}%</strong></p>
            `;
        })
        .catch(error => {
            weatherResult.innerHTML = `<span style="color:red;">${error.message}</span>`;
        });
}