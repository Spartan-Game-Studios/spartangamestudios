import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { DEFAULT_LOCALE, LOCALE_CODES } from './locales';

export const STORAGE_KEY = 'sgs-locale';

/**
 * Every JSON file in ./locales becomes a bundle, keyed by its filename. Fully
 * translated locales ship a populated file; the rest are stubs (`{}` today)
 * that fall back to English per-key via `fallbackLng` until a translator fills
 * them in — a partially translated file simply lights up the keys it defines.
 *
 * Bundled, not lazy-loaded: even 28 locales of UI copy are a few kB gzipped
 * (the stubs are empty), and bundling means no flash of untranslated content
 * and no second round trip on first paint. Revisit if real translations land
 * for all of them and the total grows large.
 */
const files = import.meta.glob<{ default: Record<string, unknown> }>('./locales/*.json', {
  eager: true,
});
export const resources = Object.fromEntries(
  Object.entries(files).map(([path, mod]) => {
    const code = path.slice('./locales/'.length, -'.json'.length);
    return [code, { translation: mod.default }];
  }),
);

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: LOCALE_CODES,

    // Keep regional bundles distinct (pt-BR, zh-CN, zh-TW) rather than
    // collapsing to the base language; `nonExplicitSupportedLngs` still lets a
    // detected `es-ES` / `en-GB` resolve onto its base bundle.
    load: 'currentOnly',
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
