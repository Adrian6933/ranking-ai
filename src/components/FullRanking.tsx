import { useState, useMemo } from 'react';
import ProviderIcon from './ProviderIcon';
import { getCompositeScore, getConfidenceLabel } from '../lib/ranking';
import { useT } from '../lib/i18n';

type SortKey = 'name' | 'provider' | 'compositeScore' | 'sweBench' | 'qualityIndex' | 'gpqa' | 'terminalBench' | 'inputPrice' | 'speed' | 'contextWindow' | 'releaseDate';

const PAGE_SIZES = [10, 20, 50, 100, 999];
const STORAGE_KEY = 'fullRankingPageSize';

function loadPageSize(): number {
  if (typeof localStorage === 'undefined') return 50;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const n = parseInt(saved, 10);
    if (PAGE_SIZES.includes(n)) return n;
  }
  return 50;
}

export default function FullRanking({ data }: { data: any[] }) {
  const { t } = useT();
  const [sortKey, setSortKey] = useState<SortKey>('compositeScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(loadPageSize);

  const providers = useMemo(() => [...new Set(data.map((m: any) => m.provider))].sort(), [data]);

  const filtered = useMemo(() => {
    let result = data.map((m: any) => ({
      ...m,
      compositeScore: getCompositeScore(m),
      confidence: getConfidenceLabel(m),
    }));
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(m => m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q));
    }
    if (providerFilter) {
      result = result.filter(m => m.provider === providerFilter);
    }
    result.sort((a, b) => {
      let va = a[sortKey];
      let vb = b[sortKey];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va == null) va = -Infinity;
      if (vb == null) vb = -Infinity;
      return sortDir === 'desc' ? (vb > va ? 1 : -1) : (va > vb ? 1 : -1);
    });
    return result;
  }, [data, search, providerFilter, sortKey, sortDir]);

  const pageCount = useMemo(() => Math.max(1, Math.ceil(filtered.length / pageSize)), [filtered.length, pageSize]);
  const paginated = useMemo(() => filtered.slice(page * pageSize, (page + 1) * pageSize), [filtered, page, pageSize]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(0);
  };

  const changePageSize = (size: number) => {
    setPageSize(size);
    localStorage.setItem(STORAGE_KEY, String(size));
    const newMaxPage = Math.max(1, Math.ceil(filtered.length / size)) - 1;
    if (page > newMaxPage) setPage(newMaxPage);
  };

  const exportCSV = () => {
    const headers = [t('Modelo', 'Model'), t('Proveedor', 'Provider'), t('Puntuación', 'Score'), t('Prog. real', 'Real coding'), t('Calidad', 'Quality'), t('Razón. científico', 'Sci. reasoning'), t('Terminal', 'Terminal'), t('Entrada $/1M', 'Input $/1M'), t('Velocidad', 'Speed'), t('Contexto', 'Context'), t('Confianza', 'Confidence'), t('Nivel', 'Tier')];
    const rows = filtered.map((m: any) => [
      m.name,
      m.provider,
      m.compositeScore,
      m.sweBench ?? '',
      m.qualityIndex ?? '',
      m.gpqa ?? '',
      m.terminalBench ?? '',
      m.inputPrice ?? '',
      m.speed ?? '',
      m.contextWindow ?? '',
      m.confidence,
      m.tier,
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map((c: any) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ranking-ia.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortArrow = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <span class="text-gray-700 ml-1">{'\u2195'}</span>;
    return <span class="text-gold ml-1">{sortDir === 'desc' ? '\u2193' : '\u2191'}</span>;
  };

  return (
    <div>
      <div class="flex flex-wrap gap-4 mb-6">
        <input
          id="full-ranking-search"
          type="text"
          placeholder={`$ ${t('buscar modelo o proveedor...', 'search model or provider...')} (${t('pulsa', 'press')} /)`}
          value={search}
          onChange={e => { setSearch(e.currentTarget.value); setPage(0); }}
          class="flex-1 min-w-[200px] bg-dark border border-dark-border rounded px-3 py-2 text-sm text-fg font-mono placeholder-gray-text/50 outline-none focus:border-gold/50 transition-colors"
        />
        <select
          value={providerFilter}
          onChange={e => { setProviderFilter(e.currentTarget.value); setPage(0); }}
          class="bg-dark border border-dark-border rounded px-3 py-2 text-sm text-fg font-mono outline-none focus:border-gold/50"
        >
          <option value="">// {t('todos los proveedores', 'all providers')}</option>
          {providers.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          value={pageSize}
          onChange={e => changePageSize(Number(e.currentTarget.value))}
          class="bg-dark border border-dark-border rounded px-3 py-2 text-sm text-fg font-mono outline-none focus:border-gold/50"
        >
          {PAGE_SIZES.map(s => (
            <option key={s} value={s}>{s === 999 ? t('Todos', 'All') : `${s} ${t('/ pág', '/ page')}`}</option>
          ))}
        </select>
        <div class="text-xs text-gray-text font-mono flex items-center">
          {filtered.length} {t('modelos', 'models')}
        </div>
        <button
          onClick={exportCSV}
          class="px-3 py-2 rounded border border-dark-border bg-dark-card text-xs text-fg font-mono hover:border-gold/50 transition-colors"
        >
          $ {t('Exportar CSV', 'Export CSV')}
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm font-mono">
          <thead>
            <tr class="border-b border-dark-border text-xs uppercase tracking-wider text-gray-text">
              <th class="text-left py-3 px-2 cursor-pointer hover:text-gold transition-colors" onClick={() => toggleSort('name')}>
                {t('Modelo', 'Model')} <SortArrow k="name" />
              </th>
              <th class="text-left py-3 px-2 cursor-pointer hover:text-gold transition-colors" onClick={() => toggleSort('provider')}>
                {t('Proveedor', 'Provider')} <SortArrow k="provider" />
              </th>
              <th class="text-right py-3 px-2 cursor-pointer hover:text-gold transition-colors" onClick={() => toggleSort('compositeScore')}>
                {t('Puntuación', 'Score')} <SortArrow k="compositeScore" />
              </th>
              <th class="text-right py-3 px-2 cursor-pointer hover:text-gold transition-colors" onClick={() => toggleSort('sweBench')}>
                {t('Prog. real', 'Real coding')} <SortArrow k="sweBench" />
              </th>
              <th class="text-right py-3 px-2 cursor-pointer hover:text-gold transition-colors" onClick={() => toggleSort('qualityIndex')}>
                {t('Calidad', 'Quality')} <SortArrow k="qualityIndex" />
              </th>
              <th class="text-right py-3 px-2 cursor-pointer hover:text-gold transition-colors" onClick={() => toggleSort('gpqa')}>
                {t('Razón. científico', 'Sci. reasoning')} <SortArrow k="gpqa" />
              </th>
              <th class="text-right py-3 px-2 cursor-pointer hover:text-gold transition-colors" onClick={() => toggleSort('terminalBench')}>
                {t('Terminal', 'Terminal')} <SortArrow k="terminalBench" />
              </th>
              <th class="text-right py-3 px-2 cursor-pointer hover:text-gold transition-colors" onClick={() => toggleSort('inputPrice')}>
                {t('Entrada $/1M', 'Input $/1M')} <SortArrow k="inputPrice" />
              </th>
              <th class="text-right py-3 px-2 cursor-pointer hover:text-gold transition-colors" onClick={() => toggleSort('speed')}>
                {t('Velocidad', 'Speed')} <SortArrow k="speed" />
              </th>
              <th class="text-right py-3 px-2 cursor-pointer hover:text-gold transition-colors" onClick={() => toggleSort('contextWindow')}>
                {t('Contexto', 'Context')} <SortArrow k="contextWindow" />
              </th>
              <th class="text-center py-3 px-2">{t('Confianza', 'Confidence')}</th>
              <th class="text-center py-3 px-2">{t('Nivel', 'Tier')}</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((model: any) => (
              <tr class="border-b border-dark-border/50 hover:bg-fg/[0.02] transition-colors">
                <td class="py-3 px-2">
                  <div class="flex items-center gap-2">
                    <ProviderIcon provider={model.provider} size={24} />
                    <span class="text-fg font-medium">{model.name}</span>
                  </div>
                </td>
                <td class="py-3 px-2 text-gray-text">{model.provider}</td>
                <td class="py-3 px-2 text-right font-bold text-gold">{model.compositeScore}</td>
                <td class={`py-3 px-2 text-right font-bold ${
                  model.sweBench == null ? 'text-gray-700' :
                  model.sweBench >= 80 ? 'text-green-accent' :
                  model.sweBench >= 60 ? 'text-gold' :
                  'text-gray-text'
                }`}>
                  {model.sweBench ? `${model.sweBench}%` : '-'}
                </td>
                <td class="py-3 px-2 text-right text-gray-text">{model.qualityIndex ?? '-'}</td>
                <td class="py-3 px-2 text-right text-gray-text">{model.gpqa ? `${model.gpqa}%` : '-'}</td>
                <td class="py-3 px-2 text-right text-gray-text">{model.terminalBench ? `${model.terminalBench}%` : '-'}</td>
                <td class="py-3 px-2 text-right text-gray-text">
                  {model.inputPrice === 0 ? t('Gratis', 'Free') : `$${model.inputPrice.toFixed(2)}`}
                </td>
                <td class="py-3 px-2 text-right text-gray-text">{model.speed ? `${model.speed} t/s` : '-'}</td>
                <td class="py-3 px-2 text-right text-gray-text">
                  {model.contextWindow ? `${(model.contextWindow / 1000).toFixed(0)}K` : '-'}
                </td>
                <td class="py-3 px-2 text-center text-xs text-gray-text">{model.confidence}</td>
                <td class="py-3 px-2 text-center">
                  <span class={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold tier-badge-${model.tier.toLowerCase()}`}>
                    {model.tier}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between mt-4 text-xs font-mono text-gray-text">
        <span>
          {filtered.length === 0
            ? t('Sin resultados', 'No results')
            : `${t('Mostrando', 'Showing')} ${page * pageSize + 1}–${Math.min((page + 1) * pageSize, filtered.length)} ${t('de', 'of')} ${filtered.length} ${t('modelos', 'models')}`
          }
        </span>
        <div class="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            class="px-3 py-1.5 rounded border border-dark-border bg-dark-card hover:border-gold/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {'\u2190'} {t('Anterior', 'Previous')}
          </button>
          {Array.from({ length: Math.min(pageCount, 7) }, (_, i) => {
            const start = Math.max(0, Math.min(page - 3, pageCount - 7));
            const p = start + i;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                class={`px-2.5 py-1.5 rounded border transition-colors ${
                  p === page
                    ? 'border-gold text-gold bg-gold/10'
                    : 'border-dark-border bg-dark-card text-gray-text hover:border-gold/50'
                }`}
              >
                {p + 1}
              </button>
            );
          })}
          <button
            onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
            disabled={page >= pageCount - 1}
            class="px-3 py-1.5 rounded border border-dark-border bg-dark-card hover:border-gold/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {t('Siguiente', 'Next')} {'\u2192'}
          </button>
        </div>
      </div>
    </div>
  );
}
