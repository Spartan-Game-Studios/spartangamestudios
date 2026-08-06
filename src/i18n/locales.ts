/**
 * The languages the site ships in.
 *
 * `label` is deliberately the language's own endonym — a reader looking for
 * their language scans for "Deutsch", not "German".
 */
export const LOCALES = [
  { code: 'en', label: 'English', htmlLang: 'en' },
  { code: 'es', label: 'Español', htmlLang: 'es' },
  { code: 'fr', label: 'Français', htmlLang: 'fr' },
  { code: 'de', label: 'Deutsch', htmlLang: 'de' },
] as const;

export type LocaleCode = (typeof LOCALES)[number]['code'];

export const DEFAULT_LOCALE: LocaleCode = 'en';

export const LOCALE_CODES = LOCALES.map((locale) => locale.code);

export function isLocaleCode(value: string): value is LocaleCode {
  return (LOCALE_CODES as readonly string[]).includes(value);
}

/** `es-419` and `es-ES` both resolve to `es`; anything unknown to English. */
export function resolveLocale(value: string | undefined): LocaleCode {
  if (!value) return DEFAULT_LOCALE;
  const base = value.toLowerCase().split('-')[0] ?? '';
  return isLocaleCode(base) ? base : DEFAULT_LOCALE;
}
