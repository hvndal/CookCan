import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { de, en, es, fr, pt } from '../i18n/translations';
import { detectLocale, type AppLanguage } from './locale';

const initial = detectLocale('auto');

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    pt: { translation: pt },
    es: { translation: es },
    fr: { translation: fr },
    de: { translation: de },
  },
  lng: initial.language,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

export async function setAppLanguage(lang: AppLanguage) {
  await i18n.changeLanguage(lang);
}

export default i18n;
