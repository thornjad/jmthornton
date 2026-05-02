'use strict';

(function () {

// ============================================================
// CONSTANTS
// ============================================================

const LEADS = [6, 12, 18, 24, 48, 72, 96, 120, 144, 168];
const NOWCAST_LEADS = [6, 12];
const HALF_RANGE_C = 6; // approx half of typical daily temp swing

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
  'Initializing 25-member ensemble...',
  'Consulting the historical record...',
  "Checking Mercury's position...",
  'Running uncertainty quantification...',
  'Peer review in progress...',
  'Optimizing for engagement...',
  'Sourcing sponsored content...',
  'Applying day-of-week bias...',
  'Generating ensemble weights...',
  'Calibrating the vibes score...',
  'Verifying uncertainty quantification of uncertainty...',
  'Results pending further funding...',
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MEMBER_DEFS = [
  { id: 2,  name: 'legally blind drunkard', icon: '🙈' },
  { id: 3,  name: 'chaos',                  icon: '🌪️' },
  { id: 4,  name: 'vibes',                  icon: '✨' },
  { id: 5,  name: 'contrarian',             icon: '🙃' },
  { id: 6,  name: 'hype-train',             icon: '🚂' },
  { id: 7,  name: 'mercury-retrograde',     icon: '☿' },
  { id: 8,  name: 'weatherperson',          icon: '📺' },
  { id: 9,  name: 'crowd-sourced',          icon: '👥' },
  { id: 10, name: 'groundhog-day',          icon: '🦫' },
  { id: 11, name: 'CG',                     icon: '⚡' },
  { id: 12, name: 'cold-like-minnesota',    icon: '🥶' },
  { id: 13, name: 'too-early',              icon: '⏰' },
  { id: 14, name: 'monday',                 icon: '😩' },
  { id: 17, name: 'peer-review',            icon: '📋' },
  { id: 18, name: 'dew-denier',             icon: '💧' },
  { id: 19, name: 'breaking-news',          icon: '📰' },
  { id: 20, name: 'engagement-bait',        icon: '👆' },
  { id: 21, name: 'both-sides',             icon: '⚖️' },
  { id: 22, name: 'sponsored-content',      icon: '💰' },
  { id: 23, name: 'influencer',             icon: '📸' },
  { id: 24, name: 'panic',                  icon: '😱' },
  { id: 25, name: 'nostalgia',              icon: '📅' },
  { id: 26, name: 'definitely-not-sponsored', icon: '🛢️' },
  { id: 27, name: 'record-breaker',         icon: '🏆' },
  { id: 28, name: 'but-its-a-dry-heat',     icon: '🏜️' },
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

function dewToRH(temp_c, dew_c) {
  if (temp_c === null || dew_c === null) return null;
  const b = 17.625, c = 243.04;
  return Math.round(100 * Math.exp(b * dew_c / (c + dew_c)) / Math.exp(b * temp_c / (c + temp_c)));
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

function easterEggHtml(formattedStr) {
  const m = formattedStr.match(/^-?(\d+(?:\.\d+)?)/);
  if (!m) return '';
  const numStr = m[1];
  const n = parseFloat(numStr);
  if (Math.round(n) === 69) return ' <span class="easter-egg">nice</span>';
  if (numStr === '420' || numStr === '4.20' || numStr === '42.0') return ' <span class="easter-egg">blaze it</span>';
  return '';
}

function fmtTempHtml(c, isUS) {
  const s = fmtTemp(c, isUS);
  return escapeHtml(s) + easterEggHtml(s);
}

function fmtPrecipHtml(p) {
  const s = fmtPrecip(p);
  return escapeHtml(s) + easterEggHtml(s);
}

function fmtLeadTime(lead_h, startDate) {
  const target = new Date(startDate.getTime() + lead_h * 3600000);
  const startDay = new Date(startDate); startDay.setHours(0, 0, 0, 0);
  const targetDay = new Date(target); targetDay.setHours(0, 0, 0, 0);
  const diffDays = Math.round((targetDay - startDay) / 86400000);
  const h = target.getHours();
  const timeStr = (h % 12 || 12) + ' ' + (h < 12 ? 'AM' : 'PM');
  if (diffDays === 0) return 'Today ' + timeStr;
  if (diffDays === 1) return 'Tomorrow ' + timeStr;
  const dayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return dayShort[target.getDay()] + ' ' + timeStr;
}

function fmtLeadTimeShort(lead_h, startDate) {
  const target = new Date(startDate.getTime() + lead_h * 3600000);
  const h = target.getHours();
  return (h % 12 || 12) + ' ' + (h < 12 ? 'AM' : 'PM');
}

function fmtDay(lead_h, startDate) {
  const target = new Date(startDate.getTime() + lead_h * 3600000);
  const startDay = new Date(startDate); startDay.setHours(0, 0, 0, 0);
  const targetDay = new Date(target); targetDay.setHours(0, 0, 0, 0);
  const diffDays = Math.round((targetDay - startDay) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  const dayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return dayShort[target.getDay()];
}

// Groups per-lead forecasts into daily buckets, deriving hi/lo for each day.
// Expects forecasts with lead_h >= 18 (daily leads, not nowcast).
function groupIntoDays(forecasts, startDate) {
  const dayMap = new Map();
  for (const f of forecasts) {
    const day = startDate ? fmtDay(f.lead_h, startDate) : '+' + f.lead_h + 'h';
    if (!dayMap.has(day)) dayMap.set(day, []);
    dayMap.get(day).push(f);
  }
  const result = [];
  for (const [day, pts] of dayMap) {
    const temps = pts.map(p => p.temp_c).filter(v => v !== null && !isNaN(v));
    const dews = pts.map(p => p.dewpoint_c).filter(v => v !== null && !isNaN(v));
    const precips = pts.map(p => p.precip_prob).filter(v => v !== null && !isNaN(v));
    const clouds = pts.map(p => p.cloud_cover).filter(v => v !== null && !isNaN(v));
    const vibesArr = pts.map(p => p.vibes).filter(v => v !== null && !isNaN(v));
    let hi_c = null, lo_c = null;
    if (temps.length >= 2) {
      hi_c = Math.max.apply(null, temps);
      lo_c = Math.min.apply(null, temps);
      if (hi_c === lo_c) { hi_c += HALF_RANGE_C; lo_c -= HALF_RANGE_C; }
    } else if (temps.length === 1) {
      hi_c = temps[0] + HALF_RANGE_C;
      lo_c = temps[0] - HALF_RANGE_C;
    }
    const avgTemp = temps.length ? temps.reduce((s, v) => s + v, 0) / temps.length : null;
    const avgDew = dews.length ? dews.reduce((s, v) => s + v, 0) / dews.length : null;
    const repLeadH = pts[Math.floor(pts.length / 2)].lead_h;
    const maxPrecip = precips.length ? Math.max.apply(null, precips) : null;
    const avgCloud = clouds.length ? clouds.reduce((s, v) => s + v, 0) / clouds.length : null;
    const avgVibes = vibesArr.length ? Math.round(vibesArr.reduce((s, v) => s + v, 0) / vibesArr.length * 10) / 10 : null;
    const spreads = pts.map(p => p.temp_spread).filter(v => v !== null && v !== undefined && !isNaN(v));
    const avgSpread = spreads.length ? spreads.reduce((s, v) => s + v, 0) / spreads.length : null;
    result.push({ day, hi_c, lo_c, avg_temp_c: avgTemp, avg_dewpoint_c: avgDew, rep_lead_h: repLeadH, precip_prob: maxPrecip, cloud_cover: avgCloud, vibes: avgVibes, avg_spread_c: avgSpread });
  }
  return result;
}

function skyEmoji(cloudFraction, hasLightning, precipMm) {
  if (hasLightning) return '⛈️';
  if (precipMm && precipMm > 0) return '🌧️';
  if (cloudFraction === null || cloudFraction === undefined) return '⛅';
  if (cloudFraction <= 0.05) return '☀️';
  if (cloudFraction <= 0.25) return '🌤️';
  if (cloudFraction <= 0.5) return '⛅';
  if (cloudFraction <= 0.875) return '🌥️';
  return '☁️';
}

function randomBetween(a, b) { return a + Math.random() * (b - a); }

function randomElement(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function randomStep(maxStep) { return (Math.random() * 2 - 1) * maxStep; }

let _chaosPrecipTypes = null;
function getChaosPrecipTypes() {
  if (!_chaosPrecipTypes) _chaosPrecipTypes = LEADS.map(() => Math.random() < 0.5 ? 'rain' : 'snow');
  return _chaosPrecipTypes;
}

let _vibesPrecipType = null;
function getVibesPrecipType() {
  if (_vibesPrecipType === null) _vibesPrecipType = Math.random() < 0.5 ? 'rain' : 'snow';
  return _vibesPrecipType;
}

function precipTypeForMember(memberId, temp_c, lead_h) {
  if (memberId === 11) return 'hail';
  if (memberId === 8) return 'rain';
  if (memberId === 12) return 'snow';
  const leadIdx = LEADS.indexOf(lead_h);
  if (memberId === 3) return getChaosPrecipTypes()[Math.max(leadIdx, 0)];
  if (memberId === 4) return getVibesPrecipType();
  if (memberId === 21) return 'mix';
  return temp_c === null ? 'rain' : temp_c > 2 ? 'rain' : temp_c < -2 ? 'snow' : 'mix';
}

function precipLabel(type) {
  if (type === 'hail') return 'chance of hail';
  if (type === 'snow') return 'chance of snow';
  if (type === 'mix') return 'chance of rain and snow';
  return 'chance of rain';
}

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

// Snap precip to weather-forecast-style round values with a bias toward 0.
// Values below 0.18 are treated as no precipitation.
const PRECIP_SNAPS = [0, 0.10, 0.20, 0.25, 0.30, 0.40, 0.50, 0.60, 0.70, 0.75, 0.80, 0.90, 1.0];
function roundPrecip(p) {
  if (p === null) return null;
  if (p < 0.18) return 0;
  return PRECIP_SNAPS.reduce((a, b) => Math.abs(b - p) < Math.abs(a - p) ? b : a);
}

// Members with fixed/intentional precip values that should not be quantized.
const PRECIP_QUANTIZE_EXEMPT = new Set([20, 23]);

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
    pressure_hpa: (obs.seaLevelPressure?.value ?? obs.barometricPressure?.value)
      ? (obs.seaLevelPressure?.value ?? obs.barometricPressure?.value) / 100
      : null,
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
    current: 'temperature_2m,dewpoint_2m,pressure_msl,precipitation,cloudcover,windspeed_10m',
    timezone: 'UTC',
  });
  const res = await fetch('https://api.open-meteo.com/v1/forecast?' + params);
  const data = await res.json();
  const c = data.current;
  return {
    temp_c: c.temperature_2m,
    dewpoint_c: c.dewpoint_2m,
    pressure_hpa: c.pressure_msl,
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
    hourly: 'temperature_2m,dewpoint_2m,pressure_msl,precipitation,cloudcover,windspeed_10m',
    timezone: 'UTC',
  });
  const res = await fetch('https://archive-api.open-meteo.com/v1/archive?' + params);
  const data = await res.json();

  const temps = data.hourly.temperature_2m.filter(v => v !== null);
  const dews = data.hourly.dewpoint_2m.filter(v => v !== null);
  const pressures = data.hourly.pressure_msl.filter(v => v !== null);
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
    hourly: 'temperature_2m,dewpoint_2m,pressure_msl,precipitation,cloudcover,windspeed_10m',
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
    pressure_hpa: data.hourly.pressure_msl[bestIdx],
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

  const currentTempStr = current.temp_c !== null
    ? (isUS ? Math.round(toF(current.temp_c)) + '°F' : Math.round(current.temp_c) + '°C')
    : 'unknown';
  const skyDesc = current.cloud_cover !== null
    ? (current.cloud_cover < 0.2 ? 'clear' : current.cloud_cover < 0.5 ? 'partly cloudy' : current.cloud_cover < 0.8 ? 'mostly cloudy' : 'overcast')
    : 'unknown sky';
  const lightningNote = current.has_lightning ? ', lightning active' : '';
  logStatus('current-obs', '✓ currently ' + currentTempStr + ', ' + skyDesc + lightningNote, 'done');

  const pressDelta = (current.pressure_hpa !== null && obs6h.pressure_hpa !== null)
    ? current.pressure_hpa - obs6h.pressure_hpa : null;
  const pressDir = pressDelta === null ? 'steady'
    : pressDelta > 0.5 ? 'rising' : pressDelta < -0.5 ? 'falling' : 'steady';
  const pressDeltaStr = pressDelta !== null && Math.abs(pressDelta) >= 0.5
    ? ' (' + (pressDelta > 0 ? '+' : '') + pressDelta.toFixed(1) + ' hPa / 6h)' : '';
  logStatus('pressure-trend', '> checking pressure trend...', 'pending');
  logStatus('pressure-trend', '✓ pressure ' + pressDir + pressDeltaStr, 'done');

  const windKph = current.wind_kph;
  if (windKph !== null) {
    const windVal = isUS ? Math.round(windKph * 0.621) + ' mph' : Math.round(windKph) + ' km/h';
    logStatus('wind', '✓ wind: ' + (windKph < 3 ? 'calm' : windVal), 'done');
  } else {
    logStatus('wind', '✓ wind: calm', 'done');
  }

  const tempChange24h = (current.temp_c !== null && obs24h.temp_c !== null) ? current.temp_c - obs24h.temp_c : null;
  if (tempChange24h !== null && Math.abs(tempChange24h) >= 1) {
    const changeVal = isUS ? Math.round(tempChange24h * 9 / 5) : Math.round(tempChange24h);
    const unit = isUS ? '°F' : '°C';
    logStatus('trend-24h', '> checking 24h temperature trend...', 'pending');
    logStatus('trend-24h', '✓ ' + (tempChange24h > 0 ? '+' : '') + changeVal + unit + ' vs. 24 hours ago', 'done');
  }

  logStatus('lightning', '> scanning for lightning activity...', 'pending');
  logStatus('lightning', current.has_lightning ? '⚡ lightning detected — CG member on high alert' : '✓ no lightning detected', 'done');

  if (climoResult.status === 'rejected') {
    throw new Error('Failed to load historical archive: ' + climoResult.reason);
  }

  const { climo, extremes } = climoResult.value;
  const climoTempStr = isUS ? Math.round(toF(climo.temp_c)) + '°F' : Math.round(climo.temp_c) + '°C';
  const climoPressStr = Math.round(climo.pressure_hpa) + ' hPa';
  logStatus('climo', '✓ historical average: ' + climoTempStr + ', ' + climoPressStr, 'done');
  const extLoStr = isUS ? Math.round(toF(extremes.temp.min)) + '°F' : Math.round(extremes.temp.min) + '°C';
  const extHiStr = isUS ? Math.round(toF(extremes.temp.max)) + '°F' : Math.round(extremes.temp.max) + '°C';
  logStatus('extremes', '> checking seasonal extremes...', 'pending');
  logStatus('extremes', '✓ seasonal range: ' + extLoStr + '–' + extHiStr, 'done');

  // nostalgia: random year 1940 to (current_year - 5)
  logStatus('nostalgia', '> consulting nostalgia archive...', 'pending');
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
  logStatus('nostalgia', '✓ fetched conditions from a ' + nostalgiaWeekday + ' in ' + nostalgiaMonth + ' ' + nostalgiaYear, 'done');

  // crowd-sourced: random date in past year
  const crowdDaysAgo = Math.floor(randomBetween(30, 365));
  const crowdDate = new Date(Date.now() - crowdDaysAgo * 86400000);
  const crowdWeekday = DAY_NAMES[crowdDate.getDay()];
  const crowdMonth = MONTH_NAMES[crowdDate.getMonth()];
  logStatus('crowd', '> sourcing crowd-sourced analog...', 'pending');
  let obsRandomPast;
  try {
    obsRandomPast = await fetchHistoricalDay(lat, lon, crowdDate);
  } catch (e) {
    obsRandomPast = Object.assign({}, climo);
  }
  obsRandomPast.weekday = crowdDate.getDay();
  obsRandomPast.month = crowdDate.getMonth();
  logStatus('crowd', '✓ analog sourced from a ' + crowdWeekday + ' in ' + crowdMonth, 'done');

  const moonPh = moonPhase(now);
  const moonDesc = moonPh < 0.05 || moonPh > 0.95 ? 'new moon'
    : moonPh > 0.45 && moonPh < 0.55 ? 'full moon'
    : moonPh < 0.25 ? 'waxing crescent'
    : moonPh < 0.45 ? 'waxing gibbous'
    : moonPh < 0.75 ? 'waning gibbous'
    : 'waning crescent';
  logStatus('moon', '> checking lunar phase...', 'pending');
  logStatus('moon', '✓ ' + moonDesc + ' (' + Math.round(moonPh * 100) + '% illumination)', 'done');

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
    moon_phase: moonPh,
    climo,
    extremes,
  };
}

// ============================================================
// MEMBER COMPUTE FUNCTIONS
// ============================================================

function member2BlindDrunkard(d) {
  return {
    member_id: 2, name: 'legally blind drunkard',
    tagline: 'Legally blind. Legally drunk.',
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

function member4Vibes(d, otherForecasts) {
  const IDEAL = { temp: 22.2, dew: 12, pressure: 1015, precip: 0, cloud: 0.15 };
  const ANTI_IDEAL = { temp: 35, dew: 28, pressure: 990, precip: 0.8, cloud: 0.9 };
  function lerp(a, b, t) { return a + (b - a) * t; }

  // compute mean vibes score per lead from other members
  const meanVibesPerLead = LEADS.map((_, li) => {
    const scores = otherForecasts
      .map(mf => mf.forecasts[li] && mf.forecasts[li].vibes)
      .filter(v => v !== null && v !== undefined && !isNaN(v));
    return scores.length ? scores.reduce((s, v) => s + v, 0) / scores.length : 5;
  });

  const overallMean = meanVibesPerLead.reduce((s, v) => s + v, 0) / meanVibesPerLead.length;

  return {
    member_id: 4, name: 'vibes',
    tagline: 'The vibe is what it is.',
    _meanVibes: overallMean,
    forecasts: LEADS.map((lead, li) => {
      const mv = meanVibesPerLead[li];
      const alpha = (mv - 5) / 5; // -1 to +1
      const target = alpha > 0 ? IDEAL : ANTI_IDEAL;
      const t = alpha > 0
        ? lerp(d.climo.temp_c, target.temp, alpha)
        : lerp(d.climo.temp_c, target.temp, -alpha);
      const dew = alpha > 0
        ? lerp(d.climo.dewpoint_c, target.dew, alpha)
        : lerp(d.climo.dewpoint_c, target.dew, -alpha);
      const p = alpha > 0
        ? lerp(d.climo.pressure_hpa, target.pressure, alpha)
        : lerp(d.climo.pressure_hpa, target.pressure, -alpha);
      const precip = alpha > 0
        ? lerp(d.climo.precip_prob, target.precip, alpha)
        : lerp(d.climo.precip_prob, target.precip, -alpha);
      const cloud = alpha > 0
        ? lerp(d.climo.cloud_cover, target.cloud, alpha)
        : lerp(d.climo.cloud_cover, target.cloud, -alpha);
      return makeForecast(lead, t, dew, p, clamp(precip, 0, 1), clamp(cloud, 0, 1));
    }),
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
      clamp(d.climo.cloud_cover + (d.climo.temp_c - ct) * 0.02 + randomStep(0.3), 0, 1)
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
      isAprilFools ? 1.0 : 0.30, clamp(0.45 + randomStep(0.3), 0, 1)
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
      lightning ? clamp(0.9 + randomStep(0.1), 0, 1) : clamp(d.climo.cloud_cover + randomStep(0.3), 0, 1)
    )),
  };
}

function member12ColdLikMN(d) {
  let t = d.climo.temp_c;
  return {
    member_id: 12, name: 'cold-like-minnesota',
    tagline: "Oh ya, bit nippy out. Nothin' we can't handle, don'tcha know.",
    forecasts: LEADS.map(lead => {
      t += randomStep(2);
      return makeForecast(
        lead,
        -Math.abs(t),
        Math.min(-Math.abs(t), d.climo.dewpoint_c),
        d.climo.pressure_hpa,
        d.climo.precip_prob,
        d.climo.cloud_cover
      );
    }),
  };
}

function member13TooEarly(d) {
  const obs = d.obs_6h_ago;
  const baseCloud = obs.cloud_cover ?? d.climo.cloud_cover;
  return {
    member_id: 13, name: 'too-early',
    tagline: 'Showed up six hours early and refuses to update',
    forecasts: LEADS.map(lead => makeForecast(
      lead,
      obs.temp_c ?? d.climo.temp_c,
      obs.dewpoint_c ?? d.climo.dewpoint_c,
      obs.pressure_hpa ?? d.climo.pressure_hpa,
      d.climo.precip_prob,
      clamp(baseCloud + randomStep(0.2), 0, 1)
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
      clamp(d.climo.cloud_cover + randomStep(0.3), 0, 1)
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
      clamp((isWarm ? 0 : 1) + randomStep(0.15), 0, 1)
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
        clamp((useMax ? 0.1 : 0.9) + randomStep(0.15), 0, 1)
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
    return { member_id: 23, name: 'influencer', tagline: 'Full moon. Maximum reach.', forecasts };
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
    tagline: isGolden ? 'Golden hour is eternal. The forecast is a filter.' : 'Rain. Drama. Content.',
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

  const baseCloud = trend < -0.5 ? 0.9 : trend > 0.5 ? 0.1 : d.climo.cloud_cover;
  return {
    member_id: 24, name: 'panic', tagline,
    forecasts: LEADS.map(lead => makeForecast(lead, t, dew, p, precip, clamp(baseCloud + randomStep(0.2), 0, 1))),
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

function member26DefinitelyNotSponsored(d) {
  const ref = new Date('2024-01-01');
  const months = (d.date.getFullYear() - ref.getFullYear()) * 12 + (d.date.getMonth() - ref.getMonth());
  const drift = months * 0.1;

  const isWinterSolstice = d.date.getMonth() === 11 && d.date.getDate() === 21;
  const isSummerSolstice = d.date.getMonth() === 5 && d.date.getDate() === 21;
  let tagline = 'Definitely not influenced by fossil fuel interests. Definitely.';
  if (isWinterSolstice) tagline = 'The drift has peaked. Allegedly.';
  if (isSummerSolstice) tagline = 'The drift continues its natural seasonal cycle. Trust the process.';

  return {
    member_id: 26, name: 'definitely-not-sponsored', tagline,
    forecasts: LEADS.map(lead => makeForecast(
      lead,
      d.climo.temp_c + drift,
      d.climo.dewpoint_c + drift,
      d.climo.pressure_hpa,
      d.climo.precip_prob,
      clamp(d.climo.cloud_cover + randomStep(0.3), 0, 1)
    )),
  };
}

function member27RecordBreaker(d) {
  // slightly beyond actual world records: cold -89.2°C, hot 56.7°C
  const RECORDS = { temp: { min: -90.5, max: 57.5 }, dewpoint: { min: -65, max: 38 }, pressure: { min: 860, max: 1090 } };
  const isWarm = (d.current.temp_c ?? d.climo.temp_c) > d.climo.temp_c;
  return {
    member_id: 27, name: 'record-breaker',
    tagline: 'Current trajectory points directly past the world record',
    forecasts: LEADS.map(lead => makeForecast(
      lead,
      isWarm ? RECORDS.temp.max : RECORDS.temp.min,
      isWarm ? RECORDS.dewpoint.max : RECORDS.dewpoint.min,
      isWarm ? RECORDS.pressure.max : RECORDS.pressure.min,
      isWarm ? 0 : 1,
      clamp((isWarm ? 0 : 1) + randomStep(0.1), 0, 1)
    )),
  };
}

function member28ButItsADryHeat(d) {
  // Always predicts scorching heat: clamp to [85°F, 125°F] = [29.4°C, 51.7°C]
  // RH never above 10%, achieved by pinning dewpoint to temp - large offset
  const toF = c => c * 9 / 5 + 32;
  const toC = f => (f - 32) * 5 / 9;
  let tF = Math.max(85, Math.min(125, toF(d.climo.temp_c) + 60 + Math.random() * 20));
  return {
    member_id: 28, name: 'but-its-a-dry-heat',
    tagline: "Sure it's hot. But it's a dry heat.",
    forecasts: LEADS.map(lead => {
      tF = clamp(tF + randomStep(3), 85, 125);
      const t = toC(tF);
      // Dewpoint low enough to keep RH under 10%: dew = t - 30 gives ~7% RH at these temps
      const dew = t - 30;
      return makeForecast(lead, t, dew, d.climo.pressure_hpa + 5, 0, 0);
    }),
  };
}

function member17PeerReview(memberForecasts) {
  const isTaxDay = new Date().getMonth() === 3 && new Date().getDate() === 15;
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

    // drop ~50% of (lead, variable) combinations — grant-funded behavior absorbed
    const dropRate = isTaxDay ? 1.0 : 0.5;
    const f = {
      lead_h: lead,
      temp_c: (t !== null && Math.random() > dropRate) ? t + randomGaussian(0, 0.5) : null,
      dewpoint_c: (dew !== null && Math.random() > dropRate) ? dew + randomGaussian(0, 0.5) : null,
      pressure_hpa: (p !== null && Math.random() > dropRate) ? p + randomGaussian(0, 0.5) : null,
      precip_prob: (precip !== null && Math.random() > dropRate) ? clamp(precip + randomGaussian(0, 0.03), 0, 1) : null,
      cloud_cover: (cloud !== null && Math.random() > dropRate) ? clamp(cloud + randomGaussian(0, 0.02), 0, 1) : null,
      vibes: null,
    };
    if (f.temp_c !== null && f.dewpoint_c !== null) f.dewpoint_c = Math.min(f.dewpoint_c, f.temp_c);
    if (f.temp_c !== null && f.dewpoint_c !== null && f.pressure_hpa !== null && f.precip_prob !== null && f.cloud_cover !== null) {
      f.vibes = computeVibes(f.temp_c, f.dewpoint_c, f.pressure_hpa, f.precip_prob, f.cloud_cover);
    }
    return f;
  });
  const tagline = isTaxDay
    ? 'All funding redirected to the Treasury. No forecast available at this time.'
    : 'Consensus of nonsense. Results pending peer review and continued funding.';
  return { member_id: 17, name: 'peer-review', tagline, forecasts };
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

    const precipFinal = precip !== null ? (clamp(precip, 0, 1) < 0.20 ? 0 : clamp(precip, 0, 1)) : null;
    const ef = {
      lead_h: lead,
      temp_c: t,
      dewpoint_c: (dew !== null && t !== null) ? Math.min(dew, t) : dew,
      pressure_hpa: p,
      precip_prob: precipFinal,
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

function showCurrentConditions(current, locationLabel, isUS, fd) {
  const locEl = el('current-location');
  if (locEl) locEl.textContent = locationLabel;
  el('ensemble-location').textContent = locationLabel;

  const heroEl = el('conditions-hero');
  const sky = cloudToText(current.cloud_cover);
  const emoji = skyEmoji(current.cloud_cover, current.has_lightning, current.precip_last_hour_mm);
  const tempVal = current.temp_c !== null ? fmtTemp(current.temp_c, isUS) : '—';
  const rh = dewToRH(current.temp_c, current.dewpoint_c);

  let pressureTrendStr = null;
  if (fd && current.pressure_hpa !== null && fd.obs_6h_ago && fd.obs_6h_ago.pressure_hpa !== null) {
    const delta = current.pressure_hpa - fd.obs_6h_ago.pressure_hpa;
    if (delta > 0.5) pressureTrendStr = '↑ +' + delta.toFixed(1) + ' hPa';
    else if (delta < -0.5) pressureTrendStr = '↓ ' + delta.toFixed(1) + ' hPa';
  }

  const pressureStr = current.pressure_hpa !== null
    ? Math.round(current.pressure_hpa) + ' hPa' + (pressureTrendStr ? ' ' + pressureTrendStr : '')
    : null;

  const details = [
    rh !== null ? rh + '% humidity' : null,
    pressureStr,
    current.wind_kph !== null ? fmtWind(current.wind_kph, isUS) : null,
    fmtPrecipAmt(current.precip_last_hour_mm, isUS) !== 'None'
      ? fmtPrecipAmt(current.precip_last_hour_mm, isUS) + ' precip'
      : 'No precipitation',
    current.has_lightning ? '⚡ Lightning active' : null,
  ].filter(Boolean);

  heroEl.innerHTML =
    '<div class="cond-main">' +
      '<span class="cond-emoji">' + emoji + '</span>' +
      '<span class="cond-temp">' + escapeHtml(tempVal) + '</span>' +
      '<span class="cond-sky">' + escapeHtml(sky) + '</span>' +
    '</div>' +
    '<div class="cond-row">' +
      details.map(d => '<span>' + escapeHtml(d) + '</span>').join('') +
    '</div>';
}

function computeNarrative(memberResult, isUS, fd) {
  const fc = memberResult.forecasts;
  const dailyFc = fc.filter(f => !NOWCAST_LEADS.includes(f.lead_h));
  const days = groupIntoDays(dailyFc, fd.date);
  const tmr = days.find(d => d.day === 'Tomorrow') || days[0];
  const f168 = fc.find(f => f.lead_h === 168);

  const tHi = tmr && tmr.hi_c !== null ? fmtTemp(tmr.hi_c, isUS) : null;
  const tLo = tmr && tmr.lo_c !== null ? fmtTemp(tmr.lo_c, isUS) : null;
  const tPrecip = tmr && tmr.precip_prob !== null ? Math.round(tmr.precip_prob * 100) + '%' : null;
  const hiLo = tHi && tLo ? tHi + '/' + tLo : (tHi || null);

  switch (memberResult.member_id) {
    case 2: {
      if (!tHi) return randomElement([
        "I checked the thermometer. I think. Hard to tell from here.",
        "I went outside to verify. Something happened. I'm back inside. Forecast pending.",
        "I have the numbers right here. Give me a second. Actually they're somewhere.",
      ]);
      return randomElement([
        "I'm calling " + hiLo + " tomorrow. I walked outside to check but walked into the door frame. Still confident.",
        hiLo + " tomorrow. I double-checked. Or once. Either way I'm going with it.",
        "Pretty sure it's " + hiLo + " tomorrow. I based this on what I could make out through the window.",
        "Numbers say " + hiLo + ". I wrote those down myself. They look right from where I'm standing.",
      ]);
    }
    case 3: {
      if (!tHi) return randomElement([
        "Somewhere between absolute zero and the surface of the sun. Could go either way. I have no regrets.",
        "I don't have the numbers yet but when I do they will be correct. They are always correct.",
      ]);
      const far = f168 && f168.temp_c !== null ? fmtTemp(f168.temp_c, isUS) : null;
      if (far) return randomElement([
        hiLo + " tomorrow, then " + far + " by day 7. I stand behind every single one of these numbers.",
        "Calling " + hiLo + " tomorrow. Day 7: " + far + ". These numbers are correct. This is final.",
        hiLo + " through the week, closing at " + far + ". I would bet everything on this.",
      ]);
      return randomElement([
        hiLo + " tomorrow. I am confident. I am very confident.",
        "Tomorrow: " + hiLo + ". This is not a guess. This is a fact I have decided in advance.",
        hiLo + " and I would bet money on it. I would bet a lot of money.",
      ]);
    }
    case 4: {
      const mv = memberResult._meanVibes;
      if (mv === undefined || mv === null) return 'The vibe is what it is.';
      if (mv >= 7) return randomElement([
        'Aggregate vibes score: ' + mv.toFixed(1) + '/10. The vibes were immaculate. Ideal conditions incoming.',
        'Vibes came in at ' + mv.toFixed(1) + '/10. The ensemble is feeling good about tomorrow.',
        mv.toFixed(1) + '/10 across the board. That is an exceptional vibe reading. Go outside.',
      ]);
      if (mv <= 3) return randomElement([
        'Aggregate vibes score: ' + mv.toFixed(1) + '/10. The vibes were deeply off. Uncomfortable weather ahead.',
        'Vibes: ' + mv.toFixed(1) + '/10. The ensemble does not feel good about this. Something is wrong out there.',
        mv.toFixed(1) + '/10. That is a deeply concerning vibe score. Prepare accordingly.',
      ]);
      if (mv >= 5) return randomElement([
        'Aggregate vibes score: ' + mv.toFixed(1) + '/10. Vibes were decent. Conditions near average.',
        'Vibes at ' + mv.toFixed(1) + '/10. Not great, not terrible. The ensemble shrugged.',
        mv.toFixed(1) + '/10 overall. Fine vibes. Mediocre conditions expected.',
      ]);
      return randomElement([
        'Aggregate vibes score: ' + mv.toFixed(1) + '/10. Vibes were rough. Below average weather expected.',
        'Vibes: ' + mv.toFixed(1) + '/10. The ensemble is not enthusiastic about this forecast.',
        mv.toFixed(1) + '/10. Below the vibe threshold. Conditions will reflect that.',
      ]);
    }
    case 5: {
      const anomSign = (fd.current.temp_c ?? fd.climo.temp_c) > fd.climo.temp_c ? 'warm' : 'cold';
      const opp = anomSign === 'warm' ? 'cold' : 'warm';
      if (!tHi) return randomElement([
        "It's running " + anomSign + " right now. A correction is obviously coming. That's just how temperature works.",
        "Too " + anomSign + " today. Nature corrects. I am ready for it.",
      ]);
      return randomElement([
        "It's been too " + anomSign + ", so I put " + hiLo + " tomorrow. The overcorrection is not only inevitable, it is correct.",
        "Too " + anomSign + " right now. Obviously it's going to flip. That's what temperature does. " + hiLo + " tomorrow.",
        "Too " + anomSign + " today means " + opp + "er tomorrow. That's just thermodynamics. Calling " + hiLo + ".",
        "What goes " + anomSign + " must come back. " + hiLo + " is where it lands. I don't make the rules.",
      ]);
    }
    case 6: {
      const trendVal = (fd.current.temp_c ?? fd.climo.temp_c) - (fd.obs_6h_ago.temp_c ?? fd.current.temp_c ?? fd.climo.temp_c);
      const dir = trendVal > 0.5 ? 'warming' : trendVal < -0.5 ? 'cooling' : 'holding steady';
      if (!tHi) return randomElement([
        "We're " + dir + ". I have extrapolated this to its logical conclusion. The trend has never failed.",
        dir.charAt(0).toUpperCase() + dir.slice(1) + " and I will ride this as far as it goes.",
      ]);
      return randomElement([
        "We're " + dir + ", so I'm calling " + tHi + " tomorrow. I have ridden this trend to its end. It has never let me down.",
        "We're " + dir + ". I locked in " + tHi + " and didn't look away. This is the result.",
        dir.charAt(0).toUpperCase() + dir.slice(1) + " hard. " + tHi + " tomorrow. The trend is the signal. Everything else is noise.",
        "Trajectory: " + dir + ". Extrapolated to tomorrow: " + tHi + ". The trend continues. It always continues.",
      ]);
    }
    case 7: {
      if (fd.is_retrograde) {
        if (!tHi) return randomElement([
          "Mercury is literally going backwards right now. I cannot be held responsible for any of these numbers.",
          "In retrograde. Forecast is compromised. Filing anyway but you've been warned.",
        ]);
        return randomElement([
          "Mercury is in retrograde. I got " + hiLo + " for tomorrow. That is Mercury's fault, not mine.",
          hiLo + " tomorrow and I'm not responsible for any of it. Mercury is in retrograde.",
          "Mercury is literally going backwards and so is this forecast. " + hiLo + ". Don't look at me.",
        ]);
      }
      if (!tHi) return randomElement([
        "No retrograde today. I'm calling normal temperatures. Cautiously optimistic.",
        "Mercury is behaving. For now. Forecast filed. Staying alert.",
      ]);
      return randomElement([
        hiLo + " tomorrow. Mercury is cooperating. For now. I wouldn't get too comfortable.",
        "No retrograde. I'm calling " + hiLo + " and feeling cautiously okay about it.",
        hiLo + " tomorrow. Celestial conditions are favorable. Enjoy it while it lasts.",
      ]);
    }
    case 8: {
      if (!tHi) return randomElement([
        "Tonight: cloudy with a 30% chance of precipitation. Tomorrow: similar. Back to you in the studio.",
        "Still tracking some unsettled conditions tomorrow. We'll have your full forecast at eleven.",
      ]);
      return randomElement([
        "Tomorrow's high near " + tHi + ", low near " + (tLo || 'seasonal') + ". " + (tPrecip || '30%') + " chance of precipitation. Have a great night, everyone.",
        "Looking at tomorrow: " + hiLo + " with " + (tPrecip || 'a small chance of') + " precip. We'll keep you updated throughout the evening.",
        "Expect a high of " + tHi + " tomorrow, low near " + (tLo || 'seasonal') + ". " + (tPrecip || '30%') + " chance of rain. Back to you at the desk.",
        "Tomorrow brings " + tHi + " for the high. " + (tPrecip || '30%') + " chance of precipitation. Stay with us for the extended forecast.",
      ]);
    }
    case 9: {
      const dayName = DAY_NAMES[fd.obs_random_past.weekday];
      const monthName = MONTH_NAMES[fd.obs_random_past.month];
      if (!tHi) return randomElement([
        "I asked a " + dayName + " in " + monthName + " what the weather would be. It answered. I'm going with that.",
        "History matched today to a " + dayName + " in " + monthName + ". I trust what it did.",
      ]);
      return randomElement([
        "I asked a " + dayName + " in " + monthName + " and it said " + tHi + ". That " + dayName + " knew what it was doing.",
        "Found a " + dayName + " in " + monthName + " that matched today's setup. It called " + tHi + ". The archive speaks.",
        "A " + dayName + " in " + monthName + " was in identical conditions and came in at " + tHi + ". I defer to history.",
        "The " + dayName + " in " + monthName + " said " + tHi + ". It had no basis to deceive me.",
      ]);
    }
    case 10: {
      if (!tHi) return randomElement([
        "Same as today. Same as tomorrow. Same as it has always been. I have made my peace with this.",
        "Whatever it is today, that's what it is tomorrow. Filed accordingly.",
      ]);
      return randomElement([
        hiLo + " tomorrow. Same as today. Same as yesterday. Same as next week. I find it comforting.",
        "Today: " + hiLo + ". Tomorrow: " + hiLo + ". The day after: " + hiLo + ". I see no reason to update.",
        hiLo + " tomorrow, as expected. Nothing changes. I have made my peace with this and you should too.",
        "The forecast is " + hiLo + ". The forecast will remain " + hiLo + ". I will not be filing an update.",
      ]);
    }
    case 11: {
      const precip = tPrecip || '0%';
      if (fd.current.has_lightning) return randomElement([
        "CG!! CG!! CG!! I'm calling 100% precip all leads! Get in the car! We are going! Right now!",
        "LIGHTNING DETECTED. ALL LEADS: 100% PRECIP. I AM ALREADY IN THE CAR. WHERE ARE YOU?",
      ]);
      return randomElement([
        precip + " precip tomorrow. No cells developing yet. I'm parked near the car just in case.",
        "Quiet pattern. " + precip + " precip tomorrow. Nothing to chase. Still watching the environment.",
        precip + " precip tomorrow. No lightning detected. Filed the forecast and I'm back on watch.",
        "Environment is not supportive right now. " + precip + " precip. I'll be in the parking lot if anything fires up.",
        precip + " precip tomorrow. No significant convection expected. I remain on standby. You never know.",
      ]);
    }
    case 12: {
      const tomorrowTmpC = tmr && tmr.avg_temp_c !== null ? tmr.avg_temp_c : null;
      const shotsWeather = tomorrowTmpC !== null && tomorrowTmpC > -5 && tomorrowTmpC < 0;
      const windNote = "It's the wind that'll get ya.";
      if (!tHi) return randomElement([
        'Uff da. Real cold out there. ' + windNote,
        "Oh for sure, cold tomorrow. Bundle up. " + windNote,
      ]);
      if (shotsWeather) return randomElement([
        hiLo + ' tomorrow. Shorts weather, honestly. ' + windNote,
        hiLo + ' tomorrow. That is practically a heat wave. ' + windNote,
      ]);
      return randomElement([
        'Oh ya, ' + hiLo + ' tomorrow. Bundle up, for Pete\'s sake. ' + windNote,
        hiLo + ' tomorrow, you betcha. Good hotdish weather. ' + windNote,
        'Yah sure, ' + hiLo + ' tomorrow. We\'ve seen worse in February, oh for sure. ' + windNote,
        'Oh, ' + hiLo + ' tomorrow. Don\'t worry, it warms up in July. ' + windNote,
      ]);
    }
    case 13: {
      if (!tHi) return randomElement([
        "I got here six hours early and locked in my forecast. It is locked. I am not revisiting it.",
        "Already filed. Already locked. I'll check verification tomorrow to see how right I was.",
      ]);
      return randomElement([
        hiLo + " tomorrow. I called that six hours ago and I stand by it completely. Updates are for people with no conviction.",
        "I got here early. I filed " + hiLo + " before anyone else arrived. It is done.",
        hiLo + " tomorrow. Filed at 2 AM. Not changing it now. I don't operate that way.",
        "My forecast was in before sunrise. " + hiLo + ". I am standing pat.",
      ]);
    }
    case 14: {
      const dow = fd.day_of_week;
      if (dow === 5) return randomElement([
        "TGIF. " + (tHi ? tHi + " tomorrow. The weekend earned this." : "The forecast is good. It has to be."),
        (tHi ? hiLo + " for the weekend. " : "") + "It's Friday. I'm choosing to be optimistic.",
        "End of week. " + (tHi ? hiLo + " tomorrow. " : "") + "We made it.",
      ]);
      if (dow === 1) return randomElement([
        (tHi ? hiLo + " tomorrow." : "Already looking rough.") + " It's Monday. Of course it is.",
        "Monday forecast: " + (tHi || "unclear") + ". I tried to find a silver lining. I could not.",
        "It's Monday. " + (tHi ? hiLo + " tomorrow." : "The forecast reflects that."),
      ]);
      return randomElement([
        (tHi ? hiLo + " tomorrow. " : "") + "Still better than a Monday, technically.",
        "Not Friday yet. " + (tHi ? hiLo + " tomorrow." : "Hang in there."),
        (tHi ? hiLo + " tomorrow. " : "") + "Could be worse. Could be a Monday.",
        "Not the best day, not the worst day. " + (tHi ? hiLo + " tomorrow." : ""),
      ]);
    }
    case 17: {
      const nullCount = memberResult.forecasts.reduce((n, f) =>
        n + [f.temp_c, f.dewpoint_c, f.pressure_hpa, f.precip_prob, f.cloud_cover].filter(v => v === null).length, 0);
      if (!tHi) return randomElement([
        "The committee has reviewed the submissions. Several variables require additional funding before we can comment.",
        "Results are in review. Additional funding required before conclusions can be released.",
      ]);
      const fundingLine = nullCount > 5
        ? nullCount + " variables are still pending peer review and continued funding."
        : "Methodology available upon request.";
      return randomElement([
        "The committee arrived at " + hiLo + " for tomorrow. " + fundingLine,
        "Consensus reached: " + hiLo + " tomorrow. " + fundingLine,
        hiLo + " for tomorrow, subject to revision. " + fundingLine,
      ]);
    }
    case 18: {
      if (!tHi) return randomElement([
        "It will be whatever temperature it is tomorrow, at 100% relative humidity. The air will be completely saturated. This is normal.",
        "100% relative humidity tomorrow. The temperature doesn't matter once the air is full.",
      ]);
      return randomElement([
        hiLo + " tomorrow at 100% relative humidity. The dew point equals the temperature. You will feel every degree of that " + tHi + ".",
        tHi + " tomorrow. RH: 100%. The air is completely full. There is no room for comfort.",
        "Tomorrow: " + hiLo + " and fully saturated. The atmosphere is at capacity. This is technically within spec.",
        "Dew point: " + tHi + ". High: " + tHi + ". These numbers match and that is normal and fine.",
      ]);
    }
    case 19: {
      const isWarm = (fd.current.temp_c ?? fd.climo.temp_c) > fd.climo.temp_c;
      if (!tHi) return randomElement([
        "DEVELOPING: Unprecedented conditions inbound for your area. Stay with us for continuous coverage.",
        "BREAKING: Significant weather event expected tomorrow. Details to follow. Stay tuned.",
      ]);
      if (isWarm) return randomElement([
        "DEVELOPING: Unprecedented warmth threatens region. I'm forecasting " + tHi + " tomorrow. We will continue to update this story as it develops.",
        "BREAKING: Anomalous warmth event unfolding. High of " + tHi + " forecast for tomorrow. Coverage continues.",
        "URGENT: Above-normal temperatures persist. Calling " + tHi + " tomorrow. Stay with us.",
      ]);
      return randomElement([
        "DEVELOPING: Historic cold event unfolding. I'm forecasting " + tHi + " tomorrow. We will continue to update this story as it develops.",
        "BREAKING: Dangerous cold threatens the region. Tomorrow's high: " + tHi + ". Full coverage at eleven.",
        "ALERT: Cold air mass advancing. Calling " + tHi + " for tomorrow. More details as this story develops.",
      ]);
    }
    case 20: {
      const pct = tPrecip || '52%';
      if (!tHi) return randomElement([
        "You won't BELIEVE what's coming. LIKE AND SUBSCRIBE to unlock the full forecast.",
        "BREAKING forecast thread. Part 1 of 7. FOLLOW for the rest.",
      ]);
      return randomElement([
        hiLo + " tomorrow and " + pct + " precip. Drop a 🌧️ if you're not ready. The algorithm needs to know.",
        "WAIT — " + tHi + " tomorrow?? Comment your current temp below. This is important data.",
        hiLo + " tomorrow. " + pct + " precip. SHARE this before it expires. You've been warned.",
        "You scrolled past this forecast. It saw you. " + hiLo + " tomorrow. " + pct + " precip. Engage.",
      ]);
    }
    case 21: {
      const exHi = fmtTemp(fd.extremes.temp.max, isUS);
      const exLo = fmtTemp(fd.extremes.temp.min, isUS);
      if (!tHi) return randomElement([
        "Some data says " + exHi + ". Other data says " + exLo + ". Both deserve equal coverage.",
        "I'm hearing " + exHi + " from one camp, " + exLo + " from another. I see merit in all perspectives.",
      ]);
      return randomElement([
        "Some data says " + exHi + ". Other data says " + exLo + ". I gave both equal weight. Hence " + hiLo + ".",
        "There are two sides here: " + exHi + " and " + exLo + ". I split the difference: " + hiLo + ".",
        exHi + " is a valid forecast. So is " + exLo + ". I'm comfortable with " + hiLo + " and I think that's fair.",
        "Warm data: " + exHi + ". Cold data: " + exLo + ". Both deserve a voice. I gave you " + hiLo + ".",
      ]);
    }
    case 22: {
      const vpn = memberResult.tagline.includes('Brought to you by ')
        ? memberResult.tagline.split('Brought to you by ')[1].replace('.', '')
        : 'our sponsor';
      if (!tHi) return randomElement([
        "Beautiful day ahead. Zero clouds, zero precip. Brought to you by " + vpn + ".",
        "Clear skies and ideal conditions tomorrow. This forecast is brought to you by " + vpn + ".",
      ]);
      return randomElement([
        tHi + " and sunny tomorrow. Zero clouds, zero precipitation. Brought to you by " + vpn + ". Perfect conditions to browse securely.",
        "Tomorrow: " + tHi + ", clear skies, zero precip. Ideal outdoor weather. Sponsored by " + vpn + ".",
        "High of " + tHi + " tomorrow with zero precipitation. Brought to you by " + vpn + ". Stay protected out there.",
      ]);
    }
    case 23: {
      const tl = memberResult.tagline;
      if (tl.includes('Full moon')) return randomElement([
        (tHi ? tHi + " and " : "") + "the full moon is out. The lighting is already ethereal. Zero clouds. Zero precip. Maximum reach.",
        "Full moon tonight. " + (tHi || "Perfect temps") + " and zero clouds. This is the content.",
        (tHi ? tHi + " tomorrow. " : "") + "Full moon. Zero clouds. The content writes itself.",
      ]);
      if (tl.includes('Rain')) return randomElement([
        (hiLo ? hiLo + " and " + (tPrecip || 'heavy') + " precip tomorrow. " : "") + "The storm aesthetic is unreal right now. This is incredible content.",
        "Rain tomorrow. " + (hiLo || "Wild temps") + ". The drama is going to be immaculate. I will be filming everything.",
        (tPrecip || 'Heavy') + " precip and " + (hiLo || "moody temps") + " tomorrow. The light through the clouds is going to be insane.",
      ]);
      return randomElement([
        (tHi ? tHi + " tomorrow. " : "") + "Golden hour is going to be absolutely insane. Zero clouds. You need to be outside for this.",
        "Tomorrow: " + (tHi || "perfect temps") + ", clear skies. The light will be unreal. I'm already planning the shoot.",
        "Golden hour forecast: perfect. " + (tHi || "Beautiful temps") + " tomorrow. If you're not outside for this you're missing it.",
      ]);
    }
    case 24: {
      const tl = memberResult.tagline;
      if (tl.includes('FALLING')) return randomElement([
        "PRESSURE IS FALLING. I am calling " + (tLo || 'dangerously cold lows') + " and " + (tPrecip || '100%') + " precip. THIS IS NOT A DRILL. EVERYONE SHOULD BE CONCERNED.",
        "IT IS FALLING. EVERYTHING IS FALLING. " + (tPrecip || '100%') + " PRECIP TOMORROW. LOW: " + (tLo || 'UNKNOWN') + ". I AM VERY CONCERNED.",
        "PRESSURE DROP DETECTED. Forecasting " + (tLo || 'severe lows') + " and " + (tPrecip || '100%') + " precip. I NEED EVERYONE TO REMAIN CALM. I AM NOT CALM.",
      ]);
      if (tl.includes('RISING')) return randomElement([
        "PRESSURE IS RISING. I got " + (tHi || 'warming') + " and clearing. I DON'T KNOW IF THIS IS GOOD OR BAD. PANICKING REGARDLESS.",
        "PRESSURE UP. SKIES CLEARING. " + (tHi || 'TEMPS RISING') + ". I DON'T KNOW WHAT THIS MEANS BUT I AM ON HIGH ALERT.",
        "IT IS RISING. FAST. Calling " + (tHi || 'warming') + " tomorrow. WHETHER THIS IS GOOD OR BAD I CANNOT SAY.",
      ]);
      if (tl.includes('ALL IS DARK')) return randomElement([
        "New moon. No light. I'm holding at " + (tHi || fmtTemp(fd.climo.temp_c, isUS)) + " until the sky clears. Something feels wrong.",
        "ALL IS DARK. Forecasting " + (tHi || fmtTemp(fd.climo.temp_c, isUS)) + " tomorrow. I don't trust the dark. I'm monitoring.",
      ]);
      return randomElement([
        (hiLo ? hiLo + " tomorrow. " : "") + "No pressure trend. Nothing is changing. I don't trust it.",
        "Forecast: " + (hiLo || "unclear") + ". Pressure steady. Suspiciously steady. I am watching.",
        (hiLo ? hiLo + " tomorrow. " : "") + "Everything is stable. That is the most suspicious thing I've ever seen.",
      ]);
    }
    case 25: {
      const obs = fd.obs_nostalgia;
      const wday = DAY_NAMES[obs.weekday];
      const mon = MONTH_NAMES[obs.month];
      if (!tHi) return randomElement([
        "I found a " + wday + " in " + mon + " " + obs.year + " that looked just like today. I'm going with what it did.",
        "The archive matched this pattern to " + mon + " " + obs.year + ". Whatever that day did, we do now.",
      ]);
      return randomElement([
        "I found a " + wday + " in " + mon + " " + obs.year + " just like this one. It came in at " + tHi + ". History repeats.",
        "A " + wday + " in " + mon + " " + obs.year + " looked exactly like today. That day called " + tHi + ". I'm following its lead.",
        "The archive matched today to " + mon + " " + obs.year + ". A " + wday + ". It forecast " + tHi + ". I trust the archive.",
        "Pattern match: " + wday + ", " + mon + " " + obs.year + ". That day settled at " + tHi + ". So does tomorrow.",
      ]);
    }
    case 26: {
      if (!tHi) return randomElement([
        "Our projections are consistent with natural baseline variability. Any warming trend you observe is completely normal. No further comment.",
        "Conditions are entirely as expected. There is no cause for concern. No further comment.",
      ]);
      return randomElement([
        hiLo + " tomorrow, consistent with our gradual baseline projections. This is entirely natural. There is nothing unusual happening here. No further comment.",
        hiLo + " tomorrow. Fully consistent with expected natural variability. Our projections remain on track. No further comment.",
        "Baseline forecast: " + hiLo + ". Any apparent trend is well within historical norms. We stand by our data. No further comment.",
      ]);
    }
    case 27: {
      const isWarmRun = memberResult.forecasts[0] && memberResult.forecasts[0].temp_c > 0;
      const recTemp = fmtTemp(isWarmRun ? 56.7 : -89.2, isUS);
      if (!tHi) return randomElement([
        "Current trajectory points directly past the world record. Direction TBD. I recommend appropriate gear.",
        "The record is in range. I expect it to fall tomorrow. Standby for confirmation.",
      ]);
      return randomElement([
        "I'm calling " + tHi + " for tomorrow. The all-time record is " + recTemp + ". We are on track to exceed it.",
        tHi + " tomorrow. The world record stands at " + recTemp + ". Current trajectory has us clearing it.",
        "Forecasting " + tHi + " tomorrow. That is past the world record of " + recTemp + ". I recommend appropriate gear.",
      ]);
    }
    case 28: {
      if (!tHi) return randomElement([
        "It's going to be extremely hot. But it's a dry heat. You're fine. Drink some water.",
        "Hot tomorrow. Very hot. But dry. Completely manageable.",
      ]);
      return randomElement([
        tHi + " tomorrow. Yes, that number looks high. But it's a dry heat. Air conditioning is a crutch.",
        tHi + " tomorrow. Dry heat. Stay hydrated. Stop complaining.",
        "I'm putting " + tHi + " out there. It's not 'hot,' it's warm with low humidity. The distinction matters.",
        tHi + " tomorrow. Drink some water. It's a dry heat. You'll be fine.",
        "I'm calling " + tHi + " and that is a perfectly reasonable temperature. Dry heat. You'll be fine.",
      ]);
    }
    default:
      return '';
  }
}

function weightStyle(w) {
  if (w >= 1.8) return 'opacity:0.8;color:var(--mint);';
  if (w >= 1.3) return 'opacity:0.65;';
  if (w <= 0.7) return 'opacity:0.25;';
  return 'opacity:0.45;';
}

function createMemberCards(weights) {
  const grid = el('members-grid');
  grid.innerHTML = '';
  for (const m of MEMBER_DEFS) {
    const wVal = weights[m.id];
    const wStr = wVal ? wVal.toFixed(2) + '×' : '—';
    const wStyle = wVal ? weightStyle(wVal) : 'opacity:0.45;';
    const card = document.createElement('div');
    card.className = 'member-card';
    card.id = 'card-' + m.id;
    card.innerHTML =
      '<div class="member-header">' +
        '<span class="member-name-group">' +
          '<span class="member-name">' + escapeHtml(m.name) + '</span>' +
          '<span class="member-tagline-inline" id="tl-' + m.id + '"></span>' +
        '</span>' +
        '<span class="member-weight" id="wt-' + m.id + '" style="' + wStyle + '">' + wStr + '</span>' +
      '</div>' +
      '<div class="member-loading-state" id="ml-' + m.id + '">' +
        '<span class="spinner spinner-sm"></span>' +
        '<span>running...</span>' +
      '</div>' +
      '<div id="mr-' + m.id + '" style="display:none">' +
        '<p class="member-narrative" id="mn-' + m.id + '"></p>' +
        '<div class="member-fc-row" id="mfc-' + m.id + '"></div>' +
        '<button class="member-details-btn" onclick="window._stoch.toggleDetails(' + m.id + ')">' +
          'forecast ▸' +
        '</button>' +
        '<div class="member-details" id="md-' + m.id + '" style="display:none"></div>' +
      '</div>';
    grid.appendChild(card);
  }
}

function resolveMemberCard(memberId, forecast, isUS, startDate, fd) {
  const loadingEl = el('ml-' + memberId);
  const resultsEl = el('mr-' + memberId);
  if (loadingEl) loadingEl.style.display = 'none';
  if (resultsEl) resultsEl.style.display = 'block';

  const taglineEl = el('tl-' + memberId);
  if (taglineEl) taglineEl.textContent = ' — ' + forecast.tagline;

  const narrativeEl = el('mn-' + memberId);
  if (narrativeEl && fd) narrativeEl.textContent = computeNarrative(forecast, isUS, fd);

  const fcRowEl = el('mfc-' + memberId);
  if (fcRowEl) {
    const ncForecasts = forecast.forecasts.filter(f => NOWCAST_LEADS.includes(f.lead_h));
    const dailyFc = forecast.forecasts.filter(f => !NOWCAST_LEADS.includes(f.lead_h));
    const days = groupIntoDays(dailyFc, startDate);
    const tmr = days.find(d => d.day === 'Tomorrow') || days[0];

    let html = '';
    for (const f of ncForecasts) {
      const timeStr = fmtLeadTimeShort(f.lead_h, startDate);
      const emoji = skyEmoji(f.cloud_cover, false, null);
      const temp = f.temp_c !== null ? fmtTempHtml(f.temp_c, isUS) : '—';
      const rh = f.temp_c !== null && f.dewpoint_c !== null ? dewToRH(f.temp_c, f.dewpoint_c) : null;
      const pType = precipTypeForMember(memberId, f.temp_c, f.lead_h);
      const parts = [];
      if (rh !== null) parts.push(rh + '% humidity');
      if (f.precip_prob !== null) parts.push(fmtPrecipHtml(f.precip_prob) + ' ' + escapeHtml(precipLabel(pType)));
      html +=
        '<div class="member-fc-line">' +
          '<span class="mfc-time">' + escapeHtml(timeStr) + '</span>' +
          '<span class="mfc-emoji">' + emoji + '</span>' +
          '<span class="mfc-temp">' + temp + '</span>' +
          '<span class="mfc-detail">' + (parts.join('  ·  ') || '—') + '</span>' +
        '</div>';
    }

    if (tmr) {
      const emoji = skyEmoji(tmr.cloud_cover, false, tmr.precip_prob > 0.5 ? 1 : 0);
      const hiStr = tmr.hi_c !== null ? fmtTempHtml(tmr.hi_c, isUS) : '—';
      const loStr = tmr.lo_c !== null ? fmtTempHtml(tmr.lo_c, isUS) : '—';
      const tmrRh = tmr.avg_temp_c !== null && tmr.avg_dewpoint_c !== null ? dewToRH(tmr.avg_temp_c, tmr.avg_dewpoint_c) : null;
      const tmrPType = precipTypeForMember(memberId, tmr.avg_temp_c, tmr.rep_lead_h);
      const tmrParts = [loStr + ' lo'];
      if (tmrRh !== null) tmrParts.push(tmrRh + '% humidity');
      if (tmr.precip_prob !== null) tmrParts.push(fmtPrecipHtml(tmr.precip_prob) + ' ' + escapeHtml(precipLabel(tmrPType)));
      html +=
        '<div class="member-fc-line member-fc-tomorrow">' +
          '<span class="mfc-time">Tomorrow</span>' +
          '<span class="mfc-emoji">' + emoji + '</span>' +
          '<span class="mfc-temp">' + hiStr + '</span>' +
          '<span class="mfc-detail">' + tmrParts.join('  ·  ') + '</span>' +
        '</div>';
    }

    fcRowEl.innerHTML = html;
  }

  const detailsEl = el('md-' + memberId);
  if (detailsEl) detailsEl.appendChild(buildForecastTable(forecast.forecasts, isUS, startDate, memberId));

  membersDone++;
  const countEl = el('members-done-count');
  if (countEl) countEl.textContent = String(membersDone);
}

function nullCell(v, fmt) {
  return v !== null && v !== undefined && !isNaN(v) ? escapeHtml(fmt(v)) : '<span class="null-cell">—</span>';
}

function buildForecastTable(forecasts, isUS, startDate, memberId) {
  const wrap = document.createElement('div');

  const nowcasts = startDate ? forecasts.filter(f => NOWCAST_LEADS.includes(f.lead_h)) : [];
  const dailyLeads = startDate ? forecasts.filter(f => !NOWCAST_LEADS.includes(f.lead_h)) : forecasts;

  if (nowcasts.length) {
    const lbl = document.createElement('p');
    lbl.className = 'forecast-section-label';
    lbl.textContent = 'Next 12 hours';
    wrap.appendChild(lbl);

    const tbl = document.createElement('table');
    tbl.className = 'forecast-table';
    tbl.innerHTML = '<tr><th>Time</th><th></th><th>Temp</th><th>Humidity</th><th>Precip</th><th>Vibes</th></tr>';
    for (const f of nowcasts) {
      const rh = f.temp_c !== null && f.dewpoint_c !== null ? dewToRH(f.temp_c, f.dewpoint_c) : null;
      const pType = precipTypeForMember(memberId, f.temp_c, f.lead_h);
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + escapeHtml(fmtLeadTime(f.lead_h, startDate)) + '</td>' +
        '<td>' + skyEmoji(f.cloud_cover, false, null) + '</td>' +
        '<td>' + nullCell(f.temp_c, v => fmtTemp(v, isUS)) + '</td>' +
        '<td>' + (rh !== null ? rh + '%' : '<span class="null-cell">—</span>') + '</td>' +
        '<td>' + (f.precip_prob !== null ? nullCell(f.precip_prob, fmtPrecip) + ' ' + escapeHtml(precipLabel(pType)) : '<span class="null-cell">—</span>') + '</td>' +
        '<td>' + nullCell(f.vibes, v => v.toFixed(1)) + '</td>';
      tbl.appendChild(tr);
    }
    wrap.appendChild(tbl);
  }

  if (dailyLeads.length) {
    const days = startDate ? groupIntoDays(dailyLeads, startDate) : dailyLeads.map(f => ({
      day: '+' + f.lead_h + 'h',
      hi_c: f.temp_c !== null ? f.temp_c + HALF_RANGE_C : null,
      lo_c: f.temp_c !== null ? f.temp_c - HALF_RANGE_C : null,
      precip_prob: f.precip_prob,
      cloud_cover: f.cloud_cover,
      vibes: f.vibes,
    }));

    const lbl = document.createElement('p');
    lbl.className = 'forecast-section-label';
    lbl.style.marginTop = nowcasts.length ? '0.75em' : '0';
    lbl.textContent = '7-day';
    wrap.appendChild(lbl);

    const tbl = document.createElement('table');
    tbl.className = 'forecast-table';
    tbl.innerHTML = '<tr><th>Day</th><th></th><th>Lo</th><th>Hi</th><th>Precip</th><th>Vibes</th></tr>';
    for (const d of days) {
      const emoji = skyEmoji(d.cloud_cover, false, d.precip_prob > 0.5 ? 1 : 0);
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + escapeHtml(d.day) + '</td>' +
        '<td>' + emoji + '</td>' +
        '<td>' + nullCell(d.lo_c, v => fmtTemp(v, isUS)) + '</td>' +
        '<td>' + nullCell(d.hi_c, v => fmtTemp(v, isUS)) + '</td>' +
        '<td>' + (d.precip_prob !== null ? nullCell(d.precip_prob, fmtPrecip) + ' ' + escapeHtml(precipLabel(precipTypeForMember(memberId, d.avg_temp_c, d.rep_lead_h))) : '<span class="null-cell">—</span>') + '</td>' +
        '<td>' + nullCell(d.vibes, v => v.toFixed(1)) + '</td>';
      tbl.appendChild(tr);
    }
    wrap.appendChild(tbl);
  }

  return wrap;
}

function showEnsembleResults(ensemble, isUS, startDate) {
  const bodyEl = el('ensemble-body');
  bodyEl.innerHTML = '';

  // nowcast cards (leads 6, 12)
  const nowcasts = ensemble.filter(f => NOWCAST_LEADS.includes(f.lead_h));
  if (nowcasts.length && startDate) {
    const ncSection = document.createElement('div');
    ncSection.style.marginTop = '1.25em';
    const ncLabel = document.createElement('p');
    ncLabel.className = 'forecast-section-label';
    ncLabel.textContent = 'Next 12 hours';
    ncSection.appendChild(ncLabel);
    const cardsRow = document.createElement('div');
    cardsRow.className = 'nowcast-cards';
    for (const f of nowcasts) {
      const card = document.createElement('div');
      card.className = 'nowcast-card';
      const emoji = skyEmoji(f.cloud_cover, false, null);
      const ncRh = f.temp_c !== null && f.dewpoint_c !== null ? dewToRH(f.temp_c, f.dewpoint_c) : null;
      const ncPType = precipTypeForMember(null, f.temp_c, f.lead_h);
      card.innerHTML =
        '<p class="nc-time">' + escapeHtml(fmtLeadTimeShort(f.lead_h, startDate)) + '</p>' +
        '<p class="nc-emoji">' + emoji + '</p>' +
        '<p class="nc-temp">' + (f.temp_c !== null ? fmtTempHtml(f.temp_c, isUS) : '—') + '</p>' +
        '<p class="nc-precip">' + (ncRh !== null ? ncRh + '% humidity' : '') + (ncRh !== null && f.precip_prob !== null ? '  ·  ' : '') + (f.precip_prob !== null ? fmtPrecipHtml(f.precip_prob) + ' ' + escapeHtml(precipLabel(ncPType)) : '') + '</p>';
      cardsRow.appendChild(card);
    }
    ncSection.appendChild(cardsRow);
    bodyEl.appendChild(ncSection);
  }

  // 7-day daily rows
  const dailyForecasts = ensemble.filter(f => !NOWCAST_LEADS.includes(f.lead_h));
  if (dailyForecasts.length) {
    const days = groupIntoDays(dailyForecasts, startDate);
    const daySection = document.createElement('div');
    daySection.style.marginTop = '1.25em';
    const dayLabel = document.createElement('p');
    dayLabel.className = 'forecast-section-label';
    dayLabel.textContent = '7-Day Forecast';
    daySection.appendChild(dayLabel);
    const disclaimer = document.createElement('p');
    disclaimer.className = 'ensemble-disclaimer';
    disclaimer.textContent = '*models do not actually agree on anything';
    daySection.appendChild(disclaimer);
    const dailyEl = document.createElement('div');
    dailyEl.className = 'daily-forecast';
    for (const d of days) {
      const emoji = skyEmoji(d.cloud_cover, false, d.precip_prob > 0.5 ? 1 : 0);
      const rh = d.avg_temp_c !== null && d.avg_dewpoint_c !== null ? dewToRH(d.avg_temp_c, d.avg_dewpoint_c) : null;
      const row = document.createElement('div');
      row.className = 'daily-row';
      row.innerHTML =
        '<span class="dr-day">' + escapeHtml(d.day) + '</span>' +
        '<span class="dr-emoji">' + emoji + '</span>' +
        '<span class="dr-range">' +
          (d.lo_c !== null ? fmtTempHtml(d.lo_c, isUS) : '—') +
          ' / ' +
          (d.hi_c !== null ? fmtTempHtml(d.hi_c, isUS) : '—') +
          (d.avg_spread_c !== null && d.avg_spread_c !== undefined
            ? '<span class="dr-spread"> ±' + (isUS ? Math.round(d.avg_spread_c * 9 / 5) : Math.round(d.avg_spread_c)) + '°</span>'
            : '') +
        '</span>' +
        (rh !== null ? '<span class="dr-humidity">' + rh + '% humidity</span>' : '') +
        (rh !== null && d.precip_prob !== null ? '<span class="dr-sep">·</span>' : '') +
        '<span class="dr-precip">' + (d.precip_prob !== null ? fmtPrecipHtml(d.precip_prob) + ' ' + escapeHtml(precipLabel(precipTypeForMember(null, d.avg_temp_c, d.rep_lead_h))) : '—') + '</span>';
      dailyEl.appendChild(row);
    }
    daySection.appendChild(dailyEl);
    bodyEl.appendChild(daySection);
  }
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

  // compute all members except vibes (4) and peer-review (17)
  const computeFns = {
    2: () => member2BlindDrunkard(fd),
    3: () => member3Chaos(fd),
    5: () => member5Contrarian(fd),
    6: () => member6HypeTrain(fd),
    7: () => member7MercuryRetrograde(fd),
    8: () => member8Weatherperson(fd),
    9: () => member9CrowdSourced(fd),
    10: () => member10GroundhogDay(fd),
    11: () => member11CG(fd),
    12: () => member12ColdLikMN(fd),
    13: () => member13TooEarly(fd),
    14: () => member14Monday(fd),
    18: () => member18DewDenier(fd),
    19: () => member19BreakingNews(fd),
    20: () => member20EngagementBait(fd),
    21: () => member21BothSides(fd),
    22: () => member22SponsoredContent(),
    23: () => member23Influencer(fd),
    24: () => member24Panic(fd),
    25: () => member25Nostalgia(fd),
    26: () => member26DefinitelyNotSponsored(fd),
    27: () => member27RecordBreaker(fd),
    28: () => member28ButItsADryHeat(fd),
  };

  const baseMembers = {};
  for (const [id, fn] of Object.entries(computeFns)) {
    const mid = parseInt(id);
    const result = fn();
    if (!PRECIP_QUANTIZE_EXEMPT.has(mid)) {
      for (const f of result.forecasts) {
        if (f.precip_prob !== null) f.precip_prob = roundPrecip(f.precip_prob);
      }
    }
    baseMembers[mid] = result;
  }

  // vibes computed after others (uses their vibes scores)
  const vibes = member4Vibes(fd, Object.values(baseMembers));
  if (!PRECIP_QUANTIZE_EXEMPT.has(4)) {
    for (const f of vibes.forecasts) {
      if (f.precip_prob !== null) f.precip_prob = roundPrecip(f.precip_prob);
    }
  }
  const nonPR = Object.assign({}, baseMembers, { 4: vibes });

  const pr = member17PeerReview(Object.values(nonPR));
  const all = Object.assign({}, nonPR, { 17: pr });

  const sponsored = all[22];
  const vpnLine = sponsored.tagline.includes('Brought to you by ')
    ? sponsored.tagline.split('Brought to you by ')[1].replace('.', '')
    : null;

  logStatus('weights', '✓ weights assigned (sponsored-content: ' + weights[22].toFixed(2) + '×, peer-review: ' + weights[17].toFixed(2) + '×)', 'done');

  const topEntry = Object.entries(weights).reduce((a, b) => weights[a[0]] > b[1] ? a : b);
  const topMember = MEMBER_DEFS.find(m => m.id === parseInt(topEntry[0]));

  const dowName = DAY_NAMES[fd.day_of_week];
  const dowNote = fd.day_of_week === 1
    ? '⚠ it\'s Monday — monday-bias member is activated'
    : fd.day_of_week === 5
    ? '✓ it\'s Friday — weekend adjustment applied'
    : '✓ ' + dowName + ' — no special bias';

  // self-aware log entries
  setTimeout(() => {
    logStatus('dominant', '> identifying dominant member...', 'pending');
    setTimeout(() => {
      logStatus('dominant', '✓ highest weighted: ' + (topMember ? topMember.name : 'unknown') + ' (' + topEntry[1].toFixed(2) + '×)', 'done');
    }, 280);
  }, 80);

  setTimeout(() => {
    logStatus('dow', '> checking day of week...', 'pending');
    setTimeout(() => {
      logStatus('dow', dowNote, 'done');
    }, 240);
  }, 450);

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

  const afterVpn = vpnLine ? 1100 : 650;

  setTimeout(() => {
    logStatus('members', '> running 25-member ensemble...', 'pending');
    setTimeout(() => {
      logStatus('members', '✓ all 25 members computed (vibes and peer-review assigned last)', 'done');
    }, 320);
  }, afterVpn);

  const meanVibes = vibes._meanVibes;
  setTimeout(() => {
    logStatus('vibes', '> calibrating vibes score...', 'pending');
    setTimeout(() => {
      const vibesVerdict = meanVibes === null ? 'indeterminate'
        : meanVibes >= 7 ? 'immaculate' : meanVibes >= 5 ? 'acceptable' : meanVibes >= 3 ? 'rough' : 'deeply off';
      logStatus('vibes', '✓ aggregate vibes: ' + (meanVibes !== null ? meanVibes.toFixed(1) + '/10' : 'N/A') + ' — ' + vibesVerdict, 'done');
    }, 260);
  }, afterVpn + 400);

  const prNullCount = pr.forecasts.reduce((n, f) =>
    n + [f.temp_c, f.dewpoint_c, f.pressure_hpa, f.precip_prob, f.cloud_cover].filter(v => v === null).length, 0);

  const memberTemps = Object.values(all).flatMap(m =>
    m.forecasts.filter(f => f.lead_h === 24).map(f => f.temp_c).filter(v => v !== null)
  );
  const spreadHi = memberTemps.length ? (fd.isUS ? Math.round(toF(Math.max(...memberTemps))) : Math.round(Math.max(...memberTemps))) : null;
  const spreadLo = memberTemps.length ? (fd.isUS ? Math.round(toF(Math.min(...memberTemps))) : Math.round(Math.min(...memberTemps))) : null;
  const spreadUnit = fd.isUS ? '°F' : '°C';

  setTimeout(() => {
    logStatus('ensemble', '> computing ensemble mean and spread...', 'pending');
    setTimeout(() => {
      logStatus('ensemble', '✓ ensemble ready — uncertainty quantified', 'done');
    }, 280);
  }, afterVpn + 550);

  setTimeout(() => {
    logStatus('spread', '> measuring member disagreement...', 'pending');
    setTimeout(() => {
      logStatus('spread', spreadHi !== null
        ? '✓ 24h member range: ' + spreadLo + '–' + spreadHi + spreadUnit + ' (' + (spreadHi - spreadLo) + spreadUnit + ' spread)'
        : '✓ spread computed', 'done');
    }, 260);
  }, afterVpn + 750);

  setTimeout(() => {
    logStatus('peer-review', '> awaiting peer review...', 'pending');
    setTimeout(() => {
      logStatus('peer-review', '✓ ' + prNullCount + ' result' + (prNullCount !== 1 ? 's' : '') + ' pending further funding', 'done');
    }, 310);
  }, afterVpn + 1050);

  // reveal everything after all log entries finish
  setTimeout(() => {
    const logArchive = el('log-archive');
    const logSrc = el('status-log');
    if (logArchive && logSrc) logArchive.innerHTML = logSrc.innerHTML;

    el('results-section').style.display = 'block';
    showCurrentConditions(fd.current, fd.locationLabel, fd.isUS, fd);
    if (fd.is_retrograde) el('retrograde-badge').style.display = 'inline-block';

    createMemberCards(weights);
    for (const m of MEMBER_DEFS) {
      resolveMemberCard(m.id, all[m.id], fd.isUS, fd.date, fd);
    }

    const ensemble = computeEnsemble(Object.values(all), weights);
    showEnsembleResults(ensemble, fd.isUS, fd.date);

    stopLoadingAnimation();
    el('loading-section').style.display = 'none';
  }, afterVpn + 1450);
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

  const logDisc = el('log-disclosure');
  if (logDisc) {
    logDisc.querySelector('summary').addEventListener('click', () => {
      const y = window.scrollY;
      requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'instant' }));
    });
  }
}

document.addEventListener('DOMContentLoaded', init);

})();
