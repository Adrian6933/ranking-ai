# PLAN — Ranking IA: dejar el proyecto publicable

> Diagnóstico del estado actual (julio 2026) y hoja de ruta en sesiones de trabajo.
> No contiene código: es la planificación que se ejecutará a continuación.

---

## 1. Estado actual del proyecto

**Stack**: Astro 6 + React 19 + Tailwind v4 + Recharts. Sitio 100% estático (SSG).

### Qué está TERMINADO y funciona

- **Build de producción** pasa: `npm run build` genera **70 páginas estáticas** en ~10 s.
  - Páginas: `index`, `ranking`, `graficas`, `comparar`, `calculadoras`, `metodologia`, `glosario`, `acerca-de`, `favoritos`.
  - Rutas dinámicas: `modelo/[id]` (40 páginas, una por modelo) y `proveedor/[provider]` (15 páginas).
- **Arquitectura de datos**: `src/data/models.json` con **40 modelos** y 15 proveedores. Esquema completo (`sweBench`, `gpqa`, `terminalBench`, `sciCode`, `qualityIndex`, precios, contexto, velocidad, licencia, tier).
- **Fórmula de ranking transparente** en `src/lib/ranking.ts` (`getCompositeScore` con pesos publicados en Metodología).
- **Componentes React implementados** (28 `.tsx`): `FullRanking`, `ModelCard`, `ModelDetail`, `ModelCompare`, `ScatterPlot`, `Heatmap`, `TierList`, `SpeedChart`, `PricingComparison`, `ContextComparison`, `EvolutionTimeline`, `ProviderDistribution`, `ProviderProfile`, `Calculators`, `WeightCalculator`, `Methodology`, `Hero`, `ModelHighlights`, `Aside`, `TopBar`, `NavBar`, `CommandPalette` (⌘K), `FavoritesProvider`/`FavoritesList`, `BackToTop`, `ThemeProvider`, `ProviderIcon`, `ContextComparison`.
- **Internacionalización es/en** en `src/lib/i18n.ts` + diccionario inline en `AppLayout.astro` (`data-i18n`).
- **Tema claro/oscuro** con persistencia en `localStorage` (sin flash, script `is:inline`).
- **Persistencia local**: favoritos, tema, idioma, aside colapsado.
- **Iconos de proveedor** propios en `public/icons/` (15 SVG).
- **Estilos**: Tailwind v4 con design tokens (gold, tiers, dot-pattern, card-l-corner, fade-in, `prefers-reduced-motion`).

### Qué FALTA para poder publicar

Hallazgos verificados leyendo el código (no asumidos):

1. **Tipos rotos**: `astro check` reporta **597 errores / 33 hints** (comprobado tras `npm i @astrojs/check typescript`). Casi todos por usar `class=` en componentes `.tsx` (React 19 espera `className`). El build SSG de Astro lo tolera y genera HTML, pero el chequeo de tipos no pasa — señal de código que no debería pasar a producción. Ejemplos confirmados en `FullRanking.tsx:106/112/119`, `ScatterPlot.tsx:127/210`, `ModelDetail.tsx:85/94`, `WeightCalculator.tsx:82/84/88`.
2. **React `key` prop ausente** en varios `.map()` (warnings en runtime y potencial mal render en reordenados/filtros):
   - `FullRanking.tsx:188` — `<tr>` de cada fila sin `key`.
   - `ModelDetail.tsx:173` — `<tr>` de `benchmarkRows.map` sin `key`.
   - `ScatterPlot.tsx:326` — `<span>` de la leyenda de proveedores sin `key`.
3. **Restos del starter Astro (sin usar)**: `src/components/Welcome.astro` (página demo "To get started…"), `src/layouts/Layout.astro` (layout base del template con `<meta>` genéricos), `src/assets/astro.svg` y `src/assets/background.svg`. `public/favicon.svg` sí es propio (logo `//` en dorado) — **ese se conserva**. `README.md` sigue siendo el del kit "basics" y `package.json` tiene `"name": "prueba-1"`.
4. **SEO/infra ausente** (verificado en `dist/` posterior al build): no hay `sitemap.xml`, ni `robots.txt`, ni `canonical`. Los `<meta>` básicos existen (`og:title/description/locale`, `theme-color`) en `AppLayout.astro:21-25` pero faltan Twitter Cards, `og:image` y JSON-LD. `astro.config.mjs` no define `site` (URL canónica), necesario para sitemap.
5. **i18n casi completo, a auditar**: el diccionario `PAGE_I18N` en `AppLayout.astro:39-111` traduce textos estáticos del shell vía `data-i18n`; las páginas dinámicas **sí** usan `useT()` de React (`ModelDetail.tsx:14`, `FullRanking.tsx:22`, `ScatterPlot.tsx:120`, etc.) y se traducen. Revisar que no queden strings literalmente en es sin pasar por `t()` y que el toggle cubra el 100% (auditoría en Sesión 4).
6. **Datos**: ver sección siguiente.
7. **Despliegue**: no hay workflow de CI/CD ni destino definido.

