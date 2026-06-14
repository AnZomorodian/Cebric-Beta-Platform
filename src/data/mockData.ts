import { SeasonData, DriverStanding, ConstructorStanding, Race, RaceResult } from '../types';

export const TEAM_COLORS: Record<string, string> = {
  mercedes: 'text-[#00A19B] border-[#00A19B]',
  ferrari: 'text-[#EF1A2D] border-[#EF1A2D]',
  red_bull: 'text-[#3671C6] border-[#3671C6]',
  mclaren: 'text-[#FF8000] border-[#FF8000]',
  alpine: 'text-[#0093CC] border-[#0093CC]',
  haas: 'text-[#B6BABD] border-[#B6BABD]',
  aston_martin: 'text-[#006F62] border-[#006F62]',
  rb: 'text-[#6600CC] border-[#6600CC]',
  williams: 'text-[#37BEDD] border-[#37BEDD]',
  sauber: 'text-[#52e252] border-[#52e252]',
  unknown: 'text-gray-400 border-gray-400'
};

export const TEAM_BG: Record<string, string> = {
  mercedes: 'bg-[#002B2A] text-[#00A19B] bg-opacity-10',
  ferrari: 'bg-[#3A0A0E] text-[#EF1A2D] bg-opacity-10',
  red_bull: 'bg-[#0B1D3A] text-[#3671C6] bg-opacity-10',
  mclaren: 'bg-[#3C1A00] text-[#FF8000] bg-opacity-10',
  alpine: 'bg-[#002433] text-[#0093CC] bg-opacity-10',
  haas: 'bg-[#2E2F30] text-[#B6BABD] bg-opacity-10',
  aston_martin: 'bg-[#001D1A] text-[#006F62] bg-opacity-10',
  rb: 'bg-[#18003C] text-[#6600CC] bg-opacity-10',
  williams: 'bg-[#0E2C33] text-[#37BEDD] bg-opacity-10',
  sauber: 'bg-[#113111] text-[#52e252] bg-opacity-10',
  audi: 'bg-[#1F0404] text-[#E60000] bg-opacity-10',
  unknown: 'bg-gray-100 text-gray-400'
};

export const TEAM_HEX: Record<string, string> = {
  mercedes: '#00A19B',
  ferrari: '#EF1A2D',
  red_bull: '#3671C6',
  mclaren: '#FF8000',
  alpine: '#0093CC',
  haas: '#B6BABD',
  aston_martin: '#006F62',
  rb: '#6600CC',
  williams: '#37BEDD',
  sauber: '#52e252',
  audi: '#E60000',
  unknown: '#9ca3af'
};

export const getConstructorId = (name: string): string => {
  const norm = name.toLowerCase();
  if (norm.includes('mercedes')) return 'mercedes';
  if (norm.includes('ferrari')) return 'ferrari';
  if (norm.includes('red bull')) return 'red_bull';
  if (norm.includes('mclaren')) return 'mclaren';
  if (norm.includes('alpine')) return 'alpine';
  if (norm.includes('haas')) return 'haas';
  if (norm.includes('aston martin')) return 'aston_martin';
  if (norm.includes('rb ') || norm.includes('visa') || norm.includes('racing bulls')) return 'rb';
  if (norm.includes('sauber') || norm.includes('kick') || norm.includes('stake')) return 'sauber';
  if (norm.includes('williams')) return 'williams';
  return 'unknown';
};

