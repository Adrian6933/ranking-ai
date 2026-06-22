import { useState, useMemo } from 'react';
import ProviderIcon from './ProviderIcon';
import modelsData from '../data/models.json';
import { useT } from '../lib/i18n';

const DEFAULT_WEIGHTS_RAW = [
  { key: 'programming', label: 'Programación real', labelEn: 'Real coding', weight: 35 },
  { key: 'reasoning', label: 'Razonamiento', labelEn: 'Reasoning', weight: 20 },
  { key: 'agent', label: 'Trabajo como agente', labelEn: 'Agent ability', weight: 15 },
  { key: 'speed', label: 'Velocidad', labelEn: 'Speed', weight: 10 },
  { key: 'cost', label: 'Coste/eficiencia', labelEn: 'Cost/efficiency', weight: 10 },
  { key: 'context', label: 'Contexto', labelEn: 'Context', weight: 5 },
  { key: 'confidence', label: 'Confianza del dato', labelEn: 'Data confidence', weight: 5 },
];

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));
const normalizeCost = (inputPrice = 0, outputPrice = 0) => {
  const total = inputPrice + outputPrice;
  if (total <= 0) return 100;
  return clamp(100 - Math.log10(total + 1) * 38);
};
const normalizeSpeed = (speed = 0) => clamp((speed / 350) * 100);
const normalizeContext = (contextWindow = 0) => clamp((Math.log10(contextWindow || 1) / Math.log10(2_000_000)) * 100);

function calcScore(model: any, w: number[]) {
  const programming = clamp(((model.sweBench ?? 0) * 0.75) + ((model.sciCode ?? 0) * 0.25));
  const reasoning = clamp(((model.gpqa ?? 0) * 0.8) + ((model.qualityIndex ?? 0) * 0.2));
  const agent = clamp(model.terminalBench ?? model.sweBench ?? 0);
  const speed = normalizeSpeed(model.speed);
  const cost = normalizeCost(model.inputPrice, model.outputPrice);
  const context = normalizeContext(model.contextWindow);
  const available = ['sweBench', 'terminalBench', 'sciCode', 'gpqa', 'qualityIndex'].filter(key => model[key] != null).length;
  const confidence = clamp((available / 5) * 100);

  return Number((
    programming * (w[0] / 100) +
    reasoning * (w[1] / 100) +
    agent * (w[2] / 100) +
    speed * (w[3] / 100) +
    cost * (w[4] / 100) +
    context * (w[5] / 100) +
    confidence * (w[6] / 100)
  ).toFixed(1));
}

export default function WeightCalculator() {
  const { t } = useT();
  const DEFAULT_WEIGHTS = DEFAULT_WEIGHTS_RAW.map(w => ({ key: w.key, label: t(w.label, w.labelEn), weight: w.weight }));
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS.map(w => w.weight));

  const total = weights.reduce((a, b) => a + b, 0);

  const adjust = (index: number, newVal: number) => {
    setWeights(prev => {
      const next = [...prev];
      next[index] = newVal;
      const sum = next.reduce((a, b) => a + b, 0);
      if (sum === 0) return prev;
      const scale = 100 / sum;
      return next.map((v, i) => i === index ? newVal : Math.round(v * scale * 10) / 10);
    });
  };

  const reset = () => setWeights(DEFAULT_WEIGHTS.map(w => w.weight));

  const ranked = useMemo(() => {
    return (modelsData as any[])
      .map(m => ({ ...m, score: calcScore(m, weights) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }, [weights]);

  const defaultRanked = useMemo(() => {
    return (modelsData as any[])
      .map(m => ({ ...m, defaultScore: calcScore(m, DEFAULT_WEIGHTS.map(w => w.weight)) }))
      .sort((a, b) => b.defaultScore - a.defaultScore);
  }, []);

  const getPosition = (id: string) => defaultRanked.findIndex(m => m.id === id) + 1;

  return (
    <div class="card-l-corner bg-dark/40 rounded-lg p-6 font-mono">
      <h3 class="text-gold text-sm uppercase tracking-wider mb-4">// {t('Calculadora de pesos interactiva', 'Interactive weight calculator')}</h3>
      <p class="text-gray-text text-xs mb-6 leading-relaxed">
        {t('Ajusta los pesos de cada categoría para ver cómo cambia el ranking. Los pesos siempre suman 100%. Los demás se ajustan automáticamente al mover uno.', 'Adjust the weights of each category to see how the ranking changes. The weights always sum to 100%. The others adjust automatically when you move one.')}
      </p>

      <div class="space-y-4 mb-6">
        {DEFAULT_WEIGHTS.map((w, i) => (
          <div key={w.key}>
            <div class="flex items-center justify-between mb-1">
              <span class="text-fg text-sm">{w.label}</span>
              <span class="text-gold text-sm font-bold">{weights[i].toFixed(1)}%</span>
            </div>
            <div class="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={60}
                step={1}
                value={weights[i]}
                onChange={e => adjust(i, Number(e.currentTarget.value))}
                class="flex-1 accent-gold"
              />
              <span class="text-xs text-gray-text/60 w-16 text-right">{t('def:', 'def:')} {w.weight}%</span>
            </div>
          </div>
        ))}
        <div class="flex items-center justify-between pt-2 border-t border-dark-border">
          <span class="text-gray-text text-xs">{t('Total:', 'Total:')} <span class={total === 100 ? 'text-green-accent' : 'text-red-accent'}>{total.toFixed(1)}%</span></span>
          <button onClick={reset} class="px-3 py-1.5 rounded border border-dark-border bg-dark-card text-xs text-gray-text hover:border-gold/50 transition-colors">
            $ {t('Restaurar pesos por defecto', 'Reset default weights')}
          </button>
        </div>
      </div>

      <div class="text-xs text-gray-text mb-3">// {t('Top 20 con tus pesos personalizados', 'Top 20 with your custom weights')}</div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm font-mono">
          <thead>
            <tr class="border-b border-dark-border text-xs uppercase text-gray-text">
              <th class="text-left py-2 px-2">#</th>
              <th class="text-left py-2 px-2">{t('Modelo', 'Model')}</th>
              <th class="text-right py-2 px-2">{t('Score', 'Score')}</th>
              <th class="text-right py-2 px-2">{t('Pos. default', 'Default pos.')}</th>
              <th class="text-right py-2 px-2">Δ</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((m, i) => {
              const defaultPos = getPosition(m.id);
              const diff = defaultPos - (i + 1);
              return (
                <tr class="border-b border-dark-border/30 hover:bg-fg/[0.02]">
                  <td class="py-2 px-2 text-gray-text">{i + 1}</td>
                  <td class="py-2 px-2">
                    <div class="flex items-center gap-2">
                      <ProviderIcon provider={m.provider} size={20} />
                      <a href={`/modelo/${m.id}`} class="text-fg hover:text-gold transition-colors">{m.name}</a>
                    </div>
                  </td>
                  <td class="py-2 px-2 text-right text-gold font-bold">{m.score}</td>
                  <td class="py-2 px-2 text-right text-gray-text">{defaultPos}</td>
                  <td class={`py-2 px-2 text-right ${diff > 0 ? 'text-green-accent' : diff < 0 ? 'text-red-accent' : 'text-gray-text'}`}>
                    {diff > 0 ? `↑${diff}` : diff < 0 ? `↓${Math.abs(diff)}` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
