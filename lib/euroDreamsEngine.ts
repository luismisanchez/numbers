// Motor Estadístico "Frankenstein v4" para EuroDreams
// Se adapta dinámicamente con datos históricos en tiempo real.
// 9 reglas con pesos por frecuencia histórica (máx 42 puntos).

export interface RuleScore {
  /** Puntos base obtenidos (0, 1 o 2) */
  points: number;
  /** Puntos base máximos */
  max: 2;
  /** Multiplicador por frecuencia histórica */
  weight: number;
  /** Puntos ponderados (points × weight) */
  weighted: number;
  /** Máximo ponderado (max × weight) */
  weightedMax: number;
}

// Pesos por frecuencia histórica de cumplimiento (≥1pt)
// Esencial (>90%): ×3 | Frecuente (75-90%): ×2 | Variable (<75%): ×1
const RULE_WEIGHTS = {
  sum: 1,              // ~65% cumplimiento     → Variable
  parity: 2,           // ~80% cumplimiento     → Frecuente
  decades: 3,          // ~91% cumplimiento     → Esencial
  consecutiveness: 2,  // ~87% cumplimiento     → Frecuente
  endings: 3,          // ~97% cumplimiento     → Esencial
  columns: 2,          // ~76% cumplimiento     → Frecuente
  rows: 3,             // ~94% cumplimiento     → Esencial
  gaps: 3,             // ~90% cumplimiento     → Esencial
  neighbors: 2,        // ~80% cumplimiento     → Frecuente
} as const;

// Máximo ponderado: 2×(4×3 + 4×2 + 1×1) = 42
export const MAX_WEIGHTED_SCORE = 2 * (
  RULE_WEIGHTS.sum + RULE_WEIGHTS.parity + RULE_WEIGHTS.decades +
  RULE_WEIGHTS.consecutiveness + RULE_WEIGHTS.endings + RULE_WEIGHTS.columns +
  RULE_WEIGHTS.rows + RULE_WEIGHTS.gaps + RULE_WEIGHTS.neighbors
);

export interface EuroDreamsStats {
  sum: number;
  evens: number;
  odds: number;
  decadePattern: string;
  consecCount: number;
  uniqueEndings: number;
  colPattern: string;
  uniqueRows: number;
  meanGap: number;
  maxGap: number;
  neighborPairs: number;
  /** Puntuación individual por regla (con pesos) */
  scores: {
    sum: RuleScore;
    parity: RuleScore;
    decades: RuleScore;
    consecutiveness: RuleScore;
    endings: RuleScore;
    columns: RuleScore;
    rows: RuleScore;
    gaps: RuleScore;
    neighbors: RuleScore;
  };
  /** Puntuación total ponderada (sobre 42) */
  totalScore: number;
}

// ─── Utilidades de grid 8×5 ─────────────────────────────────────

/**
 * Comprueba si dos números son vecinos físicos en el grid 8×5
 * (adyacentes horizontal, vertical o diagonalmente).
 */
function areNeighbors(a: number, b: number): boolean {
  const rowA = Math.floor((a - 1) / 5);
  const colA = (a - 1) % 5;
  const rowB = Math.floor((b - 1) / 5);
  const colB = (b - 1) % 5;
  const dr = Math.abs(rowA - rowB);
  const dc = Math.abs(colA - colB);
  return dr <= 1 && dc <= 1 && !(dr === 0 && dc === 0);
}

/**
 * Cuenta parejas de vecinos físicos en una combinación.
 */
function countNeighborPairs(arr: number[]): number {
  let pairs = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (areNeighbors(arr[i], arr[j])) pairs++;
    }
  }
  return pairs;
}

// ─── Scoring rápido (para generación) ───────────────────────────

