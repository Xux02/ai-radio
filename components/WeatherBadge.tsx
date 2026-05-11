"use client";

import { useEffect, useState } from "react";
import type { WeatherData } from "@/lib/types";

export default function WeatherBadge() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    fetch("/api/weather")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setWeather(data);
      })
      .catch(() => {});
  }, []);

  if (!weather) return null;

  const weatherIcons: Record<string, string> = {
    "113": "☀️",
    "116": "⛅",
    "119": "☁️",
    "122": "☁️",
    "143": "🌫️",
    "176": "🌦️",
    "179": "🌨️",
    "182": "🌨️",
    "185": "🌨️",
    "200": "⛈️",
    "227": "🌬️",
    "230": "🌬️",
    "248": "🌫️",
    "260": "🌫️",
    "263": "🌧️",
    "266": "🌧️",
    "281": "🌧️",
    "284": "🌧️",
    "293": "🌧️",
    "296": "🌧️",
    "299": "🌧️",
    "302": "🌧️",
    "305": "🌧️",
    "308": "🌧️",
    "311": "🌧️",
    "314": "🌧️",
    "317": "🌧️",
    "320": "🌨️",
    "323": "🌨️",
    "326": "🌨️",
    "329": "🌨️",
    "332": "🌨️",
    "335": "🌨️",
    "338": "🌨️",
    "350": "🌨️",
    "353": "🌧️",
    "356": "🌧️",
    "359": "🌧️",
    "362": "🌨️",
    "365": "🌨️",
    "368": "🌨️",
    "371": "🌨️",
    "374": "🌨️",
    "377": "🌨️",
    "386": "⛈️",
    "389": "⛈️",
    "392": "⛈️",
    "395": "🌨️",
  };

  const icon = weatherIcons[weather.icon] || "🌤️";

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-lg">{icon}</span>
      <div>
        <div className="font-semibold text-gray-800">
          {weather.city} {weather.temp}°C
        </div>
        <div className="text-xs text-gray-400">{weather.condition}</div>
      </div>
    </div>
  );
}
