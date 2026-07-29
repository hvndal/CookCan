import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/Button';
import { useBilling } from '../context/BillingContext';
import { useSettings } from '../context/SettingsContext';
import { FREE_SCANS_PER_MONTH, FREE_TRIAL_DAYS, PLANS, type BillingPeriod } from '../constants/billing';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

export default function PaywallScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const reason = route.params?.reason ?? 'upgrade';
  const [period, setPeriod] = useState<BillingPeriod>('yearly');
  const { countryLabel, locale } = useSettings();
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

  const headline =
    reason === 'scan_limit'
      ? t('paywallScanLimit', { count: FREE_SCANS_PER_MONTH })
      : reason === 'ai_chef'
        ? t('paywallAi')
        : reason === 'meal_planner'
          ? t('paywallMeal')
          : reason === 'profile'
            ? t('paywallProfile')
            : t('paywallUpgrade');

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: 40,
        paddingHorizontal: 20,
      }}
    >
      <Text style={styles.brand}>{t('paywallBrand')}</Text>
      <Text style={styles.headline}>{headline}</Text>
      <Text style={styles.sub}>
        {t('paywallSub', { days: FREE_TRIAL_DAYS, region: countryLabel })}
      </Text>
      <Text style={styles.currencyNote}>
        {t('localPricing', { currency: locale.currencyCode })} · {countryLabel}
      </Text>

      <View style={styles.toggleRow}>
        <PeriodChip
          label={t('yearly')}
          detail={`${localizedYearlyPrice} · ${t('monthsFree')}`}
          selected={period === 'yearly'}
          badge={t('bestValue')}
          onPress={() => setPeriod('yearly')}
        />
        <PeriodChip
          label={t('monthly')}
          detail={localizedPrice}
          selected={period === 'monthly'}
          onPress={() => setPeriod('monthly')}
        />
      </View>

      <View style={styles.priceCard}>
        <Text style={styles.trial}>{t('trialLabel', { days: FREE_TRIAL_DAYS })}</Text>
        <Text style={styles.price}>{isPro ? '✓' : selectedPrice}</Text>
        <Text style={styles.priceMeta}>
          {isPro
            ? `${subscription.billingPeriod ?? 'pro'}`
            : t('thenPrice', { price: selectedPrice })}
        </Text>
      </View>

      <View style={styles.features}>
        {PLANS.pro.features.map((f) => (
          <Text key={f} style={styles.feature}>
            ✓ {f}
          </Text>
        ))}
      </View>

      {!isPro && (
        <Button
          label={t('startTrial', { days: FREE_TRIAL_DAYS, price: selectedPrice })}
          onPress={() => purchasePro(period)}
          loading={purchasing}
          style={{ marginTop: 22 }}
        />
      )}
      <Button
        label={t('restore')}
        variant="secondary"
        onPress={restorePurchases}
        style={{ marginTop: 12 }}
      />
      {__DEV__ && !isPro && (
        <Button
          label={`QA · Pro ${period}`}
          variant="ghost"
          onPress={async () => {
            await activateProMock(period);
            navigation.goBack();
          }}
          style={{ marginTop: 8 }}
        />
      )}
      <Button label={t('notNow')} variant="ghost" onPress={() => navigation.goBack()} style={{ marginTop: 8 }} />
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
  currencyNote: {
    marginTop: 8,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 13,
  },
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
});
