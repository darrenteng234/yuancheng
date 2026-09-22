/**
 * Locale configuration. The real multilingual architecture: ONE page tree under
 * app/[locale], content pulled from dictionaries keyed by locale — never a
 * duplicated page folder per language.
 *
 * V1 production launch: en + zh. ms/id/th/vi are wired as data and ship by
 * adding a dictionary file, with zero new pages.
 */
import type { Locale } from '@/types/platform';

export const LOCALES: Locale[] = ['en', 'zh']; // production-active
export const FUTURE_LOCALES: Locale[] = ['ms', 'id', 'th', 'vi']; // architecture-ready
export const ALL_LOCALES: Locale[] = [...LOCALES, ...FUTURE_LOCALES];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  ms: 'Bahasa Melayu',
  id: 'Bahasa Indonesia',
  th: 'ภาษาไทย',
  vi: 'Tiếng Việt',
};

/** HTML lang attribute per locale. */
export const LOCALE_HTML_LANG: Record<Locale, string> = {
  en: 'en', zh: 'zh-CN', ms: 'ms', id: 'id', th: 'th', vi: 'vi',
};

export function isLocale(x: string): x is Locale {
  return (ALL_LOCALES as string[]).includes(x);
}

export function resolveLocale(x?: string | null): Locale {
  return x && isLocale(x) ? x : DEFAULT_LOCALE;
}