// 2026 Mock Data (Matches Mockup Image Styling precisely)
export const mock2026Data: SeasonData = {
  season: '2026',
  driverStandings: [
    {
      position: '1',
      positionText: '1',
      points: '156',
      wins: '4',
      Driver: {
        driverId: 'antonelli',
        permanentNumber: '12',
        code: 'ANT',
        url: 'https://en.wikipedia.org/wiki/Andrea_Kimi_Antonelli',
        givenName: 'Andrea Kimi',
        familyName: 'Antonelli',
        dateOfBirth: '2006-08-25',
        nationality: 'Italian'
      },
      Constructors: [{ constructorId: 'mercedes', name: 'Mercedes', nationality: 'German', url: '' }]
    },
    {
      position: '2',
      positionText: '2',
      points: '115',
      wins: '2',
      Driver: {
        driverId: 'hamilton',
        permanentNumber: '44',
        code: 'HAM',
        url: 'https://en.wikipedia.org/wiki/Lewis_Hamilton',
        givenName: 'Lewis',
        familyName: 'Hamilton',
        dateOfBirth: '1985-01-07',
        nationality: 'British'
      },
      Constructors: [{ constructorId: 'ferrari', name: 'Ferrari', nationality: 'Italian', url: '' }]
    },
    {
      position: '3',
      positionText: '3',
      points: '106',
      wins: '1',
      Driver: {
        driverId: 'russell',
        permanentNumber: '63',
        code: 'RUS',
        url: 'https://en.wikipedia.org/wiki/George_Russell_(racing_driver)',
        givenName: 'George',
        familyName: 'Russell',
        dateOfBirth: '1998-02-15',
        nationality: 'British'
      },
      Constructors: [{ constructorId: 'mercedes', name: 'Mercedes', nationality: 'German', url: '' }]
    },
    {
      position: '4',
      positionText: '4',
      points: '75',
      wins: '0',
      Driver: {
        driverId: 'leclerc',
        permanentNumber: '16',
        code: 'LEC',
        url: 'https://en.wikipedia.org/wiki/Charles_Leclerc',
        givenName: 'Charles',
        familyName: 'Leclerc',
        dateOfBirth: '1997-10-16',
        nationality: 'Monegasque'
      },
      Constructors: [{ constructorId: 'ferrari', name: 'Ferrari', nationality: 'Italian', url: '' }]
    },
    {
      position: '5',
      positionText: '5',
      points: '73',
      wins: '0',
      Driver: {
        driverId: 'norris',
        permanentNumber: '4',
        code: 'NOR',
        url: 'https://en.wikipedia.org/wiki/Lando_Norris',
        givenName: 'Lando',
        familyName: 'Norris',
        dateOfBirth: '1999-11-13',
        nationality: 'British'
      },
      Constructors: [{ constructorId: 'mclaren', name: 'McLaren', nationality: 'British', url: '' }]
    },
    {
      position: '6',
      positionText: '6',
      points: '68',
      wins: '0',
      Driver: {
        driverId: 'piastri',
        permanentNumber: '81',
        code: 'PIA',
        url: 'https://en.wikipedia.org/wiki/Oscar_Piastri',
        givenName: 'Oscar',
        familyName: 'Piastri',
        dateOfBirth: '2001-04-06',
        nationality: 'Australian'
      },
      Constructors: [{ constructorId: 'mclaren', name: 'McLaren', nationality: 'British', url: '' }]
    },
    {
      position: '7',
      positionText: '7',
      points: '55',
      wins: '0',
      Driver: {
        driverId: 'verstappen',
        permanentNumber: '1',
        code: 'VER',
        url: 'https://en.wikipedia.org/wiki/Max_Verstappen',
        givenName: 'Max',
        familyName: 'Verstappen',
        dateOfBirth: '1997-09-30',
        nationality: 'Dutch'
      },
      Constructors: [{ constructorId: 'red_bull', name: 'Red Bull', nationality: 'Austrian', url: '' }]
    },
    {
      position: '8',
      positionText: '8',
      points: '41',
      wins: '0',
      Driver: {
        driverId: 'gasly',
        permanentNumber: '10',
        code: 'GAS',
        url: 'https://en.wikipedia.org/wiki/Pierre_Gasly',
        givenName: 'Pierre',
        familyName: 'Gasly',
        dateOfBirth: '1996-02-07',
        nationality: 'French'
      },
      Constructors: [{ constructorId: 'alpine', name: 'Alpine F1 Team', nationality: 'French', url: '' }]
    },
    {
      position: '9',
      positionText: '9',
      points: '34',
      wins: '0',
      Driver: {
        driverId: 'hadjar',
        permanentNumber: '25',
        code: 'HAD',
        url: 'https://en.wikipedia.org/wiki/Isack_Hadjar',
        givenName: 'Isack',
        familyName: 'Hadjar',
        dateOfBirth: '2004-09-28',
        nationality: 'French'
      },
      Constructors: [{ constructorId: 'red_bull', name: 'Red Bull', nationality: 'Austrian', url: '' }]
    },
    {
      position: '10',
      positionText: '10',
      points: '28',
      wins: '0',
      Driver: {
        driverId: 'lawson',
        permanentNumber: '30',
        code: 'LAW',
        url: 'https://en.wikipedia.org/wiki/Liam_Lawson',
        givenName: 'Liam',
        familyName: 'Lawson',
        dateOfBirth: '2002-02-11',
        nationality: 'New Zealander'
      },
      Constructors: [{ constructorId: 'rb', name: 'RB F1 Team', nationality: 'Italian', url: '' }]
    },
    {
      position: '11',
      positionText: '11',
      points: '24',
      wins: '0',
      Driver: {
        driverId: 'alonso',
        permanentNumber: '14',
        code: 'ALO',
        url: 'https://en.wikipedia.org/wiki/Fernando_Alonso',
        givenName: 'Fernando',
        familyName: 'Alonso',
        dateOfBirth: '1981-07-29',
        nationality: 'Spanish'
      },
      Constructors: [{ constructorId: 'aston_martin', name: 'Aston Martin', nationality: 'British', url: '' }]
    },
    {
      position: '12',
      positionText: '12',
      points: '18',
      wins: '0',
      Driver: {
        driverId: 'albon',
        permanentNumber: '23',
        code: 'ALB',
        url: 'https://en.wikipedia.org/wiki/Alex_Albon',
        givenName: 'Alexander',
        familyName: 'Albon',
        dateOfBirth: '1996-03-23',
        nationality: 'Thai'
      },
      Constructors: [{ constructorId: 'williams', name: 'Williams', nationality: 'British', url: '' }]
    },
    {
      position: '13',
      positionText: '13',
      points: '14',
      wins: '0',
      Driver: {
        driverId: 'sainz',
        permanentNumber: '55',
        code: 'SAI',
        url: 'https://en.wikipedia.org/wiki/Carlos_Sainz_Jr.',
        givenName: 'Carlos',
        familyName: 'Sainz',
        dateOfBirth: '1994-09-01',
        nationality: 'Spanish'
      },
      Constructors: [{ constructorId: 'williams', name: 'Williams', nationality: 'British', url: '' }]
    },
    {
      position: '14',
      positionText: '14',
      points: '10',
      wins: '0',
      Driver: {
        driverId: 'stroll',
        permanentNumber: '18',
        code: 'STR',
        url: 'https://en.wikipedia.org/wiki/Lance_Stroll',
        givenName: 'Lance',
        familyName: 'Stroll',
        dateOfBirth: '1998-10-29',
        nationality: 'Canadian'
      },
      Constructors: [{ constructorId: 'aston_martin', name: 'Aston Martin', nationality: 'British', url: '' }]
    },
    {
      position: '15',
      positionText: '15',
      points: '8',
      wins: '0',
      Driver: {
        driverId: 'ocon',
        permanentNumber: '31',
        code: 'OCO',
        url: 'https://en.wikipedia.org/wiki/Esteban_Ocon',
        givenName: 'Esteban',
        familyName: 'Ocon',
        dateOfBirth: '1996-09-17',
        nationality: 'French'
      },
      Constructors: [{ constructorId: 'haas', name: 'Haas F1 Team', nationality: 'American', url: '' }]
    },
    {
      position: '16',
      positionText: '16',
      points: '6',
      wins: '0',
      Driver: {
        driverId: 'tsunoda',
        permanentNumber: '22',
        code: 'TSU',
        url: 'https://en.wikipedia.org/wiki/Yuki_Tsunoda',
        givenName: 'Yuki',
        familyName: 'Tsunoda',
        dateOfBirth: '2000-05-11',
        nationality: 'Japanese'
      },
      Constructors: [{ constructorId: 'rb', name: 'RB F1 Team', nationality: 'Italian', url: '' }]
    },
    {
      position: '17',
      positionText: '17',
      points: '4',
      wins: '0',
      Driver: {
        driverId: 'doohan',
        permanentNumber: '12',
        code: 'DOO',
        url: 'https://en.wikipedia.org/wiki/Jack_Doohan_(racing_driver)',
        givenName: 'Jack',
        familyName: 'Doohan',
        dateOfBirth: '2003-01-20',
        nationality: 'Australian'
      },
      Constructors: [{ constructorId: 'alpine', name: 'Alpine F1 Team', nationality: 'French', url: '' }]
    },
    {
      position: '18',
      positionText: '18',
      points: '2',
      wins: '0',
      Driver: {
        driverId: 'hulkenberg',
        permanentNumber: '27',
        code: 'HUL',
        url: 'https://en.wikipedia.org/wiki/Nico_H%C3%BClkenberg',
        givenName: 'Nico',
        familyName: 'Hülkenberg',
        dateOfBirth: '1987-08-19',
        nationality: 'German'
      },
      Constructors: [{ constructorId: 'audi', name: 'Audi F1 Team', nationality: 'German', url: '' }]
    },
    {
      position: '19',
      positionText: '19',
      points: '1',
      wins: '0',
      Driver: {
        driverId: 'bearman',
        permanentNumber: '87',
        code: 'BEA',
        url: 'https://en.wikipedia.org/wiki/Oliver_Bearman',
        givenName: 'Oliver',
        familyName: 'Bearman',
        dateOfBirth: '2005-05-08',
        nationality: 'British'
      },
      Constructors: [{ constructorId: 'haas', name: 'Haas F1 Team', nationality: 'American', url: '' }]
    },
    {
      position: '20',
      positionText: '20',
      points: '0',
      wins: '0',
      Driver: {
        driverId: 'bortoleto',
        permanentNumber: '5',
        code: 'BOR',
        url: 'https://en.wikipedia.org/wiki/Gabriel_Bortoleto',
        givenName: 'Gabriel',
        familyName: 'Bortoleto',
        dateOfBirth: '2004-10-14',
        nationality: 'Brazilian'
      },
      Constructors: [{ constructorId: 'audi', name: 'Audi F1 Team', nationality: 'German', url: '' }]
    }
  ],
  constructorStandings: [
    {
      position: '1',
      positionText: '1',
      points: '262',
      wins: '5',
      Constructor: { constructorId: 'mercedes', name: 'Mercedes', nationality: 'German', url: '' }
    },
    {
      position: '2',
      positionText: '2',
      points: '190',
      wins: '2',
      Constructor: { constructorId: 'ferrari', name: 'Ferrari', nationality: 'Italian', url: '' }
    },
    {
      position: '3',
      positionText: '3',
      points: '141',
      wins: '0',
      Constructor: { constructorId: 'mclaren', name: 'McLaren', nationality: 'British', url: '' }
    },
    {
      position: '4',
      positionText: '4',
      points: '89',
      wins: '0',
      Constructor: { constructorId: 'red_bull', name: 'Red Bull Racing', nationality: 'Austrian', url: '' }
    },
    {
      position: '5',
      positionText: '5',
      points: '41',
      wins: '0',
      Constructor: { constructorId: 'alpine', name: 'Alpine F1 Team', nationality: 'French', url: '' }
    },
    {
      position: '6',
      positionText: '6',
      points: '34',
      wins: '0',
      Constructor: { constructorId: 'rb', name: 'Visa Cash App RB', nationality: 'Italian', url: '' }
    },
    {
      position: '7',
      positionText: '7',
      points: '24',
      wins: '0',
      Constructor: { constructorId: 'aston_martin', name: 'Aston Martin', nationality: 'British', url: '' }
    },
    {
      position: '8',
      positionText: '8',
      points: '18',
      wins: '0',
      Constructor: { constructorId: 'williams', name: 'Williams Racing', nationality: 'British', url: '' }
    }
  ],
  races: [
    {
      season: '2026',
      round: '1',
      url: '',
      raceName: 'Bahrain Grand Prix',
      Circuit: {
        circuitId: 'bahrain',
        circuitName: 'Bahrain International Circuit',
        url: '',
        Location: { lat: '26.0325', long: '50.5106', locality: 'Sakhir', country: 'Bahrain' }
      },
      date: '2026-03-07'
    },
    {
      season: '2026',
      round: '2',
      url: '',
      raceName: 'Saudi Arabian Grand Prix',
      Circuit: {
        circuitId: 'jeddah',
        circuitName: 'Jeddah Corniche Circuit',
        url: '',
        Location: { lat: '21.6319', long: '39.1044', locality: 'Jeddah', country: 'Saudi Arabia' }
      },
      date: '2026-03-21'
    },
    {
      season: '2026',
      round: '3',
      url: '',
      raceName: 'Australian Grand Prix',
      Circuit: {
        circuitId: 'albert_park',
        circuitName: 'Albert Park Circuit',
        url: '',
        Location: { lat: '-37.8497', long: '144.968', locality: 'Melbourne', country: 'Australia' }
      },
      date: '2026-04-05'
    },
    {
      season: '2026',
      round: '4',
      url: '',
      raceName: 'Japanese Grand Prix',
      Circuit: {
        circuitId: 'suzuka',
        circuitName: 'Suzuka Circuit',
        url: '',
        Location: { lat: '34.8431', long: '136.541', locality: 'Suzuka', country: 'Japan' }
      },
      date: '2026-04-19'
    },
    {
      season: '2026',
      round: '5',
      url: '',
      raceName: 'Miami Grand Prix',
      Circuit: {
        circuitId: 'miami',
        circuitName: 'Miami International Autodrome',
        url: '',
        Location: { lat: '25.9581', long: '-80.2389', locality: 'Miami', country: 'USA' }
      },
      date: '2026-05-03'
    },
    {
      season: '2026',
      round: '6',
      url: '',
      raceName: 'Monaco Grand Prix',
      Circuit: {
        circuitId: 'monaco',
        circuitName: 'Circuit de Monaco',
        url: '',
        Location: { lat: '43.7347', long: '7.42056', locality: 'Monte Carlo', country: 'Monaco' }
      },
      date: '2026-05-24'
    },
    {
      season: '2026',
      round: '7',
      url: '',
      raceName: 'Barcelona Grand Prix',
      Circuit: {
        circuitId: 'catalunya',
        circuitName: 'Circuit de Barcelona-Catalunya',
        url: '',
        Location: { lat: '41.57', long: '2.26111', locality: 'Montmeló', country: 'Spain' }
      },
      date: '2026-06-07'
    },
    {
      season: '2026',
      round: '8',
      url: '',
      raceName: 'Austrian Grand Prix',
      Circuit: {
        circuitId: 'red_bull_ring',
        circuitName: 'Red Bull Ring',
        url: '',
        Location: { lat: '47.2197', long: '14.7647', locality: 'Spielberg', country: 'Austria' }
      },
      date: '2026-06-28'
    },
    {
      season: '2026',
      round: '9',
      url: '',
      raceName: 'British Grand Prix',
      Circuit: {
        circuitId: 'silverstone',
        circuitName: 'Silverstone Circuit',
        url: '',
        Location: { lat: '52.0786', long: '-1.01694', locality: 'Silverstone', country: 'UK' }
      },
      date: '2026-07-12'
    },
    {
      season: '2026',
      round: '10',
      url: '',
      raceName: 'Hungarian Grand Prix',
      Circuit: {
        circuitId: 'hungaroring',
        circuitName: 'Hungaroring',
        url: '',
        Location: { lat: '47.5817', long: '19.2508', locality: 'Budapest', country: 'Hungary' }
      },
      date: '2026-08-02'
    },
    {
      season: '2026',
      round: '11',
      url: '',
      raceName: 'Belgian Grand Prix',
      Circuit: {
        circuitId: 'spa',
        circuitName: 'Circuit de Spa-Francorchamps',
        url: '',
        Location: { lat: '50.4372', long: '5.97139', locality: 'Spa-Francorchamps', country: 'Belgium' }
      },
      date: '2026-08-16'
    },
    {
      season: '2026',
      round: '12',
      url: '',
      raceName: 'Dutch Grand Prix',
      Circuit: {
        circuitId: 'zandvoort',
        circuitName: 'Circuit Zandvoort',
        url: '',
        Location: { lat: '52.3888', long: '4.54092', locality: 'Zandvoort', country: 'Netherlands' }
      },
      date: '2026-08-30'
    },
    {
      season: '2026',
      round: '13',
      url: '',
      raceName: 'Italian Grand Prix',
      Circuit: {
        circuitId: 'monza',
        circuitName: 'Autodromo Nazionale Monza',
        url: '',
        Location: { lat: '45.6156', long: '9.28111', locality: 'Monza', country: 'Italy' }
      },
      date: '2026-09-06'
    },
    {
      season: '2026',
      round: '14',
      url: '',
      raceName: 'Azerbaijan Grand Prix',
      Circuit: {
        circuitId: 'baku',
        circuitName: 'Baku City Circuit',
        url: '',
        Location: { lat: '40.3725', long: '49.8533', locality: 'Baku', country: 'Azerbaijan' }
      },
      date: '2026-09-20'
    },
    {
      season: '2026',
      round: '15',
      url: '',
      raceName: 'Singapore Grand Prix',
      Circuit: {
        circuitId: 'marina_bay',
        circuitName: 'Marina Bay Street Circuit',
        url: '',
        Location: { lat: '1.2914', long: '103.864', locality: 'Marina Bay', country: 'Singapore' }
      },
      date: '2026-10-04'
    },
    {
      season: '2026',
      round: '16',
      url: '',
      raceName: 'United States Grand Prix',
      Circuit: {
        circuitId: 'americas',
        circuitName: 'Circuit of the Americas',
        url: '',
        Location: { lat: '30.1328', long: '-97.6411', locality: 'Austin', country: 'USA' }
      },
      date: '2026-10-18'
    },
    {
      season: '2026',
      round: '17',
      url: '',
      raceName: 'Mexico City Grand Prix',
      Circuit: {
        circuitId: 'rodriguez',
        circuitName: 'Autódromo Hermanos Rodríguez',
        url: '',
        Location: { lat: '19.4042', long: '-99.0907', locality: 'Mexico City', country: 'Mexico' }
      },
      date: '2026-10-25'
    },
    {
      season: '2026',
      round: '18',
      url: '',
      raceName: 'São Paulo Grand Prix',
      Circuit: {
        circuitId: 'interlagos',
        circuitName: 'Autódromo José Carlos Pace',
        url: '',
        Location: { lat: '-23.7036', long: '-46.6997', locality: 'São Paulo', country: 'Brazil' }
      },
      date: '2026-11-08'
    },
    {
      season: '2026',
      round: '19',
      url: '',
      raceName: 'Las Vegas Grand Prix',
      Circuit: {
        circuitId: 'vegas',
        circuitName: 'Las Vegas Strip Circuit',
        url: '',
        Location: { lat: '36.1147', long: '-115.173', locality: 'Las Vegas', country: 'USA' }
      },
      date: '2026-11-21'
    },
    {
      season: '2026',
      round: '20',
      url: '',
      raceName: 'Qatar Grand Prix',
      Circuit: {
        circuitId: 'losail',
        circuitName: 'Lusail International Circuit',
        url: '',
        Location: { lat: '25.49', long: '51.4542', locality: 'Al Daayen', country: 'Qatar' }
      },
      date: '2026-11-29'
    },
    {
      season: '2026',
      round: '21',
      url: '',
      raceName: 'Abu Dhabi Grand Prix',
      Circuit: {
        circuitId: 'yas_marina',
        circuitName: 'Yas Marina Circuit',
        url: '',
        Location: { lat: '24.4672', long: '54.6031', locality: 'Abu Dhabi', country: 'UAE' }
      },
      date: '2026-12-06'
    },
    {
      season: '2026',
      round: '22',
      url: '',
      raceName: 'Chinese Grand Prix',
      Circuit: {
        circuitId: 'shanghai',
        circuitName: 'Shanghai International Circuit',
        url: '',
        Location: { lat: '31.3389', long: '121.22', locality: 'Shanghai', country: 'China' }
      },
      date: '2026-12-13'
    },
    {
      season: '2026',
      round: '23',
      url: '',
      raceName: 'Emilia Romagna Grand Prix',
      Circuit: {
        circuitId: 'imola',
        circuitName: 'Autodromo Enzo e Dino Ferrari',
        url: '',
        Location: { lat: '44.3439', long: '11.7167', locality: 'Imola', country: 'Italy' }
      },
      date: '2026-12-20'
    },
    {
      season: '2026',
      round: '24',
      url: '',
      raceName: 'Portuguese Grand Prix',
      Circuit: {
        circuitId: 'algarve',
        circuitName: 'Algarve International Circuit',
        url: '',
        Location: { lat: '37.2297', long: '-8.6267', locality: 'Portimão', country: 'Portugal' }
      },
      date: '2026-12-27'
    }
  ],
  nextRace: {
    season: '2026',
    round: '8',
    url: '',
    raceName: 'Austrian Grand Prix',
    Circuit: {
      circuitId: 'red_bull_ring',
      circuitName: 'Red Bull Ring',
      url: '',
      Location: { lat: '47.2197', long: '14.7647', locality: 'Spielberg', country: 'Austria' }
    },
    date: '2026-06-28'
  },
  lastRace: {
    season: '2026',
    round: '7',
    url: '',
    raceName: 'Barcelona Grand Prix',
    Circuit: {
      circuitId: 'catalunya',
      circuitName: 'Circuit de Barcelona-Catalunya',
      url: '',
      Location: { lat: '41.57', long: '2.26111', locality: 'Montmeló', country: 'Spain' }
    },
    date: '2026-06-07'
  },
  lastResults: [
    {
      number: '44',
      position: '1',
      positionText: '1',
      points: '25',
      Driver: {
        driverId: 'hamilton',
        permanentNumber: '44',
        code: 'HAM',
        url: '',
        givenName: 'Lewis',
        familyName: 'Hamilton',
        dateOfBirth: '',
        nationality: 'British'
      },
      Constructor: { constructorId: 'ferrari', name: 'Ferrari', nationality: 'Italian', url: '' },
      grid: '2',
      laps: '66',
      status: 'Finished',
      Time: { millis: '5548105', time: '1:32:28.105' }
    },
    {
      number: '63',
      position: '2',
      positionText: '2',
      points: '18',
      Driver: {
        driverId: 'russell',
        permanentNumber: '63',
        code: 'RUS',
        url: '',
        givenName: 'George',
        familyName: 'Russell',
        dateOfBirth: '',
        nationality: 'British'
      },
      Constructor: { constructorId: 'mercedes', name: 'Mercedes', nationality: 'German', url: '' },
      grid: '1',
      laps: '66',
      status: 'Finished',
      Time: { millis: '5567666', time: '+19.561' }
    },
    {
      number: '4',
      position: '3',
      positionText: '3',
      points: '15',
      Driver: {
        driverId: 'norris',
        permanentNumber: '4',
        code: 'NOR',
        url: '',
        givenName: 'Lando',
        familyName: 'Norris',
        dateOfBirth: '',
        nationality: 'British'
      },
      Constructor: { constructorId: 'mclaren', name: 'McLaren', nationality: 'British', url: '' },
      grid: '4',
      laps: '66',
      status: 'Finished',
      Time: { millis: '5571824', time: '+23.719' }
    },
    {
      number: '1',
      position: '4',
      positionText: '4',
      points: '12',
      Driver: {
        driverId: 'verstappen',
        permanentNumber: '1',
        code: 'VER',
        url: '',
        givenName: 'Max',
        familyName: 'Verstappen',
        dateOfBirth: '',
        nationality: 'Dutch'
      },
      Constructor: { constructorId: 'red_bull', name: 'Red Bull', nationality: 'Austrian', url: '' },
      grid: '3',
      laps: '66',
      status: 'Finished',
      Time: { millis: '5588602', time: '+40.497' }
    },
    {
      number: '81',
      position: '5',
      positionText: '5',
      points: '10',
      Driver: {
        driverId: 'piastri',
        permanentNumber: '81',
        code: 'PIA',
        url: '',
        givenName: 'Oscar',
        familyName: 'Piastri',
        dateOfBirth: '',
        nationality: 'Australian'
      },
      Constructor: { constructorId: 'mclaren', name: 'McLaren', nationality: 'British', url: '' },
      grid: '5',
      laps: '66',
      status: 'Finished',
      Time: { millis: '5606966', time: '+58.861' }
    },
    {
      number: '12',
      position: '6',
      positionText: '6',
      points: '8',
      Driver: {
        driverId: 'antonelli',
        permanentNumber: '12',
        code: 'ANT',
        url: '',
        givenName: 'Andrea Kimi',
        familyName: 'Antonelli',
        dateOfBirth: '',
        nationality: 'Italian'
      },
      Constructor: { constructorId: 'mercedes', name: 'Mercedes', nationality: 'German', url: '' },
      grid: '6',
      laps: '66',
      status: 'Finished',
      Time: { millis: '5610217', time: '+1:02.112' }
    },
    {
      number: '16',
      position: '7',
      positionText: '7',
      points: '6',
      Driver: {
        driverId: 'leclerc',
        permanentNumber: '16',
        code: 'LEC',
        url: '',
        givenName: 'Charles',
        familyName: 'Leclerc',
        dateOfBirth: '',
        nationality: 'Monegasque'
      },
      Constructor: { constructorId: 'ferrari', name: 'Ferrari', nationality: 'Italian', url: '' },
      grid: '7',
      laps: '66',
      status: 'Finished',
      Time: { millis: '5613523', time: '+1:05.418' }
    },
    {
      number: '10',
      position: '8',
      positionText: '8',
      points: '4',
      Driver: {
        driverId: 'gasly',
        permanentNumber: '10',
        code: 'GAS',
        url: '',
        givenName: 'Pierre',
        familyName: 'Gasly',
        dateOfBirth: '',
        nationality: 'French'
      },
      Constructor: { constructorId: 'alpine', name: 'Alpine F1 Team', nationality: 'French', url: '' },
      grid: '8',
      laps: '66',
      status: 'Finished',
      Time: { millis: '5620410', time: '+1:12.305' }
    }
  ]
};

