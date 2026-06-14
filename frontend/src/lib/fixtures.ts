export const MATCH_FIXTURES = [
  { id: 1, stage: 'Match phare', avail: true, home: { name: 'France', code: 'FRA', flag: '🇫🇷' }, away: { name: 'Sénégal', code: 'SEN', flag: '🇸🇳' }, date: '16 Juin 2026', time: '19:30', stadium: 'New York New Jersey Stadium', city: 'New York', price: '80', places: '12 450' },
  { id: 2, stage: 'Match phare', avail: true, home: { name: 'Brésil', code: 'BRA', flag: '🇧🇷' }, away: { name: 'Maroc', code: 'MAR', flag: '🇲🇦' }, date: '13 Juin 2026', time: '20:30', stadium: 'New York New Jersey Stadium', city: 'New York', price: '80', places: '11 980' },
  { id: 3, stage: 'Match phare', avail: true, home: { name: 'États-Unis', code: 'USA', flag: '🇺🇸' }, away: { name: 'Paraguay', code: 'PAR', flag: '🇵🇾' }, date: '12 Juin 2026', time: '22:00', stadium: 'Los Angeles Stadium', city: 'Los Angeles', price: '80', places: '13 200' },
  { id: 4, stage: 'Match phare', avail: true, home: { name: 'Argentine', code: 'ARG', flag: '🇦🇷' }, away: { name: 'Algérie', code: 'ALG', flag: '🇩🇿' }, date: '16 Juin 2026', time: '21:30', stadium: 'Kansas City Stadium', city: 'Kansas City', price: '80', places: '10 850' },
  { id: 5, stage: 'Match phare', avail: true, home: { name: 'Angleterre', code: 'ENG', flag: '🏴' }, away: { name: 'Croatie', code: 'CRO', flag: '🇭🇷' }, date: '17 Juin 2026', time: '18:00', stadium: 'Dallas Stadium', city: 'Dallas', price: '80', places: '12 100' },
  { id: 6, stage: 'Match phare', avail: true, home: { name: 'Mexique', code: 'MEX', flag: '🇲🇽' }, away: { name: 'Afrique du Sud', code: 'RSA', flag: '🇿🇦' }, date: '11 Juin 2026', time: '18:30', stadium: 'Mexico City Stadium', city: 'Mexico', price: '80', places: '13 500' },
  { id: 7, stage: 'Match phare', avail: true, home: { name: 'Canada', code: 'CAN', flag: '🇨🇦' }, away: { name: 'Bosnie-Herzégovine', code: 'BIH', flag: '🇧🇦' }, date: '12 Juin 2026', time: '19:00', stadium: 'Toronto Stadium', city: 'Toronto', price: '80', places: '11 640' },
];
export type FixtureMatch = {
  id: number;
  stage: string;
  home: { name: string; code: string; flag: string };
  away: { name: string; code: string; flag: string };
  date: string;
  time: string;
  stadium: string;
  city: string;
  price: string;
  available: number;
  featured?: boolean;
};

export const FIXTURE_MATCHES: FixtureMatch[] = [
  { id: 1, stage: 'Match phare', home: { name: 'France', code: 'FRA', flag: '🇫🇷' }, away: { name: 'Sénégal', code: 'SEN', flag: '🇸🇳' }, date: '16 Juin 2026', time: '19:30', stadium: 'New York New Jersey Stadium', city: 'New York', price: '80', available: 12450 },
  { id: 2, stage: 'Match phare', home: { name: 'Brésil', code: 'BRA', flag: '🇧🇷' }, away: { name: 'Maroc', code: 'MAR', flag: '🇲🇦' }, date: '13 Juin 2026', time: '20:30', stadium: 'New York New Jersey Stadium', city: 'New York', price: '80', available: 11820 },
  { id: 3, stage: 'Match phare', home: { name: 'États-Unis', code: 'USA', flag: '🇺🇸' }, away: { name: 'Paraguay', code: 'PAR', flag: '🇵🇾' }, date: '12 Juin 2026', time: '22:00', stadium: 'Los Angeles Stadium', city: 'Los Angeles', price: '80', available: 13240 },
  { id: 4, stage: 'Match phare', home: { name: 'Argentine', code: 'ARG', flag: '🇦🇷' }, away: { name: 'Algérie', code: 'ALG', flag: '🇩🇿' }, date: '16 Juin 2026', time: '21:30', stadium: 'Kansas City Stadium', city: 'Kansas City', price: '80', available: 10980 },
  { id: 5, stage: 'Match phare', home: { name: 'Angleterre', code: 'ENG', flag: '🏴' }, away: { name: 'Croatie', code: 'CRO', flag: '🇭🇷' }, date: '17 Juin 2026', time: '18:00', stadium: 'Dallas Stadium', city: 'Dallas', price: '80', available: 12610 },
  { id: 6, stage: 'Match phare', home: { name: 'Mexique', code: 'MEX', flag: '🇲🇽' }, away: { name: 'Afrique du Sud', code: 'RSA', flag: '🇿🇦' }, date: '11 Juin 2026', time: '18:30', stadium: 'Mexico City Stadium', city: 'Mexico', price: '80', available: 13050 },
  { id: 7, stage: 'Match phare', home: { name: 'Canada', code: 'CAN', flag: '🇨🇦' }, away: { name: 'Bosnie-Herzégovine', code: 'BIH', flag: '🇧🇦' }, date: '12 Juin 2026', time: '19:00', stadium: 'Toronto Stadium', city: 'Toronto', price: '80', available: 11140 },
  { id: 8, stage: 'Match phare', home: { name: 'Allemagne', code: 'GER', flag: '🇩🇪' }, away: { name: 'Curaçao', code: 'CUW', flag: '🇨🇼' }, date: '14 Juin 2026', time: '17:30', stadium: 'Houston Stadium', city: 'Houston', price: '80', available: 10480 },
];
