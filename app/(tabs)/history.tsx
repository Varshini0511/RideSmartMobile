import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { ComparisonResult, PROVIDERS } from '../../constants/providers';
import { getHistory } from '../../services/history';

export default function HistoryScreen() {
  const [history, setHistory] = useState<ComparisonResult[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getHistory(30);
      setHistory(data);
    } catch {}
    setLoading(false);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return d.toLocaleDateString();
  };

  const renderItem = ({ item }: { item: ComparisonResult }) => {
    const cheapest = item.quotes.length > 0
      ? item.quotes.reduce((a, b) => a.estimatedFare < b.estimatedFare ? a : b)
      : null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          router.push({
            pathname: '/results',
            params: {
              pickupLat: item.pickup.latitude.toString(),
              pickupLng: item.pickup.longitude.toString(),
              pickupAddr: item.pickup.address,
              pickupName: item.pickup.name || '',
              dropLat: item.drop.latitude.toString(),
              dropLng: item.drop.longitude.toString(),
              dropAddr: item.drop.address,
              dropName: item.drop.name || '',
            },
          });
        }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
          <Text style={styles.distance}>{item.distance} km</Text>
        </View>
        <View style={styles.routeRow}>
          <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
          <Text style={styles.routeText} numberOfLines={1}>{item.pickup.address}</Text>
        </View>
        <View style={styles.routeRow}>
          <View style={[styles.dot, { backgroundColor: Colors.danger }]} />
          <Text style={styles.routeText} numberOfLines={1}>{item.drop.address}</Text>
        </View>
        {cheapest && (
          <View style={styles.cheapestRow}>
            <Text style={styles.cheapestLabel}>Cheapest:</Text>
            <Text style={styles.cheapestValue}>
              {PROVIDERS[cheapest.provider].displayName} — {'₹'}{cheapest.estimatedFare}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Loading history...</Text>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>{'\u{1F4CB}'}</Text>
        <Text style={styles.emptyTitle}>No rides yet</Text>
        <Text style={styles.emptyText}>Your ride comparisons will appear here</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={history}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      style={{ backgroundColor: Colors.background }}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: Spacing.md },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  time: { fontSize: FontSize.xs, color: Colors.textTertiary },
  distance: { fontSize: FontSize.xs, color: Colors.textTertiary },
  routeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: Spacing.sm },
  routeText: { flex: 1, fontSize: FontSize.sm, color: Colors.text },
  cheapestRow: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  cheapestLabel: { fontSize: FontSize.xs, color: Colors.textTertiary, marginRight: Spacing.xs },
  cheapestValue: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.secondary },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  emptyText: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
});
