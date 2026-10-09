import * as SQLite from 'expo-sqlite';
import { ComparisonResult, LocationData, RideQuote } from '../constants/providers';

let db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('ridesmart.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS comparisons (
        id TEXT PRIMARY KEY,
        pickup_lat REAL, pickup_lng REAL, pickup_address TEXT,
        drop_lat REAL, drop_lng REAL, drop_address TEXT,
        distance REAL, timestamp INTEGER
      );
      CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        comparison_id TEXT,
        provider TEXT, ride_type TEXT,
        fare REAL, eta INTEGER, surge REAL,
        FOREIGN KEY(comparison_id) REFERENCES comparisons(id)
      );
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        comparison_id TEXT, provider TEXT, ride_type TEXT,
        fare REAL, timestamp INTEGER,
        FOREIGN KEY(comparison_id) REFERENCES comparisons(id)
      );
    `);
  }
  return db;
}

export async function saveComparison(result: ComparisonResult): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    `INSERT OR REPLACE INTO comparisons VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    result.id, result.pickup.latitude, result.pickup.longitude, result.pickup.address,
    result.drop.latitude, result.drop.longitude, result.drop.address,
    result.distance, result.timestamp
  );

  for (const q of result.quotes) {
    await database.runAsync(
      `INSERT INTO quotes (comparison_id, provider, ride_type, fare, eta, surge) VALUES (?, ?, ?, ?, ?, ?)`,
      result.id, q.provider, q.rideType, q.estimatedFare, q.etaMinutes, q.surgeMultiplier
    );
  }
}

export async function saveBooking(comparisonId: string, quote: RideQuote): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    `INSERT INTO bookings (comparison_id, provider, ride_type, fare, timestamp) VALUES (?, ?, ?, ?, ?)`,
    comparisonId, quote.provider, quote.rideType, quote.estimatedFare, Date.now()
  );
}

export async function getHistory(limit = 50): Promise<ComparisonResult[]> {
  const database = await getDb();
  const rows = await database.getAllAsync<any>(
    `SELECT * FROM comparisons ORDER BY timestamp DESC LIMIT ?`, limit
  );

  const results: ComparisonResult[] = [];
  for (const row of rows) {
    const quotes = await database.getAllAsync<any>(
      `SELECT * FROM quotes WHERE comparison_id = ?`, row.id
    );
    results.push({
      id: row.id,
      pickup: { latitude: row.pickup_lat, longitude: row.pickup_lng, address: row.pickup_address },
      drop: { latitude: row.drop_lat, longitude: row.drop_lng, address: row.drop_address },
      quotes: quotes.map((q: any) => ({
        provider: q.provider,
        rideType: q.ride_type,
        estimatedFare: q.fare,
        etaMinutes: q.eta,
        surgeMultiplier: q.surge,
        distance: row.distance,
        duration: 0,
      })),
      bestQuote: null as any,
      distance: row.distance,
      timestamp: row.timestamp,
    });
  }
  return results;
}

export async function getRouteHistory(pickup: LocationData, drop: LocationData): Promise<ComparisonResult[]> {
  const database = await getDb();
  const rows = await database.getAllAsync<any>(
    `SELECT * FROM comparisons
     WHERE ABS(pickup_lat - ?) < 0.005 AND ABS(pickup_lng - ?) < 0.005
       AND ABS(drop_lat - ?) < 0.005 AND ABS(drop_lng - ?) < 0.005
     ORDER BY timestamp DESC LIMIT 20`,
    pickup.latitude, pickup.longitude, drop.latitude, drop.longitude
  );

  return rows.map((row: any) => ({
    id: row.id,
    pickup: { latitude: row.pickup_lat, longitude: row.pickup_lng, address: row.pickup_address },
    drop: { latitude: row.drop_lat, longitude: row.drop_lng, address: row.drop_address },
    quotes: [],
    bestQuote: null as any,
    distance: row.distance,
    timestamp: row.timestamp,
  }));
}

export async function getPriceStats(provider: string, rideType: string): Promise<{ avg: number; min: number; max: number; count: number } | null> {
  const database = await getDb();
  const row = await database.getFirstAsync<any>(
    `SELECT AVG(fare) as avg, MIN(fare) as min, MAX(fare) as max, COUNT(*) as count
     FROM quotes WHERE provider = ? AND ride_type = ?`,
    provider, rideType
  );
  if (!row || row.count === 0) return null;
  return { avg: Math.round(row.avg), min: row.min, max: row.max, count: row.count };
}
