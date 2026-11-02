import React, { useCallback, useEffect, useState } from "react";
import * as Icons from "../icons";
import { fetchWeather, searchCity, getSavedLocation, saveLocation, weatherInfo, careTips } from "../weather";
import { inputCls } from "../ui";

const { MapPin, Navigation, Search, RefreshCw, Droplets, Wind, Umbrella, Lightbulb, X } = Icons;

/* ---------------------------------------------------------
   WeatherCard: abhi ka mausam + 7 din ka forecast + plant-care salah.

   Flow:
   1. Pehli baar: user location set karta hai
        - "Use my location" (browser GPS)  ya
        - city ka naam search karke
   2. Location localStorage mein save ho jati hai
   3. Data Open-Meteo se aata hai (free, no key)

   Prop: plants -> taaki "outdoor plants ko paani chahiye + baarish aane wali hai" jaisi salah mile
--------------------------------------------------------- */

const toneStyles = {
  warn: "bg-sun-50 border-sun-100 text-amber-800",
  info: "bg-mint-50 border-mint-100 text-forest-700",
  good: "bg-mint-50 border-mint-100 text-forest-700",
};

function dayLabel(date, index) {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  return new Date(date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" });
}

function WeatherCard({ plants = [] }) {
  const [loc, setLoc] = useState(getSavedLocation);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const load = useCallback(async () => {
    if (!loc) return;
    setLoading(true);
    setError("");
    try {
      setData(await fetchWeather(loc));
    } catch (e) {
      setError(e.message || "Could not load the weather.");
    } finally {
      setLoading(false);
    }
  }, [loc]);

  // location badle to naya data; phir har 30 minute mein refresh
  useEffect(() => {
    load();
    const timer = setInterval(load, 30 * 60 * 1000);
    return () => clearInterval(timer);
  }, [load]);

  function choose(place) {
    saveLocation(place);
    setLoc(place);
    setData(null);
    setPicking(false);
    setQuery("");
    setResults([]);
    setError("");
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Your browser does not support location. Search your city instead.");
      return;
    }
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => choose({ name: "My location", lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setError("Location permission was denied. Search your city instead."),
      { timeout: 10000 }
    );
  }

  async function runSearch(e) {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setSearching(true);
    setError("");
    try {
      const found = await searchCity(query.trim());
      setResults(found);
      if (found.length === 0) setError("No city found. Check the spelling.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  }

  /* ---------- 1) Location picker ---------- */
  if (!loc || picking) {
    return (
      <section className="glass rounded-[2rem] p-5 sm:p-6 shadow-soft mb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-lg">Weather for your plants</h3>
            <p className="text-sm text-slate-500 mt-1">
              Set your location to see today's weather, the 7-day forecast and care tips.
            </p>
          </div>
          {loc && (
            <button
              onClick={() => setPicking(false)}
              aria-label="Cancel"
              className="w-9 h-9 rounded-full bg-sage-100 text-forest-600 grid place-items-center shrink-0"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          onClick={useMyLocation}
          className="btn-primary mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm"
        >
          <Navigation size={16} /> Use my location
        </button>

        <form onSubmit={runSearch} className="mt-4 flex gap-2">
          <input
            className={inputCls + " !mt-0"}
            placeholder="Or search a city, e.g. Noida"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            disabled={searching}
            className="shrink-0 w-12 h-12 rounded-full bg-white border border-sage-200 grid place-items-center text-forest-700 hover:bg-sage-50 disabled:opacity-60"
            aria-label="Search city"
          >
            {searching ? <RefreshCw size={17} className="animate-spin" /> : <Search size={17} />}
          </button>
        </form>

        {results.length > 0 && (
          <ul className="mt-3 rounded-2xl bg-white border border-sage-200 divide-y divide-sage-100 overflow-hidden">
            {results.map((r) => (
              <li key={`${r.lat},${r.lon}`}>
                <button
                  onClick={() => choose(r)}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-mint-50 flex items-center gap-2"
                >
                  <MapPin size={14} className="text-forest-500 shrink-0" /> {r.name}
                </button>
              </li>
            ))}
          </ul>
        )}

        {error && <p className="mt-3 text-sm text-coral-600">{error}</p>}
      </section>
    );
  }

  /* ---------- 2) Loading / error ---------- */
  if (!data) {
    return (
      <section className="glass rounded-[2rem] p-6 shadow-soft mb-6">
        {error ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-coral-600">{error}</p>
            <div className="flex gap-2">
              <button onClick={load} className="btn-primary px-4 py-2 rounded-full text-xs">Try again</button>
              <button onClick={() => setPicking(true)} className="px-4 py-2 rounded-full bg-white border border-sage-200 text-xs font-bold">
                Change location
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-pulse space-y-3">
            <div className="h-5 w-40 rounded-full bg-sage-200" />
            <div className="h-24 rounded-3xl bg-sage-100" />
            <div className="h-16 rounded-3xl bg-sage-100" />
          </div>
        )}
      </section>
    );
  }

  /* ---------- 3) Weather ---------- */
  const { current, days } = data;
  const now = weatherInfo(current.code);
  const NowIcon = Icons[now.icon] || Icons.Cloud;
  const tips = careTips(data, plants);

  return (
    <section className="glass rounded-[2rem] p-4 sm:p-6 shadow-soft mb-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0 text-sm font-bold text-forest-800">
          <MapPin size={16} className="text-forest-500 shrink-0" />
          <span className="truncate">{loc.name}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={load}
            aria-label="Refresh weather"
            className="w-9 h-9 rounded-full bg-white border border-sage-200 grid place-items-center text-forest-600 hover:bg-sage-50"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setPicking(true)}
            className="px-3.5 h-9 rounded-full bg-white border border-sage-200 text-xs font-bold text-forest-700 hover:bg-sage-50"
          >
            Change
          </button>
        </div>
      </div>

      {/* abhi ka mausam */}
      <div className="rounded-3xl bg-gradient-to-br from-forest-800 to-forest-600 text-white p-5 flex items-center justify-between gap-4">
        <div>
          <div className="text-5xl sm:text-6xl font-extrabold tracking-tight">{Math.round(current.temp)}°</div>
          <div className="mt-1 text-sm font-semibold">{now.label}</div>
          <div className="text-xs text-white/70">Feels like {Math.round(current.feels)}°C</div>
        </div>
        <NowIcon size={72} className="text-mint-200 shrink-0" strokeWidth={1.4} />
      </div>

      <div className="grid grid-cols-3 gap-2.5 mt-3">
        <div className="rounded-2xl bg-white/80 border border-white p-3 text-center">
          <Droplets size={16} className="mx-auto text-forest-500" />
          <div className="font-extrabold mt-1">{Math.round(current.humidity)}%</div>
          <div className="text-[10px] text-slate-500">Humidity</div>
        </div>
        <div className="rounded-2xl bg-white/80 border border-white p-3 text-center">
          <Wind size={16} className="mx-auto text-forest-500" />
          <div className="font-extrabold mt-1">{Math.round(current.wind)} km/h</div>
          <div className="text-[10px] text-slate-500">Wind</div>
        </div>
        <div className="rounded-2xl bg-white/80 border border-white p-3 text-center">
          <Umbrella size={16} className="mx-auto text-forest-500" />
          <div className="font-extrabold mt-1">{days[0].rainChance}%</div>
          <div className="text-[10px] text-slate-500">Rain today</div>
        </div>
      </div>

      {/* 7 din ka forecast */}
      <h4 className="text-xs font-extrabold uppercase tracking-wider text-forest-500 mt-5 mb-2">7-day forecast</h4>
      <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
        {days.map((day, i) => {
          const info = weatherInfo(day.code);
          const DayIcon = Icons[info.icon] || Icons.Cloud;
          return (
            <div
              key={day.date}
              className={`snap-start shrink-0 w-[4.6rem] rounded-2xl p-2.5 text-center border ${
                i === 0 ? "bg-mint-100 border-mint-200" : "bg-white/80 border-white"
              }`}
              title={info.label}
            >
              <div className="text-[11px] font-bold text-forest-700">{dayLabel(day.date, i)}</div>
              <DayIcon size={24} className="mx-auto my-1.5 text-forest-600" />
              <div className="text-sm font-extrabold">{Math.round(day.max)}°</div>
              <div className="text-[11px] text-slate-500">{Math.round(day.min)}°</div>
              <div className="text-[10px] font-semibold text-forest-500 mt-1 flex items-center justify-center gap-0.5"><Droplets size={10} />{day.rainChance}%</div>
            </div>
          );
        })}
      </div>

      {/* plant care tips */}
      <h4 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-forest-500 mt-4 mb-2">
        <Lightbulb size={14} /> Plant care tips
      </h4>
      <ul className="space-y-2">
        {tips.map((tip, i) => (
          <li key={i} className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${toneStyles[tip.tone]}`}>
            {tip.text}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default WeatherCard;
