'use strict';

(function () {

// ============================================================
// CONSTANTS
// ============================================================

const LEADS = [6, 12, 18, 24, 48, 72, 96, 120, 144, 168];

const NWS_HEADERS = { 'User-Agent': 'stochastic-forecast/jmthornton.net' };

const RETROGRADE_WINDOWS = [
  ['2025-01-15', '2025-02-04'], ['2025-05-15', '2025-06-07'],
  ['2025-09-09', '2025-10-02'], ['2025-12-24', '2026-01-14'],
  ['2026-04-09', '2026-05-03'], ['2026-08-11', '2026-09-04'],
  ['2026-11-27', '2026-12-21'], ['2027-03-14', '2027-04-07'],
  ['2027-07-15', '2027-08-08'], ['2027-11-10', '2027-12-03'],
];

const FAKE_VPNS = [
  'ObscuraVPN', 'TunnelMole VPN', 'CipherBadger VPN',
  'VaultFox VPN', 'PrivacyPuffin VPN', 'CloudMask VPN',
];

const LOADING_MESSAGES = [
  'Initializing 27-member ensemble...',
  'Consulting the historical record...',
  "Checking Mercury's position...",
  'Running uncertainty quantification...',
  'Peer review in progress...',
  'Optimizing for engagement...',
  "Calibrating the drunkard's random walk...",
  'Sourcing sponsored content...',
  'Applying day-of-week bias...',
  'Randomizing delay times...',
  'Generating ensemble weights...',
  'Verifying uncertainty quantification of uncertainty...',
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MEMBER_DEFS = [
  { id: 1, name: 'drunkard' },
  { id: 2, name: 'blind-drunkard' },
  { id: 3, name: 'chaos' },
  { id: 4, name: 'vibes' },
  { id: 5, name: 'contrarian' },
  { id: 6, name: 'hype-train' },
  { id: 7, name: 'mercury-retrograde' },
  { id: 8, name: 'weatherperson' },
  { id: 9, name: 'crowd-sourced' },
  { id: 10, name: 'groundhog-day' },
  { id: 11, name: 'CG' },
  { id: 12, name: 'climate-anxiety' },
  { id: 13, name: 'too-early' },
  { id: 14, name: 'monday' },
  { id: 15, name: 'grant-funded' },
  { id: 16, name: 'the-algorithm' },
  { id: 17, name: 'peer-review' },
  { id: 18, name: 'dew-denier' },
  { id: 19, name: 'breaking-news' },
  { id: 20, name: 'engagement-bait' },
  { id: 21, name: 'both-sides' },
  { id: 22, name: 'sponsored-content' },
  { id: 23, name: 'influencer' },
  { id: 24, name: 'panic' },
  { id: 25, name: 'nostalgia' },
  { id: 26, name: 'astroturfed' },
  { id: 27, name: 'record-breaker' },
];

// ============================================================
// UTILITIES
// ============================================================

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function toF(c) { return c * 9 / 5 + 32; }

function fmtTemp(c, isUS) {
  if (isUS) return Math.round(toF(c)) + '°F';
  return Math.round(c) + '°C';
}

function fmtWind(kph, isUS) {
  if (kph === null || kph === undefined) return '—';
  if (isUS) return Math.round(kph * 0.621371) + ' mph';
  return Math.round(kph) + ' km/h';
}

function fmtPrecipAmt(mm, isUS) {
  if (mm === null || mm === undefined || mm <= 0) return 'None';
  if (isUS) return (mm / 25.4).toFixed(2) + '"';
  return mm.toFixed(1) + ' mm';
}

function cloudToText(fraction) {
  if (fraction === null || fraction === undefined) return '—';
  if (fraction <= 0.05) return 'Clear';
  if (fraction <= 0.25) return 'Mostly Clear';
  if (fraction <= 0.5) return 'Partly Cloudy';
  if (fraction <= 0.875) return 'Mostly Cloudy';
  return 'Overcast';
}

function fmtPrecip(p) { return Math.round(p * 100) + '%'; }

function randomBetween(a, b) { return a + Math.random() * (b - a); }

function randomElement(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function randomStep(maxStep) { return (Math.random() * 2 - 1) * maxStep; }

function randomGaussian(mean, sd) {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mean + z * sd;
}

function moonPhase(date) {
  // known new moon: 2024-01-11 11:57 UTC
  const knownNewMoon = new Date('2024-01-11T11:57:00Z');
  const lunation = 29.53058770576;
  const elapsed = (date - knownNewMoon) / (1000 * 60 * 60 * 24);
  const phase = ((elapsed % lunation) + lunation) % lunation;
  return phase / lunation;
}

function isRetrograde(date) {
  const d = date.toISOString().slice(0, 10);
  return RETROGRADE_WINDOWS.some(([s, e]) => d >= s && d <= e);
}

function isUSLocation(lat, lon) {
  return lat >= 24 && lat <= 50 && lon >= -125 && lon <= -66;
}

function sanitize(f) {
  if (!f) return f;
  if (f.dewpoint_c !== null && f.temp_c !== null) {
    f.dewpoint_c = Math.min(f.dewpoint_c, f.temp_c);
  }
  if (f.precip_prob !== null) f.precip_prob = clamp(f.precip_prob, 0, 1);
  if (f.cloud_cover !== null) f.cloud_cover = clamp(f.cloud_cover, 0, 1);
  return f;
}

function computeVibes(temp_c, dew_c, pressure_hpa, precip_prob, cloud_cover) {
  const tempScore = 1 - Math.min(Math.abs(temp_c - 21) / 20, 1);
  const dewScore = 1 - Math.min(Math.abs(dew_c - 11) / 20, 1);
  const pressScore = 1 - Math.min(Math.abs(pressure_hpa - 1015) / 30, 1);
  const precipScore = 1 - precip_prob;
  const cloudScore = 1 - cloud_cover * 0.5;
  return Math.round((tempScore + dewScore + pressScore + precipScore + cloudScore) / 5 * 100) / 10;
}

function makeForecast(lead, temp_c, dew_c, pressure_hpa, precip_prob, cloud_cover) {
  const f = sanitize({
    lead_h: lead,
    temp_c,
    dewpoint_c: dew_c,
    pressure_hpa,
    precip_prob: precip_prob ?? 0,
    cloud_cover: cloud_cover ?? 0.5,
  });
  f.vibes = computeVibes(f.temp_c, f.dewpoint_c, f.pressure_hpa, f.precip_prob, f.cloud_cover);
  return f;
}

function cloudLayersToFraction(layers) {
  if (!layers || !layers.length) return 0;
  const coverMap = { CLR: 0, SKC: 0, FEW: 0.125, SCT: 0.375, BKN: 0.625, OVC: 1.0 };
  return Math.max(...layers.map(l => coverMap[l.amount] ?? 0));
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ============================================================
// DATA FETCHING
// ============================================================

async function geocodeText(query) {
  const isUSZip = /^\d{5}(-\d{4})?$/.test(query.trim());
  const params = isUSZip
    ? 'postalcode=' + encodeURIComponent(query.trim()) + '&countrycodes=us'
    : 'q=' + encodeURIComponent(query);
  const url = 'https://nominatim.openstreetmap.org/search?' + params + '&format=json&limit=1&addressdetails=1';
  const res = await fetch(url, { headers: { 'User-Agent': 'stochastic-forecast/jmthornton.net' } });
  const data = await res.json();
  if (!data.length) throw new Error('Location not found: "' + query + '"');
  const r = data[0];
  const addr = r.address || {};
  const city = addr.city || addr.town || addr.village || addr.county || '';
  const state = addr.state || '';
  const country = addr.country_code ? addr.country_code.toUpperCase() : '';
  const displayName = city && state ? city + ', ' + state
    : city && country ? city + ', ' + country
    : r.display_name.split(',').slice(0, 2).join(',').trim();
  return { lat: parseFloat(r.lat), lon: parseFloat(r.lon), displayName };
}

function extractObsFields(obs) {
  return {
    temp_c: obs.temperature?.value ?? null,
    dewpoint_c: obs.dewpoint?.value ?? null,
    pressure_hpa: obs.barometricPressure?.value ? obs.barometricPressure.value / 100 : null,
    wind_kph: obs.windSpeed?.value ? obs.windSpeed.value * 3.6 : null,
    cloud_cover: cloudLayersToFraction(obs.cloudLayers),
    has_lightning: (obs.presentWeather || []).some(w =>
      w.weather && (w.weather.includes('TS') || w.weather.includes('LTG'))
    ),
    precip_last_hour_mm: obs.precipitationLastHour?.value ?? null,
  };
}

function findObsNearHoursAgo(obsList, hoursAgo) {
  const targetTime = Date.now() - hoursAgo * 3600000;
  let best = null;
  let minDiff = Infinity;
  for (const obs of obsList) {
    const diff = Math.abs(new Date(obs.timestamp).getTime() - targetTime);
    if (diff < minDiff) { minDiff = diff; best = obs; }
  }
  return best ? extractObsFields(best) : null;
}

async function fetchNWSData(lat, lon) {
  const pointsRes = await fetch(
    'https://api.weather.gov/points/' + lat.toFixed(4) + ',' + lon.toFixed(4),
    { headers: NWS_HEADERS }
  );
  if (!pointsRes.ok) throw new Error('NWS unavailable');
  const points = await pointsRes.json();
  const props = points.properties;

  const city = props.relativeLocation?.properties?.city ?? '';
  const state = props.relativeLocation?.properties?.state ?? '';
  const locationLabel = city && state ? city + ', ' + state : lat.toFixed(2) + ', ' + lon.toFixed(2);

  const stationsRes = await fetch(props.observationStations, { headers: NWS_HEADERS });
  if (!stationsRes.ok) throw new Error('NWS stations unavailable');
  const stationsData = await stationsRes.json();
  const stationId = stationsData.features[0]?.properties?.stationIdentifier;
  if (!stationId) throw new Error('No NWS station found');

  const obsRes = await fetch(
    'https://api.weather.gov/stations/' + stationId + '/observations?limit=15',
    { headers: NWS_HEADERS }
  );
  if (!obsRes.ok) throw new Error('NWS observations unavailable');
  const obsData = await obsRes.json();
  const obs = obsData.features.map(f => f.properties);

  return { locationLabel, stationId, obs };
}

async function fetchOpenMeteoCurrent(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    current: 'temperature_2m,dewpoint_2m,surface_pressure,precipitation,cloudcover,windspeed_10m',
    timezone: 'UTC',
  });
  const res = await fetch('https://api.open-meteo.com/v1/forecast?' + params);
  const data = await res.json();
  const c = data.current;
  return {
    temp_c: c.temperature_2m,
    dewpoint_c: c.dewpoint_2m,
    pressure_hpa: c.surface_pressure,
    wind_kph: c.windspeed_10m,
    cloud_cover: (c.cloudcover ?? 0) / 100,
    has_lightning: false,
  };
}

async function fetchClimoAndExtremes(lat, lon, month) {
  const mm = String(month).padStart(2, '0');
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    start_date: '2022-' + mm + '-01',
    end_date: '2024-' + mm + '-28',
    hourly: 'temperature_2m,dewpoint_2m,surface_pressure,precipitation,cloudcover,windspeed_10m',
    timezone: 'UTC',
  });
  const res = await fetch('https://archive-api.open-meteo.com/v1/archive?' + params);
  const data = await res.json();

  const temps = data.hourly.temperature_2m.filter(v => v !== null);
  const dews = data.hourly.dewpoint_2m.filter(v => v !== null);
  const pressures = data.hourly.surface_pressure.filter(v => v !== null);
  const precips = data.hourly.precipitation.filter(v => v !== null);
  const clouds = data.hourly.cloudcover.filter(v => v !== null);

  function mean(arr) { return arr.reduce((s, v) => s + v, 0) / arr.length; }
  function minOf(arr) { return Math.min.apply(null, arr); }
  function maxOf(arr) { return Math.max.apply(null, arr); }

  const precipProbs = precips.map(p => p > 0.1 ? 1 : 0);

  return {
    climo: {
      temp_c: mean(temps),
      dewpoint_c: mean(dews),
      pressure_hpa: mean(pressures),
      precip_prob: mean(precipProbs),
      cloud_cover: mean(clouds) / 100,
    },
    extremes: {
      temp: { min: minOf(temps), max: maxOf(temps) },
      dewpoint: { min: minOf(dews), max: maxOf(dews) },
      pressure: { min: minOf(pressures), max: maxOf(pressures) },
      precip_prob: { min: 0, max: 1 },
      cloud_cover: { min: 0, max: 1 },
    },
  };
}

async function fetchHistoricalDay(lat, lon, date) {
  const d = date.toISOString().slice(0, 10);
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    start_date: d,
    end_date: d,
    hourly: 'temperature_2m,dewpoint_2m,surface_pressure,precipitation,cloudcover,windspeed_10m',
    timezone: 'UTC',
  });
  const res = await fetch('https://archive-api.open-meteo.com/v1/archive?' + params);
  const data = await res.json();

  const times = data.hourly.time;
  const currentHour = new Date().getUTCHours();
  let bestIdx = 0;
  let minDiff = Infinity;
  for (let i = 0; i < times.length; i++) {
    const diff = Math.abs(parseInt(times[i].slice(11, 13)) - currentHour);
    if (diff < minDiff) { minDiff = diff; bestIdx = i; }
  }

  return {
    temp_c: data.hourly.temperature_2m[bestIdx],
    dewpoint_c: data.hourly.dewpoint_2m[bestIdx],
    pressure_hpa: data.hourly.surface_pressure[bestIdx],
    cloud_cover: (data.hourly.cloudcover[bestIdx] ?? 0) / 100,
  };
}

