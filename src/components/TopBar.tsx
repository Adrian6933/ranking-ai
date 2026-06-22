import { useState, useEffect } from 'react';
import { useFavorites } from './FavoritesProvider';
import { useT } from '../lib/i18n';

export default function TopBar() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [breadcrumb, setBreadcrumb] = useState('');
  const { favorites } = useFavorites();
  const { t } = useT();

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) setBreadcrumb('');
    else if (parts[0] === 'modelo' && parts[1]) setBreadcrumb(`${t('Modelo', 'Model')} · ${parts[1].replace(/-/g, ' ')}`);
    else if (parts[0] === 'proveedor' && parts[1]) setBreadcrumb(`${t('Proveedor', 'Provider')} · ${parts[1]}`);
    else setBreadcrumb(parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' · '));
  }, []);

  const openPalette = () => {
    window.dispatchEvent(new CustomEvent('command-palette', { detail: { open: true } }));
  };

  const toggleAside = () => {
    const isMobile = window.innerWidth <= 768;
    window.dispatchEvent(new CustomEvent('aside-control', { detail: { type: isMobile ? 'toggle-mobile-aside' : 'toggle-aside' } }));
  };

  return (
    <div class="sticky top-0 z-30 bg-dark-card/90 backdrop-blur-md border-b border-dark-border">
      <div class="flex items-center justify-between h-12 px-4">
        <div class="flex items-center gap-3">
          <button onClick={toggleAside} class="text-gray-text hover:text-fg p-1.5 rounded hover:bg-fg/5 transition-colors" aria-label="Menú">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {breadcrumb && (
            <span class="text-xs font-mono text-gray-text truncate hidden sm:inline">
              <span class="text-gray-text/40">// </span>{breadcrumb}
            </span>
          )}
        </div>

        <div class="flex items-center gap-3">
          <button
            onClick={openPalette}
            class="flex items-center gap-2 px-3 py-1.5 rounded border border-dark-border bg-dark text-xs font-mono text-gray-text hover:text-fg hover:border-gold/40 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" />
            </svg>
            <span class="hidden sm:inline">{t('Buscar', 'Search')}</span>
            <kbd class="hidden sm:inline px-1.5 py-0.5 rounded border border-dark-border bg-dark-card text-[10px] text-gray-text/60">⌘K</kbd>
          </button>

          <a
            href="/favoritos"
            class="flex items-center gap-1.5 text-xs font-mono text-gray-text hover:text-gold transition-colors"
            title={t('Favoritos', 'Favorites')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={favorites.length > 0 ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" class={favorites.length > 0 ? 'text-gold' : ''}>
              <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
            </svg>
            {favorites.length > 0 && <span class="text-gold">{favorites.length}</span>}
          </a>
        </div>
      </div>
      <div class="h-0.5 bg-dark-border">
        <div class="h-full bg-gold transition-[width] duration-75" style={{ width: `${scrollProgress}%` }} />
      </div>
    </div>
  );
}