function scoreCombo(arr: number[]): number {
  let score = 0;

  // 1. Suma (×1) — Ideal [110-136] → 2pts | Aceptable [100-145] → 1pt
  const sum = arr.reduce((a, b) => a + b, 0);
  if (sum >= 110 && sum <= 136) score += 2 * RULE_WEIGHTS.sum;
  else if (sum >= 100 && sum <= 145) score += 1 * RULE_WEIGHTS.sum;

  // 2. Paridad (×2) — Ideal 3P/3I → 2pts | Aceptable 2/4 ó 4/2 → 1pt
  const evens = arr.filter(n => n % 2 === 0).length;
  if (evens === 3) score += 2 * RULE_WEIGHTS.parity;
  else if (evens === 2 || evens === 4) score += 1 * RULE_WEIGHTS.parity;

  // 3. Décadas (×3) — Ideal [2-2-1-1] → 2pts | Aceptable → 1pt
  const decades = [0, 0, 0, 0];
  arr.forEach(n => {
    if (n <= 10) decades[0]++;
    else if (n <= 20) decades[1]++;
    else if (n <= 30) decades[2]++;
    else decades[3]++;
  });
  const decadePattern = decades.sort((a, b) => b - a).join('-');
  if (decadePattern === '2-2-1-1') score += 2 * RULE_WEIGHTS.decades;
  else if (decadePattern === '3-2-1-0' || decadePattern === '3-1-1-1' || decadePattern === '2-2-2-0') score += 1 * RULE_WEIGHTS.decades;

  // 4. Consecutividad (×2) — Ideal 0 → 2pts | Aceptable 1 → 1pt
  let consecCount = 0;
  for (let j = 0; j < 5; j++) {
    if (arr[j + 1] === arr[j] + 1) consecCount++;
  }
  if (consecCount === 0) score += 2 * RULE_WEIGHTS.consecutiveness;
  else if (consecCount === 1) score += 1 * RULE_WEIGHTS.consecutiveness;

  // 5. Terminaciones (×3) — Ideal 5 → 2pts | Aceptable 4 ó 6 → 1pt
  const uniqueEndings = new Set(arr.map(n => n % 10)).size;
  if (uniqueEndings === 5) score += 2 * RULE_WEIGHTS.endings;
  else if (uniqueEndings === 4 || uniqueEndings === 6) score += 1 * RULE_WEIGHTS.endings;

  // 6. Columnas (×2) — Ideal [1-1-2-2] → 2pts | Aceptable → 1pt
  const colCounts: Record<number, number> = {};
  arr.forEach(n => {
    const c = (n - 1) % 5 + 1;
    colCounts[c] = (colCounts[c] || 0) + 1;
  });
  const colPattern = Object.values(colCounts).sort().join('-');
  if (colPattern === '1-1-2-2') score += 2 * RULE_WEIGHTS.columns;
  else if (colPattern === '1-2-3' || colPattern === '1-1-1-1-2') score += 1 * RULE_WEIGHTS.columns;

  // 7. Filas (×3) — Ideal 5 → 2pts | Aceptable 4 ó 6 → 1pt
  const uniqueRows = new Set(arr.map(n => Math.floor((n - 1) / 5) + 1)).size;
  if (uniqueRows === 5) score += 2 * RULE_WEIGHTS.rows;
  else if (uniqueRows === 4 || uniqueRows === 6) score += 1 * RULE_WEIGHTS.rows;

  // 8. Gaps (×3) — Ideal mean∈[5,10] & max≤15 → 2pts | Aceptable → 1pt
  const gaps: number[] = [];
  for (let j = 0; j < 5; j++) gaps.push(arr[j + 1] - arr[j]);
  const meanGap = gaps.reduce((a, b) => a + b, 0) / 5;
  const maxGap = Math.max(...gaps);
  if (meanGap >= 5 && meanGap <= 10 && maxGap <= 15) score += 2 * RULE_WEIGHTS.gaps;
  else if (meanGap >= 4 && meanGap <= 12 && maxGap <= 20) score += 1 * RULE_WEIGHTS.gaps;

  // 9. Vecinos grid (×2) — Ideal ≤2 → 2pts | Aceptable 3 → 1pt
  const neighborPairs = countNeighborPairs(arr);
  if (neighborPairs <= 2) score += 2 * RULE_WEIGHTS.neighbors;
  else if (neighborPairs === 3) score += 1 * RULE_WEIGHTS.neighbors;

  return score;
}

// ─── Pesos adaptativos ──────────────────────────────────────────

/**
 * Calcula pesos de selección para cada número [1-40] basados en
 * la frecuencia histórica. Usa regresión suave a la media:
 * los números infrarrepresentados reciben más peso.
 *
 * Fórmula: peso = (frecuencia_esperada / frecuencia_real) ^ suavizado
 * Con caps [0.5, 2.0] para evitar extremos.
 */
