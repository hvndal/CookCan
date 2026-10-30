import React, { useEffect } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Camera, ClipboardList, Crown, PenLine, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BouncePressable, Pulsate } from '../theme/motion';
import { PillChip } from '../components/PillChip';
import { useData } from '../context/DataContext';
import { useBilling } from '../context/BillingContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { logoMark } from '../theme/assets';
import { CUISINES, DIETARY_PREFS } from '../constants/preferences';
import { FREE_SCANS_PER_MONTH } from '../constants/billing';
import type { MainTabParamList } from '../types';
import { useRootNavigation } from '../navigation/useRootNavigation';

const HOME_CUISINES = ['Mediterranean', 'Asian', 'Indian', 'Italian', 'Mexican', 'Japanese'] as const;
const HOME_GOALS = ['Calorie Deficit', 'Vegetarian', 'Keto', 'Gluten-Free', 'Vegan', 'Halal'] as const;

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
  const inProgress = recipes.find((r) => (r.inProgressStep ?? 0) > 0) ?? recipes[0];

  return (
    <View style={styles.screen}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[styles.hero, { paddingTop: insets.top + 8 }]}>
          <View style={styles.heroBar}>
            <Text style={styles.heroKicker}>SCAN · SELECT · SAVOR</Text>
            <BouncePressable onPress={() => rootNav.navigate('Profile')} style={styles.avatarRing}>
              <Text style={styles.avatarText}>{(name[0] ?? 'C').toUpperCase()}</Text>
            </BouncePressable>
          </View>
          <Image source={logoMark} style={styles.logo} contentFit="contain" accessibilityLabel="CookCan" />
        </View>

        <View style={styles.sheet}>
          <Text style={styles.hello}>What is in the kitchen, {name}?</Text>
          <Text style={styles.helloSub}>
            Gemini curates from a fridge photo, a written list, or the ingredients you type. Cuisine
            and goals steer the plate.
          </Text>

          <View style={styles.actions}>
            <ActionRow
              title="Scan the fridge"
              detail="Shelves, counter, whatever is open"
              icon={<Camera color={colors.primaryDark} size={22} />}
              onPress={() => openScan('fridge')}
            />
            <ActionRow
              title="Scan a list"
              detail="Handwritten note, receipt, or label"
              icon={<ClipboardList color={colors.primaryDark} size={22} />}
              onPress={() => openScan('list')}
            />
            <ActionRow
              title="Type what you have"
              detail="Add to the pantry, then curate"
              icon={<PenLine color={colors.primaryDark} size={22} />}
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
          <Text style={styles.sectionHint}>Mediterranean, Asian, Indian, and the rest of the kitchen.</Text>
          <View style={styles.chipRow}>
            {HOME_CUISINES.map((cuisine) => (
              <PillChip
                key={cuisine}
                label={cuisine}
                selected={cuisines.includes(cuisine)}
                onPress={() => toggle(cuisines, cuisine, setCuisines)}
              />
            ))}
          </View>

          <Text style={[styles.sectionCaps, { marginTop: 22 }]}>Goals</Text>
          <Text style={styles.sectionHint}>Optional. Gemini keeps these constraints on every recipe.</Text>
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

          {inProgress && (
            <BouncePressable
              onPress={() => rootNav.navigate('RecipeDetail', { recipeId: inProgress.id })}
              style={styles.continueCard}
            >
              <Text style={styles.inProgressText}>IN PROGRESS</Text>
              <Text style={styles.continueTitle}>{inProgress.title}</Text>
              <Text style={styles.continueMeta}>
                {inProgress.cookTimeMinutes} min
                {inProgress.cuisine ? ` · ${inProgress.cuisine}` : ''}
              </Text>
            </BouncePressable>
          )}

          <Text style={[styles.sectionCaps, { marginTop: 28 }]}>From this kitchen</Text>
          {recipes.length === 0 ? (
            <Text style={styles.empty}>Scan or type what you have. Recipes stay tied to that list.</Text>
          ) : (
            recipes.slice(0, 6).map((recipe) => (
              <BouncePressable
                key={recipe.id}
                onPress={() => rootNav.navigate('RecipeDetail', { recipeId: recipe.id })}
                style={styles.recipeRow}
              >
                <View style={styles.recipeMark}>
                  <Text style={styles.recipeMarkText}>{(recipe.cuisine ?? 'C').slice(0, 1)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recipeTitle}>{recipe.title}</Text>
                  <Text style={styles.recipeMeta}>
                    {recipe.cookTimeMinutes} min · {recipe.difficulty}
                    {recipe.cuisine ? ` · ${recipe.cuisine}` : ''}
                  </Text>
                </View>
              </BouncePressable>
            ))
          )}

          <Text style={styles.scanHint}>
            {isPro
              ? 'Unlimited Pro scans'
              : `${scansRemaining === Infinity ? FREE_SCANS_PER_MONTH : scansRemaining} free scans left this month`}
          </Text>
          <Text style={styles.footnote}>
            More cuisines and goals live in onboarding: {CUISINES.length} kitchens, {DIETARY_PREFS.length}{' '}
            aims.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.fabWrap, { bottom: insets.bottom + 78 }]}>
        <Pulsate>
          <BouncePressable onPress={() => openScan('fridge')} style={styles.fab}>
            <Camera color={colors.white} size={26} />
            <Text style={styles.fabLabel}>SCAN</Text>
          </BouncePressable>
        </Pulsate>
      </View>
    </View>
  );
}

function ActionRow({
  title,
  detail,
  icon,
  onPress,
}: {
  title: string;
  detail: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <BouncePressable onPress={onPress} style={styles.action}>
      <View style={styles.actionIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDetail}>{detail}</Text>
      </View>
    </BouncePressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  hero: {
    backgroundColor: colors.rose,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  heroBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroKicker: {
    color: colors.white,
    letterSpacing: 2.4,
    fontSize: 11,
    fontWeight: '700',
  },
  avatarRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontWeight: '800', color: colors.white },
  logo: { width: '100%', height: 210, marginTop: 4 },
  sheet: {
    flexGrow: 1,
    backgroundColor: colors.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 108,
    minHeight: 640,
  },
  hello: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: colors.charcoal,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  helloSub: { color: colors.muted, marginTop: 8, fontSize: 15, lineHeight: 22 },
  actions: { marginTop: 18, gap: 10 },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(225,129,148,0.35)',
  },
  actionIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(225,129,148,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: { fontSize: 16, fontWeight: '700', color: colors.charcoal },
  actionDetail: { color: colors.muted, marginTop: 2, fontSize: 13 },
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
    marginTop: 26,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.primaryDark,
  },
  sectionHint: { color: colors.muted, marginTop: 4, marginBottom: 10, fontSize: 13 },
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
  continueCard: {
    marginTop: 16,
    backgroundColor: colors.primaryDark,
    borderRadius: 20,
    padding: 18,
  },
  inProgressText: {
    color: colors.rose,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  continueTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 8,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  continueMeta: { color: 'rgba(255,255,255,0.8)', marginTop: 6 },
  empty: { color: colors.muted, lineHeight: 20 },
  recipeRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
  },
  recipeMark: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeMarkText: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    fontSize: 22,
    color: colors.secondary,
    fontWeight: '700',
  },
  recipeTitle: { fontSize: 16, fontWeight: '700', color: colors.charcoal },
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
  fabWrap: {
    position: 'absolute',
    right: 20,
    alignItems: 'flex-end',
  },
  fab: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  fabLabel: { color: colors.white, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
});
