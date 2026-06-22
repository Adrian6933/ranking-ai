import { useMemo, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Customized, ReferenceLine, LabelList } from 'recharts';
import { useChartLimit, LIMIT_OPTIONS } from '../lib/useChartLimit';
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

function BigDot(props: any) {
  const { cx, cy, fill } = props;
  if (cx == null || cy == null) return null;
  return <circle cx={cx} cy={cy} r={7} fill={fill} fillOpacity={0.85} stroke={fill} strokeWidth={1.5} strokeOpacity={0.4} />;
}

function FamilyLines({ xAxisMap, yAxisMap, chartData }: any) {
  const xScale = xAxisMap?.[0]?.scale;
  const yScale = yAxisMap?.[0]?.scale;
  if (!xScale || !yScale || !chartData?.length) return null;

  const groups: Record<string, any[]> = {};
  chartData.forEach((d: any) => {
    if (!groups[d.provider]) groups[d.provider] = [];
    groups[d.provider].push(d);
  });

  return (
    <g>
      {Object.entries(groups).map(([provider, models]) => {
        if (models.length < 2) return null;
        const sorted = [...models].sort((a: any, b: any) => a.x - b.x);
        const d = sorted.map((m: any, i: number) => {
          const cx = xScale(m.x);
          const cy = yScale(m.y);
          return `${i === 0 ? 'M' : 'L'}${cx},${cy}`;
        }).join(' ');
        return <path key={provider} d={d} stroke="rgba(255,255,255,0.08)" strokeWidth={1.5} fill="none" />;
      })}
    </g>
  );
}

function ParetoFrontier({ xAxisMap, yAxisMap, chartData }: any) {
  const xScale = xAxisMap?.[0]?.scale;
  const yScale = yAxisMap?.[0]?.scale;
  if (!xScale || !yScale || !chartData?.length) return null;

  const sorted = [...chartData].sort((a: any, b: any) => a.x - b.x);
  const frontier: any[] = [];
  let maxSwe = -1;
  sorted.forEach((m: any) => {
    if (m.y > maxSwe) {
      frontier.push(m);
      maxSwe = m.y;
    }
  });

  if (frontier.length < 2) return null;

  const d = frontier.map((m: any, i: number) => {
    const cx = xScale(m.x);
    const cy = yScale(m.y);
    return `${i === 0 ? 'M' : 'L'}${cx},${cy}`;
  }).join(' ');

  return (
    <g>
      <path d={d} stroke="#F5C518" strokeWidth={1.5} strokeDasharray="5 4" fill="none" opacity={0.5} />
    </g>
  );
}

function TopLabels({ xAxisMap, yAxisMap, chartData, topNames }: any) {
  const xScale = xAxisMap?.[0]?.scale;
  const yScale = yAxisMap?.[0]?.scale;
  if (!xScale || !yScale || !chartData?.length) return null;

  return (
    <g>
      {chartData.map((m: any) => {
        if (!topNames.includes(m.name)) return null;
        const cx = xScale(m.x);
        const cy = yScale(m.y);
        if (cx == null || cy == null) return null;
        const text = m.name.length > 14 ? m.name.slice(0, 12) + '..' : m.name;
        return (
          <text
            key={m.name}
            x={cx + 10}
            y={cy - 8}
            fill="#bbb"
            fontSize={10}
            fontFamily="JetBrains Mono, monospace"
            opacity={0.7}
          >
            {text}
          </text>
        );
      })}
    </g>
  );
}