async function buildForecastData(lat, lon, geocodedName) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const isUS = isUSLocation(lat, lon);

  logStatus('nws', '> connecting to weather services...', 'pending');
  logStatus('climo', '> loading historical archive...', 'pending');

  const [nwsResult, climoResult] = await Promise.allSettled([
    isUS ? fetchNWSData(lat, lon) : Promise.reject(new Error('non-US')),
    fetchClimoAndExtremes(lat, lon, month),
  ]);

  let current, locationLabel, obs6h, obs24h, useUS;

  if (nwsResult.status === 'fulfilled') {
    useUS = true;
    const { locationLabel: label, obs } = nwsResult.value;
    locationLabel = label;
    current = extractObsFields(obs[0]);
    obs6h = findObsNearHoursAgo(obs, 6) || current;
    obs24h = findObsNearHoursAgo(obs, 24) || current;
    logStatus('nws', '✓ located station — ' + locationLabel, 'done');
  } else {
    useUS = false;
    logStatus('nws', '> NWS unavailable, using Open-Meteo...', 'pending');
    try {
      current = await fetchOpenMeteoCurrent(lat, lon);
    } catch (e) {
      throw new Error('Could not fetch current conditions: ' + e.message);
    }
    locationLabel = geocodedName || (lat.toFixed(2) + ', ' + lon.toFixed(2));
    obs6h = obs24h = Object.assign({}, current);
    logStatus('nws', '✓ current conditions loaded via Open-Meteo', 'done');
  }

  if (climoResult.status === 'rejected') {
    throw new Error('Failed to load historical archive: ' + climoResult.reason);
  }

  const { climo, extremes } = climoResult.value;
  logStatus('climo', '✓ climatological data loaded', 'done');

  // nostalgia: random year 1940 to (current_year - 5)
  logStatus('nostalgia', '> loading historical observation...', 'pending');
  const nostalgiaYear = Math.floor(randomBetween(1940, now.getFullYear() - 4));
  let nostalgiaDay = now.getDate();
  // handle Feb 29 on non-leap year
  if (now.getMonth() === 1 && now.getDate() === 29) nostalgiaDay = 28;
  const nostalgiaDate = new Date(Date.UTC(nostalgiaYear, now.getMonth(), nostalgiaDay));

  let obsNostalgia;
  try {
    obsNostalgia = await fetchHistoricalDay(lat, lon, nostalgiaDate);
  } catch (e) {
    obsNostalgia = Object.assign({}, climo);
  }
  obsNostalgia.year = nostalgiaYear;
  obsNostalgia.month = now.getMonth();
  obsNostalgia.weekday = nostalgiaDate.getUTCDay();

  const nostalgiaWeekday = DAY_NAMES[nostalgiaDate.getUTCDay()];
  const nostalgiaMonth = MONTH_NAMES[now.getMonth()];
  logStatus('nostalgia', '✓ fetched conditions from ' + nostalgiaWeekday + ', ' + nostalgiaMonth + ' ' + nostalgiaYear, 'done');

  // crowd-sourced: random date in past year
  const crowdDaysAgo = Math.floor(randomBetween(30, 365));
  const crowdDate = new Date(Date.now() - crowdDaysAgo * 86400000);
  let obsRandomPast;
  try {
    obsRandomPast = await fetchHistoricalDay(lat, lon, crowdDate);
  } catch (e) {
    obsRandomPast = Object.assign({}, climo);
  }
  obsRandomPast.weekday = crowdDate.getDay();
  obsRandomPast.month = crowdDate.getMonth();

  return {
    lat, lon,
    isUS: useUS,
    locationLabel,
    current,
    obs_6h_ago: obs6h,
    obs_24h_ago: obs24h,
    obs_nostalgia: obsNostalgia,
    obs_random_past: obsRandomPast,
    date: now,
    month,
    hour: now.getHours(),
    day_of_week: now.getDay(),
    is_retrograde: isRetrograde(now),
    moon_phase: moonPhase(now),
    climo,
    extremes,
  };
}

