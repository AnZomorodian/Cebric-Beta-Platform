import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Shield, Award, Gauge, Info, Zap, Settings, ArrowUpRight, Crosshair, Cpu, RefreshCw, Trophy, AlertCircle } from 'lucide-react';

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

export const getEnrichedIntelligence = (d: DriverData) => {
  // Determine consistent deterministic stats based on their baseline stats and driver number
  const wetComp = Math.round(d.stats.awareness * 0.61 + d.stats.racecraft * 0.39 + (d.driver_number % 5 - 2));
  const tyreMgmt = Math.round(d.stats.pace * 0.52 + d.stats.awareness * 0.48 + (d.driver_number % 7 - 3));
  const qualTrim = Math.round(d.stats.speed * 0.78 + d.stats.pace * 0.22 + (d.driver_number % 4 - 2));
  const consistency = Math.round(d.stats.racecraft * 0.44 + d.stats.awareness * 0.56 + (d.driver_number % 3 - 1));
  return {
    wetComp: Math.min(99, Math.max(70, wetComp)),
    tyreMgmt: Math.min(99, Math.max(70, tyreMgmt)),
    qualTrim: Math.min(99, Math.max(70, qualTrim)),
    consistency: Math.min(99, Math.max(70, consistency)),
  };
};

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
    driver_number: 14,
    full_name: "Fernando Alonso",
    name_acronym: "ALO",
    team_name: "Aston Martin",
    team_colour: "229971",
    country_code: "ESP",
    bio: "The legendary, everlasting double World Champion whose phenomenal racecraft, defensive geometry, and sheer determination remain unmatched.",
    image_url: "/alonso_profile.jpg",
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
    image_url: "/stroll_profile.jpg",
    stats: { overall: 83, speed: 84, racecraft: 82, awareness: 81, pace: 84 },
    paddockStats: { entries: 163, podiums: 3, wins: 0, worldTitles: 0 }
  },
  {
    driver_number: 10,
    full_name: "Pierre Gasly",
    name_acronym: "GAS",
    team_name: "Alpine",
    team_colour: "0093CC",
    country_code: "FRA",
    bio: "Experienced French race winner spearheading Alpine F1's project with remarkable dedication and consistent high-precision drives.",
    image_url: "/gasly_profile.jpg",
    stats: { overall: 87, speed: 86, racecraft: 88, awareness: 89, pace: 86 },
    paddockStats: { entries: 150, podiums: 4, wins: 1, worldTitles: 0 }
  },
  {
    driver_number: 43,
    full_name: "Franco Colapinto",
    name_acronym: "COL",
    team_name: "Alpine",
    team_colour: "0093CC",
    country_code: "ARG",
    bio: "Young and aggressive Argentinian talent stepping up to represent Alpine with high qualifying intensity and superb pace characteristics.",
    image_url: "/colapinto_profile.jpg",
    stats: { overall: 84, speed: 85, racecraft: 83, awareness: 84, pace: 84 },
    paddockStats: { entries: 9, podiums: 0, wins: 0, worldTitles: 0 }
  },
  {
    driver_number: 55,
    full_name: "Carlos Sainz Jr.",
    name_acronym: "SAI",
    team_name: "Williams",
    team_colour: "005AFF",
    country_code: "ESP",
    bio: "Deeply intellectual operator and race winner bringing world-class development capabilities and tactical pacing to Williams Racing.",
    image_url: "/sainz_profile.jpg",
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
    image_url: "/albon_profile.jpg",
    stats: { overall: 88, speed: 87, racecraft: 88, awareness: 90, pace: 87 },
    paddockStats: { entries: 102, podiums: 2, wins: 0, worldTitles: 0 }
  },
  {
    driver_number: 31,
    full_name: "Esteban Ocon",
    name_acronym: "OCO",
    team_name: "Haas F1 Team",
    team_colour: "E6002B",
    country_code: "FRA",
    bio: "Incredibly defensive, tall, and resilient French Grand Prix winner bringing intense combativeness and high grit to Haas Racing.",
    image_url: "/ocon_profile.jpg",
    stats: { overall: 86, speed: 85, racecraft: 87, awareness: 84, pace: 86 },
    paddockStats: { entries: 154, podiums: 3, wins: 1, worldTitles: 0 }
  },
  {
    driver_number: 87,
    full_name: "Oliver Bearman",
    name_acronym: "BEA",
    team_name: "Haas F1 Team",
    team_colour: "E6002B",
    country_code: "GBR",
    bio: "Highly praised British stellar young talent joining Haas full-time with mature instincts and impressive point-scoring debuts.",
    image_url: "/bearman_profile.jpg",
    stats: { overall: 83, speed: 84, racecraft: 83, awareness: 85, pace: 82 },
    paddockStats: { entries: 3, podiums: 0, wins: 0, worldTitles: 0 }
  },
  {
    driver_number: 30,
    full_name: "Liam Lawson",
    name_acronym: "LAW",
    team_name: "Racing Bulls",
    team_colour: "6600CC",
    country_code: "NZL",
    bio: "Fearless New Zealand driver bringing strong defensive positioning, wet-weather masterclasses, and incredible confidence to RB.",
    image_url: "/lawson_profile.jpg",
    stats: { overall: 85, speed: 84, racecraft: 86, awareness: 88, pace: 83 },
    paddockStats: { entries: 16, podiums: 0, wins: 0, worldTitles: 0 }
  },
  {
    driver_number: 95,
    full_name: "Arvid Lindblad",
    name_acronym: "LIN",
    team_name: "Racing Bulls",
    team_colour: "6600CC",
    country_code: "GBR",
    bio: "Promising Red Bull junior prodigy debuting at Racing Bulls with exciting qualifying performance and lightning reflex stats.",
    image_url: "/lindblad_profile.jpg",
    stats: { overall: 80, speed: 82, racecraft: 79, awareness: 80, pace: 81 },
    paddockStats: { entries: 0, podiums: 0, wins: 0, worldTitles: 0 }
  },
  {
    driver_number: 27,
    full_name: "Nico Hülkenberg",
    name_acronym: "HUL",
    team_name: "Audi",
    team_colour: "1A1A1A",
    country_code: "GER",
    bio: "Legendary German qualifying artist and veterans hero, leading Audi’s historic factory entry into Formula 1 with absolute precision.",
    image_url: "/hulkenberg_profile.jpg",
    stats: { overall: 88, speed: 90, racecraft: 85, awareness: 89, pace: 87 },
    paddockStats: { entries: 224, podiums: 0, wins: 0, worldTitles: 0 }
  },
  {
    driver_number: 17,
    full_name: "Gabriel Bortoleto",
    name_acronym: "BOR",
    team_name: "Audi",
    team_colour: "1A1A1A",
    country_code: "BRA",
    bio: "Reigning high-performance junior champion making Brazil proud as he pilots the cutting-edge Audi cockpit with supreme tactical intelligence.",
    image_url: "/bortoleto_profile.jpg",
    stats: { overall: 82, speed: 83, racecraft: 81, awareness: 85, pace: 81 },
    paddockStats: { entries: 0, podiums: 0, wins: 0, worldTitles: 0 }
  },
  {
    driver_number: 11,
    full_name: "Sergio Pérez",
    name_acronym: "PER",
    team_name: "Cadillac Formula 1 Team",
    team_colour: "FCC01E",
    country_code: "MEX",
    bio: "The seasoned Mexican Minister of Defense bringing legendary rear-tire maintenance and masterclass street-track execution to Cadillac.",
    image_url: "/perez_profile.jpg",
    stats: { overall: 89, speed: 87, racecraft: 92, awareness: 88, pace: 89 },
    paddockStats: { entries: 282, podiums: 39, wins: 6, worldTitles: 0 }
  },
  {
    driver_number: 77,
    full_name: "Valtteri Bottas",
    name_acronym: "BOT",
    team_name: "Cadillac Formula 1 Team",
    team_colour: "FCC01E",
    country_code: "FIN",
    bio: "Highly experienced Finn, multiple Grand Prix winner and team anchor bringing raw single-lap pace and high experience to Cadillac.",
    image_url: "/bottas_profile.jpg",
    stats: { overall: 88, speed: 89, racecraft: 86, awareness: 89, pace: 87 },
    paddockStats: { entries: 244, podiums: 67, wins: 10, worldTitles: 0 }
  }
];