// 2025 Simulated Fallback Data
export const mock2025Data: SeasonData = {
  season: '2025',
  driverStandings: [
    {
      position: '1',
      positionText: '1',
      points: '410',
      wins: '9',
      Driver: {
        driverId: 'verstappen',
        permanentNumber: '1',
        code: 'VER',
        url: '',
        givenName: 'Max',
        familyName: 'Verstappen',
        dateOfBirth: '1997-09-30',
        nationality: 'Dutch'
      },
      Constructors: [{ constructorId: 'red_bull', name: 'Red Bull Racing', nationality: 'Austrian', url: '' }]
    },
    {
      position: '2',
      positionText: '2',
      points: '372',
      wins: '6',
      Driver: {
        driverId: 'norris',
        permanentNumber: '4',
        code: 'NOR',
        url: '',
        givenName: 'Lando',
        familyName: 'Norris',
        dateOfBirth: '1999-11-13',
        nationality: 'British'
      },
      Constructors: [{ constructorId: 'mclaren', name: 'McLaren', nationality: 'British', url: '' }]
    },
    {
      position: '3',
      positionText: '3',
      points: '350',
      wins: '4',
      Driver: {
        driverId: 'leclerc',
        permanentNumber: '16',
        code: 'LEC',
        url: '',
        givenName: 'Charles',
        familyName: 'Leclerc',
        dateOfBirth: '1997-10-16',
        nationality: 'Monegasque'
      },
      Constructors: [{ constructorId: 'ferrari', name: 'Ferrari', nationality: 'Italian', url: '' }]
    },
    {
      position: '4',
      positionText: '4',
      points: '298',
      wins: '2',
      Driver: {
        driverId: 'piastri',
        permanentNumber: '81',
        code: 'PIA',
        url: '',
        givenName: 'Oscar',
        familyName: 'Piastri',
        dateOfBirth: '2001-04-06',
        nationality: 'Australian'
      },
      Constructors: [{ constructorId: 'mclaren', name: 'McLaren', nationality: 'British', url: '' }]
    },
    {
      position: '5',
      positionText: '5',
      points: '242',
      wins: '1',
      Driver: {
        driverId: 'hamilton',
        permanentNumber: '44',
        code: 'HAM',
        url: '',
        givenName: 'Lewis',
        familyName: 'Hamilton',
        dateOfBirth: '1985-01-07',
        nationality: 'British'
      },
      Constructors: [{ constructorId: 'mercedes', name: 'Mercedes', nationality: 'German', url: '' }]
    },
    {
      position: '6',
      positionText: '6',
      points: '215',
      wins: '1',
      Driver: {
        driverId: 'sainz',
        permanentNumber: '55',
        code: 'SAI',
        url: '',
        givenName: 'Carlos',
        familyName: 'Sainz',
        dateOfBirth: '1994-09-01',
        nationality: 'Spanish'
      },
      Constructors: [{ constructorId: 'ferrari', name: 'Ferrari', nationality: 'Italian', url: '' }]
    },
    {
      position: '7',
      positionText: '7',
      points: '210',
      wins: '1',
      Driver: {
        driverId: 'russell',
        permanentNumber: '63',
        code: 'RUS',
        url: '',
        givenName: 'George',
        familyName: 'Russell',
        dateOfBirth: '1998-02-15',
        nationality: 'British'
      },
      Constructors: [{ constructorId: 'mercedes', name: 'Mercedes', nationality: 'German', url: '' }]
    },
    {
      position: '8',
      positionText: '8',
      points: '145',
      wins: '0',
      Driver: {
        driverId: 'perez',
        permanentNumber: '11',
        code: 'PER',
        url: '',
        givenName: 'Sergio',
        familyName: 'Perez',
        dateOfBirth: '1990-01-26',
        nationality: 'Mexican'
      },
      Constructors: [{ constructorId: 'red_bull', name: 'Red Bull Racing', nationality: 'Austrian', url: '' }]
    }
  ],
  constructorStandings: [
    {
      position: '1',
      positionText: '1',
      points: '670',
      wins: '8',
      Constructor: { constructorId: 'mclaren', name: 'McLaren', nationality: 'British', url: '' }
    },
    {
      position: '2',
      positionText: '2',
      points: '565',
      wins: '5',
      Constructor: { constructorId: 'ferrari', name: 'Ferrari', nationality: 'Italian', url: '' }
    },
    {
      position: '3',
      positionText: '3',
      points: '555',
      wins: '9',
      Constructor: { constructorId: 'red_bull', name: 'Red Bull Racing', nationality: 'Austrian', url: '' }
    },
    {
      position: '4',
      positionText: '4',
      points: '452',
      wins: '2',
      Constructor: { constructorId: 'mercedes', name: 'Mercedes', nationality: 'German', url: '' }
    },
    {
      position: '5',
      positionText: '5',
      points: '98',
      wins: '0',
      Constructor: { constructorId: 'aston_martin', name: 'Aston Martin', nationality: 'British', url: '' }
    }
  ],
  races: [
    {
      season: '2025',
      round: '24',
      url: '',
      raceName: 'Abu Dhabi Grand Prix',
      Circuit: {
        circuitId: 'yas_marina',
        circuitName: 'Yas Marina Circuit',
        url: '',
        Location: { lat: '24.4672', long: '54.6031', locality: 'Abu Dhabi', country: 'UAE' }
      },
      date: '2025-12-07'
    }
  ],
  nextRace: {
    season: '2025',
    round: '24',
    url: '',
    raceName: 'Abu Dhabi Grand Prix',
    Circuit: {
      circuitId: 'yas_marina',
      circuitName: 'Yas Marina Circuit',
      url: '',
      Location: { lat: '24.4672', long: '54.6031', locality: 'Abu Dhabi', country: 'UAE' }
    },
    date: '2025-12-07'
  },
  lastRace: {
    season: '2025',
    round: '23',
    url: '',
    raceName: 'Qatar Grand Prix',
    Circuit: {
      circuitId: 'losail',
      circuitName: 'Lusail International Circuit',
      url: '',
      Location: { lat: '25.49', long: '51.4542', locality: 'Al Daayen', country: 'Qatar' }
    },
    date: '2025-11-30'
  },
  lastResults: [
    {
      number: '1',
      position: '1',
      positionText: '1',
      points: '25',
      Driver: {
        driverId: 'verstappen',
        permanentNumber: '1',
        code: 'VER',
        url: '',
        givenName: 'Max',
        familyName: 'Verstappen',
        dateOfBirth: '',
        nationality: 'Dutch'
      },
      Constructor: { constructorId: 'red_bull', name: 'Red Bull Racing', nationality: 'Austrian', url: '' },
      grid: '1',
      laps: '57',
      status: 'Finished',
      Time: { millis: '5102315', time: '1:25:02.315' }
    },
    {
      number: '4',
      position: '2',
      positionText: '2',
      points: '18',
      Driver: {
        driverId: 'norris',
        permanentNumber: '4',
        code: 'NOR',
        url: '',
        givenName: 'Lando',
        familyName: 'Norris',
        dateOfBirth: '',
        nationality: 'British'
      },
      Constructor: { constructorId: 'mclaren', name: 'McLaren', nationality: 'British', url: '' },
      grid: '2',
      laps: '57',
      status: 'Finished',
      Time: { millis: '5108422', time: '+6.107' }
    },
    {
      number: '16',
      position: '3',
      positionText: '3',
      points: '15',
      Driver: {
        driverId: 'leclerc',
        permanentNumber: '16',
        code: 'LEC',
        url: '',
        givenName: 'Charles',
        familyName: 'Leclerc',
        dateOfBirth: '',
        nationality: 'Monegasque'
      },
      Constructor: { constructorId: 'ferrari', name: 'Ferrari', nationality: 'Italian', url: '' },
      grid: '3',
      laps: '57',
      status: 'Finished',
      Time: { millis: '5115211', time: '+12.896' }
    }
  ]
};

