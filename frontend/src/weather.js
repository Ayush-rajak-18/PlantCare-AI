/* =========================================================
   WEATHER  (Open-Meteo: free, koi API key nahi chahiye)

   - searchCity(name)      -> city dhundhna
   - fetchWeather(loc)     -> abhi ka mausam + 7 din ka forecast
   - weatherInfo(code)     -> weather code ko naam + icon me badalna
   - careTips(w, plants)   -> mausam ke hisaab se plant-care salah
========================================================= */

const LOC_KEY = "plantcare_weather_location";

export function getSavedLocation() {
  try {
    const saved = JSON.parse(localStorage.getItem(LOC_KEY) || "null");
    return saved && typeof saved.lat === "number" ? saved : null;
  } catch {
    return null;
  }
}

export function saveLocation(loc) {
  try {
    localStorage.setItem(LOC_KEY, JSON.stringify(loc));
  } catch {}
}

export async function searchCity(query) {
  const url =
    "https://geocoding-api.open-meteo.com/v1/search?count=5&language=en&format=json&name=" +
    encodeURIComponent(query);

  const res = await fetch(url);
  if (!res.ok) throw new Error("City search failed. Try again.");

  const data = await res.json();
  return (data.results || []).map((r) => ({
    name: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
    lat: r.latitude,
    lon: r.longitude,
  }));
}

export async function fetchWeather({ lat, lon }) {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${lat}&longitude=${lon}` +
    "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,uv_index_max" +
    "&timezone=auto&forecast_days=7";

  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather service is not responding.");

  const d = await res.json();

  return {
    current: {
      temp: d.current.temperature_2m,
      feels: d.current.apparent_temperature,
      humidity: d.current.relative_humidity_2m,
      wind: d.current.wind_speed_10m, // km/h
      code: d.current.weather_code,
    },
    days: d.daily.time.map((date, i) => ({
      date,
      code: d.daily.weather_code[i],
      max: d.daily.temperature_2m_max[i],
      min: d.daily.temperature_2m_min[i],
      rainChance: d.daily.precipitation_probability_max[i] ?? 0,
      rainSum: d.daily.precipitation_sum[i] ?? 0,
      uv: d.daily.uv_index_max[i] ?? 0,
    })),
  };
}

// WMO weather code -> { label, icon }   (icon = ../icons ka naam)
export function weatherInfo(code) {
  if (code === 0) return { label: "Clear sky", icon: "Sun" };
  if (code === 1) return { label: "Mostly clear", icon: "Sun" };
  if (code === 2) return { label: "Partly cloudy", icon: "CloudSun" };
  if (code === 3) return { label: "Overcast", icon: "Cloud" };
  if (code === 45 || code === 48) return { label: "Foggy", icon: "CloudFog" };
  if (code >= 51 && code <= 57) return { label: "Drizzle", icon: "CloudDrizzle" };
  if (code >= 61 && code <= 67) return { label: "Rain", icon: "CloudRain" };
  if (code >= 71 && code <= 77) return { label: "Snow", icon: "CloudSnow" };
  if (code >= 80 && code <= 82) return { label: "Rain showers", icon: "CloudRain" };
  if (code === 85 || code === 86) return { label: "Snow showers", icon: "CloudSnow" };
  if (code >= 95) return { label: "Thunderstorm", icon: "CloudLightning" };
  return { label: "Cloudy", icon: "Cloud" };
}

const rainy = (day) => day.rainChance >= 60 || day.rainSum >= 3;

/* ---------------------------------------------------------
   careTips: forecast dekh kar salah banata hai.
   tone: "warn" (dhyan do) | "good" (sab theek) | "info"
--------------------------------------------------------- */
export function careTips(weather, plants = []) {
  const tips = [];
  const { current, days } = weather;
  const today = days[0];
  const nextTwo = days.slice(1, 3);

  // outdoor plants jinhe aaj/abhi paani chahiye
  const outdoorDue = plants.filter(
    (p) => ["Outdoor", "Balcony"].includes(p.location) && ["overdue", "today"].includes(p.water_status)
  ).length;

  if (rainy(today)) {
    tips.push({
      tone: "info",
      text:
        outdoorDue > 0
          ? `Rain is likely today (${today.rainChance}%). ${outdoorDue} outdoor plant${outdoorDue > 1 ? "s are" : " is"} due for water. You can skip it if it rains.`
          : `Rain is likely today (${today.rainChance}%). Outdoor plants don't need extra watering.`,
    });
  } else if (nextTwo.some(rainy)) {
    tips.push({
      tone: "info",
      text: "Rain is expected in the next 2 days. Go easy on watering outdoor plants.",
    });
  }

  if (today.max >= 38) {
    tips.push({
      tone: "warn",
      text: `Very hot today (up to ${Math.round(today.max)}°C). Water early morning or evening and shade delicate plants from afternoon sun.`,
    });
  } else if (today.max >= 32) {
    tips.push({
      tone: "warn",
      text: "Warm weather: soil will dry faster. Check moisture every day, especially for pots.",
    });
  }

  if (today.min <= 5) {
    tips.push({
      tone: "warn",
      text: `Cold night ahead (${Math.round(today.min)}°C). Move tender plants indoors or cover them to avoid frost damage.`,
    });
  } else if (today.min <= 12) {
    tips.push({ tone: "info", text: "Cool weather: plants drink less, so reduce watering a little." });
  }

  if (current.humidity >= 80) {
    tips.push({
      tone: "warn",
      text: "High humidity raises the risk of leaf spots and mildew. Keep leaves dry and let air circulate.",
    });
  } else if (current.humidity <= 30) {
    tips.push({
      tone: "info",
      text: "Air is very dry. Indoor plants may like misting or a tray of damp pebbles.",
    });
  }

  if (today.uv >= 8) {
    tips.push({ tone: "warn", text: "UV index is high. Give sun-sensitive plants some partial shade." });
  }

  if (current.wind >= 30) {
    tips.push({ tone: "warn", text: "Strong wind: stake tall plants and move light pots to a sheltered spot." });
  }

  if (tips.length === 0) {
    tips.push({ tone: "good", text: "The weather looks comfortable for your plants today. Follow your normal watering schedule." });
  }

  return tips.slice(0, 4);
}
