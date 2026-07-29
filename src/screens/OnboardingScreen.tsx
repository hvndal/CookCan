import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { storage } from '../lib/storage';
import { Button } from '../components/Button';
import { LinearishBackground } from '../components/LinearishBackground';
import { colors } from '../theme/colors';

const COUNTRIES = ['United States', 'Canada', 'India', 'Mexico', 'Brazil', 'Germany', 'France', 'Other'];
const DIETS = ['Vegetarian', 'Vegan', 'Gluten-free', 'Halal', 'Kosher', 'Dairy-free', 'Keto'];

export default function OnboardingScreen() {
  const { completeOnboarding } = useAuth();
  const { setDiets, seedDemoPantry } = useData();
  const [step, setStep] = useState(0);
  const [country, setCountry] = useState('United States');
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);

  async function finish() {
    await storage.setCountry(country);
    await setDiets(selectedDiets);
    await seedDemoPantry();
    await completeOnboarding();
  }

  return (
    <LinearishBackground>
      <View style={styles.wrap}>
        {step === 0 && (
          <>
            <Text style={styles.title}>Welcome to CookCan</Text>
            <Text style={styles.sub}>Your Michelin-star kitchen companion for effortless cooking.</Text>
            <Button label="Get started" onPress={() => setStep(1)} style={{ marginTop: 32 }} />
          </>
        )}

        {step === 1 && (
          <>
            <Text style={styles.title}>Where do you cook?</Text>
            <Text style={styles.sub}>Used for cuisine inspiration and regional Pro pricing.</Text>
            <View style={styles.chips}>
              {COUNTRIES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setCountry(c)}
                  style={[styles.chip, country === c && styles.chipOn]}
                >
                  <Text style={[styles.chipText, country === c && styles.chipTextOn]}>{c}</Text>
                </Pressable>
              ))}
            </View>
            <Button label="Continue" onPress={() => setStep(2)} style={{ marginTop: 24 }} />
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.title}>Dietary preferences</Text>
            <Text style={styles.sub}>Optional — helps Gemini personalize recipes.</Text>
            <View style={styles.chips}>
              {DIETS.map((d) => {
                const on = selectedDiets.includes(d);
                return (
                  <Pressable
                    key={d}
                    onPress={() =>
                      setSelectedDiets((prev) =>
                        on ? prev.filter((x) => x !== d) : [...prev, d]
                      )
                    }
                    style={[styles.chip, on && styles.chipOn]}
                  >
                    <Text style={[styles.chipText, on && styles.chipTextOn]}>{d}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Button label="Enter kitchen" onPress={finish} style={{ marginTop: 24 }} />
          </>
        )}
      </View>
    </LinearishBackground>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 24, paddingTop: 100 },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.charcoal,
    letterSpacing: -0.8,
  },
  sub: { marginTop: 10, fontSize: 16, lineHeight: 22, color: colors.muted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 28 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.charcoal, fontWeight: '600' },
  chipTextOn: { color: colors.white },
});