// ============================================================
// MEMBER COMPUTE FUNCTIONS
// ============================================================

function member1Drunkard(d) {
  let t = d.current.temp_c ?? d.climo.temp_c;
  let dew = d.current.dewpoint_c ?? d.climo.dewpoint_c;
  let p = d.current.pressure_hpa ?? d.climo.pressure_hpa;
  let precip = d.climo.precip_prob;
  let cloud = d.current.cloud_cover ?? d.climo.cloud_cover;
  return {
    member_id: 1, name: 'drunkard',
    tagline: 'Started somewhere reasonable and kept walking',
    forecasts: LEADS.map(lead => {
      t += randomStep(5); dew += randomStep(3); p += randomStep(3);
      precip = clamp(precip + randomStep(0.2), 0, 1);
      cloud = clamp(cloud + randomStep(0.2), 0, 1);
      return makeForecast(lead, t, dew, p, precip, cloud);
    }),
  };
}

function member2BlindDrunkard(d) {
  return {
    member_id: 2, name: 'blind-drunkard',
    tagline: "No idea where it was, no idea where it's going",
    forecasts: LEADS.map(lead => makeForecast(
      lead,
      d.climo.temp_c + randomStep(5),
      d.climo.dewpoint_c + randomStep(3),
      d.climo.pressure_hpa + randomStep(3),
      clamp(d.climo.precip_prob + randomStep(0.2), 0, 1),
      clamp(d.climo.cloud_cover + randomStep(0.2), 0, 1)
    )),
  };
}

function member3Chaos(d) {
  let t = d.current.temp_c ?? d.climo.temp_c;
  let dew = d.current.dewpoint_c ?? d.climo.dewpoint_c;
  let p = d.current.pressure_hpa ?? d.climo.pressure_hpa;
  let precip = d.climo.precip_prob;
  let cloud = d.current.cloud_cover ?? d.climo.cloud_cover;
  return {
    member_id: 3, name: 'chaos',
    tagline: "The ensemble's creative director",
    forecasts: LEADS.map(lead => {
      t += randomStep(15); dew += randomStep(9); p += randomStep(9);
      precip = clamp(precip + randomStep(0.6), 0, 1);
      cloud = clamp(cloud + randomStep(0.6), 0, 1);
      return makeForecast(lead, t, dew, p, precip, cloud);
    }),
  };
}

function member4Vibes(d) {
  const { extremes } = d;
  return {
    member_id: 4, name: 'vibes',
    tagline: 'Consulted no data. Extremely confident.',
    forecasts: LEADS.map(lead => makeForecast(
      lead,
      randomBetween(extremes.temp.min, extremes.temp.max),
      randomBetween(extremes.dewpoint.min, extremes.dewpoint.max),
      randomBetween(extremes.pressure.min, extremes.pressure.max),
      Math.random(),
      Math.random()
    )),
  };
}

function member5Contrarian(d) {
  const ct = d.current.temp_c ?? d.climo.temp_c;
  const cdew = d.current.dewpoint_c ?? d.climo.dewpoint_c;
  const cp = d.current.pressure_hpa ?? d.climo.pressure_hpa;
  return {
    member_id: 5, name: 'contrarian',
    tagline: "If it's warm now, obviously it'll be cold soon",
    forecasts: LEADS.map(lead => makeForecast(
      lead,
      d.climo.temp_c - (ct - d.climo.temp_c),
      d.climo.dewpoint_c - (cdew - d.climo.dewpoint_c),
      d.climo.pressure_hpa - (cp - d.climo.pressure_hpa),
      clamp(d.climo.precip_prob + (d.climo.temp_c - ct) * 0.02, 0, 1),
      clamp(d.climo.cloud_cover + (d.climo.temp_c - ct) * 0.02, 0, 1)
    )),
  };
}

