export const weatherIcons: Record<string, string> = {
  clear: `<circle cx="24" cy="24" r="8" fill="#f2bd3a"/><path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.6 10.6l4.2 4.2M33.2 33.2l4.2 4.2M37.4 10.6l-4.2 4.2M14.8 33.2l-4.2 4.2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  cloudy: `<circle cx="32" cy="14" r="5" fill="#f2bd3a"/><path d="M35 28.5c0-5.2-4.2-9.5-9.5-9.5-4.2 0-7.8 2.8-9 6.6A7 7 0 0 0 17 39h17a5.3 5.3 0 0 0 1-10.5Z" fill="rgba(255,255,255,.72)" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
  rain: `<path d="M35 25c0-5-4-9-9-9-4 0-7.3 2.5-8.6 6.1A6.5 6.5 0 0 0 18 35h16a5 5 0 0 0 1-10Z" fill="rgba(255,255,255,.72)" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M17 40v3M24 39v4M31 40v3" stroke="#6f8fb8" stroke-width="2" stroke-linecap="round"/>`,
  snow: `<path d="M35 25c0-5-4-9-9-9-4 0-7.3 2.5-8.6 6.1A6.5 6.5 0 0 0 18 35h16a5 5 0 0 0 1-10Z" fill="rgba(255,255,255,.72)" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M18 41h.01M25 42h.01M32 41h.01" stroke="#6f8fb8" stroke-width="4" stroke-linecap="round"/>`,
};

export const weatherCodeMap: Record<number, [string, string]> = {
  0: ["晴", "clear"],
  1: ["晴间多云", "clear"],
  2: ["多云", "cloudy"],
  3: ["阴", "cloudy"],
  45: ["雾", "cloudy"],
  48: ["雾凇", "cloudy"],
  51: ["小雨", "rain"],
  53: ["中雨", "rain"],
  55: ["大雨", "rain"],
  61: ["小雨", "rain"],
  63: ["中雨", "rain"],
  65: ["大雨", "rain"],
  71: ["小雪", "snow"],
  73: ["中雪", "snow"],
  75: ["大雪", "snow"],
  80: ["阵雨", "rain"],
  81: ["阵雨", "rain"],
  82: ["强阵雨", "rain"],
  95: ["雷雨", "rain"],
};

export async function fetchWeatherData(city: string): Promise<{ temp: number; description: string; icon: string; placeName: string } | null> {
  try {
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh&format=json`
    );
    const geo = await geoResponse.json();
    const place = geo.results?.[0];
    if (!place) return null;

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code&timezone=auto`
    );
    const weather = await weatherResponse.json();
    const current = weather.current;
    const [description, iconKey] = weatherCodeMap[current.weather_code] ?? ["多云", "cloudy"];

    return {
      temp: Math.round(current.temperature_2m),
      description,
      icon: weatherIcons[iconKey] ?? weatherIcons.cloudy,
      placeName: place.name,
    };
  } catch {
    return null;
  }
}
