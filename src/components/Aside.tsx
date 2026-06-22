import { useState, useEffect } from 'react';
import { useFavorites } from './FavoritesProvider';
import { useTheme } from './ThemeProvider';
import { useT } from '../lib/i18n';

const NAV_ITEMS = [
  { href: '/', labelEs: 'Inicio', labelEn: 'Home', icon: 'M3 12l9-9 9 9M5 10v10h14V10' },
  { href: '/ranking', labelEs: 'Ranking', labelEn: 'Ranking', icon: 'M4 6h16M4 12h16M4 18h16' },
  { href: '/graficas', labelEs: 'Gráficas', labelEn: 'Charts', icon: 'M4 19V5m0 14h16M8 15l3-4 3 2 4-5' },
  { href: '/comparar', labelEs: 'Comparar', labelEn: 'Compare', icon: 'M9 5v14m6-14v14M3 9h6m6 6h6' },
  { href: '/calculadoras', labelEs: 'Calculadoras', labelEn: 'Calculators', icon: 'M4 8h16M4 8V6a2 2 0 012-2h12a2 2 0 012 2v2M4 8v10a2 2 0 002 2h12a2 2 0 002-2V8M8 13h8' },
  { href: '/metodologia', labelEs: 'Metodología', labelEn: 'Methodology', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  { href: '/glosario', labelEs: 'Glosario', labelEn: 'Glossary', icon: 'M4 6h16M4 12h16M4 18h10' },
  { href: '/acerca-de', labelEs: 'Acerca de', labelEn: 'About', icon: 'M12 11c0-1.5 1-2.5 2.5-2.5S17 9.5 17 11c0 1-1 1.5-1.5 2S15 14 15 15M12 18h.01' },
];

export default function Aside() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const { favorites, recent } = useFavorites();
  const { theme, toggle } = useTheme();
  const { t, lang, set } = useT();

  const toggleLang = () => {
    set(lang === 'es' ? 'en' : 'es');
  };

  useEffect(() => {
    setCurrentPath(window.location.pathname);
    const stored = localStorage.getItem('rankingia_aside_collapsed');
    if (stored === 'true') setCollapsed(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('rankingia_aside_collapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.type === 'toggle-aside') {
        setCollapsed(c => !c);
      } else if (detail?.type === 'toggle-mobile-aside') {
        setMobileOpen(o => !o);
      } else if (detail?.type === 'close-mobile-aside') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('aside-control', handler);
    return () => window.removeEventListener('aside-control', handler);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  };

  const asideWidth = collapsed ? 60 : 256;
  const dot = 40;
  const r = 8;
  const innerR = 14;

  return (
    <>
      {mobileOpen && (
        <div class="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        class={`fixed top-0 left-0 bottom-0 z-40 bg-dark-card border-r border-dark-border transition-all duration-200 flex flex-col
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{ width: `${asideWidth}px` }}
      >
        <div class="h-14 flex items-center border-b border-dark-border px-3 shrink-0">
          <a href="/" class="flex items-center gap-2 overflow-hidden">
            <div class="w-7 h-7 rounded bg-gold flex items-center justify-center shrink-0">
              <span class="text-dark text-xs font-mono font-bold">//</span>
            </div>
            {!collapsed && (
              <span class="text-fg font-mono font-bold text-sm tracking-wider whitespace-nowrap">RANKING_IA</span>
            )}
          </a>
        </div>

        <nav class="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {NAV_ITEMS.map(({ href, labelEs, labelEn, icon }) => (
            <a
              key={href}
              href={href}
              class={`flex items-center gap-3 px-3 py-2 rounded text-sm font-mono transition-colors group
                ${isActive(href) ? 'text-gold bg-gold/10' : 'text-gray-text hover:text-fg hover:bg-fg/5'}
              `}
              title={collapsed ? t(labelEs, labelEn) : undefined}
              onClick={() => setMobileOpen(false)}
            >
              <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d={icon} />
              </svg>
              {!collapsed && <span class="whitespace-nowrap">{t(labelEs, labelEn)}</span>}
            </a>
          ))}

          {!collapsed && favorites.length > 0 && (
            <>
              <div class="pt-4 pb-2 px-3 text-[10px] text-gray-text/50 font-mono uppercase tracking-wider">
                ★ {t('Favoritos', 'Favorites')} ({favorites.length})
              </div>
              <a href="/favoritos" class="flex items-center gap-3 px-3 py-2 rounded text-sm font-mono text-gray-text hover:text-fg hover:bg-fg/5 transition-colors">
                <svg class="w-4 h-4 shrink-0 text-gold" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/></svg>
                <span>{t('Ver favoritos', 'View favorites')}</span>
              </a>
            </>
          )}

          {!collapsed && recent.length > 0 && (
            <>
              <div class="pt-4 pb-2 px-3 text-[10px] text-gray-text/50 font-mono uppercase tracking-wider">
                ⟳ {t('Vistos recientemente', 'Recently viewed')}
              </div>
              {recent.slice(0, 5).map((id) => (
                <a
                  key={id}
                  href={`/modelo/${id}`}
                  class="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono text-gray-text hover:text-fg hover:bg-fg/5 transition-colors truncate"
                >
                  <span class="w-1 h-1 rounded-full bg-gray-text/40 shrink-0" />
                  <span class="truncate">{id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                </a>
              ))}
            </>
          )}
        </nav>

        <div class="border-t border-dark-border p-2 space-y-0.5 shrink-0">
          <button
            onClick={toggleLang}
            class="w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-mono text-gray-text hover:text-fg hover:bg-fg/5 transition-colors"
            title={collapsed ? (lang === 'es' ? 'English' : 'Español') : undefined}
          >
            <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />
            </svg>
            {!collapsed && <span>{lang === 'es' ? 'EN · English' : 'ES · Español'}</span>}
          </button>

          <button
            onClick={toggle}
            class="w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-mono text-gray-text hover:text-fg hover:bg-fg/5 transition-colors"
            title={collapsed ? t('Modo claro', 'Light mode') : undefined}
          >
            <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              {theme === 'dark' ? (
                <><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></>
              ) : (
                <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
              )}
            </svg>
            {!collapsed && <span>{theme === 'dark' ? t('Modo claro', 'Light mode') : t('Modo oscuro', 'Dark mode')}</span>}
          </button>

          <button
            onClick={() => setCollapsed(c => !c)}
            class="w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-mono text-gray-text hover:text-fg hover:bg-fg/5 transition-colors"
            title={collapsed ? t('Expandir', 'Expand') : t('Colapsar', 'Collapse')}
          >
            <svg class={`w-4 h-4 shrink-0 transition-transform ${collapsed ? '' : 'rotate-180'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {!collapsed && <span>{t('Colapsar', 'Collapse')}</span>}
          </button>

          {!collapsed && (
            <div class="px-3 pt-2 text-[10px] text-gray-text/40 font-mono">
              v2.0 · {t('jun 2026', 'Jun 2026')}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
