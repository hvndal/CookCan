import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { useBilling } from '../context/BillingContext';
import {
  FREE_SCANS_PER_MONTH,
  PLANS,
  PRO_PRODUCT_ID,
  REGIONAL_PRICE_TARGETS,
} from '../constants/billing';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

const REASON_COPY: Record<string, string> = {
  scan_limit: `You've used your ${FREE_SCANS_PER_MONTH} free scans this month.`,
  ai_chef: 'AI Chef is included with CookCan Pro.',
  meal_planner: 'Meal planner is included with CookCan Pro.',
  upgrade: 'Unlock the full CookCan kitchen.',
  profile: 'Manage your CookCan Pro subscription.',
};

export default function PaywallScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const reason = route.params?.reason ?? 'upgrade';
  const {
    isPro,
    localizedPrice,
    purchasing,
    purchasePro,
    restorePurchases,
    activateProMock,
  } = useBilling();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: 40,
        paddingHorizontal: 20,
      }}
    >
      <Text style={styles.brand}>CookCan Pro</Text>
      <Text style={styles.headline}>{REASON_COPY[reason] ?? REASON_COPY.upgrade}</Text>
      <Text style={styles.sub}>
        One monthly plan. Price is localized by Google Play for your store country
        (dynamic regional pricing).
      </Text>

      <View style={styles.priceCard}>
        <Text style={styles.price}>{isPro ? 'Active' : localizedPrice}</Text>
        <Text style={styles.priceMeta}>SKU · {PRO_PRODUCT_ID}</Text>
      </View>

      <View style={styles.features}>
        {PLANS.pro.features.map((f) => (
          <Text key={f} style={styles.feature}>
            ✓ {f}
          </Text>
        ))}
      </View>

      <Text style={styles.regionTitle}>Regional price targets</Text>
      {REGIONAL_PRICE_TARGETS.map((r) => (
        <Text key={r.region} style={styles.regionRow}>
          {r.region}: {r.symbol}
          {r.amount} {r.currency}/mo
        </Text>
      ))}
      <Text style={styles.footnote}>
        Configure these in Play Console on the same subscription product. The app shows the
        store-returned localized price at purchase time.
      </Text>

      {!isPro && (
        <Button
          label={`Subscribe · ${localizedPrice}`}
          onPress={purchasePro}
          loading={purchasing}
          style={{ marginTop: 22 }}
        />
      )}
      <Button
        label="Restore purchases"
        variant="secondary"
        onPress={restorePurchases}
        style={{ marginTop: 12 }}
      />
      {__DEV__ && !isPro && (
        <Button
          label="Unlock Pro (dev / no Play Billing)"
          variant="ghost"
          onPress={async () => {
            await activateProMock();
            navigation.goBack();
          }}
          style={{ marginTop: 8 }}
        />
      )}
      <Button label="Not now" variant="ghost" onPress={() => navigation.goBack()} style={{ marginTop: 8 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  brand: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.pro,
    letterSpacing: 0.5,
  },
  headline: {
    marginTop: 10,
    fontSize: 30,
    fontWeight: '900',
    color: colors.charcoal,
    letterSpacing: -0.6,
  },
  sub: { marginTop: 10, color: colors.muted, lineHeight: 22 },
  priceCard: {
    marginTop: 22,
    backgroundColor: colors.primary,
    borderRadius: 22,
    padding: 22,
  },
  price: { color: colors.white, fontSize: 36, fontWeight: '900' },
  priceMeta: { color: 'rgba(255,255,255,0.8)', marginTop: 6 },
  features: { marginTop: 22, gap: 10 },
  feature: { fontSize: 16, color: colors.charcoal, fontWeight: '600' },
  regionTitle: {
    marginTop: 28,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.primaryDark,
  },
  regionRow: { marginTop: 8, color: colors.muted },
  footnote: { marginTop: 12, color: colors.tabInactive, fontSize: 13, lineHeight: 18 },
});