### Datos de modelos: ¿desactualizados a julio 2026?

**Al día en su fecha, pero NO verificables y con casos que requieren acción.**

- `releaseDate` más reciente del JSON: **2026-06** (`claude-fable-5`, `gpt-5-5-pro`). El hero (`Hero.tsx:9` "DATOS EN VIVO — JUNIO 2026"), el footer (`index.astro:40`) y `acerca-de` changelog (`acerca-de.astro:64`) dicen "junio 2026". Hoy es **julio 2026** → sello desactualizado un mes.
- **Entradas dudosas** (nombres que no existen en el catálogo real de proveedores a julio 2026 y parecen inventados/placeholders):
  - `big-pickle` — "Big Pickle", proveedor "OpenCode", inputPrice/outputPrice 0.00, `license: "Open"`. Es un modelo de relleno; además arrastra una entrada fantasma en `PROVIDER_COLORS` (`ScatterPlot.tsx:22` `'OpenCode': '#FFC107'`) y un icono `public/icons/opencode.svg`.
  - `claude-fable-5` (jun 2026), `claude-opus-4-8`, `claude-opus-4-7`, `claude-opus-4-6`, `claude-sonnet-4-6`, `claude-haiku-4-5` — nomenclatura "Claude 4.x" a verificar contra el catálogo real de Anthropic.
  - `gpt-5-5`, `gpt-5-5-pro`, `gpt-5-4`, `gpt-5-3-codex`, `gpt-5-2`, `gpt-5-1`, `gpt-5-1-codex-max`, `gpt-5-4-mini`, `gpt-5-4-nano`, `gpt-5-nano` — familia "GPT-5.x" a verificar.
  - `gemini-3-5-flash`, `gemini-3-1-pro`, `gemini-3-flash`, `glm-5-2`, `glm-5`, `qwen3-7-max`, `qwen3-6-plus`, `kimi-k2-6`, `grok-build-0-1`, `minimax-m2-7` — idem.
- **`liveCodeBench` es `null` en los 40 modelos**. Sin embargo: aparece en el esquema, en el glosario (`glosario.astro:50-56` con rango "5–60% · Fuente: livecodebench.github.io"), en `BENCHMARK_LABELS` (`ranking.ts:3`) y **NO** entra en `getCompositeScore` (no se usa en la fórmula). Decidir: poblarlo con datos reales **o** eliminar la columna, la entrada del glosario y la etiqueta.
- **Sin traza de fuente por modelo**: el sitio afirma "datos contrastados con Artificial Analysis, SWE-bench…" (`index.astro:39`, `acerca-de`) pero ninguna fila cita su procedencia. No hay campo `source`/`sources` en el JSON.
- **Coherencia menor**: `ModelDetail.tsx:20` define `qualityIndex` con `max: 65`, pero el JSON muestra `qualityIndex` hasta 59.9 y `RANKING_WEIGHTS` lo menciona; revisar que el `max` del radar sea correcto.

**Conclusión de datos**: el JSON está actualizado a junio 2026, pero a julio 2026 el sello está caducado, los valores no son trazables y varios nombres de modelo no se pueden verificar. Requieren auditoría + actualización antes de publicar.

---

## 2. Sesiones necesarias para dejarlo publicable

Cuatro sesiones de trabajo (la quinta, de despliegue, opcional si ya hay alojamiento). Cada sesión es **entregable y publishable por sí misma**.

### Sesión 1 — Auditoría y actualización de datos (bloqueante)

**Objetivo**: que `models.json` sea verificable y esté al día a julio 2026.

- Auditar los 40 modelos contra las fuentes citadas (Artificial Analysis, SWE-bench, LMArena, LiveBench, Terminal-Bench, GPQA Diamond, SciCode + docs oficiales de cada proveedor) y corroborar `name`, `provider`, `releaseDate`, los 5 benchmarks, precios, contexto, velocidad y `license`.
- Resolver entradas dudosas: eliminar o renombrar `big-pickle`; confirmar o corregir la familia "Claude Fable / Opus 4.x" y "GPT-5.x".
- Añadir modelos lanzados en **julio 2026** si los hay; reauditar tiers y `qualityIndex`.
- Decidir el destino de `liveCodeBench`: poblarlo con datos reales **o** eliminarlo del esquema, del glosario, de `BENCHMARK_LABELS` y de `RANKING_WEIGHTS`.
- Añadir un campo `source`/`sources` por modelo (o un CHANGELOG de revisión) para respaldar "datos contrastados".
- Actualizar el sello de revisión a "revisado julio 2026" (hero, footer, `acerca-de` changelog).

**Criterio de salida**: `models.json` sin campos `null` no justificados; cada cifra trazarable; sello de fecha correcto.

### Sesión 2 — Limpieza técnica, types y bugs de React (bloqueante)