export default function ScatterPlot({ data }: { data: any[] }) {
  const { t } = useT();
  const { limit, change } = useChartLimit('scatterPlot', 50);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div class="bg-dark border border-dark-border rounded p-3 text-sm font-mono shadow-xl min-w-[200px]">
          <div class="flex items-center gap-2">
            <ProviderIcon provider={d.provider} size={20} />
            <div class="text-fg font-bold">{d.name}</div>
          </div>
          <div class="text-gray-text text-xs">{d.provider}</div>
          <div class="mt-2 space-y-1 text-xs">
            <div class="flex justify-between"><span class="text-gray-text">{t('Programación real:', 'Real coding:')}</span><span class="text-fg font-bold">{d.sweBench}%</span></div>
            <div class="flex justify-between"><span class="text-gray-text">{t('Entrada:', 'Input:')}</span><span class="text-gray-light">${d.inputPrice}/1M</span></div>
            <div class="flex justify-between"><span class="text-gray-text">{t('Salida:', 'Output:')}</span><span class="text-gray-light">${d.outputPrice}/1M</span></div>
            <div class="flex justify-between"><span class="text-gray-text">{t('Nivel:', 'Tier:')}</span><span class="text-gold">{d.tier}</span></div>
          </div>
        </div>
      );
    }
    return null;
  };
  const [providerFilter, setProviderFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');

  const providers = useMemo(() => [...new Set(data.map((m: any) => m.provider))].sort(), [data]);
  const tiers = ['S', 'A', 'B', 'C', 'D', 'F'];

  const allData = useMemo(() => data
    .filter((m: any) => m.sweBench != null && m.inputPrice != null)
    .filter((m: any) => !providerFilter || m.provider === providerFilter)
    .filter((m: any) => !tierFilter || m.tier === tierFilter)
    .map((m: any) => ({
      ...m,
      x: m.inputPrice + (m.inputPrice === 0 ? 0.01 : 0),
      y: m.sweBench,
      label: m.name,
    })), [data, providerFilter, tierFilter]);

  const chartData = limit === 999 ? allData : allData.slice(0, limit);

  const topNames = useMemo(() => {
    const withRatio = allData.map((m: any) => ({
      name: m.name,
      ratio: m.y / Math.max(m.x, 0.01),
    }));
    return withRatio
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 8)
      .map(m => m.name);
  }, [allData]);

  const stats = useMemo(() => {
    if (!allData.length) return null;
    const withRatio = allData.map((m: any) => ({ ...m, ratio: m.y / Math.max(m.x, 0.01) }));
    const bestValue = withRatio.reduce((a, b) => a.ratio > b.ratio ? a : b);
    const mostPowerful = allData.reduce((a, b) => a.y > b.y ? a : b);
    const cheapest = allData.reduce((a, b) => a.x < b.x ? a : b);
    return { bestValue, mostPowerful, cheapest };
  }, [allData]);

  const medianPrice = useMemo(() => {
    if (!allData.length) return 1;
    const sorted = [...allData].map(d => d.x).sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  }, [allData]);

  const medianSwe = useMemo(() => {
    if (!allData.length) return 50;
    const sorted = [...allData].map(d => d.y).sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  }, [allData]);

  const xDomain: [number, number] = useMemo(() => {
    if (!chartData.length) return [0.01, 20];
    const vals = chartData.map(d => d.x);
    return [0.01, Math.max(...vals) * 3];
  }, [chartData]);

  const yDomain: [number, number] = useMemo(() => {
    if (!chartData.length) return [0, 100];
    const max = Math.max(...chartData.map(d => d.y)) * 1.1;
    return [0, Math.min(100, Math.max(max, 20))];
  }, [chartData]);

  const logTicks = [0.01, 0.1, 1, 10];

  return (
    <div class="card-l-corner bg-dark/40 rounded-lg p-6">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div class="text-xs text-gray-text font-mono">
          $ {t('Coste vs rendimiento', 'Cost vs performance')} &nbsp;//&nbsp; {chartData.length} {t('modelos', 'models')} · {t('escala log en eje X', 'log scale on X axis')}
        </div>
        <div class="flex flex-wrap gap-2">
          <select
            value={providerFilter}
            onChange={e => { setProviderFilter(e.currentTarget.value); }}
            class="bg-dark border border-dark-border rounded px-2 py-1 text-xs text-fg font-mono outline-none focus:border-gold/50"
          >
            <option value="">// {t('Todos los proveedores', 'All providers')}</option>
            {providers.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select
            value={tierFilter}
            onChange={e => { setTierFilter(e.currentTarget.value); }}
            class="bg-dark border border-dark-border rounded px-2 py-1 text-xs text-fg font-mono outline-none focus:border-gold/50"
          >
            <option value="">// {t('Todos los niveles', 'All tiers')}</option>
            {tiers.map(tier => <option key={tier} value={tier}>{t('Nivel', 'Tier')} {tier}</option>)}
          </select>
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
      </div>

      {stats && (
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div class="border border-dark-border rounded px-3 py-2 bg-black/20">
            <div class="text-xs text-gray-text font-mono">// {t('Mejor relación', 'Best value')}</div>
            <div class="flex items-center gap-1.5 mt-0.5">
              <ProviderIcon provider={stats.bestValue.provider} size={18} />
              <div class="text-sm text-gold font-mono font-bold">{stats.bestValue.name}</div>
            </div>
            <div class="text-xs text-gray-text font-mono">{stats.bestValue.y}% / ${stats.bestValue.inputPrice}</div>
          </div>
          <div class="border border-dark-border rounded px-3 py-2 bg-black/20">
            <div class="text-xs text-gray-text font-mono">// {t('Más potente', 'Most powerful')}</div>
            <div class="flex items-center gap-1.5 mt-0.5">
              <ProviderIcon provider={stats.mostPowerful.provider} size={18} />
              <div class="text-sm text-green-accent font-mono font-bold">{stats.mostPowerful.name}</div>
            </div>
            <div class="text-xs text-gray-text font-mono">{stats.mostPowerful.y}% SWE-bench</div>
          </div>
          <div class="border border-dark-border rounded px-3 py-2 bg-black/20">
            <div class="text-xs text-gray-text font-mono">// {t('Más barato', 'Cheapest')}</div>
            <div class="flex items-center gap-1.5 mt-0.5">
              <ProviderIcon provider={stats.cheapest.provider} size={18} />
              <div class="text-sm text-blue-accent font-mono font-bold">{stats.cheapest.name}</div>
            </div>
            <div class="text-xs text-gray-text font-mono">${stats.cheapest.inputPrice}/1M {t('de entrada', 'input')}</div>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={520}>
        <ScatterChart margin={{ top: 20, right: 40, bottom: 50, left: 50 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
          <XAxis
            dataKey="x"
            type="number"
            scale="log"
            domain={xDomain}
            ticks={logTicks}
            stroke="#555"
            tick={{ fill: '#888', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            label={{ value: t('Precio de entrada ($/1M tokens) — escala log', 'Input price ($/1M tokens) — log scale'), position: 'bottom', offset: 15, fill: '#888', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            tickFormatter={(v: number) => v >= 1 ? `$${v.toFixed(0)}` : v >= 0.1 ? `$${v.toFixed(1)}` : `$${v.toFixed(2)}`}
            allowDataOverflow
          />
          <YAxis
            dataKey="y"
            type="number"
            domain={yDomain}
            stroke="#555"
            tick={{ fill: '#888', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            label={{ value: t('Programación real (%)', 'Real coding (%)'), angle: -90, position: 'insideLeft', fill: '#888', fontSize: 11, fontFamily: 'JetBrains Mono' }}
          />
          <ReferenceLine x={medianPrice} stroke="#444" strokeDasharray="2 4" />
          <ReferenceLine y={medianSwe} stroke="#444" strokeDasharray="2 4" />
          <Tooltip content={<CustomTooltip />} />
          <Customized component={FamilyLines} chartData={chartData} />
          <Customized component={ParetoFrontier} chartData={chartData} />
          <Customized component={TopLabels} chartData={chartData} topNames={topNames} />
          <Scatter name={t('Modelos', 'Models')} data={chartData} shape={<BigDot />}>
            {chartData.map((entry: any, index: number) => (
              <Cell key={index} fill={PROVIDER_COLORS[entry.provider] || '#888'} fillOpacity={0.85} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono">
        <span class="flex items-center gap-1.5">
          <span class="inline-block w-6 h-0.5 bg-gold/50" style={{ borderTop: '1px dashed #F5C518' }} />
          <span class="text-gray-text">{t('Frontera de eficiencia', 'Efficiency frontier')}</span>
        </span>
        <span class="flex items-center gap-1.5">
          <span class="inline-block w-6 h-0.5" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <span class="text-gray-text">{t('Mismos proveedores', 'Same providers')}</span>
        </span>
        <span class="flex items-center gap-1.5">
          <span class="inline-block w-6 h-0 border-t border-dashed border-gray-text/40" />
          <span class="text-gray-text">{t('Medianas', 'Medians')}</span>
        </span>
      </div>

      <div class="mt-3 flex flex-wrap gap-3 text-xs font-mono">
        {Object.entries(PROVIDER_COLORS).map(([prov, color]) => (
          <span class="flex items-center gap-1.5">
            <ProviderIcon provider={prov} size={16} />
            <span class="text-gray-text">{prov}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
