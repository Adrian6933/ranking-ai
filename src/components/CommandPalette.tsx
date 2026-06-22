import { useState, useEffect, useRef, useMemo } from 'react';
import modelsData from '../data/models.json';
import { useT } from '../lib/i18n';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t, lang } = useT();

  const PAGES = [
    { path: '/', label: t('Inicio', 'Home'), desc: t('Página principal', 'Main page') },
    { path: '/ranking', label: t('Ranking', 'Ranking'), desc: t('Tabla completa de modelos', 'Full model table') },
    { path: '/graficas', label: t('Gráficas', 'Charts'), desc: t('Todas las visualizaciones', 'All visualizations') },
    { path: '/comparar', label: t('Comparar', 'Compare'), desc: t('Comparar modelos lado a lado', 'Compare models side by side') },
    { path: '/calculadoras', label: t('Calculadoras', 'Calculators'), desc: t('Coste, contexto, velocidad', 'Cost, context, speed') },
    { path: '/metodologia', label: t('Metodología', 'Methodology'), desc: t('Cómo se calcula el ranking', 'How the ranking is calculated') },
    { path: '/glosario', label: t('Glosario', 'Glossary'), desc: t('Benchmarks explicados', 'Benchmarks explained') },
    { path: '/acerca-de', label: t('Acerca de', 'About'), desc: t('Sobre el proyecto', 'About the project') },
  ];

  const ACTIONS = [
    { label: t('Cambiar tema', 'Toggle theme'), desc: t('Claro / oscuro', 'Light / dark'), action: 'toggle-theme' },
  ];

  const TYPE_LABELS: Record<string, string> = {
    'Página': t('Página', 'Page'),
    'Modelo': t('Modelo', 'Model'),
    'Proveedor': t('Proveedor', 'Provider'),
    'Acción': t('Acción', 'Action'),
  };

  interface Result {
    type: 'Página' | 'Modelo' | 'Proveedor' | 'Acción';
    label: string;
    desc: string;
    href?: string;
    action?: string;
  }

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.open) {
        setOpen(true);
        setQuery('');
        setSelected(0);
      }
    };
    window.addEventListener('command-palette', handler);
    return () => window.removeEventListener('command-palette', handler);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
        setQuery('');
        setSelected(0);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      return [
        ...PAGES.map(p => ({ type: 'Página' as const, label: p.label, desc: p.desc, href: p.path })),
        ...ACTIONS.map(a => ({ type: 'Acción' as const, label: a.label, desc: a.desc, action: a.action })),
      ].slice(0, 10);
    }

    const pageResults: Result[] = PAGES
      .filter(p => p.label.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q))
      .map(p => ({ type: 'Página', label: p.label, desc: p.desc, href: p.path }));

    const modelResults: Result[] = (modelsData as any[])
      .filter((m: any) => m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q))
      .slice(0, 8)
      .map((m: any) => ({ type: 'Modelo', label: m.name, desc: `${m.provider} · ${t('Nivel', 'Tier')} ${m.tier}`, href: `/modelo/${m.id}` }));

    const providers = [...new Set((modelsData as any[]).map((m: any) => m.provider))];
    const providerResults: Result[] = providers
      .filter(p => p.toLowerCase().includes(q))
      .slice(0, 5)
      .map(p => ({ type: 'Proveedor', label: p, desc: t('Proveedor', 'Provider'), href: `/proveedor/${p}` }));

    const actionResults: Result[] = ACTIONS
      .filter(a => a.label.toLowerCase().includes(q))
      .map(a => ({ type: 'Acción', label: a.label, desc: a.desc, action: a.action }));

    return [...pageResults, ...modelResults, ...providerResults, ...actionResults];
  }, [query, lang]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  const onNavigate = (r: Result) => {
    if (r.action === 'toggle-theme') {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      html.setAttribute('data-theme', next);
      localStorage.setItem('rankingia_theme', next);
      setOpen(false);
      return;
    }
    if (r.href) {
      window.location.href = r.href;
    }
    setOpen(false);
  };

  if (!open) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected(s => Math.min(s + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected(s => Math.max(s - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selected]) onNavigate(results[selected]);
    }
  };

  return (
    <div class="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4" onClick={() => setOpen(false)}>
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        class="relative w-full max-w-lg bg-dark-card border border-dark-border rounded-lg shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div class="flex items-center gap-3 px-4 py-3 border-b border-dark-border">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-text shrink-0">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.currentTarget.value)}
            onKeyDown={onKeyDown}
            placeholder={t('Buscar modelos, páginas, proveedores...', 'Search models, pages, providers...')}
            class="flex-1 bg-transparent text-fg text-sm font-mono outline-none placeholder-gray-text/50"
          />
          <kbd class="px-1.5 py-0.5 rounded border border-dark-border bg-dark text-[10px] font-mono text-gray-text/60">ESC</kbd>
        </div>

        <div class="max-h-[50vh] overflow-y-auto py-2">
          {results.length === 0 && (
            <div class="px-4 py-8 text-center text-sm font-mono text-gray-text">
              {t('Sin resultados para', 'No results for')} "{query}"
            </div>
          )}
          {results.map((r, i) => (
            <button
              key={i}
              onMouseEnter={() => setSelected(i)}
              onClick={() => onNavigate(r)}
              class={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors
                ${i === selected ? 'bg-gold/10' : 'hover:bg-fg/5'}
              `}
            >
              <div class="flex items-center gap-3 min-w-0">
                <span class="text-[10px] font-mono text-gray-text/50 uppercase tracking-wider w-20 shrink-0">{TYPE_LABELS[r.type]}</span>
                <div class="min-w-0">
                  <div class={`text-sm font-mono truncate ${i === selected ? 'text-gold' : 'text-fg'}`}>{r.label}</div>
                  <div class="text-xs font-mono text-gray-text truncate">{r.desc}</div>
                </div>
              </div>
              {i === selected && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gold shrink-0">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              )}
            </button>
          ))}
        </div>

        <div class="border-t border-dark-border px-4 py-2 flex items-center justify-between text-[10px] font-mono text-gray-text/50">
          <div class="flex items-center gap-3">
            <span>↑↓ {t('navegar', 'navigate')}</span>
            <span>↵ {t('abrir', 'open')}</span>
          </div>
          <span>⌘K {t('abrir/cerrar', 'open/close')}</span>
        </div>
      </div>
    </div>
  );
}
