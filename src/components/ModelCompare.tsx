import { useState, useMemo, useEffect } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import ProviderIcon from './ProviderIcon';
import { getCompositeScore } from '../lib/ranking';
import { useT } from '../lib/i18n';

const PROVIDER_COLORS = [
  '#F5C518', '#00C853', '#2979FF', '#D500F9',
];

export default function ModelCompare({ data }: { data: any[] }) {
  const { t } = useT();
  const BENCHMARKS = [
    { key: 'sweBench', label: t('Prog. real', 'Real coding'), max: 100 },
    { key: 'gpqa', label: t('Razonam.', 'Reasoning'), max: 100 },
    { key: 'terminalBench', label: t('Terminal', 'Terminal'), max: 100 },
    { key: 'sciCode', label: t('SciCode', 'SciCode'), max: 100 },
    { key: 'qualityIndex', label: t('Calidad', 'Quality'), max: 65 },
    { key: 'speed', label: t('Velocidad', 'Speed'), max: 350 },
  ];
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const models = params.get('models');
    if (models) {
      setSelected(models.split(',').filter(Boolean).slice(0, 4));
    }
  }, []);

  useEffect(() => {
    const ids = selected.join(',');
    const url = `${window.location.pathname}?models=${ids}`;
    window.history.replaceState({}, '', url);
  }, [selected]);

  const selectedModels = useMemo(() =>
    selected.map(id => data.find(m => m.id === id)).filter(Boolean) as any[],
    [selected, data]);

  const searchResults = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return [];
    return data
      .filter(m => !selected.includes(m.id))
      .filter(m => m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q))
      .slice(0, 8);
  }, [search, data, selected]);

  const radarData = useMemo(() => {
    return BENCHMARKS.map(b => {
      const entry: any = { benchmark: b.label };
      selectedModels.forEach((m, i) => {
        const val = m[b.key];
        entry[`m${i}`] = val != null ? Math.min(100, (val / b.max) * 100) : 0;
      });
      return entry;
    });
  }, [selectedModels, t]);

  const toggleModel = (id: string) => {
    setSelected(s => {
      if (s.includes(id)) return s.filter(x => x !== id);
      if (s.length >= 4) return s;
      return [...s, id];
    });
  };

  const winner = (key: string) => {
    if (selectedModels.length < 2) return null;
    const values = selectedModels.map(m => ({ id: m.id, val: m[key] })).filter(v => v.val != null);
    if (values.length < 2) return null;
    values.sort((a, b) => b.val - a.val);
    return values[0].id;
  };

  const formatVal = (m: any, key: string) => {
    const v = m[key];
    if (v == null) return '-';
    if (key === 'inputPrice' || key === 'outputPrice') return v === 0 ? t('Gratis', 'Free') : `$${v.toFixed(2)}`;
    if (key === 'speed') return `${v} ${t('t/s', 't/s')}`;
    if (key === 'contextWindow') return `${(v / 1000).toFixed(0)}K`;
    if (key === 'compositeScore') return String(v);
    return `${v}%`;
  };

  const COMPARE_FIELDS = [
    { key: 'compositeScore', label: t('Puntuación', 'Score'), calc: true },
    { key: 'sweBench', label: t('Prog. real', 'Real coding') },
    { key: 'gpqa', label: t('Razonamiento', 'Reasoning') },
    { key: 'terminalBench', label: t('Terminal', 'Terminal') },
    { key: 'sciCode', label: t('SciCode', 'SciCode') },
    { key: 'qualityIndex', label: t('Calidad', 'Quality') },
    { key: 'inputPrice', label: t('Entrada $/1M', 'Input $/1M') },
    { key: 'outputPrice', label: t('Salida $/1M', 'Output $/1M') },
    { key: 'speed', label: t('Velocidad', 'Speed') },
    { key: 'contextWindow', label: t('Contexto', 'Context') },
    { key: 'tier', label: t('Nivel', 'Tier') },
  ];

  return (
    <div>
      {selected.length === 0 && (
        <div class="mb-6 rounded-lg border border-dark-border bg-dark-card/50 p-4 text-sm font-mono text-gray-text">
          // {t('Selecciona 2-4 modelos para compararlos lado a lado. La URL es compartible.', 'Select 2-4 models to compare side by side. The URL is shareable.')}
        </div>
      )}

      <div class="mb-6">
        <div class="relative">
          <input
            type="text"
            placeholder={`$ ${t('buscar modelo para añadir...', 'search model to add...')}`}
            value={search}
            onChange={e => setSearch(e.currentTarget.value)}
            class="w-full bg-dark border border-dark-border rounded px-3 py-2 text-sm text-fg font-mono placeholder-gray-text/50 outline-none focus:border-gold/50 transition-colors"
          />
          {searchResults.length > 0 && (
            <div class="absolute top-full left-0 right-0 mt-1 bg-dark-card border border-dark-border rounded shadow-xl z-20 max-h-60 overflow-y-auto">
              {searchResults.map(m => (
                <button
                  key={m.id}
                  onClick={() => { toggleModel(m.id); setSearch(''); }}
                  class="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-fg/5 transition-colors"
                >
                  <ProviderIcon provider={m.provider} size={20} />
                  <span class="text-fg text-sm font-mono">{m.name}</span>
                  <span class="text-gray-text text-xs font-mono ml-auto">{m.provider}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selected.length > 0 && (
        <div class="flex flex-wrap gap-2 mb-6">
          {selectedModels.map((m, i) => (
            <div class="flex items-center gap-2 px-3 py-1.5 rounded border border-dark-border bg-dark-card text-sm font-mono">
              <span class="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PROVIDER_COLORS[i] }} />
              <ProviderIcon provider={m.provider} size={18} />
              <span class="text-fg">{m.name}</span>
              <button onClick={() => toggleModel(m.id)} class="text-gray-text hover:text-red-accent transition-colors ml-1">✕</button>
            </div>
          ))}
          {selected.length < 4 && (
            <span class="text-xs text-gray-text font-mono flex items-center px-2">// {t('busca arriba para añadir más', 'search above to add more')}</span>
          )}
        </div>
      )}

      {selected.length >= 2 && (
        <>
          <div class="card-l-corner bg-dark/40 rounded-lg p-6 mb-6">
            <div class="text-xs text-gray-text font-mono mb-4">$ {t('Radar comparativo — benchmarks normalizados a 0-100%', 'Comparative radar — benchmarks normalized to 0-100%')}</div>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1E1E1E" />
                <PolarAngleAxis dataKey="benchmark" tick={{ fill: '#888', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#555', fontSize: 9 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141414', border: '1px solid #1E1E1E', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                />
                <Legend formatter={(v: any) => {
                  const idx = Number(v.replace('m', ''));
                  const m = selectedModels[idx];
                  return <span style={{ color: PROVIDER_COLORS[idx], fontFamily: 'JetBrains Mono', fontSize: '11px' }}>{m?.name || v}</span>;
                }} />
                {selectedModels.map((m, i) => (
                  <Radar
                    key={m.id}
                    name={`m${i}`}
                    dataKey={`m${i}`}
                    stroke={PROVIDER_COLORS[i]}
                    fill={PROVIDER_COLORS[i]}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div class="overflow-x-auto rounded-lg border border-dark-border">
            <table class="w-full text-sm font-mono">
              <thead>
                <tr class="border-b border-dark-border text-xs uppercase tracking-wider text-gray-text">
                  <th class="text-left py-3 px-3 sticky left-0 bg-dark-card">{t('Métrica', 'Metric')}</th>
                  {selectedModels.map((m, i) => (
                    <th class="text-right py-3 px-3 min-w-[140px]">
                      <div class="flex items-center justify-end gap-2">
                        <span class="w-2 h-2 rounded-full" style={{ backgroundColor: PROVIDER_COLORS[i] }} />
                        <ProviderIcon provider={m.provider} size={18} />
                        <a href={`/modelo/${m.id}`} class="text-fg hover:text-gold transition-colors truncate">{m.name}</a>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_FIELDS.map(field => {
                  const w = field.calc ? null : winner(field.key);
                  return (
                    <tr class="border-b border-dark-border/40 hover:bg-fg/[0.02]">
                      <td class="py-2.5 px-3 text-gray-text sticky left-0 bg-dark-card/95">{field.label}</td>
                      {selectedModels.map((m, i) => {
                        const val = field.calc ? getCompositeScore(m).toFixed(1) : formatVal(m, field.key);
                        const isWinner = w === m.id;
                        return (
                          <td class={`py-2.5 px-3 text-right ${isWinner ? 'text-green-accent font-bold' : 'text-fg'}`}>
                            {isWinner && <span class="mr-1">🏆</span>}
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div class="mt-4 flex gap-3">
            <button
              onClick={() => { navigator.clipboard?.writeText(window.location.href); }}
              class="px-3 py-2 rounded border border-dark-border bg-dark-card text-xs text-fg font-mono hover:border-gold/50 transition-colors"
            >
              $ {t('Copiar enlace', 'Copy link')}
            </button>
            <button
              onClick={() => setSelected([])}
              class="px-3 py-2 rounded border border-dark-border bg-dark-card text-xs text-gray-text font-mono hover:border-red-accent/50 transition-colors"
            >
              // {t('Limpiar', 'Clear')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
