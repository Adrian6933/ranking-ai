import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import ProviderIcon from './ProviderIcon';
import { useT } from '../lib/i18n';

const PROVIDER_COLORS: Record<string, string> = {
  'Anthropic': '#F5C518',
  'OpenAI': '#00C853',
  'Google': '#2979FF',
  'DeepSeek': '#D500F9',
  'Alibaba': '#FF6D00',
  'Meta': '#FF1744',
  'Mistral': '#00BCD4',
  'xAI': '#E91E63',
  'Z.AI': '#FF9800',
};

export default function EvolutionTimeline({ data }: { data: any[] }) {
  const { t } = useT();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div class="bg-dark border border-dark-border rounded p-3 text-sm font-mono shadow-xl">
          {d.models?.slice(0, 5).map((m: any, i: number) => (
            <div key={i} class={i > 0 ? 'mt-1 pt-1 border-t border-dark-border/50' : ''}>
              <div class="flex items-center gap-2">
                <ProviderIcon provider={m.provider} size={18} />
                <div class="text-fg font-bold">{m.name}</div>
              </div>
              <div class="text-gray-text text-xs">{m.provider}</div>
              <div class="text-gold">{t('Programación real:', 'Real coding:')} {m.sweBench}%</div>
            </div>
          ))}
          {d.models?.length > 5 && (
            <div class="text-gray-text text-xs mt-1">+{d.models.length - 5} {t('más', 'more')}</div>
          )}
        </div>
      );
    }
    return null;
  };

  const timelineData = useMemo(() => {
    const groups: Record<string, { date: string; models: any[]; maxSwe: number }> = {};
    
    data.forEach((m: any) => {
      if (!m.releaseDate || m.sweBench == null) return;
      const dateKey = m.releaseDate;
      if (!groups[dateKey]) {
        groups[dateKey] = { date: dateKey, models: [], maxSwe: 0 };
      }
      groups[dateKey].models.push(m);
      if (m.sweBench > groups[dateKey].maxSwe) {
        groups[dateKey].maxSwe = m.sweBench;
      }
    });

    return Object.values(groups)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(g => ({
        date: g.date,
        maxSwe: g.maxSwe,
        models: g.models,
        label: g.date,
      }));
  }, [data]);

  return (
    <div class="card-l-corner bg-dark/40 rounded-lg p-6">
      <div class="text-xs text-gray-text font-mono mb-4">
        $ {t('Mejor puntuación de programación real por fecha de lanzamiento', 'Best real coding score by release date')} &nbsp;//&nbsp; {t('Evolución de capacidad en el tiempo', 'Capability evolution over time')}
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={timelineData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
          <XAxis
            dataKey="label"
            stroke="#555"
            tick={{ fill: '#888', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          />
          <YAxis
            domain={[0, 100]}
            stroke="#555"
            tick={{ fill: '#888', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            label={{ value: t('Mejor programación real (%)', 'Best real coding (%)'), angle: -90, position: 'insideLeft', fill: '#888', fontSize: 11, fontFamily: 'JetBrains Mono' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={80} stroke="#00C853" strokeDasharray="3 3" strokeOpacity={0.4} label={{ value: t('80% — umbral élite', '80% — elite threshold'), fill: '#00C853', fontSize: 9, fontFamily: 'JetBrains Mono', position: 'right' }} />
          <ReferenceLine y={50} stroke="#888" strokeDasharray="3 3" strokeOpacity={0.3} label={{ value: t('50% — capacidad media', '50% — average capability'), fill: '#888', fontSize: 9, fontFamily: 'JetBrains Mono', position: 'right' }} />
          <Line
            type="monotone"
            dataKey="maxSwe"
            stroke="#F5C518"
            strokeWidth={2}
            dot={{ fill: '#F5C518', r: 4 }}
            activeDot={{ r: 6, fill: '#FFD700' }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div class="mt-4 text-xs text-gray-text font-mono text-center">
        $ {t('Cada punto representa el modelo con mejor resultado lanzado en ese periodo', 'Each point represents the best-scoring model released in that period')}
      </div>
    </div>
  );
}
