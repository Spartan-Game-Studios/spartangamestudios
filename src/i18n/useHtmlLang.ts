import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LOCALES, resolveLocale } from './locales';

/**
 * Keeps `<html lang>` in step with the active locale. Not cosmetic: screen
 * readers pick their pronunciation from it, and search engines use it to
 * decide which locale of a page to serve.
 */
export function useHtmlLang(): void {
  const { i18n } = useTranslation();
  const code = resolveLocale(i18n.resolvedLanguage ?? i18n.language);

  useEffect(() => {
    const locale = LOCALES.find((entry) => entry.code === code);
    document.documentElement.lang = locale?.htmlLang ?? code;
    // Every locale we ship is left-to-right; set it explicitly anyway so
    // adding an RTL locale is a one-line change here, not a hunt.
    document.documentElement.dir = 'ltr';
  }, [code]);
}
