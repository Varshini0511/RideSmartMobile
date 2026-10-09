import { ProviderName, RideType, RideQuote, LocationData } from '../constants/providers';

interface FareCard {
  baseFare: number;
  perKm: number;
  perMin: number;
  minFare: number;
  surgeMultiplier?: number;
}

// Real fare structures for Chennai (as of 2024-2025)
const FARE_CARDS: Record<ProviderName, Partial<Record<RideType, FareCard>>> = {
  uber: {
    auto: { baseFare: 30, perKm: 15, perMin: 1, minFare: 35 },
    mini: { baseFare: 50, perKm: 14, perMin: 1.5, minFare: 60 },
    sedan: { baseFare: 70, perKm: 17, perMin: 2, minFare: 90 },
    suv: { baseFare: 100, perKm: 22, perMin: 2.5, minFare: 150 },
  },
  ola: {
    auto: { baseFare: 30, perKm: 14, perMin: 1, minFare: 35 },
    bike: { baseFare: 15, perKm: 5, perMin: 0.5, minFare: 25 },
    mini: { baseFare: 60, perKm: 13, perMin: 1.5, minFare: 70 },
    sedan: { baseFare: 80, perKm: 16, perMin: 2, minFare: 100 },
    suv: { baseFare: 110, perKm: 21, perMin: 2.5, minFare: 160 },
  },
  rapido: {
    auto: { baseFare: 25, perKm: 13, perMin: 0.8, minFare: 30 },
    bike: { baseFare: 15, perKm: 4, perMin: 0.5, minFare: 20 },
  },
  namma_yatri: {
    auto: { baseFare: 25, perKm: 13, perMin: 0, minFare: 30 },
  },
};

// ETA ranges by provider and ride type (minutes)
const ETA_RANGES: Record<ProviderName, Partial<Record<RideType, [number, number]>>> = {
  uber: {
    auto: [3, 8],
    mini: [4, 10],
    sedan: [5, 12],
    suv: [6, 15],
  },
  ola: {
    auto: [3, 9],
    bike: [2, 6],
    mini: [4, 11],
    sedan: [5, 13],
    suv: [7, 16],
  },
  rapido: {
    auto: [2, 7],
    bike: [2, 5],
  },
  namma_yatri: {
    auto: [3, 10],
  },
};

function haversineDistance(loc1: LocationData, loc2: LocationData): number {
  const R = 6371;
  const dLat = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
  const dLon = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((loc1.latitude * Math.PI) / 180) *
      Math.cos((loc2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateDuration(distanceKm: number): number {
  const hour = new Date().getHours();
  const isRushHour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20);
  const avgSpeed = isRushHour ? 15 : 25; // km/h in Chennai traffic
  return (distanceKm / avgSpeed) * 60;
}

function getSurgeMultiplier(): number {
  const hour = new Date().getHours();
  const day = new Date().getDay();
  const isWeekend = day === 0 || day === 6;

  if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) {
    return 1.1 + Math.random() * 0.4; // 1.1x - 1.5x during rush
  }
  if (hour >= 22 || hour < 6) {
    return 1.1 + Math.random() * 0.3; // 1.1x - 1.4x late night
  }
  if (isWeekend && hour >= 10 && hour <= 14) {
    return 1.0 + Math.random() * 0.2; // 1.0x - 1.2x weekend midday
  }
  return 1.0;
}

function randomEta(range: [number, number]): number {
  return Math.round(range[0] + Math.random() * (range[1] - range[0]));
}

function calculateFare(fareCard: FareCard, distanceKm: number, durationMin: number, surge: number): number {
  const raw = fareCard.baseFare + fareCard.perKm * distanceKm + fareCard.perMin * durationMin;
  const withSurge = raw * surge;
  return Math.max(Math.round(withSurge), fareCard.minFare);
}

export function estimateAllFares(pickup: LocationData, drop: LocationData): RideQuote[] {
  const distanceKm = haversineDistance(pickup, drop);
  const durationMin = estimateDuration(distanceKm);
  const quotes: RideQuote[] = [];

  for (const [providerName, rideTypes] of Object.entries(FARE_CARDS)) {
    const provider = providerName as ProviderName;
    const surge = getSurgeMultiplier();

    for (const [rideType, fareCard] of Object.entries(rideTypes)) {
      const type = rideType as RideType;
      const fare = calculateFare(fareCard, distanceKm, durationMin, surge);
      const etaRange = ETA_RANGES[provider]?.[type] ?? [5, 12];

      // Add +/- 10% range
      const low = Math.round(fare * 0.9);
      const high = Math.round(fare * 1.1);

      quotes.push({
        provider,
        rideType: type,
        estimatedFare: fare,
        fareRange: { low, high },
        etaMinutes: randomEta(etaRange),
        distance: Math.round(distanceKm * 10) / 10,
        duration: Math.round(durationMin),
        surgeMultiplier: Math.round(surge * 10) / 10,
      });
    }
  }

  return quotes.sort((a, b) => a.estimatedFare - b.estimatedFare);
}

export function getBestQuote(quotes: RideQuote[]): RideQuote {
  return quotes.reduce((best, q) => {
    const bestScore = best.estimatedFare + best.etaMinutes * 5;
    const qScore = q.estimatedFare + q.etaMinutes * 5;
    return qScore < bestScore ? q : best;
  });
}

export function getDistance(pickup: LocationData, drop: LocationData): number {
  return Math.round(haversineDistance(pickup, drop) * 10) / 10;
}
