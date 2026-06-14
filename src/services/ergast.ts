import { SeasonData, DriverStanding, ConstructorStanding, Race, RaceResult } from '../types';
import { getSeasonMockData, getConstructorId } from '../data/mockData';

const BASE_URL = 'https://api.jolpi.ca/ergast/f1';

// We list years from 2026 down to 1950 (or similar) to make the horizontal scroll immediate and zero-latency!
export const SEASONS_LIST = Array.from({ length: 2026 - 1950 + 1 }, (_, i) => String(2026 - i));

// Dynamic season list fetcher from Jolpi's Ergast API.
export async function fetchSeasonsList(): Promise<string[]> {
  try {
    const res = await safeFetch(`${BASE_URL}/seasons.json?limit=1000`);
    if (res?.MRData?.SeasonTable?.Seasons) {
      const apiSeasons: string[] = res.MRData.SeasonTable.Seasons.map((s: any) => s.season);
      // Ensure 2026 is top listed
      const combined = Array.from(new Set(['2026', ...apiSeasons]));
      return combined.sort((a, b) => parseInt(b) - parseInt(a));
    }
  } catch (error) {
    console.error('Failed to fetch seasons list dynamically', error);
  }
  return SEASONS_LIST;
}

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
      constructorStandings = cLists[0].ConstructorStandings || cLists[0].constructorstandings || cLists[0].constructorStandings || [];
    }

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
            pointsMap[c.constructorId].points += parseInt(d.points) || 0;
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

    return {
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
