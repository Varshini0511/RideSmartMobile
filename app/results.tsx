import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import RideCard from '../components/RideCard';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { LocationData, RideQuote, RideType, ComparisonResult } from '../constants/providers';
import { estimateAllFares, getBestQuote, getDistance } from '../services/fareEstimator';
import { openRideApp } from '../services/deepLinks';
import { saveComparison, saveBooking } from '../services/history';

type FilterType = 'all' | RideType;

export default function ResultsScreen() {
  const params = useLocalSearchParams<{
    pickupLat: string; pickupLng: string; pickupAddr: string; pickupName: string;
    dropLat: string; dropLng: string; dropAddr: string; dropName: string;
  }>();
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<RideQuote[]>([]);
  const [comparisonId, setComparisonId] = useState('');

  const pickup: LocationData = {
    latitude: parseFloat(params.pickupLat!),
    longitude: parseFloat(params.pickupLng!),
    address: params.pickupAddr!,
    name: params.pickupName,
  };

  const drop: LocationData = {
    latitude: parseFloat(params.dropLat!),
    longitude: parseFloat(params.dropLng!),
    address: params.dropAddr!,
    name: params.dropName,
  };

  useEffect(() => {
    const fetchQuotes = async () => {
      setLoading(true);
      // Simulate network delay for realism
      await new Promise((r) => setTimeout(r, 800));
      const results = estimateAllFares(pickup, drop);
      setQuotes(results);

      const id = `cmp_${Date.now()}`;
      setComparisonId(id);

      try {
        await saveComparison({
          id,
          pickup,
          drop,
          quotes: results,
          bestQuote: getBestQuote(results),
          distance: getDistance(pickup, drop),
          timestamp: Date.now(),
        });
      } catch {}
      setLoading(false);
    };
    fetchQuotes();
  }, []);

  const filteredQuotes = useMemo(() => {
    if (filter === 'all') return quotes;
    return quotes.filter((q) => q.rideType === filter);
  }, [quotes, filter]);

  const bestQuote = useMemo(() => {
    if (filteredQuotes.length === 0) return null;
    return getBestQuote(filteredQuotes);
  }, [filteredQuotes]);

  const rideTypeFilters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Auto', value: 'auto' },
    { label: 'Bike', value: 'bike' },
    { label: 'Mini', value: 'mini' },
    { label: 'Sedan', value: 'sedan' },
    { label: 'SUV', value: 'suv' },
  ];

  const handleBook = async (quote: RideQuote) => {
    try {
      await saveBooking(comparisonId, quote);
    } catch {}

    const opened = await openRideApp(quote.provider, pickup, drop);
    if (!opened) {
      Alert.alert(
        'App not installed',
        `${quote.provider} app is not installed. Would you like to install it?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Install', onPress: () => openRideApp(quote.provider, pickup, drop) },
        ]
      );
    }
  };

  const distance = getDistance(pickup, drop);
  const savings = quotes.length >= 2
    ? quotes[quotes.length - 1].estimatedFare - quotes[0].estimatedFare
    : 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Comparing rides across all apps...</Text>
        <Text style={styles.loadingSubtext}>Checking Uber, Ola, Rapido & Namma Yatri</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Route summary */}
      <View style={styles.routeSummary}>
        <View style={styles.routeRow}>
          <View style={[styles.routeDot, { backgroundColor: Colors.secondary }]} />
          <Text style={styles.routeText} numberOfLines={1}>{pickup.name || pickup.address}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeRow}>
          <View style={[styles.routeDot, { backgroundColor: Colors.danger }]} />
          <Text style={styles.routeText} numberOfLines={1}>{drop.name || drop.address}</Text>
        </View>
        <Text style={styles.routeDistance}>{distance} km</Text>
      </View>

      {/* Savings banner */}
      {savings > 0 && (
        <View style={styles.savingsBanner}>
          <Text style={styles.savingsText}>
            You save up to {'₹'}{savings} by comparing!
          </Text>
        </View>
      )}

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {rideTypeFilters.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results count */}
      <Text style={styles.resultCount}>{filteredQuotes.length} rides found</Text>

      {/* Ride cards */}
      {filteredQuotes.map((quote, i) => (
        <RideCard
          key={`${quote.provider}-${quote.rideType}`}
          quote={quote}
          isBest={bestQuote !== null && quote.provider === bestQuote.provider && quote.rideType === bestQuote.rideType}
          onBook={() => handleBook(quote)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xl * 2 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text, marginTop: Spacing.md },
  loadingSubtext: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  routeSummary: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center' },
  routeDot: { width: 10, height: 10, borderRadius: 5, marginRight: Spacing.sm },
  routeText: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: Colors.border,
    marginLeft: 4,
    marginVertical: 4,
  },
  routeDistance: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  savingsBanner: {
    backgroundColor: '#e6f4ea',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#34a853',
  },
  savingsText: { color: '#137333', fontWeight: '700', fontSize: FontSize.sm, textAlign: 'center' },
  filterRow: { marginBottom: Spacing.md },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  resultCount: { fontSize: FontSize.sm, color: Colors.textTertiary, marginBottom: Spacing.md },
});
