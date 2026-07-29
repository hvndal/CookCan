import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { useBilling } from '../context/BillingContext';
import {
  FREE_SCANS_PER_MONTH,
  FREE_TRIAL_DAYS,
  PLANS,
  PRO_MONTHLY_PRODUCT_ID,
  PRO_YEARLY_PRODUCT_ID,
  REGIONAL_PRICE_TARGETS_MONTHLY,
  REGIONAL_PRICE_TARGETS_YEARLY,
  YEARLY_DISCOUNT_LABEL,
  type BillingPeriod,
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
  const [period, setPeriod] = useState<BillingPeriod>('yearly');
  const {
    isPro,
    localizedPrice,
    localizedYearlyPrice,
    purchasing,
    purchasePro,
    restorePurchases,
    activateProMock,
    subscription,
  } = useBilling();

  const selectedPrice = period === 'yearly' ? localizedYearlyPrice : localizedPrice;
  const selectedSku = period === 'yearly' ? PRO_YEARLY_PRODUCT_ID : PRO_MONTHLY_PRODUCT_ID;

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
        Start with a {FREE_TRIAL_DAYS}-day free trial. Prices are localized by Google Play for
        your country. AI Chef stays Pro-only.
      </Text>

      <View style={styles.toggleRow}>
        <PeriodChip
          label="Yearly"
          detail={`${localizedYearlyPrice} · ${YEARLY_DISCOUNT_LABEL}`}
          selected={period === 'yearly'}
          badge="Best value"
          onPress={() => setPeriod('yearly')}
        />
        <PeriodChip
          label="Monthly"
          detail={localizedPrice}
          selected={period === 'monthly'}
          onPress={() => setPeriod('monthly')}
        />
      </View>

      <View style={styles.priceCard}>
        <Text style={styles.trial}>{PLANS.pro.trialLabel}</Text>
        <Text style={styles.price}>{isPro ? 'Active' : selectedPrice}</Text>
        <Text style={styles.priceMeta}>
          {isPro
            ? `${subscription.billingPeriod ?? 'pro'} · ${subscription.productId ?? ''}`
            : `Then ${selectedPrice} · SKU ${selectedSku}`}
        </Text>
      </View>

      <View style={styles.features}>
        {PLANS.pro.features.map((f) => (
          <Text key={f} style={styles.feature}>
            ✓ {f}
          </Text>
        ))}
      </View>

      <Text style={styles.regionTitle}>Monthly regional targets</Text>
      <Text style={styles.latamNote}>LATAM priced at ~USD 1.50 equivalent</Text>
      {REGIONAL_PRICE_TARGETS_MONTHLY.map((r) => (
        <Text key={`m-${r.region}`} style={styles.regionRow}>
          {r.region}: {r.symbol}
          {r.amount}/{r.currency} mo
          {'note' in r && r.note === 'latam' ? ' · LATAM' : ''}
        </Text>
      ))}

      <Text style={styles.regionTitle}>Yearly regional targets ({YEARLY_DISCOUNT_LABEL})</Text>
      {REGIONAL_PRICE_TARGETS_YEARLY.map((r) => (
        <Text key={`y-${r.region}`} style={styles.regionRow}>
          {r.region}: {r.symbol}
          {r.amount}/{r.currency} yr
        </Text>
      ))}
      <Text style={styles.footnote}>
        Product IDs (SKUs) are the Play Console catalog codes the app purchases. Create
        `{PRO_MONTHLY_PRODUCT_ID}` and `{PRO_YEARLY_PRODUCT_ID}` with a {FREE_TRIAL_DAYS}-day
        free trial offer. The charged price always comes from Play for the user’s store country.
      </Text>

      {!isPro && (
        <Button
          label={`Start ${FREE_TRIAL_DAYS}-day trial · ${selectedPrice}`}
          onPress={() => purchasePro(period)}
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
          label={`Unlock Pro ${period} (dev)`}
          variant="ghost"
          onPress={async () => {
            await activateProMock(period);
            navigation.goBack();
          }}
          style={{ marginTop: 8 }}
        />
      )}
      <Button label="Not now" variant="ghost" onPress={() => navigation.goBack()} style={{ marginTop: 8 }} />
    </ScrollView>
  );
}

function PeriodChip({
  label,
  detail,
  selected,
  badge,
  onPress,
}: {
  label: string;
  detail: string;
  selected: boolean;
  badge?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipOn]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {badge ? <Text style={styles.badge}>{badge}</Text> : null}
      <Text style={[styles.chipLabel, selected && styles.chipLabelOn]}>{label}</Text>
      <Text style={[styles.chipDetail, selected && styles.chipDetailOn]}>{detail}</Text>
    </Pressable>
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
  toggleRow: { marginTop: 20, gap: 10 },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.outline,
  },
  chipOn: {
    borderColor: colors.primary,
    backgroundColor: '#FFF4EB',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.amber,
    color: colors.charcoal,
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  chipLabel: { fontSize: 18, fontWeight: '800', color: colors.charcoal },
  chipLabelOn: { color: colors.primaryDark },
  chipDetail: { marginTop: 4, color: colors.muted, fontWeight: '600' },
  chipDetailOn: { color: colors.primaryDark },
  priceCard: {
    marginTop: 18,
    backgroundColor: colors.primary,
    borderRadius: 22,
    padding: 22,
  },
  trial: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 12,
  },
  price: { color: colors.white, fontSize: 34, fontWeight: '900' },
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
  latamNote: {
    marginTop: 6,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 13,
  },
  footnote: { marginTop: 12, color: colors.tabInactive, fontSize: 13, lineHeight: 18 },
});
