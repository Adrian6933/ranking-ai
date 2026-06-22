import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'rankingia_theme';
const THEME_EVENT = 'rankingia-theme-changed';

function getCurrentTheme(): 'dark' | 'light' {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

export function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>(getCurrentTheme);

  useEffect(() => {
    const onChange = () => setTheme(getCurrentTheme());
    window.addEventListener(THEME_EVENT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(THEME_EVENT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const toggle = useCallback(() => {
    const next = getCurrentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new CustomEvent(THEME_EVENT));
    setTheme(next);
  }, []);

  return { theme, toggle };
}
