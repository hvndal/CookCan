import React, { useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Camera, ChefHat, Crown, ShoppingBasket } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData } from '../context/DataContext';
import { useBilling } from '../context/BillingContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { FREE_SCANS_PER_MONTH } from '../constants/billing';
import type { MainTabParamList } from '../types';
import { SectionLabel } from '../components/ui';
import { useRootNavigation } from '../navigation/useRootNavigation';

export default function HomeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const rootNav = useRootNavigation();
  const tabNav = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { user } = useAuth();
  const { pantry, recipes, scansRemaining, canScan, seedStarterPantry } = useData();
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

  const name = user?.email?.split('@')[0];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 120 }}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>{t('brand')}</Text>
          <Text style={styles.hello}>
            {name ? t('helloName', { name }) : t('homeHello')}
          </Text>
        </View>
        <Pressable onPress={() => rootNav.navigate('Profile')} style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.email?.[0] ?? 'C').toUpperCase()}
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={openScan}
        style={({ pressed }) => [styles.hero, pressed && { opacity: 0.92 }]}
      >
        <View style={styles.heroIcon}>
          <Camera color={colors.white} size={28} />
        </View>
        <Text style={styles.heroTitle}>{t('scanTitle')}</Text>
        <Text style={styles.heroSub}>
          {isPro
            ? t('scanSubPro')
            : t('scanSubFree', {
                count: scansRemaining === Infinity ? FREE_SCANS_PER_MONTH : scansRemaining,
              })}
        </Text>
      </Pressable>

      {!isPro && (
        <Pressable
          onPress={() => rootNav.navigate('Paywall', { reason: 'upgrade' })}
          style={styles.proBanner}
        >
          <Crown color={colors.pro} size={20} />
          <View style={{ flex: 1 }}>
            <Text style={styles.proTitle}>{t('proBannerTitle', { price: localizedPrice })}</Text>
            <Text style={styles.proSub}>{t('proBannerSub')}</Text>
          </View>
        </Pressable>
      )}

      <View style={styles.row}>
        <QuickCard
          icon={<ChefHat color={colors.primary} size={22} />}
          title={t('recipes')}
          value={String(recipes.length)}
          onPress={() => {
            if (recipes[0]) rootNav.navigate('RecipeDetail', { recipeId: recipes[0].id });
          }}
        />
        <QuickCard
          icon={<ShoppingBasket color={colors.primary} size={22} />}
          title={t('pantry')}
          value={String(pantry.length)}
          onPress={() => tabNav.navigate('Pantry')}
        />
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
        <SectionLabel>{t('continueCooking')}</SectionLabel>
        {recipes.length === 0 ? (
          <Text style={styles.empty}>{t('emptyRecipes')}</Text>
        ) : (
          recipes.slice(0, 5).map((r) => (
            <Pressable
              key={r.id}
              onPress={() => rootNav.navigate('RecipeDetail', { recipeId: r.id })}
              style={styles.recipeRow}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.recipeTitle}>{r.title}</Text>
                <Text style={styles.recipeMeta}>
                  {r.cookTimeMinutes} min · {r.difficulty}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </View>

      <Pressable onPress={() => rootNav.navigate('MealPlanner')} style={styles.mealLink}>
        <Text style={styles.mealLinkText}>{t('mealPlannerLink')}</Text>
      </Pressable>
    </ScrollView>
  );
}

function QuickCard({
  icon,
  title,
  value,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.quick}>
      {icon}
      <Text style={styles.quickValue}>{value}</Text>
      <Text style={styles.quickTitle}>{title}</Text>
    </Pressable>
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
    fontSize: 30,
    fontWeight: '900',
    color: colors.primaryDark,
    fontStyle: 'italic',
  },
  hello: { color: colors.muted, marginTop: 2 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarText: { fontWeight: '800', color: colors.primaryDark },
  hero: {
    marginHorizontal: 20,
    marginTop: 22,
    borderRadius: 24,
    padding: 22,
    backgroundColor: colors.primary,
    overflow: 'hidden',
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: { color: colors.white, fontSize: 26, fontWeight: '800' },
  heroSub: { color: 'rgba(255,255,255,0.88)', marginTop: 6, fontSize: 15 },
  proBanner: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: colors.creamDark,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outline,
  },
  proTitle: { fontWeight: '800', color: colors.pro },
  proSub: { color: colors.muted, fontSize: 13, marginTop: 2 },
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 18,
  },
  quick: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.outline,
    gap: 6,
  },
  quickValue: { fontSize: 28, fontWeight: '800', color: colors.charcoal },
  quickTitle: { color: colors.muted, fontWeight: '600' },
  empty: { color: colors.muted, lineHeight: 20 },
  recipeRow: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outline,
  },
  recipeTitle: { fontSize: 17, fontWeight: '700', color: colors.charcoal },
  recipeMeta: { color: colors.muted, marginTop: 4 },
  mealLink: { paddingHorizontal: 20, marginTop: 22 },
  mealLinkText: { color: colors.primary, fontWeight: '700', fontSize: 16 },
});
