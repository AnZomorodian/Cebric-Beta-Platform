import { SeasonData, DriverStanding, ConstructorStanding, Race, RaceResult } from '../types';
import { getSeasonMockData, getConstructorId } from '../data/mockData';

const BASE_URL = 'https://api.jolpi.ca/ergast/f1';

// We list years from 2026 down to 1950 (or similar) to make the horizontal scroll immediate and zero-latency!
export const SEASONS_LIST = Array.from({ length: 2026 - 1950 + 1 }, (_, i) => String(2026 - i));

// Elite In-Memory and LocalStorage Cache Layer with TTL (TimeToLive)
const CACHE_PREFIX = 'f1_explorer_cache_';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache TTL

const memoryCache: Record<string, { timestamp: number; data: any }> = {};

function getCachedData(key: string): any | null {
  // Check memory first
  const mem = memoryCache[key];
  if (mem && (Date.now() - mem.timestamp < CACHE_TTL_MS)) {
    return mem.data;
  }

  // Check LocalStorage
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (Date.now() - parsed.timestamp < CACHE_TTL_MS)) {
        // Hydrate memory cache
        memoryCache[key] = parsed;
        return parsed.data;
      } else {
        localStorage.removeItem(CACHE_PREFIX + key);
      }
    }
  } catch (err) {
    console.warn('Cache read error from localStorage', err);
  }
  return null;
}

function setCachedData(key: string, data: any): void {
  const payload = { timestamp: Date.now(), data };
  memoryCache[key] = payload;
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(payload));
  } catch (err) {
    console.warn('Cache write error to localStorage', err);
  }
}

// Auto-retry helper with exponential backoff to handle large datasets robustly
async function safeFetchWithRetry(url: string, retries = 2, delay = 350): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (attempt === retries) {
        console.error(`Fetch permanently failed for URL: ${url} (Tried ${retries + 1} times)`, error);
        return null;
      }
      const backoffDelay = delay * Math.pow(2, attempt);
      console.warn(`Fetch retry attempt ${attempt + 1}/${retries} for URL: ${url} in ${backoffDelay}ms`);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
}

// Dynamic season list fetcher from Jolpi's Ergast API with cache
export async function fetchSeasonsList(): Promise<string[]> {
  const cacheKey = 'seasons_list';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const res = await safeFetchWithRetry(`${BASE_URL}/seasons.json?limit=1000`);
    if (res?.MRData?.SeasonTable?.Seasons) {
      const apiSeasons: string[] = res.MRData.SeasonTable.Seasons.map((s: any) => s.season);
      // Ensure 2026 is top listed
      const combined = Array.from(new Set(['2026', ...apiSeasons]));
      const sorted = combined.sort((a, b) => parseInt(b) - parseInt(a));
      setCachedData(cacheKey, sorted);
      return sorted;
    }
  } catch (error) {
    console.error('Failed to fetch seasons list dynamically', error);
  }
  return SEASONS_LIST;
}

// Defensive helper pointing to safeFetchWithRetry
async function safeFetch(url: string) {
  return safeFetchWithRetry(url);
}

