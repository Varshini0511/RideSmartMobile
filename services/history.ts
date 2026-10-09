import { ComparisonResult, LocationData, RideQuote } from '../constants/providers';

export async function saveComparison(_result: ComparisonResult): Promise<void> {}
export async function saveBooking(_comparisonId: string, _quote: RideQuote): Promise<void> {}
export async function getHistory(_limit = 50): Promise<ComparisonResult[]> { return []; }
export async function getRouteHistory(_pickup: LocationData, _drop: LocationData): Promise<ComparisonResult[]> { return []; }
export async function getPriceStats(_provider: string, _rideType: string): Promise<{ avg: number; min: number; max: number; count: number } | null> { return null; }