interface TrackScenario {
  id: string;
  name: string;
  type: string;
  favoredStat: 'speed' | 'racecraft' | 'awareness' | 'pace';
  description: string;
  ambientFactor: string;
}

const TRACK_SCENARIOS: TrackScenario[] = [
  {
    id: 'sakhir',
    name: 'Sakhir (Bahrain) Desert Grip',
    type: 'Desert Technical Asphalt',
    favoredStat: 'speed',
    description: 'Hot desert wind and highly abrasive tarmac testing brake stability and traction levels.',
    ambientFactor: 'Blustery sand breezes, falling night temperatures'
  },
  {
    id: 'jeddah',
    name: 'Jeddah Corniche (Saudi Arabia)',
    type: 'Sinking G-Force Street Lane',
    favoredStat: 'awareness',
    description: 'The fastest street track on the planet, featuring blind high-speed corners and zero runoffs.',
    ambientFactor: 'Severe wall-impact risk, rapid tyre heating'
  },
  {
    id: 'melbourne',
    name: 'Albert Park (Australia) Lake Flow',
    type: 'Semi-Street Park Circuit',
    favoredStat: 'pace',
    description: 'Fast, flowing sweepers flanking the lakeside, requiring high aerodynamic balance and mid-corner adjustments.',
    ambientFactor: 'Mild sunshine, variable lakeside track dust'
  },
  {
    id: 'suzuka',
    name: 'Suzuka (Japan) Figure-Eight',
    type: 'High-G Technical Curves',
    favoredStat: 'racecraft',
    description: 'The ultimate driver favorite - narrow, fast, featuring Degner corners and the infamous 130R sweep.',
    ambientFactor: 'High sidewall loading, potential sudden autumn rain'
  },
  {
    id: 'shanghai',
    name: 'Shanghai (China) Endless Turn 1',
    type: 'Heavy Braking and Long Straights',
    favoredStat: 'speed',
    description: 'Unique tightening helical turns and an endless 1.2km back straight putting power units to the test.',
    ambientFactor: 'Chilly damp morning, heavy front-left graining'
  },
  {
    id: 'miami',
    name: 'Miami Autodrome (USA)',
    type: 'Hybrid Street Speed Loop',
    favoredStat: 'pace',
    description: 'Tight chicane sections contrasted with sweeping high-speed curves framed by stadium structures.',
    ambientFactor: 'Extreme ambient humidity, high track surface heat'
  },
  {
    id: 'imola',
    name: 'Imola (Italy) Santerno Curbs',
    type: 'Classic Narrow Elevation',
    favoredStat: 'racecraft',
    description: 'Old-school grass runoffs and aggressive curbs where overtaking requires exceptional bravery and precision.',
    ambientFactor: 'Cool Italian river breeze, damp curb risks'
  },
  {
    id: 'monaco',
    name: 'Monaco Street Precision',
    type: 'Tight Street Circuit',
    favoredStat: 'racecraft',
    description: 'Ultra-narrow barriers where precision overtaking and defense dictate the winner.',
    ambientFactor: 'Low margin for error, heavy tire degradation'
  },
  {
    id: 'montreal',
    name: 'Montreal (Canada) Wall of Champions',
    type: 'Semi-Permanent Stop-Start Lane',
    favoredStat: 'speed',
    description: 'Violent curb hopping and heavy deceleration zones finished by the iconic exit barrier.',
    ambientFactor: 'Frequent safety cars, sudden morning gusts'
  },
  {
    id: 'barcelona',
    name: 'Barcelona-Catalunya (Spain)',
    type: 'Aero Flow Reference Track',
    favoredStat: 'pace',
    description: 'The standard testbed for chassis dynamics. Features long sweeping turns that expose aerodynamic weaknesses.',
    ambientFactor: 'Wind direction shifting on main straight, tyre wear'
  },
  {
    id: 'spielberg',
    name: 'Red Bull Ring (Austria) Sprints',
    type: 'Power Altitude Elevation',
    favoredStat: 'speed',
    description: 'Only 10 turns with steep climbs and hard braking zones testing throttle response in thin alpine air.',
    ambientFactor: 'Mountain micro-climate storms, front wing stress'
  },
  {
    id: 'silverstone',
    name: 'Silverstone High-G curves',
    type: 'Aerodynamic Flow Track',
    favoredStat: 'pace',
    description: 'Intense high-speed sweeping corners requiring absolute throttle management pacing.',
    ambientFactor: 'Heavy side-winds affecting active downforce'
  },
  {
    id: 'hungaroring',
    name: 'Hungaroring (Hungary) Curvy Maze',
    type: 'Hot Low-Speed Twisty Chicanes',
    favoredStat: 'racecraft',
    description: 'Often compared to a go-kart track. Non-stop corners and high ambient heat with minimal straights.',
    ambientFactor: 'Blistering summer heat, radiator cooling stress'
  },
  {
    id: 'spa',
    name: 'Spa-Francorchamps (Belgium) Ardennes',
    type: 'Wet Fast Track',
    favoredStat: 'awareness',
    description: 'Soaking track and unpredictable visibility where tactical reaction prevents crashes.',
    ambientFactor: 'Torrential downpour, delayed traction recovery'
  },
  {
    id: 'zandvoort',
    name: 'Zandvoort (Netherlands) Banking',
    type: 'Steep Banked Dunes',
    favoredStat: 'pace',
    description: 'Intense 18-degree banked turns and narrow high-speed paths winding through coastal sand dunes.',
    ambientFactor: 'Severe sea wind, coastal sand covering tarmac'
  },
  {
    id: 'monza',
    name: 'Monza Speed Trap Draft',
    type: 'Power Engine Track',
    favoredStat: 'speed',
    description: 'High velocity drag strips and aerodynamic slipstream battles down the straights.',
    ambientFactor: 'Blistering summer heat, power unit heat stress'
  },
  {
    id: 'baku',
    name: 'Baku City Castle (Azerbaijan)',
    type: 'Dual Speed Street Maze',
    favoredStat: 'speed',
    description: 'Features a tight 7-meter wide castle sequence contrasted with an endless flat-out 2.2km main straight.',
    ambientFactor: 'High slipstream drafts, cross-wind gusts'
  },
  {
    id: 'singapore',
    name: 'Marina Bay (Singapore) Humidity',
    type: 'Twisty Physical Night Lane',
    favoredStat: 'racecraft',
    description: 'An exhausting 23-turn physical street maze lit by thousands of floodlights in sweltering tropical humidity.',
    ambientFactor: 'Extreme cabin heat exhaustion, heavy brake disk wear'
  },
  {
    id: 'austin',
    name: 'COTA Austin (USA) Hills',
    type: 'Modern Multi-Apex Arena',
    favoredStat: 'pace',
    description: 'Inspiring combinations of classic tracks, starting with a steep blind uphill climb into Turn 1.',
    ambientFactor: 'Heavy track bumps, high tyre carcass thermal stress'
  },
  {
    id: 'mexico',
    name: 'Hermanos Rodríguez (Mexico) Altitude',
    type: 'Thin Air Speed Loop',
    favoredStat: 'speed',
    description: 'Located 2,200 meters above sea level where thin air reduces aerodynamic downforce and engine drag.',
    ambientFactor: 'Extremely low downforce grip, thin cooling airflow'
  },
  {
    id: 'interlagos',
    name: 'Interlagos (Brazil) Bowl Bowl',
    type: 'Anticlockwise Rolling Basin',
    favoredStat: 'awareness',
    description: 'An aggressive, short, bumpy classic roller-coaster with a high frequency of mixed-weather rain drama.',
    ambientFactor: 'Sudden tropical deluges, low visibility'
  },
  {
    id: 'vegas',
    name: 'Las Vegas Strip (USA)',
    type: 'Freezing Desert Neon Boulevard',
    favoredStat: 'speed',
    description: 'Flat-out sprints past world-famous casinos on cold night pavement testing tyre core temperatures.',
    ambientFactor: 'Extremely cold pavement, tyre heat retention crisis'
  },
  {
    id: 'losail',
    name: 'Lusail International (Qatar)',
    type: 'Fast Physical Sweepers',
    favoredStat: 'pace',
    description: 'Medium and high-speed corner sequences requiring relentless lateral neck force stamina.',
    ambientFactor: 'Desert heat, heavy wind-blown dust accumulation'
  },
  {
    id: 'yas_marina',
    name: 'Yas Marina (Abu Dhabi)',
    type: 'Twilight Harbor Lanes',
    favoredStat: 'pace',
    description: 'Technically demanding sector 3, culminating the grand prix calendar in stunning twilight luxury.',
    ambientFactor: 'Sunset visibility shifts, cooling pavement temperatures'
  }
];

