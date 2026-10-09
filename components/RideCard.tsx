import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { RideQuote, PROVIDERS } from '../constants/providers';

interface Props {
  quote: RideQuote;
  isBest: boolean;
  onBook: () => void;
}

const RIDE_TYPE_LABELS: Record<string, string> = {
  auto: 'Auto',
  bike: 'Bike',
  mini: 'Mini',
  sedan: 'Sedan',
  suv: 'SUV',
};

const RIDE_TYPE_ICONS: Record<string, string> = {
  auto: '\u{1F6FA}',
  bike: '\u{1F3CD}',
  mini: '\u{1F697}',
  sedan: '\u{1F698}',
  suv: '\u{1F699}',
};

export default function RideCard({ quote, isBest, onBook }: Props) {
  const provider = PROVIDERS[quote.provider];

  return (
    <TouchableOpacity
      style={[styles.card, isBest && styles.bestCard]}
      onPress={onBook}
      activeOpacity={0.7}
    >
      {isBest && (
        <View style={styles.bestBadge}>
          <Text style={styles.bestBadgeText}>BEST PICK</Text>
        </View>
      )}

      <View style={styles.topRow}>
        <View style={[styles.providerBadge, { backgroundColor: provider.color }]}>
          <Text style={styles.providerLogo}>{provider.logo}</Text>
        </View>
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{provider.displayName}</Text>
          <Text style={styles.rideType}>
            {RIDE_TYPE_ICONS[quote.rideType]} {RIDE_TYPE_LABELS[quote.rideType]}
          </Text>
        </View>
        <View style={styles.priceSection}>
          <Text style={styles.price}>{'₹'}{quote.estimatedFare}</Text>
          {quote.fareRange && (
            <Text style={styles.fareRange}>
              {'₹'}{quote.fareRange.low} - {'₹'}{quote.fareRange.high}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>ETA</Text>
          <Text style={styles.detailValue}>{quote.etaMinutes} min</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Distance</Text>
          <Text style={styles.detailValue}>{quote.distance} km</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Duration</Text>
          <Text style={styles.detailValue}>{quote.duration} min</Text>
        </View>
        {quote.surgeMultiplier > 1 && (
          <View style={styles.detailItem}>
            <Text style={styles.surgeLabel}>Surge</Text>
            <Text style={styles.surgeValue}>{quote.surgeMultiplier}x</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={[styles.bookButton, { backgroundColor: provider.color }]} onPress={onBook}>
        <Text style={styles.bookButtonText}>Book {provider.displayName}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  bestCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  bestBadge: {
    position: 'absolute',
    top: -1,
    right: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderBottomLeftRadius: BorderRadius.sm,
    borderBottomRightRadius: BorderRadius.sm,
  },
  bestBadgeText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '700' },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  providerBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  providerLogo: { color: '#fff', fontWeight: '800', fontSize: FontSize.lg },
  providerInfo: { flex: 1 },
  providerName: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  rideType: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  priceSection: { alignItems: 'flex-end' },
  price: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  fareRange: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  detailsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  detailItem: { flex: 1, alignItems: 'center' },
  detailLabel: { fontSize: FontSize.xs, color: Colors.textTertiary },
  detailValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginTop: 2 },
  surgeLabel: { fontSize: FontSize.xs, color: Colors.danger },
  surgeValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.danger, marginTop: 2 },
  bookButton: {
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
  },
  bookButtonText: { color: '#fff', fontWeight: '700', fontSize: FontSize.md },
});
