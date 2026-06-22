import { useMemo, useState, useEffect } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import ProviderIcon from './ProviderIcon';
import { getCompositeScore } from '../lib/ranking';
import { useFavorites } from './FavoritesProvider';
import { useT } from '../lib/i18n';

const TIER_COLORS: Record<string, string> = {
  S: '#F5C518', A: '#00C853', B: '#2979FF',
  C: '#888888', D: '#666666', F: '#8B1A1A',
};

export default function ModelDetail({ model, allModels }: { model: any; allModels: any[] }) {
  const { t } = useT();
  const BENCHMARKS = [
    { key: 'sweBench', label: t('Prog. real', 'Real coding'), max: 100 },
    { key: 'gpqa', label: t('Razonam.', 'Reasoning'), max: 100 },
    { key: 'terminalBench', label: t('Terminal', 'Terminal'), max: 100 },
    { key: 'sciCode', label: t('SciCode', 'SciCode'), max: 100 },
    { key: 'qualityIndex', label: t('Calidad', 'Quality'), max: 65 },
    { key: 'speed', label: t('Velocidad', 'Speed'), max: 350 },
  ];
  const { isFavorite, toggleFavorite, getNote, setNote, addRecent } = useFavorites();
  const [tokensPerDay, setTokensPerDay] = useState(500000);
  const [note, setNoteState] = useState('');

  useEffect(() => {
    addRecent(model.id);
    setNoteState(getNote(model.id));
  }, [model.id]);

  const score = getCompositeScore(model);
  const tierColor = TIER_COLORS[model.tier] || '#888';

  const radarData = useMemo(() => {
    return BENCHMARKS.map(b => ({
      benchmark: b.label,
      model: model[b.key] != null ? Math.min(100, (model[b.key] / b.max) * 100) : 0,
      average: 50,
    }));
  }, [model, t]);

  const tierAverage = useMemo(() => {
    const sameTier = allModels.filter(m => m.tier === model.tier);
    if (sameTier.length === 0) return 50;
    const sums: Record<string, number> = {};
    const counts: Record<string, number> = {};
    BENCHMARKS.forEach(b => {
      sameTier.forEach(m => {
        if (m[b.key] != null) {
          sums[b.key] = (sums[b.key] || 0) + (m[b.key] / b.max) * 100;
          counts[b.key] = (counts[b.key] || 0) + 1;
        }
      });
    });
    return BENCHMARKS.map(b => ({
      benchmark: b.label,
      model: model[b.key] != null ? Math.min(100, (model[b.key] / b.max) * 100) : 0,
      average: counts[b.key] ? sums[b.key] / counts[b.key] : 0,
    }));
  }, [model, allModels, t]);

  const similar = useMemo(() => {
    return allModels
      .filter(m => m.id !== model.id)
      .map(m => ({ ...m, diff: Math.abs(getCompositeScore(m) - score) }))
      .sort((a, b) => a.diff - b.diff)
      .slice(0, 4);
  }, [model, allModels, score]);

  const monthlyCost = useMemo(() => {
    const inputTokens = tokensPerDay * 0.7;
    const outputTokens = tokensPerDay * 0.3;
    return ((inputTokens / 1_000_000) * 30 * model.inputPrice) + ((outputTokens / 1_000_000) * 30 * model.outputPrice);
  }, [tokensPerDay, model]);

  const saveNote = (v: string) => {
    setNoteState(v);
    setNote(model.id, v);
  };

  const benchmarkRows = BENCHMARKS.filter(b => model[b.key] != null);

  return (
    <div class="space-y-6">
      <div class="flex items-center gap-2 text-xs font-mono text-gray-text">
        <a href="/" class="hover:text-gold transition-colors">{t('Inicio', 'Home')}</a>
        <span>/</span>
        <a href="/ranking" class="hover:text-gold transition-colors">{t('Ranking', 'Ranking')}</a>
        <span>/</span>
        <span class="text-fg">{model.name}</span>
      </div>

      <div class="rounded-lg border border-dark-border bg-dark-card/50 p-6">
        <div class="flex items-start gap-4 flex-wrap">
          <ProviderIcon provider={model.provider} size={56} />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 flex-wrap">
              <h1 class="text-2xl font-bold font-mono text-fg">{model.name}</h1>
              <span
                class="text-xs font-mono font-bold px-2 py-1 rounded"
                style={{ backgroundColor: tierColor, color: model.tier === 'S' || model.tier === 'A' || model.tier === 'B' ? '#0A0A0A' : '#fff' }}
              >
                {t('NIVEL', 'TIER')} {model.tier}
              </span>
            </div>
            <div class="mt-1 text-sm text-gray-text font-mono">
              {model.provider} · {model.releaseDate} · {model.license}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(model.id)}
              class={`flex items-center gap-1.5 px-3 py-2 rounded border text-sm font-mono transition-colors
                ${isFavorite(model.id)
                  ? 'border-gold/40 bg-gold/10 text-gold'
                  : 'border-dark-border bg-dark-card text-gray-text hover:border-gold/40'
                }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite(model.id) ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2">
                <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
              </svg>
              {isFavorite(model.id) ? t('Favorito', 'Favorite') : t('Añadir', 'Add')}
            </button>
            <a
              href={`/comparar?models=${model.id}`}
              class="px-3 py-2 rounded border border-dark-border bg-dark-card text-sm font-mono text-gray-text hover:border-gold/40 transition-colors"
            >
              ⚖️ {t('Comparar', 'Compare')}
            </a>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="rounded border border-gold/20 bg-gold/5 p-3">
            <div class="text-[10px] font-mono text-gold/70 uppercase">{t('Score', 'Score')}</div>
            <div class="text-2xl font-bold font-mono text-gold">{score}</div>
          </div>
          <div class="rounded border border-dark-border bg-dark/30 p-3">
            <div class="text-[10px] font-mono text-gray-text/60 uppercase">{t('SWE-bench', 'SWE-bench')}</div>
            <div class="text-2xl font-bold font-mono text-fg">{model.sweBench ? `${model.sweBench}%` : '-'}</div>
          </div>
          <div class="rounded border border-dark-border bg-dark/30 p-3">
            <div class="text-[10px] font-mono text-gray-text/60 uppercase">{t('Velocidad', 'Speed')}</div>
            <div class="text-2xl font-bold font-mono text-fg">{model.speed ? `${model.speed}` : '-'}<span class="text-sm text-gray-text"> {t('t/s', 't/s')}</span></div>
          </div>
          <div class="rounded border border-dark-border bg-dark/30 p-3">
            <div class="text-[10px] font-mono text-gray-text/60 uppercase">{t('Contexto', 'Context')}</div>
            <div class="text-2xl font-bold font-mono text-fg">{model.contextWindow ? `${(model.contextWindow / 1000).toFixed(0)}K` : '-'}</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card-l-corner bg-dark/40 rounded-lg p-6">
          <h3 class="text-gold text-sm font-mono font-bold uppercase tracking-wider mb-4">// {t('Radar vs media nivel', 'Radar vs tier average')} {model.tier}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={tierAverage}>
              <PolarGrid stroke="#1E1E1E" />
              <PolarAngleAxis dataKey="benchmark" tick={{ fill: '#888', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#555', fontSize: 9 }} />
              <Tooltip contentStyle={{ backgroundColor: '#141414', border: '1px solid #1E1E1E', fontFamily: 'JetBrains Mono', fontSize: '12px' }} />
              <Radar name="Modelo" dataKey="model" stroke="#F5C518" fill="#F5C518" fillOpacity={0.2} strokeWidth={2} />
              <Radar name="Media" dataKey="average" stroke="#888" fill="#888" fillOpacity={0.1} strokeWidth={1} strokeDasharray="4 3" />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div class="card-l-corner bg-dark/40 rounded-lg p-6">
          <h3 class="text-gold text-sm font-mono font-bold uppercase tracking-wider mb-4">// {t('Benchmarks', 'Benchmarks')}</h3>
          <table class="w-full text-sm font-mono">
            <tbody>
              {benchmarkRows.map(b => (
                <tr class="border-b border-dark-border/40">
                  <td class="py-2.5 text-gray-text">{b.label}</td>
                  <td class="py-2.5 text-right text-fg font-bold">{model[b.key]}{b.key !== 'qualityIndex' ? '%' : ''}</td>
                </tr>
              ))}
              <tr class="border-b border-dark-border/40">
                <td class="py-2.5 text-gray-text">{t('Entrada $/1M', 'Input $/1M')}</td>
                <td class="py-2.5 text-right text-fg">{model.inputPrice === 0 ? t('Gratis', 'Free') : `$${model.inputPrice.toFixed(2)}`}</td>
              </tr>
              <tr class="border-b border-dark-border/40">
                <td class="py-2.5 text-gray-text">{t('Salida $/1M', 'Output $/1M')}</td>
                <td class="py-2.5 text-right text-fg">{model.outputPrice === 0 ? t('Gratis', 'Free') : `$${model.outputPrice.toFixed(2)}`}</td>
              </tr>
              <tr>
                <td class="py-2.5 text-gray-text">{t('Fecha lanzamiento', 'Release date')}</td>
                <td class="py-2.5 text-right text-fg">{model.releaseDate}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card-l-corner bg-dark/40 rounded-lg p-6">
        <h3 class="text-gold text-sm font-mono font-bold uppercase tracking-wider mb-4">// {t('Calculadora de coste mensual', 'Monthly cost calculator')}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <label class="block">
            <span class="text-xs text-gray-text font-mono">{t('Tokens / día', 'Tokens / day')}</span>
            <input type="number" value={tokensPerDay} onChange={e => setTokensPerDay(Math.max(0, Number(e.currentTarget.value)))}
              class="w-full mt-1 bg-dark border border-dark-border rounded px-3 py-2 text-sm text-fg font-mono outline-none focus:border-gold/50" />
          </label>
          <div class="flex items-end">
            <div class="w-full rounded border border-gold/20 bg-gold/5 p-3">
              <div class="text-[10px] font-mono text-gold/70 uppercase">{t('Coste mensual estimado', 'Estimated monthly cost')}</div>
              <div class="text-2xl font-bold font-mono text-gold">
                {monthlyCost < 0.01 ? `$${monthlyCost.toFixed(4)}` : `$${monthlyCost.toFixed(2)}`}
              </div>
              <div class="text-xs text-gray-text font-mono mt-0.5">
                {(tokensPerDay * 30).toLocaleString()} {t('tokens/mes', 'tokens/month')} · ${monthlyCost.toFixed(2)}{t('/mes', '/month')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 class="text-gold text-sm font-mono font-bold uppercase tracking-wider mb-4">// {t('Modelos similares', 'Similar models')}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {similar.map(m => (
            <a
              key={m.id}
              href={`/modelo/${m.id}`}
              class="rounded-lg border border-dark-border bg-dark-card/50 hover:border-gold/40 transition-colors p-3 group"
            >
              <div class="flex items-center gap-2">
                <ProviderIcon provider={m.provider} size={24} />
                <span class="text-fg text-sm font-mono font-bold group-hover:text-gold transition-colors truncate">{m.name}</span>
              </div>
              <div class="mt-2 flex items-center justify-between text-xs font-mono">
                <span class="text-gray-text">{m.provider}</span>
                <span class="text-gold">{getCompositeScore(m).toFixed(1)} · {m.tier}</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div class="card-l-corner bg-dark/40 rounded-lg p-6">
        <h3 class="text-gold text-sm font-mono font-bold uppercase tracking-wider mb-4">// {t('Mis notas', 'My notes')}</h3>
        <textarea
          value={note}
          onChange={e => saveNote(e.currentTarget.value)}
          placeholder={`$ ${t('Escribe tus notas sobre este modelo... (se guarda automáticamente)', 'Write your notes about this model... (saved automatically)')}`}
          class="w-full min-h-[120px] bg-dark border border-dark-border rounded px-3 py-2 text-sm text-fg font-mono placeholder-gray-text/50 outline-none focus:border-gold/50 resize-y"
        />
        <div class="mt-2 text-xs text-gray-text font-mono">
          {note.trim() ? `// ${note.length} ${t('caracteres guardados', 'characters saved')}` : `// ${t('sin notas', 'no notes')}`}
        </div>
      </div>
    </div>
  );
}
