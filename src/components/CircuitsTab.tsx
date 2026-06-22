import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
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
  },
  villeneuve: {
    length: '4.361 km',
    laps: 70,
    record: '1:13.078 (V. Bottas)',
    capacity: '100,000',
    corners: 14,
    path: 'M 15,15 L 65,15 L 85,35 L 50,50 L 30,35 Z'
  },
  paul_ricard: {
    length: '5.842 km',
    laps: 53,
    record: '1:32.740 (S. Vettel)',
    capacity: '90,000',
    corners: 15,
    path: 'M 15,25 L 45,15 L 85,30 L 75,55 L 35,45 Z'
  },
  nurburgring: {
    length: '5.148 km',
    laps: 60,
    record: '1:28.139 (M. Verstappen)',
    capacity: '150,005',
    corners: 16,
    path: 'M 15,35 L 45,15 L 75,15 L 85,45 L 35,45 Z'
  },
  hockenheimring: {
    length: '4.574 km',
    laps: 67,
    record: '1:13.780 (K. Räikkönen)',
    capacity: '120,000',
    corners: 17,
    path: 'M 15,15 L 75,15 L 85,45 L 35,35 Z'
  },
  sochi: {
    length: '5.848 km',
    laps: 53,
    record: '1:35.761 (L. Hamilton)',
    capacity: '55,000',
    corners: 18,
    path: 'M 15,35 L 45,15 L 75,30 L 85,55 Q 45,45 Z'
  },
  istanbul: {
    length: '5.338 km',
    laps: 58,
    record: '1:24.770 (J. P. Montoya)',
    capacity: '155,000',
    corners: 14,
    path: 'M 15,20 L 75,15 L 85,45 L 55,50 Z'
  },
  sepang: {
    length: '5.543 km',
    laps: 56,
    record: '1:34.080 (S. Vettel)',
    capacity: '130,000',
    corners: 15,
    path: 'M 10,20 L 70,10 L 80,45 L 35,40 Z'
  },
  canada: {
    length: '4.361 km',
    laps: 70,
    record: '1:13.078 (V. Bottas)',
    capacity: '100,000',
    corners: 14,
    path: 'M 15,15 L 65,15 L 85,35 L 50,50 L 30,35 Z'
  },
  singapore: {
    length: '4.940 km',
    laps: 62,
    record: '1:35.867 (L. Hamilton)',
    capacity: '90,000',
    corners: 19,
    path: 'M 15,15 L 75,15 L 80,45 L 45,50 L 20,40 Z'
  },
  austria: {
    length: '4.318 km',
    laps: 71,
    record: '1:05.619 (C. Sainz)',
    capacity: '105,000',
    corners: 10,
    path: 'M 15,40 L 15,15 L 45,25 L 75,25 L 85,45 L 45,45 Z'
  },
  great_britain: {
    length: '5.891 km',
    laps: 52,
    record: '1:27.097 (M. Verstappen)',
    capacity: '150,000',
    corners: 18,
    path: 'M 20,20 L 50,15 L 80,25 L 75,45 L 50,50 L 35,40 L 15,35 Z'
  },
  belgium: {
    length: '7.004 km',
    laps: 44,
    record: '1:46.286 (V. Bottas)',
    capacity: '70,000',
    corners: 19,
    path: 'M 15,15 L 65,25 L 85,45 L 55,55 L 35,40 Z'
  },
  brazil: {
    length: '4.309 km',
    laps: 71,
    record: '1:10.540 (V. Bottas)',
    capacity: '60,000',
    corners: 15,
    path: 'M 15,25 L 45,15 L 75,30 L 65,50 L 35,40 Z'
  },
  mexico: {
    length: '4.304 km',
    laps: 71,
    record: '1:17.774 (V. Bottas)',
    capacity: '110,000',
    corners: 17,
    path: 'M 15,15 L 75,15 L 85,45 L 45,45 Z'
  },
  japan: {
    length: '5.807 km',
    laps: 53,
    record: '1:30.983 (L. Hamilton)',
    capacity: '155,000',
    corners: 18,
    path: 'M 15,35 Q 30,15 50,45 T 85,25 Q 70,55 45,35 Z'
  },
  china: {
    length: '5.451 km',
    laps: 56,
    record: '1:32.238 (M. Schumacher)',
    capacity: '200,000',
    corners: 16,
    path: 'M 15,35 L 35,15 L 75,20 L 85,50 L 45,45 Z'
  },
  qatar: {
    length: '5.419 km',
    laps: 57,
    record: '1:24.319 (M. Verstappen)',
    capacity: '52,000',
    corners: 16,
    path: 'M 15,15 L 75,25 L 80,45 L 45,45 Z'
  },
  uae: {
    length: '5.281 km',
    laps: 58,
    record: '1:26.103 (M. Verstappen)',
    capacity: '60,000',
    corners: 16,
    path: 'M 15,15 L 75,25 L 85,45 L 45,50 L 25,35 Z'
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

  const [searchQuery, setSearchQuery] = useState('');
  const [lengthFilter, setLengthFilter] = useState<'all' | 'short' | 'long'>('all');
  const [cornersFilter, setCornersFilter] = useState<'all' | 'flowing' | 'technical'>('all');
  const [sortBy, setSortBy] = useState<'round' | 'length' | 'corners' | 'name'>('round');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [selectedCircuitId, setSelectedCircuitId] = useState<string>('bahrain');
  
  // F1 Paddock Traveler Diary checklist stored in localStorage
  const [checkedInVenues, setCheckedInVenues] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('f1_passport_checked_in');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleCheckIn = (id: string) => {
    const next = checkedInVenues.includes(id) 
      ? checkedInVenues.filter(item => item !== id)
      : [...checkedInVenues, id];
    setCheckedInVenues(next);
    localStorage.setItem('f1_passport_checked_in', JSON.stringify(next));
  };

  // Map F1 country codes/countries to flags
  const getCountryEmoji = (countryName: string) => {
    if (!countryName) return "🏁";
    const dict: Record<string, string> = {
      "bahrain": "🇧🇭", "saudi arabia": "🇸🇦", "australia": "🇦🇺", "japan": "🇯🇵",
      "usa": "🇺🇸", "united states": "🇺🇸", "monaco": "🇲🇨", "spain": "🇪🇸",
      "austria": "🇦🇹", "uk": "🇬🇧", "great britain": "🇬🇧", "united kingdom": "🇬🇧",
      "hungary": "🇭🇺", "belgium": "🇧🇪", "netherlands": "🇳🇱", "italy": "🇮🇹",
      "azerbaijan": "🇦🇿", "singapore": "🇸🇬", "mexico": "🇲🇽", "brazil": "🇧🇷",
      "qatar": "🇶🇦", "uae": "🇦🇪", "abu dhabi": "🇦🇪", "china": "🇨🇳", "canada": "🇨🇦"
    };
    const key = countryName.toLowerCase().trim();
    return dict[key] || "🏁";
  };

  // Cultural historic fact snippets
  const getCircuitStory = (id: string, name: string) => {
    const stories: Record<string, string> = {
      bahrain: "Sakhir desert oasis. A race of intense cooling challenges, sunset twilight shifts, and violent windblown sand blowing across long straights.",
      jeddah: "The fastest street circuit on the calendar. An intimidating maze of ultra-high-speed sweeps flanked closely by unforgiving concrete barriers.",
      albert_park: "Melbourne semi-permanent public park. High speed, dusty track surfaces on Friday that continuously rubber-in as the weekend matures.",
      suzuka: "The legendary crossover figure-8 layout. Universally adored by drivers for high-G technical combinations through the S-Curves and 130R.",
      miami: "Constructed around Hard Rock Stadium. Featuring a tight, tricky slow-speed marina chicane juxtaposed against 320+ km/h straightaways.",
      monaco: "The ultimate jewel of glamour and absolute precision. A historic harbor-side tightrope where overtaking is near-impossible and grid position is supreme.",
      catalunya: "The ultimate F1 aerodynamic test bed. Long high-speed main stretch paired with high-downforce sweeps that test tyre wear to the absolute limits.",
      red_bull_ring: "Set deep in the Austrian alpine hills. A short, explosive track of dramatic elevation rises, massive braking drops, and critical kerb usage.",
      silverstone: "The birthplace of F1. Renowned for hyper-fast premium fast flows through Copse, Maggotts, and Becketts where aero load is put to its maximum limit.",
      hungaroring: "Monaco without a harbor. A tight, hot, continuous succession of dusty winding curves that leave absolutely zero rest time for the athletes.",
      spa: "Deep in the epic Ardennes forests. Majestic elevation shifts characterized by Eau Rouge and Raidillon, where chaotic micro-climates prompt rain on one side of the track while the other dries.",
      zandvoort: "Winding coastal sand dunes. A historic roller-coaster famous for radical 18-degree steep banked curves, severe cross-winds, and raucous crowd passion.",
      monza: "The Temple of Speed. Teams shear wings down to paper-thin profiles to achieve unmatched, raw straight-line drag reduction on historic Italian soil.",
      baku: "An eccentric paradox. Merges a sprawling multi-mile high-speed main straight with a medieval old castle section barely wider than a modern F1 car.",
      marina_bay: "A brutal physical test. Running at night through high equatorial humidity, bumpy public streets, and over twenty challenging corners.",
      americas: "The magnificent custom-built Austin terrain. Heavily influenced by world-class turn features, starting with a steep uphill blind apex blind turn.",
      rodriguez: "High altitude oxygen deprivation. Raced at 2,200 meters above sea level, resulting in ultra-thin atmosphere, low downforce, and cooling difficulties.",
      interlagos: "Historic counter-clockwise natural theater. Prone to immediate flash downpours, severe bumps, and thrilling overtaking opportunities around Senna S.",
      vegas: "The neon-flooded strip. Freezing asphalt temperatures under nighttime strip lights, demanding immediate thermal control and straight-line efficiency.",
      losail: "High-speed motorcycle sanctuary. High-velocity lateral loads that challenge physical neck muscles, fast continuous sweeping right-left bends.",
      yas_marina: "A majestic twilight finale of grand proportions. Weaving around a luxury yacht harbor and illuminated hotel structures till the checkered flag.",
      shanghai: "Unique snail-shaped layout. Extreme tyre load at the infinite Turn 1-2 loop, which challenges vehicle front-axle traction.",
      imola: "A historic sanctuary of high-commitment kerb hopping. Demands classic old-school focus through Acque Minerali.",
      algarve: "The Portuguese roller-coaster. Massive blind drops and rise peaks that physically lift cars off the ground."
    };
    return stories[id] || `${name} is an active host of the ${season} season. Rich with regional legacy and technical precision.`;
  };

  // Dynamic stamp color generator based on venue location to make passport look authentic and fun
  const getStampColor = (id: string) => {
    const colors: Record<string, string> = {
      monza: "border-emerald-600 text-emerald-600 bg-emerald-50/20",
      vegas: "border-purple-500 text-purple-500 bg-purple-50/20",
      monaco: "border-amber-600 text-amber-600 bg-amber-50/20",
      silverstone: "border-blue-600 text-blue-600 bg-blue-50/20",
      suzuka: "border-rose-600 text-rose-600 bg-rose-50/20",
      singapore: "border-cyan-600 text-cyan-600 bg-cyan-50/20",
      spa: "border-yellow-600 text-yellow-600 bg-yellow-50/20"
    };
    return colors[id] || "border-red-600 text-red-600 bg-red-50/20";
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      id="circuits-view"
      className="space-y-6"
    >
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-5 gap-3">
        <div className="space-y-1 select-none">
          <span className="text-[10px] font-bold tracking-widest text-[#EF1A2D] font-mono uppercase">
            WORLD TOUR DESTINATIONS
          </span>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900 leading-none">
            {season} FIA Circuit Passport & Journal
          </h1>
          <p className="text-xs text-neutral-500 max-w-xl">
            A minimal, elegant travel log of the {season} F1 host tracks, complete with historical logs, stamp certifications, and checked-in passenger entries.
          </p>
        </div>
        <div className="text-xs font-mono bg-neutral-50 px-3 py-1.5 rounded-lg border border-gray-200 shrink-0 select-none text-gray-500">
          💼 JOURNAL CHECK-INS: <strong className="text-neutral-900">{checkedInVenues.length}/{races.length || 24}</strong>
        </div>
      </header>

      {/* Main Grid Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT VIEW: MINIMAL TRACK DIRECTORY */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-150 shadow-xs space-y-3">
            
            {/* Minimal search and sort menu */}
            <div className="relative font-mono">
              <input
                type="text"
                placeholder="Search country or track..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-3 py-1.5 bg-neutral-50 text-xs text-neutral-800 placeholder-gray-400 outline-none border border-gray-200 focus:border-red-500 rounded-lg transition-colors font-mono"
              />
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono select-none">
              <select
                value={lengthFilter}
                onChange={(e) => setLengthFilter(e.target.value as any)}
                className="bg-neutral-50 border border-gray-200 rounded-md p-1.5 text-neutral-700 outline-none focus:border-red-500"
              >
                <option value="all">All Lengths</option>
                <option value="short">Short (&lt; 5.0km)</option>
                <option value="long">Long (&ge; 5.0km)</option>
              </select>
              <select
                value={cornersFilter}
                onChange={(e) => setCornersFilter(e.target.value as any)}
                className="bg-neutral-50 border border-gray-200 rounded-md p-1.5 text-neutral-700 outline-none focus:border-red-500"
              >
                <option value="all">All Turns</option>
                <option value="flowing">Flowing (&lt; 15 turns)</option>
                <option value="technical">Technical (&ge; 15 turns)</option>
              </select>
            </div>

            {/* Sort Order Button Row */}
            <div className="flex items-center gap-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 bg-neutral-50 border border-gray-200 rounded-md p-1.5 text-xs text-neutral-700 outline-none focus:border-red-500 font-mono text-[10px]"
              >
                <option value="round">Sort by Round</option>
                <option value="length">Sort by Length</option>
                <option value="corners">Sort by Turn Count</option>
                <option value="name">Sort by Name</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 px-2.5 bg-neutral-50 border border-gray-200 hover:border-gray-300 text-neutral-500 hover:text-neutral-900 rounded-md transition-colors text-xs font-mono"
                title="Toggle Sorting Direction"
              >
                {sortOrder === 'asc' ? 'ASC' : 'DESC'}
              </button>
            </div>
          </div>

          {/* List display */}
          <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-neutral-200">
            {filteredCircuits.length === 0 ? (
              <div className="py-12 text-center text-xs font-mono text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                No matching tracks.
              </div>
            ) : (
              filteredCircuits.map((circuit) => {
                const isSelected = selectedCircuitId === circuit.circuitId;
                const info = TRACK_DETAILS[circuit.circuitId] || { length: '5.10 km', corners: 16 };
                const checked = checkedInVenues.includes(circuit.circuitId);
                
                return (
                  <div
                    key={circuit.circuitId}
                    onClick={() => setSelectedCircuitId(circuit.circuitId)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 select-none ${
                      isSelected
                        ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                        : "bg-white hover:bg-neutral-50/50 border-gray-150 hover:border-gray-250"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="space-y-0.5 truncate">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-mono tracking-wider font-extrabold ${
                            isSelected ? "bg-neutral-800 text-[#EF1A2D]" : "bg-neutral-100 text-neutral-550"
                          }`}>
                            RD {circuit.visitedRound}
                          </span>
                          {checked && (
                            <span className="text-[10px]" title="Checked in">✔️</span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold tracking-tight truncate mt-1">
                          {circuit.circuitName}
                        </h4>
                        <p className={`text-[10px] truncate ${isSelected ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          {getCountryEmoji(circuit.Location.country)} {circuit.Location.locality}, {circuit.Location.country}
                        </p>
                      </div>
                      <div className="text-right shrink-0 font-mono text-[9px] space-y-0.5 mt-0.5 select-none">
                        <div className="font-bold">{info.length}</div>
                        <div className="text-neutral-400 text-[8px]">{info.corners} curves</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT VIEW: THE PASSPORT TRAVEL VISA */}
        <div className="lg:col-span-8">
          {selectedCircuitData && activeTrackInfo ? (
            <div className="space-y-4">
              
              {/* THE WHITE SEWED PASSPORT IMMIGRATION STAMP COMPONENT */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden relative">
                {/* Visual Passport header binder bar */}
                <div className="bg-amber-800/10 h-2 w-full border-b border-amber-800/20" />
                
                <div className="p-6 md:p-8 space-y-6">
                  
                  {/* Top stamp seal header row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dashed border-gray-200 pb-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getCountryEmoji(selectedCircuitData.Location.country)}</span>
                        <span className="text-[9px] font-mono font-bold tracking-widest text-[#EF1A2D] uppercase block">
                          GRAND PRIX ADMISSION / ENTRY ROUND {selectedCircuitData.visitedRound}
                        </span>
                      </div>
                      <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
                        {selectedCircuitData.circuitName}
                      </h2>
                      <p className="text-xs font-mono text-neutral-500">
                        IMMIGRATION CODE: <strong className="text-neutral-800 font-medium">GP-{selectedCircuitData.circuitId.slice(0, 4).toUpperCase()}-{season}</strong>
                      </p>
                    </div>

                    {/* VINTAGE IMMIGRATION CIRCLE CERTIFICATE STAMP */}
                    <div className={`shrink-0 border-2 border-double rounded-full p-2.5 px-4 text-center font-mono select-none uppercase tracking-tighter ${getStampColor(selectedCircuitData.circuitId)} transform rotate-2 shadow-xs max-w-xs mx-auto sm:mx-0`}>
                      <div className="text-[7px] font-bold tracking-widest">★ FIA WORLD TOUR ★</div>
                      <div className="text-xs font-black font-mono leading-none my-1">{selectedCircuitData.Location.country}</div>
                      <div className="text-[7.5px] tracking-tight font-medium">CERTIFIED ROUND {selectedCircuitData.visitedRound}</div>
                    </div>
                  </div>

                  {/* Grid split inside the passport page of track */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    
                    {/* Left block: Vector Outline Sheet */}
                    <div className="md:col-span-5 flex flex-col justify-between bg-neutral-50 border border-gray-150 rounded-xl p-5 relative overflow-hidden select-none" style={{ minHeight: '260px' }}>
                      <div className="absolute top-3 left-3 text-[7.5px] font-mono text-gray-400 flex items-center gap-1">
                        <span>VECTOR TRACE GRID: UNIT SCALE</span>
                      </div>
                      
                      {/* SVG Canvas block */}
                      <div className="my-auto py-4 flex items-center justify-center">
                        <svg 
                          viewBox="0 0 100 65" 
                          className="w-44 h-44 drop-shadow-[0_4px_6px_rgba(0,0,0,0.06)]"
                        >
                          <motion.path
                            d={activeTrackInfo.path}
                            fill="none"
                            stroke="#171717"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                          />
                          {/* Inner glowing core line accent */}
                          <motion.path
                            d={activeTrackInfo.path}
                            fill="none"
                            stroke="#EF1A2D"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                          />
                        </svg>
                      </div>

                      <div className="text-center font-mono text-[8px] text-gray-450 z-10">
                        SYSTEM PATH: SECURE VECTOR ENVELOPE
                      </div>
                    </div>

                    {/* Right block: Specs Passport Stamp Information Details */}
                    <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                      
                      {/* Story log section */}
                      <div className="space-y-2 mt-1">
                        <span className="text-[9px] font-mono font-bold tracking-wider text-gray-400 uppercase">CULTURAL BRIEF & NOTES</span>
                        <p className="text-xs text-neutral-600 leading-relaxed font-sans bg-amber-50/15 p-3.5 rounded-xl border border-amber-900/10 italic">
                          "{getCircuitStory(selectedCircuitData.circuitId, selectedCircuitData.circuitName)}"
                        </p>
                      </div>

                      {/* Technical Specs Layout in a clean minimal grid */}
                      <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                        <div className="bg-neutral-50 p-3 rounded-xl border border-gray-150">
                          <span className="text-[8px] text-gray-400 block uppercase font-bold">TOTAL LAP LENGTH</span>
                          <strong className="text-neutral-800 text-xs block mt-0.5">{activeTrackInfo.length}</strong>
                        </div>
                        <div className="bg-neutral-50 p-3 rounded-xl border border-gray-150">
                          <span className="text-[8px] text-gray-400 block uppercase font-bold">RACE LAPS</span>
                          <strong className="text-neutral-800 text-xs block mt-0.5">{activeTrackInfo.laps} Laps</strong>
                        </div>
                        <div className="bg-neutral-50 p-3 rounded-xl border border-gray-150">
                          <span className="text-[8px] text-gray-400 block uppercase font-bold">TURN COUNT</span>
                          <strong className="text-neutral-800 text-xs block mt-0.5">{activeTrackInfo.corners} Turns</strong>
                        </div>
                        <div className="bg-neutral-50 p-3 rounded-xl border border-gray-150">
                          <span className="text-[8px] text-gray-400 block uppercase font-bold">STADIUM CAPACITY</span>
                          <strong className="text-neutral-800 text-xs block mt-0.5">{activeTrackInfo.capacity} Max</strong>
                        </div>
                      </div>

                      {/* Speed Record Display */}
                      <div className="bg-neutral-50 p-3.5 rounded-xl border border-gray-150 flex items-center justify-between gap-2">
                        <div className="font-mono">
                          <span className="text-[8.5px] text-gray-400 block uppercase font-bold">OFFICIAL CIRCUIT RECORD</span>
                          <strong className="text-neutral-850 text-[11px] block mt-0.5">{activeTrackInfo.record}</strong>
                        </div>
                        <span className="text-lg" title="Track record master">🏆</span>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM REVOLUTIONARY DIARY REGISTRY CHECK-IN BUTTON */}
                  <div className="border-t border-dashed border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs font-mono text-center sm:text-left text-gray-500">
                      Did you watch this historic Grand Prix or visit the track? Check into your passport.
                    </div>
                    <button
                      onClick={() => toggleCheckIn(selectedCircuitData.circuitId)}
                      className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shadow-xs cursor-pointer select-none active:scale-95 flex items-center justify-center gap-2 border ${
                        checkedInVenues.includes(selectedCircuitData.circuitId)
                          ? "bg-emerald-550 hover:bg-emerald-600 text-white border-emerald-600 font-extrabold"
                          : "bg-white hover:bg-neutral-50 text-neutral-800 border-gray-200"
                      }`}
                    >
                      {checkedInVenues.includes(selectedCircuitData.circuitId) ? (
                        <>
                          <span className="text-xs">✔</span> PASSPORT COMPLETED (CHECK-OUT)
                        </>
                      ) : (
                        <>
                          <span>✈</span> CERTIFY PASSPORT STAMP CHECK-IN
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>

              {/* Minimal Travel journal guidelines quote card */}
              <div className="p-4 bg-amber-50/30 rounded-xl border border-amber-900/10 text-center font-mono text-[10px] text-neutral-550 select-none">
                ℹ️ F1 World Tour Passport saves checked-in venues securely in browser cache memory. Use filters on the left to track achievements.
              </div>
            </div>
          ) : (
            <div className="text-center py-24 bg-white border border-dashed border-gray-200 rounded-3xl font-mono text-gray-400">
              ⚠️ Select a Grand Prix venue on the left passport router catalog list to print active journey metrics.
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
