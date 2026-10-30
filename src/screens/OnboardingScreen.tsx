import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useSettings } from '../context/SettingsContext';
import { Button } from '../components/Button';
import { PillChip } from '../components/PillChip';
import { CUISINES, DIETARY_PREFS } from '../constants/preferences';
import { storage } from '../lib/storage';
import { COUNTRY_LABELS, type CountryCode } from '../lib/locale';
import { colors } from '../theme/colors';
import { floatShadow, SoftWash } from '../theme/wash';
import { photoForCuisine, photos } from '../theme/photos';

const COUNTRIES: CountryCode[] = ['US', 'CA', 'BR', 'MX', 'IN', 'DE', 'FR', 'AR', 'CO', 'CL', 'PE'];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useAuth();
  const { setDiets, setCuisines, seedStarterPantry } = useData();
  const { country, setCountryOverride, countryLabel } = useSettings();
  const [step, setStep] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(country);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(['Mediterranean', 'Indian']);
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);

  function toggle(list: string[], value: string, setter: (v: string[]) => void) {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  async function finish() {
    await setCountryOverride(selectedCountry);
    await storage.setCountry(COUNTRY_LABELS[selectedCountry]);
    await setCuisines(selectedCuisines);
    await setDiets(selectedDiets);
    await seedStarterPantry();
    await completeOnboarding();
  }

  return (
    <SoftWash>
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + 36,
        paddingBottom: insets.bottom + 40,
        paddingHorizontal: 24,
      }}
    >
      {step === 0 && (
        <>
          <View style={styles.welcomeLift}>
            <Image source={photos.salmon} style={styles.welcomePhoto} contentFit="cover" />
          </View>
          <Text style={styles.kicker}>CookCan</Text>
          <Text style={styles.title}>Welcome to your{'\n'}chef&apos;s atelier.</Text>
          <Text style={styles.sub}>
            Your Michelin-inspired kitchen companion. Scan ingredients, refine the mood, savor the
            result.
          </Text>
          <Text style={styles.hint}>Detected region · {countryLabel}</Text>
          <Button label="Get started" onPress={() => setStep(1)} style={{ marginTop: 36 }} pulse />
        </>
      )}

      {step === 1 && (
        <>
          <Text style={styles.title}>Where do you cook?</Text>
          <Text style={styles.sub}>Used for cuisine ideas and local Pro pricing.</Text>
          <View style={styles.chips}>
            {COUNTRIES.map((c) => (
              <PillChip
                key={c}
                label={COUNTRY_LABELS[c]}
                selected={selectedCountry === c}
                onPress={() => setSelectedCountry(c)}
              />
            ))}
          </View>
          <Button label="Continue" onPress={() => setStep(2)} style={{ marginTop: 28 }} />
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.title}>Favorite cuisines</Text>
          <Text style={styles.sub}>
            Mediterranean, Asian, Indian, and the other kitchens you cook. Gemini biases every
            recipe toward these.
          </Text>
          <View style={styles.cuisineGrid}>
            {CUISINES.map((c) => {
              const on = selectedCuisines.includes(c);
              return (
                <Pressable
                  key={c}
                  onPress={() => toggle(selectedCuisines, c, setSelectedCuisines)}
                  style={[styles.cuisineTile, on && styles.cuisineTileOn]}
                >
                  <View style={styles.cuisinePhotoBox}>
                    <Image
                      source={photoForCuisine(c)}
                      style={StyleSheet.absoluteFill}
                      contentFit="cover"
                    />
                  </View>
                  <Text style={[styles.cuisineLabel, on && styles.cuisineLabelOn]}>{c}</Text>
                </Pressable>
              );
            })}
          </View>
          <Button
            label="Continue"
            onPress={() => setStep(3)}
            style={{ marginTop: 28 }}
            disabled={selectedCuisines.length === 0}
          />
        </>
      )}

      {step === 3 && (
        <>
          <Text style={styles.title}>Goals</Text>
          <Text style={styles.sub}>
            Optional aims — calorie deficit, keto, gluten-free, vegan, and more. Skip if you eat
            everything.
          </Text>
          <View style={styles.chips}>
            {DIETARY_PREFS.map((d) => (
              <PillChip
                key={d}
                label={d}
                selected={selectedDiets.includes(d)}
                onPress={() => toggle(selectedDiets, d, setSelectedDiets)}
              />
            ))}
          </View>
          <Button label="Enter kitchen" onPress={finish} style={{ marginTop: 28 }} pulse />
          <Button label="Skip for now" variant="ghost" onPress={finish} style={{ marginTop: 8 }} />
        </>
      )}
    </ScrollView>
    </SoftWash>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' },
  kicker: {
    color: colors.primary,
    fontStyle: 'italic',
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 12,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    color: colors.charcoal,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  sub: { marginTop: 12, fontSize: 16, lineHeight: 24, color: colors.muted },
  hint: { marginTop: 16, color: colors.primaryDark, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 28 },
  welcomeLift: {
    borderRadius: 28,
    marginBottom: 22,
    boxShadow: floatShadow,
  },
  welcomePhoto: {
    width: '100%',
    height: 188,
    borderRadius: 28,
  },
  cuisineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 24,
  },
  cuisineTile: {
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cuisineTileOn: { borderColor: colors.primary },
  cuisinePhotoBox: { height: 92, width: '100%', backgroundColor: colors.surfaceLow },
  cuisineLabel: {
    paddingVertical: 8,
    textAlign: 'center',
    fontWeight: '700',
    color: colors.charcoal,
  },
  cuisineLabelOn: { color: colors.primaryDark },
});