function member6HypeTrain(d) {
  const obs6 = d.obs_6h_ago;
  const ct = d.current.temp_c ?? d.climo.temp_c;
  const cdew = d.current.dewpoint_c ?? d.climo.dewpoint_c;
  const cp = d.current.pressure_hpa ?? d.climo.pressure_hpa;
  const tTrend = ct - (obs6.temp_c ?? ct);
  const dewTrend = cdew - (obs6.dewpoint_c ?? cdew);
  const pTrend = cp - (obs6.pressure_hpa ?? cp);
  return {
    member_id: 6, name: 'hype-train',
    tagline: 'To the moon! Trend has never failed before.',
    forecasts: LEADS.map((lead, i) => makeForecast(
      lead,
      ct + tTrend * (i + 1) + randomGaussian(0, 1),
      cdew + dewTrend * (i + 1) + randomGaussian(0, 0.5),
      cp + pTrend * (i + 1) + randomGaussian(0, 0.5),
      clamp(d.climo.precip_prob + randomStep(0.1), 0, 1),
      clamp((d.current.cloud_cover ?? d.climo.cloud_cover) + randomStep(0.1), 0, 1)
    )),
  };
}

function member7MercuryRetrograde(d) {
  const mult = d.is_retrograde ? 10 : 0.5;
  let t = d.current.temp_c ?? d.climo.temp_c;
  let dew = d.current.dewpoint_c ?? d.climo.dewpoint_c;
  let p = d.current.pressure_hpa ?? d.climo.pressure_hpa;
  let precip = d.climo.precip_prob;
  let cloud = d.current.cloud_cover ?? d.climo.cloud_cover;
  return {
    member_id: 7, name: 'mercury-retrograde',
    tagline: d.is_retrograde ? 'Mercury is in retrograde and it shows' : 'Mild-mannered until the planets align',
    forecasts: LEADS.map(lead => {
      t += randomStep(5 * mult); dew += randomStep(3 * mult); p += randomStep(3 * mult);
      precip = clamp(precip + randomStep(0.2 * mult), 0, 1);
      cloud = clamp(cloud + randomStep(0.2 * mult), 0, 1);
      return makeForecast(lead, t, dew, p, precip, cloud);
    }),
  };
}

function member8Weatherperson(d) {
  const isAprilFools = d.date.getMonth() === 3 && d.date.getDate() === 1;
  return {
    member_id: 8, name: 'weatherperson',
    tagline: isAprilFools ? '100% chance of rain. April Fools. Or is it?' : "There's a 30% chance it's raining right now.",
    forecasts: LEADS.map(lead => makeForecast(
      lead, d.climo.temp_c, d.climo.dewpoint_c, d.climo.pressure_hpa,
      isAprilFools ? 1.0 : 0.30, 0.45
    )),
  };
}

function member9CrowdSourced(d) {
  const obs = d.obs_random_past;
  const dayName = DAY_NAMES[obs.weekday];
  const monthName = MONTH_NAMES[obs.month];
  return {
    member_id: 9, name: 'crowd-sourced',
    tagline: 'Sourced from the wisdom of a random ' + dayName + ' in ' + monthName,
    forecasts: LEADS.map(lead => makeForecast(
      lead,
      obs.temp_c ?? d.climo.temp_c,
      obs.dewpoint_c ?? d.climo.dewpoint_c,
      obs.pressure_hpa ?? d.climo.pressure_hpa,
      d.climo.precip_prob,
      obs.cloud_cover ?? d.climo.cloud_cover
    )),
  };
}

function member10GroundhogDay(d) {
  const isGroundhogDay = d.date.getMonth() === 1 && d.date.getDate() === 2;
  const obs = d.obs_24h_ago;
  return {
    member_id: 10, name: 'groundhog-day',
    tagline: isGroundhogDay
      ? 'Punxsutawney Phil already weighed in. This is consistent with his findings.'
      : 'Today is yesterday. Yesterday is today. Nothing changes.',
    forecasts: LEADS.map(lead => makeForecast(
      lead,
      obs.temp_c ?? d.climo.temp_c,
      obs.dewpoint_c ?? d.climo.dewpoint_c,
      obs.pressure_hpa ?? d.climo.pressure_hpa,
      d.climo.precip_prob,
      obs.cloud_cover ?? d.climo.cloud_cover
    )),
  };
}

function member11CG(d) {
  const lightning = d.current.has_lightning;
  return {
    member_id: 11, name: 'CG',
    tagline: lightning ? 'CG!! CG!! CG!! This is the storm of the century!!' : 'No CG detected. Positioning for intercept.',
    forecasts: LEADS.map(lead => makeForecast(
      lead, d.climo.temp_c, d.climo.dewpoint_c, d.climo.pressure_hpa,
      lightning ? 1.0 : d.climo.precip_prob,
      d.climo.cloud_cover
    )),
  };
}

function member12ClimateAnxiety(d) {
  return {
    member_id: 12, name: 'climate-anxiety',
    tagline: 'The trend is clear. Has always been clear. Will only get clearer.',
    forecasts: LEADS.map(lead => makeForecast(
      lead,
      d.climo.temp_c + 3,
      d.climo.dewpoint_c + 3,
      d.climo.pressure_hpa,
      clamp(d.climo.precip_prob * 1.1, 0, 1),
      d.climo.cloud_cover
    )),
  };
}

function member13TooEarly(d) {
  const obs = d.obs_6h_ago;
  return {
    member_id: 13, name: 'too-early',
    tagline: 'Showed up six hours early and refuses to update',
    forecasts: LEADS.map(lead => makeForecast(
      lead,
      obs.temp_c ?? d.climo.temp_c,
      obs.dewpoint_c ?? d.climo.dewpoint_c,
      obs.pressure_hpa ?? d.climo.pressure_hpa,
      d.climo.precip_prob,
      obs.cloud_cover ?? d.climo.cloud_cover
    )),
  };
}

function member14Monday(d) {
  const biases = { 0: [0, 0], 1: [-2, 0.15], 2: [-1, 0.05], 3: [0, 0], 4: [0.5, -0.05], 5: [2, -0.15], 6: [0, 0] };
  const [tb, pb] = biases[d.day_of_week] || [0, 0];
  return {
    member_id: 14, name: 'monday',
    tagline: d.day_of_week === 5 ? "Thank God it's Friday." : 'Mondays, am I right?',
    forecasts: LEADS.map(lead => makeForecast(
      lead,
      d.climo.temp_c + tb,
      d.climo.dewpoint_c,
      d.climo.pressure_hpa,
      clamp(d.climo.precip_prob + pb, 0, 1),
      d.climo.cloud_cover
    )),
  };
}

function member15GrantFunded(d) {
  const isTaxDay = d.date.getMonth() === 3 && d.date.getDate() === 15;
  if (isTaxDay) {
    return {
      member_id: 15, name: 'grant-funded',
      tagline: 'All funding redirected to the Treasury. No forecast available at this time.',
      forecasts: LEADS.map(lead => ({
        lead_h: lead, temp_c: null, dewpoint_c: null, pressure_hpa: null,
        precip_prob: null, cloud_cover: null, vibes: null,
      })),
    };
  }

  let t = d.climo.temp_c;
  let dew = d.climo.dewpoint_c;
  let p = d.climo.pressure_hpa;
  let precip = d.climo.precip_prob;
  let cloud = d.climo.cloud_cover;

  const forecasts = LEADS.map(lead => {
    t += randomStep(2.5); dew += randomStep(1.5); p += randomStep(1.5);
    precip = clamp(precip + randomStep(0.1), 0, 1);
    cloud = clamp(cloud + randomStep(0.1), 0, 1);
    const f = {
      lead_h: lead,
      temp_c: Math.random() < 0.2 ? null : t,
      dewpoint_c: Math.random() < 0.2 ? null : dew,
      pressure_hpa: Math.random() < 0.2 ? null : p,
      precip_prob: Math.random() < 0.2 ? null : precip,
      cloud_cover: Math.random() < 0.2 ? null : cloud,
      vibes: null,
    };
    if (f.temp_c !== null && f.dewpoint_c !== null) f.dewpoint_c = Math.min(f.dewpoint_c, f.temp_c);
    if (f.temp_c !== null && f.dewpoint_c !== null && f.pressure_hpa !== null && f.precip_prob !== null && f.cloud_cover !== null) {
      f.vibes = computeVibes(f.temp_c, f.dewpoint_c, f.pressure_hpa, f.precip_prob, f.cloud_cover);
    }
    return f;
  });

  return { member_id: 15, name: 'grant-funded', tagline: 'Results pending peer review and continued funding', forecasts };
}

