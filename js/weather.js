const weatherBox = document.getElementById("weather");

// Default location (Dhaka, Bangladesh)
let latitude = 23.8103;
let longitude = 90.4125;

// Make global for external access
window.refreshWeather = function () {
  if (!weatherBox) return;

  // Open-Meteo API
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`;

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error("Weather fetch failed");
      return res.json();
    })
    .then(data => {
      if (!data.current) throw new Error("Invalid weather data");

      const temp = Math.round(data.current.temperature_2m);
      const weatherCode = data.current.weather_code;
      const weatherDesc = getWeatherDescription(weatherCode);
      const weatherIcon = getWeatherIcon(weatherCode);

      weatherBox.innerHTML = `
        <div style="font-size: 24px; margin-right: 12px;">${weatherIcon}</div>
        <div style="display: flex; flex-direction: column; align-items: flex-end;">
          <b style="font-size: 15px; line-height: 1.2;">${temp}°C</b>
          <span style="opacity: 0.6; font-size: 11px; white-space: nowrap;">${weatherDesc}</span>
        </div>
      `;
    })
    .catch(err => {
      console.warn("Weather error:", err);
      if (weatherBox) {
        weatherBox.innerHTML = `<span style="opacity: 0.5;">Weather unavailable</span>`;
      }
    });
};

// Global function to update by City Name (Called by Lively)
window.getWeather = function (cityName) {
  if (!cityName) return;
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;

  fetch(geoUrl)
    .then(res => res.json())
    .then(data => {
      if (data.results && data.results.length > 0) {
        latitude = data.results[0].latitude;
        longitude = data.results[0].longitude;
        window.refreshWeather();
      }
    })
    .catch(e => console.error("Geocoding failed", e));
};

// Start logic
const savedCity = localStorage.getItem('userCity');
if (savedCity) {
  window.getWeather(savedCity);
} else if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      window.refreshWeather();
    },
    (error) => {
      window.refreshWeather();
    }
  );
} else {
  window.refreshWeather();
}

// WMO Weather interpretation codes
function getWeatherDescription(code) {
  const descriptions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Foggy",
    51: "Light drizzle",
    53: "Drizzle",
    60: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Light showers",
    81: "Showers",
    82: "Heavy showers",
    85: "Light snow showers",
    86: "Snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with hail"
  };
  return descriptions[code] || "Unknown";
}

function getWeatherIcon(code) {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 55) return "🌦️";
  if (code <= 65) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌧️";
  if (code <= 86) return "🌨️";
  return "⛈️";
}

// Refresh every 10 minutes
setInterval(refreshWeather, 600000);
