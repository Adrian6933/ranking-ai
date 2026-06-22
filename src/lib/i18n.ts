import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'rankingia_lang';
const LANG_EVENT = 'rankingia-lang-changed';

export type Lang = 'es' | 'en';

export function getLang(): Lang {
  if (typeof localStorage === 'undefined') return 'es';
  return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'es';
}

export function useLanguage() {
  const [lang, setLang] = useState<Lang>(getLang);

  useEffect(() => {
    const onChange = () => setLang(getLang());
    window.addEventListener(LANG_EVENT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(LANG_EVENT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const toggle = useCallback(() => {
    const next: Lang = getLang() === 'es' ? 'en' : 'es';
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.setAttribute('data-lang', next);
    window.dispatchEvent(new CustomEvent(LANG_EVENT));
    setLang(next);
  }, []);

  const set = useCallback((l: Lang) => {
    localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.setAttribute('data-lang', l);
    window.dispatchEvent(new CustomEvent(LANG_EVENT));
    setLang(l);
  }, []);

  return { lang, toggle, set };
}

export function useT() {
  const { lang } = useLanguage();
  const t = useCallback((es: string, en: string) => (lang === 'en' ? en : es), [lang]);
  return { t, lang };
}
