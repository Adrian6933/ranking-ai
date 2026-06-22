import { RANKING_WEIGHTS } from '../lib/ranking';
import { useT } from '../lib/i18n';

const WEIGHT_TRANSLATIONS: Record<string, { label: [string, string]; detail: [string, string] }> = {
  'Programación real': {
    label: ['Programación real', 'Real coding'],
    detail: ['SWE-bench y resolución de tareas reales de software.', 'SWE-bench and resolution of real software tasks.'],
  },
  'Razonamiento': {
    label: ['Razonamiento', 'Reasoning'],
    detail: ['GPQA Diamond, conocimiento difícil y razonamiento científico.', 'GPQA Diamond, difficult knowledge and scientific reasoning.'],
  },
  'Trabajo como agente': {
    label: ['Trabajo como agente', 'Agent ability'],
    detail: ['Terminal-Bench, uso de herramientas y tareas largas.', 'Terminal-Bench, tool usage and long tasks.'],
  },
  'Velocidad': {
    label: ['Velocidad', 'Speed'],
    detail: ['Tokens de salida por segundo.', 'Output tokens per second.'],
  },
  'Coste/eficiencia': {
    label: ['Coste/eficiencia', 'Cost/efficiency'],
    detail: ['Precio de entrada y salida por millón de tokens.', 'Input and output price per million tokens.'],
  },
  'Contexto': {
    label: ['Contexto', 'Context'],
    detail: ['Ventana de contexto disponible.', 'Available context window.'],
  },
  'Confianza del dato': {
    label: ['Confianza del dato', 'Data confidence'],
    detail: ['Penalización suave si faltan benchmarks importantes.', 'Soft penalty if important benchmarks are missing.'],
  },
};

export default function Methodology() {
  const { t } = useT();

  const SOURCES = [
    { name: 'Artificial Analysis', use: t('Índice de inteligencia, velocidad, coste por tarea, rendimiento de APIs y evaluaciones agregadas.', 'Intelligence index, speed, cost per task, API performance and aggregated evaluations.') },
    { name: 'SWE-bench oficial', use: t('Programación real: porcentaje de incidencias resueltas en repositorios reales.', 'Real coding: percentage of issues resolved in real repositories.') },
    { name: 'LMArena / Chatbot Arena', use: t('Preferencia humana y comparación ciega entre modelos.', 'Human preference and blind comparison between models.') },
    { name: 'LiveBench', use: t('Pruebas recientes para reducir contaminación de datos de entrenamiento.', 'Recent tests to reduce training data contamination.') },
    { name: 'Terminal-Bench', use: t('Capacidad de actuar como agente usando terminal y herramientas.', 'Ability to act as an agent using terminal and tools.') },
    { name: 'GPQA Diamond', use: t('Razonamiento científico difícil con preguntas de nivel experto.', 'Difficult scientific reasoning with expert-level questions.') },
    { name: 'SciCode', use: t('Programación científica y resolución de problemas técnicos.', 'Scientific programming and technical problem solving.') },
    { name: 'Docs oficiales', use: t('Precios, contexto máximo, licencias, disponibilidad y límites publicados por cada proveedor.', 'Prices, max context, licenses, availability and limits published by each provider.') },
  ];

  const BENCHMARKS = [
    [t('Programación real', 'Real coding'), t('SWE-bench Verified / Lite / Multilingual: tareas reales de software y resolución de incidencias.', 'SWE-bench Verified / Lite / Multilingual: real software tasks and issue resolution.')],
    [t('Programación competitiva', 'Competitive programming'), t('LiveCodeBench: problemas de código recientes y menos contaminados.', 'LiveCodeBench: recent and less contaminated code problems.')],
    [t('Agente en terminal', 'Terminal agent'), t('Terminal-Bench: trabajo con comandos, herramientas y entorno real.', 'Terminal-Bench: work with commands, tools and real environment.')],
    [t('Razonamiento científico', 'Scientific reasoning'), t('GPQA Diamond: preguntas científicas complejas y verificables.', 'GPQA Diamond: complex and verifiable scientific questions.')],
    [t('Programación científica', 'Scientific programming'), t('SciCode: código técnico, ciencia computacional y razonamiento aplicado.', 'SciCode: technical code, computational science and applied reasoning.')],
    [t('Preferencia humana', 'Human preference'), t('LMArena: batallas ciegas y preferencia de usuarios, útil como señal secundaria.', 'LMArena: blind battles and user preference, useful as a secondary signal.')],
  ];

  const translatedWeights = RANKING_WEIGHTS.map(item => {
    const tr = WEIGHT_TRANSLATIONS[item.label];
    return {
      label: tr ? t(tr.label[0], tr.label[1]) : item.label,
      weight: item.weight,
      detail: tr ? t(tr.detail[0], tr.detail[1]) : item.detail,
    };
  });

  return (
    <div class="card-l-corner bg-dark/40 rounded-lg p-6 font-mono">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 class="text-gold text-sm uppercase tracking-wider mb-4">// {t('Fórmula de puntuación', 'Scoring formula')}</h3>
          <div class="space-y-3">
            {translatedWeights.map(item => (
              <div class="border border-dark-border/70 rounded p-3 bg-black/20">
                <div class="flex items-center justify-between gap-4">
                  <span class="text-fg text-sm font-bold">{item.label}</span>
                  <span class="text-gold text-sm font-bold">{item.weight}%</span>
                </div>
                <p class="text-gray-text text-xs mt-1 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 class="text-gold text-sm uppercase tracking-wider mb-4">// {t('Pruebas traducidas', 'Translated benchmarks')}</h3>
          <div class="space-y-3">
            {BENCHMARKS.map(([label, description]) => (
              <div class="border border-dark-border/70 rounded p-3 bg-black/20">
                <div class="text-fg text-sm font-bold">{label}</div>
                <p class="text-gray-text text-xs mt-1 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div class="mt-8">
        <h3 class="text-gold text-sm uppercase tracking-wider mb-4">// {t('Fuentes usadas para contrastar el ranking', 'Sources used to cross-reference the ranking')}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SOURCES.map(source => (
            <div class="border border-dark-border/70 rounded p-3 bg-black/20">
              <div class="text-fg text-sm font-bold">{source.name}</div>
              <p class="text-gray-text text-xs mt-1 leading-relaxed">{source.use}</p>
            </div>
          ))}
        </div>
      </div>

      <p class="mt-6 text-xs text-gray-text leading-relaxed">
        // {t('Nota: el ranking prioriza señales independientes y verificables. Cuando falta una prueba, el modelo recibe una menor confianza para evitar inflar resultados con datos incompletos. Los nombres oficiales de pruebas se mantienen cuando son marcas o datasets reconocidos, pero su explicación aparece en español.', 'Note: the ranking prioritizes independent and verifiable signals. When a test is missing, the model receives lower confidence to avoid inflating results with incomplete data. Official test names are kept when they are recognized brands or datasets, but their explanation appears in English.')}
      </p>
    </div>
  );
}
