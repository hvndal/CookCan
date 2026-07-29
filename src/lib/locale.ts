import * as Localization from 'expo-localization';

export type AppLanguage = 'en' | 'pt' | 'es' | 'fr' | 'de';

export type CountryCode =
  | 'US'
  | 'CA'
  | 'GB'
  | 'IN'
  | 'DE'
  | 'FR'
  | 'ES'
  | 'IT'
  | 'MX'
  | 'BR'
  | 'AR'
  | 'CO'
  | 'CL'
  | 'PE'
  | 'OTHER_EU'
  | 'OTHER_LATAM'
  | 'OTHER';

export type LocaleInfo = {
  languageTag: string;
  languageCode: string;
  regionCode: string | null;
  country: CountryCode;
  /** UI language after India→English rule */
  language: AppLanguage;
  currencyCode: string;
};

const LANG_MAP: Record<string, AppLanguage> = {
  en: 'en',
  pt: 'pt',
  es: 'es',
  fr: 'fr',
  de: 'de',
};

/** Map device region → pricing country. */
export function countryFromRegion(region: string | null | undefined): CountryCode {
  const r = (region || '').toUpperCase();
  switch (r) {
    case 'US':
      return 'US';
    case 'CA':
      return 'CA';
    case 'GB':
    case 'UK':
      return 'GB';
    case 'IN':
      return 'IN';
    case 'DE':
      return 'DE';
    case 'FR':
      return 'FR';
    case 'ES':
      return 'ES';
    case 'IT':
    case 'NL':
    case 'BE':
    case 'AT':
    case 'IE':
    case 'PT':
    case 'FI':
    case 'GR':
      return 'OTHER_EU';
    case 'MX':
      return 'MX';
    case 'BR':
      return 'BR';
    case 'AR':
      return 'AR';
    case 'CO':
      return 'CO';
    case 'CL':
      return 'CL';
    case 'PE':
      return 'PE';
    case 'UY':
    case 'PY':
    case 'BO':
    case 'EC':
    case 'VE':
    case 'CR':
    case 'PA':
    case 'GT':
    case 'HN':
    case 'SV':
    case 'NI':
    case 'DO':
      return 'OTHER_LATAM';
    default:
      return 'OTHER';
  }
}

/**
 * Infer country when region is missing, from language.
 * pt → BR, es → MX (LATAM default), fr → FR, de → DE, else US.
 */
export function countryFromLanguage(languageCode: string): CountryCode {
  switch (languageCode) {
    case 'pt':
      return 'BR';
    case 'es':
      return 'MX';
    case 'fr':
      return 'FR';
    case 'de':
      return 'DE';
    case 'hi':
    case 'ta':
    case 'te':
    case 'bn':
    case 'mr':
    case 'gu':
    case 'kn':
    case 'ml':
    case 'pa':
      return 'IN';
    default:
      return 'US';
  }
}

/**
 * UI language rules:
 * - India always English
 * - Otherwise use device language if we support it (en/pt/es/fr/de)
 * - Unsupported → English
 */
export function resolveUiLanguage(
  languageCode: string,
  country: CountryCode,
  override?: AppLanguage | 'auto' | null
): AppLanguage {
  if (override && override !== 'auto') return override;
  if (country === 'IN') return 'en';
  return LANG_MAP[languageCode] ?? 'en';
}

export function currencyForCountry(country: CountryCode): string {
  switch (country) {
    case 'US':
    case 'OTHER':
      return 'USD';
    case 'CA':
      return 'CAD';
    case 'GB':
      return 'GBP';
    case 'IN':
      return 'INR';
    case 'DE':
    case 'FR':
    case 'ES':
    case 'IT':
    case 'OTHER_EU':
      return 'EUR';
    case 'MX':
      return 'MXN';
    case 'BR':
      return 'BRL';
    case 'AR':
      return 'ARS';
    case 'CO':
      return 'COP';
    case 'CL':
      return 'CLP';
    case 'PE':
      return 'PEN';
    case 'OTHER_LATAM':
      return 'USD'; // display still uses LATAM-equivalent table row
    default:
      return 'USD';
  }
}

export function detectLocale(languageOverride?: AppLanguage | 'auto' | null): LocaleInfo {
  const locales = Localization.getLocales();
  const primary = locales[0];
  const languageCode = (primary?.languageCode || 'en').toLowerCase();
  const regionCode = primary?.regionCode ? primary.regionCode.toUpperCase() : null;
  const languageTag = primary?.languageTag || `${languageCode}-${regionCode || 'US'}`;

  let country = countryFromRegion(regionCode);
  if (!regionCode || country === 'OTHER') {
    const inferred = countryFromLanguage(languageCode);
    if (!regionCode) country = inferred;
    else if (country === 'OTHER' && inferred !== 'US') country = inferred;
  }

  const language = resolveUiLanguage(languageCode, country, languageOverride);

  return {
    languageTag,
    languageCode,
    regionCode,
    country,
    language,
    currencyCode: currencyForCountry(country),
  };
}

export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  en: 'English',
  pt: 'Português',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
};

export const COUNTRY_LABELS: Record<CountryCode, string> = {
  US: 'United States',
  CA: 'Canada',
  GB: 'United Kingdom',
  IN: 'India',
  DE: 'Germany',
  FR: 'France',
  ES: 'Spain',
  IT: 'Italy',
  MX: 'Mexico',
  BR: 'Brazil',
  AR: 'Argentina',
  CO: 'Colombia',
  CL: 'Chile',
  PE: 'Peru',
  OTHER_EU: 'Europe',
  OTHER_LATAM: 'Latin America',
  OTHER: 'International',
};