**Objetivo**: `astro check` en verde, sin warnings de React y base de código sin restos del starter.

- Migrar `class=` → `className=` en los 28 componentes `.tsx` para que pasen los tipos de React 19 (597 errores → 0). Confirmados: `FullRanking.tsx`, `ScatterPlot.tsx`, `ModelDetail.tsx`, `WeightCalculator.tsx`, `Hero.tsx`, `Aside.tsx`, etc.
- Añadir `key` prop donde falta (warnings de React, corrompen render al reordenar/filtrar): `FullRanking.tsx:188` (`<tr>`), `ModelDetail.tsx:173` (`<tr>`), `ScatterPlot.tsx:326` (`<span>` leyenda). Barrer el resto de componentes con `grep` de `.map(` sin `key=`.
- Eliminar import muerto `LabelList` en `ScatterPlot.tsx:2`.
- Eliminar restos del template no usados: `src/components/Welcome.astro`, `src/layouts/Layout.astro`, `src/assets/astro.svg`, `src/assets/background.svg`. Conservar `public/favicon.svg` (es propio). Reescribir `README.md` (hoy es el del kit "basics") o borrarlo.
- Renombrar `name` de `package.json` (`prueba-1` → `ranking-ai`), ajustar `version`, fijar `engines`/Node.
- Revisar los 33 hints de `astro check` (accesibilidad/`img alt`, etc.).
- Confirmar que el build sigue generando las 70 páginas tras la limpieza.

**Criterio de salida**: `npx astro check` con **0 errors / 0 warnings**, build OK, sin warnings en consola del navegador.

### Sesión 3 — SEO y metadatos de publicación

**Objetivo**: indexable, compartible y con aspectos técnicos de SEO cubiertos.

- `sitemap.xml` (integración `@astrojs/sitemap`) y `robots.txt` en `public/`.
- `canonical` por página; ampliar `og:`, Twitter Cards, `og:image` y `theme-color` en `AppLayout.astro`.
- JSON-LD: `ItemList` en `/ranking`, `Product`/`Article` en `modelo/[id]`, `Organization`/`WebSite` en `index`.
- Favicon real (reemplazar el del starter por uno propio del proyecto).
- `hreflang` es/en y meta por página dinámica (`modelo/[id]`, `proveedor/[provider]` ya pasan `title`/`description`; extender).
- Lighthouse SEO + a11y como check de aceptación (objetivos: SEO 100, a11y ≥ 95).

**Criterio de salida**: sitemap válido, meta completo por URL, Lighthouse SEO verde.

### Sesión 4 — i18n completo y pulido de borde

**Objetivo**: que el toggle EN cubra todo el sitio y que la UX esté afinada.

- Extender el diccionario `data-i18n` a `modelo/[id]` y `proveedor/[provider]` (labels, encabezados, tier) hoy no traducidos.
- Revisar traducciones de `ranking`, `graficas`, `comparar`, `calculadoras` y los nombres de benchmarks en `BENCHMARK_LABELS`.
- Revisar mobile: aside colapsable, command palette, tablas `FullRanking` y comparador en pantallas pequeñas.
- Recorrer a11y: foco de `CommandPalette`/modales, roles, contraste en modo claro, `aria-label` de iconos-botón.
- Smoke test de rutas: 404 de modelo/proveedor inexistente, enlaces internos, favoritos entre recargas.

**Criterio de salida**: ningún texto sin traducir en EN, mobile usable, sin errores de a11y críticos.

### Sesión 5 (opcional) — CI/CD y despliegue

**Objetivo**: publicación automática y reproducible.

- GitHub Actions: `npm ci` → `astro check` → `npm run build` → deploy (Vercel/Netlify/Cloudflare Pages a decidir).
- Variables de entorno y `site` en `astro.config.mjs` para URLs canónicas y sitemap.
- Dominio propio + HTTPS; redirecciones si toca.
- Hook de "actualización mensual de datos" (issue/recordatorio) para sostener la cadencia declarada en `acerca-de`.

**Criterio de salida**: pipeline verde en PRs y en `main`; sitio en producción con dominio.

---

## 3. Resumen ejecutivo

| Aspecto                 | Estado                                                                 |
|-------------------------|------------------------------------------------------------------------|
| Funcionalidad           | Completa: build pasa, 70 páginas, features de ranking/i18n/favoritos   |
| Calidad de código       | 597 errores de tipos (`class` vs `className`) — bloqueante para limpio |
| Datos                   | A junio 2026; requieren auditoría y sello "julio 2026"                 |
| SEO/infra               | Ausente (sitemap, robots, JSON-LD, og:image)                           |
| i18n                    | Casi completo: shell vía `data-i18n`, dinámicas vía `useT()` (revisar 100%) |
| Despliegue              | No definido                                                            |

**Orden recomendado**: Sesión 1 → 2 → 3 → 4 (→ 5). Las sesiones 1 y 2 son bloqueantes; con 1+2+3 el sitio ya es publicable con calidad aceptable.