



const API_BASE = "https://countriesnow.space/api/v0.1";
const CACHE_PREFIX = "orbitz_hotel_location_";
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

// Read cached location data
const readCache = (key) => {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key);

    if (!cached) return null;

    const parsed = JSON.parse(cached);

    if (Date.now() - parsed.savedAt > CACHE_DURATION) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
};

// Save location data locally
const writeCache = (key, data) => {
  try {
    localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({
        savedAt: Date.now(),
        data,
      })
    );
  } catch (error) {
    console.warn("Hotel location cache unavailable:", error);
  }
};

// Common API request handler
const requestLocationData = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Location API request failed: ${response.status}`);
  }

  const result = await response.json();

  if (result.error) {
    throw new Error(result.msg || "Location data unavailable");
  }

  return result.data;
};

// Fetch countries
export const getHotelCountries = async () => {
  const cacheKey = "countries";
  const cached = readCache(cacheKey);

  if (cached) return cached;

  const data = await requestLocationData("/countries/iso");

  const countries = data
    .map((item) => ({
      name: item.name,
      iso2: item.Iso2 || item.iso2 || "",
      iso3: item.Iso3 || item.iso3 || "",
    }))
    .filter((item) => item.name)
    .sort((a, b) => a.name.localeCompare(b.name));

  writeCache(cacheKey, countries);

  return countries;
};

// Fetch states / provinces for a country
export const getHotelStates = async (country) => {
  if (!country) return [];

  const cacheKey = `states_${country.toLowerCase()}`;
  const cached = readCache(cacheKey);

  if (cached) return cached;

  const data = await requestLocationData("/countries/states", {
    method: "POST",
    body: JSON.stringify({ country }),
  });

  const states = (data?.states || [])
    .map((item) =>
      typeof item === "string" ? item : item.name
    )
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  writeCache(cacheKey, states);

  return states;
};

// Fetch cities for a selected country and state
export const getHotelCities = async (country, state) => {
  if (!country || !state) return [];

  const cacheKey =
    `cities_${country.toLowerCase()}_${state.toLowerCase()}`;

  const cached = readCache(cacheKey);

  if (cached) return cached;

  const data = await requestLocationData("/countries/state/cities", {
    method: "POST",
    body: JSON.stringify({ country, state }),
  });

  const cities = (Array.isArray(data) ? data : data?.cities || [])
    .map((item) =>
      typeof item === "string" ? item : item.name
    )
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  writeCache(cacheKey, cities);

  return cities;
};
