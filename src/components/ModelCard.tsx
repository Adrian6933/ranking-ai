import ProviderIcon from './ProviderIcon';
import { getCompositeScore } from '../lib/ranking';
import { useT } from '../lib/i18n';

const TIER_COLORS: Record<string, string> = {
  S: '#F5C518', A: '#00C853', B: '#2979FF',
  C: '#888888', D: '#666666', F: '#8B1A1A',
};

export default function ModelCard({ model, compact = false }: { model: any; compact?: boolean }) {
  const { t } = useT();
  const score = getCompositeScore(model);
  const tierColor = TIER_COLORS[model.tier] || '#888';

  return (
    <a
      href={`/modelo/${model.id}`}
      class="block rounded-lg border border-dark-border bg-dark-card/50 hover:border-gold/40 transition-colors p-4 group"
    >
      <div class="flex items-start gap-3">
        <ProviderIcon provider={model.provider} size={compact ? 28 : 36} />
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-fg font-mono font-bold text-sm truncate group-hover:text-gold transition-colors">
              {model.name}
            </span>
            <span
              class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0"
              style={{ backgroundColor: tierColor, color: model.tier === 'S' || model.tier === 'A' || model.tier === 'B' ? '#0A0A0A' : '#fff' }}
            >
              {model.tier}
            </span>
          </div>
          <div class="text-xs text-gray-text font-mono mt-0.5">{model.provider}</div>
        </div>
      </div>

      {!compact && (
        <div class="mt-3 grid grid-cols-3 gap-2 text-xs font-mono">
          <div>
            <div class="text-gray-text/60 text-[10px]">{t('SCORE', 'SCORE')}</div>
            <div class="text-gold font-bold">{score}</div>
          </div>
          <div>
            <div class="text-gray-text/60 text-[10px]">{t('SWE', 'SWE')}</div>
            <div class="text-fg">{model.sweBench ? `${model.sweBench}%` : '-'}</div>
          </div>
          <div>
            <div class="text-gray-text/60 text-[10px]">{t('$/1M', '$/1M')}</div>
            <div class="text-fg">{model.inputPrice === 0 ? t('Gratis', 'Free') : `$${model.inputPrice.toFixed(1)}`}</div>
          </div>
        </div>
      )}
    </a>
  );
}
