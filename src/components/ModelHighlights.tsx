import { useMemo } from 'react';
import ModelCard from './ModelCard';
import ProviderIcon from './ProviderIcon';
import { getCompositeScore } from '../lib/ranking';
import { useT } from '../lib/i18n';

export default function ModelHighlights({ data }: { data: any[] }) {
  const { t } = useT();
  const highlights = useMemo(() => {
    const withScore = data.map(m => ({ ...m, compositeScore: getCompositeScore(m) }));
    const sorted = [...withScore].sort((a, b) => b.compositeScore - a.compositeScore);

    const top3 = sorted.slice(0, 3);

    const withRatio = withScore
      .filter(m => m.sweBench != null && m.inputPrice != null)
      .map(m => ({ ...m, ratio: m.sweBench / Math.max(m.inputPrice, 0.01) }));
    const bestValue = withRatio.length > 0
      ? withRatio.reduce((a, b) => a.ratio > b.ratio ? a : b)
      : null;

    const newest = [...withScore]
      .filter(m => m.releaseDate)
      .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate))[0];

    const cheapest = [...withScore]
      .filter(m => m.inputPrice != null)
      .sort((a, b) => a.inputPrice - b.inputPrice)[0];

    return { top3, bestValue, newest, cheapest, total: data.length };
  }, [data]);

  const { top3, bestValue, newest, cheapest, total } = highlights;

  return (
    <div class="space-y-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="rounded-lg border border-gold/20 bg-gold/5 p-4">
          <div class="text-[10px] font-mono text-gold/70 uppercase tracking-wider mb-3">// {t('Top 1', 'Top 1')}</div>
          {top3[0] && (
            <a href={`/modelo/${top3[0].id}`} class="flex items-center gap-3 group">
              <ProviderIcon provider={top3[0].provider} size={40} />
              <div class="flex-1 min-w-0">
                <div class="text-fg font-mono font-bold text-sm group-hover:text-gold transition-colors truncate">{top3[0].name}</div>
                <div class="text-xs text-gray-text font-mono">{top3[0].provider}</div>
              </div>
              <div class="text-right">
                <div class="text-gold font-mono font-bold text-lg">{top3[0].compositeScore}</div>
                <div class="text-[10px] text-gray-text font-mono">{t('SCORE', 'SCORE')}</div>
              </div>
            </a>
          )}
        </div>

        <div class="rounded-lg border border-dark-border bg-dark-card/50 p-4">
          <div class="text-[10px] font-mono text-gray-text/60 uppercase tracking-wider mb-3">// {t('Mejor relación', 'Best value')}</div>
          {bestValue && (
            <a href={`/modelo/${bestValue.id}`} class="flex items-center gap-3 group">
              <ProviderIcon provider={bestValue.provider} size={40} />
              <div class="flex-1 min-w-0">
                <div class="text-fg font-mono font-bold text-sm group-hover:text-gold transition-colors truncate">{bestValue.name}</div>
                <div class="text-xs text-gray-text font-mono">{bestValue.sweBench}% / ${bestValue.inputPrice}</div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-accent shrink-0">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </a>
          )}
        </div>

        <div class="rounded-lg border border-dark-border bg-dark-card/50 p-4">
          <div class="text-[10px] font-mono text-gray-text/60 uppercase tracking-wider mb-3">// {t('Más reciente', 'Newest')}</div>
          {newest && (
            <a href={`/modelo/${newest.id}`} class="flex items-center gap-3 group">
              <ProviderIcon provider={newest.provider} size={40} />
              <div class="flex-1 min-w-0">
                <div class="text-fg font-mono font-bold text-sm group-hover:text-gold transition-colors truncate">{newest.name}</div>
                <div class="text-xs text-gray-text font-mono">{newest.releaseDate}</div>
              </div>
              <span class="text-[10px] font-mono font-bold px-2 py-1 rounded bg-green-accent/20 text-green-accent shrink-0">NEW</span>
            </a>
          )}
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-fg font-mono text-sm font-bold tracking-wider">
            <span class="text-gold">// </span>TOP 10
          </h3>
          <a href="/ranking" class="text-xs font-mono text-gray-text hover:text-gold transition-colors">
            {t('Ver ranking completo →', 'View full ranking →')}
          </a>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {top3.map((m, i) => (
            <div key={m.id} class="relative">
              <span class="absolute -top-2 -left-2 z-10 w-6 h-6 rounded-full bg-gold text-dark flex items-center justify-center text-xs font-mono font-bold">
                {i + 1}
              </span>
              <ModelCard model={m} compact />
            </div>
          ))}
          {highlights.top3.length < 10 && [...data]
            .map(m => ({ ...m, compositeScore: getCompositeScore(m) }))
            .sort((a, b) => b.compositeScore - a.compositeScore)
            .slice(3, 10)
            .map(m => (
              <ModelCard key={m.id} model={m} compact />
            ))}
        </div>
      </div>
    </div>
  );
}
