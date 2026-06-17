import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Compass, ExternalLink, Navigation, Search, SlidersHorizontal, Sun, CloudRain, Award, Activity } from 'lucide-react';
import { Race } from '../types';

const TRACK_DETAILS: Record<string, { length: string; laps: number; record: string; capacity: string; corners: number; path: string }> = {
  bahrain: {
    length: '5.412 km',
    laps: 57,
    record: '1:31.447 (P. de la Rosa)',
    capacity: '45,000',
    corners: 15,
    path: 'M 15,35 L 45,15 L 75,15 L 85,45 L 50,55 L 25,40 Z'
  },
  jeddah: {
    length: '6.174 km',
    laps: 50,
    record: '1:30.734 (L. Hamilton)',
    capacity: '40,000',
    corners: 27,
    path: 'M 20,10 L 35,25 L 50,15 L 65,35 L 75,20 L 80,55 L 35,45 Z'
  },
  albert_park: {
    length: '5.278 km',
    laps: 58,
    record: '1:20.260 (C. Leclerc)',
    capacity: '125,000',
    corners: 14,
    path: 'M 15,35 L 30,15 L 70,25 L 85,50 L 55,50 L 30,45 Z'
  },
  suzuka: {
    length: '5.807 km',
    laps: 53,
    record: '1:30.983 (L. Hamilton)',
    capacity: '155,000',
    corners: 18,
    path: 'M 15,35 Q 30,15 50,45 T 85,25 Q 70,55 45,35 Z'
  },
  miami: {
    length: '5.412 km',
    laps: 57,
    record: '1:29.708 (M. Verstappen)',
    capacity: '80,000',
    corners: 19,
    path: 'M 15,20 L 50,15 L 85,35 L 60,50 L 35,40 Z'
  },
  monaco: {
    length: '3.337 km',
    laps: 78,
    record: '1:12.909 (L. Hamilton)',
    capacity: '37,000',
    corners: 19,
    path: 'M 15,15 L 45,20 L 60,15 L 85,40 L 45,45 L 35,35 L 15,30 Z'
  },
  catalunya: {
    length: '4.657 km',
    laps: 66,
    record: '1:16.330 (M. Verstappen)',
    capacity: '140,000',
    corners: 14,
    path: 'M 15,25 L 45,15 L 85,25 L 75,45 L 45,50 L 25,40 Z'
  },
  red_bull_ring: {
    length: '4.318 km',
    laps: 71,
    record: '1:05.619 (C. Sainz)',
    capacity: '105,000',
    corners: 10,
    path: 'M 15,40 L 15,15 L 45,25 L 75,25 L 85,45 L 45,45 Z'
  },
  silverstone: {
    length: '5.891 km',
    laps: 52,
    record: '1:27.097 (M. Verstappen)',
    capacity: '150,000',
    corners: 18,
    path: 'M 20,20 L 50,15 L 80,25 L 75,45 L 50,50 L 35,40 L 15,35 Z'
  },
  hungaroring: {
    length: '4.381 km',
    laps: 70,
    record: '1:16.627 (L. Hamilton)',
    capacity: '70,000',
    corners: 14,
    path: 'M 15,30 L 45,15 L 75,30 L 75,45 L 45,50 L 25,45 Z'
  },
  spa: {
    length: '7.004 km',
    laps: 44,
    record: '1:46.286 (V. Bottas)',
    capacity: '70,000',
    corners: 19,
    path: 'M 15,15 L 65,25 L 85,45 L 55,55 L 35,40 Z'
  },
  zandvoort: {
    length: '4.259 km',
    laps: 72,
    record: '1:11.097 (L. Hamilton)',
    capacity: '105,000',
    corners: 14,
    path: 'M 15,35 L 45,15 L 75,30 L 65,50 L 35,45 Z'
  },
  monza: {
    length: '5.793 km',
    laps: 53,
    record: '1:21.046 (R. Barrichello)',
    capacity: '113,800',
    corners: 11,
    path: 'M 15,20 L 75,15 L 85,45 L 70,40 L 45,35 Z'
  },
  baku: {
    length: '6.003 km',
    laps: 51,
    record: '1:43.009 (C. Leclerc)',
    capacity: '30,000',
    corners: 20,
    path: 'M 15,15 L 75,15 L 75,45 L 45,45 L 15,35 Z'
  },
  marina_bay: {
    length: '4.940 km',
    laps: 62,
    record: '1:35.867 (L. Hamilton)',
    capacity: '90,000',
    corners: 19,
    path: 'M 15,15 L 75,15 L 80,45 L 45,50 L 20,40 Z'
  },
  americas: {
    length: '5.513 km',
    laps: 56,
    record: '1:36.169 (C. Leclerc)',
    capacity: '120,000',
    corners: 20,
    path: 'M 15,45 L 35,15 L 65,25 L 85,45 L 45,50 Z'
  },
  rodriguez: {
    length: '4.304 km',
    laps: 71,
    record: '1:17.774 (V. Bottas)',
    capacity: '110,000',
    corners: 17,
    path: 'M 15,15 L 75,15 L 85,45 L 45,45 Z'
  },
  interlagos: {
    length: '4.309 km',
    laps: 71,
    record: '1:10.540 (V. Bottas)',
    capacity: '60,000',
    corners: 15,
    path: 'M 15,25 L 45,15 L 75,30 L 65,50 L 35,40 Z'
  },
  vegas: {
    length: '6.201 km',
    laps: 50,
    record: '1:35.490 (O. Piastri)',
    capacity: '100,000',
    corners: 17,
    path: 'M 10,20 L 80,20 L 85,45 L 50,45 L 25,40 Z'
  },
  losail: {
    length: '5.419 km',
    laps: 57,
    record: '1:24.319 (M. Verstappen)',
    capacity: '52,000',
    corners: 16,
    path: 'M 15,15 L 75,25 L 80,45 L 45,45 Z'
  },
  yas_marina: {
    length: '5.281 km',
    laps: 58,
    record: '1:26.103 (M. Verstappen)',
    capacity: '60,000',
    corners: 16,
    path: 'M 15,15 L 75,25 L 85,45 L 45,50 L 25,35 Z'
  },
  shanghai: {
    length: '5.451 km',
    laps: 56,
    record: '1:32.238 (M. Schumacher)',
    capacity: '200,000',
    corners: 16,
    path: 'M 15,35 L 35,15 L 75,20 L 85,50 L 45,45 Z'
  },
  imola: {
    length: '4.909 km',
    laps: 63,
    record: '1:15.484 (L. Hamilton)',
    capacity: '78,000',
    corners: 19,
    path: 'M 15,15 L 65,25 L 85,45 L 35,50 Z'
  },
  algarve: {
    length: '4.653 km',
    laps: 66,
    record: '1:18.750 (L. Hamilton)',
    capacity: '100,000',
    corners: 15,
    path: 'M 15,25 L 55,15 L 85,35 L 55,45 Z'
  }
};

