import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { LOCALES, resolveLocale, DEFAULT_LOCALE } from '@/i18n/locales';
import styles from './LanguagePicker.module.css';

/**
 * A native `<select>` on purpose. Even at ~28 locales a custom listbox earns
 * its complexity poorly, and the native control gets keyboard support,
 * screen-reader semantics, and the platform's own (scrollable) mobile picker
 * for free — which matters more as the list grows.
 */
export function LanguagePicker({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const id = useId();
  const current = resolveLocale(i18n.resolvedLanguage ?? i18n.language);

  function change(next: string) {
    void i18n.changeLanguage(next);

    // Mirror the choice into `?lang=` so the URL is shareable in that
    // language. English is the default, so it gets a clean URL instead.
    const params = new URLSearchParams(searchParams);
    if (next === DEFAULT_LOCALE) {
      params.delete('lang');
    } else {
      params.set('lang', next);
    }
    setSearchParams(params, { replace: true });
  }

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <label className={styles.label} htmlFor={id}>
        {t('common.language')}
      </label>
      <select
        id={id}
        className={styles.select}
        value={current}
        onChange={(event) => change(event.target.value)}
      >
        {LOCALES.map((locale) => (
          <option key={locale.code} value={locale.code} lang={locale.htmlLang}>
            {locale.label}
          </option>
        ))}
      </select>
    </div>
  );
}