// 2024 Historical Fallback Data
export const mock2024Data: SeasonData = {
  season: '2024',
  driverStandings: [
    {
      position: '1',
      positionText: '1',
      points: '437',
      wins: '9',
      Driver: {
        driverId: 'verstappen',
        permanentNumber: '1',
        code: 'VER',
        url: '',
        givenName: 'Max',
        familyName: 'Verstappen',
        dateOfBirth: '1997-09-30',
        nationality: 'Dutch'
      },
      Constructors: [{ constructorId: 'red_bull', name: 'Red Bull Racing', nationality: 'Austrian', url: '' }]
    },
    {
      position: '2',
      positionText: '2',
      points: '331',
      wins: '3',
      Driver: {
        driverId: 'norris',
        permanentNumber: '4',
        code: 'NOR',
        url: '',
        givenName: 'Lando',
        familyName: 'Norris',
        dateOfBirth: '1999-11-13',
        nationality: 'British'
      },
      Constructors: [{ constructorId: 'mclaren', name: 'McLaren', nationality: 'British', url: '' }]
    },
    {
      position: '3',
      positionText: '3',
      points: '307',
      wins: '3',
      Driver: {
        driverId: 'leclerc',
        permanentNumber: '16',
        code: 'LEC',
        url: '',
        givenName: 'Charles',
        familyName: 'Leclerc',
        dateOfBirth: '1997-10-16',
        nationality: 'Monegasque'
      },
      Constructors: [{ constructorId: 'ferrari', name: 'Ferrari', nationality: 'Italian', url: '' }]
    },
    {
      position: '4',
      positionText: '4',
      points: '262',
      wins: '2',
      Driver: {
        driverId: 'piastri',
        permanentNumber: '81',
        code: 'PIA',
        url: '',
        givenName: 'Oscar',
        familyName: 'Piastri',
        dateOfBirth: '2001-04-06',
        nationality: 'Australian'
      },
      Constructors: [{ constructorId: 'mclaren', name: 'McLaren', nationality: 'British', url: '' }]
    },
    {
      position: '5',
      positionText: '5',
      points: '244',
      wins: '2',
      Driver: {
        driverId: 'sainz',
        permanentNumber: '55',
        code: 'SAI',
        url: '',
        givenName: 'Carlos',
        familyName: 'Sainz',
        dateOfBirth: '1994-09-01',
        nationality: 'Spanish'
      },
      Constructors: [{ constructorId: 'ferrari', name: 'Ferrari', nationality: 'Italian', url: '' }]
    },
    {
      position: '6',
      positionText: '6',
      points: '228',
      wins: '2',
      Driver: {
        driverId: 'russell',
        permanentNumber: '63',
        code: 'RUS',
        url: '',
        givenName: 'George',
        familyName: 'Russell',
        dateOfBirth: '1998-02-15',
        nationality: 'British'
      },
      Constructors: [{ constructorId: 'mercedes', name: 'Mercedes', nationality: 'German', url: '' }]
    },
    {
      position: '7',
      positionText: '7',
      points: '190',
      wins: '2',
      Driver: {
        driverId: 'hamilton',
        permanentNumber: '44',
        code: 'HAM',
        url: '',
        givenName: 'Lewis',
        familyName: 'Hamilton',
        dateOfBirth: '1985-01-07',
        nationality: 'British'
      },
      Constructors: [{ constructorId: 'mercedes', name: 'Mercedes', nationality: 'German', url: '' }]
    },
    {
      position: '8',
      positionText: '8',
      points: '152',
      wins: '0',
      Driver: {
        driverId: 'perez',
        permanentNumber: '11',
        code: 'PER',
        url: '',
        givenName: 'Sergio',
        familyName: 'Perez',
        dateOfBirth: '1990-01-26',
        nationality: 'Mexican'
      },
      Constructors: [{ constructorId: 'red_bull', name: 'Red Bull Racing', nationality: 'Austrian', url: '' }]
    }
  ],
  constructorStandings: [
    {
      position: '1',
      positionText: '1',
      points: '651',
      wins: '5',
      Constructor: { constructorId: 'mclaren', name: 'McLaren', nationality: 'British', url: '' }
    },
    {
      position: '2',
      positionText: '2',
      points: '611',
      wins: '5',
      Constructor: { constructorId: 'ferrari', name: 'Ferrari', nationality: 'Italian', url: '' }
    },
    {
      position: '3',
      positionText: '3',
      points: '589',
      wins: '9',
      Constructor: { constructorId: 'red_bull', name: 'Red Bull Racing', nationality: 'Austrian', url: '' }
    },
    {
      position: '4',
      positionText: '4',
      points: '418',
      wins: '4',
      Constructor: { constructorId: 'mercedes', name: 'Mercedes', nationality: 'German', url: '' }
    },
    {
      position: '5',
      positionText: '5',
      points: '86',
      wins: '0',
      Constructor: { constructorId: 'aston_martin', name: 'Aston Martin', nationality: 'British', url: '' }
    }
  ],
  races: [
    {
      season: '2024',
      round: '24',
      url: '',
      raceName: 'Abu Dhabi Grand Prix',
      Circuit: {
        circuitId: 'yas_marina',
        circuitName: 'Yas Marina Circuit',
        url: '',
        Location: { lat: '24.4672', long: '54.6031', locality: 'Abu Dhabi', country: 'UAE' }
      },
      date: '2024-12-08'
    }
  ],
  nextRace: {
    season: '2024',
    round: '24',
    url: '',
    raceName: 'Abu Dhabi Grand Prix',
    Circuit: {
      circuitId: 'yas_marina',
      circuitName: 'Yas Marina Circuit',
      url: '',
      Location: { lat: '24.4672', long: '54.6031', locality: 'Abu Dhabi', country: 'UAE' }
    },
    date: '2024-12-08'
  },
  lastRace: {
    season: '2024',
    round: '23',
    url: '',
    raceName: 'Qatar Grand Prix',
    Circuit: {
      circuitId: 'losail',
      circuitName: 'Lusail International Circuit',
      url: '',
      Location: { lat: '25.49', long: '51.4542', locality: 'Al Daayen', country: 'Qatar' }
    },
    date: '2024-12-01'
  },
  lastResults: [
    {
      number: '1',
      position: '1',
      positionText: '1',
      points: '25',
      Driver: {
        driverId: 'verstappen',
        permanentNumber: '1',
        code: 'VER',
        url: '',
        givenName: 'Max',
        familyName: 'Verstappen',
        dateOfBirth: '',
        nationality: 'Dutch'
      },
      Constructor: { constructorId: 'red_bull', name: 'Red Bull Racing', nationality: 'Austrian', url: '' },
      grid: '2',
      laps: '57',
      status: 'Finished',
      Time: { millis: '5024102', time: '1:23:44.102' }
    },
    {
      number: '4',
      position: '2',
      positionText: '2',
      points: '18',
      Driver: {
        driverId: 'norris',
        permanentNumber: '4',
        code: 'NOR',
        url: '',
        givenName: 'Lando',
        familyName: 'Norris',
        dateOfBirth: '',
        nationality: 'British'
      },
      Constructor: { constructorId: 'mclaren', name: 'McLaren', nationality: 'British', url: '' },
      grid: '1',
      laps: '57',
      status: 'Finished',
      Time: { millis: '5027582', time: '+3.480' }
    },
    {
      number: '16',
      position: '3',
      positionText: '3',
      points: '15',
      Driver: {
        driverId: 'leclerc',
        permanentNumber: '16',
        code: 'LEC',
        url: '',
        givenName: 'Charles',
        familyName: 'Leclerc',
        dateOfBirth: '',
        nationality: 'Monegasque'
      },
      Constructor: { constructorId: 'ferrari', name: 'Ferrari', nationality: 'Italian', url: '' },
      grid: '3',
      laps: '57',
      status: 'Finished',
      Time: { millis: '5042210', time: '+18.108' }
    }
  ]
};

export const getSeasonMockData = (season: string): SeasonData | null => {
  if (season === '2026') return mock2026Data;
  if (season === '2025') return mock2025Data;
  if (season === '2024') return mock2024Data;
  return null;
};
