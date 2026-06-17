import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Timer, Clock, Activity, Users, ChevronDown, 
  Eye, EyeOff, BarChart2, Hash, Zap,
  Database, RefreshCw, Gauge
} from 'lucide-react';
import { SeasonData, DriverStanding, Race } from '../types';
import { fetchLapTimes } from '../services/ergast';
import { TEAM_HEX, TEAM_BG } from '../data/mockData';

const DRIVER_NUMBERS: Record<string, string> = {
  'verstappen': '1',
  'perez': '11',
  'hamilton': '44',
  'russell': '63',
  'leclerc': '16',
  'sainz': '55',
  'norris': '4',
  'piastri': '81',
  'alonso': '14',
  'stroll': '18',
  'tsunoda': '22',
  'lawson': '30',
  'albon': '23',
  'gasly': '10',
  'ocon': '31',
  'hulkenberg': '27',
  'magnussen': '20',
  'bottas': '77',
  'colapinto': '43',
  'bearman': '87',
  'sargeant': '2',
  'ricciardo': '3',
  'zhou': '24'
};

// Format standard seconds count to elegant F1 mm:ss.sss
function formatTime(sec: number): string {
  if (!sec || isNaN(sec)) return '--:--.---';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 1000);
  return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

// Convert "1:34.250" or seconds count to standard float number
function parseLapTime(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.toString().split(':');
  if (parts.length === 2) {
    const minutes = parseFloat(parts[0]);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  }
  return parseFloat(timeStr) || 0;
}

interface LapTimesTabProps {
  data: SeasonData;
  isLoading: boolean;
}

interface ParsedLapTiming {
  lap: number;
  timings: Record<string, number>; // driverId -> time in seconds
  positions: Record<string, number>; // driverId -> position
}

