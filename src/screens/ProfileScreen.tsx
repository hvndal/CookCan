import React from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRootNavigation } from '../navigation/useRootNavigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useBilling } from '../context/BillingContext';
import { useData } from '../context/DataContext';
import { useSettings } from '../context/SettingsContext';
import { FREE_SCANS_PER_MONTH, PLANS } from '../constants/billing';
import { LEGAL } from '../constants/legal';
import { LANGUAGE_LABELS, type AppLanguage } from '../lib/locale';
import { colors } from '../theme/colors';

const LANGS: Array<AppLanguage | 'auto'> = ['auto', 'en', 'pt', 'es', 'fr', 'de'];

export default function ProfileScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useRootNavigation();
  const { user, signOut, isLocalUser } = useAuth();
  const {
    isPro,
    localizedPrice,
    localizedYearlyPrice,
    subscription,
    restorePurchases,
    deactivateProMock,
  } = useBilling();
  const { scansUsed, scansRemaining } = useData();
  const { languagePref, setLanguagePref, countryLabel, locale } = useSettings();

  const activePrice =
    subscription.billingPeriod === 'yearly' ? localizedYearlyPrice : localizedPrice;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 40, paddingHorizontal: 20 }}
    >
      <Text style={styles.title}>{t('profile')}</Text>
      <Text style={styles.sub}>{user?.email ?? t('guestCook')}</Text>
      {isLocalUser && <Text style={styles.badge}>{t('localSession')}</Text>}
      <Text style={styles.badge}>
        {t('detectedRegion', { region: countryLabel })} · {t('localPricing', { currency: locale.currencyCode })}
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>{t('plan')}</Text>
        <Text style={styles.cardValue}>{isPro ? PLANS.pro.name : PLANS.free.name}</Text>
        <Text style={styles.cardMeta}>
          {isPro
            ? t('activePlan', {
                period: subscription.billingPeriod ?? 'pro',
                price: activePrice,
              })
            : t('scansUsed', {
                used: scansUsed,
                total: FREE_SCANS_PER_MONTH,
                left: scansRemaining,
              })}
        </Text>
      </View>

      <Text style={styles.section}>{t('language')}</Text>
      <View style={styles.langRow}>
        {LANGS.map((lang) => {
          const selected = languagePref === lang;
          const label =
            lang === 'auto' ? t('languageAuto') : LANGUAGE_LABELS[lang];
          return (
            <Pressable
              key={lang}
              onPress={() => setLanguagePref(lang)}
              style={[styles.langChip, selected && styles.langChipOn]}
            >
              <Text style={[styles.langText, selected && styles.langTextOn]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
      {locale.language !== 'en' && (
        <Button
          label={t('switchEnglish')}
          variant="secondary"
          onPress={() => setLanguagePref('en')}
          style={{ marginTop: 10 }}
        />
      )}

      {!isPro && (
        <Button
          label={t('upgradePro')}
          onPress={() => navigation.navigate('Paywall', { reason: 'profile' })}
          style={{ marginTop: 16 }}
        />
      )}

      <Button
        label={t('restore')}
        variant="secondary"
        onPress={() => restorePurchases()}
        style={{ marginTop: 12 }}
      />

      <Button
        label={t('privacy')}
        variant="ghost"
        onPress={() => Linking.openURL(LEGAL.privacyUrl)}
        style={{ marginTop: 16 }}
      />
      <Button label={t('terms')} variant="ghost" onPress={() => Linking.openURL(LEGAL.termsUrl)} />
      <Button
        label={t('support', { email: LEGAL.supportEmail })}
        variant="ghost"
        onPress={() => Linking.openURL(`mailto:${LEGAL.supportEmail}?subject=CookCan%20support`)}
      />

      {isPro && __DEV__ && (
        <Button
          label="QA · Free"
          variant="ghost"
          onPress={() => deactivateProMock()}
          style={{ marginTop: 8 }}
        />
      )}

      <Button
        label={t('signOut')}
        variant="ghost"
        onPress={() => {
          Alert.alert(t('signOutConfirm'), undefined, [
            { text: t('cancel'), style: 'cancel' },
            {
              text: t('signOut'),
              style: 'destructive',
              onPress: async () => {
                await signOut();
              },
            },
          ]);
        }}
        style={{ marginTop: 24 }}
      />

      <Button label={t('close')} variant="secondary" onPress={() => navigation.goBack()} style={{ marginTop: 12 }} />
      <Text style={styles.version}>CookCan v{LEGAL.appVersion}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  title: { fontSize: 30, fontWeight: '800', color: colors.charcoal },
  sub: { color: colors.muted, marginTop: 4 },
  badge: {
    marginTop: 8,
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    marginTop: 24,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.primaryDark,
  },
  cardValue: { fontSize: 24, fontWeight: '800', color: colors.charcoal, marginTop: 6 },
  cardMeta: { color: colors.muted, marginTop: 6 },
  section: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.primaryDark,
  },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  langChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  langText: { fontWeight: '600', color: colors.charcoal, fontSize: 13 },
  langTextOn: { color: colors.white },
  version: {
    marginTop: 18,
    textAlign: 'center',
    color: colors.tabInactive,
    fontSize: 12,
  },
});
