"use client";

import React, { useState, useEffect } from "react";
import {
  BsSunFill,
  BsCloudSunFill,
  BsCloudsFill,
  BsCloudFog2Fill,
  BsCloudDrizzleFill,
  BsCloudRainHeavyFill,
  BsCloudRainFill,
  BsSnow,
  BsCloudSnowFill,
  BsCloudLightningRainFill,
  BsSearch,
  BsWind,
  BsThermometerHalf,
  BsDropletFill,
  BsEyeFill,
  BsSpeedometer2,
  BsCompass,
} from "react-icons/bs";
import { WiSunset, WiSunrise } from "react-icons/wi";

const PRESET_CITIES = [
  { name: "Vilnius", country: "Lithuania", lat: 54.6872, lon: 25.2797 },
  { name: "Cupertino", country: "United States", lat: 37.323, lon: -122.0322 },
  { name: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278 },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503 },
  { name: "New York", country: "United States", lat: 40.7128, lon: -74.006 },
  { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093 },
];

const getWeatherDetails = (code: number) => {
  if (code === 0) {
    return {
      label: "Clear Sky",
      icon: BsSunFill,
      color: "text-amber-400",
      gradient: "from-sky-400/20 to-blue-600/30",
      bgStyle:
        "bg-linear-to-br from-sky-500/20 via-sky-600/10 to-indigo-950/30",
    };
  }
  if ([1, 2, 3].includes(code)) {
    return {
      label: "Partly Cloudy",
      icon: BsCloudSunFill,
      color: "text-gray-300",
      gradient: "from-blue-500/20 to-slate-600/20",
      bgStyle:
        "bg-linear-to-br from-blue-600/15 via-slate-700/10 to-zinc-900/30",
    };
  }
  if ([45, 48].includes(code)) {
    return {
      label: "Foggy",
      icon: BsCloudFog2Fill,
      color: "text-slate-400",
      gradient: "from-zinc-500/25 to-slate-700/25",
      bgStyle:
        "bg-linear-to-br from-zinc-700/20 via-slate-800/10 to-stone-900/35",
    };
  }
  if ([51, 53, 55].includes(code)) {
    return {
      label: "Drizzle",
      icon: BsCloudDrizzleFill,
      color: "text-blue-300",
      gradient: "from-slate-600/25 to-blue-800/25",
      bgStyle:
        "bg-linear-to-br from-slate-600/20 via-blue-900/10 to-zinc-950/40",
    };
  }
  if ([61, 63, 65, 80, 81, 82].includes(code)) {
    return {
      label: "Rainy",
      icon: BsCloudRainHeavyFill,
      color: "text-blue-400",
      gradient: "from-slate-700/30 to-blue-900/30",
      bgStyle:
        "bg-linear-to-br from-slate-800/25 via-blue-950/15 to-neutral-950/45",
    };
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return {
      label: "Snowy",
      icon: BsSnow,
      color: "text-sky-200",
      gradient: "from-blue-100/10 to-indigo-900/20",
      bgStyle:
        "bg-linear-to-br from-blue-300/10 via-indigo-950/15 to-zinc-950/35",
    };
  }
  if ([95, 96, 99].includes(code)) {
    return {
      label: "Thunderstorm",
      icon: BsCloudLightningRainFill,
      color: "text-yellow-400",
      gradient: "from-yellow-950/20 to-zinc-950/40",
      bgStyle:
        "bg-linear-to-br from-zinc-900/30 via-yellow-950/10 to-black/50",
    };
  }
  return {
    label: "Cloudy",
    icon: BsCloudsFill,
    color: "text-gray-300",
    gradient: "from-zinc-500/20 to-zinc-700/20",
    bgStyle:
      "bg-linear-to-br from-slate-700/20 via-zinc-800/10 to-neutral-900/30",
  };
};