export default function LapTimesTab({ data, isLoading }: LapTimesTabProps) {
  const { season, driverStandings = [], races = [] } = data || {};

  // Default to round 1
  const [selectedRound, setSelectedRound] = useState<string>('1');
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [hoveredLap, setHoveredLap] = useState<number | null>(null);

  // States for fetching
  const [lapsList, setLapsList] = useState<ParsedLapTiming[]>([]);
  const [loadingLaps, setLoadingLaps] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('API feed');

  // OpenF1 Dynamic Sessions & Laps states
  const [openF1Sessions, setOpenF1Sessions] = useState<any[]>([]);
  const [openF1SelectedSession, setOpenF1SelectedSession] = useState<string>('9161'); // Default to Singapore GP 2023 session key
  const [openF1LapsStats, setOpenF1LapsStats] = useState<any[]>([]);
  const [openF1LapsList, setOpenF1LapsList] = useState<any[]>([]);
  const [openF1DriversMap, setOpenF1DriversMap] = useState<Record<number, any>>({});
  const [openF1SortField, setOpenF1SortField] = useState<'lap_number' | 'lap_duration'>('lap_duration');
  const [loadingSessions, setLoadingSessions] = useState<boolean>(false);
  const [loadingOpenF1Laps, setLoadingOpenF1Laps] = useState<boolean>(false);
  const [openF1SessionError, setOpenF1SessionError] = useState<string | null>(null);
  const [openF1LapsError, setOpenF1LapsError] = useState<string | null>(null);

  // Fetch F1 Sessions on mount
  useEffect(() => {
    let active = true;
    async function loadSessions() {
      setLoadingSessions(true);
      setOpenF1SessionError(null);
      try {
        const res = await fetch('https://api.openf1.org/v1/sessions');
        if (!res.ok) throw new Error(`HTTP Status ${res.status}`);
        const data = await res.json();
        if (active && Array.isArray(data)) {
          // Filter valid sessions and sort newest session_key first to present freshest
          const filtered = data
            .filter((s: any) => s.session_key && s.location && s.session_name)
            .sort((a, b) => b.session_key - a.session_key);
          setOpenF1Sessions(filtered);
          if (filtered.length > 0) {
            const hasSingapore = filtered.some((s: any) => s.session_key === 9161);
            setOpenF1SelectedSession(hasSingapore ? '9161' : String(filtered[0].session_key));
          }
        }
      } catch (err: any) {
        console.warn("Failed fetching sessions from OpenF1:", err);
        setOpenF1SessionError("Failed to fetch sessions. Fallback records shown.");
        setOpenF1Sessions([
          { session_key: 9161, session_name: "Race", location: "Marina Bay", country_name: "Singapore", year: 2023, session_type: "Race" },
          { session_key: 9158, session_name: "Qualifying", location: "Marina Bay", country_name: "Singapore", year: 2023, session_type: "Qualifying" },
          { session_key: 9160, session_name: "Practice 3", location: "Marina Bay", country_name: "Singapore", year: 2023, session_type: "Practice" },
          { session_key: 9149, session_name: "Race", location: "Monza", country_name: "Italy", year: 2023, session_type: "Race" },
        ]);
      } finally {
        if (active) setLoadingSessions(false);
      }
    }
    loadSessions();
    return () => { active = false; };
  }, []);

  // Fetch Laps & Drivers when selected Session changes
  useEffect(() => {
    if (!openF1SelectedSession) return;
    let active = true;

    async function loadLapsAndDrivers() {
      setLoadingOpenF1Laps(true);
      setOpenF1LapsError(null);
      try {
        // Fetch drivers of the session first for team names and colors
        const drvRes = await fetch(`https://api.openf1.org/v1/drivers?session_key=${openF1SelectedSession}`);
        let driversMap: Record<number, any> = {};
        if (drvRes.ok) {
          const driversArray = await drvRes.json();
          if (Array.isArray(driversArray)) {
            driversArray.forEach((d: any) => {
              if (d.driver_number) {
                driversMap[d.driver_number] = d;
              }
            });
          }
        }
        if (active) {
          setOpenF1DriversMap(driversMap);
        }

        // Fetch laps for matching session_key
        const lapsRes = await fetch(`https://api.openf1.org/v1/laps?session_key=${openF1SelectedSession}`);
        if (!lapsRes.ok) throw new Error(`HTTP Status ${lapsRes.status}`);
        const lapsArray = await lapsRes.json();

        if (active && Array.isArray(lapsArray)) {
          // Set raw laps, filter out anomalies
          const validLaps = lapsArray.filter((l: any) => typeof l.lap_duration === 'number' && l.lap_duration > 30 && l.lap_duration < 250);
          setOpenF1LapsList(validLaps);

          // Process lap times: group by driver_number
          const grouped: Record<number, number[]> = {};
          validLaps.forEach((lap: any) => {
            const dn = lap.driver_number;
            const dur = lap.lap_duration;
            if (dn) {
              if (!grouped[dn]) grouped[dn] = [];
              grouped[dn].push(dur);
            }
          });

          // Build statistics for each driver in session
          const stats = Object.keys(grouped).map((dnStr) => {
            const dn = parseInt(dnStr, 10);
            const times = grouped[dn];
            const best = Math.min(...times);
            const avg = times.reduce((a, b) => a + b, 0) / times.length;
            const meta = driversMap[dn] || {};

            return {
              driverNumber: dn,
              fullName: meta.full_name || `Driver #${dn}`,
              nameAcronym: meta.name_acronym || `DRV`,
              teamName: meta.team_name || "F1 Constructor",
              teamColour: meta.team_colour ? `#${meta.team_colour}` : "#7c3aed",
              lapsCount: times.length,
              bestLapTime: best,
              avgLapTime: avg
            };
          });

          // Sort by fastest bestLapTime ascending
          stats.sort((a, b) => a.bestLapTime - b.bestLapTime);
          setOpenF1LapsStats(stats);
        }
      } catch (err: any) {
        console.warn("Failed fetching laps/drivers details from OpenF1:", err);
        setOpenF1LapsError("API issue / CORS restrictions. Fallback telemetry shown.");
        
        const fallbackDrivers: Record<number, any> = {
          63: { full_name: "George Russell", name_acronym: "RUS", team_name: "Mercedes", team_colour: "27F4D2" },
          4: { full_name: "Lando Norris", name_acronym: "NOR", team_name: "McLaren", team_colour: "FF8700" },
          16: { full_name: "Charles Leclerc", name_acronym: "LEC", team_name: "Ferrari", team_colour: "EF1A2D" },
          1: { full_name: "Max Verstappen", name_acronym: "VER", team_name: "Red Bull Racing", team_colour: "3671C6" },
          44: { full_name: "Lewis Hamilton", name_acronym: "HAM", team_name: "Mercedes", team_colour: "27F4D2" },
          55: { full_name: "Carlos Sainz", name_acronym: "SAI", team_name: "Ferrari", team_colour: "EF1A2D" },
          14: { full_name: "Fernando Alonso", name_acronym: "ALO", team_name: "Aston Martin", team_colour: "229971" }
        };

        if (active) {
          setOpenF1DriversMap(fallbackDrivers);
          
          const stats = [
            { driverNumber: 63, fullName: "George Russell", nameAcronym: "RUS", teamName: "Mercedes", teamColour: "#27F4D2", lapsCount: 62, bestLapTime: 94.225, avgLapTime: 96.540 },
            { driverNumber: 4, fullName: "Lando Norris", nameAcronym: "NOR", teamName: "McLaren", teamColour: "#FF8700", lapsCount: 62, bestLapTime: 94.380, avgLapTime: 96.710 },
            { driverNumber: 16, fullName: "Charles Leclerc", nameAcronym: "LEC", teamName: "Ferrari", teamColour: "#EF1A2D", lapsCount: 62, bestLapTime: 94.510, avgLapTime: 96.905 },
            { driverNumber: 1, fullName: "Max Verstappen", nameAcronym: "VER", teamName: "Red Bull Racing", teamColour: "#3671C6", lapsCount: 62, bestLapTime: 94.880, avgLapTime: 97.120 },
            { driverNumber: 44, fullName: "Lewis Hamilton", nameAcronym: "HAM", teamName: "Mercedes", teamColour: "#27F4D2", lapsCount: 62, bestLapTime: 94.920, avgLapTime: 97.230 },
            { driverNumber: 55, fullName: "Carlos Sainz", nameAcronym: "SAI", teamName: "Ferrari", teamColour: "#EF1A2D", lapsCount: 62, bestLapTime: 95.050, avgLapTime: 97.450 },
            { driverNumber: 14, fullName: "Fernando Alonso", nameAcronym: "ALO", teamName: "Aston Martin", teamColour: "#229971", lapsCount: 61, bestLapTime: 95.420, avgLapTime: 97.900 },
          ];
          setOpenF1LapsStats(stats);

          // Generate simulated detailed individual laps for fallback mode
          const fallbackLaps: any[] = [];
          stats.forEach(s => {
            for (let l = 1; l <= 20; l++) {
              const variance = Math.sin(l * 0.5 + s.driverNumber) * 0.6 + Math.random() * 0.4;
              fallbackLaps.push({
                driver_number: s.driverNumber,
                lap_number: l,
                lap_duration: s.bestLapTime + variance,
                duration_sector_1: 29.112 + variance * 0.3,
                duration_sector_2: 38.455 + variance * 0.4,
                duration_sector_3: 26.658 + variance * 0.3,
                st_speed: 310 + Math.round(variance * 10)
              });
            }
          });
          setOpenF1LapsList(fallbackLaps);
        }
      } finally {
        if (active) setLoadingOpenF1Laps(false);
      }
    }

    loadLapsAndDrivers();
    return () => { active = false; };
  }, [openF1SelectedSession]);

  // Currently selected race matching selectedRound
  const selectedRace = useMemo(() => {
    return races.find(r => r.round === selectedRound) || races[0] || null;
  }, [races, selectedRound]);

  // Match currently checked drivers from the Roster Grid Filters to their acronym codes
  const selectedDriverCodes = useMemo(() => {
    return selectedDrivers.map(dId => {
      const ds = driverStandings.find(d => d.Driver.driverId === dId);
      return ds?.Driver?.code?.toUpperCase() || "";
    }).filter(Boolean);
  }, [selectedDrivers, driverStandings]);

  // Filter and sort the all-laps feed dynamically on active checkmarks or select dropdown sorts
  const filteredOpenF1Laps = useMemo(() => {
    return openF1LapsList.filter(l => {
      const meta = openF1DriversMap[l.driver_number];
      const acronym = meta?.name_acronym?.toUpperCase() || "";
      return selectedDriverCodes.length === 0 || selectedDriverCodes.includes(acronym);
    }).sort((a, b) => {
      if (openF1SortField === 'lap_duration') {
        return a.lap_duration - b.lap_duration;
      } else {
        return a.lap_number - b.lap_number || a.lap_duration - b.lap_duration;
      }
    });
  }, [openF1LapsList, openF1DriversMap, selectedDriverCodes, openF1SortField]);

  // Load lap times
  useEffect(() => {
    if (!selectedRound) return;

    let isMounted = true;
    async function getLaps() {
      setLoadingLaps(true);
      setErrorText(null);
      try {
        const rawLaps = await fetchLapTimes(season, selectedRound);
        if (!isMounted) return;

        let parsed: ParsedLapTiming[] = [];

        if (rawLaps && rawLaps.length > 0) {
          rawLaps.forEach((lapItem: any) => {
            const lapNumber = parseInt(lapItem.number || lapItem.Number || '0', 10);
            const timings = lapItem.Timings || lapItem.timings || [];
            
            const lapTimingsMap: Record<string, number> = {};
            const lapPositionsMap: Record<string, number> = {};

            timings.forEach((t: any) => {
              const dId = t.driverId || t.DriverId;
              if (dId) {
                lapTimingsMap[dId] = parseLapTime(t.time || t.Time);
                lapPositionsMap[dId] = parseInt(t.position || t.Position, 10);
              }
            });

            if (Object.keys(lapTimingsMap).length > 0) {
              parsed.push({
                lap: lapNumber,
                timings: lapTimingsMap,
                positions: lapPositionsMap
              });
            }
          });
        }

        parsed.sort((a, b) => a.lap - b.lap);

        // Fallback simulation if API returns zero entries (especially for 2026 upcoming tracks)
        if (parsed.length === 0) {
          const simulatedLaps: ParsedLapTiming[] = [];
          const totalLaps = 56;
          
          // Let's gather the active paddock pool
          const activeDriverIds = driverStandings.slice(0, 8).map(d => d.Driver.driverId);

          const defaultBaseline = selectedRace?.Circuit?.Location?.locality === 'Monaco' ? 74.0 : 88.5;

          for (let l = 1; l <= totalLaps; l++) {
            const lapTimingsMap: Record<string, number> = {};
            const lapPositionsMap: Record<string, number> = {};

            const fuelBurnReduction = (totalLaps - l) * 0.045; // fuel weight loss makes it faster
            const tireWearAddition = l * 0.038; // tire degradation makes it slower

            activeDriverIds.forEach((driverId, idx) => {
              // Drivers ranked with different dynamic paces
              const driverRank = idx + 1;
              const performanceOffset = driverRank * 0.12;
              
              const sineVariance = Math.sin(l * 0.4 + idx * 0.8) * 0.35 + 0.15;
              const wearSpur = l > 18 && l < 22 && idx % 3 === 0 ? 18.0 : 0; // Simulate pit stops!

              const driverLapTime = defaultBaseline + performanceOffset + tireWearAddition - fuelBurnReduction + sineVariance + wearSpur;
              lapTimingsMap[driverId] = parseFloat(driverLapTime.toFixed(3));
            });

            // Calculate mock positions based on lap durations
            const sortedDriversOnLap = [...activeDriverIds].sort((a, b) => lapTimingsMap[a] - lapTimingsMap[b]);
            sortedDriversOnLap.forEach((driverId, rankIdx) => {
              lapPositionsMap[driverId] = rankIdx + 1;
            });

            simulatedLaps.push({
              lap: l,
              timings: lapTimingsMap,
              positions: lapPositionsMap
            });
          }

          setLapsList(simulatedLaps);
          setDataSource(`Simulated offline synchronizer`);
        } else {
          setLapsList(parsed);
          setDataSource(`Ergast REST API live`);
        }
      } catch (err) {
        if (!isMounted) return;
        setErrorText("Network latency threshold reached. Please re-sync to fetch fresh lap logs.");
      } finally {
        if (isMounted) setLoadingLaps(false);
      }
    }

    getLaps();

    return () => {
      isMounted = false;
    };
  }, [season, selectedRound, driverStandings, selectedRace]);

  // Handle active driver select defaults
  useEffect(() => {
    if (driverStandings.length > 0 && selectedDrivers.length === 0) {
      // Pick top 3 drivers initially
      const topDrivers = driverStandings.slice(0, 3).map(ds => ds.Driver.driverId);
      setSelectedDrivers(topDrivers);
    }
  }, [driverStandings, selectedDrivers]);

  // Toggle driver filter
  const toggleDriver = (id: string) => {
    setSelectedDrivers(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev; // Keep at least one driver visible
        return prev.filter(d => d !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Quick statistics calculation for the selected drivers
  const statsSummary = useMemo(() => {
    if (lapsList.length === 0 || selectedDrivers.length === 0) return [];

    return selectedDrivers.map(dId => {
      const driver = driverStandings.find(ds => ds.Driver.driverId === dId);
      const timings = lapsList.map(l => l.timings[dId]).filter(t => t > 0);
      
      if (timings.length === 0) {
        return {
          driverId: dId,
          name: driver?.Driver?.familyName || dId,
          team: driver?.Constructors?.[0]?.name || 'F1 Team',
          fastest: 0,
          average: 0,
          spread: 0,
          consist: 'N/A'
        };
      }

      const fastest = Math.min(...timings);
      const average = timings.reduce((a, b) => a + b, 0) / timings.length;
      
      // Consistency / standard dev
      const variance = timings.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / timings.length;
      const stdDev = Math.sqrt(variance);

      let consistencyClass = 'High Consistency';
      if (stdDev > 1.2) {
        consistencyClass = 'Fluctuating Pace';
      } else if (stdDev > 0.6) {
        consistencyClass = 'Moderate Consistency';
      } else if (stdDev < 0.3) {
        consistencyClass = 'Optimal Precision';
      }

      return {
        driverId: dId,
        name: driver ? `${driver.Driver.givenName} ${driver.Driver.familyName}` : dId,
        team: driver?.Constructors?.[0]?.name || 'Independent',
        code: driver?.Driver?.code || dId.toUpperCase().slice(0, 3),
        fastest,
        average,
        spread: stdDev,
        consistencyClass
      };
    });
  }, [lapsList, selectedDrivers, driverStandings]);

  // Chart rendering values
  const chartDimensions = useMemo(() => {
    if (lapsList.length === 0) return { minTime: 0, maxTime: 0 };
    
    let allTimes: number[] = [];
    lapsList.forEach(lap => {
      selectedDrivers.forEach(dId => {
        const t = lap.timings[dId];
        // Exclude abnormally high times (like pit stop laps > 110s if normal is 80s)
        if (t > 0 && t < 160) {
          allTimes.push(t);
        }
      });
    });

    if (allTimes.length === 0) return { minTime: 70, maxTime: 100 };

    const min = Math.min(...allTimes);
    const max = Math.max(...allTimes);
    
    // Add nice margins
    return {
      minTime: Math.max(0, min - 1.5),
      maxTime: max + 1.5
    };
  }, [lapsList, selectedDrivers]);

  // SVG Chart path generation
  const svgCurves = useMemo(() => {
    if (lapsList.length < 2 || selectedDrivers.length === 0) return [];
    
    const width = 800;
    const height = 300;
    const padding = { top: 20, right: 30, bottom: 40, left: 60 };

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxLap = lapsList.length;
    const { minTime, maxTime } = chartDimensions;
    const timeDelta = maxTime - minTime || 1;

    return selectedDrivers.map(dId => {
      const driverObj = driverStandings.find(ds => ds.Driver.driverId === dId);
      const teamId = driverObj?.Constructors?.[0]?.constructorId || '';
      const color = TEAM_HEX[teamId] || '#7c3aed';

      const points = lapsList.map((lapObj, index) => {
        const timeValue = lapObj.timings[dId];
        if (!timeValue || timeValue <= 0) return null;

        // Map lap index and duration to coordinates
        const x = padding.left + (index / (maxLap - 1)) * chartW;
        const y = padding.top + chartH - ((timeValue - minTime) / timeDelta) * chartH;

        return { x, y, lap: lapObj.lap, val: timeValue };
      }).filter((p): p is { x: number; y: number; lap: number; val: number } => p !== null);

      const pathString = points.length > 0 
        ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
        : '';

      return {
        driverId: dId,
        color,
        pathString,
        points,
        code: driverObj?.Driver?.code || dId.toUpperCase().slice(0, 3)
      };
    });
  }, [lapsList, selectedDrivers, chartDimensions, driverStandings]);

  // Chart axes helpers
  const yTicks = useMemo(() => {
    const { minTime, maxTime } = chartDimensions;
    const count = 5;
    const ticks: number[] = [];
    const step = (maxTime - minTime) / (count - 1);
    for (let i = 0; i < count; i++) {
      ticks.push(minTime + step * i);
    }
    return ticks;
  }, [chartDimensions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      id="lap-times-view"
      className="space-y-8 pb-12"
    >
      {/* Title block */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5 select-none">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-mono tracking-wider font-extrabold text-[#999] uppercase">
            <Timer className="text-red-500 animate-[pulse_1.5s_infinite]" size={14} />
            <span>Lap-By-Lap Telemetry Engine</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-black tracking-tight leading-none">
            GP Timing Telemetry & Gap Analysis
          </h1>
          <p className="text-xs text-gray-500 max-w-xl">
            Analyze direct timings for selected drivers of the {season} season. Choose a round and filter specific racers to observe lap variations.
          </p>
        </div>
      </header>

      {/* Main Filter / Selection Header Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Dropdown for race round selection */}
        <div className="md:col-span-4 bg-white border border-gray-150 rounded-2xl p-5 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-1.5">
            <label className="text-[10px] bg-red-50 text-red-650 font-mono font-black tracking-widest px-2 py-0.5 rounded uppercase">
              GP ROUND SELECTION
            </label>
            <h3 className="text-sm font-bold text-black">Choose Season Event</h3>
            <p className="text-xs text-gray-400">View live timing tables logged directly at the selected circuit.</p>
          </div>
          
          <div className="relative">
            <select
              id="round-selector"
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
              className="w-full bg-white border border-gray-200 hover:border-black outline-none rounded-xl py-3 px-4 font-bold text-sm focus:ring-1 focus:ring-black appearance-none cursor-pointer"
            >
              {races.map((race) => (
                <option key={race.round} value={race.round}>
                  Round {race.round}: {race.raceName.split(' Grand Prix')[0]}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        {/* Selected Circuit quick status card */}
        <div className="md:col-span-8 bg-neutral-950 text-white rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden select-none">
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-red-400 font-black uppercase tracking-widest">
              Circuit Metadata
            </span>
            <h3 className="text-lg font-black truncate max-w-xs sm:max-w-lg leading-tight">
              {selectedRace?.Circuit?.circuitName || "Grand Prix Circuit"}
            </h3>
            <p className="text-xs text-neutral-400 italic">
              {selectedRace?.Circuit?.Location?.locality}, {selectedRace?.Circuit?.Location?.country}
            </p>
          </div>

          <div className="mt-4 pt-3.5 border-t border-neutral-800 flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono justify-start">
            <div className="flex items-center gap-1.5 text-neutral-300">
              <Clock size={14} className="text-neutral-500" />
              <span>Race Date: <strong className="text-white font-bold">{selectedRace?.date || "TBD"}</strong></span>
            </div>
            {selectedRace?.time && (
              <div className="flex items-center gap-1.5 text-neutral-300">
                <Timer size={14} className="text-neutral-500" />
                <span>Time: <strong className="text-white font-bold">{selectedRace.time}</strong></span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-neutral-300">
              <Hash size={14} className="text-neutral-500" />
              <span>Round Sequence: <strong className="text-red-400 font-black">#{selectedRound}</strong></span>
            </div>
          </div>

          {/* Clean decorative background curves */}
          <div className="absolute right-0 bottom-0 opacity-10 p-2 pointer-events-none w-36 h-36">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-[2] stroke-white">
              <path d="M 10,20 Q 40,10 70,30 T 90,70 T 50,90 Z" />
            </svg>
          </div>
        </div>

      </div>

      {/* Driver Selector checkboxes panel */}
      <div className="bg-gray-50/50 border border-gray-150 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-150/80 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-extrabold text-black flex items-center gap-1.5">
              <Users size={16} />
              <span>Roster Grid Filters</span>
            </h3>
            <p className="text-xs text-gray-500">Toggle drivers below to add or remove their lines from the timing chart overlay.</p>
          </div>
          <div className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
            {selectedDrivers.length} / {driverStandings.length} Selected
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2">
          {driverStandings.map((ds) => {
            const isSelected = selectedDrivers.includes(ds.Driver.driverId);
            const teamId = ds.Constructors?.[0]?.constructorId || '';
            const tintHex = TEAM_HEX[teamId] || '#9CA3AF';
            const bgClass = TEAM_BG[teamId] || 'bg-gray-50';

            return (
              <button
                key={ds.Driver.driverId}
                onClick={() => toggleDriver(ds.Driver.driverId)}
                className={`flex flex-col justify-between py-2 px-3 rounded-lg border transition-all duration-200 outline-none select-none text-left cursor-pointer h-[74px] ${
                  isSelected 
                    ? `bg-white shadow-xs` 
                    : 'bg-white/40 border-gray-150 hover:bg-neutral-50 hover:border-gray-300 opacity-60'
                }`}
                style={{
                  borderLeft: `4px solid ${tintHex}`,
                  borderColor: isSelected ? tintHex : undefined
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[8.5px] font-mono font-black text-gray-400">P{ds.position}</span>
                  {isSelected ? (
                    <Eye size={10} className="text-[#3b82f6]" />
                  ) : (
                    <EyeOff size={10} className="text-gray-350" />
                  )}
                </div>
                <div className="leading-none mt-2">
                  <h4 className="text-xs font-extrabold text-black truncate leading-tight">
                    {ds.Driver.familyName}
                  </h4>
                  <span className="text-[8px] font-mono font-extrabold text-gray-405 tracking-wider uppercase truncate block">
                    {ds.Driver.code || ds.Driver.driverId.slice(0, 3).toUpperCase()}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {loadingLaps ? (
        <div className="bg-white border border-gray-150 rounded-2xl p-16 text-center space-y-4 shadow-sm select-none">
          <div className="w-10 h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" strokeWidth="3" />
          <div className="space-y-1">
            <p className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest leading-none">
              Retrieving Lap Times...
            </p>
            <p className="text-[10px] text-gray-405 leading-none">Connecting telemetry systems...</p>
          </div>
        </div>
      ) : errorText ? (
        <div className="bg-rose-50 border border-rose-150 rounded-2xl p-6 text-center text-rose-950">
          <span className="font-mono text-xs font-black uppercase bg-rose-100 text-rose-800 px-2.5 py-1 rounded">API DISCONNECTED</span>
          <p className="text-xs text-rose-800/80 mt-2 max-w-sm mx-auto font-medium">{errorText}</p>
        </div>
      ) : lapsList.length === 0 ? (
        <div className="bg-white border border-gray-150 rounded-2xl p-16 text-center text-gray-400 space-y-3 shadow-xs">
          <Activity className="mx-auto text-gray-300 animate-pulse" size={28} />
          <p className="text-xs font-mono font-extrabold uppercase tracking-widest text-gray-400">Telemetry Log Empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Overlay Graph Panel */}
          <div className="lg:col-span-8 bg-white border border-gray-150 rounded-2xl p-6 space-y-6 shadow-xs select-none relative">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-black flex items-center gap-1.5">
                  <BarChart2 size={16} className="text-red-500" />
                  <span>Time Evolution Progression Curve</span>
                </h3>
                <p className="text-[10.5px] text-gray-450 font-medium">Lower position on the chart means faster, cleaner lap execution.</p>
              </div>

              {/* Legends */}
              <div className="flex flex-wrap items-center gap-3">
                {svgCurves.map(c => (
                  <div key={c.driverId} className="flex items-center gap-1.5 text-[10px] font-mono leading-none">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="font-extrabold text-gray-800">{c.code}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Interactive SVG Line Plot overlay */}
            <div className="relative border border-gray-150 bg-neutral-50/50 p-4 rounded-xl shadow-inner h-80 flex flex-col justify-center">
              
              <svg viewBox="0 0 800 300" className="w-full h-full overflow-visible">
                {/* Horizontal y-axis grid ticks */}
                {yTicks.map((tick, idx) => {
                  const chartH = 300 - 20 - 40; // bottom, top margin offset
                  const minTime = chartDimensions.minTime;
                  const maxTime = chartDimensions.maxTime;
                  const timeDelta = maxTime - minTime || 1;
                  const y = 20 + chartH - ((tick - minTime) / timeDelta) * chartH;

                  return (
                    <g key={idx} className="opacity-80">
                      <line x1="60" y1={y} x2="770" y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="50" y={y + 3} className="text-[8.5px] font-mono fill-gray-400 font-bold text-right" textAnchor="end">
                        {tick.toFixed(1)}s
                      </text>
                    </g>
                  );
                })}

                {/* Draw Curves */}
                {svgCurves.map((curveObj) => (
                  <path
                    key={curveObj.driverId}
                    d={curveObj.pathString}
                    fill="none"
                    stroke={curveObj.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />
                ))}

                {/* Draw Hover Overlay line */}
                {hoveredLap !== null && (
                  <g>
                    {(() => {
                      const idx = hoveredLap - 1;
                      const width = 800;
                      const padding = { left: 60, right: 30 };
                      const chartW = width - padding.left - padding.right;
                      const maxLap = lapsList.length;
                      const x = padding.left + (idx / (maxLap - 1)) * chartW;

                      return (
                        <>
                          <line x1={x} y1="20" x2={x} y2="260" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2 2" />
                          
                          {/* Circle indicators */}
                          {svgCurves.map((curveObj) => {
                            const pt = curveObj.points.find(p => p.lap === hoveredLap);
                            if (!pt) return null;
                            return (
                              <circle
                                key={curveObj.driverId}
                                cx={pt.x}
                                cy={pt.y}
                                r="4"
                                fill={curveObj.color}
                                stroke="white"
                                strokeWidth="1.5"
                              />
                            );
                          })}
                        </>
                      );
                    })()}
                  </g>
                )}

                {/* X-axis indicators */}
                {Array.from({ length: 11 }).map((_, idx) => {
                  const maxLap = lapsList.length;
                  const stepFrac = idx / 10;
                  const lapIdx = Math.round(stepFrac * (maxLap - 1));
                  const realLap = lapsList[lapIdx]?.lap || 1;

                  const width = 800;
                  const padding = { left: 60, right: 30 };
                  const chartW = width - padding.left - padding.right;
                  const x = padding.left + stepFrac * chartW;

                  return (
                    <g key={idx}>
                      <line x1={x} y1="260" x2={x} y2="265" stroke="#ccc" strokeWidth="1" />
                      <text x={x} y="278" className="text-[8px] font-mono fill-gray-400 font-extrabold" textAnchor="middle">
                        L{realLap}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Hover overlay detector */}
              <div 
                className="absolute inset-x-0 top-[20px] bottom-[40px] left-[60px] right-[30px]"
                onMouseLeave={() => setHoveredLap(null)}
                onMouseMove={(e) => {
                  const bounds = e.currentTarget.getBoundingClientRect();
                  const xRel = e.clientX - bounds.left;
                  const frac = Math.max(0, Math.min(1, xRel / bounds.width));
                  const rawLap = Math.round(frac * (lapsList.length - 1)) + 1;
                  setHoveredLap(rawLap);
                }}
              />
            </div>

            {/* Hover tooltip summary board */}
            <AnimatePresence>
              {hoveredLap !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-neutral-900 text-white rounded-xl p-3 flex flex-wrap gap-x-4 gap-y-1 items-center justify-between text-xs font-mono select-none"
                >
                  <span className="font-black text-[#EF1A2D] uppercase tracking-wider block">
                    Lap {hoveredLap} Timing Splits:
                  </span>
                  
                  <div className="flex flex-wrap gap-4">
                    {svgCurves.map(c => {
                      const pt = c.points.find(p => p.lap === hoveredLap);
                      if (!pt) return null;
                      return (
                        <div key={c.driverId} className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                          <span className="font-bold text-gray-200">{c.code}:</span>
                          <span className="text-white font-extrabold">{formatTime(pt.val)}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Side stats summary & Precision benchmarks */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Driver Stats cards */}
            <div className="bg-white border border-gray-150 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="border-b border-gray-100 pb-2.5">
                <span className="block text-[8.5px] font-bold font-mono text-gray-400 uppercase tracking-widest leading-none mb-1">
                  ROUND STATISTICS
                </span>
                <h3 className="text-sm font-bold text-black">Performance Benchmarks</h3>
              </div>

              <div className="space-y-3.5">
                {statsSummary.map((item) => {
                  const teamColor = TEAM_HEX[driverStandings.find(ds => ds.Driver.driverId === item.driverId)?.Constructors?.[0]?.constructorId || ''] || '#7c3aed';

                  return (
                    <div 
                      key={item.driverId}
                      className="bg-neutral-50/50 hover:bg-neutral-50 border border-gray-150 rounded-xl p-3.5 space-y-2.5 transition-all text-xs font-mono"
                    >
                      <div className="flex items-center justify-between border-b border-gray-100/60 pb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: teamColor }} />
                          <span className="font-black text-black text-xs leading-none">{item.name}</span>
                        </div>
                        <span className="text-[9px] bg-sky-50 text-sky-700 rounded px-1.5 py-0.5 uppercase font-bold tracking-wider leading-none">
                          {item.consistencyClass}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-white border border-gray-150 p-2 rounded-lg leading-none">
                          <span className="text-[8px] text-gray-400 font-bold block uppercase mb-1">Race Fastest</span>
                          <strong className="text-purple-700 font-black">{formatTime(item.fastest)}</strong>
                        </div>
                        <div className="bg-white border border-gray-150 p-2 rounded-lg leading-none">
                          <span className="text-[8px] text-gray-400 font-bold block uppercase mb-1">Race Average</span>
                          <strong className="text-black font-extrabold">{formatTime(item.average)}</strong>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-gray-450 pt-0.5 leading-none">
                        <span>Consistency index (σ)</span>
                        <span className="font-mono text-gray-600 font-bold">{item.spread.toFixed(3)}s</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}
    </motion.div>
  );
}
