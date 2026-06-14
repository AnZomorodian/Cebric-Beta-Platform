import { motion } from 'motion/react';
import { MapPin, Compass, ExternalLink, Navigation } from 'lucide-react';
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

  // Extract unique circuits from season's races
  const uniqueCircuits = races.reduce((acc: any[], race) => {
    const exists = acc.some((c) => c.circuitId === race.Circuit.circuitId);
    if (!exists) {
      acc.push({
        ...race.Circuit,
        visitedRound: race.round,
        raceName: race.raceName,
      });
    }
    return acc;
  }, []);

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

      {uniqueCircuits.length === 0 ? (
        <div className="py-20 text-center text-gray-400 border border-dashed border-gray-150 rounded-2xl bg-gray-50/20">
          No circuits metadata available for current season context.
        </div>
      ) : (
        <div 
          id="circuits-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {uniqueCircuits.map((circuit) => {
            return (
              <div
                key={circuit.circuitId}
                id={`circuit-card-${circuit.circuitId}`}
                className="bg-white border border-gray-150 hover:border-gray-250 hover:shadow-md transition-all duration-300 rounded-2xl p-6 relative flex flex-col justify-between h-[210px] group cursor-default"
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
                        <svg viewBox="0 0 100 60" className="w-full h-full stroke-red-505 fill-none stroke-[2.5] stroke-linejoin-round stroke-linecap-round filter drop-shadow-[0_0_6px_rgba(239,26,45,0.4)]" style={{ stroke: '#EF1A2D' }}>
                          <path d={info.path} />
                        </svg>
                        <span className="absolute bottom-1 right-2 text-[8px] font-mono text-gray-500 uppercase">Track Outline Map</span>
                      </div>

                      {/* Deeper stats list */}
                      <div className="grid grid-cols-2 gap-y-2.5 gap-x-1.5 text-[11px] font-medium leading-normal">
                        <div>
                          <span className="block text-[8px] font-mono text-gray-500 uppercase tracking-wider font-bold">Track Length</span>
                          <span className="text-gray-250 font-bold">{info.length}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-mono text-gray-500 uppercase tracking-wider font-bold">Race Laps</span>
                          <span className="text-gray-255 font-mono font-bold">{info.laps} Laps</span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-mono text-gray-500 uppercase tracking-wider font-bold">Turns / Corners</span>
                          <span className="text-gray-255 font-mono font-bold">{info.corners} Corners</span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-mono text-gray-550 uppercase tracking-wider font-bold">Crowd Capacity</span>
                          <span className="text-gray-255 font-mono">{info.capacity}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="block text-[8px] font-mono text-gray-550 uppercase tracking-wider font-bold">Lap Record</span>
                          <span className="text-amber-400 font-mono font-bold break-all">{info.record}</span>
                        </div>
                      </div>

                      <div className="border-t border-neutral-805 pt-2 flex items-center justify-between text-[10px] text-gray-500 font-mono">
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
