export const BENCHMARK_LABELS: Record<string, string> = {
  sweBench: 'Programación real',
  liveCodeBench: 'Programación competitiva',
  terminalBench: 'Agente en terminal',
  sciCode: 'Programación científica',
  gpqa: 'Razonamiento científico',
  qualityIndex: 'Índice de calidad',
};

export const RANKING_WEIGHTS = [
  { label: 'Programación real', weight: 35, detail: 'SWE-bench y resolución de tareas reales de software.' },
  { label: 'Razonamiento', weight: 20, detail: 'GPQA Diamond, conocimiento difícil y razonamiento científico.' },
  { label: 'Trabajo como agente', weight: 15, detail: 'Terminal-Bench, uso de herramientas y tareas largas.' },
  { label: 'Velocidad', weight: 10, detail: 'Tokens de salida por segundo.' },
  { label: 'Coste/eficiencia', weight: 10, detail: 'Precio de entrada y salida por millón de tokens.' },
  { label: 'Contexto', weight: 5, detail: 'Ventana de contexto disponible.' },
  { label: 'Confianza del dato', weight: 5, detail: 'Penalización suave si faltan benchmarks importantes.' },
];

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const normalizeCost = (inputPrice = 0, outputPrice = 0) => {
  const total = inputPrice + outputPrice;
  if (total <= 0) return 100;
  return clamp(100 - Math.log10(total + 1) * 38);
};

const normalizeSpeed = (speed = 0) => clamp((speed / 350) * 100);

const normalizeContext = (contextWindow = 0) => clamp((Math.log10(contextWindow || 1) / Math.log10(2_000_000)) * 100);

export function getCompositeScore(model: any) {
  const programming = clamp(((model.sweBench ?? 0) * 0.75) + ((model.sciCode ?? 0) * 0.25));
  const reasoning = clamp(((model.gpqa ?? 0) * 0.8) + ((model.qualityIndex ?? 0) * 0.2));
  const agent = clamp(model.terminalBench ?? model.sweBench ?? 0);
  const speed = normalizeSpeed(model.speed);
  const cost = normalizeCost(model.inputPrice, model.outputPrice);
  const context = normalizeContext(model.contextWindow);
  const available = ['sweBench', 'terminalBench', 'sciCode', 'gpqa', 'qualityIndex'].filter(key => model[key] != null).length;
  const confidence = clamp((available / 5) * 100);

  return Number((
    programming * 0.35 +
    reasoning * 0.20 +
    agent * 0.15 +
    speed * 0.10 +
    cost * 0.10 +
    context * 0.05 +
    confidence * 0.05
  ).toFixed(1));
}

export function getConfidenceLabel(model: any) {
  const available = ['sweBench', 'terminalBench', 'sciCode', 'gpqa', 'qualityIndex'].filter(key => model[key] != null).length;
  if (available >= 5) return 'Alta';
  if (available >= 3) return 'Media';
  return 'Baja';
}
