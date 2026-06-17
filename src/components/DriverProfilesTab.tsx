import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Shield, Award, Gauge, Info, Zap, Settings, ArrowUpRight, Crosshair, Cpu } from 'lucide-react';

interface DriverData {
  driver_number: number;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  country_code: string;
  bio: string;
  image_url?: string;
  stats: {
    overall: number;
    speed: number;
    racecraft: number;
    awareness: number;
    pace: number;
  };
  paddockStats: {
    entries: number;
    podiums: number;
    wins: number;
    worldTitles: number;
  };
}

const DRIVERS_ROSTER: DriverData[] = [
  {
    driver_number: 1,
    full_name: "Max Verstappen",
    name_acronym: "VER",
    team_name: "Red Bull Racing",
    team_colour: "3671C6",
    country_code: "NED",
    bio: "Three-time World Champion continuing his dominant run, renowned for razor-sharp overtakes and extraordinary tire management.",
    image_url: "/max_profile.jpg",
    stats: { overall: 98, speed: 99, racecraft: 98, awareness: 96, pace: 99 },
    paddockStats: { entries: 206, podiums: 111, wins: 62, worldTitles: 3 }
  },
  {
    driver_number: 4,
    full_name: "Lando Norris",
    name_acronym: "NOR",
    team_name: "McLaren",
    team_colour: "FF8700",
    country_code: "GBR",
    bio: "The explosive British spearhead piloting McLaren’s championship charge with supreme raw qualifying velocity and consistent podium finishes.",
    image_url: "/lando_profile.jpg",
    stats: { overall: 94, speed: 95, racecraft: 93, awareness: 92, pace: 95 },
    paddockStats: { entries: 125, podiums: 25, wins: 3, worldTitles: 0 }
  },
  {
    driver_number: 81,
    full_name: "Oscar Piastri",
    name_acronym: "PIA",
    team_name: "McLaren",
    team_colour: "FF8700",
    country_code: "AUS",
    bio: "Highly analytical and ice-cold Australian who has stunned the paddock, converting intense strategic vision into flawless track wins.",
    image_url: "/oscar_profile.jpg",
    stats: { overall: 92, speed: 92, racecraft: 91, awareness: 95, pace: 90 },
    paddockStats: { entries: 44, podiums: 9, wins: 2, worldTitles: 0 }
  },
  {
    driver_number: 16,
    full_name: "Charles Leclerc",
    name_acronym: "LEC",
    team_name: "Ferrari",
    team_colour: "EF1A2D",
    country_code: "MON",
    bio: "Ferrari's crown prince, widely regarded as the fastest driver over a single lap, bringing passion and tactical focus to Maranello.",
    image_url: "/charles_profile.jpg",
    stats: { overall: 95, speed: 97, racecraft: 94, awareness: 91, pace: 95 },
    paddockStats: { entries: 145, podiums: 41, wins: 8, worldTitles: 0 }
  },
  {
    driver_number: 44,
    full_name: "Lewis Hamilton",
    name_acronym: "HAM",
    team_name: "Ferrari",
    team_colour: "EF1A2D",
    country_code: "GBR",
    bio: "Seven-time World Champion, initiating a historic, era-defining twilight transfer to Ferrari to pursue an unprecedented eighth world title.",
    image_url: "/lewis_profile.jpg",
    stats: { overall: 96, speed: 93, racecraft: 98, awareness: 97, pace: 95 },
    paddockStats: { entries: 353, podiums: 201, wins: 105, worldTitles: 7 }
  },
  {
    driver_number: 63,
    full_name: "George Russell",
    name_acronym: "RUS",
    team_name: "Mercedes",
    team_colour: "27F4D2",
    country_code: "GBR",
    bio: "Pristine technical strategist and multiple Grand Prix winner spearheading Mercedes-AMG with incredible fighting spirit and precision.",
    image_url: "/russell_profile.jpg",
    stats: { overall: 92, speed: 94, racecraft: 90, awareness: 91, pace: 92 },
    paddockStats: { entries: 125, podiums: 14, wins: 2, worldTitles: 0 }
  },
  {
    driver_number: 12,
    full_name: "Kimi Antonelli",
    name_acronym: "ANT",
    team_name: "Mercedes",
    team_colour: "27F4D2",
    country_code: "ITA",
    bio: "Sensational Italian hyper-prodigy stepping directly into a Mercedes AMG varsity cockpit with record-breaking expectations.",
    image_url: "/kimi_profile.jpg",
    stats: { overall: 85, speed: 89, racecraft: 83, awareness: 80, pace: 88 },
    paddockStats: { entries: 12, podiums: 1, wins: 0, worldTitles: 0 }
  },
  {
    driver_number: 6,
    full_name: "Isack Hadjar",
    name_acronym: "HAD",
    team_name: "Red Bull Racing",
    team_colour: "3671C6",
    country_code: "FRA",
    bio: "Blistering French young talent drafted into the Premier Red Bull lineup following masterclasses in high-performance junior championships.",
    image_url: "/isack_profile.jpg",
    stats: { overall: 81, speed: 83, racecraft: 80, awareness: 82, pace: 79 },
    paddockStats: { entries: 8, podiums: 0, wins: 0, worldTitles: 0 }
  },
  {
    driver_number: 55,
    full_name: "Carlos Sainz Jr",
    name_acronym: "SAI",
    team_name: "Williams",
    team_colour: "005AFF",
    country_code: "ESP",
    bio: "Deeply intellectual operator and race winner bringing world-class development capabilities and tactical pacing to Williams Racing.",
    stats: { overall: 91, speed: 89, racecraft: 92, awareness: 93, pace: 90 },
    paddockStats: { entries: 204, podiums: 25, wins: 4, worldTitles: 0 }
  },
  {
    driver_number: 23,
    full_name: "Alexander Albon",
    name_acronym: "ALB",
    team_name: "Williams",
    team_colour: "005AFF",
    country_code: "GBR",
    bio: "Williams team leader, highly revered for maximizing midfield opportunities and showing immense grit during long tire stints.",
    stats: { overall: 88, speed: 87, racecraft: 88, awareness: 90, pace: 87 },
    paddockStats: { entries: 102, podiums: 2, wins: 0, worldTitles: 0 }
  },
  {
    driver_number: 14,
    full_name: "Fernando Alonso",
    name_acronym: "ALO",
    team_name: "Aston Martin",
    team_colour: "229971",
    country_code: "ESP",
    bio: "The legendary, everlasting double World Champion whose phenomenal racecraft, defensive geometry, and sheer determination remain unmatched.",
    stats: { overall: 93, speed: 90, racecraft: 96, awareness: 94, pace: 92 },
    paddockStats: { entries: 398, podiums: 106, wins: 32, worldTitles: 2 }
  },
  {
    driver_number: 18,
    full_name: "Lance Stroll",
    name_acronym: "STR",
    team_name: "Aston Martin",
    team_colour: "229971",
    country_code: "CAN",
    bio: "Tenacious Canadian driver with notable podium records and unmatched reflexes during wet races and high-chaos opening laps.",
    stats: { overall: 83, speed: 84, racecraft: 82, awareness: 81, pace: 84 },
    paddockStats: { entries: 163, podiums: 3, wins: 0, worldTitles: 0 }
  },
  {
    driver_number: 31,
    full_name: "Esteban Ocon",
    name_acronym: "OCO",
    team_name: "Haas F1 Team",
    team_colour: "C4A484",
    country_code: "FRA",
    bio: "Hardened French GP winner setting off on a vital multi-year leadership campaign with a revived, aggressive Haas F1 team.",
    stats: { overall: 86, speed: 85, racecraft: 87, awareness: 84, pace: 86 },
    paddockStats: { entries: 154, podiums: 3, wins: 1, worldTitles: 0 }
  },
  {
    driver_number: 87,
    full_name: "Oliver Bearman",
    name_acronym: "BEA",
    team_name: "Haas F1 Team",
    team_colour: "C4A484",
    country_code: "GBR",
    bio: "Sensational British starlet who completed historic replacement score drives for Ferrari and Haas, securing a highly-deserved full mandate.",
    stats: { overall: 84, speed: 85, racecraft: 84, awareness: 85, pace: 83 },
    paddockStats: { entries: 10, podiums: 0, wins: 0, worldTitles: 0 }
  },
  {
    driver_number: 10,
    full_name: "Pierre Gasly",
    name_acronym: "GAS",
    team_name: "Alpine",
    team_colour: "0093CC",
    country_code: "FRA",
    bio: "Italian GP winner carrying Alpine's hopes with a fiery mixture of high-speed technical precision and aggressive wheel-to-wheel speed.",
    stats: { overall: 87, speed: 86, racecraft: 88, awareness: 86, pace: 87 },
    paddockStats: { entries: 150, podiums: 4, wins: 1, worldTitles: 0 }
  },
  {
    driver_number: 43,
    full_name: "Franco Colapinto",
    name_acronym: "COL",
    team_name: "Alpine",
    team_colour: "0093CC",
    country_code: "ARG",
    bio: "Uncapped Argentine hero who caught the paddock's absolute adoration with high-scoring rookie performances, securing his future seat.",
    stats: { overall: 83, speed: 84, racecraft: 83, awareness: 85, pace: 82 },
    paddockStats: { entries: 16, podiums: 0, wins: 0, worldTitles: 0 }
  },
  {
    driver_number: 30,
    full_name: "Liam Lawson",
    name_acronym: "LAW",
    team_name: "Racing Bulls",
    team_colour: "6692FF",
    country_code: "NZL",
    bio: "Gritty, uncompromising Kiwi racer who consistently proves his worth in defensive scenarios and has a remarkable eye for points placement.",
    stats: { overall: 85, speed: 85, racecraft: 87, awareness: 85, pace: 84 },
    paddockStats: { entries: 21, podiums: 0, wins: 0, worldTitles: 0 }
  },
  {
    driver_number: 17,
    full_name: "Arvid Lindblad",
    name_acronym: "LIN",
    team_name: "Racing Bulls",
    team_colour: "6692FF",
    country_code: "GBR",
    bio: "Supremely fast Red Bull academy standout promoted to the Racing Bulls seat after destroying competition fields in F3 championships.",
    stats: { overall: 80, speed: 82, racecraft: 79, awareness: 81, pace: 78 },
    paddockStats: { entries: 6, podiums: 0, wins: 0, worldTitles: 0 }
  },
  {
    driver_number: 27,
    full_name: "Nico Hülkenberg",
    name_acronym: "HUL",
    team_name: "Audi",
    team_colour: "00E6C3",
    country_code: "GER",
    bio: "Pragmatic, blisteringly fast German veteran lead-guiding Sauber with legendary spatial awareness and elite wet-weather timing.",
    stats: { overall: 86, speed: 88, racecraft: 83, awareness: 87, pace: 85 },
    paddockStats: { entries: 224, podiums: 0, wins: 0, worldTitles: 0 }
  },
  {
    driver_number: 5,
    full_name: "Gabriel Bortoleto",
    name_acronym: "BOR",
    team_name: "Audi",
    team_colour: "00E6C3",
    country_code: "BRA",
    bio: "The highly tactical F2 World Champion handpicked to spearhead Brazil's highly anticipated modern return to the Formula One grid.",
    stats: { overall: 82, speed: 83, racecraft: 81, awareness: 85, pace: 80 },
    paddockStats: { entries: 8, podiums: 0, wins: 0, worldTitles: 0 }
  },
  {
    driver_number: 11,
    full_name: "Sergio Pérez",
    name_acronym: "PER",
    team_name: "Cadillac Formula 1 Team",
    team_colour: "D4AF37",
    country_code: "MEX",
    bio: "The legendary Minister of Defense and street circuit champion, carrying immense technical wisdom and crucial tactical race experience.",
    stats: { overall: 86, speed: 84, racecraft: 89, awareness: 83, pace: 87 },
    paddockStats: { entries: 278, podiums: 39, wins: 6, worldTitles: 0 }
  },
  {
    driver_number: 77,
    full_name: "Valtteri Bottas",
    name_acronym: "BOT",
    team_name: "Cadillac Formula 1 Team",
    team_colour: "D4AF37",
    country_code: "FIN",
    bio: "Expert Finnish ten-time Grand Prix winner whose outstanding tactical experience, technical discipline, and sheer speed are vital driving forces.",
    stats: { overall: 85, speed: 86, racecraft: 82, awareness: 88, pace: 84 },
    paddockStats: { entries: 242, podiums: 67, wins: 10, worldTitles: 0 }
  }
];