const getDayLabel = (dateStr: string, index: number) => {
  if (index === 0) return "Today";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

const formatHour = (timeStr: string) => {
  const date = new Date(timeStr);
  const hours = date.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  return `${formattedHours} ${ampm}`;
};

export default function WeatherApp() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCity, setSelectedCity] = useState<any>(PRESET_CITIES[0]);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMyLocationSelected, setIsMyLocationSelected] = useState(false);

  const detectMyLocation = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      setLoading(true);
      setError(null);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
            );
            const data = await response.json();
            const cityName = data.city || data.locality || "My Location";
            const countryName = data.countryName || "";

            setSelectedCity({
              name: cityName,
              country: countryName,
              lat,
              lon,
            });
            setIsMyLocationSelected(true);
          } catch (e) {
            console.error("Reverse geocoding failed", e);
            setSelectedCity({
              name: "My Location",
              country: "Current Location",
              lat,
              lon,
            });
            setIsMyLocationSelected(true);
          }
        },
        (error) => {
          console.warn("Geolocation access denied or failed:", error);
          setError("Failed to get your location. Defaulting to Vilnius.");
          setSelectedCity(PRESET_CITIES[0]);
          setIsMyLocationSelected(false);
          setLoading(false);
        },
      );
    } else {
      setError(
        "Geolocation is not supported by your browser. Defaulting to Vilnius.",
      );
      setSelectedCity(PRESET_CITIES[0]);
      setIsMyLocationSelected(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedMyLocation = localStorage.getItem(
        "glassos_weather_isMyLocationSelected",
      );
      const savedCity = localStorage.getItem("glassos_weather_selectedCity");

      if (savedMyLocation === "true") {
        detectMyLocation();
      } else if (savedCity) {
        setSelectedCity(JSON.parse(savedCity));
        setIsMyLocationSelected(false);
      } else {
        detectMyLocation();
      }
    } catch (e) {
      console.error("Error loading weather config", e);
      detectMyLocation();
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && selectedCity) {
      localStorage.setItem(
        "glassos_weather_selectedCity",
        JSON.stringify(selectedCity),
      );
    }
  }, [selectedCity]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "glassos_weather_isMyLocationSelected",
        String(isMyLocationSelected),
      );
    }
  }, [isMyLocationSelected]);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`,
        );
        const data = await res.json();
        if (data.results) {
          setSearchResults(data.results);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Geocoding fetch error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const { lat, lon } = selectedCity;
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,visibility,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`,
        );

        if (!res.ok) {
          throw new Error("Failed to fetch weather data from API");
        }

        const data = await res.json();
        setWeatherData(data);
      } catch (err: any) {
        console.error("Weather fetch error:", err);
        setError("Unable to connect to weather service. Using simulated data.");

        setWeatherData(
          generateMockData(selectedCity.name, selectedCity.country),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [selectedCity]);

  const generateMockData = (cityName: string, country: string) => {
    const tempBase =
      cityName === "Vilnius" ? 18 : cityName === "Sydney" ? 14 : 22;
    const now = new Date();

    const hourlyTimes: string[] = [];
    const hourlyTemps: number[] = [];
    const hourlyCodes: number[] = [];
    const hourlyApparent: number[] = [];
    const hourlyPrecipProb: number[] = [];
    const hourlyVis: number[] = [];
    const hourlyUV: number[] = [];

    for (let i = 0; i < 24; i++) {
      const hDate = new Date(now.getTime() + i * 60 * 60 * 1000);
      hourlyTimes.push(hDate.toISOString());

      const factor = Math.sin((i / 24) * Math.PI * 2 - Math.PI / 2);
      hourlyTemps.push(Math.round(tempBase + factor * 6));
      hourlyCodes.push(i % 12 === 0 ? 1 : i % 5 === 0 ? 3 : 0);
      hourlyApparent.push(Math.round(tempBase + factor * 6 - 1));
      hourlyPrecipProb.push(i % 7 === 0 ? 20 : 0);
      hourlyVis.push(10.0);
      hourlyUV.push(Math.max(0, Math.round(5 * factor + 5)));
    }

    const dailyTimes: string[] = [];
    const dailyMaxTemps: number[] = [];
    const dailyMinTemps: number[] = [];
    const dailyCodes: number[] = [];
    const dailySunrise: string[] = [];
    const dailySunset: string[] = [];
    const dailyUVMax: number[] = [];
    const dailyWindMax: number[] = [];

    for (let i = 0; i < 10; i++) {
      const dDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      dailyTimes.push(dDate.toISOString().split("T")[0]);
      dailyMaxTemps.push(tempBase + 5 + Math.round(Math.random() * 4 - 2));
      dailyMinTemps.push(tempBase - 5 + Math.round(Math.random() * 4 - 2));
      dailyCodes.push(i % 3 === 0 ? 1 : i % 7 === 0 ? 61 : 0);

      const sunRiseDate = new Date(dDate);
      sunRiseDate.setHours(5, 45, 0);
      const sunSetDate = new Date(dDate);
      sunSetDate.setHours(21, 15, 0);

      dailySunrise.push(sunRiseDate.toISOString());
      dailySunset.push(sunSetDate.toISOString());
      dailyUVMax.push(6 + (i % 3));
      dailyWindMax.push(12 + (i % 5) * 3);
    }

    return {
      current: {
        temperature_2m: tempBase + 2,
        relative_humidity_2m: 64,
        apparent_temperature: tempBase + 1,
        precipitation: 0.0,
        rain: 0.0,
        showers: 0.0,
        snowfall: 0.0,
        weather_code: 1,
        pressure_msl: 1014.2,
        surface_pressure: 1008.5,
        wind_speed_10m: 14.2,
        wind_direction_10m: 245,
      },
      hourly: {
        time: hourlyTimes,
        temperature_2m: hourlyTemps,
        apparent_temperature: hourlyApparent,
        precipitation_probability: hourlyPrecipProb,
        weather_code: hourlyCodes,
        visibility: hourlyVis,
        uv_index: hourlyUV,
      },
      daily: {
        time: dailyTimes,
        weather_code: dailyCodes,
        temperature_2m_max: dailyMaxTemps,
        temperature_2m_min: dailyMinTemps,
        sunrise: dailySunrise,
        sunset: dailySunset,
        uv_index_max: dailyUVMax,
        wind_speed_10m_max: dailyWindMax,
      },
    };
  };

  const selectCityHandler = (city: any) => {
    setSelectedCity({
      name: city.name,
      country: city.country || "",
      lat: city.latitude,
      lon: city.longitude,
    });
    setIsMyLocationSelected(false);
    setQuery("");
    setSearchResults([]);
  };

  if (loading && !weatherData) {
    return (
      <div className="flex justify-center items-center bg-zinc-950/30 backdrop-blur-md h-full text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="border-4 border-white/20 border-t-blue-500 rounded-full w-10 h-10 animate-spin"></div>
          <p className="font-medium text-white/60 text-sm">
            Loading weather forecast...
          </p>
        </div>
      </div>
    );
  }

  const current = weatherData?.current;
  const hourly = weatherData?.hourly;
  const daily = weatherData?.daily;
  const currentDetails = getWeatherDetails(current?.weather_code ?? 0);

  const globalMin = daily ? Math.min(...daily.temperature_2m_min) : 0;
  const globalMax = daily ? Math.max(...daily.temperature_2m_max) : 35;
  const globalSpan = globalMax - globalMin || 1;

  const tempC = current?.temperature_2m || 0;
  const humPct = current?.relative_humidity_2m || 50;
  const dewPoint = Math.round(tempC - (100 - humPct) / 5);

  const windDir = current?.wind_direction_10m || 0;
  const getWindDirection = (degree: number) => {
    const sectors = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ];
    const index = Math.round(degree / 22.5) % 16;
    return sectors[index];
  };

  const uvVal = daily?.uv_index_max?.[0] || 0;
  const getUvDescriptor = (uv: number) => {
    if (uv <= 2) return "Low";
    if (uv <= 5) return "Moderate";
    if (uv <= 7) return "High";
    if (uv <= 10) return "Very High";
    return "Extreme";
  };

  return (
    <div
      className={`flex flex-col h-full overflow-y-auto text-white select-none transition-all duration-700 ${currentDetails.bgStyle}`}
    >
      <div className="z-50 relative flex items-center gap-3 p-4 shrink-0">
        <div className="relative flex-1">
          <BsSearch className="top-1/2 left-4 absolute text-white/40 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for cities..."
            className="bg-white/10 focus:bg-white/15 shadow-inner backdrop-blur-md py-2.5 pr-4 pl-11 border border-white/10 focus:border-white/20 rounded-full outline-none w-full text-white placeholder:text-white/40 text-sm transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="top-1/2 right-4 absolute hover:bg-white/10 p-1 rounded-full text-white/50 hover:text-white text-xs -translate-y-1/2"
            >
              ✕
            </button>
          )}

          {searchResults.length > 0 && (
            <div className="top-full right-0 left-0 z-50 absolute bg-zinc-950/80 slide-in-from-top-2 shadow-2xl backdrop-blur-xl mt-2 border border-white/10 rounded-2xl overflow-hidden animate-in duration-150 fade-in">
              {searchResults.map((city: any, idx: number) => (
                <button
                  key={`${city.id || idx}`}
                  onClick={() => selectCityHandler(city)}
                  className="flex justify-between items-center hover:bg-white/10 px-5 py-3.5 border-white/5 last:border-0 border-b w-full text-left transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-white text-sm">
                      {city.name}
                    </span>
                    <span className="mt-0.5 text-white/50 text-xs">
                      {city.admin1 ? `${city.admin1}, ` : ""}
                      {city.country}
                    </span>
                  </div>
                  <span className="text-white/30 text-xs italic">
                    {city.latitude.toFixed(2)}°N, {city.longitude.toFixed(2)}°E
                  </span>
                </button>
              ))}
            </div>
          )}

          {isSearching && (
            <div className="top-1/2 right-4 absolute flex items-center -translate-y-1/2">
              <div className="border-2 border-white/20 border-t-white/80 rounded-full w-4 h-4 animate-spin"></div>
            </div>
          )}
        </div>

        <div className="hidden md:flex gap-1.5 overflow-x-auto select-none no-scrollbar shrink-0">
          <button
            onClick={detectMyLocation}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-1 shrink-0 ${isMyLocationSelected
              ? "bg-blue-500/25 text-white border border-blue-500/25 shadow-md"
              : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/5"
              }`}
          >
            📍 My Location
          </button>
          {PRESET_CITIES.map((city: any) => (
            <button
              key={city.name}
              onClick={() => {
                setSelectedCity(city);
                setIsMyLocationSelected(false);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all shrink-0 ${!isMyLocationSelected && selectedCity.name === city.name
                ? "bg-white/25 text-white border border-white/25 shadow-md"
                : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/5"
                }`}
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-amber-500/10 mx-4 mb-2 px-4 py-2.5 border border-amber-500/25 rounded-xl font-medium text-amber-300 text-xs select-none shrink-0">
          ⚠️ {error}
        </div>
      )}

      <div className="flex-1 space-y-4 px-4 pb-6 overflow-y-auto">
        <div className="z-10 relative flex flex-col items-center py-6 text-center select-none">
          <h2 className="drop-shadow-md font-bold text-white text-3xl tracking-wide">
            {selectedCity.name}
          </h2>
          <p className="drop-shadow-sm mt-1 font-medium text-white/70 text-sm">
            {selectedCity.country}
          </p>
          <div className="flex justify-center items-start mt-3 ml-4 select-none">
            <span className="drop-shadow-md font-light text-white text-7xl tracking-tighter">
              {Math.round(current?.temperature_2m ?? 0)}
            </span>
            <span className="drop-shadow-sm mt-1 font-light text-3xl">°</span>
          </div>
          <p className="drop-shadow-sm mt-1 font-semibold text-white/90 text-lg">
            {currentDetails.label}
          </p>
          <div className="flex gap-3 mt-1 font-medium text-white/80 text-sm">
            <span>H: {Math.round(daily?.temperature_2m_max?.[0] ?? 0)}°</span>
            <span>L: {Math.round(daily?.temperature_2m_min?.[0] ?? 0)}°</span>
          </div>
        </div>

        {hourly && (
          <div className="bg-white/5 shadow-xl backdrop-blur-md p-4 border border-white/5 rounded-2xl select-none">
            <h3 className="flex items-center gap-1.5 mb-3 font-semibold text-white/40 text-xs uppercase tracking-wider">
              <BsSunFill className="text-white/40" /> 24-Hour Forecast
            </h3>
            <div className="flex gap-4 pt-1 pb-2 overflow-x-auto scroll-smooth no-scrollbar">
              {hourly.time.slice(0, 24).map((time: string, idx: number) => {
                const temp = hourly.temperature_2m[idx];
                const code = hourly.weather_code[idx];
                const precipProb = hourly.precipitation_probability[idx];
                const details = getWeatherDetails(code);
                const IconComponent = details.icon;
                const isNow = idx === 0;

                return (
                  <div
                    key={time}
                    className="flex flex-col items-center min-w-14 text-center select-none"
                  >
                    <span className="mb-2 font-medium text-white/60 text-xs whitespace-nowrap">
                      {isNow ? "Now" : formatHour(time)}
                    </span>
                    <IconComponent
                      className={`size-6 my-1.5 ${details.color} drop-shadow-sm`}
                    />
                    <span className="h-3 min-h-3 font-bold text-[10px] text-sky-300">
                      {precipProb > 0 ? `${precipProb}%` : ""}
                    </span>
                    <span className="mt-1 font-semibold text-white/90 text-sm">
                      {Math.round(temp)}°
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="gap-4 grid grid-cols-1 lg:grid-cols-12">
          {daily && (
            <div className="flex flex-col justify-between lg:col-span-6 bg-white/5 shadow-xl backdrop-blur-md p-4 border border-white/5 rounded-2xl h-full select-none">
              <div>
                <h3 className="flex items-center gap-1.5 mb-3 font-semibold text-white/40 text-xs uppercase tracking-wider">
                  📅 10-Day Forecast
                </h3>
                <div className="divide-y divide-white/5">
                  {daily.time.map((time: string, idx: number) => {
                    const max = daily.temperature_2m_max[idx];
                    const min = daily.temperature_2m_min[idx];
                    const code = daily.weather_code[idx];
                    const details = getWeatherDetails(code);
                    const IconComponent = details.icon;

                    const leftPct = ((min - globalMin) / globalSpan) * 100;
                    const rightPct = ((max - globalMin) / globalSpan) * 100;
                    const widthPct = rightPct - leftPct;

                    const isToday = idx === 0;
                    const currentPct =
                      isToday && current
                        ? ((current.temperature_2m - globalMin) / globalSpan) *
                        100
                        : 0;

                    return (
                      <div
                        key={time}
                        className="flex justify-between items-center gap-2 py-3"
                      >
                        <span className="w-16 font-semibold text-white/80 text-sm">
                          {getDayLabel(time, idx)}
                        </span>

                        <div className="flex justify-center items-center w-8">
                          <IconComponent
                            className={`size-5 ${details.color}`}
                          />
                        </div>

                        <span className="w-8 font-semibold text-white/50 text-sm text-right">
                          {Math.round(min)}°
                        </span>

                        <div className="relative flex-1 bg-black/25 mx-2 rounded-full h-2 overflow-visible">
                          <div
                            className="absolute bg-linear-to-r from-blue-400 via-emerald-400 to-amber-400 shadow-[0_0_8px_rgba(52,211,153,0.3)] rounded-full h-full"
                            style={{
                              left: `${leftPct}%`,
                              width: `${Math.max(4, widthPct)}%`,
                            }}
                          />
                          {isToday && (
                            <div
                              className="top-1/2 z-10 absolute bg-white shadow-md border-2 border-emerald-500 rounded-full w-3 h-3 -translate-x-1/2 -translate-y-1/2"
                              style={{ left: `${currentPct}%` }}
                            />
                          )}
                        </div>

                        <span className="w-8 font-semibold text-white/90 text-sm text-right">
                          {Math.round(max)}°
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="gap-4 grid grid-cols-2 lg:col-span-6">
            <div className="flex flex-col justify-between bg-white/5 shadow-xl backdrop-blur-md p-4 border border-white/5 rounded-2xl select-none">
              <div>
                <h4 className="flex items-center gap-1.5 mb-2 font-semibold text-white/40 text-xs uppercase tracking-wider">
                  ☀️ UV Index
                </h4>
                <div className="font-light text-white text-3xl">{uvVal}</div>
                <div className="mt-1 font-semibold text-white/90 text-sm">
                  {getUvDescriptor(uvVal)}
                </div>
              </div>
              <div className="mt-4">
                <div className="relative bg-black/20 rounded-full w-full h-1.5 overflow-hidden">
                  <div
                    className="absolute bg-linear-to-r from-emerald-500 via-orange-500 via-yellow-500 to-red-500 h-full"
                    style={{ width: "100%" }}
                  />
                  <div
                    className="top-0 bottom-0 absolute bg-white border border-black rounded-full w-1.5"
                    style={{ left: `${Math.min(100, (uvVal / 12) * 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-[10px] text-white/40">
                  {uvVal <= 2
                    ? "No protection needed."
                    : "Wear sunscreen & sunglasses."}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between bg-white/5 shadow-xl backdrop-blur-md p-4 border border-white/5 rounded-2xl select-none">
              <div>
                <h4 className="flex items-center gap-1.5 mb-2 font-semibold text-white/40 text-xs uppercase tracking-wider">
                  <BsWind className="text-white/40" /> Wind
                </h4>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-light text-white text-3xl">
                    {Math.round(current?.wind_speed_10m ?? 0)}
                  </span>
                  <span className="font-semibold text-white/60 text-xs">
                    km/h
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <div className="relative flex justify-center items-center bg-white/5 border border-white/10 rounded-full size-12">
                  <BsCompass className="size-6 text-white/20" />
                  <div
                    className="absolute inset-0 flex justify-center items-center transition-transform duration-500"
                    style={{ transform: `rotate(${windDir}deg)` }}
                  >
                    <div className="bg-red-400 shadow-sm rounded-t-full w-1.5 h-6 origin-bottom -translate-y-2.5" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-white/90 text-xs">
                    Direction
                  </span>
                  <span className="text-[10px] text-white/50">
                    {windDir}° {getWindDirection(windDir)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between bg-white/5 shadow-xl backdrop-blur-md p-4 border border-white/5 rounded-2xl select-none">
              <div>
                <h4 className="flex items-center gap-1.5 mb-2 font-semibold text-white/40 text-xs uppercase tracking-wider">
                  🌅 Sunrise & Sunset
                </h4>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <WiSunrise className="size-6 text-amber-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-white/40 leading-none">
                        Sunrise
                      </p>
                      <p className="mt-0.5 font-semibold text-white text-sm">
                        {daily?.sunrise?.[0]
                          ? new Date(daily.sunrise[0]).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : "05:42"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-white/5 border-t">
                <div className="flex items-center gap-1.5">
                  <WiSunset className="size-6 text-indigo-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-white/40 leading-none">
                      Sunset
                    </p>
                    <p className="mt-0.5 font-semibold text-white text-sm">
                      {daily?.sunset?.[0]
                        ? new Date(daily.sunset[0]).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        : "21:18"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between bg-white/5 shadow-xl backdrop-blur-md p-4 border border-white/5 rounded-2xl select-none">
              <div>
                <h4 className="flex items-center gap-1.5 mb-2 font-semibold text-white/40 text-xs uppercase tracking-wider">
                  <BsThermometerHalf className="text-white/40" /> Feels Like
                </h4>
                <div className="font-light text-white text-3xl">
                  {Math.round(current?.apparent_temperature ?? tempC)}°
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[10px] text-white/40 leading-relaxed">
                  {Math.round(current?.apparent_temperature ?? tempC) <
                    Math.round(tempC)
                    ? "Wind chill is making it feel colder than actual."
                    : Math.round(current?.apparent_temperature ?? tempC) >
                      Math.round(tempC)
                      ? "Humidity is making it feel warmer than actual."
                      : "Similar to the actual temperature."}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between bg-white/5 shadow-xl backdrop-blur-md p-4 border border-white/5 rounded-2xl select-none">
              <div>
                <h4 className="flex items-center gap-1.5 mb-2 font-semibold text-white/40 text-xs uppercase tracking-wider">
                  <BsDropletFill className="text-white/40" /> Humidity
                </h4>
                <div className="font-light text-white text-3xl">{humPct}%</div>
              </div>
              <div className="mt-4">
                <p className="text-[10px] text-white/40 leading-relaxed">
                  The dew point is {dewPoint}° right now.
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between bg-white/5 shadow-xl backdrop-blur-md p-4 border border-white/5 rounded-2xl select-none">
              <div>
                <h4 className="flex items-center gap-1.5 mb-2 font-semibold text-white/40 text-xs uppercase tracking-wider">
                  <BsEyeFill className="text-white/40" /> Visibility
                </h4>
                <div className="flex items-baseline gap-1">
                  <span className="font-light text-white text-3xl">
                    {Math.round(
                      hourly?.visibility?.[0]
                        ? hourly.visibility[0] / 1000
                        : 10,
                    )}
                  </span>
                  <span className="font-semibold text-white/60 text-xs">
                    km
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[10px] text-white/40 leading-relaxed">
                  It's perfectly clear.
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between col-span-2 bg-white/5 shadow-xl backdrop-blur-md p-4 border border-white/5 rounded-2xl select-none">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="flex items-center gap-1.5 mb-2 font-semibold text-white/40 text-xs uppercase tracking-wider">
                    <BsSpeedometer2 className="text-white/40" /> Pressure
                  </h4>
                  <div className="flex items-baseline gap-1">
                    <span className="font-light text-white text-2xl">
                      {Math.round(current?.pressure_msl ?? 1013)}
                    </span>
                    <span className="font-semibold text-white/60 text-xs">
                      hPa
                    </span>
                  </div>
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-semibold text-white/90 text-xs">
                    Surface Pressure
                  </span>
                  <span className="text-[10px] text-white/50">
                    {Math.round(current?.surface_pressure ?? 1008)} hPa
                  </span>
                </div>
              </div>

              <div className="relative mt-4">
                <div className="relative bg-black/20 rounded-full w-full h-1">
                  <div
                    className="top-1/2 absolute bg-white border border-black rounded-full w-2 h-2 -translate-y-1/2"
                    style={{
                      left: `${Math.max(0, Math.min(100, (((current?.pressure_msl ?? 1013) - 970) / (1050 - 970)) * 100))}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1 font-medium text-[8px] text-white/30 select-none">
                  <span>970 hPa (Low)</span>
                  <span>1013 hPa (Avg)</span>
                  <span>1050 hPa (High)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WeatherWidget({ onClick }: { onClick?: () => void }) {
  const [location, setLocation] = useState<any>(PRESET_CITIES[0]);
  const [weather, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
            );
            const data = await response.json();
            const cityName = data.city || data.locality || "My Location";
            const countryName = data.countryName || "";
            setLocation({ name: cityName, country: countryName, lat, lon });
          } catch (e) {
            setLocation({
              name: "My Location",
              country: "Current Location",
              lat,
              lon,
            });
          }
        },
        () => {
        },
      );
    }
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const { lat, lon } = location;
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`,
        );
        const data = await res.json();
        setWeatherData(data);
      } catch (err) {
        const base = location.name === "Vilnius" ? 18 : 22;
        setWeatherData({
          current: { temperature_2m: base, weather_code: 1 },
          daily: {
            temperature_2m_max: [base + 4],
            temperature_2m_min: [base - 4],
          },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [location]);

  if (loading || !weather) {
    return (
      <div
        onClick={onClick}
        className="flex flex-col justify-center items-center bg-white/5 hover:bg-white/10 shadow-xl backdrop-blur-md p-4 border border-white/10 rounded-3xl w-60 h-32 transition-all cursor-pointer select-none"
      >
        <div className="border-2 border-white/20 border-t-white/80 rounded-full w-6 h-6 animate-spin"></div>
      </div>
    );
  }

  const current = weather.current;
  const daily = weather.daily;
  const details = getWeatherDetails(current?.weather_code ?? 0);
  const IconComponent = details.icon;

  return (
    <div
      onClick={onClick}
      className="group flex flex-col justify-between bg-white/5 hover:bg-white/10 shadow-xl backdrop-blur-md p-4 border border-white/10 hover:border-white/20 rounded-3xl w-60 h-32 transition-all cursor-pointer select-none"
    >
      <div className="flex justify-between items-start">
        <div className="min-w-0">
          <h3 className="font-bold text-white text-sm truncate leading-snug">
            {location.name}
          </h3>
          <p className="mt-0.5 text-[10px] text-white/50 truncate leading-none">
            {location.country || "Lithuania"}
          </p>
        </div>
        <IconComponent
          className={`size-6 ${details.color} shrink-0 drop-shadow-sm group-hover:scale-110 transition-transform`}
        />
      </div>

      <div className="flex justify-between items-end">
        <div>
          <span className="font-light text-white text-4xl tracking-tighter">
            {Math.round(current?.temperature_2m ?? 0)}
          </span>
          <span className="font-light text-white text-lg">°</span>
          <p className="mt-0.5 font-semibold text-[10px] text-white/80 leading-none">
            {details.label}
          </p>
        </div>
        <div className="font-semibold text-[10px] text-white/55 text-right">
          <span>H: {Math.round(daily?.temperature_2m_max?.[0] ?? 0)}°</span>
          <span className="ml-1.5">
            L: {Math.round(daily?.temperature_2m_min?.[0] ?? 0)}°
          </span>
        </div>
      </div>
    </div>
  );
}