function member16TheAlgorithm(d) {
  const dev = (d.current.temp_c ?? d.climo.temp_c) - d.climo.temp_c;
  return {
    member_id: 16, name: 'the-algorithm',
    tagline: 'Engagement-optimized for maximum interaction',
    forecasts: LEADS.map(lead => makeForecast(
      lead,
      d.climo.temp_c + dev * 2,
      d.climo.dewpoint_c + dev * 1.5,
      d.climo.pressure_hpa - dev * 3,
      clamp(d.climo.precip_prob + (dev < 0 ? 0.3 : -0.3), 0, 1),
      d.climo.cloud_cover
    )),
  };
}

function member18DewDenier(d) {
  let t = d.climo.temp_c;
  let p = d.climo.pressure_hpa;
  let precip = d.climo.precip_prob;
  return {
    member_id: 18, name: 'dew-denier',
    tagline: 'Humidity is just air that cares.',
    forecasts: LEADS.map(lead => {
      t += randomStep(2); p += randomStep(1);
      precip = clamp(precip + randomStep(0.1), 0, 1);
      const f = { lead_h: lead, temp_c: t, dewpoint_c: t, pressure_hpa: p, precip_prob: precip, cloud_cover: 1.0 };
      f.vibes = computeVibes(f.temp_c, f.dewpoint_c, f.pressure_hpa, f.precip_prob, f.cloud_cover);
      return f;
    }),
  };
}

function member19BreakingNews(d) {
  const isWarm = (d.current.temp_c ?? d.climo.temp_c) > d.climo.temp_c;
  const ex = d.extremes;
  return {
    member_id: 19, name: 'breaking-news',
    tagline: 'DEVELOPING: Unprecedented conditions forecast for your area',
    forecasts: LEADS.map(lead => makeForecast(
      lead,
      isWarm ? ex.temp.max : ex.temp.min,
      isWarm ? ex.dewpoint.max : ex.dewpoint.min,
      isWarm ? ex.pressure.max : ex.pressure.min,
      isWarm ? 0 : 1,
      isWarm ? 0 : 1
    )),
  };
}

function member20EngagementBait(d) {
  const isPiDay = d.date.getMonth() === 2 && d.date.getDate() === 14;
  return {
    member_id: 20, name: 'engagement-bait',
    tagline: isPiDay
      ? '52% chance of engagement. Values rounded to π for precision.'
      : '52% chance of engagement. Share to find out more.',
    forecasts: LEADS.map(lead => makeForecast(
      lead,
      Math.round(d.climo.temp_c),
      Math.round(d.climo.dewpoint_c),
      Math.round(d.climo.pressure_hpa * 10) / 10,
      0.51,
      d.climo.cloud_cover
    )),
  };
}

function member21BothSides(d) {
  const ex = d.extremes;
  return {
    member_id: 21, name: 'both-sides',
    tagline: 'Some models suggest warming. Others suggest cooling. Both are right.',
    forecasts: LEADS.map((lead, i) => {
      const useMax = i % 2 === 0;
      return makeForecast(
        lead,
        useMax ? ex.temp.max : ex.temp.min,
        useMax ? ex.dewpoint.max : ex.dewpoint.min,
        useMax ? ex.pressure.max : ex.pressure.min,
        useMax ? 0 : 1,
        useMax ? 0 : 1
      );
    }),
  };
}

function member22SponsoredContent() {
  const vpn = randomElement(FAKE_VPNS);
  const forecasts = LEADS.map(lead => {
    const f = makeForecast(lead, 22, 15, 1013, 0, 0.1);
    f.vibes = 9;
    return f;
  });
  return {
    member_id: 22, name: 'sponsored-content',
    tagline: 'Perfect weather for outdoor advertising. Brought to you by ' + vpn + '.',
    forecasts,
  };
}

function member23Influencer(d) {
  const isFullMoon = d.moon_phase > 0.45 && d.moon_phase < 0.55;
  if (isFullMoon) {
    const forecasts = LEADS.map(lead => {
      const f = makeForecast(lead, d.climo.temp_c + 6, d.climo.dewpoint_c, d.climo.pressure_hpa + 3, 0, 0.1);
      f.vibes = 10;
      return f;
    });
    return { member_id: 23, name: 'influencer', tagline: 'Full moon. Maximum content opportunity.', forecasts };
  }

  const isGolden = Math.random() < 0.5;
  const forecasts = LEADS.map(lead => {
    const f = isGolden
      ? makeForecast(lead, d.climo.temp_c + 6, d.climo.dewpoint_c, d.climo.pressure_hpa + 3, 0, 0.1)
      : makeForecast(lead, d.climo.temp_c - 6, d.climo.dewpoint_c + 2, d.climo.pressure_hpa - 15, 0.85, 0.9);
    f.vibes = isGolden ? 10 : 1;
    return f;
  });
  return {
    member_id: 23, name: 'influencer',
    tagline: isGolden ? 'Chasing the perfect forecast. Content incoming.' : 'Staying safe by documenting the catastrophe.',
    forecasts,
  };
}

function member24Panic(d) {
  const isNewMoon = d.moon_phase < 0.05 || d.moon_phase > 0.95;
  if (isNewMoon) {
    return {
      member_id: 24, name: 'panic',
      tagline: 'ALL IS DARK. PRESSURE READING UNCLEAR.',
      forecasts: LEADS.map(lead => makeForecast(lead, d.climo.temp_c, d.climo.dewpoint_c, d.climo.pressure_hpa, d.climo.precip_prob, d.climo.cloud_cover)),
    };
  }

  const cp = d.current.pressure_hpa ?? d.climo.pressure_hpa;
  const op = d.obs_6h_ago.pressure_hpa ?? cp;
  const trend = cp - op;
  const ct = d.current.temp_c ?? d.climo.temp_c;
  const cdew = d.current.dewpoint_c ?? d.climo.dewpoint_c;

  let t, dew, p, precip, tagline;
  if (trend < -0.5) {
    t = ct - 15; dew = cdew + 5; p = cp - 25; precip = 1.0;
    tagline = 'PRESSURE IS FALLING. THIS IS NOT A DRILL.';
  } else if (trend > 0.5) {
    t = ct + 15; dew = cdew - 5; p = cp + 20; precip = 0.0;
    tagline = 'PRESSURE RISING. UNKNOWN IF GOOD OR BAD. PANICKING ANYWAY.';
  } else {
    t = d.climo.temp_c; dew = d.climo.dewpoint_c; p = d.climo.pressure_hpa; precip = d.climo.precip_prob;
    tagline = 'No pressure trend detected. Suspicious.';
  }

  return {
    member_id: 24, name: 'panic', tagline,
    forecasts: LEADS.map(lead => makeForecast(lead, t, dew, p, precip, d.climo.cloud_cover)),
  };
}

