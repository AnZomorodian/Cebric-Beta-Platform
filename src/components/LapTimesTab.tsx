import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Timer, Clock, Activity, Users, ChevronDown, 
  Eye, EyeOff, BarChart2, Hash, Zap, Play, Pause, Square, SkipBack, SkipForward, Upload, CheckCircle2,
  Database, RefreshCw, Gauge, AlertTriangle, Wind, Thermometer, Droplets, MapPin, Sparkles, Sliders
} from 'lucide-react';
import { SeasonData, DriverStanding, Race } from '../types';
import { fetchLapTimes } from '../services/ergast';
import { TEAM_HEX, TEAM_BG } from '../data/mockData';
import { HAM_LAPS_CSV, HAM_TELEMETRY_CSV } from '../data/rawTelemetryCsv';

const DRIVER_NUMBERS: Record<string, string> = {
  'verstappen': '1',
  'hadjar': '6',
  'norris': '4',
  'piastri': '81',
  'leclerc': '16',
  'hamilton': '44',
  'russell': '63',
  'antonelli': '12',
  'sainz': '55',
  'albon': '23',
  'alonso': '14',
  'stroll': '18',
  'gasly': '10',
  'colapinto': '43',
  'ocon': '31',
  'bearman': '87',
  'lawson': '30',
  'lindblad': '17',
  'hulkenberg': '27',
  'bortoleto': '5',
  'perez': '11',
  'bottas': '77'
};

const POPULAR_OF1_DRIVERS = [
  { number: 4, name: "Lando Norris", team: "McLaren", code: "NOR" },
  { number: 81, name: "Oscar Piastri", team: "McLaren", code: "PIA" },
  { number: 16, name: "Charles Leclerc", team: "Ferrari", code: "LEC" },
  { number: 44, name: "Lewis Hamilton", team: "Ferrari", code: "HAM" },
  { number: 63, name: "George Russell", team: "Mercedes", code: "RUS" },
  { number: 12, name: "Kimi Antonelli", team: "Mercedes", code: "ANT" },
  { number: 1, name: "Max Verstappen", team: "Red Bull Racing", code: "VER" },
  { number: 6, name: "Isack Hadjar", team: "Red Bull Racing", code: "HAD" },
  { number: 14, name: "Fernando Alonso", team: "Aston Martin", code: "ALO" },
  { number: 18, name: "Lance Stroll", team: "Aston Martin", code: "STR" },
  { number: 10, name: "Pierre Gasly", team: "Alpine", code: "GAS" },
  { number: 43, name: "Franco Colapinto", team: "Alpine", code: "COL" },
  { number: 55, name: "Carlos Sainz Jr.", team: "Williams", code: "SAI" },
  { number: 23, name: "Alexander Albon", team: "Williams", code: "ALB" },
  { number: 31, name: "Esteban Ocon", team: "Haas F1 Team", code: "OCO" },
  { number: 87, name: "Oliver Bearman", team: "Haas F1 Team", code: "BEA" },
  { number: 30, name: "Liam Lawson", team: "Racing Bulls", code: "LAW" },
  { number: 17, name: "Arvid Lindblad", team: "Racing Bulls", code: "LIN" },
  { number: 27, name: "Nico Hülkenberg", team: "Audi", code: "HUL" },
  { number: 5, name: "Gabriel Bortoleto", team: "Audi", code: "BOR" },
  { number: 11, name: "Sergio Pérez", team: "Cadillac Formula 1 Team", code: "PER" },
  { number: 77, name: "Valtteri Bottas", team: "Cadillac Formula 1 Team", code: "BOT" },
];