export default function DriverProfilesTab() {
  const [subView, setSubView] = useState<'directory' | 'duel'>('directory');
  const [selectedDriver, setSelectedDriver] = useState<DriverData | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [teamFilter, setTeamFilter] = useState<string>('all');

  // Duel State
  const [driverA, setDriverA] = useState<DriverData>(DRIVERS_ROSTER[0]);
  const [driverB, setDriverB] = useState<DriverData>(DRIVERS_ROSTER[1]);
  const [selectedScenario, setSelectedScenario] = useState<TrackScenario>(TRACK_SCENARIOS[0]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simCommentary, setSimCommentary] = useState<string[]>([]);
  const [simWinner, setSimWinner] = useState<DriverData | null>(null);
  const [scoreA, setScoreA] = useState<number>(0);
  const [scoreB, setScoreB] = useState<number>(0);

  // Sandbox states
  const [tyreA, setTyreA] = useState<string>('medium');
  const [tyreB, setTyreB] = useState<string>('medium');
  const [aeroA, setAeroA] = useState<string>('balanced');
  const [aeroB, setAeroB] = useState<string>('balanced');
  const [stratA, setStratA] = useState<string>('balanced');
  const [stratB, setStratB] = useState<string>('balanced');

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

  const handleStartDuelSim = () => {
    if (driverA.driver_number === driverB.driver_number) {
      alert("A driver cannot lock-horns with themselves. Please pick distinct grid racers.");
      return;
    }

    setIsSimulating(true);
    setSimWinner(null);
    setSimCommentary([]);
    
    const logs: string[] = [];
    const isWetTrack = selectedScenario.id === 'spa';

    // Start comment
    logs.push(`🔴 LIGHTS OUT: ${driverA.full_name} (${driverA.name_acronym}) on [${tyreA.toUpperCase()}] and ${driverB.full_name} (${driverB.name_acronym}) on [${tyreB.toUpperCase()}] drop clutches and charge into Turn 1!`);

    // Calculate core intelligence-oriented ratings
    const intelA = getEnrichedIntelligence(driverA);
    const intelB = getEnrichedIntelligence(driverB);

    const statKey = selectedScenario.favoredStat;
    
    // Base scores using new derived intelligence parameters
    let scoreValA = driverA.stats.overall * 0.2 + driverA.stats[statKey] * 0.3 + (intelA.consistency + intelA.qualTrim) * 0.25;
    let scoreValB = driverB.stats.overall * 0.2 + driverB.stats[statKey] * 0.3 + (intelB.consistency + intelB.qualTrim) * 0.25;

    // TYRE MODIFIERS
    if (isWetTrack) {
      // Pilot A
      if (tyreA === 'wet' || tyreA === 'inter') {
        scoreValA += 15 + (intelA.wetComp * 0.1);
      } else {
        scoreValA -= 25;
        logs.push(`⚠️ WARNING: ${driverA.name_acronym} is sliding dangerously on slicks under pooling water. Out of traction control boundaries!`);
      }
      // Pilot B
      if (tyreB === 'wet' || tyreB === 'inter') {
        scoreValB += 15 + (intelB.wetComp * 0.1);
      } else {
        scoreValB -= 25;
        logs.push(`⚠️ WARNING: ${driverB.name_acronym} is sliding dangerously on slicks under pooling water. Out of traction control boundaries!`);
      }
    } else {
      // Dry Tracks
      // Pilot A
      if (tyreA === 'wet' || tyreA === 'inter') {
        scoreValA -= 20;
        logs.push(`⚠️ HEAT WARNING: ${driverA.name_acronym}'s wet tires have blistered on dry asphalt, losing thermodynamic stability!`);
      } else if (tyreA === 'soft') {
        scoreValA += 12;
      } else if (tyreA === 'hard') {
        scoreValA += 4 + (intelA.tyreMgmt * 0.05);
      } else {
        scoreValA += 8;
      }
      // Pilot B
      if (tyreB === 'wet' || tyreB === 'inter') {
        scoreValB -= 20;
        logs.push(`⚠️ HEAT WARNING: ${driverB.name_acronym}'s wet tires have blistered on dry asphalt, losing thermodynamic stability!`);
      } else if (tyreB === 'soft') {
        scoreValB += 12;
      } else if (tyreB === 'hard') {
        scoreValB += 4 + (intelB.tyreMgmt * 0.05);
      } else {
        scoreValB += 8;
      }
    }

    // AERO MODIFIERS
    if (selectedScenario.id === 'monaco') {
      if (aeroA === 'high') scoreValA += 15;
      if (aeroA === 'low') scoreValA -= 12;
      if (aeroB === 'high') scoreValB += 15;
      if (aeroB === 'low') scoreValB -= 12;
    } else if (selectedScenario.id === 'monza') {
      if (aeroA === 'low') scoreValA += 15;
      if (aeroA === 'high') scoreValA -= 12;
      if (aeroB === 'low') scoreValB += 15;
      if (aeroB === 'high') scoreValB -= 12;
    } else {
      if (aeroA === 'balanced') scoreValA += 8;
      if (aeroB === 'balanced') scoreValB += 8;
    }

    // STRATEGY MODE MODIFIERS
    if (stratA === 'attack') scoreValA += (driverA.stats.speed * 0.15) - 6;
    if (stratA === 'defend') scoreValA += (driverA.stats.awareness * 0.15) - 4;
    if (stratA === 'balanced') scoreValA += 5;

    if (stratB === 'attack') scoreValB += (driverB.stats.speed * 0.15) - 6;
    if (stratB === 'defend') scoreValB += (driverB.stats.awareness * 0.15) - 4;
    if (stratB === 'balanced') scoreValB += 5;

    // Random contingency factor
    const randomChance = Math.random();
    let contingencyAlert = "";
    if (randomChance < 0.35) {
      if (stratA === 'attack') {
        contingencyAlert = `🛡️ LAP 3: ${driverA.name_acronym} pushing in ATTACK mode triggers severe thermal tire fade, losing sector 3 grip!`;
        scoreValA -= 10;
      } else {
        contingencyAlert = `⏱️ LAP 3: Perfect tyre cruise limits for both pilots as they nail apex clipping points!`;
      }
    } else if (randomChance < 0.7) {
      if (stratB === 'attack') {
        contingencyAlert = `🛡️ LAP 3: ${driverB.name_acronym} locking up his fronts under intense overtake attempts! flat-spots on intermediate sensors!`;
        scoreValB -= 10;
      } else {
        contingencyAlert = `🏎️ LAP 3: Strategic duel peaks: ${driverA.name_acronym} on ${stratA.toUpperCase()} tactics vs ${driverB.name_acronym} playing ${stratB.toUpperCase()} defensively.`;
      }
    } else {
      contingencyAlert = `⚡ LAP 3: Dynamic slipstream zone in sector 2. Both pilots hit full fuel-burn trim!`;
    }

    // Trigger sequential commentary displays
    setTimeout(() => {
      setSimCommentary(prev => [...prev, logs[0]]);
    }, 10);

    // Filter warnings to print as Lap 2
    const warningAlerts = logs.filter(l => l.includes('WARNING:'));
    setTimeout(() => {
      let lap2Text = `🏎️ LAP 2: Telemetry tracks them sweeping key sectors. `;
      if (warningAlerts.length > 0) {
        lap2Text += `Critical telemetry notes alert: ${warningAlerts.join(' ')}`;
      } else {
        lap2Text += `Superior setups are clear. ${driverA.name_acronym} leverages ${aeroA.toUpperCase()} aero trim; ${driverB.name_acronym} counters on ${aeroB.toUpperCase()}.`;
      }
      setSimCommentary(prev => [...prev, lap2Text]);
    }, 1100);

    setTimeout(() => {
      setSimCommentary(prev => [...prev, contingencyAlert]);
    }, 2400);

    setTimeout(() => {
      // Add random small delta to keep it unpredictable
      const finalA = scoreValA + Math.random() * 8;
      const finalB = scoreValB + Math.random() * 8;
      
      const finalWinner = finalA >= finalB ? driverA : driverB;
      const winnerAcronym = finalWinner.name_acronym;
      const margin = Math.abs(finalA - finalB).toFixed(2);
      
      const lap5Text = `🏁 CHECKERED FLAG: ${winnerAcronym} seals the dual simulation victory! A high-intelligence ${finalWinner === driverA ? stratA.toUpperCase() : stratB.toUpperCase()} masterclass configuration. Winning Delta: +${margin} Telemetry Points!`;
      
      setScoreA(Math.round(finalA));
      setScoreB(Math.round(finalB));
      setSimCommentary(prev => [...prev, lap5Text]);
      setSimWinner(finalWinner);
      setIsSimulating(false);
    }, 3800);
  };

  return (
    <div id="driver-profiles-tab" className="space-y-8 select-none">
      
      {/* Header section with high-performance visual accent */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-gray-200 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-neutral-900 text-white font-mono font-black tracking-widest px-2.5 py-1 rounded uppercase">
              Grid intelligence
            </span>
            <span className="text-[10px] bg-red-650/10 text-[#EF1A2D] font-mono font-black tracking-widest px-2.5 py-1 rounded uppercase">
              F1 Live Registry
            </span>
          </div>
          <h1 className="text-3xl font-black text-black tracking-tight leading-none mt-1">
            Driver Intelligence Profiles
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Explore overall telemetry ratings and evaluate active match outcomes using our 1v1 strategy simulator.
          </p>
        </div>

        {/* View Toggle pills */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl shrink-0 self-start md:self-auto shadow-xs border border-gray-250/20">
          <button
            onClick={() => setSubView('directory')}
            className={`px-4 py-2 text-xs font-bold font-mono rounded-lg transition-all border-none cursor-pointer outline-none ${
              subView === 'directory' 
                ? 'bg-white text-black shadow-xs font-black' 
                : 'text-gray-500 hover:text-black'
            }`}
          >
            ROSTER DIRECTORY
          </button>
          <button
            onClick={() => setSubView('duel')}
            className={`px-4 py-2 text-xs font-bold font-mono rounded-lg transition-all border-none cursor-pointer outline-none ${
              subView === 'duel' 
                ? 'bg-[#EF1A2D] text-white shadow-xs font-black' 
                : 'text-gray-500 hover:text-black'
            }`}
          >
            1v1 DUEL ENGINE
          </button>
        </div>
      </div>

      {subView === 'directory' ? (
        <>
          {/* Interactive Search & Filter Deck */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white border border-gray-150 p-4 rounded-2xl shadow-xs">
            <span className="text-xs font-bold text-gray-600 font-mono">
              Active pilot files loaded: {filteredDrivers.length} / {DRIVERS_ROSTER.length}
            </span>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search driver name or acronym..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-50 border border-gray-200 focus:border-black text-xs px-4 py-2 rounded-xl outline-none transition-all w-full sm:w-56 font-mono"
              />
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-xs px-3 py-2 rounded-xl outline-none font-bold transition-all cursor-pointer font-sans"
              >
                <option value="all">All Constructor Teams</option>
                {filterTeams.map((team) => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid rendering with improved card layouts */}
          {filteredDrivers.length === 0 ? (
            <div className="py-24 text-center text-xs text-gray-400 font-mono uppercase bg-gray-50 border border-dashed border-gray-150 rounded-2xl">
              No drivers matched your search criteria.
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
                      className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none"
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

                      <div className="flex justify-between items-center gap-2">
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
                      <span className="bg-gray-50 border border-gray-150/45 px-2 py-1 rounded-md tracking-wider group-hover:bg-neutral-900 group-hover:text-white transition-all">
                        View Intelligence
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* INNOVATIVE 1v1 DUEL SIMULATOR LAYER */
        <div id="duel-simulation-deck" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Pick Drivers Section */}
          <div className="lg:col-span-4 bg-white border border-gray-250/70 p-5 md:p-6 rounded-2xl space-y-5 shadow-sm">
            <h3 className="text-sm font-black font-sans uppercase text-gray-900 tracking-wider flex items-center gap-1.5 pb-3 border-b border-gray-150">
              <Settings size={16} className="text-[#EF1A2D]" /> Configuration Deck
            </h3>

            {/* Selection row A */}
            <div className="space-y-1.5 bg-neutral-50/50 p-3 rounded-xl border border-gray-150">
              <label className="text-[10px] font-black tracking-widest text-[#EF1A2D] uppercase block font-mono">
                Pilot A (Left Lane)
              </label>
              <select
                value={driverA.driver_number}
                onChange={(e) => {
                  const target = DRIVERS_ROSTER.find(d => d.driver_number === parseInt(e.target.value));
                  if (target) setDriverA(target);
                }}
                className="w-full bg-white border border-gray-200 px-3 py-2 rounded-lg text-xs font-semibold outline-none focus:border-black cursor-pointer"
              >
                {DRIVERS_ROSTER.map(d => (
                  <option key={d.driver_number} value={d.driver_number}>
                     #{d.driver_number} - {d.full_name} ({d.name_acronym})
                  </option>
                ))}
              </select>

              {/* Options Pilot A */}
              <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px]">
                <div>
                  <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block font-sans mb-0.5">Tyre</label>
                  <select
                    value={tyreA}
                    onChange={(e) => setTyreA(e.target.value)}
                    className="w-full bg-white border border-gray-200 px-1 py-1 rounded text-[9px] uppercase font-bold outline-none cursor-pointer"
                  >
                    <option value="soft">🔴 Soft</option>
                    <option value="medium">🟡 Med</option>
                    <option value="hard">⚪ Hard</option>
                    <option value="inter">🟢 Int</option>
                    <option value="wet">🔵 Wet</option>
                  </select>
                </div>

                <div>
                  <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block font-sans mb-0.5">Aero</label>
                  <select
                    value={aeroA}
                    onChange={(e) => setAeroA(e.target.value)}
                    className="w-full bg-white border border-gray-200 px-1 py-1 rounded text-[9px] uppercase font-bold outline-none cursor-pointer"
                  >
                    <option value="high">HighDF</option>
                    <option value="balanced">Bal</option>
                    <option value="low">LowDrag</option>
                  </select>
                </div>

                <div>
                  <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block font-sans mb-0.5">Strategy</label>
                  <select
                    value={stratA}
                    onChange={(e) => setStratA(e.target.value)}
                    className="w-full bg-white border border-gray-200 px-1 py-1 rounded text-[9px] uppercase font-bold outline-none cursor-pointer"
                  >
                    <option value="attack">Attack</option>
                    <option value="balanced">Bal</option>
                    <option value="defend">Defend</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Selection row B */}
            <div className="space-y-1.5 bg-neutral-50/50 p-3 rounded-xl border border-gray-150">
              <label className="text-[10px] font-black tracking-widest text-[#229971] uppercase block font-mono">
                Pilot B (Right Lane)
              </label>
              <select
                value={driverB.driver_number}
                onChange={(e) => {
                  const target = DRIVERS_ROSTER.find(d => d.driver_number === parseInt(e.target.value));
                  if (target) setDriverB(target);
                }}
                className="w-full bg-white border border-gray-200 px-3 py-2 rounded-lg text-xs font-semibold outline-none focus:border-black cursor-pointer"
              >
                {DRIVERS_ROSTER.map(d => (
                  <option key={d.driver_number} value={d.driver_number}>
                     #{d.driver_number} - {d.full_name} ({d.name_acronym})
                  </option>
                ))}
              </select>

              {/* Options Pilot B */}
              <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px]">
                <div>
                  <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block font-sans mb-0.5">Tyre</label>
                  <select
                    value={tyreB}
                    onChange={(e) => setTyreB(e.target.value)}
                    className="w-full bg-white border border-gray-200 px-1 py-1 rounded text-[9px] uppercase font-bold outline-none cursor-pointer"
                  >
                    <option value="soft">🔴 Soft</option>
                    <option value="medium">🟡 Med</option>
                    <option value="hard">⚪ Hard</option>
                    <option value="inter">🟢 Int</option>
                    <option value="wet">🔵 Wet</option>
                  </select>
                </div>

                <div>
                  <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block font-sans mb-0.5">Aero</label>
                  <select
                    value={aeroB}
                    onChange={(e) => setAeroB(e.target.value)}
                    className="w-full bg-white border border-gray-200 px-1 py-1 rounded text-[9px] uppercase font-bold outline-none cursor-pointer"
                  >
                    <option value="high">HighDF</option>
                    <option value="balanced">Bal</option>
                    <option value="low">LowDrag</option>
                  </select>
                </div>

                <div>
                  <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block font-sans mb-0.5">Strategy</label>
                  <select
                    value={stratB}
                    onChange={(e) => setStratB(e.target.value)}
                    className="w-full bg-white border border-gray-200 px-1 py-1 rounded text-[9px] uppercase font-bold outline-none cursor-pointer"
                  >
                    <option value="attack">Attack</option>
                    <option value="balanced">Bal</option>
                    <option value="defend">Defend</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Scenario selection */}
            <div className="space-y-1 bg-neutral-50/50 p-3 rounded-xl border border-gray-150">
              <label className="text-[10px] font-black tracking-widest text-neutral-500 uppercase block font-mono">
                Track Condition & Weather
              </label>
              <select
                value={selectedScenario.id}
                onChange={(e) => {
                  const target = TRACK_SCENARIOS.find(s => s.id === e.target.value);
                  if (target) setSelectedScenario(target);
                }}
                className="w-full bg-white border border-gray-200 px-3 py-2 rounded-lg text-xs font-semibold outline-none focus:border-black cursor-pointer"
              >
                {TRACK_SCENARIOS.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.type})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-gray-400 font-mono leading-tight mt-1.5">
                Favored attribute: <strong className="text-neutral-750 uppercase">{selectedScenario.favoredStat}</strong>. {selectedScenario.description}
              </p>
            </div>

            {/* Action Simulator trigger */}
            <button
              onClick={handleStartDuelSim}
              disabled={isSimulating}
              className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-850 text-white font-black rounded-xl text-xs uppercase tracking-widest font-mono transition-colors border-none cursor-pointer disabled:opacity-50"
            >
              {isSimulating ? 'SIMULATING TRACK OUTCOMES...' : '⚡ INITIALIZE TELEMETRY SIMULATION'}
            </button>
          </div>

          {/* SIMULATION VISUAL SCREEN */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Split Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card A */}
              <div 
                className="bg-white border rounded-2xl p-5 space-y-4 relative overflow-hidden transition-all shadow-xs"
                style={{ borderTop: `6px solid #${driverA.team_colour}` }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-mono text-gray-400">PILOT A</h4>
                    <h3 className="text-xl font-black text-neutral-950">{driverA.full_name}</h3>
                    <span className="text-xs text-gray-500 font-mono">{driverA.team_name}</span>
                  </div>
                  <strong className="text-3xl font-mono" style={{ color: `#${driverA.team_colour}` }}>OVR {driverA.stats.overall}</strong>
                </div>

                <div className="space-y-2 border-t border-gray-100 pt-3 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="text-gray-400 uppercase">Favored ({selectedScenario.favoredStat}):</span>
                    <strong className="text-neutral-800 font-bold">{driverA.stats[selectedScenario.favoredStat]}</strong>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-gray-400 uppercase">React Speed rating:</span>
                    <strong className="text-neutral-800 font-bold">{driverA.stats.speed}</strong>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-gray-400 uppercase">Racecraft rating:</span>
                    <strong className="text-neutral-800 font-bold">{driverA.stats.racecraft}</strong>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-gray-400 uppercase">Spatial Awareness:</span>
                    <strong className="text-neutral-800 font-bold">{driverA.stats.awareness}</strong>
                  </div>
                </div>

                {simWinner && (
                  <div className="border-t border-gray-100 pt-3 text-center bg-gray-50 rounded-lg p-2 font-mono text-xs">
                    Estimated Match Rating: <strong className="text-[#EF1A2D]">{scoreA} PTS</strong>
                  </div>
                )}
              </div>

              {/* Card B */}
              <div 
                className="bg-white border rounded-2xl p-5 space-y-4 relative overflow-hidden transition-all shadow-xs"
                style={{ borderTop: `6px solid #${driverB.team_colour}` }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-mono text-gray-400">PILOT B</h4>
                    <h3 className="text-xl font-black text-neutral-950">{driverB.full_name}</h3>
                    <span className="text-xs text-gray-500 font-mono">{driverB.team_name}</span>
                  </div>
                  <strong className="text-3xl font-mono" style={{ color: `#${driverB.team_colour}` }}>OVR {driverB.stats.overall}</strong>
                </div>

                <div className="space-y-2 border-t border-gray-100 pt-3 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="text-gray-400 uppercase">Favored ({selectedScenario.favoredStat}):</span>
                    <strong className="text-neutral-800 font-bold">{driverB.stats[selectedScenario.favoredStat]}</strong>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-gray-400 uppercase">React Speed rating:</span>
                    <strong className="text-neutral-800 font-bold">{driverB.stats.speed}</strong>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-gray-400 uppercase">Racecraft rating:</span>
                    <strong className="text-neutral-800 font-bold">{driverB.stats.racecraft}</strong>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-gray-400 uppercase">Spatial Awareness:</span>
                    <strong className="text-neutral-800 font-bold">{driverB.stats.awareness}</strong>
                  </div>
                </div>

                {simWinner && (
                  <div className="border-t border-gray-100 pt-3 text-center bg-gray-50 rounded-lg p-2 font-mono text-xs">
                    Estimated Match Rating: <strong className="text-[#EF1A2D]">{scoreB} PTS</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Commentary Realtime Terminal Dashboard */}
            <div className="bg-neutral-950 border border-neutral-850 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
                <span className="text-xs font-black font-mono uppercase text-white tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping mr-1" /> telemetry live simulator feed
                </span>
                
                <span className="text-[10px] font-mono text-neutral-450 uppercase">
                  GP OUTCOME INDEX
                </span>
              </div>

              <div id="sim-commentary-screen" className="space-y-4 min-h-[160px] max-h-[300px] overflow-y-auto font-mono text-xs text-neutral-300">
                {simCommentary.length === 0 ? (
                  <p className="text-neutral-500 italic text-center pt-8">
                    Select distinct pilots and trigger simulation grid telemetry logs to view results...
                  </p>
                ) : (
                  <div className="space-y-3.5">
                    {simCommentary.map((line, idx) => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        key={idx}
                        className={`p-3 rounded-lg border leading-relaxed ${
                          idx === simCommentary.length - 1 && simWinner
                            ? 'bg-[#EF1A2D]/10 text-white border-[#EF1A2D]/35 font-extrabold'
                            : 'bg-neutral-900/65 text-neutral-300 border-neutral-800'
                        }`}
                      >
                        {line}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Outcome Banner */}
              <AnimatePresence>
                {simWinner && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 bg-gradient-to-r from-neutral-900 to-neutral-850 rounded-xl border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4"
                  >
                    <div className="space-y-1 text-center md:text-left">
                      <span className="text-[9px] text-[#EF1A2D] font-mono uppercase tracking-widest font-black leading-none bg-[#EF1A2D]/10 px-2.5 py-1 rounded">
                        Simulated Podium Champion
                      </span>
                      <h4 className="text-lg font-black text-white font-sans mt-1.5 uppercase leading-none">
                        {simWinner.full_name}
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-mono">
                        Secures the top step of the telemetry match. Average match Delta: +{(Math.abs(scoreA - scoreB) / 2).toFixed(1)} points.
                      </p>
                    </div>

                    <div className="p-3 bg-[#EF1A2D] text-white rounded-xl shadow-lg border border-red-500/20 text-center flex items-center gap-1.5">
                      <Trophy size={16} />
                      <span className="text-xs font-black font-sans uppercase tracking-wider">
                        VICTORY
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
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
                  <span>Interactive Intelligence Ratings</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Rating slides */}
                  <div className="space-y-3 bg-neutral-50/50 border border-gray-150/40 p-4 rounded-xl">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono flex items-center gap-1 mb-2">
                      <Gauge size={12} /> Core Profile Ratings
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 font-sans font-medium flex items-center gap-1">
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
                          Racecraft / Overtakes
                        </span>
                        <strong className="font-mono text-[#EF1A2D]">{selectedDriver.stats.racecraft}</strong>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#EF1A2D] h-full rounded-full" style={{ width: `${selectedDriver.stats.racecraft}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 font-sans font-medium flex items-center gap-1">
                          Paddock Awareness
                        </span>
                        <strong className="font-mono text-[#EF1A2D]">{selectedDriver.stats.awareness}</strong>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#EF1A2D] h-full rounded-full" style={{ width: `${selectedDriver.stats.awareness}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 font-sans font-medium flex items-center gap-1">
                          Absolute Pace
                        </span>
                        <strong className="font-mono text-[#EF1A2D]">{selectedDriver.stats.pace}</strong>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#EF1A2D] h-full rounded-full" style={{ width: `${selectedDriver.stats.pace}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Advanced Telemetry Profiles */}
                  {(() => {
                    const intel = getEnrichedIntelligence(selectedDriver);
                    return (
                      <div className="space-y-3 bg-red-50/30 border border-dashed border-red-200/60 p-4 rounded-xl">
                        <div className="text-[10px] text-[#EF1A2D] font-bold uppercase tracking-wider font-mono flex items-center gap-1 mb-2">
                          <Cpu size={12} className="animate-pulse" /> Advanced Telemetry
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600 font-sans font-medium">Wet Competency</span>
                            <strong className="font-mono text-neutral-850">{intel.wetComp}</strong>
                          </div>
                          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#EF1A2D] h-full rounded-full" style={{ width: `${intel.wetComp}%` }} />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600 font-sans font-medium">Tyre Thermodynamic</span>
                            <strong className="font-mono text-neutral-850">{intel.tyreMgmt}</strong>
                          </div>
                          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#EF1A2D] h-full rounded-full" style={{ width: `${intel.tyreMgmt}%` }} />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600 font-sans font-medium">Aero Qualifying Trim</span>
                            <strong className="font-mono text-neutral-850">{intel.qualTrim}</strong>
                          </div>
                          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#EF1A2D] h-full rounded-full" style={{ width: `${intel.qualTrim}%` }} />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600 font-sans font-medium">Lap Delta Consistency</span>
                            <strong className="font-mono text-neutral-850">{intel.consistency}</strong>
                          </div>
                          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#EF1A2D] h-full rounded-full" style={{ width: `${intel.consistency}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })()}

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
