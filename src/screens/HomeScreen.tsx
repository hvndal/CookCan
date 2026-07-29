import React, { useEffect } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  CalendarDays,
  Camera,
  Crown,
  Edit3,
  ShoppingBasket,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BouncePressable, Pulsate } from '../theme/motion';
import { useData } from '../context/DataContext';
import { useBilling } from '../context/BillingContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { REMOTE } from '../theme/assets';
import { FREE_SCANS_PER_MONTH } from '../constants/billing';
import type { MainTabParamList } from '../types';
import { useRootNavigation } from '../navigation/useRootNavigation';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const rootNav = useRootNavigation();
  const tabNav = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { user } = useAuth();
  const { pantry, recipes, scansRemaining, canScan, seedStarterPantry, cuisines, diets } =
    useData();
  const { isPro, localizedPrice } = useBilling();

  useEffect(() => {
    seedStarterPantry();
  }, [seedStarterPantry]);

  function openScan() {
    if (!canScan) {
      rootNav.navigate('Paywall', { reason: 'scan_limit' });
      return;
    }
    rootNav.navigate('Scanning');
  }

  const name =
    user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Chef';
  const inProgress = recipes.find((r) => (r.inProgressStep ?? 0) > 0) ?? recipes[0];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 140 }}>
        <View style={styles.header}>
          <Text style={styles.brand}>CookCan</Text>
          <BouncePressable onPress={() => rootNav.navigate('Profile')} style={styles.avatarRing}>
            <Text style={styles.avatarText}>{(name[0] ?? 'C').toUpperCase()}</Text>
          </BouncePressable>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
          <Text style={styles.hello}>Bon Appétit, {name}.</Text>
          <Text style={styles.helloSub}>Your kitchen is ready for something new today.</Text>
          {(cuisines.length > 0 || diets.length > 0) && (
            <Text style={styles.prefsLine}>
              {[...cuisines.slice(0, 3), ...diets.slice(0, 2)].join(' · ')}
            </Text>
          )}
        </View>

        <View style={styles.bento}>
          <Bento
            label="Manual Entry"
            color={colors.secondaryContainer}
            icon={<Edit3 color={colors.onSecondaryContainer} size={20} />}
            onPress={() => tabNav.navigate('Pantry')}
          />
          <Bento
            label="Shopping"
            color={colors.surfaceLow}
            icon={<ShoppingBasket color={colors.primary} size={20} />}
            onPress={() => tabNav.navigate('Grocery')}
          />
          <Bento
            label="Meal Plan"
            color={colors.tertiaryContainer}
            icon={<CalendarDays color={colors.tertiary} size={20} />}
            onPress={() => rootNav.navigate('MealPlanner')}
          />
        </View>

        {inProgress && (
          <BouncePressable
            onPress={() => rootNav.navigate('RecipeDetail', { recipeId: inProgress.id })}
            style={styles.continueCard}
          >
            <Image
              source={{ uri: REMOTE.continueCooking }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.72)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.inProgressPill}>
              <Text style={styles.inProgressText}>IN PROGRESS</Text>
            </View>
            <Text style={styles.continueTitle}>{inProgress.title}</Text>
            <View style={styles.resumeBtn}>
              <Text style={styles.resumeText}>RESUME RECIPE</Text>
            </View>
          </BouncePressable>
        )}

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
          <Text style={styles.sectionCaps}>Pantry overview</Text>
          <Text style={styles.pantryHealth}>
            {pantry.length} ingredients · health {pantry.length > 4 ? 'Optimal' : 'Getting started'}
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
            {pantry.slice(0, 4).map((p) => (
              <View key={p.id} style={styles.miniChip}>
                <Text style={styles.miniChipText}>{p.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <Text style={styles.sectionCaps}>Recent recipes</Text>
          {recipes.length === 0 ? (
            <Text style={styles.empty}>Scan your fridge to generate your first recipes.</Text>
          ) : (
            recipes.slice(0, 6).map((r, idx) => (
              <BouncePressable
                key={r.id}
                onPress={() => rootNav.navigate('RecipeDetail', { recipeId: r.id })}
                style={styles.recipeRow}
              >
                <Image
                  source={{
                    uri: idx % 2 === 0 ? REMOTE.recipeSalmon : REMOTE.recipeGarden,
                  }}
                  style={styles.thumb}
                  contentFit="cover"
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.recipeTitle}>{r.title}</Text>
                  <Text style={styles.recipeMeta}>
                    {r.cookTimeMinutes} min · {r.difficulty}
                    {r.cuisine ? ` · ${r.cuisine}` : ''}
                  </Text>
                </View>
              </BouncePressable>
            ))
          )}
        </View>

        <Text style={styles.scanHint}>
          {isPro
            ? 'Unlimited Pro scans · smart recipes'
            : `${scansRemaining === Infinity ? FREE_SCANS_PER_MONTH : scansRemaining} free scans left this month`}
        </Text>
      </ScrollView>

      <View style={[styles.fabWrap, { bottom: insets.bottom + 78 }]}>
        <Pulsate>
          <BouncePressable onPress={openScan} style={styles.fab}>
            <Camera color={colors.white} size={26} />
            <Text style={styles.fabLabel}>SCAN</Text>
          </BouncePressable>
        </Pulsate>
      </View>
    </View>
  );
}

function Bento({
  label,
  color,
  icon,
  onPress,
}: {
  label: string;
  color: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <BouncePressable onPress={onPress} style={[styles.bentoItem, { backgroundColor: color }]}>
      {icon}
      <Text style={styles.bentoLabel}>{label}</Text>
    </BouncePressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  header: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
    fontStyle: 'italic',
  },
  avatarRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(164,55,88,0.25)',
  },
  avatarText: { fontWeight: '800', color: colors.primaryDark },
  hello: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.charcoal,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  helloSub: { color: colors.muted, marginTop: 4, fontSize: 15 },
  prefsLine: {
    marginTop: 8,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 12,
  },
  bento: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  bentoItem: {
    flex: 1,
    height: 110,
    borderRadius: 16,
    padding: 14,
    justifyContent: 'space-between',
  },
  bentoLabel: { fontWeight: '700', color: colors.charcoal, fontSize: 13 },
  continueCard: {
    marginHorizontal: 20,
    marginTop: 18,
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 18,
  },
  inProgressPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  inProgressText: { color: colors.white, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  continueTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  resumeBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resumeText: { fontWeight: '800', fontSize: 12, letterSpacing: 0.5, color: colors.charcoal },
  proBanner: {
    marginHorizontal: 20,
    marginTop: 14,
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
    marginHorizontal: 20,
    marginTop: 18,
    backgroundColor: 'rgba(225,129,101,0.18)',
    borderRadius: 18,
    padding: 16,
  },
  sectionCaps: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.outline,
    marginBottom: 8,
  },
  pantryHealth: { color: colors.charcoal, fontWeight: '700' },
  healthBar: {
    marginTop: 10,
    height: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.6)',
    overflow: 'hidden',
  },
  healthFill: { height: '100%', backgroundColor: colors.secondary },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  miniChip: {
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  miniChipText: { fontSize: 12, fontWeight: '600', color: colors.charcoal },
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
  thumb: { width: 80, height: 80, borderRadius: 12 },
  recipeTitle: { fontSize: 16, fontWeight: '700', color: colors.charcoal },
  recipeMeta: { color: colors.muted, marginTop: 4, fontSize: 13 },
  scanHint: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: 18,
    fontSize: 13,
  },
  fabWrap: {
    position: 'absolute',
    alignSelf: 'center',
    left: 0,
    right: 0,
    alignItems: 'center',
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
