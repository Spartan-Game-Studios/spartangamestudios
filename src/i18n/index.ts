import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import { DEFAULT_LOCALE, LOCALE_CODES } from './locales';

export const STORAGE_KEY = 'sgs-locale';

/**
 * Bundled, not lazy-loaded. Four locales of copy is a few kB gzipped — less
 * than one font file — and bundling means no flash of untranslated content and
 * no second round trip on first paint. Revisit if the locale count grows.
 */
export const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
} as const;

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: LOCALE_CODES,

    // `es-419` and `es-ES` both load the `es` bundle rather than 404ing.
    load: 'languageOnly',
    nonExplicitSupportedLngs: true,

    interpolation: {
      // React escapes for us; double-escaping mangles apostrophes and quotes.
      escapeValue: false,
    },

    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: STORAGE_KEY,
      caches: ['localStorage'],
    },
  });

export default i18n;
