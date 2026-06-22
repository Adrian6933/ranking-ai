import { useState, useMemo } from 'react';
import ProviderIcon from './ProviderIcon';
import { useT } from '../lib/i18n';

export default function Calculators({ data }: { data: any[] }) {
  const { t } = useT();
  const [tokensPerDay, setTokensPerDay] = useState(500000);
  const [outputRatio, setOutputRatio] = useState(30);
  const [daysPerMonth, setDaysPerMonth] = useState(30);
  const [docTokens, setDocTokens] = useState(50000);

  const costResults = useMemo(() => {
    const inputTokens = tokensPerDay * (1 - outputRatio / 100);
    const outputTokens = tokensPerDay * (outputRatio / 100);
    const monthlyInput = (inputTokens / 1_000_000) * daysPerMonth;
    const monthlyOutput = (outputTokens / 1_000_000) * daysPerMonth;

    return data
      .filter(m => m.inputPrice != null && m.outputPrice != null)
      .map(m => {
        const monthlyCost = (monthlyInput * m.inputPrice) + (monthlyOutput * m.outputPrice);
        return {
          ...m,
          monthlyCost,
          dailyCost: monthlyCost / daysPerMonth,
        };
      })
      .sort((a, b) => a.monthlyCost - b.monthlyCost)
      .slice(0, 15);
  }, [data, tokensPerDay, outputRatio, daysPerMonth]);

  const contextResults = useMemo(() => {
    return data
      .filter(m => m.contextWindow != null)
      .map(m => ({
        ...m,
        fits: m.contextWindow >= docTokens,
        percentage: (docTokens / m.contextWindow) * 100,
      }))
      .sort((a, b) => b.contextWindow - a.contextWindow)
      .slice(0, 15);
  }, [data, docTokens]);

  const speedResults = useMemo(() => {
    const targetTokens = 10000;
    return data
      .filter(m => m.speed != null)
      .map(m => ({
        ...m,
        seconds: targetTokens / m.speed,
      }))
      .sort((a, b) => a.seconds - b.seconds)
      .slice(0, 10);
  }, [data]);

  const fmtMoney = (v: number) => v < 0.01 ? `$${v.toFixed(4)}` : v < 1 ? `$${v.toFixed(3)}` : `$${v.toFixed(2)}`;
  const fmtTime = (s: number) => s < 60 ? `${s.toFixed(1)}s` : `${(s / 60).toFixed(1)}min`;

  return (
    <div class="space-y-12">
      <div class="card-l-corner bg-dark/40 rounded-lg p-6">
        <h3 class="text-gold text-sm font-mono font-bold uppercase tracking-wider mb-4">// {t('Calculadora de coste mensual', 'Monthly cost calculator')}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <label class="block">
            <span class="text-xs text-gray-text font-mono">{t('Tokens / día', 'Tokens / day')}</span>
            <input type="number" value={tokensPerDay} onChange={e => setTokensPerDay(Math.max(0, Number(e.currentTarget.value)))}
              class="w-full mt-1 bg-dark border border-dark-border rounded px-3 py-2 text-sm text-fg font-mono outline-none focus:border-gold/50" />
          </label>
          <label class="block">
            <span class="text-xs text-gray-text font-mono">{t('% salida (vs entrada)', '% output (vs input)')}</span>
            <input type="number" value={outputRatio} min={0} max={100} onChange={e => setOutputRatio(Math.min(100, Math.max(0, Number(e.currentTarget.value))))}
              class="w-full mt-1 bg-dark border border-dark-border rounded px-3 py-2 text-sm text-fg font-mono outline-none focus:border-gold/50" />
          </label>
          <label class="block">
            <span class="text-xs text-gray-text font-mono">{t('Días / mes', 'Days / month')}</span>
            <input type="number" value={daysPerMonth} onChange={e => setDaysPerMonth(Math.max(1, Number(e.currentTarget.value)))}
              class="w-full mt-1 bg-dark border border-dark-border rounded px-3 py-2 text-sm text-fg font-mono outline-none focus:border-gold/50" />
          </label>
        </div>
        <div class="text-xs text-gray-text font-mono mb-3">
          {tokensPerDay.toLocaleString()} {t('tokens/día', 'tokens/day')} · {daysPerMonth} {t('días/mes', 'days/month')} → {(tokensPerDay * daysPerMonth).toLocaleString()} {t('tokens/mes', 'tokens/month')}
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm font-mono">
            <thead>
              <tr class="border-b border-dark-border text-xs uppercase text-gray-text">
                <th class="text-left py-2 px-2">{t('Modelo', 'Model')}</th>
                <th class="text-right py-2 px-2">{t('$/mes', '$/month')}</th>
                <th class="text-right py-2 px-2">{t('$/día', '$/day')}</th>
                <th class="text-right py-2 px-2">{t('Entrada $/1M', 'Input $/1M')}</th>
                <th class="text-right py-2 px-2">{t('Salida $/1M', 'Output $/1M')}</th>
              </tr>
            </thead>
            <tbody>
              {costResults.map((m, i) => (
                <tr class="border-b border-dark-border/30 hover:bg-fg/[0.02]">
                  <td class="py-2 px-2">
                    <div class="flex items-center gap-2">
                      {i === 0 && <span class="text-green-accent text-xs">🏆</span>}
                      <ProviderIcon provider={m.provider} size={20} />
                      <a href={`/modelo/${m.id}`} class="text-fg hover:text-gold transition-colors">{m.name}</a>
                    </div>
                  </td>
                  <td class={`py-2 px-2 text-right font-bold ${i === 0 ? 'text-green-accent' : 'text-fg'}`}>{fmtMoney(m.monthlyCost)}</td>
                  <td class="py-2 px-2 text-right text-gray-text">{fmtMoney(m.dailyCost)}</td>
                  <td class="py-2 px-2 text-right text-gray-text">{m.inputPrice === 0 ? t('Gratis', 'Free') : `$${m.inputPrice.toFixed(2)}`}</td>
                  <td class="py-2 px-2 text-right text-gray-text">{m.outputPrice === 0 ? t('Gratis', 'Free') : `$${m.outputPrice.toFixed(2)}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card-l-corner bg-dark/40 rounded-lg p-6">
        <h3 class="text-gold text-sm font-mono font-bold uppercase tracking-wider mb-4">// {t('Calculadora de contexto', 'Context calculator')}</h3>
        <label class="block mb-6 max-w-md">
          <span class="text-xs text-gray-text font-mono">{t('Tamaño del documento (tokens)', 'Document size (tokens)')}</span>
          <input type="number" value={docTokens} onChange={e => setDocTokens(Math.max(0, Number(e.currentTarget.value)))}
            class="w-full mt-1 bg-dark border border-dark-border rounded px-3 py-2 text-sm text-fg font-mono outline-none focus:border-gold/50" />
          <span class="text-xs text-gray-text font-mono mt-1 block">≈ {(docTokens * 0.75).toFixed(0)} {t('palabras', 'words')} · {(docTokens / 1000).toFixed(1)}K {t('tokens', 'tokens')}</span>
        </label>
        <div class="space-y-2">
          {contextResults.map(m => (
            <div class={`flex items-center gap-3 p-2 rounded border ${m.fits ? 'border-green-accent/20 bg-green-accent/5' : 'border-dark-border bg-dark/20'}`}>
              <ProviderIcon provider={m.provider} size={20} />
              <a href={`/modelo/${m.id}`} class="text-fg text-sm font-mono hover:text-gold transition-colors flex-1">{m.name}</a>
              <span class="text-xs text-gray-text font-mono">{(m.contextWindow / 1000).toFixed(0)}K</span>
              <div class="w-24 h-2 rounded-full bg-dark-border overflow-hidden">
                <div
                  class={`h-full ${m.fits ? 'bg-green-accent' : 'bg-red-accent'}`}
                  style={{ width: `${Math.min(100, m.percentage)}%` }}
                />
              </div>
              <span class={`text-xs font-mono w-12 text-right ${m.fits ? 'text-green-accent' : 'text-gray-text'}`}>
                {m.percentage < 1 ? '<1%' : `${m.percentage.toFixed(0)}%`}
              </span>
              <span class={`text-xs font-mono ${m.fits ? 'text-green-accent' : 'text-red-accent/60'}`}>
                {m.fits ? '✓' : '✕'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div class="card-l-corner bg-dark/40 rounded-lg p-6">
        <h3 class="text-gold text-sm font-mono font-bold uppercase tracking-wider mb-4">// {t('Tiempo para generar 10.000 tokens', 'Time to generate 10,000 tokens')}</h3>
        <div class="space-y-2">
          {speedResults.map((m, i) => (
            <div class="flex items-center gap-3 p-2 rounded border border-dark-border bg-dark/20">
              {i === 0 && <span class="text-gold text-xs">🏆</span>}
              <ProviderIcon provider={m.provider} size={20} />
              <a href={`/modelo/${m.id}`} class="text-fg text-sm font-mono hover:text-gold transition-colors flex-1">{m.name}</a>
              <span class="text-xs text-gray-text font-mono">{m.speed} {t('t/s', 't/s')}</span>
              <span class={`text-sm font-mono font-bold w-20 text-right ${i === 0 ? 'text-gold' : 'text-fg'}`}>{fmtTime(m.seconds)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
