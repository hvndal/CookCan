import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { setAppLanguage } from '../lib/i18n';
import {
  COUNTRY_LABELS,
  currencyForCountry,
  detectLocale,
  resolveUiLanguage,
  type AppLanguage,
  type CountryCode,
  type LocaleInfo,
} from '../lib/locale';
import { formatLocalPrice } from '../lib/pricing';
import type { BillingPeriod } from '../constants/billing';

const LANG_KEY = '@cookcan/language_pref';
const COUNTRY_OVERRIDE_KEY = '@cookcan/country_override';

type LanguagePref = AppLanguage | 'auto';

type SettingsContextType = {
  theme: 'light';
  colors: typeof colors;
  ready: boolean;
  locale: LocaleInfo;
  languagePref: LanguagePref;
  country: CountryCode;
  countryLabel: string;
  setLanguagePref: (pref: LanguagePref) => Promise<void>;
  setCountryOverride: (country: CountryCode | null) => Promise<void>;
  localPrice: (period: BillingPeriod) => ReturnType<typeof formatLocalPrice>;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

function buildLocale(pref: LanguagePref, override: CountryCode | null): LocaleInfo {
  const next = detectLocale(pref);
  if (override) {
    next.country = override;
    next.currencyCode = currencyForCountry(override);
    next.language =
      pref === 'auto'
        ? resolveUiLanguage(next.languageCode, override, 'auto')
        : pref;
  }
  return next;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [languagePref, setLanguagePrefState] = useState<LanguagePref>('auto');
  const [countryOverride, setCountryOverrideState] = useState<CountryCode | null>(null);
  const [locale, setLocale] = useState<LocaleInfo>(() => detectLocale('auto'));

  useEffect(() => {
    (async () => {
      const [langRaw, countryRaw] = await Promise.all([
        AsyncStorage.getItem(LANG_KEY),
        AsyncStorage.getItem(COUNTRY_OVERRIDE_KEY),
      ]);
      const pref = (langRaw as LanguagePref) || 'auto';
      const override = (countryRaw as CountryCode) || null;
      setLanguagePrefState(pref);
      setCountryOverrideState(override);
      const next = buildLocale(pref, override);
      setLocale(next);
      await setAppLanguage(next.language);
      setReady(true);
    })();
  }, []);

  const setLanguagePref = useCallback(
    async (pref: LanguagePref) => {
      setLanguagePrefState(pref);
      await AsyncStorage.setItem(LANG_KEY, pref);
      const next = buildLocale(pref, countryOverride);
      setLocale(next);
      await setAppLanguage(next.language);
    },
    [countryOverride]
  );

  const setCountryOverride = useCallback(
    async (country: CountryCode | null) => {
      setCountryOverrideState(country);
      if (country) await AsyncStorage.setItem(COUNTRY_OVERRIDE_KEY, country);
      else await AsyncStorage.removeItem(COUNTRY_OVERRIDE_KEY);
      const next = buildLocale(languagePref, country);
      setLocale(next);
      await setAppLanguage(next.language);
    },
    [languagePref]
  );

  const localPrice = useCallback(
    (period: BillingPeriod) => {
      const suffixes = {
        en: { monthly: '/mo', yearly: '/yr' },
        pt: { monthly: '/mês', yearly: '/ano' },
        es: { monthly: '/mes', yearly: '/año' },
        fr: { monthly: '/mois', yearly: '/an' },
        de: { monthly: '/Mon.', yearly: '/Jahr' },
      }[locale.language];
      return formatLocalPrice(locale.country, period, suffixes);
    },
    [locale.country, locale.language]
  );

  const value = useMemo(
    () => ({
      theme: 'light' as const,
      colors,
      ready,
      locale,
      languagePref,
      country: locale.country,
      countryLabel: COUNTRY_LABELS[locale.country],
      setLanguagePref,
      setCountryOverride,
      localPrice,
    }),
    [ready, locale, languagePref, setLanguagePref, setCountryOverride, localPrice]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