export default function DriverProfilesTab() {
  const [selectedDriver, setSelectedDriver] = useState<DriverData | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [teamFilter, setTeamFilter] = useState<string>('all');

  // Teams mapping lists
  const filterTeams = Array.from(new Set(DRIVERS_ROSTER.map(d => d.team_name)));

  // Filtered dataset
  const filteredDrivers = DRIVERS_ROSTER.filter((drv) => {
    const matchesSearch = drv.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          drv.name_acronym.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          drv.driver_number.toString().includes(searchQuery);
    const matchesTeam = teamFilter === 'all' || drv.team_name === teamFilter;
    return matchesSearch && matchesTeam;
  });

  return (
    <div id="driver-profiles-tab" className="space-y-8 select-none">
      
      {/* Header section with high-performance visual accent */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-gray-200 pb-5">
        <div className="space-y-1.5">
          <span className="text-[10px] bg-red-550/10 text-[#EF1A2D] font-mono font-black tracking-widest px-2.5 py-1 rounded-full uppercase">
            Paddock Roster
          </span>
          <h1 className="text-3xl font-black text-black tracking-tight leading-none">
            Driver Intelligence Profiles
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Explore overall ratings, speed statistics, and detailed career history of the grid's elite competitors.
          </p>
        </div>

        {/* Improved Interactive Search & Filter Deck */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search driver or #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border border-gray-150 hover:border-gray-200 focus:border-red-500 text-xs px-4 py-2.5 rounded-xl outline-none transition-all w-full sm:w-48 font-mono shadow-xs"
          />
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="bg-white border border-gray-150 text-xs px-3 py-2.5 rounded-xl outline-none font-semibold transition-all cursor-pointer font-sans shadow-xs"
          >
            <option value="all">All Teams</option>
            {filterTeams.map((team) => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid rendering with improved card layouts */}
      {filteredDrivers.length === 0 ? (
        <div className="py-24 text-center text-xs text-gray-400 font-mono uppercase bg-gray-50 border border-dashed border-gray-150 rounded-2xl">
          No drivers matched the search parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDrivers.map((drv) => {
            const teamColor = `#${drv.team_colour}`;
            return (
              <motion.div
                key={drv.driver_number}
                layoutId={`static-drv-${drv.driver_number}`}
                onClick={() => setSelectedDriver(drv)}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white border border-gray-120 hover:border-neutral-900 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between cursor-pointer group relative overflow-hidden"
                style={{ borderLeft: `5px solid ${teamColor}` }}
              >
                {/* Visual grid accent */}
                <div 
                  className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 group-hover:opacity-8 transition-opacity pointer-events-none"
                  style={{ backgroundColor: teamColor }}
                />

                <div className="space-y-3 relative">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span 
                      className="text-2xl font-black transition-colors"
                      style={{ color: `${teamColor}` }}
                    >
                      #{drv.driver_number}
                    </span>
                    <span className="bg-neutral-100 text-neutral-800 font-bold px-2 py-0.5 rounded uppercase">
                      {drv.country_code}
                    </span>
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-neutral-950 tracking-tight leading-snug group-hover:text-[#EF1A2D] transition-colors">
                        {drv.full_name}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: teamColor }} />
                        <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                          {drv.team_name}
                        </p>
                      </div>
                    </div>
                    {drv.image_url && (
                      <img
                        src={drv.image_url}
                        alt={drv.full_name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 object-cover rounded-full border-2 shadow-sm shrink-0"
                        style={{ borderColor: teamColor }}
                      />
                    )}
                  </div>

                  {/* High Fidelity Stats overview */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 select-none">
                    <div className="text-center bg-gray-50 rounded-lg p-2 border border-gray-100/50">
                      <span className="text-[8px] text-gray-400 font-bold block leading-none mb-1 font-mono uppercase">Rating</span>
                      <strong className="text-sm font-black text-black font-mono">{drv.stats.overall}</strong>
                    </div>
                    <div className="text-center bg-gray-50 rounded-lg p-2 border border-gray-100/50">
                      <span className="text-[8px] text-gray-400 font-bold block leading-none mb-1 font-mono uppercase">Speed</span>
                      <strong className="text-sm font-bold text-neutral-700 font-mono">{drv.stats.speed}</strong>
                    </div>
                    <div className="text-center bg-gray-50 rounded-lg p-2 border border-gray-100/50">
                      <span className="text-[8px] text-gray-400 font-bold block leading-none mb-1 font-mono uppercase">Racecraft</span>
                      <strong className="text-sm font-bold text-neutral-700 font-mono">{drv.stats.racecraft}</strong>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 mt-4 flex justify-between items-center text-[10px] text-gray-400 font-mono uppercase">
                  <span>{drv.name_acronym}</span>
                  <span className="bg-gray-50 border border-gray-150/40 px-2 py-1 rounded-md tracking-wider group-hover:bg-neutral-900 group-hover:text-white transition-all">
                    Profile Details
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Driver Detail Drawer Panel Modal Overlay */}
      <AnimatePresence>
        {selectedDriver && (
          <div 
            id="driver-paddock-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none"
            onClick={() => setSelectedDriver(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-gray-150 rounded-3xl w-full max-w-xl p-6 md:p-8 space-y-6 relative shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top team accent header */}
              <div 
                className="absolute top-0 left-0 right-0 h-2.5"
                style={{ backgroundColor: `#${selectedDriver.team_colour}` }}
              />

              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-black text-white px-2.5 py-1 rounded-sm uppercase tracking-wider" style={{ backgroundColor: `#${selectedDriver.team_colour}` }}>
                      {selectedDriver.team_name}
                    </span>
                    <span className="text-xs font-mono font-bold text-neutral-500 uppercase">
                      Roster ID #{selectedDriver.driver_number}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-neutral-950 tracking-tight leading-none pt-1">
                    {selectedDriver.full_name}
                  </h3>
                  <p className="text-xs font-mono font-bold text-[#EF1A2D] uppercase tracking-wider">
                    Official Broadcaster Registry: {selectedDriver.name_acronym}
                  </p>
                </div>

                {/* Big number showcase */}
                <strong 
                  className="text-4xl font-mono font-black tracking-tight self-start select-none"
                  style={{ color: `#${selectedDriver.team_colour}3a` }}
                >
                  #{selectedDriver.driver_number}
                </strong>
              </div>

              {/* Driver picture and biography intro */}
              <div className="flex flex-col sm:flex-row gap-4 items-center bg-neutral-50 p-4 border border-gray-100 rounded-2xl select-none">
                {selectedDriver.image_url && (
                  <img
                    src={selectedDriver.image_url}
                    alt={selectedDriver.full_name}
                    referrerPolicy="no-referrer"
                    className="w-28 h-28 object-cover rounded-xl border-2 shadow-sm shrink-0"
                    style={{ borderColor: `#${selectedDriver.team_colour}` }}
                  />
                )}
                <div className="text-slate-600 text-xs leading-relaxed font-sans italic">
                  "{selectedDriver.bio}"
                </div>
              </div>

              {/* Grid with statistics ratings and sliders */}
              <div className="space-y-3.5 pt-1">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-neutral-500 uppercase">
                  <Cpu size={14} className="text-[#EF1A2D]" />
                  <span>Interactive Intelligence Ratings</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Rating slides */}
                  <div className="space-y-3 bg-neutral-50/50 border border-gray-150/40 p-4 rounded-xl">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 font-sans font-medium flex items-center gap-1">
                          <Zap size={10} className="text-amber-500" />
                          React Speed
                        </span>
                        <strong className="font-mono text-[#EF1A2D]">{selectedDriver.stats.speed}</strong>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#EF1A2D] h-full rounded-full" style={{ width: `${selectedDriver.stats.speed}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 font-sans font-medium flex items-center gap-1">
                          <Crosshair size={10} className="text-blue-500" />
                          Racecraft / Overtakes
                        </span>
                        <strong className="font-mono text-[#EF1A2D]">{selectedDriver.stats.racecraft}</strong>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${selectedDriver.stats.racecraft}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 font-sans font-medium flex items-center gap-1">
                          <Shield size={10} className="text-emerald-500" />
                          Paddock Awareness
                        </span>
                        <strong className="font-mono text-[#EF1A2D]">{selectedDriver.stats.awareness}</strong>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${selectedDriver.stats.awareness}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 font-sans font-medium flex items-center gap-1">
                          <Gauge size={10} className="text-[#FF8700]" />
                          Absolute Pace
                        </span>
                        <strong className="font-mono text-[#EF1A2D]">{selectedDriver.stats.pace}</strong>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#FF8700] h-full rounded-full" style={{ width: `${selectedDriver.stats.pace}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Career stats block */}
                  <div className="bg-neutral-900 border border-neutral-850 p-4 rounded-xl text-xs space-y-3 font-mono flex flex-col justify-between">
                    <span className="text-[10px] text-neutral-450 uppercase block font-bold border-b border-neutral-800 pb-1.5">
                      Career Archive ({selectedDriver.country_code})
                    </span>
                    <div className="space-y-2">
                      <div className="flex justify-between text-neutral-400">
                        <span>Grand Prix Entries:</span>
                        <strong className="text-white font-bold">{selectedDriver.paddockStats.entries}</strong>
                      </div>
                      <div className="flex justify-between text-neutral-400">
                        <span>Podium Finishes:</span>
                        <strong className="text-white font-bold">{selectedDriver.paddockStats.podiums}</strong>
                      </div>
                      <div className="flex justify-between text-neutral-400">
                        <span>Grand Prix Wins:</span>
                        <strong className="text-[#EF1A2D] font-black">{selectedDriver.paddockStats.wins}</strong>
                      </div>
                      <div className="flex justify-between text-neutral-400">
                        <span>World Titles:</span>
                        <strong className="text-amber-400 font-bold">{selectedDriver.paddockStats.worldTitles || 'None'}</strong>
                      </div>
                    </div>
                    <div className="bg-neutral-950 p-2 border border-neutral-800 rounded-md text-center text-[10px]">
                      <span className="text-neutral-400">Overall rating index:</span>
                      <strong className="text-white ml-1 text-sm font-black">{selectedDriver.stats.overall} OVR</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer dismiss buttons */}
              <div className="flex gap-3 pt-2 select-none">
                <button
                  type="button"
                  onClick={() => setSelectedDriver(null)}
                  className="w-full bg-neutral-950 hover:bg-neutral-850 text-white font-bold text-xs py-3 rounded-xl transition-all outline-none cursor-pointer"
                >
                  Close Profile Index
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
