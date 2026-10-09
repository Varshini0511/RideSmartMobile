import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ExpoLocation from 'expo-location';
import LocationInput from '../../components/LocationInput';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { LocationData } from '../../constants/providers';

export default function HomeScreen() {
  const router = useRouter();
  const [pickup, setPickup] = useState<LocationData | null>(null);
  const [drop, setDrop] = useState<LocationData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const useCurrentLocation = useCallback(async () => {
    setLoadingLocation(true);
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is needed for pickup.');
        return;
      }
      const loc = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.High });
      const [address] = await ExpoLocation.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      const addressStr = [address?.name, address?.street, address?.city].filter(Boolean).join(', ');
      setPickup({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        address: addressStr || 'Current Location',
        name: address?.name || 'Current Location',
      });
    } catch (e) {
      Alert.alert('Error', 'Could not get current location.');
    } finally {
      setLoadingLocation(false);
    }
  }, []);

  const handleCompare = () => {
    if (!pickup || !drop) {
      Alert.alert('Missing locations', 'Please enter both pickup and drop locations.');
      return;
    }
    router.push({
      pathname: '/results',
      params: {
        pickupLat: pickup.latitude.toString(),
        pickupLng: pickup.longitude.toString(),
        pickupAddr: pickup.address,
        pickupName: pickup.name || '',
        dropLat: drop.latitude.toString(),
        dropLng: drop.longitude.toString(),
        dropAddr: drop.address,
        dropName: drop.name || '',
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Where to?</Text>
          <Text style={styles.subtitle}>Compare rides across Uber, Ola, Rapido & Namma Yatri</Text>
        </View>

        {/* Location inputs */}
        <View style={styles.locationSection}>
          <View style={styles.locationLine} />

          <LocationInput
            label="Pickup"
            icon="P"
            value={pickup}
            onSelect={setPickup}
            placeholder="Enter pickup location..."
          />

          <LocationInput
            label="Drop"
            icon="D"
            value={drop}
            onSelect={setDrop}
            placeholder="Where are you going?"
          />

          <TouchableOpacity style={styles.currentLocationBtn} onPress={useCurrentLocation} disabled={loadingLocation}>
            {loadingLocation ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <>
                <Text style={styles.locationIcon}>{'\u{1F4CD}'}</Text>
                <Text style={styles.currentLocationText}>Use current location as pickup</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Compare button */}
        <TouchableOpacity
          style={[styles.compareButton, (!pickup || !drop) && styles.compareButtonDisabled]}
          onPress={handleCompare}
          disabled={!pickup || !drop}
        >
          <Text style={styles.compareButtonText}>Compare Rides</Text>
          <Text style={styles.compareButtonSub}>Find the cheapest ride across all apps</Text>
        </TouchableOpacity>

        {/* Quick info */}
        <View style={styles.providersGrid}>
          {[
            { name: 'Uber', color: Colors.uber, types: 'Auto, Mini, Sedan, SUV' },
            { name: 'Ola', color: Colors.ola, types: 'Auto, Bike, Mini, Sedan, SUV' },
            { name: 'Rapido', color: Colors.rapido, types: 'Auto, Bike' },
            { name: 'Namma Yatri', color: Colors.nammaYatri, types: 'Auto' },
          ].map((p) => (
            <View key={p.name} style={styles.providerChip}>
              <View style={[styles.providerDot, { backgroundColor: p.color }]} />
              <View>
                <Text style={styles.providerChipName}>{p.name}</Text>
                <Text style={styles.providerChipTypes}>{p.types}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: Spacing.md },
  header: { marginBottom: Spacing.lg, marginTop: Spacing.md },
  greeting: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  locationSection: { position: 'relative', marginBottom: Spacing.lg },
  locationLine: {
    position: 'absolute',
    left: 32,
    top: 48,
    bottom: 80,
    width: 2,
    backgroundColor: Colors.border,
    zIndex: -1,
  },
  currentLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    marginTop: Spacing.xs,
  },
  locationIcon: { fontSize: 16, marginRight: Spacing.sm },
  currentLocationText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '600' },
  compareButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md + 4,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  compareButtonDisabled: { backgroundColor: Colors.textTertiary, elevation: 0, shadowOpacity: 0 },
  compareButtonText: { color: '#fff', fontSize: FontSize.lg, fontWeight: '700' },
  compareButtonSub: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.xs, marginTop: 4 },
  providersGrid: { gap: Spacing.sm },
  providerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  providerDot: { width: 12, height: 12, borderRadius: 6, marginRight: Spacing.md },
  providerChipName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  providerChipTypes: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
});
