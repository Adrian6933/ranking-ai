import { useMemo, useState } from 'react';
import ProviderIcon from './ProviderIcon';
import { useT } from '../lib/i18n';

function getColor(value: number | null, max: number): string {
  if (value == null) return '#1A1A1A';
  const ratio = Math.min(1, value / max);
  if (ratio >= 0.8) return '#00C853';
  if (ratio >= 0.6) return '#7FD33F';
  if (ratio >= 0.4) return '#F5C518';
  if (ratio >= 0.2) return '#FF8800';
  return '#FF1744';
}

export default function Heatmap({ data }: { data: any[] }) {
  const { t } = useT();
  const BENCHMARKS = [
    { key: 'sweBench', label: t('Prog. real', 'Real coding'), max: 100 },
    { key: 'gpqa', label: t('Razonam.', 'Reasoning'), max: 100 },
    { key: 'terminalBench', label: t('Terminal', 'Terminal'), max: 100 },
    { key: 'sciCode', label: t('SciCode', 'SciCode'), max: 100 },
    { key: 'qualityIndex', label: t('Calidad', 'Quality'), max: 65 },
    { key: 'speed', label: t('Velocidad', 'Speed'), max: 350 },
  ];
  const [sort, setSort] = useState<'name' | 'sweBench'>('sweBench');

  const sorted = useMemo(() => {
    const arr = [...data];
    if (sort === 'name') arr.sort((a, b) => a.name.localeCompare(b.name));
    else arr.sort((a, b) => (b.sweBench || 0) - (a.sweBench || 0));
    return arr;
  }, [data, sort]);

  return (
    <div class="rounded-lg border border-dark-border overflow-hidden">
      <div class="flex items-center justify-between px-4 py-2.5 bg-dark-card border-b border-dark-border">
        <div class="text-xs text-fg font-mono font-bold">// {t('Mapa de calor', 'Heatmap')}</div>
        <div class="flex gap-2">
          <button
            onClick={() => setSort('sweBench')}
            class={`px-2 py-1 rounded text-xs font-mono transition-colors ${sort === 'sweBench' ? 'text-gold bg-gold/10' : 'text-gray-text hover:text-fg'}`}
          >
            {t('Por score', 'By score')}
          </button>
          <button
            onClick={() => setSort('name')}
            class={`px-2 py-1 rounded text-xs font-mono transition-colors ${sort === 'name' ? 'text-gold bg-gold/10' : 'text-gray-text hover:text-fg'}`}
          >
            {t('Por nombre', 'By name')}
          </button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-xs font-mono">
          <thead>
            <tr class="border-b border-dark-border">
              <th class="text-left py-2 px-3 text-gray-text sticky left-0 bg-dark-card z-10 min-w-[180px]">{t('Modelo', 'Model')}</th>
              {BENCHMARKS.map(b => (
                <th class="py-2 px-1 text-center text-gray-text min-w-[80px]">{b.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(m => (
              <tr class="border-b border-dark-border/20 hover:bg-fg/[0.02]">
                <td class="py-1.5 px-3 sticky left-0 bg-dark-card z-10">
                  <div class="flex items-center gap-2">
                    <ProviderIcon provider={m.provider} size={18} />
                    <a href={`/modelo/${m.id}`} class="text-fg hover:text-gold transition-colors truncate">{m.name}</a>
                  </div>
                </td>
                {BENCHMARKS.map(b => {
                  const val = m[b.key];
                  const color = getColor(val, b.max);
                  const ratio = val != null ? Math.min(1, val / b.max) : 0;
                  return (
                    <td class="py-1.5 px-1 text-center">
                      <div
                        class="rounded px-1 py-1 text-[10px] font-bold transition-transform hover:scale-110 cursor-default"
                        style={{
                          backgroundColor: color + '30',
                          color: color,
                          border: `1px solid ${color}40`,
                        }}
                        title={`${b.label}: ${val != null ? val : t('sin datos', 'no data')}`}
                      >
                        {val != null ? (b.key === 'speed' ? val : `${val}%`) : '—'}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div class="px-4 py-2 border-t border-dark-border bg-dark-card flex items-center gap-3 text-[10px] font-mono text-gray-text">
        <span>{t('Escala:', 'Scale:')}</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded" style={{ backgroundColor: '#FF174440', border: '1px solid #FF174480' }}></span> &lt;20%</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded" style={{ backgroundColor: '#FF880040', border: '1px solid #FF880080' }}></span> 20-40%</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded" style={{ backgroundColor: '#F5C51840', border: '1px solid #F5C51880' }}></span> 40-60%</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded" style={{ backgroundColor: '#7FD33F40', border: '1px solid #7FD33F80' }}></span> 60-80%</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded" style={{ backgroundColor: '#00C85340', border: '1px solid #00C85380' }}></span> &gt;80%</span>
      </div>
    </div>
  );
}
