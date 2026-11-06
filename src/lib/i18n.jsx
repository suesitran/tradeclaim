import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import vi from '@/locales/vi.json';
import ar from '@/locales/ar.json';

// The app's words in other languages. English is the source: every string on a
// screen is written in English in the code, and the dictionaries map that
// English to the chosen language. A missing entry falls back to English, so a
// half-finished dictionary never breaks a screen. The documents sent to the
// builder stay in English whatever is chosen here.
export const LANGUAGES = [
  { code: 'en', name: 'English', speech: 'en-AU', dir: 'ltr' },
  { code: 'vi', name: 'Tiếng Việt', speech: 'vi-VN', dir: 'ltr' },
  { code: 'ar', name: 'العربية', speech: 'ar-SA', dir: 'rtl' },
];

const DICTIONARIES = { vi, ar };
const STORAGE_KEY = 'tradeclaim.language';

function readStoredLanguage() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return LANGUAGES.some((language) => language.code === stored) ? stored : 'en';
  } catch {
    return 'en';
  }
}

// Fills {name} style slots in a translated string.
function fill(template, values) {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => (values[key] === undefined ? match : String(values[key])));
}

const LanguageContext = createContext({ language: 'en', setLanguage: () => {}, t: (text, values) => fill(text, values) });

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(readStoredLanguage);

  useEffect(() => {
    const meta = LANGUAGES.find((item) => item.code === language) || LANGUAGES[0];
    document.documentElement.lang = language;
    document.documentElement.dir = meta.dir;
  }, [language]);

  const setLanguage = useCallback((code) => {
    setLanguageState(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // Private browsing: the choice lasts for this visit only.
    }
  }, []);

  const t = useCallback(
    (text, values) => {
      const dictionary = DICTIONARIES[language];
      const translated = dictionary && dictionary[text];
      return fill(translated || text, values);
    },
    [language],
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

// The usual way a screen gets its words: const t = useT(); then t('Send the claim').
export function useT() {
  return useContext(LanguageContext).t;
}

// The language code the phone's speech recognition should listen in.
export function speechLanguage(code) {
  const meta = LANGUAGES.find((item) => item.code === code) || LANGUAGES[0];
  return meta.speech;
}
