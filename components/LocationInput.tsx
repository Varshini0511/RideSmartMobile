import React, { useState, useRef, useCallback } from 'react';
import {
  View, TextInput, Text, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Keyboard,
} from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { LocationData } from '../constants/providers';

interface Props {
  label: string;
  icon: string;
  value: LocationData | null;
  onSelect: (location: LocationData) => void;
  placeholder?: string;
}

interface Suggestion {
  place_id: string;
  description: string;
  lat?: number;
  lng?: number;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

export default function LocationInput({ label, icon, value, onSelect, placeholder }: Props) {
  const [query, setQuery] = useState(value?.address ?? '');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback(async (text: string) => {
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${NOMINATIM_URL}/search?q=${encodeURIComponent(text + ', Chennai, India')}&format=json&limit=5&addressdetails=1`,
        { headers: { 'User-Agent': 'RideSmartApp/1.0' } }
      );
      const data = await res.json();
      setSuggestions(
        data.map((item: any) => ({
          place_id: item.place_id,
          description: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        }))
      );
    } catch {
      setSuggestions([]);
    }
    setLoading(false);
  }, []);

  const handleTextChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(text), 400);
  };

  const handleSelect = (suggestion: Suggestion) => {
    const location: LocationData = {
      latitude: suggestion.lat!,
      longitude: suggestion.lng!,
      address: suggestion.description.split(',').slice(0, 3).join(','),
      name: suggestion.description.split(',')[0],
    };
    setQuery(location.name || location.address);
    setSuggestions([]);
    setFocused(false);
    Keyboard.dismiss();
    onSelect(location);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <View style={[styles.iconCircle, { backgroundColor: icon === 'P' ? Colors.secondary : Colors.danger }]}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={handleTextChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder={placeholder ?? `Search ${label.toLowerCase()}...`}
            placeholderTextColor={Colors.textTertiary}
          />
        </View>
        {loading && <ActivityIndicator size="small" color={Colors.primary} />}
      </View>

      {focused && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSelect(item)}>
                <Text style={styles.suggestionIcon}>&#x1F4CD;</Text>
                <Text style={styles.suggestionText} numberOfLines={2}>
                  {item.description}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.sm, zIndex: 10 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  iconText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
  inputWrapper: { flex: 1 },
  label: { fontSize: FontSize.xs, color: Colors.textTertiary, marginBottom: 2 },
  input: { fontSize: FontSize.md, color: Colors.text, padding: 0 },
  suggestionsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 200,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  suggestionIcon: { fontSize: 16, marginRight: Spacing.sm },
  suggestionText: { flex: 1, fontSize: FontSize.sm, color: Colors.text },
});
