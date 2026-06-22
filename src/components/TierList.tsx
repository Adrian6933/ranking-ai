import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList, Customized } from 'recharts';
import ProviderIcon, { getIconUrl } from './ProviderIcon';
import { useT } from '../lib/i18n';

const TIER_COLORS: Record<string, string> = {
  S: '#F5C518', A: '#00C853', B: '#2979FF',
  C: '#888888', D: '#666666', F: '#8B1A1A',
};

const TIER_BADGE_COLORS: Record<string, string> = {
  S: '#F5C518', A: '#00C853', B: '#2979FF',
  C: '#888888', D: '#666666', F: '#8B1A1A',
};

function BarIcons({ xAxisMap, yAxisMap, chartData, dataKey }: any) {
  const xScale = xAxisMap?.[0]?.scale;
  const yScale = yAxisMap?.[0]?.scale;
  if (!xScale || !yScale || !chartData?.length) return null;

  const bandWidth = xScale.bandwidth ? xScale.bandwidth() : 40;
  const iconSize = Math.min(bandWidth * 0.55, 28);
  if (iconSize < 12) return null;

  return (
    <g>
      {chartData.map((m: any) => {
        const xCenter = xScale(m.name);
        if (xCenter == null) return null;
        const y = yScale(m[dataKey] || 0);
        const iconX = xCenter + bandWidth / 2 - iconSize / 2;
        const iconY = Math.max(2, y - iconSize - 4);
        const url = getIconUrl(m.provider);

        if (url) {
          return (
            <g key={m.id || m.name}>
              <rect
                x={iconX - 1}
                y={iconY - 1}
                width={iconSize + 2}
                height={iconSize + 2}
                rx={5}
                fill="white"
                stroke="rgba(0,0,0,0.08)"
                strokeWidth={0.5}
              />
              <image
                href={url}
                x={iconX}
                y={iconY}
                width={iconSize}
                height={iconSize}
                preserveAspectRatio="xMidYMid meet"
              />
            </g>
          );
        }

        const initials = m.provider.slice(0, 2).toUpperCase();
        return (
          <g key={m.id || m.name}>
            <rect
              x={iconX}
              y={iconY}
              width={iconSize}
              height={iconSize}
              rx={4}
              fill="#333"
            />
            <text
              x={iconX + iconSize / 2}
              y={iconY + iconSize / 2 + iconSize * 0.13}
              textAnchor="middle"
              fill="#888"
              fontSize={iconSize * 0.4}
              fontFamily="JetBrains Mono, monospace"
              fontWeight="bold"
            >
              {initials}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export default function TierList({ data }: { data: any[] }) {
  const { t } = useT();
  const tiers = ['S', 'A', 'B', 'C', 'D', 'F'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div class="bg-dark border border-dark-border rounded p-3 text-sm font-mono shadow-xl min-w-[200px]">
          <div class="flex items-center gap-2 mb-1">
            <ProviderIcon provider={d.provider} size={24} />
            <span class="text-fg font-bold">{d.name}</span>
          </div>
          <div class="text-gray-text text-xs">{d.provider} · {t('Nivel', 'Tier')} {d.tier}</div>
          <div class="mt-2 space-y-1 text-xs">
            <div class="flex justify-between"><span class="text-gray-text">{t('Programación real:', 'Real coding:')}</span><span class="text-fg font-bold">{d.sweBench}%</span></div>
            <div class="flex justify-between"><span class="text-gray-text">{t('Calidad:', 'Quality:')}</span><span class="text-gray-light">{d.qualityIndex ?? '-'}</span></div>
            <div class="flex justify-between"><span class="text-gray-text">{t('Entrada $/1M:', 'Input $/1M:')}</span><span class="text-gray-light">{d.inputPrice === 0 ? t('Gratis', 'Free') : `$${d.inputPrice.toFixed(2)}`}</span></div>
            <div class="flex justify-between"><span class="text-gray-text">{t('Velocidad:', 'Speed:')}</span><span class="text-gray-light">{d.speed ? `${d.speed} tokens/s` : '-'}</span></div>
          </div>
        </div>
      );
    }
    return null;
  };

  const grouped: Record<string, any[]> = {};
  tiers.forEach(tier => { grouped[tier] = []; });

  const sorted = [...data].sort((a, b) => {
    const tA = tiers.indexOf(a.tier);
    const tB = tiers.indexOf(b.tier);
    if (tA !== tB) return tA - tB;
    return (b.sweBench || 0) - (a.sweBench || 0);
  });

  sorted.forEach(m => {
    if (grouped[m.tier]) grouped[m.tier].push(m);
  });

  return (
    <div class="space-y-8">
      <div class="flex flex-wrap gap-3 text-xs font-mono">
        {tiers.filter(tier => grouped[tier].length > 0).map(tier => (
          <span class="flex items-center gap-2 px-3 py-1.5 rounded border border-dark-border bg-dark-card">
            <span
              class="w-5 h-5 rounded flex items-center justify-center text-xs font-bold font-mono"
              style={{
                backgroundColor: TIER_BADGE_COLORS[tier],
                color: tier === 'S' || tier === 'A' || tier === 'B' ? '#0A0A0A' : '#fff',
              }}
            >
              {tier}
            </span>
            <span class="text-gray-text">{grouped[tier].length} {t('modelos', 'models')}</span>
          </span>
        ))}
      </div>

      {tiers.filter(tier => grouped[tier].length > 0).map(tier => (
        <div class="rounded-lg border border-dark-border overflow-hidden">
          <div class="flex items-center gap-3 px-4 py-2.5 bg-dark-card">
            <span
              class="w-7 h-7 rounded flex items-center justify-center text-xs font-bold font-mono"
              style={{
                backgroundColor: TIER_BADGE_COLORS[tier],
                color: tier === 'S' || tier === 'A' || tier === 'B' ? '#0A0A0A' : '#fff',
              }}
            >
              {tier}
            </span>
            <span class="text-xs text-fg font-mono font-bold">{t('NIVEL', 'TIER')} {tier}</span>
            <span class="text-xs text-gray-text font-mono">// {grouped[tier].length} {t('modelos', 'models')}</span>
          </div>
          <div class="p-4 overflow-x-auto" style={{ backgroundColor: `${TIER_COLORS[tier]}08` }}>
            <div style={{ minWidth: '100%', width: `${Math.max(100, grouped[tier].length * 140)}px` }}>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart
                  data={grouped[tier]}
                  margin={{ top: 24, right: 40, left: 0, bottom: 60 }}
                  barCategoryGap={grouped[tier].length <= 4 ? '40%' : '25%'}
                  barGap={2}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#555"
                    tick={{ fill: '#ccc', fontSize: 9, fontFamily: 'JetBrains Mono', angle: -20, textAnchor: 'end' }}
                    interval={0}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis domain={[0, 'auto']} stroke="#444" tick={{ fill: '#666', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="sweBench" radius={[3, 3, 0, 0]} maxBarSize={90} minBarSize={24}>
                    {grouped[tier].map((entry: any, idx: number) => (
                      <Cell key={idx} fill={TIER_COLORS[tier]} fillOpacity={0.85} />
                    ))}
                    <LabelList
                      dataKey="sweBench"
                      position="top"
                      style={{ fill: '#aaa', fontSize: '10px', fontFamily: 'JetBrains Mono', fontWeight: 600 }}
                      formatter={(v: number) => v ? `${v}%` : ''}
                    />
                  </Bar>
                  <Customized component={BarIcons} chartData={grouped[tier]} dataKey="sweBench" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