function member25Nostalgia(d) {
  const isLeapDay = d.date.getMonth() === 1 && d.date.getDate() === 29;
  const obs = d.obs_nostalgia;
  const tagline = isLeapDay
    ? 'This date only exists every 4 years. Consulting 8 years ago instead.'
    : 'Sourced from a ' + DAY_NAMES[obs.weekday] + ' in ' + MONTH_NAMES[obs.month] + ' ' + obs.year + '.';
  return {
    member_id: 25, name: 'nostalgia', tagline,
    forecasts: LEADS.map(lead => makeForecast(
      lead,
      obs.temp_c ?? d.climo.temp_c,
      obs.dewpoint_c ?? d.climo.dewpoint_c,
      obs.pressure_hpa ?? d.climo.pressure_hpa,
      d.climo.precip_prob,
      obs.cloud_cover ?? d.climo.cloud_cover
    )),
  };
}

function member26Astroturfed(d) {
  const ref = new Date('2024-01-01');
  const months = (d.date.getFullYear() - ref.getFullYear()) * 12 + (d.date.getMonth() - ref.getMonth());
  const drift = months * 0.1;

  const isWinterSolstice = d.date.getMonth() === 11 && d.date.getDate() === 21;
  const isSummerSolstice = d.date.getMonth() === 5 && d.date.getDate() === 21;
  let tagline = 'Very similar to climatology, for reasons we cannot disclose';
  if (isWinterSolstice) tagline = 'The drift has peaked. Allegedly.';
  if (isSummerSolstice) tagline = 'The drift continues its natural seasonal cycle. Trust the process.';

  return {
    member_id: 26, name: 'astroturfed', tagline,
    forecasts: LEADS.map(lead => makeForecast(
      lead,
      d.climo.temp_c + drift,
      d.climo.dewpoint_c + drift,
      d.climo.pressure_hpa,
      d.climo.precip_prob,
      d.climo.cloud_cover
    )),
  };
}

function member27RecordBreaker(d) {
  const RECORDS = { temp: { min: -89.2, max: 56.7 }, dewpoint: { min: -60, max: 35.5 }, pressure: { min: 870.0, max: 1083.8 } };
  const isWarm = (d.current.temp_c ?? d.climo.temp_c) > d.climo.temp_c;
  return {
    member_id: 27, name: 'record-breaker',
    tagline: 'Current trajectory points directly at the world record',
    forecasts: LEADS.map(lead => makeForecast(
      lead,
      isWarm ? RECORDS.temp.max : RECORDS.temp.min,
      isWarm ? RECORDS.dewpoint.max : RECORDS.dewpoint.min,
      isWarm ? RECORDS.pressure.max : RECORDS.pressure.min,
      isWarm ? 0 : 1,
      isWarm ? 0 : 1
    )),
  };
}

function member17PeerReview(memberForecasts) {
  const forecasts = LEADS.map((lead, li) => {
    const vals = { temp_c: [], dewpoint_c: [], pressure_hpa: [], precip_prob: [], cloud_cover: [] };
    for (const mf of memberForecasts) {
      const f = mf.forecasts[li];
      if (!f) continue;
      for (const key of Object.keys(vals)) {
        const v = f[key];
        if (v !== null && v !== undefined && !isNaN(v)) vals[key].push(v);
      }
    }
    function mean(arr) { return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null; }

    const t = mean(vals.temp_c);
    const dew = mean(vals.dewpoint_c);
    const p = mean(vals.pressure_hpa);
    const precip = mean(vals.precip_prob);
    const cloud = mean(vals.cloud_cover);

    const f = {
      lead_h: lead,
      temp_c: t !== null ? t + randomGaussian(0, 0.5) : null,
      dewpoint_c: dew !== null ? dew + randomGaussian(0, 0.5) : null,
      pressure_hpa: p !== null ? p + randomGaussian(0, 0.5) : null,
      precip_prob: precip !== null ? clamp(precip + randomGaussian(0, 0.03), 0, 1) : null,
      cloud_cover: cloud !== null ? clamp(cloud + randomGaussian(0, 0.02), 0, 1) : null,
      vibes: null,
    };
    if (f.temp_c !== null && f.dewpoint_c !== null) f.dewpoint_c = Math.min(f.dewpoint_c, f.temp_c);
    if (f.temp_c !== null && f.dewpoint_c !== null && f.pressure_hpa !== null && f.precip_prob !== null && f.cloud_cover !== null) {
      f.vibes = computeVibes(f.temp_c, f.dewpoint_c, f.pressure_hpa, f.precip_prob, f.cloud_cover);
    }
    return f;
  });
  return { member_id: 17, name: 'peer-review', tagline: 'A consensus of nonsense is still a consensus.', forecasts };
}

// ============================================================
// ENSEMBLE
// ============================================================

function computeEnsemble(allForecasts, weights) {
  return LEADS.map((lead, li) => {
    const vars = { temp_c: [], dewpoint_c: [], pressure_hpa: [], precip_prob: [], cloud_cover: [] };

    for (const mf of allForecasts) {
      const f = mf.forecasts[li];
      if (!f) continue;
      const w = weights[mf.member_id] || 1;
      for (const key of Object.keys(vars)) {
        const v = f[key];
        if (v !== null && v !== undefined && !isNaN(v)) vars[key].push({ v, w });
      }
    }

    function wmean(items) {
      if (!items.length) return null;
      const sw = items.reduce((s, x) => s + x.w, 0);
      return items.reduce((s, x) => s + x.v * x.w, 0) / sw;
    }

    function wstd(items) {
      if (items.length < 2) return 0;
      const mu = wmean(items);
      const sw = items.reduce((s, x) => s + x.w, 0);
      return Math.sqrt(items.reduce((s, x) => s + x.w * (x.v - mu) ** 2, 0) / sw);
    }

    const t = wmean(vars.temp_c);
    const dew = wmean(vars.dewpoint_c);
    const p = wmean(vars.pressure_hpa);
    const precip = wmean(vars.precip_prob);
    const cloud = wmean(vars.cloud_cover);

    const ef = {
      lead_h: lead,
      temp_c: t,
      dewpoint_c: (dew !== null && t !== null) ? Math.min(dew, t) : dew,
      pressure_hpa: p,
      precip_prob: precip !== null ? clamp(precip, 0, 1) : null,
      cloud_cover: cloud !== null ? clamp(cloud, 0, 1) : null,
      temp_spread: wstd(vars.temp_c),
      vibes: null,
    };
    if (ef.temp_c !== null && ef.dewpoint_c !== null && ef.pressure_hpa !== null && ef.precip_prob !== null && ef.cloud_cover !== null) {
      ef.vibes = computeVibes(ef.temp_c, ef.dewpoint_c, ef.pressure_hpa, ef.precip_prob, ef.cloud_cover);
    }
    return ef;
  });
}

// ============================================================
// UI STATE
// ============================================================

let loadingMsgIdx = 0;
let loadingMsgInterval = null;
let statusLines = [];
let membersDone = 0;