export async function fetchSeasonData(season: string): Promise<SeasonData> {
  const cacheKey = `season_data_${season}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const mockData = getSeasonMockData(season);
  
  try {
    const [standingsRes, constructorRes, racesRes, driversRes] = await Promise.all([
      safeFetch(`${BASE_URL}/${season}/driverstandings.json`),
      safeFetch(`${BASE_URL}/${season}/constructorstandings.json`),
      safeFetch(`${BASE_URL}/${season}.json`),
      safeFetch(`${BASE_URL}/${season}/drivers.json?limit=100`)
    ]);

    let driverStandings: DriverStanding[] = [];
    let constructorStandings: ConstructorStanding[] = [];
    let races: Race[] = [];
    let apiDrivers: any[] = [];

    // Parse Driver Standings
    const sTable = standingsRes?.MRData?.StandingsTable || standingsRes?.MRData?.standingsTable;
    const sLists = sTable?.StandingsLists || sTable?.standingsLists || sTable?.StandingsList || sTable?.standingsList;
    if (sLists?.[0]) {
      driverStandings = sLists[0].DriverStandings || sLists[0].driverStandings || [];
    }

    // Parse Constructor Standings
    const cTable = constructorRes?.MRData?.StandingsTable || constructorRes?.MRData?.standingsTable;
    const cLists = cTable?.StandingsLists || cTable?.standingsLists || cTable?.StandingsList || cTable?.standingsList;
    if (cLists?.[0]) {
      constructorStandings = cLists[0].ConstructorStandings || cLists[0].constructorstandings || cLists[0].constructorStatus || [];
    }

    // Normalize driverStandings Constructor list to avoid rendering crashes
    driverStandings = (driverStandings || []).map(d => {
      let constructors = d.Constructors || (d as any).Constructor || (d as any).constructor || [];
      if (!Array.isArray(constructors)) {
        constructors = [constructors];
      }
      if (constructors.length === 0) {
        constructors = [{ constructorId: 'independent', name: 'Independent', nationality: 'Unknown', url: '' }];
      }
      return {
        ...d,
        Constructors: constructors
      };
    });

    // Parse Race schedule
    const rTable = racesRes?.MRData?.RaceTable || racesRes?.MRData?.raceTable;
    if (rTable?.Races) {
      races = rTable.Races;
    } else if (rTable?.races) {
      races = rTable.races;
    }

    // Parse Drivers list (Roster)
    const dTable = driversRes?.MRData?.DriverTable || driversRes?.MRData?.driverTable;
    if (dTable?.Drivers) {
      apiDrivers = dTable.Drivers;
    } else if (dTable?.drivers) {
      apiDrivers = dTable.drivers;
    }

    // Determine Last Race & Results
    let lastRace: Race | undefined = undefined;
    let lastResults: RaceResult[] = [];
    let nextRace: Race | undefined = undefined;

    const now = new Date();
    
    // Find completed and upcoming races
    const completedRaces = races.filter(r => {
      const raceDate = new Date(r.date);
      return raceDate < now;
    });

    const upcomingRaces = races.filter(r => {
      const raceDate = new Date(r.date);
      return raceDate >= now;
    });

    if (completedRaces.length > 0) {
      lastRace = completedRaces[completedRaces.length - 1];
      
      // Fetch results for the last race
      const lastRaceResultsRes = await safeFetch(`${BASE_URL}/${season}/${lastRace.round}/results.json`);
      if (lastRaceResultsRes?.MRData?.RaceTable?.Races?.[0]?.Results) {
        lastResults = lastRaceResultsRes.MRData.RaceTable.Races[0].Results;
      } else if (lastRaceResultsRes?.MRData?.RaceTable?.Races?.[0]?.results) {
        lastResults = lastRaceResultsRes.MRData.RaceTable.Races[0].results;
      }
    }

    if (upcomingRaces.length > 0) {
      nextRace = upcomingRaces[0];
    }

    // If API provided no driver standings (e.g. current future season 2026), but we have the active driver roster,
    // let's build the standings list from the active roster!
    if (driverStandings.length === 0 && apiDrivers.length > 0) {
      driverStandings = apiDrivers.map((item, index) => {
        const mockDriver = mockData?.driverStandings.find(
          md => md.Driver.driverId === item.driverId || 
                (md.Driver.driverId === 'max_verstappen' && item.driverId === 'verstappen') ||
                (md.Driver.driverId === 'verstappen' && item.driverId === 'max_verstappen')
        );

        return {
          position: mockDriver?.position || String(index + 1),
          positionText: mockDriver?.positionText || String(index + 1),
          points: mockDriver?.points || '0',
          wins: mockDriver?.wins || '0',
          Driver: {
            driverId: item.driverId || mockDriver?.Driver.driverId || '',
            permanentNumber: item.permanentNumber || mockDriver?.Driver.permanentNumber || '',
            code: item.code || mockDriver?.Driver.code || '',
            url: item.url || mockDriver?.Driver.url || '',
            givenName: item.givenName || mockDriver?.Driver.givenName || '',
            familyName: item.familyName || mockDriver?.Driver.familyName || '',
            dateOfBirth: item.dateOfBirth || mockDriver?.Driver.dateOfBirth || '',
            nationality: item.nationality || mockDriver?.Driver.nationality || ''
          },
          Constructors: mockDriver?.Constructors || [
            {
              constructorId: getConstructorId(item.familyName), 
              name: getConstructorId(item.familyName).replace('_', ' ').toUpperCase(),
              nationality: 'Unknown',
              url: ''
            }
          ]
        };
      });

      // Sort drivers by points descending
      driverStandings.sort((a, b) => parseInt(b.points) - parseInt(a.points));
      // Re-index position to match points order precisely
      driverStandings.forEach((item, index) => {
        item.position = String(index + 1);
        item.positionText = String(index + 1);
      });
    }

    // Default driverStandings fallback
    if (driverStandings.length === 0 && mockData) {
      setCachedData(cacheKey, mockData);
      return mockData;
    }

    // If constructor standings from API are empty, build them from driver standings or fallback to mock
    if (constructorStandings.length === 0) {
      if (mockData?.constructorStandings && mockData.constructorStandings.length > 0) {
        constructorStandings = mockData.constructorStandings;
      } else {
        // Aggregate points from driver standings dynamically!
        const pointsMap: Record<string, { name: string; points: number; wins: number; nationality: string }> = {};
        driverStandings.forEach(d => {
          const c = d.Constructors?.[0];
          if (c) {
            if (!pointsMap[c.constructorId]) {
              pointsMap[c.constructorId] = {
                name: c.name,
                points: 0,
                wins: 0,
                nationality: c.nationality || 'Unknown'
              };
            }
            pointsMap[c.constructorId].points += parseFloat(d.points) || 0;
            pointsMap[c.constructorId].wins += parseInt(d.wins) || 0;
          }
        });

        constructorStandings = Object.entries(pointsMap).map(([id, info]) => ({
          position: '',
          positionText: '',
          points: String(info.points),
          wins: String(info.wins),
          Constructor: {
            constructorId: id,
            name: info.name,
            nationality: info.nationality,
            url: ''
          }
        }));

        constructorStandings.sort((a, b) => parseInt(b.points) - parseInt(a.points));
        constructorStandings.forEach((item, index) => {
          item.position = String(index + 1);
          item.positionText = String(index + 1);
        });
      }
    }

    // If races schedule is empty from API, use mock
    if (races.length === 0 && mockData?.races) {
      races = mockData.races;
    }

    const result: SeasonData = {
      season,
      driverStandings: driverStandings.map(item => {
        const itemCons = item.Constructors || (item as any).constructors || [];
        return {
          ...item,
          Constructors: itemCons.map((c: any) => ({
            ...c,
            constructorId: c.constructorId || getConstructorId(c.name)
          }))
        };
      }),
      constructorStandings: constructorStandings.map(item => ({
        ...item,
        Constructor: {
          ...item.Constructor,
          constructorId: item.Constructor?.constructorId || getConstructorId(item.Constructor?.name)
        }
      })),
      races,
      nextRace: nextRace || upcomingRaces[0] || races[races.length - 1] || mockData?.nextRace,
      lastRace: lastRace || completedRaces[completedRaces.length - 1] || races[0] || mockData?.lastRace,
      lastResults: lastResults.length > 0 ? lastResults : (mockData?.lastResults || [])
    };

    setCachedData(cacheKey, result);
    return result;

  } catch (error) {
    console.error(`fetchSeasonData Error for season ${season}: falling back to local dataset.`, error);
    // Ultimate fallback to mock data
    const fallback = mockData || {
      season,
      driverStandings: [],
      constructorStandings: [],
      races: []
    };
    setCachedData(cacheKey, fallback);
    return fallback;
  }
}

// Fetch individual driver races if requested, or look up their details from records with TTL cache
export async function fetchDriverRecords(driverId: string, season: string) {
  const cacheKey = `driver_records_${driverId}_${season}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const url = `${BASE_URL}/drivers/${driverId}/results.json?limit=100`;
  const res = await safeFetch(url);
  if (res?.MRData?.RaceTable?.Races) {
    const list = res.MRData.RaceTable.Races;
    setCachedData(cacheKey, list);
    return list;
  }
  return [];
}

// Fetch lap-by-lap times for a specific GP round with TTL cache
export async function fetchLapTimes(season: string, round: string): Promise<any[]> {
  const cacheKey = `lap_times_${season}_${round}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const url = `${BASE_URL}/${season}/${round}/laps.json?limit=2000`;
  const res = await safeFetch(url);
  const raceTable = res?.MRData?.RaceTable || res?.MRData?.raceTable;
  const racesList = raceTable?.Races || raceTable?.races;
  
  if (racesList?.[0]) {
    const laps = racesList[0].Laps || racesList[0].laps || [];
    setCachedData(cacheKey, laps);
    return laps;
  }
  
  return [];
}

