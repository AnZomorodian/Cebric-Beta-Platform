import { SeasonData, DriverStanding, ConstructorStanding, Race, RaceResult } from '../types';
import { getSeasonMockData, getConstructorId } from '../data/mockData';

const BASE_URL = 'https://api.jolpi.ca/ergast/f1';

// We list years from 2026 down to 1950 (or similar) to make the horizontal scroll immediate and zero-latency!
export const SEASONS_LIST = Array.from({ length: 2026 - 1950 + 1 }, (_, i) => String(2026 - i));

// Defensive helper to parse standard JSON response from Jolpi Ergast
async function safeFetch(url: string) {
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
    console.error(`Fetch failed for URL: ${url}`, error);
    return null;
  }
}

export async function fetchSeasonData(season: string): Promise<SeasonData> {
  const mockData = getSeasonMockData(season);
  
  // For the future season 2026 (or if we want instant mockup results), default to mock data first.
  if (season === '2026') {
    return mockData!;
  }

  try {
    const [standingsRes, constructorRes, racesRes] = await Promise.all([
      safeFetch(`${BASE_URL}/${season}/driverstandings.json`),
      safeFetch(`${BASE_URL}/${season}/constructorstandings.json`),
      safeFetch(`${BASE_URL}/${season}.json`)
    ]);

    let driverStandings: DriverStanding[] = [];
    let constructorStandings: ConstructorStanding[] = [];
    let races: Race[] = [];

    // Parse Driver Standings
    if (standingsRes?.MRData?.StandingsTable?.StandingsList?.[0]?.DriverStandings) {
      driverStandings = standingsRes.MRData.StandingsTable.StandingsList[0].DriverStandings;
    } else if (standingsRes?.MRData?.StandingsTable?.StandingsList?.[0]?.driverStandings) {
      driverStandings = standingsRes.MRData.StandingsTable.StandingsList[0].driverStandings;
    }

    // Parse Constructor Standings
    if (constructorRes?.MRData?.StandingsTable?.StandingsList?.[0]?.ConstructorStandings) {
      constructorStandings = constructorRes.MRData.StandingsTable.StandingsList[0].ConstructorStandings;
    } else if (constructorRes?.MRData?.StandingsTable?.StandingsList?.[0]?.constructorStandings) {
      constructorStandings = constructorRes.MRData.StandingsTable.StandingsList[0].constructorStandings;
    }

    // Parse Race schedule
    if (racesRes?.MRData?.RaceTable?.Races) {
      races = racesRes.MRData.RaceTable.Races;
    } else if (racesRes?.MRData?.raceTable?.races) {
      races = racesRes.MRData.raceTable.races;
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

    // If API returned nothing or partial (e.g. current season might have missing standings on this proxy)
    // merge or fallback to mock data if it exists for recent years 2024/2025.
    if (driverStandings.length === 0 && mockData) {
      return mockData;
    }

    // If we have races but no results yet (e.g. offseason or season starting), let's construct placeholders
    return {
      season,
      driverStandings: driverStandings.map(item => ({
        ...item,
        // Make sure Constructor IDs are populated correctly
        Constructors: item.Constructors?.map(c => ({
          ...c,
          constructorId: c.constructorId || getConstructorId(c.name)
        })) || []
      })),
      constructorStandings: constructorStandings.map(item => ({
        ...item,
        Constructor: {
          ...item.Constructor,
          constructorId: item.Constructor?.constructorId || getConstructorId(item.Constructor?.name)
        }
      })),
      races,
      nextRace: nextRace || upcomingRaces[0] || races[races.length - 1],
      lastRace: lastRace || completedRaces[completedRaces.length - 1] || races[0],
      lastResults: lastResults.length > 0 ? lastResults : mockData?.lastResults
    };

  } catch (error) {
    console.error(`fetchSeasonData Error for season ${season}: falling back to local dataset.`, error);
    // Ultimate fallback to mock data
    return mockData || {
      season,
      driverStandings: [],
      constructorStandings: [],
      races: []
    };
  }
}

// Fetch individual driver races if requested, or look up their details from records
export async function fetchDriverRecords(driverId: string, season: string) {
  const url = `${BASE_URL}/drivers/${driverId}/results.json?limit=100`;
  const res = await safeFetch(url);
  if (res?.MRData?.RaceTable?.Races) {
    return res.MRData.RaceTable.Races;
  }
  return [];
}
