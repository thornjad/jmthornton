interface Env {
  WEATHER_KV: KVNamespace;
  TEMPEST_STATION_ID: string;
  TEMPEST_API_TOKEN: string;
}

interface WeatherCache {
  temp_f: number;
  conditions: string;
  emoji: string;
  updated: number;
}

const ICON_EMOJI: Record<string, string> = {
  "clear-day": "☀️",
  "clear-night": "🌙",
  "cloudy": "☁️",
  "foggy": "🌁",
  "partly-cloudy-day": "⛅",
  "partly-cloudy-night": "☁️",
  "possibly-rainy-day": "🌦️",
  "possibly-rainy-night": "🌧️",
  "possibly-sleet-day": "🌨️",
  "possibly-sleet-night": "🌨️",
  "possibly-snow-day": "🌨️",
  "possibly-snow-night": "🌨️",
  "possibly-thunderstorm-day": "⛈️",
  "possibly-thunderstorm-night": "⛈️",
  "rainy": "🌧️",
  "sleet": "🌨️",
  "snow": "🌨️",
  "thunderstorm": "⛈️",
  "windy": "🍃",
};

// convert tempest conditions (noun phrases) to grammatical continuations
// of "where it's currently 37°F and ..."
const GRAMMATICAL_CONDITIONS: Record<string, string> = {
  "clear": "clear",
  "very light rain": "lightly raining",
  "light rain": "lightly raining",
  "moderate rain": "rainy",
  "heavy rain": "raining heavily",
  "rain": "rainy",
  "very light snow": "lightly snowing",
  "light snow": "lightly snowing",
  "moderate snow": "snowy",
  "heavy snow": "snowing heavily",
  "snow": "snowy",
  "snow possible": "looking snowy",
  "snow likely": "looking snowy soon",
  "rain possible": "looking rainy",
  "rain likely": "looking rainy soon",
  "wintry mix possible": "looking wintry",
  "wintry mix likely": "looking wintry soon",
  "thunderstorm": "stormy",
  "thunderstorms possible": "looking stormy",
  "thunderstorms likely": "looking stormy soon",
  "possible thunderstorm": "looking stormy",
  "sleet": "sleeting",
  "partly cloudy": "partly cloudy",
  "mostly cloudy": "mostly cloudy",
  "cloudy": "cloudy",
  "foggy": "foggy",
  "windy": "windy",
};

function grammaticalConditions(raw: string): string {
  return GRAMMATICAL_CONDITIONS[raw.toLowerCase()] ?? raw.toLowerCase();
}

const ONE_HOUR_MS = 3600000;

const CACHE_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "public, max-age=3600, stale-while-revalidate=1800",
};

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const { env } = ctx;

  if (!env.TEMPEST_STATION_ID || !env.TEMPEST_API_TOKEN) {
    return new Response(JSON.stringify({ error: "not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const cached = await env.WEATHER_KV.get("weather", { type: "json" }) as WeatherCache | null;
  if (cached && Date.now() - cached.updated < ONE_HOUR_MS) {
    return new Response(JSON.stringify(cached), { headers: CACHE_HEADERS });
  }

  try {
    const url = `https://swd.weatherflow.com/swd/rest/better_forecast?station_id=${env.TEMPEST_STATION_ID}&token=${env.TEMPEST_API_TOKEN}&units_temp=f`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`tempest api ${res.status}`);

    const data = await res.json() as any;
    const current = data.current_conditions;
    if (!current || current.air_temperature == null || !current.conditions) {
      throw new Error("missing fields in current_conditions");
    }

    const weather: WeatherCache = {
      temp_f: Math.round(current.air_temperature),
      conditions: grammaticalConditions(current.conditions),
      emoji: ICON_EMOJI[current.icon] ?? "",
      updated: Date.now(),
    };

    await env.WEATHER_KV.put("weather", JSON.stringify(weather));
    return new Response(JSON.stringify(weather), { headers: CACHE_HEADERS });
  } catch (e) {
    if (cached) {
      return new Response(JSON.stringify(cached), { headers: CACHE_HEADERS });
    }
    return new Response(JSON.stringify({ error: "unavailable" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
};
