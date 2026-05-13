import { fetchWeatherData } from "../config/weather";

export async function renderWeather(city: string): Promise<void> {
  const iconEl = document.querySelector(".weather-icon") as HTMLElement | null;
  const tempEl = document.getElementById("weatherTemp");
  const textEl = document.getElementById("weatherText");
  if (!iconEl || !tempEl || !textEl) return;

  if (!city.trim()) {
    tempEl.textContent = "--°";
    textEl.textContent = "请设置城市";
    return;
  }

  textEl.textContent = `${city}  获取中`;
  const data = await fetchWeatherData(city.trim());

  if (!data) {
    tempEl.textContent = "--°";
    textEl.textContent = `${city}  天气不可用`;
    iconEl.innerHTML = `<circle cx="32" cy="14" r="5" fill="#f2bd3a"/><path d="M35 28.5c0-5.2-4.2-9.5-9.5-9.5-4.2 0-7.8 2.8-9 6.6A7 7 0 0 0 17 39h17a5.3 5.3 0 0 0 1-10.5Z" fill="rgba(255,255,255,.72)" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`;
    return;
  }

  tempEl.textContent = `${data.temp}°`;
  textEl.textContent = `${data.placeName}  ${data.description}`;
  iconEl.innerHTML = data.icon;
}
