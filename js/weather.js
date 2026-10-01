/**
 * Weather Module
 * Fetches real-time weather from Open-Meteo API with offline fallback,
 * Persian localization, custom cities, and witty weather remarks.
 */

const Weather = (() => {
  const DEFAULT_CITIES = [
    { name: 'تهران', nameEn: 'Tehran', lat: 35.6892, lon: 51.3890 },
    { name: 'مشهد', nameEn: 'Mashhad', lat: 36.2972, lon: 59.6067 },
    { name: 'اصفهان', nameEn: 'Isfahan', lat: 32.6546, lon: 51.6680 },
    { name: 'شیراز', nameEn: 'Shiraz', lat: 29.5918, lon: 52.5837 },
    { name: 'تبریز', nameEn: 'Tabriz', lat: 38.0800, lon: 46.2919 },
    { name: 'رشت', nameEn: 'Rasht', lat: 37.2808, lon: 49.5832 },
    { name: 'اهواز', nameEn: 'Ahvaz', lat: 31.3183, lon: 48.6706 },
    { name: 'کرج', nameEn: 'Karaj', lat: 35.8327, lon: 50.9915 },
    { name: 'کرمانشاه', nameEn: 'Kermanshah', lat: 34.3142, lon: 47.0650 },
    { name: 'قم', nameEn: 'Qom', lat: 34.6399, lon: 50.8759 },
    { name: 'یزد', nameEn: 'Yazd', lat: 31.8974, lon: 54.3569 }
  ];

  // WMO Weather code interpretations
  const WMO_MAP = {
    0: { desc: 'آسمان صاف', icon: 'sunny', type: 'clear' },
    1: { desc: 'غالباً صاف', icon: 'partly-cloudy', type: 'clear' },
    2: { desc: 'قسمتی ابری', icon: 'partly-cloudy', type: 'cloudy' },
    3: { desc: 'ابری و گرفته', icon: 'cloudy', type: 'cloudy' },
    45: { desc: 'مه‌آلود', icon: 'fog', type: 'fog' },
    48: { desc: 'مه یخ‌زده', icon: 'fog', type: 'fog' },
    51: { desc: 'نم‌نم باران سبک', icon: 'rainy', type: 'rain' },
    53: { desc: 'نم‌نم باران', icon: 'rainy', type: 'rain' },
    55: { desc: 'نم‌نم باران شدید', icon: 'rainy', type: 'rain' },
    61: { desc: 'باران ملایم', icon: 'rainy', type: 'rain' },
    63: { desc: 'بارش باران', icon: 'rainy', type: 'rain' },
    65: { desc: 'باران سیل‌آسا', icon: 'heavy-rain', type: 'rain' },
    71: { desc: 'بارش سبک برف', icon: 'snowy', type: 'snow' },
    73: { desc: 'بارش برف', icon: 'snowy', type: 'snow' },
    75: { desc: 'بارش سنگین برف', icon: 'snowy', type: 'snow' },
    77: { desc: 'دانه‌های برف', icon: 'snowy', type: 'snow' },
    80: { desc: 'رگبار پراکنده', icon: 'rainy', type: 'rain' },
    81: { desc: 'رگبار باران', icon: 'heavy-rain', type: 'rain' },
    82: { desc: 'رگبار شدید', icon: 'heavy-rain', type: 'rain' },
    85: { desc: 'رگبار سبک برف', icon: 'snowy', type: 'snow' },
    86: { desc: 'رگبار سنگین برف', icon: 'snowy', type: 'snow' },
    95: { desc: 'رعد و برق', icon: 'thunder', type: 'thunder' },
    96: { desc: 'رعد و برق با تگرگ', icon: 'thunder', type: 'thunder' },
    99: { desc: 'توفان شدید تگرگ', icon: 'thunder', type: 'thunder' }
  };

  /**
   * Generates humorous, relatable Iranian comments based on temp and condition
   */
  function getWeatherComment(temp, weatherType) {
    if (weatherType === 'rain') {
      return 'هوای دونفره و بارونی 🌧️☕';
    }
    if (weatherType === 'snow') {
      return 'برف خوشگل، آدم برفی یادت نره ⛄';
    }
    if (weatherType === 'thunder') {
      return 'رعد و برق و بارون شدید ⚡⛈️';
    }

    if (temp >= 36) {
      return 'کولرم جواب نیست :(';
    } else if (temp >= 30) {
      return 'گرم و داغ، خاکشیر خنک بزن 🍋';
    } else if (temp >= 22) {
      return 'هوا بهاری و بهشتیه 🌱✨';
    } else if (temp >= 16) {
      return 'هوای پاییزی خنک و دلپذیر 🍂';
    } else if (temp >= 9) {
      return 'هوا سرده، چایی قندپهلو بچسبه 🫖';
    } else if (temp >= 0) {
      return 'سوز سرما، کاپشن گرم تنت کن 🧣';
    } else {
      return 'یخبندان کامل! قندیل بستیم 🥶';
    }
  }

  /**
   * Generates crisp animated SVGs for weather conditions
   */
  function getWeatherSvg(iconType) {
    switch (iconType) {
      case 'sunny':
        return `
          <svg class="weather-svg sunny-anim" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="14" fill="url(#sun-gradient)" filter="drop-shadow(0 0 8px rgba(251,191,36,0.6))"/>
            <g stroke="#fbbf24" stroke-width="3" stroke-linecap="round" class="sun-rays">
              <line x1="32" y1="6" x2="32" y2="12" />
              <line x1="32" y1="52" x2="32" y2="58" />
              <line x1="6" y1="32" x2="12" y2="32" />
              <line x1="52" y1="32" x2="58" y2="32" />
              <line x1="13.6" y1="13.6" x2="17.8" y2="17.8" />
              <line x1="46.2" y1="46.2" x2="50.4" y2="50.4" />
              <line x1="13.6" y1="50.4" x2="17.8" y2="46.2" />
              <line x1="46.2" y1="17.8" x2="50.4" y2="13.6" />
            </g>
            <defs>
              <linearGradient id="sun-gradient" x1="18" y1="18" x2="46" y2="46" gradientUnits="userSpaceOnUse">
                <stop stop-color="#fde047" />
                <stop offset="1" stop-color="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>`;

      case 'partly-cloudy':
        return `
          <svg class="weather-svg partly-cloudy-anim" viewBox="0 0 64 64" fill="none">
            <circle cx="25" cy="25" r="11" fill="url(#sun-gradient-pc)" />
            <path d="M22 46h24a10 10 0 0 0 0-20 12 12 0 0 0-23.4-3.4A9 9 0 0 0 22 46z" fill="url(#cloud-gradient-pc)" opacity="0.95" />
            <defs>
              <linearGradient id="sun-gradient-pc" x1="14" y1="14" x2="36" y2="36">
                <stop stop-color="#fde047" />
                <stop offset="1" stop-color="#f59e0b" />
              </linearGradient>
              <linearGradient id="cloud-gradient-pc" x1="12" y1="20" x2="48" y2="46">
                <stop stop-color="#f8fafc" />
                <stop offset="1" stop-color="#cbd5e1" />
              </linearGradient>
            </defs>
          </svg>`;

      case 'cloudy':
        return `
          <svg class="weather-svg cloudy-anim" viewBox="0 0 64 64" fill="none">
            <path d="M18 48h28a11 11 0 0 0 0-22 13 13 0 0 0-25.2-3.8A10 10 0 0 0 18 48z" fill="url(#cloud-gradient-c)" />
            <defs>
              <linearGradient id="cloud-gradient-c" x1="10" y1="20" x2="52" y2="48">
                <stop stop-color="#e2e8f0" />
                <stop offset="1" stop-color="#94a3b8" />
              </linearGradient>
            </defs>
          </svg>`;

      case 'rainy':
      case 'heavy-rain':
        return `
          <svg class="weather-svg rainy-anim" viewBox="0 0 64 64" fill="none">
            <path d="M18 40h28a10 10 0 0 0 0-20 12 12 0 0 0-23.4-3.4A9 9 0 0 0 18 40z" fill="url(#cloud-rain)" />
            <g stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" class="rain-drops">
              <line x1="22" y1="46" x2="19" y2="54" />
              <line x1="32" y1="46" x2="29" y2="54" />
              <line x1="42" y1="46" x2="39" y2="54" />
            </g>
            <defs>
              <linearGradient id="cloud-rain" x1="10" y1="16" x2="48" y2="40">
                <stop stop-color="#cbd5e1" />
                <stop offset="1" stop-color="#64748b" />
              </linearGradient>
            </defs>
          </svg>`;

      case 'snowy':
        return `
          <svg class="weather-svg snowy-anim" viewBox="0 0 64 64" fill="none">
            <path d="M18 40h28a10 10 0 0 0 0-20 12 12 0 0 0-23.4-3.4A9 9 0 0 0 18 40z" fill="#cbd5e1" />
            <circle cx="23" cy="49" r="2" fill="#e0f2fe" />
            <circle cx="33" cy="53" r="2" fill="#e0f2fe" />
            <circle cx="43" cy="48" r="2" fill="#e0f2fe" />
          </svg>`;

      case 'thunder':
        return `
          <svg class="weather-svg thunder-anim" viewBox="0 0 64 64" fill="none">
            <path d="M18 38h28a10 10 0 0 0 0-20 12 12 0 0 0-23.4-3.4A9 9 0 0 0 18 38z" fill="#475569" />
            <polygon points="34,38 28,48 33,48 29,58 39,46 34,46" fill="#facc15" filter="drop-shadow(0 0 6px rgba(250,204,21,0.8))"/>
          </svg>`;

      default:
        return getWeatherSvg('partly-cloudy');
    }
  }

  /**
   * Approximate Iranian prayer times calculation based on city coordinates
   */
  function getPrayerTimes(lat, lon, date = new Date()) {
    // Standard solar calculation approximation for Iran
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const b = (2 * Math.PI * (dayOfYear - 81)) / 365;
    const eqtime = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
    const declination = 23.45 * Math.sin((2 * Math.PI * (284 + dayOfYear)) / 365) * (Math.PI / 180);

    // Solar noon (Dhuhr) in local time
    const tzOffset = -date.getTimezoneOffset() / 60; // Iran usually +3.5
    const noonMinutes = 720 - (4 * lon) - eqtime + (tzOffset * 60);

    const latRad = lat * (Math.PI / 180);
    // Fajr (dawn) angle = -17.7 deg (standard in Iran)
    const fajrCos = (Math.sin(-17.7 * Math.PI / 180) - Math.sin(latRad) * Math.sin(declination)) / (Math.cos(latRad) * Math.cos(declination));
    const sunriseCos = (Math.sin(-0.833 * Math.PI / 180) - Math.sin(latRad) * Math.sin(declination)) / (Math.cos(latRad) * Math.cos(declination));
    // Maghrib angle = -4.5 deg (standard Shia/Iran)
    const maghribCos = (Math.sin(-4.5 * Math.PI / 180) - Math.sin(latRad) * Math.sin(declination)) / (Math.cos(latRad) * Math.cos(declination));

    const clamp = (val) => Math.max(-1, Math.min(1, val));
    const fajrAngle = Math.acos(clamp(fajrCos)) * (180 / Math.PI) * 4;
    const sunriseAngle = Math.acos(clamp(sunriseCos)) * (180 / Math.PI) * 4;
    const maghribAngle = Math.acos(clamp(maghribCos)) * (180 / Math.PI) * 4;

    const formatMins = (mins) => {
      mins = (mins + 1440) % 1440;
      const h = Math.floor(mins / 60);
      const m = Math.floor(mins % 60);
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    return {
      fajr: formatMins(noonMinutes - fajrAngle),
      sunrise: formatMins(noonMinutes - sunriseAngle),
      dhuhr: formatMins(noonMinutes),
      sunset: formatMins(noonMinutes + sunriseAngle),
      maghrib: formatMins(noonMinutes + maghribAngle)
    };
  }

  /**
   * Synchronously retrieves cached weather data if available (regardless of TTL expiration)
   * to provide instantaneous 0ms display while fresh data loads in the background.
   */
  function getCachedWeather(city) {
    const cacheKey = `weather_cache_${city.nameEn || city.name}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.data) {
          return parsed.data;
        }
      }
    } catch {
      // Storage error fallback
    }
    return null;
  }

  /**
   * Fetches weather data with cache
   */
  async function fetchWeather(city) {
    const cacheKey = `weather_cache_${city.nameEn || city.name}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        // 30 min cache TTL
        if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
          return parsed.data;
        }
      }
    } catch {
      // Storage error fallback
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('API fetch failed');
      const data = await response.json();

      const current = data.current;
      const code = current.weather_code || 0;
      const wInfo = WMO_MAP[code] || WMO_MAP[0];
      const temp = Math.round(current.temperature_2m);
      const feelsLike = Math.round(current.apparent_temperature);
      const humidity = current.relative_humidity_2m;
      const windSpeed = Math.round(current.wind_speed_10m);

      const daily = data.daily || {};
      const maxTemp = (daily.temperature_2m_max && daily.temperature_2m_max[0] !== undefined)
        ? Math.round(daily.temperature_2m_max[0])
        : temp + 3;
      const minTemp = (daily.temperature_2m_min && daily.temperature_2m_min[0] !== undefined)
        ? Math.round(daily.temperature_2m_min[0])
        : temp - 4;

      // 3-day forecast
      const forecast = [];
      if (daily.time) {
        for (let i = 1; i <= 3 && i < daily.time.length; i++) {
          const fCode = daily.weather_code ? daily.weather_code[i] : 0;
          forecast.push({
            date: daily.time[i],
            max: Math.round(daily.temperature_2m_max[i]),
            min: Math.round(daily.temperature_2m_min[i]),
            info: WMO_MAP[fCode] || WMO_MAP[0]
          });
        }
      }

      const weatherResult = {
        city: city.name,
        temp,
        feelsLike,
        humidity,
        windSpeed,
        maxTemp,
        minTemp,
        code,
        desc: wInfo.desc,
        icon: wInfo.icon,
        type: wInfo.type,
        comment: getWeatherComment(temp, wInfo.type),
        forecast,
        prayerTimes: getPrayerTimes(city.lat, city.lon),
        updatedAt: new Date().toISOString()
      };

      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          timestamp: Date.now(),
          data: weatherResult
        }));
      } catch {
        // storage quota ignored
      }

      return weatherResult;
    } catch {
      // Fallback offline mock data tailored to season
      const now = new Date();
      const m = now.getMonth(); // 0-11
      let estTemp = 24;
      if (m >= 5 && m <= 7) estTemp = 33; // Summer
      else if (m >= 8 && m <= 10) estTemp = 22; // Autumn
      else if (m >= 11 || m <= 1) estTemp = 8; // Winter
      else estTemp = 19; // Spring

      return {
        city: city.name,
        temp: estTemp,
        feelsLike: estTemp - 1,
        humidity: 32,
        windSpeed: 10,
        maxTemp: estTemp + 4,
        minTemp: estTemp - 4,
        code: 1,
        desc: 'غالباً صاف و آفتابی',
        icon: 'sunny',
        type: 'clear',
        comment: getWeatherComment(estTemp, 'clear'),
        forecast: [
          { date: 'فردا', max: estTemp + 2, min: estTemp - 3, info: WMO_MAP[1] },
          { date: 'پس‌فردا', max: estTemp + 1, min: estTemp - 4, info: WMO_MAP[2] }
        ],
        prayerTimes: getPrayerTimes(city.lat, city.lon),
        updatedAt: new Date().toISOString()
      };
    }
  }

  return {
    DEFAULT_CITIES,
    fetchWeather,
    getCachedWeather,
    getWeatherSvg,
    getWeatherComment,
    getPrayerTimes
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Weather;
}