export function calculateNumberWeights(
  frequencies: Record<number, number>,
  totalDraws: number,
  smoothing = 0.5,
): number[] {
  const expectedFreq = (totalDraws * 6) / 40;
  const weights: number[] = [];

  for (let n = 1; n <= 40; n++) {
    const actual = frequencies[n] || 0;
    if (actual === 0) {
      weights.push(2.0); // Máximo peso si nunca ha salido
    } else {
      // ratio > 1 → número frío (infrarrepresentado) → más peso
      // ratio < 1 → número caliente (sobrerrepresentado) → menos peso
      const ratio = expectedFreq / actual;
      const weight = Math.pow(ratio, smoothing);
      weights.push(Math.max(0.5, Math.min(2.0, weight))); // Clamp [0.5, 2.0]
    }
  }

  return weights;
}

/**
 * Selecciona un número aleatorio de [1-40] usando la tabla de pesos.
 * Selección por ruleta ponderada.
 */
function weightedRandomNumber(weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;

  for (let i = 0; i < 40; i++) {
    rand -= weights[i];
    if (rand <= 0) return i + 1;
  }

  return 40;
}

// ─── Generación ─────────────────────────────────────────────────

export interface HistoricalInput {
  /** Frecuencia de aparición de cada número (1-40) */
  frequencies?: Record<number, number>;
  /** Frecuencia de cada Número Sueño (1-5) */
  dreamFrequencies?: Record<number, number>;
  /** Total de sorteos en el histórico */
  totalDraws?: number;
}

/**
 * Genera una combinación de 6 números (1-40) optimizada según
 * 9 reglas estadísticas. Busca combinaciones en el rango de
 * puntuación [11-15] que corresponde al 60.2% de sorteos reales
 * (zona central de la campana de distribución histórica).
 *
 * Si se proporcionan datos históricos, usa pesos adaptativos
 * para favorecer números infrarrepresentados.
 */
export function generateFrankenstein(
  maxIterations = 50_000,
  historical?: HistoricalInput,
): number[] {
  const TARGET_MIN = 25;
  const TARGET_MAX = 35;

  // Precalcular tabla de pesos si hay datos históricos
  const weights = (historical?.frequencies && historical.totalDraws)
    ? calculateNumberWeights(historical.frequencies, historical.totalDraws)
    : null;

  let bestCombo: number[] | null = null;
  let bestDistance = Infinity; // Distancia al centro del rango objetivo (13)

  for (let i = 0; i < maxIterations; i++) {
    const nums = new Set<number>();

    if (weights) {
      // Generación ponderada: números fríos tienen más probabilidad
      while (nums.size < 6) nums.add(weightedRandomNumber(weights));
    } else {
      // Generación uniforme (fallback sin datos históricos)
      while (nums.size < 6) nums.add(Math.floor(Math.random() * 40) + 1);
    }

    const arr = Array.from(nums).sort((a, b) => a - b);
    const score = scoreCombo(arr);

    // Si cae en el rango objetivo [11-15], aceptar inmediatamente
    if (score >= TARGET_MIN && score <= TARGET_MAX) return arr;

    // Fallback: guardar la más cercana al centro del rango (30)
    const distance = Math.abs(score - 30);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestCombo = arr;
    }
  }

  return bestCombo || [];
}

/**
 * Genera un "Número Sueño" (1-5).
 * Si se proporcionan frecuencias históricas, las usa como pesos.
 * Si no, usa la distribución por defecto calibrada.
 */
export function generateDream(historical?: HistoricalInput): number {
  let dreamWeights: { dream: number; weight: number }[];

  if (historical?.dreamFrequencies) {
    // Pesos dinámicos basados en frecuencia histórica real
    dreamWeights = [1, 2, 3, 4, 5].map(d => ({
      dream: d,
      weight: historical.dreamFrequencies![d] || 1,
    }));
  } else {
    // Fallback estático calibrado
    dreamWeights = [
      { dream: 1, weight: 23 },
      { dream: 2, weight: 17 },
      { dream: 3, weight: 22 },
      { dream: 4, weight: 19 },
      { dream: 5, weight: 19 },
    ];
  }

  const totalWeight = dreamWeights.reduce((sum, w) => sum + w.weight, 0);
  let rand = Math.random() * totalWeight;

  for (const { dream, weight } of dreamWeights) {
    rand -= weight;
    if (rand <= 0) return dream;
  }

  return 1;
}

// ─── Estadísticas completas ─────────────────────────────────────

/**
 * Calcula las estadísticas completas y la puntuación ponderada
 * de una combinación para la auditoría matemática.
 */
