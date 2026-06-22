import { useMemo } from 'react';
import ProviderIcon from './ProviderIcon';
import ModelCard from './ModelCard';
import { getCompositeScore } from '../lib/ranking';
import { useT } from '../lib/i18n';

export default function ProviderProfile({ provider, models, allModels }: { provider: string; models: any[]; allModels: any[] }) {
  const { t } = useT();
  const stats = useMemo(() => {
    const withScore = models.map(m => ({ ...m, compositeScore: getCompositeScore(m) }));
    const avgScore = withScore.reduce((a, b) => a + b.compositeScore, 0) / withScore.length;
    const best = withScore.reduce((a, b) => a.compositeScore > b.compositeScore ? a : b);
    const cheapest = [...withScore].sort((a, b) => a.inputPrice - b.inputPrice)[0];
    const fastest = [...withScore].filter(m => m.speed).sort((a, b) => b.speed - a.speed)[0];
    return { avgScore, best, cheapest, fastest, count: withScore.length };
  }, [models]);

  return (
    <div class="space-y-6">
      <div class="flex items-center gap-2 text-xs font-mono text-gray-text">
        <a href="/" class="hover:text-gold transition-colors">{t('Inicio', 'Home')}</a>
        <span>/</span>
        <span class="text-fg">{provider}</span>
      </div>

      <div class="rounded-lg border border-dark-border bg-dark-card/50 p-6">
        <div class="flex items-center gap-4">
          <ProviderIcon provider={provider} size={56} />
          <div>
            <h1 class="text-2xl font-bold font-mono text-fg">{provider}</h1>
            <div class="mt-1 text-sm text-gray-text font-mono">{stats.count} {t('modelos', 'models')} · {t('Score medio:', 'Average score:')} {stats.avgScore.toFixed(1)}</div>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="rounded border border-dark-border bg-dark/30 p-3">
            <div class="text-[10px] font-mono text-gray-text/60 uppercase">{t('Modelos', 'Models')}</div>
            <div class="text-xl font-bold font-mono text-fg">{stats.count}</div>
          </div>
          <div class="rounded border border-gold/20 bg-gold/5 p-3">
            <div class="text-[10px] font-mono text-gold/70 uppercase">{t('Mejor score', 'Best score')}</div>
            <div class="text-xl font-bold font-mono text-gold">{stats.best.compositeScore.toFixed(1)}</div>
          </div>
          <div class="rounded border border-dark-border bg-dark/30 p-3">
            <div class="text-[10px] font-mono text-gray-text/60 uppercase">{t('Más barato', 'Cheapest')}</div>
            <div class="text-xl font-bold font-mono text-fg">{stats.cheapest.inputPrice === 0 ? t('Gratis', 'Free') : `$${stats.cheapest.inputPrice}`}</div>
          </div>
          <div class="rounded border border-dark-border bg-dark/30 p-3">
            <div class="text-[10px] font-mono text-gray-text/60 uppercase">{t('Más rápido', 'Fastest')}</div>
            <div class="text-xl font-bold font-mono text-fg">{stats.fastest?.speed || '-'}<span class="text-sm text-gray-text"> {t('t/s', 't/s')}</span></div>
          </div>
        </div>
      </div>

      <div>
        <h3 class="text-gold text-sm font-mono font-bold uppercase tracking-wider mb-4">// {t('Modelos', 'Models')} {t('de', 'from')} {provider}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map(m => <ModelCard key={m.id} model={m} />)}
        </div>
      </div>

      <div>
        <h3 class="text-gold text-sm font-mono font-bold uppercase tracking-wider mb-4">// {t('Mejor modelo', 'Best model')}</h3>
        <ModelCard model={stats.best} />
      </div>
    </div>
  );
}
