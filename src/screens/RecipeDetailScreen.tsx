import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData } from '../context/DataContext';
import { Button } from '../components/Button';
import { BouncePressable } from '../theme/motion';
import { REMOTE } from '../theme/assets';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeDetail'>;

export default function RecipeDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { getRecipe } = useData();
  const recipe = getRecipe(route.params.recipeId);
  const [cooking, setCooking] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);

  if (!recipe) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 24, paddingHorizontal: 20 }]}>
        <Text style={styles.title}>Recipe not found</Text>
        <Button label="Go back" onPress={() => navigation.goBack()} style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (cooking) {
    const step = recipe.steps[stepIdx] ?? '';
    const progress = (stepIdx + 1) / Math.max(1, recipe.steps.length);
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }]}>
        <Text style={styles.cookingKicker}>Active Cooking Mode</Text>
        <Text style={styles.title}>{recipe.title}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.stepCount}>
          Step {stepIdx + 1} of {recipe.steps.length}
        </Text>
        <View style={styles.stepCard}>
          <Text style={styles.stepBig}>{step}</Text>
        </View>
        <View style={styles.row}>
          <Button
            label="Previous"
            variant="secondary"
            onPress={() => setStepIdx((s) => Math.max(0, s - 1))}
            disabled={stepIdx === 0}
            style={{ flex: 1 }}
          />
          {stepIdx < recipe.steps.length - 1 ? (
            <Button
              label="Next"
              onPress={() => setStepIdx((s) => s + 1)}
              style={{ flex: 1 }}
              pulse
            />
          ) : (
            <Button
              label="Finish Cooking"
              onPress={() => {
                setCooking(false);
                setStepIdx(0);
                navigation.navigate('Main');
              }}
              style={{ flex: 1 }}
              pulse
            />
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.hero}>
          <Image
            source={{ uri: REMOTE.continueCooking }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(27,28,26,0.85)']}
            style={StyleSheet.absoluteFill}
          />
          <BouncePressable
            onPress={() => navigation.goBack()}
            style={[styles.backFab, { top: insets.top + 12 }]}
          >
            <Text style={styles.backFabText}>←</Text>
          </BouncePressable>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>{recipe.title}</Text>
            <Text style={styles.metaLight}>
              {recipe.cookTimeMinutes} min · {recipe.difficulty}
              {recipe.cuisine ? ` · ${recipe.cuisine}` : ''}
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
          <Text style={styles.body}>{recipe.description}</Text>

          <View style={styles.secret}>
            <Text style={styles.secretLabel}>Chef&apos;s Secret</Text>
            <Text style={styles.secretBody}>
              Taste as you go — finish with acid (lemon) and a pinch of salt to lift the dish.
            </Text>
          </View>

          <Text style={styles.section}>Ingredients</Text>
          {recipe.ingredients.map((ing, i) => (
            <View key={`${ing}-${i}`} style={styles.ingRow}>
              <View style={styles.check} />
              <Text style={styles.bullet}>{ing}</Text>
            </View>
          ))}

          <Text style={styles.section}>Steps</Text>
          {recipe.steps.map((step, i) => (
            <Text key={`${i}`} style={styles.step}>
              {i + 1}. {step}
            </Text>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.sticky, { paddingBottom: insets.bottom + 12 }]}>
        <Button label="Start Cooking" onPress={() => setCooking(true)} pulse />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  hero: { height: 260, justifyContent: 'flex-end' },
  backFab: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backFabText: { fontSize: 18, fontWeight: '700', color: colors.charcoal },
  heroText: { padding: 20 },
  heroTitle: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  metaLight: { color: 'rgba(255,255,255,0.9)', marginTop: 6, fontWeight: '600' },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.charcoal,
    paddingHorizontal: 20,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  body: { color: colors.muted, lineHeight: 22, fontSize: 16 },
  secret: {
    marginTop: 18,
    backgroundColor: colors.secondaryContainer,
    borderRadius: 16,
    padding: 14,
  },
  secretLabel: { fontWeight: '800', color: colors.onSecondaryContainer, marginBottom: 4 },
  secretBody: { color: colors.onSecondaryContainer, lineHeight: 20 },
  section: {
    marginTop: 28,
    marginBottom: 10,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.outline,
  },
  ingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  check: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  bullet: { color: colors.charcoal, fontSize: 16, flex: 1 },
  step: { color: colors.charcoal, marginBottom: 10, fontSize: 16, lineHeight: 22 },
  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: 'rgba(251,249,245,0.96)',
  },
  cookingKicker: {
    paddingHorizontal: 20,
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  progressTrack: {
    marginHorizontal: 20,
    marginTop: 16,
    height: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceHighest,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  stepCount: {
    marginTop: 12,
    paddingHorizontal: 20,
    color: colors.muted,
    fontWeight: '700',
  },
  stepCard: {
    margin: 20,
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    justifyContent: 'center',
  },
  stepBig: {
    fontSize: 24,
    lineHeight: 34,
    color: colors.charcoal,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  row: { flexDirection: 'row', gap: 12, paddingHorizontal: 20 },
});