function el(id) { return document.getElementById(id); }

function startLoadingAnimation() {
  const headline = el('loading-headline');
  loadingMsgInterval = setInterval(() => {
    if (headline) headline.textContent = LOADING_MESSAGES[loadingMsgIdx % LOADING_MESSAGES.length];
    loadingMsgIdx++;
  }, 1500);
}

function stopLoadingAnimation() {
  clearInterval(loadingMsgInterval);
}

function logStatus(id, msg, status) {
  const logEl = el('status-log');
  if (!logEl) return;

  const existing = statusLines.findIndex(l => l.id === id);
  if (existing >= 0) {
    statusLines[existing] = { id, text: msg, status };
  } else {
    statusLines.push({ id, text: msg, status });
  }

  if (statusLines.length > 12) statusLines = statusLines.slice(-12);

  logEl.innerHTML = statusLines.map(l => {
    const cls = l.status === 'done' ? 'log-done' : l.status === 'error' ? 'log-error' : 'log-pending';
    return '<p class="log-line ' + cls + '">' + escapeHtml(l.text) + '</p>';
  }).join('');
  logEl.scrollTop = logEl.scrollHeight;
}

function showPageError(msg) {
  stopLoadingAnimation();
  el('loading-section').style.display = 'none';
  el('error-message').textContent = msg;
  el('error-section').style.display = 'block';
}

function showCurrentConditions(current, locationLabel, isUS) {
  const locEl = el('current-location');
  if (locEl) locEl.textContent = locationLabel;
  el('ensemble-location').textContent = locationLabel;

  const heroEl = el('conditions-hero');
  const sky = cloudToText(current.cloud_cover);
  const tempVal = current.temp_c !== null ? fmtTemp(current.temp_c, isUS) : '—';
  const details = [
    current.dewpoint_c !== null ? 'Dew ' + fmtTemp(current.dewpoint_c, isUS) : null,
    current.pressure_hpa !== null ? Math.round(current.pressure_hpa) + ' hPa' : null,
    current.wind_kph !== null ? fmtWind(current.wind_kph, isUS) : null,
    fmtPrecipAmt(current.precip_last_hour_mm, isUS) !== 'None'
      ? fmtPrecipAmt(current.precip_last_hour_mm, isUS) + ' precip'
      : 'No precip',
    current.has_lightning ? '⚡ Lightning active' : null,
  ].filter(Boolean);

  heroEl.innerHTML =
    '<div class="cond-main">' +
      '<span class="cond-temp">' + escapeHtml(tempVal) + '</span>' +
      '<span class="cond-sky">' + escapeHtml(sky) + '</span>' +
    '</div>' +
    '<div class="cond-row">' +
      details.map(d => '<span>' + escapeHtml(d) + '</span>').join('') +
    '</div>';
}

function createMemberCards(weights) {
  const grid = el('members-grid');
  grid.innerHTML = '';
  for (const m of MEMBER_DEFS) {
    const w = weights[m.id] ? weights[m.id].toFixed(2) + '×' : '—';
    const card = document.createElement('div');
    card.className = 'member-card';
    card.id = 'card-' + m.id;
    card.innerHTML =
      '<div class="member-header">' +
        '<span class="member-name">' + escapeHtml(m.name) + '</span>' +
        '<span class="member-weight" id="wt-' + m.id + '">weight: ' + w + '</span>' +
      '</div>' +
      '<div class="member-loading-state" id="ml-' + m.id + '">' +
        '<span class="spinner spinner-sm"></span>' +
        '<span>running...</span>' +
      '</div>' +
      '<div id="mr-' + m.id + '" style="display:none">' +
        '<p class="member-tagline" id="mt-' + m.id + '"></p>' +
        '<p class="member-summary" id="ms-' + m.id + '"></p>' +
        '<button class="member-details-btn" onclick="window._stoch.toggleDetails(' + m.id + ')">forecast ▸</button>' +
        '<div class="member-details" id="md-' + m.id + '" style="display:none"></div>' +
      '</div>';
    grid.appendChild(card);
  }
}

function resolveMemberCard(memberId, forecast, isUS) {
  const loadingEl = el('ml-' + memberId);
  const resultsEl = el('mr-' + memberId);
  if (loadingEl) loadingEl.style.display = 'none';
  if (resultsEl) resultsEl.style.display = 'block';

  const taglineEl = el('mt-' + memberId);
  if (taglineEl) taglineEl.textContent = forecast.tagline;

  const f24 = forecast.forecasts.find(f => f.lead_h === 24);
  const summaryEl = el('ms-' + memberId);
  if (summaryEl) {
    if (f24 && f24.temp_c !== null) {
      summaryEl.textContent = '+24h: ' + fmtTemp(f24.temp_c, isUS) +
        ', precip ' + fmtPrecip(f24.precip_prob ?? 0);
    } else {
      summaryEl.textContent = 'Data withheld pending further study.';
    }
  }

  const detailsEl = el('md-' + memberId);
  if (detailsEl) detailsEl.appendChild(buildForecastTable(forecast.forecasts, isUS));

  membersDone++;
  const countEl = el('members-done-count');
  if (countEl) countEl.textContent = String(membersDone);
}

function buildForecastTable(forecasts, isUS) {
  const table = document.createElement('table');
  table.className = 'forecast-table';
  table.innerHTML = '<tr><th>Lead</th><th>Temp</th><th>Dew</th><th>Pres</th><th>Precip</th><th>Vibes</th></tr>';
  for (const f of forecasts) {
    function cell(v, fmt) {
      return v !== null && v !== undefined ? escapeHtml(fmt(v)) : '<span class="null-cell">—</span>';
    }
    const tr = document.createElement('tr');
    tr.innerHTML =
      '<td>+' + f.lead_h + 'h</td>' +
      '<td>' + cell(f.temp_c, v => fmtTemp(v, isUS)) + '</td>' +
      '<td>' + cell(f.dewpoint_c, v => fmtTemp(v, isUS)) + '</td>' +
      '<td>' + cell(f.pressure_hpa, v => Math.round(v) + ' hPa') + '</td>' +
      '<td>' + cell(f.precip_prob, fmtPrecip) + '</td>' +
      '<td>' + cell(f.vibes, v => v.toFixed(1)) + '</td>';
    table.appendChild(tr);
  }
  return table;
}

function showEnsembleResults(ensemble, isUS) {
  const f24 = ensemble.find(f => f.lead_h === 24);
  if (!f24 || f24.temp_c === null) return;

  const spreadVal = f24.temp_spread ? (isUS ? Math.round(f24.temp_spread * 9 / 5) : Math.round(f24.temp_spread)) : null;
  const spreadStr = spreadVal !== null ? ' ± ' + spreadVal + '°' + (isUS ? 'F' : 'C') : '';

  const bodyEl = el('ensemble-body');
  bodyEl.innerHTML =
    '<div class="ensemble-headline">' + fmtTemp(f24.temp_c, isUS) + spreadStr + '</div>' +
    '<div class="ensemble-subline">+24h ensemble mean (27 members, randomized weights)</div>' +
    '<p class="ensemble-disclaimer">*models do not actually agree on anything</p>';

  const tableWrapper = document.createElement('div');
  tableWrapper.style.overflowX = 'auto';
  tableWrapper.style.marginTop = '0.75em';
  tableWrapper.appendChild(buildForecastTable(ensemble, isUS));
  bodyEl.appendChild(tableWrapper);
}

