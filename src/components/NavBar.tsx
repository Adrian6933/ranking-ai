import { useState, useEffect, useRef } from 'react';

const SECTIONS = [
  { id: 'tier-list', label: 'Niveles', key: 't' },
  { id: 'ranking', label: 'Ranking', key: 'r' },
  { id: 'cost-performance', label: 'Coste', key: 'c' },
  { id: 'speed', label: 'Velocidad', key: 'v' },
  { id: 'pricing', label: 'Precios', key: 'p' },
  { id: 'context', label: 'Contexto', key: 'x' },
  { id: 'providers', label: 'Proveedores', key: 'o' },
  { id: 'evolution', label: 'Evolución', key: 'e' },
  { id: 'metodologia', label: 'Método', key: 'm' },
];

export default function NavBar() {
  const [active, setActive] = useState('');
  const [open, setOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

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
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === '/') {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>('#full-ranking-search');
        if (input) input.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setOpen(false);
  };

  return (
    <>
      <nav class="sticky top-0 z-50 bg-dark/90 backdrop-blur-md border-b border-dark-border">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-14">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} class="flex items-center gap-2 shrink-0">
              <span class="text-gold font-mono font-bold text-sm tracking-wider">RANKING_IA</span>
              <span class="hidden sm:inline text-gray-text text-xs font-mono">// v2026.06</span>
            </button>

            <div class="hidden md:flex items-center gap-1">
              {SECTIONS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => go(id)}
                  class={`px-2.5 py-1.5 rounded text-xs font-mono transition-colors ${
                    active === id ? 'text-gold bg-gold/10' : 'text-gray-text hover:text-fg hover:bg-fg/5'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div class="hidden md:flex items-center gap-2 text-xs text-gray-text/60 font-mono">
              <kbd class="px-1.5 py-0.5 rounded border border-dark-border bg-dark-card text-[10px]">/</kbd>
              <span class="text-[10px]">buscar</span>
            </div>

            <button
              onClick={() => setOpen(o => !o)}
              class="md:hidden text-gray-text hover:text-fg p-2"
              aria-label="Menú"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>
        <div class="h-0.5 bg-dark-border">
          <div class="h-full bg-gold transition-[width] duration-75" style={{ width: `${scrollProgress}%` }} />
        </div>
      </nav>

      {open && (
        <div ref={menuRef} class="md:hidden fixed top-14 left-0 right-0 z-40 bg-dark/95 backdrop-blur-md border-b border-dark-border">
          <div class="grid grid-cols-2 gap-1 p-3">
            {SECTIONS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => go(id)}
                class={`px-3 py-2 rounded text-sm font-mono text-left transition-colors ${
                  active === id ? 'text-gold bg-gold/10' : 'text-gray-text hover:text-fg hover:bg-fg/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
