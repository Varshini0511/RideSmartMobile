import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

export default function SettingsScreen() {
  const appLinks = [
    { name: 'Uber', package: 'com.ubercab', color: Colors.uber },
    { name: 'Ola', package: 'com.olacabs.customer', color: Colors.ola },
    { name: 'Rapido', package: 'com.rapido.passenger', color: Colors.rapido },
    { name: 'Namma Yatri', package: 'in.juspay.nammayatri', color: Colors.nammaYatri },
  ];

  const openStore = (pkg: string) => {
    Linking.openURL(`https://play.google.com/store/apps/details?id=${pkg}`).catch(() => {
      Alert.alert('Error', 'Could not open Play Store.');
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <Text style={styles.appName}>RideSmart</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDesc}>
            Compare ride prices across Uber, Ola, Rapido & Namma Yatri. Find the cheapest ride in seconds.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Install Ride Apps</Text>
        <Text style={styles.sectionSubtitle}>
          For one-tap booking, install these apps on your phone
        </Text>
        {appLinks.map((app) => (
          <TouchableOpacity key={app.name} style={styles.appRow} onPress={() => openStore(app.package)}>
            <View style={[styles.appDot, { backgroundColor: app.color }]} />
            <Text style={styles.appRowText}>{app.name}</Text>
            <Text style={styles.installText}>Install / Open</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.card}>
          <Text style={styles.howItem}>1. Enter pickup and drop location</Text>
          <Text style={styles.howItem}>2. Compare estimated fares across all ride apps</Text>
          <Text style={styles.howItem}>3. Tap "Book" to open the chosen app with your route pre-filled</Text>
          <Text style={styles.howItem}>4. Confirm and book in the ride app</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fare Estimation</Text>
        <View style={styles.card}>
          <Text style={styles.noteText}>
            Fares are estimated using real fare cards and distance calculations. Actual fares may vary based on real-time demand, route, and traffic conditions. Surge pricing is estimated based on time of day.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xl * 2 },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  sectionSubtitle: { fontSize: FontSize.xs, color: Colors.textTertiary, marginBottom: Spacing.sm },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  appName: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  appVersion: { fontSize: FontSize.sm, color: Colors.textTertiary, marginTop: 4 },
  appDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.sm, lineHeight: 20 },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  appDot: { width: 12, height: 12, borderRadius: 6, marginRight: Spacing.md },
  appRowText: { flex: 1, fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  installText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  howItem: {
    fontSize: FontSize.sm,
    color: Colors.text,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  noteText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
