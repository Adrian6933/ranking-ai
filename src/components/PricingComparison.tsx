import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useChartLimit, LIMIT_OPTIONS } from '../lib/useChartLimit';
import ProviderIcon from './ProviderIcon';
import { useT } from '../lib/i18n';

export default function PricingComparison({ data }: { data: any[] }) {
  const { t } = useT();
  const { limit, change } = useChartLimit('pricingChart', 25);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div class="bg-dark border border-dark-border rounded p-3 text-sm font-mono shadow-xl">
          <div class="flex items-center gap-2">
            <ProviderIcon provider={d.provider} size={20} />
            <div class="text-fg font-bold">{d.fullName}</div>
          </div>
          <div class="text-gray-text text-xs">{d.provider}</div>
          <div class="mt-2 text-gold">{t('Entrada:', 'Input:')} <span class="text-fg">${d.inputPrice?.toFixed(2)}/1M</span></div>
          <div class="text-green-accent">{t('Salida:', 'Output:')} <span class="text-fg">${d.outputPrice?.toFixed(2)}/1M</span></div>
        </div>
      );
    }
    return null;
  };

  const sorted = data
    .filter(m => m.inputPrice != null)
    .sort((a, b) => (b.inputPrice + b.outputPrice) - (a.inputPrice + a.outputPrice));

  const sliced = limit === 999 ? sorted : sorted.slice(0, limit);

  const chartData = sliced.map(m => ({
    name: m.name.length > 18 ? m.name.slice(0, 16) + '..' : m.name,
    inputPrice: m.inputPrice,
    outputPrice: m.outputPrice,
    provider: m.provider,
    fullName: m.name,
  }));

  return (
    <div class="card-l-corner bg-dark/40 rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="text-xs text-gray-text font-mono">
          $ {t('Precio de entrada y salida por 1M de tokens', 'Input and output price per 1M tokens')} &nbsp;//&nbsp; {limit === 999 ? t('Todos los', 'All') : `Top ${limit}`}
        </div>
        <select
          value={limit}
          onChange={e => change(Number(e.currentTarget.value))}
          class="bg-dark border border-dark-border rounded px-2 py-1 text-xs text-fg font-mono outline-none focus:border-gold/50"
        >
          {LIMIT_OPTIONS.map(v => (
            <option key={v} value={v}>{v === 999 ? t('Todos', 'All') : `${v} ${t('resultados', 'results')}`}</option>
          ))}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" horizontal={false} />
          <XAxis type="number" stroke="#555" tick={{ fill: '#888', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
          <YAxis
            dataKey="name"
            type="category"
            stroke="#555"
            tick={{ fill: '#ccc', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            width={150}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value: string) => <span style={{ color: '#888', fontFamily: 'JetBrains Mono', fontSize: '11px' }}>{value}</span>}
          />
          <Bar dataKey="inputPrice" name={t('Entrada $/1M', 'Input $/1M')} stackId="a" fill="#555" radius={[0, 0, 0, 0]} />
          <Bar dataKey="outputPrice" name={t('Salida $/1M', 'Output $/1M')} stackId="a" fill="#F5C518" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
