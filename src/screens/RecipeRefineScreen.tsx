import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { PillChip } from '../components/PillChip';
import { BouncePressable, ConfettiEffect, ThinkingLoader } from '../theme/motion';
import { useData } from '../context/DataContext';
import {
  COOK_TIMES,
  CUISINES,
  DIETARY_PREFS,
  MEAL_TYPES,
} from '../constants/preferences';
import { generateRecipesFromPantry } from '../lib/gemini';
import { REMOTE } from '../theme/assets';
import { colors } from '../theme/colors';
import type { Recipe, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeRefine'>;
type Phase = 'refine' | 'thinking' | 'results';

const STATUS_STEPS = [
  'Initiating AI chef...',
  'Analyzing pantry contents...',
  'Consulting Michelin star databases...',
  'Drafting personalized recipes...',
  'Calculating nutritional profiles...',
  'Ready!',
];

export default function RecipeRefineScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { ingredients } = route.params;
  const { diets: savedDiets, cuisines: savedCuisines, saveRecipes } = useData();

  const [phase, setPhase] = useState<Phase>('refine');
  const [cuisine, setCuisine] = useState(savedCuisines[0] || 'Italian');
  const [mealType, setMealType] = useState<(typeof MEAL_TYPES)[number]>('Dinner');
  const [cookTime, setCookTime] = useState(30);
  const [selectedDiets, setSelectedDiets] = useState<string[]>(savedDiets);
  const [note, setNote] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(STATUS_STEPS[0]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [confetti, setConfetti] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);

  const cuisineOptions = useMemo(() => {
    const base = [...CUISINES];
    for (const c of savedCuisines) {
      if (!base.includes(c as (typeof CUISINES)[number])) base.unshift(c as (typeof CUISINES)[number]);
    }
    return base;
  }, [savedCuisines]);

  useEffect(() => {
    if (phase !== 'thinking') return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setProgress(Math.min(0.95, i / (STATUS_STEPS.length + 1)));
      setStatus(STATUS_STEPS[Math.min(i, STATUS_STEPS.length - 1)]);
    }, 550);
    return () => clearInterval(id);
  }, [phase]);

  async function generate() {
    setPhase('thinking');
    setProgress(0.08);
    try {
      const next = await generateRecipesFromPantry(ingredients, {
        diets: selectedDiets,
        cuisines: [cuisine, ...savedCuisines.filter((c) => c !== cuisine)].slice(0, 3),
        mealType,
        cookTimeMinutes: cookTime,
        note,
      });
      await saveRecipes(next);
      setRecipes(next);
      setProgress(1);
      setStatus('Ready!');
      setTimeout(() => {
        setPhase('results');
        setConfetti(true);
      }, 400);
    } catch (e) {
      setPhase('refine');
      Alert.alert('CookCan', e instanceof Error ? e.message : 'Could not generate recipes');
    }
  }

  const filtered = filter
    ? recipes.filter(
        (r) =>
          r.description.toLowerCase().includes(filter.toLowerCase()) ||
          r.title.toLowerCase().includes(filter.toLowerCase()) ||
          (r.cuisine ?? '').toLowerCase().includes(filter.toLowerCase())
      )
    : recipes;

  if (phase === 'thinking') {
    return <ThinkingLoader status={status} progress={progress} />;
  }

  if (phase === 'results') {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
        <ConfettiEffect trigger={confetti} onFinished={() => setConfetti(false)} />
        <Text style={styles.title}>Curated for You</Text>
        <Text style={styles.sub}>
          {recipes.length} gourmet matches from your scan · {cuisine} · {mealType}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingVertical: 12 }}
        >
          <PillChip label="All" selected={!filter} onPress={() => setFilter(null)} />
          {selectedDiets.map((d) => (
            <PillChip
              key={d}
              label={d}
              selected={filter === d}
              onPress={() => setFilter(d)}
            />
          ))}
        </ScrollView>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 14 }}
          renderItem={({ item, index }) => (
            <BouncePressable
              onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
              style={styles.card}
            >
              <Image
                source={{
                  uri:
                    index === 0
                      ? REMOTE.recipeCrostini
                      : index % 2 === 0
                        ? REMOTE.recipeSalmon
                        : REMOTE.recipeGarden,
                }}
                style={styles.cardImage}
                contentFit="cover"
              />
              {index === 0 && (
                <View style={styles.chefBadge}>
                  <Text style={styles.chefBadgeText}>CHEF&apos;S CHOICE</Text>
                </View>
              )}
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {item.description}
                </Text>
                <Text style={styles.meta}>
                  {item.cookTimeMinutes} min · {item.difficulty}
                  {item.cuisine ? ` · ${item.cuisine}` : ''}
                </Text>
                <Text style={styles.savor}>Savor this Recipe →</Text>
              </View>
            </BouncePressable>
          )}
        />
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <Button label="Back to kitchen" onPress={() => navigation.navigate('Main')} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + 8,
        paddingBottom: insets.bottom + 40,
        paddingHorizontal: 24,
      }}
    >
      <Text style={styles.back} onPress={() => navigation.goBack()}>
        ← Back
      </Text>
      <Text style={styles.title}>Refine your choice</Text>
      <Text style={styles.sub}>Let&apos;s tailor the AI&apos;s suggestions to your mood.</Text>

      <Text style={styles.section}>Cuisine</Text>
      <View style={styles.chips}>
        {cuisineOptions.map((c) => (
          <PillChip key={c} label={c} selected={cuisine === c} onPress={() => setCuisine(c)} />
        ))}
      </View>

      <Text style={styles.section}>Meal type</Text>
      <View style={styles.chips}>
        {MEAL_TYPES.map((m) => (
          <PillChip
            key={m}
            label={m}
            selected={mealType === m}
            onPress={() => setMealType(m)}
          />
        ))}
      </View>

      <Text style={styles.section}>Cooking time</Text>
      <View style={styles.chips}>
        {COOK_TIMES.map((t) => (
          <PillChip
            key={t}
            label={t === 60 ? '60m+' : `${t}m`}
            selected={cookTime === t}
            onPress={() => setCookTime(t)}
          />
        ))}
      </View>

      <Text style={styles.section}>Dietary preferences</Text>
      <View style={styles.chips}>
        {DIETARY_PREFS.map((d) => {
          const on = selectedDiets.includes(d);
          return (
            <PillChip
              key={d}
              label={d}
              selected={on}
              onPress={() =>
                setSelectedDiets((prev) =>
                  on ? prev.filter((x) => x !== d) : [...prev, d]
                )
              }
            />
          );
        })}
      </View>

      <Text style={styles.section}>Extra notes</Text>
      <TextInput
        style={styles.input}
        value={note}
        onChangeText={setNote}
        placeholder="e.g. make it spicy, use extra garlic..."
        placeholderTextColor={colors.tabInactive}
      />

      <Text style={styles.scanSummary}>
        Using {ingredients.length} scanned ingredients
        {ingredients.length ? `: ${ingredients.slice(0, 5).join(', ')}` : ''}
        {ingredients.length > 5 ? '…' : ''}
      </Text>

      <Button
        label="Generate Recipes"
        onPress={generate}
        pulse
        style={{ marginTop: 20 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  back: { color: colors.primaryDark, fontWeight: '700', marginBottom: 8 },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.charcoal,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  sub: { color: colors.muted, marginTop: 6, lineHeight: 22 },
  section: {
    marginTop: 26,
    marginBottom: 12,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.outline,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.charcoal,
  },
  scanSummary: { marginTop: 18, color: colors.muted, fontSize: 13, lineHeight: 20 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardImage: { width: '100%', height: 180 },
  chefBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  chefBadgeText: { color: colors.white, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  cardBody: { padding: 16 },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.charcoal,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  cardDesc: { marginTop: 6, color: colors.muted, lineHeight: 20 },
  meta: { marginTop: 10, color: colors.primaryDark, fontWeight: '700' },
  savor: { marginTop: 12, color: colors.primary, fontWeight: '800' },
  footer: { paddingHorizontal: 20, paddingTop: 8 },
});
