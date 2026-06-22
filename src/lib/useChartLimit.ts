import { useState } from 'react';

const PREFIX = 'chartLimit_';

const LIMIT_OPTIONS = [5, 10, 20, 50, 999];

function load(id: string, fallback: number): number {
  if (typeof localStorage === 'undefined') return fallback;
  const saved = localStorage.getItem(PREFIX + id);
  if (saved) {
    const n = parseInt(saved, 10);
    if (LIMIT_OPTIONS.includes(n)) return n;
  }
  return fallback;
}

export { LIMIT_OPTIONS };

export function useChartLimit(id: string, fallback: number) {
  const [limit, setLimit] = useState(() => load(id, fallback));

  const change = (v: number) => {
    setLimit(v);
    localStorage.setItem(PREFIX + id, String(v));
  };

  return { limit, change, options: LIMIT_OPTIONS };
}