export function calculateStats(arr: number[]): EuroDreamsStats | null {
  if (!arr || arr.length === 0) return null;

  // Valores brutos
  const sum = arr.reduce((a, b) => a + b, 0);
  const evens = arr.filter(n => n % 2 === 0).length;

  const decades = [0, 0, 0, 0];
  arr.forEach(n => {
    if (n <= 10) decades[0]++;
    else if (n <= 20) decades[1]++;
    else if (n <= 30) decades[2]++;
    else decades[3]++;
  });
  const decadePattern = [...decades].sort((a, b) => b - a).join('-');

  let consecCount = 0;
  for (let j = 0; j < 5; j++) {
    if (arr[j + 1] === arr[j] + 1) consecCount++;
  }

  const uniqueEndings = new Set(arr.map(n => n % 10)).size;

  const colCounts: Record<number, number> = {};
  arr.forEach(n => {
    const c = (n - 1) % 5 + 1;
    colCounts[c] = (colCounts[c] || 0) + 1;
  });
  const colPattern = Object.values(colCounts).sort().join('-');
  const uniqueRows = new Set(arr.map(n => Math.floor((n - 1) / 5) + 1)).size;

  const gapsArr: number[] = [];
  for (let j = 0; j < 5; j++) gapsArr.push(arr[j + 1] - arr[j]);
  const meanGap = gapsArr.reduce((a, b) => a + b, 0) / 5;
  const maxGap = Math.max(...gapsArr);

  const neighborPairs = countNeighborPairs(arr);

  // Puntuaciones individuales con pesos
  const mkScore = (pts: number, w: number): RuleScore => ({
    points: pts, max: 2, weight: w, weighted: pts * w, weightedMax: 2 * w,
  });

  const scoreSum = mkScore(sum >= 110 && sum <= 136 ? 2 : sum >= 100 && sum <= 145 ? 1 : 0, RULE_WEIGHTS.sum);
  const scoreParity = mkScore(evens === 3 ? 2 : (evens === 2 || evens === 4) ? 1 : 0, RULE_WEIGHTS.parity);
  const scoreDecades = mkScore(
    decadePattern === '2-2-1-1' ? 2
      : (decadePattern === '3-2-1-0' || decadePattern === '3-1-1-1' || decadePattern === '2-2-2-0') ? 1
      : 0,
    RULE_WEIGHTS.decades,
  );
  const scoreConsec = mkScore(consecCount === 0 ? 2 : consecCount === 1 ? 1 : 0, RULE_WEIGHTS.consecutiveness);
  const scoreEndings = mkScore(uniqueEndings === 5 ? 2 : (uniqueEndings === 4 || uniqueEndings === 6) ? 1 : 0, RULE_WEIGHTS.endings);
  const scoreColumns = mkScore(colPattern === '1-1-2-2' ? 2 : (colPattern === '1-2-3' || colPattern === '1-1-1-1-2') ? 1 : 0, RULE_WEIGHTS.columns);
  const scoreRows = mkScore(uniqueRows === 5 ? 2 : (uniqueRows === 4 || uniqueRows === 6) ? 1 : 0, RULE_WEIGHTS.rows);
  const scoreGaps = mkScore(
    (meanGap >= 5 && meanGap <= 10 && maxGap <= 15) ? 2
      : (meanGap >= 4 && meanGap <= 12 && maxGap <= 20) ? 1
      : 0,
    RULE_WEIGHTS.gaps,
  );
  const scoreNeighbors = mkScore(neighborPairs <= 2 ? 2 : neighborPairs === 3 ? 1 : 0, RULE_WEIGHTS.neighbors);

  const totalScore =
    scoreSum.weighted + scoreParity.weighted + scoreDecades.weighted +
    scoreConsec.weighted + scoreEndings.weighted + scoreColumns.weighted +
    scoreRows.weighted + scoreGaps.weighted + scoreNeighbors.weighted;

  return {
    sum,
    evens,
    odds: 6 - evens,
    decadePattern,
    consecCount,
    uniqueEndings,
    colPattern,
    uniqueRows,
    meanGap: Math.round(meanGap * 10) / 10,
    maxGap,
    neighborPairs,
    scores: {
      sum: scoreSum,
      parity: scoreParity,
      decades: scoreDecades,
      consecutiveness: scoreConsec,
      endings: scoreEndings,
      columns: scoreColumns,
      rows: scoreRows,
      gaps: scoreGaps,
      neighbors: scoreNeighbors,
    },
    totalScore,
  };
}
