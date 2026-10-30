import React, { useEffect } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Crown, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BouncePressable } from '../theme/motion';
import { PillChip } from '../components/PillChip';
import { useData } from '../context/DataContext';
import { useBilling } from '../context/BillingContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { floatShadow, SoftWash } from '../theme/wash';
import { logoMark } from '../theme/assets';
import { photoForCuisine, photoForIndex, photos } from '../theme/photos';
import { CUISINES, DIETARY_PREFS } from '../constants/preferences';
import { FREE_SCANS_PER_MONTH } from '../constants/billing';
import type { MainTabParamList } from '../types';
import { useRootNavigation } from '../navigation/useRootNavigation';

const HOME_CUISINES = ['Mediterranean', 'Asian', 'Indian', 'Italian', 'Mexican', 'Japanese'] as const;
const HOME_GOALS = ['Calorie Deficit', 'Vegetarian', 'Keto', 'Gluten-Free', 'Vegan', 'Halal'] as const;

const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const rootNav = useRootNavigation();
  const tabNav = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { user } = useAuth();
  const {
    pantry,
    recipes,
    scansRemaining,
    canScan,
    seedStarterPantry,
    cuisines,
    diets,
    setCuisines,
    setDiets,
  } = useData();
  const { isPro, localizedPrice } = useBilling();

  useEffect(() => {
    seedStarterPantry();
  }, [seedStarterPantry]);

  function openScan(intent: 'fridge' | 'list') {
    if (!canScan) {
      rootNav.navigate('Paywall', { reason: 'scan_limit' });
      return;
    }
    rootNav.navigate('Scanning', { intent });
  }

  function toggle(list: string[], value: string, save: (next: string[]) => Promise<void>) {
    const next = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
    void save(next);
  }

  function curate() {
    const names = pantry.map((item) => item.name);
    if (names.length === 0) {
      tabNav.navigate('Pantry');
      return;
    }
    rootNav.navigate('RecipeRefine', { ingredients: names });
  }

  const name = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Chef';
  const featured = recipes.find((r) => (r.inProgressStep ?? 0) > 0) ?? recipes[0];
  const featuredPhoto = featured ? photoForCuisine(featured.cuisine) : photos.salmon;

  return (
    <View style={styles.screen}>
      <SoftWash style={StyleSheet.absoluteFill} />
      <ScrollView
        style={{ flex: 1, backgroundColor: 'transparent' }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
      >
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Image source={logoMark} style={styles.mark} contentFit="contain" accessibilityLabel="CookCan" />
          <BouncePressable onPress={() => rootNav.navigate('Profile')} style={styles.avatarRing}>
            <Text style={styles.avatarText}>{(name[0] ?? 'C').toUpperCase()}</Text>
          </BouncePressable>
        </View>

        <View style={styles.coverLift}>
        <BouncePressable onPress={featured ? () => rootNav.navigate('RecipeDetail', { recipeId: featured.id }) : curate} style={styles.cover}>
          <Image source={featuredPhoto} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(27,28,26,0.78)']}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.coverKicker}>
            {featured ? 'TONIGHT FROM THIS KITCHEN' : 'TONIGHT, FROM WHAT YOU HAVE'}
          </Text>
          <Text style={styles.coverTitle}>
            {featured ? featured.title : `What is in the kitchen, ${name}?`}
          </Text>
          <Text style={styles.coverMeta}>
            {featured
              ? `${featured.cookTimeMinutes} min · ${featured.cuisine ?? 'CookCan'}`
              : 'Scan, select a cuisine, savor'}
          </Text>
        </BouncePressable>
        </View>

        <View style={styles.body}>
          <Text style={styles.hello}>Scan. Select. Savor.</Text>
          <Text style={styles.helloSub}>
            Gemini cooks from a fridge photo, a written list, or what you type. Cuisine and goals
            steer the plate.
          </Text>

          <View style={styles.captureRow}>
            <CaptureTile
              title="Fridge"
              photo={photos.fridge}
              onPress={() => openScan('fridge')}
            />
            <CaptureTile title="List" photo={photos.list} onPress={() => openScan('list')} />
            <CaptureTile
              title="Type"
              photo={photos.tomato}
              onPress={() => tabNav.navigate('Pantry')}
            />
          </View>

          <BouncePressable onPress={curate} style={styles.curate}>
            <Sparkles color={colors.white} size={18} />
            <View style={{ flex: 1 }}>
              <Text style={styles.curateTitle}>Curate from the pantry</Text>
              <Text style={styles.curateSub}>
                {pantry.length === 0
                  ? 'Add ingredients first'
                  : `${pantry.length} ingredients · ${cuisines[0] ?? 'any cuisine'}`}
              </Text>
            </View>
          </BouncePressable>

          <Text style={styles.sectionCaps}>Cuisine</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storyRow}
          >
            {HOME_CUISINES.map((cuisine) => {
              const on = cuisines.includes(cuisine);
              return (
                <BouncePressable
                  key={cuisine}
                  onPress={() => toggle(cuisines, cuisine, setCuisines)}
                  style={styles.story}
                >
                  <View style={[styles.storyRing, on && styles.storyRingOn]}>
                    <Image
                      source={photoForCuisine(cuisine)}
                      style={styles.storyPhoto}
                      contentFit="cover"
                    />
                  </View>
                  <Text style={[styles.storyLabel, on && styles.storyLabelOn]}>{cuisine}</Text>
                </BouncePressable>
              );
            })}
          </ScrollView>

          <Text style={[styles.sectionCaps, { marginTop: 8 }]}>Goals</Text>
          <View style={styles.chipRow}>
            {HOME_GOALS.map((goal) => (
              <PillChip
                key={goal}
                label={goal}
                selected={diets.includes(goal)}
                onPress={() => toggle(diets, goal, setDiets)}
              />
            ))}
          </View>

          {!isPro && (
            <BouncePressable
              onPress={() => rootNav.navigate('Paywall', { reason: 'upgrade' })}
              style={styles.proBanner}
            >
              <Crown color={colors.pro} size={20} />
              <View style={{ flex: 1 }}>
                <Text style={styles.proTitle}>CookCan Pro · {localizedPrice}</Text>
                <Text style={styles.proSub}>Unlimited scans · AI Chef · Meal planner</Text>
              </View>
            </BouncePressable>
          )}

          <View style={styles.pantryCard}>
            <Text style={styles.sectionCaps}>Pantry</Text>
            <Text style={styles.pantryHealth}>
              {pantry.length} ingredients ready
              {pantry.length > 4 ? ' · a full board' : ' · still filling in'}
            </Text>
            <View style={styles.healthBar}>
              <View
                style={[
                  styles.healthFill,
                  { width: `${Math.min(100, Math.max(12, pantry.length * 12))}%` },
                ]}
              />
            </View>
            <View style={styles.chipRow}>
              {pantry.slice(0, 6).map((item) => (
                <View key={item.id} style={styles.miniChip}>
                  <Text style={styles.miniChipText}>{item.name}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={[styles.sectionCaps, { marginTop: 28 }]}>From this kitchen</Text>
          {recipes.length === 0 ? (
            <Text style={styles.empty}>Scan or type what you have. Recipes stay tied to that list.</Text>
          ) : (
            recipes.slice(0, 6).map((recipe, index) => (
              <View key={recipe.id} style={styles.magazineLift}>
              <BouncePressable
                onPress={() => rootNav.navigate('RecipeDetail', { recipeId: recipe.id })}
                style={styles.magazine}
              >
                <Image
                  source={photoForCuisine(recipe.cuisine) || photoForIndex(index)}
                  style={styles.magazinePhoto}
                  contentFit="cover"
                />
                <View style={styles.magazineBody}>
                  <Text style={styles.recipeTitle}>{recipe.title}</Text>
                  <Text style={styles.recipeMeta}>
                    {recipe.cookTimeMinutes} min · {recipe.difficulty}
                    {recipe.cuisine ? ` · ${recipe.cuisine}` : ''}
                  </Text>
                </View>
              </BouncePressable>
              </View>
            ))
          )}

          <Text style={styles.scanHint}>
            {isPro
              ? 'Unlimited Pro scans'
              : `${scansRemaining === Infinity ? FREE_SCANS_PER_MONTH : scansRemaining} free scans left this month`}
          </Text>
          <Text style={styles.footnote}>
            {CUISINES.length} kitchens · {DIETARY_PREFS.length} aims
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function CaptureTile({
  title,
  photo,
  onPress,
}: {
  title: string;
  photo: number;
  onPress: () => void;
}) {
  return (
    <View style={styles.tileLift}>
      <BouncePressable onPress={onPress} style={styles.tile}>
        <Image source={photo} style={styles.tilePhoto} contentFit="cover" />
        <LinearGradient colors={['transparent', 'rgba(27,28,26,0.72)']} style={StyleSheet.absoluteFill} />
        <Text style={styles.tileTitle}>{title}</Text>
      </BouncePressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.washCream },
  topBar: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mark: {
    width: 132,
    height: 52,
    borderRadius: 14,
    boxShadow: floatShadow,
  },
  avatarRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: floatShadow,
  },
  avatarText: { fontWeight: '800', color: colors.primary },
  coverLift: {
    marginHorizontal: 20,
    borderRadius: 28,
    boxShadow: floatShadow,
  },
  cover: {
    height: 248,
    borderRadius: 28,
    justifyContent: 'flex-end',
    padding: 20,
    overflow: 'hidden',
  },
  coverKicker: {
    color: colors.rose,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  coverTitle: {
    color: colors.white,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    marginTop: 8,
    fontFamily: serif,
  },
  coverMeta: { color: 'rgba(255,255,255,0.86)', marginTop: 6, fontSize: 13 },
  body: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 16 },
  hello: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.charcoal,
    fontFamily: serif,
  },
  helloSub: { color: colors.muted, marginTop: 8, fontSize: 15, lineHeight: 22 },
  captureRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  tileLift: { flex: 1, borderRadius: 22, boxShadow: floatShadow },
  tile: {
    height: 124,
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 10,
  },
  tilePhoto: { ...StyleSheet.absoluteFill },
  tileTitle: { color: colors.white, fontWeight: '800', fontSize: 14 },
  curate: {
    marginTop: 14,
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  curateTitle: { color: colors.white, fontWeight: '800', fontSize: 16 },
  curateSub: { color: 'rgba(255,255,255,0.88)', marginTop: 2, fontSize: 13 },
  sectionCaps: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.primaryDark,
  },
  storyRow: { gap: 14, paddingRight: 8, paddingBottom: 4 },
  story: { width: 76, alignItems: 'center' },
  storyRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 3,
    borderWidth: 2,
    borderColor: 'rgba(225,129,148,0.35)',
  },
  storyRingOn: { borderColor: colors.primary },
  storyPhoto: { width: '100%', height: '100%', borderRadius: 31 },
  storyLabel: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    textAlign: 'center',
  },
  storyLabelOn: { color: colors.primaryDark },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  proBanner: {
    marginTop: 18,
    backgroundColor: colors.surfaceLow,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  proTitle: { fontWeight: '800', color: colors.pro },
  proSub: { color: colors.muted, fontSize: 13, marginTop: 2 },
  pantryCard: {
    marginTop: 18,
    backgroundColor: 'rgba(225,129,148,0.16)',
    borderRadius: 18,
    padding: 16,
  },
  pantryHealth: { color: colors.charcoal, fontWeight: '700', marginTop: 4 },
  healthBar: {
    marginTop: 10,
    height: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
    overflow: 'hidden',
  },
  healthFill: { height: '100%', backgroundColor: colors.secondary },
  miniChip: {
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  miniChipText: { fontSize: 12, fontWeight: '600', color: colors.charcoal },
  empty: { color: colors.muted, lineHeight: 20 },
  magazineLift: {
    marginBottom: 14,
    borderRadius: 24,
    backgroundColor: colors.white,
    boxShadow: floatShadow,
  },
  magazine: {
    backgroundColor: colors.white,
    borderRadius: 24,
    overflow: 'hidden',
  },
  magazinePhoto: { width: '100%', height: 168 },
  magazineBody: { padding: 14 },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.charcoal,
    fontFamily: serif,
  },
  recipeMeta: { color: colors.muted, marginTop: 4, fontSize: 13 },
  scanHint: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: 18,
    fontSize: 13,
  },
  footnote: {
    textAlign: 'center',
    color: colors.outline,
    marginTop: 6,
    fontSize: 12,
  },
});
