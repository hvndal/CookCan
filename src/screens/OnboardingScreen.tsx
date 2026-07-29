import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useSettings } from '../context/SettingsContext';
import { storage } from '../lib/storage';
import { Button } from '../components/Button';
import { LinearishBackground } from '../components/LinearishBackground';
import { colors } from '../theme/colors';
import {
  COUNTRY_LABELS,
  type CountryCode,
} from '../lib/locale';

const COUNTRIES: CountryCode[] = ['US', 'CA', 'BR', 'MX', 'IN', 'DE', 'FR', 'AR', 'CO', 'CL', 'PE'];
const DIETS = ['Vegetarian', 'Vegan', 'Gluten-free', 'Halal', 'Kosher', 'Dairy-free', 'Keto'];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { completeOnboarding } = useAuth();
  const { setDiets, seedStarterPantry } = useData();
  const { country, setCountryOverride, countryLabel } = useSettings();
  const [step, setStep] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(country);
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);

  async function finish() {
    await setCountryOverride(selectedCountry);
    await storage.setCountry(COUNTRY_LABELS[selectedCountry]);
    await setDiets(selectedDiets);
    await seedStarterPantry();
    await completeOnboarding();
  }

  return (
    <LinearishBackground>
      <View style={styles.wrap}>
        {step === 0 && (
          <>
            <Text style={styles.title}>{t('welcomeTitle')}</Text>
            <Text style={styles.sub}>{t('welcomeSub')}</Text>
            <Text style={styles.hint}>{t('detectedRegion', { region: countryLabel })}</Text>
            <Button label={t('getStarted')} onPress={() => setStep(1)} style={{ marginTop: 32 }} />
          </>
        )}

        {step === 1 && (
          <>
            <Text style={styles.title}>{t('whereCook')}</Text>
            <Text style={styles.sub}>{t('whereCookSub')}</Text>
            <View style={styles.chips}>
              {COUNTRIES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setSelectedCountry(c)}
                  style={[styles.chip, selectedCountry === c && styles.chipOn]}
                >
                  <Text style={[styles.chipText, selectedCountry === c && styles.chipTextOn]}>
                    {COUNTRY_LABELS[c]}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Button label={t('continue')} onPress={() => setStep(2)} style={{ marginTop: 24 }} />
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.title}>{t('dietary')}</Text>
            <Text style={styles.sub}>{t('dietarySub')}</Text>
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
            <Button label={t('enterKitchen')} onPress={finish} style={{ marginTop: 24 }} />
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
  hint: { marginTop: 14, color: colors.primaryDark, fontWeight: '700' },
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
