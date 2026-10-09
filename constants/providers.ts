import { Colors } from './theme';

export type ProviderName = 'uber' | 'ola' | 'rapido' | 'namma_yatri';
export type RideType = 'auto' | 'bike' | 'mini' | 'sedan' | 'suv';

export interface RideQuote {
  provider: ProviderName;
  rideType: RideType;
  estimatedFare: number;
  fareRange?: { low: number; high: number };
  etaMinutes: number;
  distance: number;
  duration: number;
  surgeMultiplier: number;
}

export interface Provider {
  name: ProviderName;
  displayName: string;
  color: string;
  logo: string;
  rideTypes: RideType[];
  deepLinkScheme: string;
}

export const PROVIDERS: Record<ProviderName, Provider> = {
  uber: {
    name: 'uber',
    displayName: 'Uber',
    color: Colors.uber,
    logo: 'U',
    rideTypes: ['auto', 'mini', 'sedan', 'suv'],
    deepLinkScheme: 'uber',
  },
  ola: {
    name: 'ola',
    displayName: 'Ola',
    color: Colors.ola,
    logo: 'O',
    rideTypes: ['auto', 'bike', 'mini', 'sedan', 'suv'],
    deepLinkScheme: 'olacabs',
  },
  rapido: {
    name: 'rapido',
    displayName: 'Rapido',
    color: Colors.rapido,
    logo: 'R',
    rideTypes: ['auto', 'bike'],
    deepLinkScheme: 'rapido',
  },
  namma_yatri: {
    name: 'namma_yatri',
    displayName: 'Namma Yatri',
    color: Colors.nammaYatri,
    logo: 'NY',
    rideTypes: ['auto'],
    deepLinkScheme: 'nammayatri',
  },
};

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  name?: string;
}

export interface ComparisonResult {
  id: string;
  pickup: LocationData;
  drop: LocationData;
  quotes: RideQuote[];
  bestQuote: RideQuote;
  timestamp: number;
  distance: number;
}
