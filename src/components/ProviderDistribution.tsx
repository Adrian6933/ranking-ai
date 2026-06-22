import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
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
  'MiniMax': '#4CAF50',
  'Moonshot AI': '#9C27B0',
  'Cohere': '#009688',
  'NVIDIA': '#76B900',
  'MiMo': '#607D8B',
  'OpenCode': '#FFC107',
};

export default function ProviderDistribution({ data }: { data: any[] }) {
  const { t } = useT();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div class="bg-dark border border-dark-border rounded p-3 text-sm font-mono shadow-xl">
          <div class="text-fg font-bold">{d.name}</div>
          <div class="text-gold">{d.value} {t('modelos', 'models')}</div>
          <div class="text-gray-text">{t('Media programación real:', 'Avg real coding:')} {d.avgSwe?.toFixed(1)}%</div>
        </div>
      );
    }
    return null;
  };

  const providerData = useMemo(() => {
    const groups: Record<string, { count: number; totalSwe: number }> = {};
    data.forEach((m: any) => {
      if (!groups[m.provider]) groups[m.provider] = { count: 0, totalSwe: 0 };
      groups[m.provider].count++;
      if (m.sweBench != null) groups[m.provider].totalSwe += m.sweBench;
    });
    return Object.entries(groups)
      .map(([name, info]) => ({
        name,
        value: info.count,
        avgSwe: info.count > 0 ? info.totalSwe / info.count : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  return (
    <div class="card-l-corner bg-dark/40 rounded-lg p-6">
      <div class="text-xs text-gray-text font-mono mb-4">
        $ {t('Modelos por proveedor', 'Models per provider')} &nbsp;//&nbsp; {t('Tamaño = número de modelos', 'Size = number of models')}
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={providerData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={140}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => `${name} (${value})`}
              labelLine={{ stroke: '#555', strokeWidth: 1 }}
            >
              {providerData.map((entry) => (
                <Cell key={entry.name} fill={PROVIDER_COLORS[entry.name] || '#555'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div class="flex flex-col justify-center">
          {providerData.map(p => (
            <div key={p.name} class="flex items-center gap-3 py-2 border-b border-dark-border/50 last:border-0">
              <ProviderIcon provider={p.name} size={20} />
              <span class="text-sm text-fg font-mono flex-1">{p.name}</span>
              <span class="text-sm text-gold font-mono font-bold">{p.value}</span>
              <span class="text-xs text-gray-text font-mono">{p.avgSwe.toFixed(1)}% {t('media', 'avg')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