interface CircuitsTabProps {
  races: Race[];
  isLoading: boolean;
  season: string;
}

export default function CircuitsTab({ races, isLoading, season }: CircuitsTabProps) {
  if (isLoading) {
    return (
      <div id="circuits-loading" className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-400 font-mono tracking-widest">LOADING CIRCUITS...</p>
      </div>
    );
  }

  const getTrackLengthNum = (circuitId: string) => {
    const info = TRACK_DETAILS[circuitId];
    if (!info) return 5.1;
    return parseFloat(info.length) || 5.1;
  };

  const getTrackCornersNum = (circuitId: string) => {
    const info = TRACK_DETAILS[circuitId];
    if (!info) return 15;
    return info.corners;
  };

  const getGenericTurns = (circuitName: string, cornersCount: number) => {
    return Array.from({ length: cornersCount || 12 }).map((_, i) => {
      const turnNum = i + 1;
      const speeds = ["115 km/h", "240 km/h", "85 km/h", "290 km/h", "160 km/h", "215 km/h", "140 km/h", "265 km/h"];
      const gears = ["3rd", "6th", "2nd", "8th", "4th", "5th", "4th", "7th"];
      const gforces = ["2.8G", "4.5G", "1.1G", "5.0G", "3.2G", "3.8G", "2.4G", "4.1G"];
      const types = ["Apex Left", "Apex Right", "Slow Hairpin", "High-Speed Sweep", "Braking Chicane", "Traction Zone", "Double Apex Right", "Chute Straight"];
      
      return {
        id: turnNum,
        name: `Turn ${turnNum}`,
        type: types[i % types.length],
        speed: speeds[i % speeds.length],
        gear: gears[i % gears.length],
        gforce: gforces[i % gforces.length]
      };
    });
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [lengthFilter, setLengthFilter] = useState<'all' | 'short' | 'long'>('all');
  const [cornersFilter, setCornersFilter] = useState<'all' | 'flowing' | 'technical'>('all');
  const [sortBy, setSortBy] = useState<'round' | 'length' | 'corners' | 'name'>('round');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [selectedCircuitId, setSelectedCircuitId] = useState<string>('bahrain');
  const [weatherPreset, setWeatherPreset] = useState<'dry' | 'damp' | 'wet'>('dry');
  const [hoveredTurn, setHoveredTurn] = useState<any | null>(null);

  // OpenF1 Paddock Drivers Profile States
  const [paddockDrivers, setPaddockDrivers] = useState<any[]>([]);
  const [loadingPaddockDrivers, setLoadingPaddockDrivers] = useState<boolean>(false);
  const [selectedDriverProfile, setSelectedDriverProfile] = useState<any | null>(null);

  useEffect(() => {
    setHoveredTurn(null);
  }, [selectedCircuitId]);

  // Map F1 country codes to flags
  const getCountryEmoji = (code: string) => {
    if (!code) return "🏁";
    const dict: Record<string, string> = {
      GBR: "🇬🇧", NLD: "🇳🇱", MCO: "🇲🇨", ESP: "🇪🇸", FRA: "🇫🇷", DEU: "🇩🇪", AUS: "🇦🇺",
      JPN: "🇯🇵", CAN: "🇨🇦", USA: "🇺🇸", ITA: "🇮🇹", FIN: "🇫🇮", MEX: "🇲🇽", CHN: "🇨🇳",
      DNK: "🇩🇰", THA: "🇹🇭", AUT: "🇦🇹", BEL: "🇧🇪", CHE: "🇨🇭", BRA: "🇧🇷", NZL: "🇳🇿"
    };
    return dict[code.toUpperCase()] || "🏁";
  };

  useEffect(() => {
    let active = true;
    async function loadPaddockDrivers() {
      setLoadingPaddockDrivers(true);
      try {
        const res = await fetch('https://api.openf1.org/v1/drivers?session_key=9161');
        if (!res.ok) throw new Error(`HTTP Status ${res.status}`);
        const data = await res.json();
        if (active && Array.isArray(data)) {
          // De-duplicate drivers as some may have multiple entries in a session
          const uniqueDict: Record<number, any> = {};
          data.forEach((d: any) => {
            if (d.driver_number && d.full_name) {
              const num = d.driver_number;
              // prefer entries that have a headshot
              if (!uniqueDict[num] || (!uniqueDict[num].headshot_url && d.headshot_url)) {
                uniqueDict[num] = d;
              }
            }
          });
          const list = Object.values(uniqueDict).sort((a: any, b: any) => {
            return (a.last_name || '').localeCompare(b.last_name || '');
          });
          setPaddockDrivers(list);
          if (list.length > 0) {
            setSelectedDriverProfile(list[0]);
          }
        }
      } catch (err) {
        console.warn("Failed loading paddock drivers in CircuitsTab:", err);
        // Robust Fallback F1 roster data when OpenF1 is throttled or offline
        const fallbacks = [
          { driver_number: 1, full_name: "Max VERSTAPPEN", name_acronym: "VER", team_name: "Red Bull Racing", team_colour: "3671C6", first_name: "Max", last_name: "Verstappen", country_code: "NLD", headshot_url: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png" },
          { driver_number: 44, full_name: "Lewis HAMILTON", name_acronym: "HAM", team_name: "Mercedes", team_colour: "27F4D2", first_name: "Lewis", last_name: "Hamilton", country_code: "GBR", headshot_url: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png" },
          { driver_number: 16, full_name: "Charles LECLERC", name_acronym: "LEC", team_name: "Ferrari", team_colour: "EF1A2D", first_name: "Charles", last_name: "Leclerc", country_code: "MCO", headshot_url: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png" },
          { driver_number: 4, full_name: "Lando NORRIS", name_acronym: "NOR", team_name: "McLaren", team_colour: "FF8700", first_name: "Lando", last_name: "Norris", country_code: "GBR", headshot_url: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANKEY01_Lando_Norris/lankey01.png" },
          { driver_number: 55, full_name: "Carlos SAINZ", name_acronym: "SAI", team_name: "Ferrari", team_colour: "EF1A2D", first_name: "Carlos", last_name: "Sainz", country_code: "ESP", headshot_url: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png" },
          { driver_number: 63, full_name: "George RUSSELL", name_acronym: "RUS", team_name: "Mercedes", team_colour: "27F4D2", first_name: "George", last_name: "Russell", country_code: "GBR", headshot_url: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png" },
          { driver_number: 14, full_name: "Fernando ALONSO", name_acronym: "ALO", team_name: "Aston Martin", team_colour: "229971", first_name: "Fernando", last_name: "Alonso", country_code: "ESP", headshot_url: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png" }
        ];
        setPaddockDrivers(fallbacks);
        setSelectedDriverProfile(fallbacks[0]);
      } finally {
        setLoadingPaddockDrivers(false);
      }
    }
    loadPaddockDrivers();
    return () => { active = false; };
  }, []);

  const silverstoneTurns = useMemo(() => [
    { id: 1, name: "Abbey", type: "High-Speed Right", speed: "285 km/h", gear: "7th", gforce: "4.2G", x: 370, y: 170 },
    { id: 2, name: "Arena", type: "Traction Right", speed: "160 km/h", gear: "4th", gforce: "2.1G", x: 410, y: 210 },
    { id: 3, name: "Loop", type: "First Hairpin Left", speed: "80 km/h", gear: "2nd", gforce: "1.2G", x: 430, y: 260 },
    { id: 4, name: "Aintree", type: "Full-Power Left", speed: "275 km/h", gear: "6th", gforce: "3.5G", x: 460, y: 280 },
    { id: 5, name: "Wellington Straight", type: "DRS Acceleration Zone", speed: "310 km/h", gear: "8th", gforce: "0.2G", x: 480, y: 320 },
    { id: 6, name: "Brooklands", type: "Hard Braking Left", speed: "165 km/h", gear: "4th", gforce: "3.1G", x: 450, y: 410 },
    { id: 7, name: "Luffield", type: "Sweeping Right Loop", speed: "115 km/h", gear: "3rd", gforce: "2.5G", x: 300, y: 355 },
    { id: 8, name: "Woodcote", type: "Acceleration Sweep", speed: "240 km/h", gear: "5th", gforce: "2.8G", x: 160, y: 300 },
    { id: 9, name: "Copse", type: "Legendary High-Speed Right", speed: "290 km/h", gear: "8th", gforce: "5.1G", x: 140, y: 240 },
    { id: 10, name: "Maggotts", type: "Ultra-fast S-Curve Left", speed: "295 km/h", gear: "8th", gforce: "4.8G", x: 210, y: 180 },
    { id: 11, name: "Becketts", type: "Aerodynamic Right Sweep", speed: "235 km/h", gear: "6th", gforce: "4.5G", x: 300, y: 150 },
    { id: 12, name: "Chapel", type: "Hangar Entrance Left", speed: "250 km/h", gear: "7th", gforce: "3.8G", x: 370, y: 140 },
    { id: 13, name: "Hangar Straight", type: "Velocity DRS Straight", speed: "328 km/h", gear: "8th", gforce: "0.2G", x: 435, y: 150 },
    { id: 14, name: "Stowe", type: "Downhill Fast Right", speed: "210 km/h", gear: "5th", gforce: "3.6G", x: 520, y: 140 },
    { id: 15, name: "Vale", type: "Heavy Braking Left Chicane", speed: "95 km/h", gear: "2nd", gforce: "1.8G", x: 640, y: 400 },
    { id: 16, name: "Club Entry", type: "Double-Apex Right", speed: "140 km/h", gear: "4th", gforce: "2.2G", x: 750, y: 310 },
    { id: 17, name: "Club Exit", type: "Main Straight Traction", speed: "185 km/h", gear: "5th", gforce: "2.4G", x: 790, y: 200 },
    { id: 18, name: "Hamilton Straight", type: "Finish Line Full Power", speed: "295 km/h", gear: "7th", gforce: "1.1G", x: 730, y: 110 }
  ], []);

  // Filter and Sort in useMemo
  const filteredCircuits = useMemo(() => {
    const unique = races.reduce((acc: any[], race) => {
      const exists = acc.some((c) => c.circuitId === race.Circuit.circuitId);
      if (!exists) {
        acc.push({
          ...race.Circuit,
          visitedRound: parseInt(race.round) || 1,
          raceName: race.raceName,
        });
      }
      return acc;
    }, []);

    let result = unique.filter((circuit) => {
      const q = searchQuery.toLowerCase();
      const matchText = `${circuit.circuitName} ${circuit.Location.locality} ${circuit.Location.country} ${circuit.raceName}`.toLowerCase();
      if (q && !matchText.includes(q)) return false;

      const len = getTrackLengthNum(circuit.circuitId);
      if (lengthFilter === 'short' && len >= 5.0) return false;
      if (lengthFilter === 'long' && len < 5.0) return false;

      const corners = getTrackCornersNum(circuit.circuitId);
      if (cornersFilter === 'flowing' && corners >= 15) return false;
      if (cornersFilter === 'technical' && corners < 15) return false;

      return true;
    });

    result.sort((a, b) => {
      let comp = 0;
      if (sortBy === 'round') {
        comp = a.visitedRound - b.visitedRound;
      } else if (sortBy === 'length') {
        comp = getTrackLengthNum(a.circuitId) - getTrackLengthNum(b.circuitId);
      } else if (sortBy === 'corners') {
        comp = getTrackCornersNum(a.circuitId) - getTrackCornersNum(b.circuitId);
      } else if (sortBy === 'name') {
        comp = a.circuitName.localeCompare(b.circuitName);
      }
      return sortOrder === 'asc' ? comp : -comp;
    });

    return result;
  }, [races, searchQuery, lengthFilter, cornersFilter, sortBy, sortOrder]);

  const selectedCircuitData = useMemo(() => {
    const found = filteredCircuits.find(c => c.circuitId === selectedCircuitId);
    if (found) return found;
    return filteredCircuits[0] || null;
  }, [filteredCircuits, selectedCircuitId]);

  const activeTrackInfo = useMemo(() => {
    if (!selectedCircuitData) return null;
    return TRACK_DETAILS[selectedCircuitData.circuitId] || {
      length: '5.10 km',
      laps: 55,
      record: 'N/A',
      capacity: '80,000',
      corners: 16,
      path: 'M 15,15 L 75,25 L 85,45 L 35,50 Z'
    };
  }, [selectedCircuitData]);

  const weatherMetrics = {
    dry: {
      temp: "34°C Track Temp",
      grip: "High Dry Grip (95%)",
      gripColor: "text-emerald-500",
      tires: "🔴 Soft (C5) / 🟡 Medium (C4)",
      aero: "Low-Drag Straight-Line Configuration",
      pitStrategy: "1-Stop Strategy: Medium ➔ Hard (Lap 22)",
      frictionCoef: "0.92 Track Friction",
      status: "Optimal racing surface with excellent traction and zero puddling.",
      timeDelta: "Baseline pace"
    },
    damp: {
      temp: "22°C Damp Temp",
      grip: "Slippery Inter-Grip (60%)",
      gripColor: "text-amber-500",
      tires: "🟢 Intermediate Compounds",
      aero: "High-Downforce Balanced Wings",
      pitStrategy: "Reactive Strategy: Wet ➔ Inter (Lap 12) / Dry ➔ Inter if Rain Start",
      frictionCoef: "0.65 Track Friction",
      status: "Moisture on track limits traction. Slick kerbs, damp braking lines.",
      timeDelta: "+5.420s Humidity drag"
    },
    wet: {
      temp: "16°C Monsoon Temp",
      grip: "Low Hydroplane Grip (25%)",
      gripColor: "text-rose-550",
      tires: "🔵 Full Monsoon Blue Wet",
      aero: "Extreme AoA Rain-Wings Setup",
      pitStrategy: "Safety: Wet ➔ Intermediate after safety car restart (Lap 16)",
      frictionCoef: "0.31 Track Friction",
      status: "Heavy standing water and dynamic aquaplaning risk in Sector 2/3.",
      timeDelta: "+12.860s standing water delay"
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      id="circuits-view"
      className="space-y-8"
    >
      <header className="space-y-1.5 select-none">
        <span className="text-[11px] font-bold tracking-widest text-gray-400 font-mono uppercase">
          F1 VENUES & TRACKS
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-black">
          {season} Circuits List
        </h1>
        <p className="text-sm text-gray-500 max-w-xl">
          Complete listing of global circuits hosting Grand Prix battles during the {season} F1 Championship.
        </p>
      </header>

      {/* NEW: Dynamic Strategy & Weather Commander Dashboard */}
      {selectedCircuitData && activeTrackInfo && (
        <div 
          id="circuit-commander-hud"
          className="bg-neutral-950 text-white rounded-3xl p-6 border border-neutral-800 shadow-xl space-y-6 select-none"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <div className="space-y-1">
              <span className="text-[9px] font-mono tracking-widest text-red-500 font-bold uppercase">
                ROUND {selectedCircuitData.visitedRound} COCKPIT PILOT COMMANDER
              </span>
              <h2 className="text-2xl font-black font-mono tracking-tight text-white">
                {selectedCircuitData.circuitName}
              </h2>
              <p className="text-xs text-neutral-400">
                Location: <strong className="text-neutral-200">{selectedCircuitData.Location.locality}, {selectedCircuitData.Location.country}</strong>
              </p>
            </div>

            {/* Weather Regulator Buttons */}
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl p-1.5">
              <button
                onClick={() => setWeatherPreset('dry')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all outline-none cursor-pointer ${
                  weatherPreset === 'dry' 
                    ? 'bg-red-650 text-white shadow-md' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Sun size={13} /> DRY HEAT
              </button>
              <button
                onClick={() => setWeatherPreset('damp')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all outline-none cursor-pointer ${
                  weatherPreset === 'damp' 
                    ? 'bg-amber-500 text-black shadow-md' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <CloudRain size={13} /> DAMP SHOWERS
              </button>
              <button
                onClick={() => setWeatherPreset('wet')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all outline-none cursor-pointer ${
                  weatherPreset === 'wet' 
                    ? 'bg-blue-605 text-white shadow-md' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <CloudRain size={13} /> MONSOON WET
              </button>
            </div>
          </div>

          {/* Grid Layout of HUD Cockpit parameters */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch pt-2">
            
            {/* Column 1: Paddock Driver Profiles (F1 drivers profile) */}
            <div className="xl:col-span-4 flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden p-5 space-y-4" id="paddock-drivers-hud" style={{ minHeight: '420px' }}>
              <div className="border-b border-neutral-850 pb-2 flex items-center justify-between">
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest font-mono">Paddock Driver Profiles</span>
                <span className="text-[8px] bg-red-950/40 text-red-400 px-2 py-0.5 rounded uppercase font-black font-mono">LIVE API</span>
              </div>

              {loadingPaddockDrivers ? (
                <div id="drivers-loading-placeholder" className="py-24 text-center space-y-2 font-mono">
                  <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-[9.5px] text-neutral-400 uppercase tracking-wider">RETRIEVING DRIVER ASSETS...</p>
                </div>
              ) : paddockDrivers.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-12">No active F1 drivers registered in session.</p>
              ) : (
                <div className="space-y-4 flex flex-col flex-1">
                  {/* Compact horizontal list of driver circles */}
                  <div className="flex flex-col space-y-1">
                    <span className="text-[8px] text-neutral-500 uppercase font-bold tracking-wider block font-mono">PADDOCK ROSTER STANDINGS</span>
                    <div className="flex gap-1.5 overflow-x-auto pb-1.5 pt-1 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
                      {paddockDrivers.map((driver) => {
                        const isChosen = selectedDriverProfile?.driver_number === driver.driver_number;
                        const colHex = driver.team_colour ? `#${driver.team_colour}` : "#9CA3AF";
                        return (
                          <button
                            key={driver.driver_number}
                            onClick={() => setSelectedDriverProfile(driver)}
                            className={`px-2.5 py-1.5 rounded-lg border font-mono text-[9px] font-black tracking-normal whitespace-nowrap transition-all outline-none cursor-pointer flex items-center gap-1.5 ${
                              isChosen 
                                ? "bg-white text-black border-white scale-102 font-extrabold" 
                                : "bg-neutral-950 text-neutral-300 border-neutral-800 hover:text-white"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: colHex }} />
                            {driver.name_acronym || `N#${driver.driver_number}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Chosen Driver Card layout */}
                  {selectedDriverProfile && (
                    <div className="flex-1 flex flex-col justify-between bg-neutral-950 border border-neutral-850 p-4 rounded-xl relative overflow-hidden font-mono text-xs select-none">
                      <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        <span className="text-[18px] font-black text-neutral-850 leading-none mr-1">#{selectedDriverProfile.driver_number}</span>
                        <span className="text-xs">{getCountryEmoji(selectedDriverProfile.country_code)}</span>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden flex items-center justify-center shrink-0">
                            {selectedDriverProfile.headshot_url ? (
                              <img 
                                src={selectedDriverProfile.headshot_url} 
                                alt={selectedDriverProfile.full_name} 
                                className="w-full h-full object-contain scale-110 object-bottom"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span className="text-neutral-500 font-bold text-xs">F1</span>
                            )}
                          </div>
                          <div>
                            <span className="text-[8px] text-neutral-450 font-extrabold uppercase tracking-wide block leading-tight">ACTIVE DRIVER CODE: {selectedDriverProfile.name_acronym}</span>
                            <h4 className="text-white text-xs font-black uppercase leading-tight tracking-tight mt-0.5">{selectedDriverProfile.first_name} {selectedDriverProfile.last_name}</h4>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="w-1.5 h-3 rounded-full" style={{ backgroundColor: selectedDriverProfile.team_colour ? `#${selectedDriverProfile.team_colour}` : "#737373" }} />
                              <span className="text-[9px] text-neutral-300 font-bold leading-none">{selectedDriverProfile.team_name}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[9.5px] pt-1">
                          <div className="bg-neutral-900 border border-neutral-850 p-2.5 rounded-lg leading-tight">
                            <span className="text-[7px] text-neutral-500 block uppercase font-bold mb-1">Paddock Name</span>
                            <span className="text-white font-extrabold">{selectedDriverProfile.broadcast_name || selectedDriverProfile.full_name}</span>
                          </div>
                          <div className="bg-neutral-900 border border-neutral-850 p-2.5 rounded-lg leading-tight">
                            <span className="text-[7px] text-neutral-500 block uppercase font-bold mb-1">Region Code</span>
                            <span className="text-white font-extrabold">{selectedDriverProfile.country_code || "INT"} / FIA PR</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[9px] text-neutral-400 leading-normal border-t border-neutral-850 pt-2 mt-2">
                        Telemetry profile highlights: <strong className="text-white">{selectedDriverProfile.first_name} {selectedDriverProfile.last_name}</strong> logs crisp turn vectors and excellent throttle recovery.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Column 2: Interactive Telemetry/Route Mapping Panel (Circuit Icon Map) */}
            <div className="xl:col-span-4 flex flex-col bg-[#0b0b0c] border border-neutral-800 rounded-2xl overflow-hidden relative" style={{ minHeight: '420px' }} id="interactive-radar-hud">
              {/* Header title badge */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-neutral-900/90 border border-neutral-800 px-3 py-1.5 rounded-lg select-none font-mono text-[9px]">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                <span className="text-gray-300 font-extrabold uppercase">CIRCUIT GEOMETRY</span>
              </div>

              {selectedCircuitData.circuitId === 'silverstone' ? (
                /* High-Fidelity Silverstone Circuit Overlay matching user-supplied image layout CONCEPT */
                <div className="w-full h-full flex items-center justify-center p-4 pt-16 relative">
                  <svg viewBox="0 0 1000 650" className="w-full h-full max-h-[380px] fill-none stroke-linecap-round stroke-linejoin-round select-none">
                    <defs>
                      <pattern id="inner-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#222" stroke-width="0.5"/>
                      </pattern>
                      <filter id="glow-s1" x="-10%" y="-10%" width="120%" height="120%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      <filter id="glow-s2" x="-10%" y="-10%" width="120%" height="120%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      <filter id="glow-s3" x="-10%" y="-10%" width="120%" height="120%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    <rect width="1000" height="650" fill="url(#inner-grid)" opacity="0.3" pointer-events="none" />

                    {/* DRS Active Dash Zones */}
                    <path d="M 450 410 L 160 300" stroke="#10b981" stroke-width="4" stroke-dasharray="8 6" opacity="0.4" />
                    <path d="M 640 400 L 750 310" stroke="#10b981" stroke-width="4" stroke-dasharray="8 6" opacity="0.4" />

                    {/* Sector Track paths */}
                    {/* Sector 1: Red */}
                    <path d="M 370 170 Q 380 230 430 260 L 460 280 Q 500 300 450 320 T 400 370 T 450 410" 
                          stroke="#ef4444" stroke-width="12" filter="url(#glow-s1)" opacity="0.9" />
                    {/* Sector 2: Blue */}
                    <path d="M 450 410 L 160 300 Q 120 280 140 240 T 210 180 Q 255 120 300 150 Q 320 180 370 140 T 435 150 Q 520 140 640 400" 
                          stroke="#3b82f6" stroke-width="12" filter="url(#glow-s2)" opacity="0.9" />
                    {/* Sector 3: Yellow */}
                    <path d="M 640 400 T 750 310 Q 790 270 790 200 T 730 110 T 670 130 T 610 200 T 510 120 L 370 170" 
                          stroke="#eab308" stroke-width="12" filter="url(#glow-s3)" opacity="0.9" />

                    {/* DRS Detection Zone labels */}
                    <g transform="translate(510, 210) scale(0.95)" className="pointer-events-none opacity-80">
                      <rect width="150" height="52" rx="6" fill="#10b981" />
                      <text x="75" y="20" fill="#fff" font-family="monospace" font-weight="900" font-size="10" text-anchor="middle">DRS DETECTION</text>
                      <text x="75" y="38" fill="#fff" font-family="monospace" font-weight="900" font-size="14" text-anchor="middle">ZONE 1</text>
                      <path d="M 75 52 L 75 75" stroke="#10b981" stroke-width="2" />
                      <circle cx="75" cy="75" r="4" fill="#10b981" />
                    </g>

                    <g transform="translate(630, 480) scale(0.95)" className="pointer-events-none opacity-80">
                      <rect width="150" height="52" rx="6" fill="#10b981" />
                      <text x="75" y="20" fill="#fff" font-family="monospace" font-weight="900" font-size="10" text-anchor="middle">DRS DETECTION</text>
                      <text x="75" y="38" fill="#fff" font-family="monospace" font-weight="900" font-size="14" text-anchor="middle">ZONE 2</text>
                      <path d="M 75 0 L 75 -35" stroke="#10b981" stroke-width="2" />
                      <circle cx="75" cy="-35" r="4" fill="#10b981" />
                    </g>

                    {/* Speed Trap pink badge */}
                    <g transform="translate(140, 360) scale(0.95)" className="pointer-events-none opacity-80">
                      <rect width="110" height="36" rx="6" fill="#ec4899" />
                      <text x="55" y="22" fill="#fff" font-family="monospace" font-weight="950" font-size="12" text-anchor="middle">SPEED TRAP</text>
                      <path d="M 55 0 L 55 -45" stroke="#ec4899" stroke-width="2" />
                      <circle cx="55" cy="-45" r="4" fill="#ec4899" />
                    </g>

                    {/* Checker start line */}
                    <g transform="translate(415, 145) rotate(-15)">
                      <rect width="20" height="12" fill="#ffffff" />
                      <rect x="0" y="0" width="5" height="6" fill="#000000" />
                      <rect x="10" y="0" width="5" height="6" fill="#000000" />
                      <rect x="5" y="6" width="5" height="6" fill="#000000" />
                      <rect x="15" y="6" width="5" height="6" fill="#000000" />
                    </g>

                    {/* Interactive Turn Circles */}
                    {silverstoneTurns.map((turn) => {
                      const isHovered = hoveredTurn?.id === turn.id;
                      return (
                        <g 
                          key={turn.id} 
                          className="cursor-pointer group/node"
                          onMouseEnter={() => setHoveredTurn(turn)}
                          onMouseLeave={() => setHoveredTurn(null)}
                        >
                          <circle 
                            cx={turn.x} 
                            cy={turn.y} 
                            r={isHovered ? 14 : 9} 
                            fill={isHovered ? "#ffffff" : "#111112"} 
                            stroke={isHovered ? "#ef4444" : "#ffffff"} 
                            strokeWidth={isHovered ? 4 : 2} 
                            className="transition-all duration-200" 
                          />
                          <text 
                            x={turn.x} 
                            y={turn.y + 3} 
                            fill={isHovered ? "#000000" : "#ffffff"} 
                            fontSize="9" 
                            fontWeight="900" 
                            fontFamily="monospace" 
                            textAnchor="middle"
                            className="pointer-events-none"
                          >
                            {turn.id.toString().padStart(2, '0')}
                          </text>

                          {/* Instant small tooltip above turn */}
                          <g transform={`translate(${turn.x - 60}, ${turn.y - 45})`} className={`pointer-events-none transition-all duration-200 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}>
                            <rect width="120" height="24" rx="4" fill="#000" stroke="#444" strokeWidth="1" />
                            <text x="60" y="15" fill="#fff" font-family="monospace" fontSize="9" fontWeight="bold" text-anchor="middle">T{turn.id} • {turn.name}</text>
                          </g>
                        </g>
                      );
                    })}
                  </svg>
                  
                  {/* Watermark sector designations */}
                  <span className="absolute bottom-3 left-4 text-[8px] font-mono text-neutral-500 uppercase tracking-widest font-black flex gap-3 select-none">
                    <span className="text-red-500 font-extrabold">S1</span>
                    <span className="text-blue-500 font-extrabold">S2</span>
                    <span className="text-yellow-500 font-extrabold">S3</span>
                  </span>
                </div>
              ) : (
                /* Dynamic generic trace styled visual overlay for any other track */
                <div className="w-full h-full flex flex-col items-center justify-center p-6 pt-16 relative">
                  <div className="w-full flex-1 flex items-center justify-center relative">
                    <svg viewBox="0 0 100 60" className="w-full h-full max-h-[220px] stroke-red-550 fill-none stroke-[2.8] stroke-linejoin-round stroke-linecap-round filter drop-shadow-[0_0_10px_rgba(239,26,45,0.55)]" style={{ stroke: '#EF1A2D' }}>
                      <path d={activeTrackInfo.path} />
                    </svg>

                    {/* Hotspot indicators over the layout */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-[10px] font-mono uppercase font-black tracking-widest text-white/5 rotate-12 select-none">
                        ELECTRONIC RADAR CAPTURE
                      </span>
                    </div>
                  </div>

                  {/* Horizontal scrollable directory list of track corners */}
                  <div className="w-full z-10 pt-4 border-t border-neutral-800/80 bg-neutral-900/40 p-3 rounded-xl">
                    <span className="block text-[8px] font-mono text-neutral-500 uppercase tracking-wider font-extrabold mb-2 text-center">
                      TRACK CORNERS DIRECTORY
                    </span>
                    <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-neutral-850 scrollbar-track-transparent">
                      {getGenericTurns(selectedCircuitData.circuitName, activeTrackInfo.corners).map((turn) => {
                        const isHovered = hoveredTurn?.id === turn.id;
                        return (
                          <button
                            key={turn.id}
                            onMouseEnter={() => setHoveredTurn(turn)}
                            onMouseLeave={() => setHoveredTurn(null)}
                            className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] whitespace-nowrap transition-all outline-none cursor-pointer ${
                              isHovered 
                                ? "bg-white text-black border-white font-extrabold scale-102" 
                                : "bg-neutral-900/80 text-neutral-300 border-neutral-800 hover:text-white"
                            }`}
                          >
                            T{turn.id} {turn.name.replace("Turn ", "")}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Column 3: Readouts, Strategy and Live telemetry HUD */}
            <div className="xl:col-span-4 flex flex-col justify-between gap-6">
              
              {/* Dynamic Turn Telemetry Cockpit (Our hot element!) */}
              <div 
                className="bg-neutral-900/65 border border-neutral-800 rounded-2xl p-5 min-h-[170px] flex flex-col justify-between relative overflow-hidden font-mono"
                id="turn-telemetry-screener"
              >
                <div className="flex justify-between items-center border-b border-neutral-800/80 pb-2">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                    <Activity size={12} className="text-red-500" />
                    LIVE TELEMETRY
                  </span>
                  <span className="text-[7.5px] bg-red-650/20 text-red-500 px-2 py-0.5 rounded uppercase font-black">
                    ANALYZER
                  </span>
                </div>

                {hoveredTurn ? (
                  <div className="grid grid-cols-12 gap-4 pt-3.5 z-10">
                    <div className="col-span-4 border-r border-neutral-800 pr-2">
                      <span className="text-[8px] text-neutral-500 uppercase tracking-widest block font-bold">NODE</span>
                      <strong className="text-xl font-black text-white block leading-none mt-1">
                        T{hoveredTurn.id.toString().padStart(2, '0')}
                      </strong>
                      <span className="text-[9px] font-bold text-[#FF9E00] block mt-1 uppercase tracking-tight truncate">
                        {hoveredTurn.name}
                      </span>
                    </div>

                    <div className="col-span-8 space-y-3 pl-2">
                      <div className="grid grid-cols-3 gap-2 text-center text-[9.5px]">
                        <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                          <span className="text-[7px] text-neutral-500 block uppercase">SPEED</span>
                          <strong className="text-white font-bold block mt-0.5 whitespace-nowrap">{hoveredTurn.speed}</strong>
                        </div>
                        <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                          <span className="text-[7px] text-neutral-500 block uppercase">GEAR</span>
                          <strong className="text-emerald-400 font-extrabold block mt-0.5">{hoveredTurn.gear}</strong>
                        </div>
                        <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                          <span className="text-[7px] text-neutral-500 block uppercase">FORCE</span>
                          <strong className="text-amber-500 font-bold block mt-0.5">{hoveredTurn.gforce}</strong>
                        </div>
                      </div>

                      <div className="leading-tight">
                        <div className="text-[9px] text-neutral-300 font-medium">
                          Style uses <strong className="text-white font-semibold">{hoveredTurn.type || "standard curves"}</strong>.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-2 z-10 select-none">
                    <span className="inline-block text-neutral-500 animate-pulse text-[15px] font-mono leading-none">█ ▄ █ ▄ ▄ █ ▄ </span>
                    <p className="text-[9.5px] text-neutral-450 font-bold uppercase tracking-wider">
                      HOVER PINPOINTS FOR APEX TELEMETRY
                    </p>
                  </div>
                )}

                {/* Decorative retro grid watermark trace element */}
                <div className="absolute right-2 bottom-2 font-mono text-[7px] text-neutral-700/60 leading-none text-right select-none pointer-events-none">
                  F1_COMMAND
                </div>
              </div>

              {/* Strategy Parameters layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                
                <div className="bg-neutral-900/60 p-4 border border-neutral-800 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-1.5 text-neutral-400 font-bold uppercase text-[9px]">
                    <Activity size={12} className="text-red-500" />
                    <span>TACTICAL SURFACE</span>
                  </div>
                  <div>
                    <div className={`text-sm font-black ${weatherMetrics[weatherPreset].gripColor}`}>
                      {weatherMetrics[weatherPreset].grip}
                    </div>
                    <span className="text-[9px] text-neutral-450 font-medium block mt-0.5">
                      {weatherMetrics[weatherPreset].temp}
                    </span>
                  </div>
                </div>

                <div className="bg-neutral-900/60 p-4 border border-neutral-800 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-1.5 text-neutral-400 font-bold uppercase text-[9px]">
                    <Award size={12} className="text-amber-500" />
                    <span>TIRES CONFIGS</span>
                  </div>
                  <div>
                    <div className="text-white text-[11px] font-bold font-mono">
                      {weatherMetrics[weatherPreset].tires}
                    </div>
                    <span className="text-[9px] text-neutral-450 font-medium block mt-0.5 truncate">
                      {weatherMetrics[weatherPreset].aero.split(" // ")[0] || ""}
                    </span>
                  </div>
                </div>

                <div className="bg-neutral-900/60 p-4 border border-neutral-800 rounded-2xl space-y-2.5 sm:col-span-2">
                  <span className="text-neutral-400 font-bold uppercase text-[9px] block">
                    RECOMMENDED TELEMETRIC RACE STRATEGY
                  </span>
                  <p className="font-bold text-gray-205 leading-normal text-[10.5px] text-white">
                    {weatherMetrics[weatherPreset].pitStrategy}
                  </p>
                  <div className="pt-2 border-t border-neutral-800 text-[9px] text-neutral-450 flex flex-col justify-between gap-1">
                    <span>Impact: <strong className="text-red-400 font-bold">{weatherMetrics[weatherPreset].timeDelta}</strong></span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* Search and Filters Deck */}
      <div 
        id="circuits-filter-bar"
        className="bg-white border border-gray-150 rounded-2xl p-5 flex flex-col lg:flex-row items-center gap-4 shadow-sm"
      >
        {/* Search input field */}
        <div className="relative w-full lg:flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold" />
          <input
            type="text"
            placeholder="Search venue names, locations, countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 text-xs font-semibold text-black placeholder-gray-400 outline-none border border-gray-200 focus:border-black rounded-lg transition-colors"
          />
        </div>

        {/* Filters and sorting layout */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Length Filter */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
            <span className="text-[9px] font-bold font-mono text-gray-400 uppercase tracking-widest">Length</span>
            <select
              value={lengthFilter}
              onChange={(e) => setLengthFilter(e.target.value as any)}
              className="bg-transparent text-xs font-bold outline-none cursor-pointer text-gray-800"
            >
              <option value="all">All Tracks</option>
              <option value="short">Short (&lt; 5km)</option>
              <option value="long">Long (&ge; 5km)</option>
            </select>
          </div>

          {/* Corners Filter */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
            <span className="text-[9px] font-bold font-mono text-gray-400 uppercase tracking-widest">Type</span>
            <select
              value={cornersFilter}
              onChange={(e) => setCornersFilter(e.target.value as any)}
              className="bg-transparent text-xs font-bold outline-none cursor-pointer text-gray-800"
            >
              <option value="all">All Styles</option>
              <option value="flowing">Flowing (&lt; 15 Corners)</option>
              <option value="technical">Technical (&ge; 15 Corners)</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
            <span className="text-[9px] font-bold font-mono text-gray-400 uppercase tracking-widest">Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-bold outline-none cursor-pointer text-gray-800 animate-none"
            >
              <option value="round">GP Round</option>
              <option value="length">Track Length</option>
              <option value="corners">Turn Count</option>
              <option value="name">Track Name</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="hover:bg-gray-150 p-1 rounded-md transition-colors flex items-center justify-center text-gray-650 shrink-0"
              title="Reverse layout order"
            >
              <SlidersHorizontal size={10} className="transform rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {filteredCircuits.length === 0 ? (
        <div className="py-20 text-center text-gray-400 border border-dashed border-gray-150 rounded-2xl bg-gray-50/20">
          No circuits match your filter criteria. Try expanding search or resetting filters.
        </div>
      ) : (
        <div 
          id="circuits-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCircuits.map((circuit) => {
            const isSelected = selectedCircuitId === circuit.circuitId;

            return (
              <div
                key={circuit.circuitId}
                id={`circuit-card-${circuit.circuitId}`}
                onClick={() => setSelectedCircuitId(circuit.circuitId)}
                className={`bg-white border hover:shadow-md transition-all duration-300 rounded-2xl p-6 relative flex flex-col justify-between h-[210px] group cursor-pointer ${
                  isSelected 
                    ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/5 shadow-inner' 
                    : 'border-gray-150 hover:border-gray-250'
                }`}
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold font-mono text-gray-400 tracking-wider bg-gray-50 border border-gray-100 px-2 py-0.5 rounded leading-none">
                      ROUND {circuit.visitedRound}
                    </span>
                    <Navigation size={14} className="text-gray-350 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -rotate-45" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-black tracking-tight leading-snug">
                      {circuit.circuitName}
                    </h3>
                    <p className="text-xs text-gray-405 font-medium">
                      Event: <strong className="text-gray-650 font-semibold">{circuit.raceName}</strong>
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-100/60 font-mono text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-gray-450 shrink-0" />
                    <span className="truncate text-gray-750 font-semibold">
                      {circuit.Location.locality}, {circuit.Location.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Compass size={12} className="text-gray-450 shrink-0" />
                    <span>
                      LAT: {parseFloat(circuit.Location.lat).toFixed(4)}° / LNG: {parseFloat(circuit.Location.long).toFixed(4)}°
                    </span>
                  </div>
                </div>

                {/* External out-link */}
                <a
                  href={circuit.url}
                  target="_blank"
                  rel="noreferrer referrerPolicy"
                  className="absolute bottom-6 right-6 p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-black hover:text-white transition-all duration-200 border border-gray-100 shadow-sm z-10"
                  title="Wikipedia circuit guide"
                >
                  <ExternalLink size={12} />
                </a>

                {/* Interactive Circuit Map & Deeper Stats Tooltip on Hover */}
                {(() => {
                  const info = TRACK_DETAILS[circuit.circuitId] || {
                    length: '5.10 km',
                    laps: 55,
                    record: 'N/A',
                    capacity: '80,000',
                    corners: 16,
                    path: 'M 15,15 L 75,25 L 85,45 L 35,50 Z'
                  };

                  return (
                    <div className="absolute left-1/2 bottom-[105%] -translate-x-1/2 w-72 bg-neutral-950 border border-neutral-800 rounded-xl p-4 shadow-xl text-white opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-50 space-y-3.5 mb-2">
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                        <span className="text-xs font-bold text-gray-200 truncate pr-1">{circuit.circuitName}</span>
                        <span className="text-[9px] font-mono tracking-widest text-red-500 font-bold uppercase shrink-0">MAP & STATS</span>
                      </div>

                      {/* Mini SVG Circuit Map Trace */}
                      <div className="bg-neutral-900 border border-neutral-800/60 rounded-lg p-3 flex items-center justify-center h-28 relative overflow-hidden">
                        <svg viewBox="0 0 100 60" className="w-full h-full stroke-red-500 fill-none stroke-[2.5] stroke-linejoin-round stroke-linecap-round filter drop-shadow-[0_0_6px_rgba(239,26,45,0.4)]" style={{ stroke: '#EF1A2D' }}>
                          <path d={info.path} />
                        </svg>
                        <span className="absolute bottom-1 right-2 text-[8px] font-mono text-gray-500 uppercase">Track Outline Map</span>
                      </div>

                      {/* Deeper stats list */}
                      <div className="grid grid-cols-2 gap-y-2.5 gap-x-1.5 text-[11px] font-medium leading-normal">
                        <div>
                          <span className="block text-[8px] font-mono text-gray-500 uppercase tracking-wider font-bold">Track Length</span>
                          <span className="text-gray-200 font-bold">{info.length}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-mono text-gray-500 uppercase tracking-wider font-bold">Race Laps</span>
                          <span className="text-gray-300 font-mono font-bold">{info.laps} Laps</span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-mono text-gray-500 uppercase tracking-wider font-bold">Turns / Corners</span>
                          <span className="text-gray-300 font-mono font-bold">{info.corners} Corners</span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-mono text-gray-400 uppercase tracking-wider font-bold">Crowd Capacity</span>
                          <span className="text-gray-300 font-mono">{info.capacity}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="block text-[8px] font-mono text-gray-400 uppercase tracking-wider font-bold">Lap Record</span>
                          <span className="text-amber-400 font-mono font-bold break-all">{info.record}</span>
                        </div>
                      </div>

                      <div className="border-t border-neutral-800 pt-2 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                        <span>Click Wiki icon to read more</span>
                        <span className="text-red-500 font-bold">&#10142;</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