// ============================================================
// WEIGHTS
// ============================================================

function generateWeights(memberIds) {
  const w = {};
  for (const id of memberIds) w[id] = randomBetween(0.5, 2.0);
  return w;
}

// ============================================================
// MAIN ORCHESTRATION
// ============================================================

async function runForecast(lat, lon, geocodedName) {
  membersDone = 0;
  statusLines = [];
  loadingMsgIdx = 0;

  el('location-section').style.display = 'none';
  el('error-section').style.display = 'none';
  el('results-section').style.display = 'none';
  el('loading-section').style.display = 'block';

  startLoadingAnimation();

  let fd;
  try {
    fd = await buildForecastData(lat, lon, geocodedName);
  } catch (e) {
    showPageError('Failed to load weather data: ' + e.message);
    return;
  }

  const weights = generateWeights(MEMBER_DEFS.map(m => m.id));

  logStatus('weights', '> generating ensemble weights...', 'pending');

  // compute all members except peer-review
  const computeFns = {
    1: () => member1Drunkard(fd),
    2: () => member2BlindDrunkard(fd),
    3: () => member3Chaos(fd),
    4: () => member4Vibes(fd),
    5: () => member5Contrarian(fd),
    6: () => member6HypeTrain(fd),
    7: () => member7MercuryRetrograde(fd),
    8: () => member8Weatherperson(fd),
    9: () => member9CrowdSourced(fd),
    10: () => member10GroundhogDay(fd),
    11: () => member11CG(fd),
    12: () => member12ClimateAnxiety(fd),
    13: () => member13TooEarly(fd),
    14: () => member14Monday(fd),
    15: () => member15GrantFunded(fd),
    16: () => member16TheAlgorithm(fd),
    18: () => member18DewDenier(fd),
    19: () => member19BreakingNews(fd),
    20: () => member20EngagementBait(fd),
    21: () => member21BothSides(fd),
    22: () => member22SponsoredContent(),
    23: () => member23Influencer(fd),
    24: () => member24Panic(fd),
    25: () => member25Nostalgia(fd),
    26: () => member26Astroturfed(fd),
    27: () => member27RecordBreaker(fd),
  };

  const nonPR = {};
  for (const [id, fn] of Object.entries(computeFns)) nonPR[parseInt(id)] = fn();

  const pr = member17PeerReview(Object.values(nonPR));
  const all = Object.assign({}, nonPR, { 17: pr });

  const sponsored = all[22];
  const vpnLine = sponsored.tagline.includes('Brought to you by ')
    ? sponsored.tagline.split('Brought to you by ')[1].replace('.', '')
    : null;

  logStatus('weights', '✓ weights assigned (sponsored-content: ' + weights[22].toFixed(2) + '×, peer-review: ' + weights[17].toFixed(2) + '×)', 'done');

  // async-flavored status logs for self-aware lines
  setTimeout(() => {
    logStatus('retrograde', '> consulting Mercury\'s orbital position...', 'pending');
    setTimeout(() => {
      logStatus('retrograde', fd.is_retrograde
        ? '✓ Mercury IS in retrograde (model skill: degraded)'
        : '✓ Mercury not in retrograde (model skill: nominal)', 'done');
    }, 350);
  }, 200);

  if (vpnLine) {
    setTimeout(() => {
      logStatus('vpn', '> sourcing sponsored content...', 'pending');
      setTimeout(() => {
        logStatus('vpn', '✓ brought to you by ' + vpnLine, 'done');
      }, 300);
    }, 700);
  }

  // show results container
  el('results-section').style.display = 'block';
  showCurrentConditions(fd.current, fd.locationLabel, fd.isUS);

  if (fd.is_retrograde) el('retrograde-badge').style.display = 'inline-block';

  // build member cards
  createMemberCards(weights);

  // assign staggered fake delays
  const delays = {};
  let maxDelay = 0;
  for (const m of MEMBER_DEFS) {
    if (m.id === 17) continue;
    const d = Math.round(randomBetween(300, 3800));
    delays[m.id] = d;
    if (d > maxDelay) maxDelay = d;
  }
  delays[17] = maxDelay + 500;

  setTimeout(() => {
    logStatus('delays', '> randomizing delay times...', 'pending');
    setTimeout(() => {
      logStatus('delays', '✓ delays randomized (peer-review assigned last slot)', 'done');
    }, 250);
  }, 500);

  // schedule card reveals
  const revealPromises = MEMBER_DEFS.map(m => new Promise(resolve => {
    setTimeout(() => {
      resolveMemberCard(m.id, all[m.id], fd.isUS);
      resolve();
    }, delays[m.id]);
  }));

  Promise.all(revealPromises).then(() => {
    const ensemble = computeEnsemble(Object.values(all), weights);
    showEnsembleResults(ensemble, fd.isUS);
    stopLoadingAnimation();
    el('loading-section').style.display = 'none';
    const logArchive = el('log-archive');
    const logSrc = el('status-log');
    if (logArchive && logSrc) logArchive.innerHTML = logSrc.innerHTML;
  });
}

// ============================================================
// DETAILS TOGGLE (exposed via window for inline onclick)
// ============================================================

window._stoch = {
  toggleDetails: function (memberId) {
    const details = el('md-' + memberId);
    const btn = details.previousElementSibling;
    if (details.style.display === 'none') {
      details.style.display = 'block';
      btn.textContent = 'forecast ▾';
    } else {
      details.style.display = 'none';
      btn.textContent = 'forecast ▸';
    }
  },
};

// ============================================================
// ENTRY POINT
// ============================================================

function init() {
  const locInput = el('location-input');
  const forecastBtn = el('forecast-btn');
  const locateBtn = el('locate-btn');
  const retryBtn = el('retry-btn');

  async function startWithLocation(lat, lon, geocodedName) {
    try {
      await runForecast(lat, lon, geocodedName);
    } catch (e) {
      showPageError(e.message);
    }
  }

  forecastBtn.addEventListener('click', async () => {
    const query = locInput.value.trim();
    if (!query) { locInput.focus(); return; }
    forecastBtn.disabled = true;
    forecastBtn.textContent = 'Locating...';
    try {
      const { lat, lon, displayName } = await geocodeText(query);
      forecastBtn.disabled = false;
      forecastBtn.textContent = 'Get forecast';
      await startWithLocation(lat, lon, displayName);
    } catch (e) {
      forecastBtn.disabled = false;
      forecastBtn.textContent = 'Get forecast';
      showPageError(e.message);
    }
  });

  locInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') forecastBtn.click();
  });

  locateBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      showPageError('Geolocation is not supported by your browser.');
      return;
    }
    locateBtn.disabled = true;
    locateBtn.textContent = 'Locating...';
    navigator.geolocation.getCurrentPosition(
      pos => {
        locateBtn.disabled = false;
        locateBtn.textContent = 'Locate me';
        startWithLocation(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        locateBtn.disabled = false;
        locateBtn.textContent = 'Locate me';
        showPageError('Location access denied. Please enter a location manually.');
      },
      { timeout: 10000 }
    );
  });

  retryBtn.addEventListener('click', () => {
    el('error-section').style.display = 'none';
    el('location-section').style.display = 'block';
  });
}

document.addEventListener('DOMContentLoaded', init);

})();