const F1_2026_CALENDAR = [
  { gp: "Australia", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "China", sessions: ["FP1", "Sprint Qualifying", "Sprint", "Qualifying", "Race"] },
  { gp: "Japan", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Bahrain", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Saudi Arabia", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Miami", sessions: ["FP1", "Sprint Qualifying", "Sprint", "Qualifying", "Race"] },
  { gp: "Canada", sessions: ["FP1", "Sprint Qualifying", "Sprint", "Qualifying", "Race"] },
  { gp: "Monaco", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Barcelona", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Austria", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Great Britain", sessions: ["FP1", "Sprint Qualifying", "Sprint", "Qualifying", "Race"] },
  { gp: "Belgium", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Hungary", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Netherlands", sessions: ["FP1", "Sprint Qualifying", "Sprint", "Qualifying", "Race"] },
  { gp: "Italy (Monza)", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Spain (Madrid)", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Azerbaijan", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Singapore", sessions: ["FP1", "Sprint Qualifying", "Sprint", "Qualifying", "Race"] },
  { gp: "United States (Austin)", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Mexico City", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "São Paulo", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Las Vegas", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Qatar", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] },
  { gp: "Abu Dhabi", sessions: ["FP1", "FP2", "FP3", "Qualifying", "Race"] }
];

const getSessionsForGp = (gpName: string): string[] => {
  if (!gpName) return ["FP1", "FP2", "FP3", "Qualifying", "Race"];
  const cleanGp = gpName.toLowerCase().replace(/\bgp\b/g, '').replace(/grand prix/g, '').trim();
  const found = F1_2026_CALENDAR.find(c => 
    c.gp.toLowerCase().includes(cleanGp) || 
    cleanGp.includes(c.gp.toLowerCase())
  );
  return found ? found.sessions : ["FP1", "FP2", "FP3", "Qualifying", "Race"];
};

const OF1_GPS = F1_2026_CALENDAR.map(c => c.gp);

const OF1_SESSIONS = [
  "Qualifying",
  "Race",
  "FP1",
  "FP2",
  "FP3",
  "Sprint Qualifying",
  "Sprint"
];

const getDriverColorByNo = (num: number) => {
  if (num === 4 || num === 81) return '#FF8700'; // McLaren orange
  if (num === 16 || num === 44) return '#EF1A2D'; // Ferrari red
  if (num === 63 || num === 12) return '#27F4D2'; // Mercedes AMG teal
  if (num === 1 || num === 6) return '#3671C6'; // Red Bull blue
  if (num === 14 || num === 18) return '#229971'; // Aston Martin green
  if (num === 10 || num === 43) return '#0093CC'; // Alpine pink/blue
  if (num === 55 || num === 23) return '#005AFF'; // Williams blue
  if (num === 31 || num === 87) return '#C4A484'; // Haas F1 Team gold/gray
  if (num === 30 || num === 17) return '#6692FF'; // Racing Bulls tech blue
  if (num === 27 || num === 5) return '#00E6C3'; // Audi bright green
  if (num === 11 || num === 77) return '#D4AF37'; // Cadillac gold
  return '#10b981';
};

const getDriverNameByNo = (num: number) => {
  const found = POPULAR_OF1_DRIVERS.find(d => d.number === num);
  return found ? found.name : `Driver #${num}`;
};

const getDriverCodeByNo = (num: number) => {
  const found = POPULAR_OF1_DRIVERS.find(d => d.number === num);
  return found ? found.code : `#${num}`;
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

function formatSectorTime(val: any, includeSuffix = true): string {
  if (val === undefined || val === null || val === '') return '--';
  const str = String(val).trim();
  if (!str) return '--';
  
  let timeStr = str;
  if (str.includes('days')) {
    const parts = str.split(/\s+/);
    timeStr = parts[parts.length - 1];
  }
  
  if (timeStr.includes(':')) {
    const timeParts = timeStr.split(':');
    const secsPart = timeParts[timeParts.length - 1];
    const seconds = parseFloat(secsPart);
    if (!isNaN(seconds)) {
      return `${seconds.toFixed(3)}${includeSuffix ? 's' : ''}`;
    }
  }
  
  const num = Number(str);
  if (!isNaN(num)) {
    return `${num.toFixed(3)}${includeSuffix ? 's' : ''}`;
  }
  
  return str;
}

function formatLapTime(val: any): string {
  if (val === undefined || val === null || val === '') return 'Pit Out';
  const str = String(val).trim();
  if (str.toLowerCase() === 'pit out') return 'Pit Out';
  
  let timeStr = str;
  if (str.includes('days')) {
    const parts = str.split(/\s+/);
    timeStr = parts[parts.length - 1];
  }
  
  if (timeStr.includes(':')) {
    const timeParts = timeStr.split(':');
    const secsPart = timeParts[timeParts.length - 1];
    const minsPart = timeParts[timeParts.length - 2];
    const hoursPart = timeParts[timeParts.length - 3] || '00';
    
    const seconds = parseFloat(secsPart);
    const minutes = parseInt(minsPart, 10);
    const hours = parseInt(hoursPart, 10);
    
    if (isNaN(seconds) || isNaN(minutes)) {
      return str;
    }
    
    const secsStr = seconds.toFixed(3).padStart(6, '0');
    
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${secsStr}`;
    } else if (minutes > 0) {
      return `${minutes}:${secsStr}`;
    } else {
      return seconds.toFixed(3);
    }
  }
  
  const num = Number(str);
  if (!isNaN(num)) {
    return num.toFixed(3);
  }
  
  return str;
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

  // Filter out any GP that has not been completed yet!
  const completedRaces = useMemo(() => {
    return races.filter(race => {
      if (!race.date) return false;
      const raceDate = new Date(`${race.date}T23:59:59`);
      return raceDate < new Date();
    });
  }, [races]);

  // Default to round 1
  const [selectedRound, setSelectedRound] = useState<string>('1');

  // Sync selectedRound to first completed race round if current selectedRound is not completed
  useEffect(() => {
    if (completedRaces.length > 0) {
      const exists = completedRaces.some(r => r.round === selectedRound);
      if (!exists) {
        setSelectedRound(completedRaces[0].round);
      }
    }
  }, [completedRaces, selectedRound]);
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [hoveredLap, setHoveredLap] = useState<number | null>(null);

  // F1 TELEMETRY & LAP ANALYST state
  const [lapLogs, setLapLogs] = useState<any[]>([]);
  const [telemetryLogs, setTelemetryLogs] = useState<any[]>([]);
  const [activeTelemetryIndex, setActiveTelemetryIndex] = useState<number>(0);
  const [isTelemetryPlaying, setIsTelemetryPlaying] = useState<boolean>(false);
  const [csvUploadError, setCsvUploadError] = useState<string | null>(null);
  const [selectedAnalysisLap, setSelectedAnalysisLap] = useState<number>(2);
  const [activeTrackHoverIndex, setActiveTrackHoverIndex] = useState<number | null>(null);
  const [circuitView, setCircuitView] = useState<'3d' | '2d'>('3d');

  // List of uploaded datasets
  const [uploadedDatasets, setUploadedDatasets] = useState<any[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');

  // Real database telemetry criteria selection
  const [telSelYear, setTelSelYear] = useState<number>(2026);
  const [telSelGp, setTelSelGp] = useState<string>("");
  const [telSelSession, setTelSelSession] = useState<string>("");
  const [telSelDriver, setTelSelDriver] = useState<string>("");

  // Dynamic unique GPs based on the selected year
  const uniqueUploadedGps = useMemo(() => {
    const gps = new Set<string>();
    uploadedDatasets.forEach(d => {
      if (d.gp && Number(d.year) === telSelYear) gps.add(d.gp);
    });
    return Array.from(gps).sort();
  }, [uploadedDatasets, telSelYear]);

  // Dynamic sessions based on selected GP
  const uniqueUploadedSessions = useMemo(() => {
    if (!telSelGp) return [];
    const sessions = new Set<string>();
    uploadedDatasets.forEach(d => {
      const matchYear = Number(d.year) === telSelYear;
      const matchGp = d.gp.toLowerCase().trim() === telSelGp.toLowerCase().trim();
      if (matchYear && matchGp && d.session) {
        sessions.add(d.session);
      }
    });
    return Array.from(sessions).sort();
  }, [uploadedDatasets, telSelYear, telSelGp]);

  // Dynamic unique drivers based on selected GP and selected Session
  const uniqueUploadedDrivers = useMemo(() => {
    if (!telSelGp || !telSelSession) return [];
    const drivers = new Set<string>();
    uploadedDatasets.forEach(d => {
      const matchYear = Number(d.year) === telSelYear;
      const matchGp = d.gp.toLowerCase().trim() === telSelGp.toLowerCase().trim();
      const matchSession = d.session.toLowerCase().trim() === telSelSession.toLowerCase().trim();
      if (matchYear && matchGp && matchSession && d.driver) {
        drivers.add(d.driver.toUpperCase());
      }
    });
    return Array.from(drivers).sort();
  }, [uploadedDatasets, telSelYear, telSelGp, telSelSession]);

  const matchedTelemetryDataset = useMemo(() => {
    if (!telSelGp || !telSelSession || !telSelDriver) return null;
    return uploadedDatasets.find(d => {
      const matchYear = Number(d.year) === telSelYear;
      const matchGp = d.gp.toLowerCase().trim() === telSelGp.toLowerCase().trim();
      const matchSession = d.session.toLowerCase().trim() === telSelSession.toLowerCase().trim();
      const matchDriver = d.driver.toUpperCase().trim() === telSelDriver.toUpperCase().trim();
      return matchYear && matchGp && matchSession && matchDriver;
    });
  }, [uploadedDatasets, telSelYear, telSelGp, telSelSession, telSelDriver]);

  // Helper to parse time strings safely to numeric seconds
  const parseTimeSeconds = (timeStr: any): number => {
    if (!timeStr) return 0;
    if (typeof timeStr === 'number') return timeStr;
    const str = String(timeStr).trim();
    // Parse formats "0 days 00:01:13.804000" or "01:13.804" or "1:13.804"
    if (str.includes('days')) {
      const parts = str.split(/\s+/);
      const hms = parts[2] || '';
      const hmsParts = hms.split(':');
      const hrs = parseFloat(hmsParts[0] || '0');
      const mins = parseFloat(hmsParts[1] || '0');
      const secs = parseFloat(hmsParts[2] || '0');
      return hrs * 3600 + mins * 60 + secs;
    }
    if (str.includes(':')) {
      const parts = str.split(':');
      const mins = parseFloat(parts[0] || '0');
      const secs = parseFloat(parts[1] || '0');
      return mins * 60 + secs;
    }
    return parseFloat(str) || 0;
  };

  // Dynamically morph base telemetry points to precisely map selected lap timings & speeds
  const activeTelemetryPoints = useMemo(() => {
    if (telemetryLogs.length === 0) return [];
    
    const selectedLap = lapLogs.find(l => l.LapNumber === selectedAnalysisLap);
    if (!selectedLap) return telemetryLogs;

    // Normalizing reference lap duration (Canada GP reference is approx 1:13.804 - Lap 6)
    const baseTimeSeconds = 73.804;
    const targetTimeSeconds = parseTimeSeconds(selectedLap.LapTime);
    
    const ratio = (targetTimeSeconds > 0) ? (baseTimeSeconds / targetTimeSeconds) : 1.0;
    
    return telemetryLogs.map((pt, idx) => {
      const relPos = idx / telemetryLogs.length;
      let sectorFactor = 1.0;

      // Morph speed and inputs dynamically within Sector boundaries based on Lap sector times
      if (relPos < 0.33) {
        const targetSec1 = parseTimeSeconds(selectedLap.Sector1Time);
        sectorFactor = targetSec1 > 0 ? (19.612 / targetSec1) : 1.0;
      } else if (relPos < 0.75) {
        const targetSec2 = parseTimeSeconds(selectedLap.Sector2Time);
        sectorFactor = targetSec2 > 0 ? (34.610 / targetSec2) : 1.0;
      } else {
        const targetSec3 = parseTimeSeconds(selectedLap.Sector3Time);
        sectorFactor = targetSec3 > 0 ? (19.582 / targetSec3) : 1.0;
      }

      const finalFactor = (ratio * 0.45 + sectorFactor * 0.55);
      const boundedFactor = Math.min(1.4, Math.max(0.4, finalFactor));
      
      let finalSpeed = (pt.Speed || 0) * boundedFactor;
      
      // Align final coordinates speed seamlessly onto Trap Finish speed if recorded
      if (idx > telemetryLogs.length - 12 && selectedLap.SpeedFL) {
        const flWeight = (idx - (telemetryLogs.length - 12)) / 12;
        finalSpeed = finalSpeed * (1 - flWeight) + selectedLap.SpeedFL * flWeight;
      }
      
      const finalRpm = Math.min(15000, Math.max(4000, (pt.RPM || 0) * (boundedFactor * 0.35 + 0.65)));
      const finalThrottle = Math.min(100, Math.max(0, (pt.Throttle || 0) * (boundedFactor * 0.2 + 0.8)));

      return {
        ...pt,
        Speed: finalSpeed,
        RPM: finalRpm,
        Throttle: finalThrottle
      };
    });
  }, [telemetryLogs, selectedAnalysisLap, lapLogs]);

  // Simple and robust CSV parser
  const localParseCSV = (csvText: string): any[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values: string[] = [];
      let currentCell = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentCell.trim());
          currentCell = '';
        } else {
          currentCell += char;
        }
      }
      values.push(currentCell.trim());

      const rowObj: any = {};
      headers.forEach((header, idx) => {
        let val: any = values[idx] || '';
        val = val.replace(/^["']|["']$/g, '').trim();
        if (val === 'True') val = true;
        else if (val === 'False') val = false;
        else if (!isNaN(Number(val)) && val !== '') val = Number(val);
        rowObj[header] = val;
      });
      return rowObj;
    });
  };

  // Load standard template or custom uploaded telemetries from server database on mount
  const fetchUploadedDatasets = async () => {
    try {
      const res = await fetch('/api/admin/uploaded-telemetries');
      if (res.ok) {
        const list = await res.json();
        setUploadedDatasets(list);
        if (list.length > 0) {
          const barcelonaItem = list.find((item: any) => item.gp.toLowerCase() === "barcelona" && Number(item.year) === 2026);
          const defaultItem = barcelonaItem || list[0];
          setTelSelYear(Number(defaultItem.year));
          setTelSelGp(defaultItem.gp);
          setTelSelSession(defaultItem.session);
          setTelSelDriver(defaultItem.driver);
        }
      }
    } catch (e) {
      console.error("Failed to load uploaded telemetry list from database", e);
    }
  };

  useEffect(() => {
    fetchUploadedDatasets();
  }, []);

  // When matchedTelemetryDataset changes, parse the CSV content
  useEffect(() => {
    if (matchedTelemetryDataset) {
      try {
        const parsedL = localParseCSV(matchedTelemetryDataset.lapsCsv);
        const parsedT = localParseCSV(matchedTelemetryDataset.telemetryCsv);
        setLapLogs(parsedL);
        setTelemetryLogs(parsedT);
        setActiveTelemetryIndex(0);
        if (parsedL.length > 0) {
          // Auto-select the lap with the minimum LapTime (converted to seconds)
          let fastestLapNum = parsedL[0].LapNumber || 1;
          let minTime = Infinity;
          parsedL.forEach(lap => {
            const parsedTime = parseTimeSeconds(lap.LapTime);
            if (parsedTime > 0 && parsedTime < minTime) {
              minTime = parsedTime;
              fastestLapNum = lap.LapNumber;
            }
          });
          setSelectedAnalysisLap(fastestLapNum);
        }
      } catch (e) {
        console.error("Failed to parse custom uploaded files", e);
      }
    } else {
      setLapLogs([]);
      setTelemetryLogs([]);
      setActiveTelemetryIndex(0);
    }
  }, [matchedTelemetryDataset]);

  const fastestLapTimeInSession = useMemo(() => {
    const times = lapLogs.map(l => parseTimeSeconds(l.LapTime)).filter(t => t > 0);
    return times.length > 0 ? Math.min(...times) : null;
  }, [lapLogs]);

  const fastestS1InSession = useMemo(() => {
    const times = lapLogs.map(l => parseTimeSeconds(l.Sector1Time)).filter(t => t > 0);
    return times.length > 0 ? Math.min(...times) : null;
  }, [lapLogs]);

  const fastestS2InSession = useMemo(() => {
    const times = lapLogs.map(l => parseTimeSeconds(l.Sector2Time)).filter(t => t > 0);
    return times.length > 0 ? Math.min(...times) : null;
  }, [lapLogs]);

  const fastestS3InSession = useMemo(() => {
    const times = lapLogs.map(l => parseTimeSeconds(l.Sector3Time)).filter(t => t > 0);
    return times.length > 0 ? Math.min(...times) : null;
  }, [lapLogs]);

  // Telemetry play loop
  useEffect(() => {
    if (!isTelemetryPlaying || telemetryLogs.length === 0) return;
    const interval = setInterval(() => {
      setActiveTelemetryIndex(prev => {
        if (prev >= telemetryLogs.length - 1) {
          setIsTelemetryPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 120); // Smooth 120ms ticks (approx 8Hz)
    return () => clearInterval(interval);
  }, [isTelemetryPlaying, telemetryLogs.length]);

  // States for fetching
  const [lapsList, setLapsList] = useState<ParsedLapTiming[]>([]);
  const [loadingLaps, setLoadingLaps] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('API feed');

  // OpenF1 cascading dynamic loaders & states
  const [of1Year, setOf1Year] = useState<number>(2026);
  const [of1SessionsList, setOf1SessionsList] = useState<any[]>([]);
  const [loadingOf1Sessions, setLoadingOf1Sessions] = useState<boolean>(false);
  const [of1Gps, setOf1Gps] = useState<any[]>([]); // Dynamic unique GP list
  const [of1Gp, setOf1Gp] = useState<string>("Belgium"); // Target GP
  const [of1SessionsForGp, setOf1SessionsForGp] = useState<any[]>([]); // Dynamic sessions for current GP
  const [of1Session, setOf1Session] = useState<string>("Qualifying"); // Session type
  const [of1SessionKey, setOf1SessionKey] = useState<string>("9158"); // Key
  const [of1DriversList, setOf1DriversList] = useState<any[]>([]); // Drivers for current session
  const [loadingOf1Drivers, setLoadingOf1Drivers] = useState<boolean>(false);

  const [of1Driver1, setOf1Driver1] = useState<number>(44);
  const [of1Driver2, setOf1Driver2] = useState<number>(63);
  
  // Real laps timing
  const [of1Driver1Laps, setOf1Driver1Laps] = useState<any[]>([]);
  const [of1Driver2Laps, setOf1Driver2Laps] = useState<any[]>([]);

  const [of1Loading, setOf1Loading] = useState<boolean>(false);
  const [of1Error, setOf1Error] = useState<string | null>(null);
  const [of1Data, setOf1Data] = useState<any>(null);
  const [scrubPercent, setScrubPercent] = useState<number>(50);

  // Helper utility to get simulated laps if real API has CORS or network failures
  const getSimulatedLapsList = (driverNumber: number, count: number = 20) => {
    const list: any[] = [];
    const baseline = 93.5 + (driverNumber % 10) * 0.2;
    for (let l = 1; l <= count; l++) {
      const variance = Math.sin(l * 0.5 + driverNumber) * 0.5 + Math.random() * 0.3;
      list.push({
        driver_number: driverNumber,
        lap_number: l,
        lap_duration: baseline + variance,
        duration_sector_1: 28.5 + variance * 0.3,
        duration_sector_2: 38.2 + variance * 0.4,
        duration_sector_3: 26.8 + variance * 0.3,
        st_speed: 312 + Math.round((variance * -1) * 8)
      });
    }
    return list;
  };

  // Helper utility to get simulated sessions for seasons
  const getMockOf1Sessions = (year: number) => {
    return [
      { session_key: year * 10 + 1, session_name: "Race", location: "Sakhir", country_name: "Bahrain", year, meeting_name: "Bahrain Grand Prix" },
      { session_key: year * 10 + 2, session_name: "Qualifying", location: "Sakhir", country_name: "Bahrain", year, meeting_name: "Bahrain Grand Prix" },
      { session_key: year * 10 + 3, session_name: "Practice 1", location: "Sakhir", country_name: "Bahrain", year, meeting_name: "Bahrain Grand Prix" },
      { session_key: year * 10 + 4, session_name: "Race", location: "Marina Bay", country_name: "Singapore", year, meeting_name: "Singapore Grand Prix" },
      { session_key: year * 10 + 5, session_name: "Qualifying", location: "Marina Bay", country_name: "Singapore", year, meeting_name: "Singapore Grand Prix" },
      { session_key: year * 10 + 6, session_name: "Race", location: "Spa-Francorchamps", country_name: "Belgium", year, meeting_name: "Belgian Grand Prix" },
      { session_key: year * 10 + 7, session_name: "Qualifying", location: "Spa-Francorchamps", country_name: "Belgium", year, meeting_name: "Belgian Grand Prix" },
      { session_key: year * 10 + 8, session_name: "Race", location: "Monza", country_name: "Italy", year, meeting_name: "Italian Grand Prix" },
      { session_key: year * 10 + 9, session_name: "Qualifying", location: "Monza", country_name: "Italy", year, meeting_name: "Italian Grand Prix" },
    ];
  };

  // OpenF1 Dual Telemetry Subtab Control
  const [activeSubTab, setActiveSubTab] = useState<'progression' | 'openf1'>('openf1');

  const { mapPoints, scaleX, scaleY, minZ, maxZ } = useMemo(() => {
    if (activeTelemetryPoints.length === 0) {
      return {
        mapPoints: [],
        scaleX: (x: number) => 250,
        scaleY: (y: number) => 250,
        minZ: 0,
        maxZ: 1000
      };
    }
    const xs = activeTelemetryPoints.map(p => p.X).filter(v => typeof v === 'number');
    const ys = activeTelemetryPoints.map(p => p.Y).filter(v => typeof v === 'number');
    const zs = activeTelemetryPoints.map(p => p.Z).filter(v => typeof v === 'number');
    const minX = xs.length ? Math.min(...xs) : 0;
    const maxX = xs.length ? Math.max(...xs) : 1000;
    const minY = ys.length ? Math.min(...ys) : 0;
    const maxY = ys.length ? Math.max(...ys) : 1000;
    const minZ = zs.length ? Math.min(...zs) : 0;
    const maxZ = zs.length ? Math.max(...zs) : 1000;
    
    const width = maxX - minX || 1;
    const height = maxY - minY || 1;
    const maxDimension = Math.max(width, height);
    
    // Centering offset formulas to draw maps in a nice balanced bounding layout
    const xOffset = 40 + (420 - (width / maxDimension) * 420) / 2;
    const yOffset = 460 - (420 - (height / maxDimension) * 420) / 2;
    
    const scX = (val: number) => {
      return xOffset + ((val - minX) / maxDimension) * 420;
    };
    
    const scY = (val: number) => {
      return yOffset - ((val - minY) / maxDimension) * 420;
    };

    return {
      mapPoints: activeTelemetryPoints,
      scaleX: scX,
      scaleY: scY,
      minZ,
      maxZ
    };
  }, [activeTelemetryPoints]);

  const renderTelemetryAnalyst = () => {
    const currentPt = activeTelemetryPoints[activeTelemetryIndex] || {
      X: 0,
      Y: 0,
      Speed: 0,
      Throttle: 0,
      nGear: 1,
      RPM: 0,
      Distance: 0,
      Time: '0.000s',
      Brake: false
    };

    return (
      <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
        {/* Active Dataset Selection dynamic criteria selects */}
        <div className="bg-[#0b0e17] border border-[#1e2638] rounded-2xl p-5 space-y-4 shadow-lg relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1 bg-red-600" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="block text-[9px] font-mono text-red-500 font-extrabold uppercase tracking-widest leading-none mb-1">Telemetry Database Core</span>
              <h3 className="text-sm font-black text-white tracking-tight">Active Telemetry Database Filters</h3>
              <p className="text-[10px] text-gray-400 font-mono">Select Year, Grand Prix, Session, and Driver to view precision telemetry matching.</p>
            </div>
            
            <button 
              onClick={fetchUploadedDatasets}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-[#1e2638] hover:border-red-600 text-[10px] text-neutral-350 hover:text-white font-mono rounded-lg transition duration-150 cursor-pointer uppercase font-bold"
            >
              <RefreshCw size={11} className="animate-spin-slow" /> Refresh Database
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#080a11] p-3.5 rounded-xl border border-[#141b2a]">
            {/* Year selector */}
            <div className="space-y-1">
              <label className="block text-[8px] text-gray-500 font-mono font-bold uppercase">SEASON YEAR</label>
              <select
                value={telSelYear}
                onChange={(e) => setTelSelYear(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-[#1e2638] rounded-lg p-2 text-xs text-white font-mono font-bold outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="2026">2026</option>
              </select>
            </div>

            {/* Grand Prix selector */}
            <div className="space-y-1">
              <label className="block text-[8px] text-gray-500 font-mono font-bold uppercase">GRAND PRIX GP</label>
              <select
                value={telSelGp}
                onChange={(e) => {
                  setTelSelGp(e.target.value);
                  setTelSelSession("");
                  setTelSelDriver("");
                }}
                className="w-full bg-neutral-950 border border-[#1e2638] rounded-lg p-2 text-xs text-white font-mono font-bold outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="">-- Choose Grand Prix --</option>
                {uniqueUploadedGps.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Session type selector */}
            <div className="space-y-1">
              <label className="block text-[8px] text-gray-500 font-mono font-bold uppercase">SESSION TYPE</label>
              <select
                value={telSelSession}
                disabled={!telSelGp}
                onChange={(e) => {
                  setTelSelSession(e.target.value);
                  setTelSelDriver("");
                }}
                className="w-full bg-neutral-950 border border-[#1e2638] rounded-lg p-2 text-xs text-white font-mono font-bold outline-none focus:border-red-500 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
              >
                <option value="">-- Choose Session --</option>
                {uniqueUploadedSessions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Driver Tag selector */}
            <div className="space-y-1">
              <label className="block text-[8px] text-gray-500 font-mono font-bold uppercase">DRIVER TAG</label>
              <select
                value={telSelDriver}
                disabled={!telSelSession}
                onChange={(e) => setTelSelDriver(e.target.value.toUpperCase())}
                className="w-full bg-neutral-950 border border-[#1e2638] rounded-lg p-2 text-xs text-white font-mono font-bold outline-none focus:border-red-500 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
              >
                <option value="">-- Choose Driver --</option>
                {uniqueUploadedDrivers.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {!telSelGp || !telSelSession || !telSelDriver ? (
          <div className="bg-[#0b0e17] border border-[#1e2638] rounded-2xl p-12 text-center space-y-4 select-none animate-[fadeIn_0.3s_ease-out]">
            <Database size={40} className="text-gray-500 mx-auto animate-pulse" />
            <div className="space-y-1.5 text-center">
              <h4 className="text-base font-black text-white font-mono tracking-tight uppercase">Enter Selection Sequence</h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                Please configure the filters above sequentially to analyze telemetry:
              </p>
              <div className="flex flex-wrap justify-center items-center gap-3 text-[10px] font-mono pt-3">
                <span className={`px-2.5 py-1 rounded border ${telSelGp ? "bg-green-950/40 border-green-800 text-green-400 font-bold" : "bg-neutral-900/60 border-[#1e2638]/60 text-neutral-500 animate-pulse"}`}>
                  1. GP {telSelGp ? "✓" : "•"}
                </span>
                <span className="text-neutral-600">→</span>
                <span className={`px-2.5 py-1 rounded border ${telSelSession ? "bg-green-950/40 border-green-800 text-green-400 font-bold" : "bg-neutral-900/60 border-[#1e2638]/60 text-neutral-500"}`}>
                  2. Session {telSelSession ? "✓" : "•"}
                </span>
                <span className="text-neutral-600">→</span>
                <span className={`px-2.5 py-1 rounded border ${telSelDriver ? "bg-green-950/40 border-green-800 text-green-400 font-bold" : "bg-neutral-900/60 border-[#1e2638]/60 text-neutral-500"}`}>
                  3. Driver {telSelDriver ? "✓" : "•"}
                </span>
              </div>
            </div>
          </div>
        ) : !matchedTelemetryDataset ? (
          <div className="bg-[#0b0e17] border border-[#1e2638] rounded-2xl p-12 text-center space-y-4 select-none animate-[fadeIn_0.3s_ease-out]">
            <Database size={40} className="text-gray-600 mx-auto" />
            <div className="space-y-1.5 text-center">
              <h4 className="text-base font-black text-white font-mono tracking-tight uppercase">Dataset Not Found</h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                No active database telemetry found matching <span className="text-red-500 font-bold">{telSelYear} {telSelGp} [{telSelDriver}] - {telSelSession}</span>.
              </p>
              <p className="text-[10px] text-gray-500 max-w-xs mx-auto pt-1 leading-relaxed">
                Log in to the system <strong className="text-gray-300">Admin Account</strong> on the VIP User Hub (Auth Tab) to upload standard Laps & Telemetry CSV files.
              </p>
            </div>
          </div>
        ) : (
          <>

        {/* Controls & Metrics Header Row */}
        <div className="bg-[#090b11] border border-[#1e2638] rounded-2xl p-6 text-white shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1c2235] pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-mono text-[9px] font-black rounded-full tracking-wider">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                {telSelYear} {telSelGp.toUpperCase()} DATABASE DEPLOYED DATASET
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[10px] text-gray-400">
              <div className="flex items-center gap-1">
                <Clock size={11} className="text-red-500" />
                <span>🕒 14:00:00 LOCAL</span>
              </div>
              <div className="flex items-center gap-1">
                <Thermometer size={11} className="text-amber-500" />
                <span>Track Temp: <span className="text-white font-bold">24.5°C</span></span>
              </div>
              <div className="flex items-center gap-1">
                <Droplets size={11} className="text-sky-400" />
                <span>Humidity: <span className="text-white font-bold">38%</span></span>
              </div>
              <div className="flex items-center gap-1">
                <Wind size={11} className="text-emerald-400" />
                <span>Wind: <span className="text-white font-bold">NE 12 km/h</span></span>
              </div>
            </div>
          </div>

          {/* horizontal key indicators panel */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-[#0b0e17] border border-[#1a2133] rounded-xl p-3 space-y-1">
              <span className="block text-[8px] font-mono tracking-wider text-gray-500 uppercase">GRAND PRIX</span>
              <div className="flex items-center gap-1">
                <MapPin size={12} className="text-red-400 shrink-0" />
                <span className="font-extrabold text-xs text-white truncate">{telSelGp}</span>
              </div>
            </div>
            <div className="bg-[#0b0e17] border border-[#1a2133] rounded-xl p-3 space-y-1">
              <span className="block text-[8px] font-mono tracking-wider text-gray-500 uppercase">FASTEST LAP</span>
              <div className="flex items-center gap-1">
                <Gauge size={12} className="text-neutral-400 shrink-0" />
                <span className="font-extrabold text-xs text-neutral-300">
                  {lapLogs.length > 0 
                     ? formatLapTime(Math.min(...lapLogs.map(l => l.LapTime || 999999))) 
                     : "1:13.524"}
                </span>
              </div>
            </div>
            <div className="bg-[#0b0e17] border border-[#1a2133] rounded-xl p-3 space-y-1 ring-1 ring-red-950">
              <span className="block text-[8px] font-mono tracking-wider text-red-100 uppercase">ACTIVE RACER</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
                <span className="font-black text-xs text-white">
                  {POPULAR_OF1_DRIVERS.find(d => d.code === telSelDriver)?.name || telSelDriver}
                </span>
              </div>
            </div>
            <div className="bg-[#0b0e17] border border-[#1a2133] rounded-xl p-3 space-y-1">
              <span className="block text-[8px] font-mono tracking-wider text-gray-500 uppercase">CONSTRUCTOR</span>
              <span className="block font-black text-xs text-red-500 truncate">
                {POPULAR_OF1_DRIVERS.find(d => d.code === telSelDriver)?.team || "Independent Entry"}
              </span>
            </div>
            <div className="bg-[#0b0e17] border border-[#1a2133] rounded-xl p-3 space-y-1 col-span-2 md:col-span-1">
              <span className="block text-[8px] font-mono tracking-wider text-gray-500 uppercase">TRACK OPTIMALITY</span>
              <span className="block font-black text-xs text-emerald-400 animate-pulse uppercase tracking-widest">DRY</span>
            </div>
          </div>
        </div>

        {/* Interactive Dual splits components row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Side: Circuit Layout Panel */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-[#0c101b] border border-[#1e2638] rounded-2xl p-6 text-white flex flex-col justify-between shadow-2xl relative">
            <div className="space-y-1">
              <div className="flex items-center justify-between animate-[fadeIn_0.3s_ease-out]">
                <h3 className="text-xs font-black tracking-widest font-mono text-gray-400 uppercase">CIRCUIT LAYOUT</h3>
                <div className="flex items-center gap-1.5 p-0.5 bg-[#080b12] border border-[#1e2638] rounded-lg">
                  <button
                    onClick={() => setCircuitView('2d')}
                    className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition cursor-pointer ${
                      circuitView === '2d'
                        ? 'bg-[#1e2638] text-white'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    2D
                  </button>
                  <button
                    onClick={() => setCircuitView('3d')}
                    className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition cursor-pointer ${
                      circuitView === '3d'
                        ? 'bg-red-800/30 border border-red-700/50 text-red-500 font-extrabold'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    3D (Z)
                  </button>
                </div>
              </div>
              
              {/* Custom Color coded speeds maps legend */}
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[8px] sm:text-[9px] font-mono text-gray-400 pt-1.5">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-1 rounded bg-cyan-400" /> {`> 240 km/h`}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-1 rounded bg-blue-500" /> 160 - 240 km/h
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-1 rounded bg-red-500 border border-red-400" /> Brake Zones
                </span>
              </div>
              <p className="text-[9px] font-mono text-gray-500 mt-1 leading-normal">
                {circuitView === '3d' 
                  ? "Elevated lines indicate section height (Z). Ground shadow and support columns show topographical changes." 
                  : "Flat projection map scaled onto reference coordinates (X, Y)."}
              </p>
            </div>

            {/* Dynamic SVG Map Canvas with Coordinate scale interpolation */}
            <div className="relative my-6 max-h-[360px] aspect-square w-full mx-auto bg-[#080b12] rounded-xl border border-[#161c2c] overflow-hidden flex items-center justify-center">
              {telemetryLogs.length === 0 ? (
                <div className="space-y-2 text-center text-gray-400 font-mono text-[10px]">
                  <RefreshCw className="animate-spin mx-auto text-neutral-400" size={18} />
                  <p className="uppercase">Generating circuit telemetry map...</p>
                </div>
              ) : (
                <svg viewBox="0 0 500 500" className="w-full h-full max-w-[340px] max-h-[340px] transform rotate-180 scale-x-[-1]">
                  {/* Underneath reference ground track shadow loop (flat foot-print) */}
                  {circuitView === '3d' && (
                    <path
                      d={telemetryLogs.map((pt, idx) => {
                        const x = scaleX(pt.X);
                        const y = scaleY(pt.Y);
                        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                      strokeOpacity="0.6"
                    />
                  )}

                  {/* Vertical structural pillars linking flat floor to active altitudes */}
                  {circuitView === '3d' && (() => {
                    const getZHeight = (z: number) => {
                      if (typeof z !== 'number') return 0;
                      return ((z - minZ) / (maxZ - minZ || 1)) * 30;
                    };
                    return telemetryLogs.map((pt, idx) => {
                      if (idx % 8 !== 0) return null;
                      const x = scaleX(pt.X);
                      const yGround = scaleY(pt.Y);
                      const yElevated = yGround - getZHeight(pt.Z);
                      return (
                        <line
                          key={`pillar-${idx}`}
                          x1={x}
                          y1={yGround}
                          x2={x}
                          y2={yElevated}
                          stroke="#334155"
                          strokeOpacity="0.4"
                          strokeWidth="1"
                        />
                      );
                    });
                  })()}

                  {/* Draw coordinate colored speed bands lines segment by segment */}
                  {telemetryLogs.map((pt, idx) => {
                    if (idx === telemetryLogs.length - 1) return null;
                    const nextPt = telemetryLogs[idx + 1];
                    
                    const getZHeight = (z: number) => {
                      if (typeof z !== 'number') return 0;
                      return ((z - minZ) / (maxZ - minZ || 1)) * 30;
                    };

                    const zOffset = circuitView === '3d' ? getZHeight(pt.Z) : 0;
                    const nextZOffset = circuitView === '3d' ? getZHeight(nextPt.Z) : 0;

                    const x1 = scaleX(pt.X);
                    const y1 = scaleY(pt.Y) - zOffset;
                    const x2 = scaleX(nextPt.X);
                    const y2 = scaleY(nextPt.Y) - nextZOffset;
                    
                    let color = '#2563eb'; // standard pace (blue)
                    if (pt.Brake === true || pt.Brake === 'True' || pt.Brake === 1) {
                      color = '#ef4444'; // Heavy braking zone
                    } else if (pt.Speed > 240) {
                      color = '#22d3ee'; // Top velocity cyan pace
                    } else if (pt.Speed >= 160) {
                      color = '#3b82f6'; // Average high-speed blue
                    }

                    return (
                      <line
                        key={idx}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={color}
                        strokeWidth={activeTelemetryIndex === idx ? 8 : 5}
                        strokeLinecap="round"
                        className="transition-all duration-150 cursor-pointer hover:stroke-white"
                        onClick={() => setActiveTelemetryIndex(idx)}
                        onMouseEnter={() => setActiveTrackHoverIndex(idx)}
                        onMouseLeave={() => setActiveTrackHoverIndex(null)}
                      />
                    );
                  })}

                  {/* Current Car visual location position locator point */}
                  {(() => {
                    const activePt = telemetryLogs[activeTelemetryIndex];
                    if (!activePt) return null;
                    
                    const getZHeight = (z: number) => {
                      if (typeof z !== 'number') return 0;
                      return ((z - minZ) / (maxZ - minZ || 1)) * 30;
                    };

                    const ax = scaleX(activePt.X);
                    const ay = scaleY(activePt.Y) - (circuitView === '3d' ? getZHeight(activePt.Z) : 0);
                    return (
                      <g>
                        <circle cx={ax} cy={ay} r={12} fill="rgb(239, 68, 68)" fillOpacity="0.25" className="animate-ping" />
                        <circle cx={ax} cy={ay} r={8} stroke="#ffffff" strokeWidth={1.5} fill="#ef4444" />
                        <circle cx={ax} cy={ay} r={3} fill="#ffffff" />
                      </g>
                    );
                  })()}
                </svg>
              )}

            </div>
          </div>

          {/* New Dedicated Specific Section: Track Intel Panel */}
            <div className="bg-[#0c101b] border border-[#1e2638] rounded-2xl p-5 text-white space-y-4 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,_rgba(239,68,68,0.03),_transparent_50%)] pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-[#1c2235] pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </div>
                  <h3 className="text-xs font-black tracking-widest font-mono text-gray-300 uppercase">TELEMETRY TRACK INTEL</h3>
                </div>
                <span className="text-[9px] text-[#22d3ee] bg-[#22d3ee]/10 px-2 py-0.5 rounded font-mono font-bold tracking-tight uppercase animate-pulse">
                  Active Live Telemetry
                </span>
              </div>

              {/* Grid Layout of HUD Gauges & Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#080b12] border border-[#1a2133] rounded-xl p-3 space-y-1">
                  <span className="block text-[8px] font-mono text-gray-400 uppercase tracking-wider">VEHICLE SPEED</span>
                  <div className="text-xl font-black font-mono text-cyan-400">
                    {(typeof currentPt.Speed === 'number' ? currentPt.Speed : parseFloat(currentPt.Speed || 0)).toFixed(1)} <span className="text-[9px] text-gray-500">km/h</span>
                  </div>
                  <div className="w-full bg-[#171f33] h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-cyan-400 h-full transition-all duration-150" 
                      style={{ width: `${Math.min(100, ((currentPt.Speed || 0) / 340) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-[#080b12] border border-[#1a2133] rounded-xl p-3 space-y-1">
                  <span className="block text-[8px] font-mono text-gray-400 uppercase tracking-wider">THROTTLE INPUT</span>
                  <div className="text-xl font-black font-mono text-amber-500">
                    {Number(currentPt.Throttle || 0).toFixed(0)}<span className="text-[9px] text-gray-500">%</span>
                  </div>
                  <div className="w-full bg-[#171f33] h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full transition-all duration-150" 
                      style={{ width: `${Number(currentPt.Throttle || 0)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-[#080b12] border border-[#1a2133] rounded-xl p-3 space-y-1">
                  <span className="block text-[8px] font-mono text-gray-400 uppercase tracking-wider">BRAKE ZONE STATUS</span>
                  <div className={`text-xs font-black font-mono mt-1 ${
                    (currentPt.Brake === true || currentPt.Brake === 'True' || currentPt.Brake === 1) ? 'text-red-500 animate-pulse' : 'text-gray-500'
                  }`}>
                    {(currentPt.Brake === true || currentPt.Brake === 'True' || currentPt.Brake === 1) ? 'DEPRESSED [ON]' : 'RELEASED [OFF]'}
                  </div>
                  <div className="w-full bg-[#171f33] h-1 mt-1 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-150 ${(currentPt.Brake === true || currentPt.Brake === 'True' || currentPt.Brake === 1) ? 'bg-red-500 w-full' : 'bg-transparent w-0'}`}
                    />
                  </div>
                </div>

                <div className="bg-[#080b12] border border-[#1a2133] rounded-xl p-3 space-y-1">
                  <span className="block text-[8px] font-mono text-gray-400 uppercase tracking-wider">ACTIVE SEAMLESS GEAR</span>
                  <div className="text-xl font-black font-mono text-red-500 text-[#f33] flex items-center gap-1">
                    <span>G{currentPt.nGear || 1}</span>
                    <span className="text-[8px] text-gray-500 uppercase tracking-tight">Active</span>
                  </div>
                </div>

                <div className="bg-[#080b12] border border-[#1a2133] rounded-xl p-3 space-y-1">
                  <span className="block text-[8px] font-mono text-gray-400 uppercase tracking-wider">ENGINE REVS (RPM)</span>
                  <div className="text-sm font-black font-mono text-orange-400">
                    {Math.round(currentPt.RPM || 0).toLocaleString()} <span className="text-[8px] text-gray-500">rpm</span>
                  </div>
                  <div className="w-full bg-[#171f33] h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-orange-400 h-full transition-all duration-150" 
                      style={{ width: `${Math.min(100, ((currentPt.RPM || 0) / 15000) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-[#080b12] border border-[#1a2133] rounded-xl p-3 space-y-1">
                  <span className="block text-[8px] font-mono text-gray-400 uppercase tracking-wider">ALTITUDE ELEVATION (Z)</span>
                  <div className="text-base font-black font-mono text-emerald-400">
                    {currentPt.Z ? `${currentPt.Z.toFixed(1)}m` : '0.0m'}
                  </div>
                </div>
              </div>

              {/* Geographic status sub-footer details */}
              <div className="grid grid-cols-2 gap-3 text-center border-t border-[#1c2235] pt-3 text-[10px] font-mono text-gray-400">
                <div className="bg-[#080b12]/50 p-2 rounded-lg text-left">
                  <span className="block text-[8px] text-gray-600">DISTANCE SECURED</span>
                  <span className="text-neutral-250 font-bold">{currentPt.Distance ? currentPt.Distance.toFixed(1) : '0.0'} m</span>
                </div>
                <div className="bg-[#080b12]/50 p-2 rounded-lg text-left">
                  <span className="block text-[8px] text-gray-600">SECTOR INDEX PROGRESSION</span>
                  <span className="text-neutral-250 font-bold">{((activeTelemetryIndex / (activeTelemetryPoints.length || 1)) * 100).toFixed(1)} %</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Telemetry Charts Traces & Inputs */}
          <div className="lg:col-span-7 bg-[#0c101b] border border-[#1e2638] rounded-2xl p-6 text-white flex flex-col justify-between shadow-2xl space-y-6">
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-black tracking-widest font-mono text-gray-400 uppercase">TELEMETRY TRACES</h3>
                  <p className="text-[10px] text-gray-500 font-mono">Coordinate index scrub timeline syncing live positions.</p>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-neutral-900/60 border border-neutral-800 rounded font-mono text-[8px] text-emerald-400 uppercase tracking-widest font-bold">
                    Live Timeline Interlocked
                  </span>
                </div>
              </div>

              {/* Timeline Interactive scrub slider */}
              <div className="bg-[#0b0e17] border border-[#1a2133] p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                  <span className="flex items-center gap-1">
                    <Timer size={11} className="text-[#f33]" />
                    Time Delta: <span className="text-cyan-400 font-bold">
                      {activeTelemetryPoints.length > 0 
                        ? String(currentPt.Time || '0.000s').replace(/^0 days 00:00:|^0 days 00:/, '') 
                        : '0.000s'}
                    </span>
                  </span>
                  <span>
                    Scrub: <span className="text-white font-bold">{activeTelemetryIndex + 1}</span> / {activeTelemetryPoints.length} frames
                  </span>
                </div>

                {/* HTML Standard range slider interlocked cleanly */}
                <div className="relative group pt-1">
                  <input
                    type="range"
                    min={0}
                    max={activeTelemetryPoints.length ? activeTelemetryPoints.length - 1 : 100}
                    value={activeTelemetryIndex}
                    onChange={(e) => {
                      setActiveTelemetryIndex(Number(e.target.value));
                      setIsTelemetryPlaying(false);
                    }}
                    className="w-full h-1.5 bg-[#171f33] rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-650"
                  />
                  
                  {/* Highlight benchmarks labels */}
                  <div className="flex justify-between text-[8px] font-mono text-gray-500 pt-1 border-t border-[#182035]/30 mt-1">
                    <span>START (T14 EXIT)</span>
                    <span>SECTOR 1 (T2)</span>
                    <span>HAIRPIN (T10)</span>
                    <span>BACKSTRAIGHT (T13)</span>
                    <span>LINE (T14)</span>
                  </div>
                </div>

                {/* Timeline scrubbing play player buttons */}
                <div className="flex items-center justify-between pt-1 border-t border-[#1a2133] mt-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setActiveTelemetryIndex(0);
                      }}
                      title="Rewind Lap"
                      className="p-1 px-2.5 rounded bg-neutral-900 border border-neutral-800 text-xs hover:border-gray-500 transition cursor-pointer flex items-center gap-1 font-mono text-[9px] text-gray-300"
                    >
                      <SkipBack size={10} />
                      <span>RESTART</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTelemetryIndex(prev => Math.max(0, prev - 1));
                      }}
                      title="Step Back"
                      className="p-1 px-1.5 rounded bg-neutral-900 border border-neutral-800 text-xs hover:border-gray-500 transition cursor-pointer"
                    >
                      <SkipBack size={9} />
                    </button>
                  </div>

                  <button
                    onClick={() => setIsTelemetryPlaying(!isTelemetryPlaying)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-mono text-[10px] font-black tracking-widest uppercase transition-all cursor-pointer ${
                      isTelemetryPlaying 
                        ? 'bg-amber-600/20 border border-amber-600 text-amber-400' 
                        : 'bg-red-800/20 border border-red-700 text-red-400 hover:bg-red-700 hover:text-white'
                    }`}
                  >
                    {isTelemetryPlaying ? (
                      <>
                        <Pause size={10} fill="currentColor" />
                        <span>PAUSE</span>
                      </>
                    ) : (
                      <>
                        <Play size={10} fill="currentColor" />
                        <span>PLAY STREAM</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setActiveTelemetryIndex(prev => Math.min(activeTelemetryPoints.length - 1, prev + 1));
                      }}
                      title="Step Forward"
                      className="p-1 px-1.5 rounded bg-neutral-900 border border-neutral-800 text-xs hover:border-gray-500 transition cursor-pointer"
                    >
                      <SkipForward size={9} />
                    </button>
                    <span className="text-[8px] font-mono text-gray-600 italic">10Hz Sampling</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphic Charts block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Visual Trace A: Velocity Plot */}
              <div className="bg-[#0b0e17] border border-[#1a2133] rounded-xl p-4 space-y-1">
                <span className="block text-[8px] font-black tracking-wider text-gray-400 font-mono uppercase">VELOCITY INDEX & GEAR SELECT</span>
                <div className="relative h-[110px] bg-[#07090f] rounded-lg border border-[#151a29] overflow-hidden">
                  
                  {/* SVG Speed waveform line plot */}
                  <svg
                    viewBox="0 0 360 100"
                    className="w-full h-full cursor-crosshair"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const pct = Math.max(0, Math.min(1, clickX / rect.width));
                      setActiveTelemetryIndex(Math.round(pct * (activeTelemetryPoints.length - 1)));
                      setIsTelemetryPlaying(false);
                    }}
                  >
                    {/* Grid lines */}
                    <line x1={0} y1={25} x2={360} y2={25} stroke="#1b2133" strokeDasharray="2,2" />
                    <line x1={0} y1={50} x2={360} y2={50} stroke="#1b2133" strokeDasharray="2,2" />
                    <line x1={0} y1={75} x2={360} y2={75} stroke="#1b2133" strokeDasharray="2,2" />
                    
                    {/* Speed path line */}
                    {(() => {
                      if (activeTelemetryPoints.length < 2) return null;
                      const pointsStr = activeTelemetryPoints.map((pt, idx) => {
                        const cx = (idx / (activeTelemetryPoints.length - 1)) * 360;
                        const cy = 90 - (pt.Speed / 350) * 80;
                        return `${cx.toFixed(1)},${cy.toFixed(1)}`;
                      }).join(' L ');
                      return (
                        <path
                           d={`M ${pointsStr}`}
                          fill="none"
                          stroke="#06b6d4"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      );
                    })()}

                    {/* Current telemetry index vertical marker */}
                    {activeTelemetryPoints.length > 0 && (() => {
                      const mx = (activeTelemetryIndex / (activeTelemetryPoints.length - 1)) * 360;
                      const activeS = currentPt.Speed || 0;
                      const my = 90 - (activeS / 350) * 80;
                      return (
                        <g>
                          <line x1={mx} y1={0} x2={mx} y2={100} stroke="#f33" strokeWidth="1.5" strokeDasharray="3,3" />
                          <circle cx={mx} cy={my} r={4.5} fill="#ef4444" className="animate-ping" />
                          <circle cx={mx} cy={my} r={3} fill="#ef4444" stroke="#ffffff" strokeWidth={1} />
                        </g>
                      );
                    })()}
                  </svg>

                  {/* Chart axis label legends */}
                  <div className="absolute top-1 right-2 text-[7px] font-mono text-[#06b6d4] flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]" /> Speed (km/h)
                  </div>
                </div>
              </div>

              {/* Visual Trace B: Pedal Input trace */}
              <div className="bg-[#0b0e17] border border-[#1a2133] rounded-xl p-4 space-y-1">
                <span className="block text-[8px] font-black tracking-wider text-gray-400 font-mono uppercase">TELEMETRY PEDAL INPUT TRACES</span>
                <div className="relative h-[110px] bg-[#07090f] rounded-lg border border-[#151a29] overflow-hidden">
                  
                  {/* SVG throttle/brake lines */}
                  <svg
                    viewBox="0 0 360 100"
                    className="w-full h-full cursor-crosshair"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const pct = Math.max(0, Math.min(1, clickX / rect.width));
                      setActiveTelemetryIndex(Math.round(pct * (activeTelemetryPoints.length - 1)));
                      setIsTelemetryPlaying(false);
                    }}
                  >
                    {/* Grid lines */}
                    <line x1={0} y1={50} x2={360} y2={50} stroke="#1b2133" strokeDasharray="2,2" />
                    
                    {/* Brake segments shaded regions in crimson backgrounds */}
                    {activeTelemetryPoints.map((pt, idx) => {
                      if (pt.Brake !== true && pt.Brake !== 'True' && pt.Brake !== 1) return null;
                      const x = (idx / (activeTelemetryPoints.length - 1)) * 360;
                      const width = 360 / (activeTelemetryPoints.length - 1);
                      return (
                        <rect
                          key={idx}
                          x={x}
                          y={0}
                          width={width + 0.5}
                          height={100}
                          fill="#ef4444"
                          fillOpacity={0.16}
                          stroke="none"
                        />
                      );
                    })}

                    {/* Throttle filled graph curve */}
                    {(() => {
                      if (activeTelemetryPoints.length < 2) return null;
                      const pointsStr = activeTelemetryPoints.map((pt, idx) => {
                        const cx = (idx / (activeTelemetryPoints.length - 1)) * 360;
                        const cy = 90 - (pt.Throttle / 100) * 80;
                        return `${cx.toFixed(1)},${cy.toFixed(1)}`;
                      }).join(' L ');
                      return (
                        <g>
                          <path
                            d={`M 0,90 L ${pointsStr} L 360,90 Z`}
                            fill="rgba(245, 158, 11, 0.1)"
                            stroke="none"
                          />
                          <path
                            d={`M ${pointsStr}`}
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                        </g>
                      );
                    })()}

                    {/* Current index indicator */}
                    {activeTelemetryPoints.length > 0 && (() => {
                      const mx = (activeTelemetryIndex / (activeTelemetryPoints.length - 1)) * 360;
                      const activeT = currentPt.Throttle || 0;
                      const my = 90 - (activeT / 100) * 80;
                      return (
                        <g>
                          <line x1={mx} y1={0} x2={mx} y2={100} stroke="#f33" strokeWidth="1.5" strokeDasharray="3,3" />
                          <circle cx={mx} cy={my} r={3} fill="#f59e0b" />
                        </g>
                      );
                    })()}
                  </svg>

                  {/* Legends for inputs */}
                  <div className="absolute top-1 right-2 text-[7px] font-mono flex items-center gap-3">
                    <span className="flex items-center gap-1 font-bold text-amber-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Throttle (%)
                    </span>
                    <span className="flex items-center gap-1 font-bold text-red-500/80">
                      <span className="w-1.5 h-1.5 rounded bg-red-600/30" /> Brake Active
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Dynamic Drag-and-drop CSV system box */}
            <div className="border-t border-[#1c2235] pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Database size={13} className="text-gray-400 shrink-0" />
                <div>
                  <span className="block text-[8px] font-mono text-gray-500 uppercase">ACTIVE CONFIGURATION DATASETS</span>
                  <span className="block text-[10px] font-mono text-emerald-400 font-extrabold">
                    ✔ Embedded Lewis Hamilton 2026 Ferrari Canada Lap Data
                  </span>
                </div>
              </div>

              {/* Drop CSV loader or Manual Trigger */}
              <div className="relative">
                <input
                  type="file"
                  id="csv-telemetry-file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const text = event.target?.result as string;
                      if (text.includes('LapTime') || text.includes('LapNumber')) {
                        const parsed = localParseCSV(text);
                        if (parsed.length > 0) {
                          setLapLogs(parsed);
                          setCsvUploadError(null);
                        } else {
                          setCsvUploadError("Invalid Lap timing format.");
                        }
                      } else if (text.includes('RPM') || text.includes('Speed') || text.includes('X')) {
                        const parsed = localParseCSV(text);
                        if (parsed.length > 0) {
                          setTelemetryLogs(parsed);
                          setActiveTelemetryIndex(0);
                          setCsvUploadError(null);
                        } else {
                          setCsvUploadError("Invalid Coordinate format.");
                        }
                      } else {
                        setCsvUploadError("Unrecognized format. Needs LapTime or Coordinate columns.");
                      }
                    };
                    reader.readAsText(file);
                  }}
                  className="hidden"
                />
                
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="csv-telemetry-file"
                    className="cursor-pointer bg-neutral-900 border border-neutral-750 hover:border-gray-400 px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-wider flex items-center gap-1.5 transition text-gray-300 hover:text-white"
                  >
                    <Upload size={10} />
                    <span>Upload Custom F1 Telemetry CSV</span>
                  </label>

                  {csvUploadError && (
                    <span className="text-[9px] font-mono text-red-500 animate-pulse">{csvUploadError}</span>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Historical timings sheet logs matching the custom style */}
        <div className="bg-white border border-gray-150 rounded-2xl p-6 space-y-4 shadow-sm select-none">
          <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="inline-block bg-purple-50 text-purple-750 px-2 py-0.5 rounded font-mono font-extrabold uppercase text-[9px] tracking-wider">
                TIMING SHEETS DATASET
              </span>
              <h3 className="text-sm font-black text-black leading-tight">Historical FP2 Laps Chronology</h3>
              <p className="text-[11px] text-gray-400 font-mono">Click on any lap row to inspect sector splits and tire compounds.</p>
            </div>

            <div className="font-mono text-[10px] text-gray-500 bg-neutral-50 px-3 py-1.5 rounded-lg border border-gray-200">
              Total Laps Loaded: <span className="text-black font-extrabold">{lapLogs.length}</span>
            </div>
          </div>

          {/* Timings log table structure */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-neutral-50 border-b border-gray-150 text-[10px] text-gray-500 font-extrabold uppercase tracking-wide">
                  <th className="p-3">POS</th>
                  <th className="p-3">LAP NO</th>
                  <th className="p-3">LAP TIME</th>
                  <th className="p-3">SECTOR 1</th>
                  <th className="p-3">SECTOR 2</th>
                  <th className="p-3">SECTOR 3</th>
                  <th className="p-3">TYRE COMPOUND</th>
                  <th className="p-3">STINT</th>
                  <th className="p-3">MAX FL SPEED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium whitespace-nowrap">
                {lapLogs.map((lap, i) => {
                  const isSelected = selectedAnalysisLap === lap.LapNumber;
                  const curLapSec = parseTimeSeconds(lap.LapTime);
                  const curS1Sec = parseTimeSeconds(lap.Sector1Time);
                  const curS2Sec = parseTimeSeconds(lap.Sector2Time);
                  const curS3Sec = parseTimeSeconds(lap.Sector3Time);

                  const isFastestLap = curLapSec > 0 && curLapSec === fastestLapTimeInSession;
                  const isFastestS1 = curS1Sec > 0 && curS1Sec === fastestS1InSession;
                  const isFastestS2 = curS2Sec > 0 && curS2Sec === fastestS2InSession;
                  const isFastestS3 = curS3Sec > 0 && curS3Sec === fastestS3InSession;

                  return (
                    <tr 
                      key={i} 
                      className={`transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-purple-50/20 font-black border-l-4 border-l-purple-600' 
                          : 'hover:bg-neutral-50'
                      }`}
                      onClick={() => setSelectedAnalysisLap(lap.LapNumber)}
                    >
                      <td className="p-3 text-gray-400 font-bold">{i + 1}</td>
                      <td className="p-3 text-black">LAP {lap.LapNumber}</td>
                      <td className="p-3">
                        {isFastestLap ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-purple-100 text-purple-700 font-extrabold font-mono text-[10px] border border-purple-200">
                            ⚡ {formatLapTime(lap.LapTime)}
                          </span>
                        ) : (
                          <span className="font-extrabold text-gray-800 font-mono">
                            {formatLapTime(lap.LapTime)}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {isFastestS1 ? (
                          <span className="px-1.5 py-0.5 rounded bg-purple-100/50 text-purple-700 font-extrabold font-mono text-[10px] border border-purple-200">
                            {formatSectorTime(lap.Sector1Time)}
                          </span>
                        ) : (
                          <span className="text-gray-600 font-mono">
                            {formatSectorTime(lap.Sector1Time)}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {isFastestS2 ? (
                          <span className="px-1.5 py-0.5 rounded bg-purple-100/50 text-purple-700 font-extrabold font-mono text-[10px] border border-purple-200">
                            {formatSectorTime(lap.Sector2Time)}
                          </span>
                        ) : (
                          <span className="text-gray-600 font-mono">
                            {formatSectorTime(lap.Sector2Time)}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {isFastestS3 ? (
                          <span className="px-1.5 py-0.5 rounded bg-purple-100/50 text-purple-700 font-extrabold font-mono text-[10px] border border-purple-200">
                            {formatSectorTime(lap.Sector3Time)}
                          </span>
                        ) : (
                          <span className="text-gray-600 font-mono">
                            {formatSectorTime(lap.Sector3Time)}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-black uppercase inline-block border ${
                          lap.Compound === 'SOFT' 
                            ? 'bg-red-50 border-red-200 text-red-650'
                            : lap.Compound === 'MEDIUM'
                            ? 'bg-amber-50 border-amber-200 text-amber-650'
                            : 'bg-white border-gray-200 text-gray-650'
                        }`}>
                          {lap.Compound}
                        </span>
                      </td>
                      <td className="p-3 text-gray-400 font-mono text-[11px]">{lap.Stint || 1} STINT</td>
                      <td className="p-3 text-gray-700 font-bold font-mono">{Number(lap.SpeedFL || 294).toFixed(1)} km/h</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Selected segment insights */}
          <div className="bg-neutral-950 text-white rounded-xl p-5 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-red-500 font-black uppercase tracking-wider">
                SPLITS TARGET SUMMARY
              </span>
              <h4 className="text-sm font-black text-white">
                Focused Lap Summary: Lap {selectedAnalysisLap} ({lapLogs.find(l=>l.LapNumber===selectedAnalysisLap)?.Compound || 'SOFT'})
              </h4>
              <p className="text-xs text-neutral-400 max-w-xl">
                Observing {telSelDriver}'s vehicle telemetry characteristics. Tyre life indicates a wear level in Stint {lapLogs.find(l=>l.LapNumber===selectedAnalysisLap)?.Stint || 1} with maximum straightline speeds matching high downforce aerodynamic packages.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-xs font-mono justify-end">
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-2 px-3 text-center">
                <span className="block text-[8px] text-gray-400">SECTOR 1</span>
                <span className="font-extrabold text-[#06b6d4]">
                  {formatSectorTime(lapLogs.find(l=>l.LapNumber===selectedAnalysisLap)?.Sector1Time)}
                </span>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-2 px-3 text-center">
                <span className="block text-[8px] text-gray-400">SECTOR 2</span>
                <span className="font-extrabold text-[#f59e0b]">
                  {formatSectorTime(lapLogs.find(l=>l.LapNumber===selectedAnalysisLap)?.Sector2Time)}
                </span>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-2 px-3 text-center">
                <span className="block text-[8px] text-gray-400">SECTOR 3</span>
                <span className="font-extrabold text-red-500">
                  {formatSectorTime(lapLogs.find(l=>l.LapNumber===selectedAnalysisLap)?.Sector3Time)}
                </span>
              </div>
            </div>
          </div>
          </div>
          </>
        )}
      </div>
    );
  };

  const fetchOf1Telemetry = async () => {
    setOf1Loading(true);
    setOf1Error(null);
    try {
      const url = `/api/openf1/telemetry-compare?year=${of1Year}&grandPrix=${encodeURIComponent(of1Gp)}&session=${encodeURIComponent(of1Session)}&driver1=${of1Driver1}&driver2=${of1Driver2}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP Session error ${res.status}`);
      const payload = await res.json();
      setOf1Data(payload);

      if (payload) {
        if (payload.driver1Laps && payload.driver1Laps.length > 0) {
          setOf1Driver1Laps(payload.driver1Laps);
        } else {
          setOf1Driver1Laps(getSimulatedLapsList(of1Driver1, 20));
        }

        if (payload.driver2Laps && payload.driver2Laps.length > 0) {
          setOf1Driver2Laps(payload.driver2Laps);
        } else {
          setOf1Driver2Laps(getSimulatedLapsList(of1Driver2, 20));
        }
      }
    } catch (err: any) {
      console.error(err);
      setOf1Error("Unable to retrieve synchronized OpenF1 timing data telemetry streams.");
    } finally {
      setOf1Loading(false);
    }
  };

  // 1. Load dynamic session list based on chosen of1Year
  useEffect(() => {
    let active = true;
    async function loadSessions() {
      setLoadingOf1Sessions(true);

      if (of1Year >= 2025) {
        // High fidelity mock database resolution instantly for 2025 and 2026 seasons without unnecessary slow network calls
        const mocked = getMockOf1Sessions(of1Year);
        setOf1SessionsList(mocked);
        
        const uniqueGpsMap: Record<string, any> = {};
        mocked.forEach(s => {
          if (!uniqueGpsMap[s.location]) {
            uniqueGpsMap[s.location] = {
              location: s.location,
              country_name: s.country_name
            };
          }
        });
        const gpList = Object.values(uniqueGpsMap);
        setOf1Gps(gpList);
        
        if (gpList.length > 0) {
          const hasExisting = gpList.some(g => g.location === of1Gp);
          if (!hasExisting) {
            setOf1Gp(gpList[0].location);
          }
        }
        setLoadingOf1Sessions(false);
        return;
      }

      try {
        const response = await fetch(`/api/openf1/sessions?year=${of1Year}`);
        if (!response.ok) throw new Error("API fail");
        const data = await response.json();
        
        if (!active) return;
        
        if (Array.isArray(data) && data.length > 0) {
          setOf1SessionsList(data);
          
          const uniqueGpsMap: Record<string, any> = {};
          data.forEach(s => {
            const locName = s.location || s.country_name || "Unknown";
            if (!uniqueGpsMap[locName]) {
              uniqueGpsMap[locName] = {
                location: locName,
                country_name: s.country_name || locName
              };
            }
          });
          const gpList = Object.values(uniqueGpsMap);
          setOf1Gps(gpList);
          
          if (gpList.length > 0) {
            const hasExisting = gpList.some(g => g.location === of1Gp);
            if (!hasExisting) {
              setOf1Gp(gpList[0].location);
            }
          }
        } else {
          const mocked = getMockOf1Sessions(of1Year);
          setOf1SessionsList(mocked);
          
          const uniqueGpsMap: Record<string, any> = {};
          mocked.forEach(s => {
            if (!uniqueGpsMap[s.location]) {
              uniqueGpsMap[s.location] = {
                location: s.location,
                country_name: s.country_name
              };
            }
          });
          const gpList = Object.values(uniqueGpsMap);
          setOf1Gps(gpList);
          
          if (gpList.length > 0) {
            const hasExisting = gpList.some(g => g.location === of1Gp);
            if (!hasExisting) {
              setOf1Gp(gpList[0].location);
            }
          }
        }
      } catch (err) {
        if (!active) return;
        const mocked = getMockOf1Sessions(of1Year);
        setOf1SessionsList(mocked);
        
        const uniqueGpsMap: Record<string, any> = {};
        mocked.forEach(s => {
          if (!uniqueGpsMap[s.location]) {
            uniqueGpsMap[s.location] = {
              location: s.location,
              country_name: s.country_name
            };
          }
        });
        const gpList = Object.values(uniqueGpsMap);
        setOf1Gps(gpList);
        
        if (gpList.length > 0) {
          const hasExisting = gpList.some(g => g.location === of1Gp);
          if (!hasExisting) {
            setOf1Gp(gpList[0].location);
          }
        }
      } finally {
        if (active) setLoadingOf1Sessions(false);
      }
    }
    
    if (activeSubTab === 'openf1') {
      loadSessions();
    }
    return () => { active = false; };
  }, [of1Year, activeSubTab]);

  // 2. Cascade sessions when selected GP changes
  useEffect(() => {
    if (!of1Gp || of1SessionsList.length === 0) {
      setOf1SessionsForGp([]);
      return;
    }
    
    const filtered = of1SessionsList.filter(s => s.location === of1Gp);
    setOf1SessionsForGp(filtered);
    
    if (filtered.length > 0) {
      const hasExisting = filtered.some(s => s.session_name === of1Session);
      const targetSession = hasExisting ? of1Session : filtered[0].session_name;
      setOf1Session(targetSession);
      
      const matched = filtered.find(s => s.session_name === targetSession) || filtered[0];
      setOf1SessionKey(String(matched.session_key));
    } else {
      setOf1SessionKey("");
    }
  }, [of1Gp, of1SessionsList]);

  // 3. Cascade load drivers based on session key
  useEffect(() => {
    if (!of1SessionKey) {
      setOf1DriversList([]);
      return;
    }
    
    let active = true;
    async function loadDrivers() {
      setLoadingOf1Drivers(true);
      try {
        const response = await fetch(`/api/openf1/drivers?session_key=${of1SessionKey}`);
        if (!response.ok) throw new Error("API fail");
        const data = await response.json();
        
        if (!active) return;
        
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((d: any) => ({
            number: d.driver_number,
            name: d.full_name,
            code: d.name_acronym || d.code || `#${d.driver_number}`,
            team: d.team_name
          }));
          
          const seen = new Set();
          const uniqueDrivers = mapped.filter((d: any) => {
            if (seen.has(d.number)) return false;
            seen.add(d.number);
            return true;
          });
          
          setOf1DriversList(uniqueDrivers);
          
          if (uniqueDrivers.length > 0) {
            const d1Exists = uniqueDrivers.some((d: any) => d.number === of1Driver1);
            const d2Exists = uniqueDrivers.some((d: any) => d.number === of1Driver2);
            
            if (!d1Exists) {
              setOf1Driver1(uniqueDrivers[0].number);
            }
            if (!d2Exists) {
              setOf1Driver2(uniqueDrivers[Math.min(1, uniqueDrivers.length - 1)].number);
            }
          }
        } else {
          setOf1DriversList(POPULAR_OF1_DRIVERS);
        }
      } catch (err) {
        if (!active) return;
        setOf1DriversList(POPULAR_OF1_DRIVERS);
      } finally {
        if (active) setLoadingOf1Drivers(false);
      }
    }
    
    loadDrivers();
    return () => { active = false; };
  }, [of1SessionKey]);

  // Direct raw load of lap durations from F1 OpenF1 API (for Driver A and B) as requested
  useEffect(() => {
    if (!of1SessionKey || activeSubTab !== 'openf1') return;
    
    let active = true;
    async function fetchIndividualLaps() {
      // 1. Fetch Driver 1 Laps
      try {
        const d1Key = Number(of1SessionKey);
        if (d1Key > 20000) { // Indicates simulation session keys
          if (active) setOf1Driver1Laps(getSimulatedLapsList(of1Driver1, 20));
        } else {
          const url1 = `/api/openf1/laps?session_key=${of1SessionKey}&driver_number=${of1Driver1}`;
          const response1 = await fetch(url1);
          if (response1.ok) {
            const data1 = await response1.json();
            if (active) {
              if (Array.isArray(data1) && data1.length > 0) {
                setOf1Driver1Laps(data1);
              } else {
                setOf1Driver1Laps(getSimulatedLapsList(of1Driver1, 20));
              }
            }
          } else {
            if (active) setOf1Driver1Laps(getSimulatedLapsList(of1Driver1, 20));
          }
        }
      } catch (err) {
        if (active) setOf1Driver1Laps(getSimulatedLapsList(of1Driver1, 20));
      }

      // 2. Fetch Driver 2 Laps
      try {
        const d2Key = Number(of1SessionKey);
        if (d2Key > 20000) { // Indicates simulation session keys
          if (active) setOf1Driver2Laps(getSimulatedLapsList(of1Driver2, 20));
        } else {
          const url2 = `/api/openf1/laps?session_key=${of1SessionKey}&driver_number=${of1Driver2}`;
          const response2 = await fetch(url2);
          if (response2.ok) {
            const data2 = await response2.json();
            if (active) {
              if (Array.isArray(data2) && data2.length > 0) {
                setOf1Driver2Laps(data2);
              } else {
                setOf1Driver2Laps(getSimulatedLapsList(of1Driver2, 20));
              }
            }
          } else {
            if (active) setOf1Driver2Laps(getSimulatedLapsList(of1Driver2, 20));
          }
        }
      } catch (err) {
        if (active) setOf1Driver2Laps(getSimulatedLapsList(of1Driver2, 20));
      }
    }

    fetchIndividualLaps();
    return () => { active = false; };
  }, [of1SessionKey, of1Driver1, of1Driver2, activeSubTab]);

  // 4. Auto-trigger telemetry compare updates when active params modify
  useEffect(() => {
    if (activeSubTab === 'openf1' && of1Gp && of1Session) {
      fetchOf1Telemetry();
    }
  }, [activeSubTab, of1Year, of1Gp, of1Session, of1Driver1, of1Driver2]);

  // Currently selected race matching selectedRound
  const selectedRace = useMemo(() => {
    return completedRaces.find(r => r.round === selectedRound) || completedRaces[0] || races[0] || null;
  }, [completedRaces, races, selectedRound]);

  // Match currently checked drivers from the Roster Grid Filters to their acronym codes
  const selectedDriverCodes = useMemo(() => {
    return selectedDrivers.map(dId => {
      const ds = driverStandings.find(d => d.Driver.driverId === dId);
      return ds?.Driver?.code?.toUpperCase() || "";
    }).filter(Boolean);
  }, [selectedDrivers, driverStandings]);



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
  }, [chartDimensions]);  const trackPathData = useMemo(() => {
    if (!of1Data || !of1Data.d1Timeline || of1Data.d1Timeline.length === 0) return { path: "", points: [] };
    
    // Find limits
    const xs = of1Data.d1Timeline.map((p: any) => p.x).filter((x: any) => typeof x === 'number');
    const ys = of1Data.d1Timeline.map((p: any) => p.y).filter((y: any) => typeof y === 'number');
    
    if (xs.length === 0 || ys.length === 0) return { path: "", points: [] };
    
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    const dx = maxX - minX || 1;
    const dy = maxY - minY || 1;
    
    // Map with preserved aspect ratio inside a 360 x 180 rectangle
    const padding = 15;
    const width = 360;
    const height = 180;
    
    const scale = Math.min((width - 2*padding) / dx, (height - 2*padding) / dy);
    
    const mapped = of1Data.d1Timeline.map((pt: any) => {
      // Scale and center
      const x = padding + (pt.x - minX) * scale + (width - 2*padding - dx * scale) / 2;
      // Invert Y coordinate since SVG (0,0) is top-left
      const y = height - (padding + (pt.y - minY) * scale + (height - 2*padding - dy * scale) / 2);
      return { x, y, original: pt };
    });
    
    const path = mapped.length > 0 
      ? mapped.map((p: any, i: number) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'
      : '';
      
    return { path, points: mapped };
  }, [of1Data]);

  const speedPathData = useMemo(() => {
    if (!of1Data || !of1Data.d1Timeline || of1Data.d1Timeline.length === 0) return { d1: "", d2: "" };
    
    const d1Points = of1Data.d1Timeline.map((pt: any, i: number) => {
      const x = i * 4;
      const y = 120 - ((pt.speed || 0) / 360) * 110;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const d2Points = of1Data.d2Timeline ? of1Data.d2Timeline.map((pt: any, i: number) => {
      const x = i * 4;
      const y = 120 - ((pt.speed || 0) / 360) * 110;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ') : '';

    return { d1: d1Points, d2: d2Points };
  }, [of1Data]);

  const rpmPathData = useMemo(() => {
    if (!of1Data || !of1Data.d1Timeline || of1Data.d1Timeline.length === 0) return { d1: "", d2: "" };
    
    const d1Points = of1Data.d1Timeline.map((pt: any, i: number) => {
      const x = i * 4;
      const y = 120 - ((pt.rpm || 0) / 14000) * 110;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const d2Points = of1Data.d2Timeline ? of1Data.d2Timeline.map((pt: any, i: number) => {
      const x = i * 4;
      const y = 120 - ((pt.rpm || 0) / 14000) * 110;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ') : '';

    return { d1: d1Points, d2: d2Points };
  }, [of1Data]);

  const activeIndex = Math.min(99, Math.max(0, Math.round(scrubPercent)));
  const d1TelemetryCur = of1Data?.d1Timeline?.[activeIndex] || { speed: 0, rpm: 0, gear: 1, throttle: 0, brake: false };
  const d2TelemetryCur = of1Data?.d2Timeline?.[activeIndex] || { speed: 0, rpm: 0, gear: 1, throttle: 0, brake: false };

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

      {/* Sub-Tab Selector Button Bar */}
      <div className="flex border-b border-gray-200 gap-2 overflow-x-auto whitespace-nowrap scrollbar-none pb-px select-none">
        <button
          onClick={() => setActiveSubTab('openf1')}
          className={`flex items-center gap-2 px-6 py-3 font-mono font-bold text-xs uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'openf1'
              ? 'border-red-600 text-red-650'
              : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
          }`}
        >
          <Sliders size={14} className="text-red-500" />
          <span>F1 Telemetry & Lap Analyst</span>
        </button>
        <button
          onClick={() => setActiveSubTab('progression')}
          className={`flex items-center gap-2 px-6 py-3 font-mono font-bold text-xs uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'progression'
              ? 'border-red-650 text-red-650'
              : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
          }`}
        >
          <BarChart2 size={14} className="text-gray-400" />
          <span>Ergast Historic Laps</span>
        </button>
      </div>

      {activeSubTab === 'openf1' ? (
        renderTelemetryAnalyst()
      ) : (
        /* Historic Round progression tab using classic Ergast lap-by-lap info */
        <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
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
                  {completedRaces.map((race) => (
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
                <h3 className="text-lg font-black truncate max-w-xs sm:max-w-lg leading-tight animate-[fadeIn_0.5s]">
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
          <div className="bg-gray-50/50 border border-gray-150 rounded-2xl p-5 space-y-4 shadow-3xs">
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
              <div className="w-10 h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
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
        </div>
      )}
    </motion.div>
  );
}
