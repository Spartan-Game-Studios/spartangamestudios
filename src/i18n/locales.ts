/**
 * The languages the site ships in — matched to Boothill's own supported set
 * (see the game's `locale/translations` in project.godot).
 *
 * `label` is deliberately the language's own endonym — a reader looking for
 * their language scans for "Deutsch", not "German".
 *
 * `translated` marks a locale whose JSON bundle is fully authored. The rest are
 * registered for structural parity but fall back to English per-key (via
 * i18next `fallbackLng`) until a translator fills their file in — so the switch
 * is wired and the URLs resolve today, and each language "lights up" the moment
 * its `locales/<code>.json` gains real strings.
 */
export const LOCALES = [
  { code: 'en', label: 'English', htmlLang: 'en', translated: true },
  { code: 'es', label: 'Español', htmlLang: 'es', translated: true },
  { code: 'fr', label: 'Français', htmlLang: 'fr', translated: true },
  { code: 'de', label: 'Deutsch', htmlLang: 'de', translated: true },
  { code: 'it', label: 'Italiano', htmlLang: 'it', translated: false },
  { code: 'pt', label: 'Português', htmlLang: 'pt', translated: false },
  { code: 'pt-BR', label: 'Português (Brasil)', htmlLang: 'pt-BR', translated: false },
  { code: 'ru', label: 'Русский', htmlLang: 'ru', translated: false },
  { code: 'uk', label: 'Українська', htmlLang: 'uk', translated: false },
  { code: 'pl', label: 'Polski', htmlLang: 'pl', translated: false },
  { code: 'cs', label: 'Čeština', htmlLang: 'cs', translated: false },
  { code: 'hu', label: 'Magyar', htmlLang: 'hu', translated: false },
  { code: 'ro', label: 'Română', htmlLang: 'ro', translated: false },
  { code: 'bg', label: 'Български', htmlLang: 'bg', translated: false },
  { code: 'el', label: 'Ελληνικά', htmlLang: 'el', translated: false },
  { code: 'tr', label: 'Türkçe', htmlLang: 'tr', translated: false },
  { code: 'nl', label: 'Nederlands', htmlLang: 'nl', translated: false },
  { code: 'da', label: 'Dansk', htmlLang: 'da', translated: false },
  { code: 'sv', label: 'Svenska', htmlLang: 'sv', translated: false },
  { code: 'nb', label: 'Norsk bokmål', htmlLang: 'nb', translated: false },
  { code: 'fi', label: 'Suomi', htmlLang: 'fi', translated: false },
  { code: 'id', label: 'Bahasa Indonesia', htmlLang: 'id', translated: false },
  { code: 'ja', label: '日本語', htmlLang: 'ja', translated: false },
  { code: 'ko', label: '한국어', htmlLang: 'ko', translated: false },
  { code: 'zh-CN', label: '简体中文', htmlLang: 'zh-CN', translated: false },
  { code: 'zh-TW', label: '繁體中文', htmlLang: 'zh-TW', translated: false },
  { code: 'th', label: 'ไทย', htmlLang: 'th', translated: false },
  { code: 'vi', label: 'Tiếng Việt', htmlLang: 'vi', translated: false },
] as const;

export type LocaleCode = (typeof LOCALES)[number]['code'];

export const DEFAULT_LOCALE: LocaleCode = 'en';

export const LOCALE_CODES = LOCALES.map((locale) => locale.code);

/** Locales whose bundle is fully authored (the rest fall back to English). */
export const TRANSLATED_LOCALES = LOCALES.filter((locale) => locale.translated).map(
  (locale) => locale.code,
);

export function isLocaleCode(value: string): value is LocaleCode {
  return (LOCALE_CODES as readonly string[]).includes(value);
}

/**
 * Map an arbitrary BCP-47 / Godot-style tag onto a supported locale.
 *
 * Regional bundles are kept distinct where we ship them (`pt-BR`, `zh-CN`,
 * `zh-TW`); everything else narrows to its base language (`es-419` -> `es`),
 * and Chinese without an explicit simplified/traditional split is resolved by
 * script. Anything unknown falls back to English.
 */
export function resolveLocale(value: string | undefined): LocaleCode {
  if (!value) return DEFAULT_LOCALE;
  const lower = value.replace(/_/g, '-').toLowerCase();

  const exact = LOCALE_CODES.find((code) => code.toLowerCase() === lower);
  if (exact) return exact;

  const [base, region] = lower.split('-');
  if (base === 'zh') {
    return region === 'tw' || region === 'hk' || region === 'mo' || region === 'hant'
      ? 'zh-TW'
      : 'zh-CN';
  }

  return LOCALE_CODES.find((code) => code.toLowerCase() === base) ?? DEFAULT_LOCALE;
}
