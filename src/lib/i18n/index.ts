/**
 * i18n entry point. `getDictionary(locale)` returns the strings for a locale,
 * falling back to English for locales not yet translated (ms/id/th/vi) so the
 * app never shows blank strings while a translation is pending.
 */
import type { Locale } from '@/types/platform';
import { en, type Dictionary } from './dictionaries/en';
import { zh } from './dictionaries/zh';
import { DEFAULT_LOCALE, resolveLocale } from './config';

const DICTIONARIES: Partial<Record<Locale, Dictionary>> = { en, zh };

export function getDictionary(locale?: string | null): Dictionary {
  const l = resolveLocale(locale);
  return DICTIONARIES[l] ?? DICTIONARIES[DEFAULT_LOCALE] ?? en;
}

export type { Dictionary };
export { DEFAULT_LOCALE, resolveLocale };
export * from './config';
