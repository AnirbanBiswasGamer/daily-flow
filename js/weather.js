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

      // Dynamic Background (Japanese Aesthetic)
      // Using simple mapping or Unsplash Source
      // const condition = data.current.weather_code; // This variable is redundant as weatherCode already exists
      let keyword = "nature";
      const code = data.current.weather_code; // Use weatherCode from API response

      // WMO Code mapping to keywords
      if (code === 0) keyword = "sunny,sky";
      else if (code >= 1 && code <= 3) keyword = "cloudy,mountain";
      else if (code >= 45 && code <= 48) keyword = "fog,forest";
      else if (code >= 51 && code <= 67) keyword = "rain,street,umbrella";
      // Dynamic Background (Japanese Aesthetic + Season)
      const month = new Date().getMonth(); // 0-11

      // Determine Season in Japan
      let season = "japan";
      if (month >= 2 && month <= 4) season = "japan,sakura,spring"; // Spring
      else if (month >= 5 && month <= 8) season = "japan,summer,green"; // Summer
      else if (month >= 9 && month <= 10) season = "japan,autumn,maple"; // Autumn
      else season = "japan,winter,snow"; // Winter

      // Determine Weather Element
      let weatherTag = "nature";
      if (code === 0) weatherTag = "sunny,sky,shrine";
      else if (code >= 1 && code <= 3) weatherTag = "cloudy,mountain";
      else if (code >= 45 && code <= 48) weatherTag = "fog,forest";
      else if (code >= 51 && code <= 67) weatherTag = "rain,umbrella,street";
      else if (code >= 71 && code <= 77) weatherTag = "snow,village";
      else if (code >= 80) weatherTag = "storm,rain";

      // Combine tags: e.g. "japan,autumn,maple,rain,umbrella,street"
      const tags = `${season},${weatherTag}`;

      // Using LoremFlickr which supports tag combinations well
      const bgUrl = `https://loremflickr.com/600/300/${tags}`;

      weatherBox.style.backgroundImage = `
        linear-gradient(rgba(45, 46, 50, 0.6), rgba(45, 46, 50, 0.6)),
        url('${bgUrl}')
      `;
      weatherBox.style.backgroundSize = "cover";
      weatherBox.style.backgroundPosition = "center";

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
