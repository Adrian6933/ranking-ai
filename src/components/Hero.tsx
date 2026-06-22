import { useT } from '../lib/i18n';

export default function Hero() {
  const { t } = useT();
  return (
    <div class="py-16">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/20 bg-gold/5 text-gold text-xs font-mono mb-6">
        <span class="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
        {t('DATOS EN VIVO — JUNIO 2026', 'LIVE DATA — JUNE 2026')}
      </div>
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold font-mono tracking-tight">
        <span class="text-fg">{t('Ranking de Modelos', 'AI Model Ranking')}</span>{' '}
        <span class="text-gold">{t('de IA', '')}</span>
      </h1>
      <p class="mt-4 text-gray-text text-lg max-w-2xl font-light">
        {t('Comparativa completa de 40+ modelos de IA: pruebas, precios, velocidad y más. Datos recopilados de múltiples fuentes independientes.', 'Complete comparison of 40+ AI models: benchmarks, pricing, speed and more. Data collected from multiple independent sources.')}
      </p>

      <div class="mt-8 flex flex-wrap gap-3">
        <a href="/ranking" class="px-5 py-2.5 rounded border border-gold/40 bg-gold/10 text-gold text-sm font-mono font-bold hover:bg-gold/20 transition-colors">
          $ {t('Ver ranking completo', 'View full ranking')}
        </a>
        <a href="/graficas" class="px-5 py-2.5 rounded border border-dark-border bg-dark-card text-fg text-sm font-mono hover:border-gold/40 transition-colors">
          // {t('Ver gráficas', 'View charts')}
        </a>
        <a href="/comparar" class="px-5 py-2.5 rounded border border-dark-border bg-dark-card text-fg text-sm font-mono hover:border-gold/40 transition-colors">
          $ {t('Comparar modelos', 'Compare models')}
        </a>
        <a href="/metodologia" class="px-5 py-2.5 rounded border border-dark-border bg-dark-card text-gray-text text-sm font-mono hover:border-gold/40 transition-colors">
          // {t('Metodología', 'Methodology')}
        </a>
      </div>

      <div class="mt-12 flex flex-wrap justify-start gap-8 text-center">
        <div>
          <div class="text-3xl font-bold font-mono text-gold">40+</div>
          <div class="text-xs text-gray-text font-mono mt-1">{t('MODELOS', 'MODELS')}</div>
        </div>
        <div class="w-px bg-dark-border" />
        <div>
          <div class="text-3xl font-bold font-mono text-gold">15</div>
          <div class="text-xs text-gray-text font-mono mt-1">{t('PROVEEDORES', 'PROVIDERS')}</div>
        </div>
        <div class="w-px bg-dark-border" />
        <div>
          <div class="text-3xl font-bold font-mono text-gold">6</div>
          <div class="text-xs text-gray-text font-mono mt-1">{t('PRUEBAS', 'BENCHMARKS')}</div>
        </div>
        <div class="w-px bg-dark-border" />
        <div>
          <div class="text-3xl font-bold font-mono text-gold">8</div>
          <div class="text-xs text-gray-text font-mono mt-1">{t('FUENTES', 'SOURCES')}</div>
        </div>
      </div>
    </div>
  );
}
