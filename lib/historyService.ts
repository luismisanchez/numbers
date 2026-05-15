// Tipos y parseo de datos históricos de EuroDreams

export interface HistoricalDraw {
  date: string;
  nums: number[];
  dream: number;
}

const SHEETS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTZzm-CTUj3li4EdfW1ImthPdc0AGIymq8tbuwPiqjW0OL4F1MWO5G6PfPEtNvLJcY8MpJo4apayTip/pub?output=csv';

/**
 * Parsea el CSV del Google Sheets público.
 * Formato: FECHA,N1,N2,N3,N4,N5,N6,SUEÑO (con cabecera).
 * Los resultados están ordenados del más reciente al más antiguo.
 */
export function parseHistoryCSV(csv: string): HistoricalDraw[] {
  const lines = csv.trim().split('\n').filter(l => l.trim());

  return lines
    .slice(1) // Saltar cabecera
    .map(line => {
      // Limpiar \r y parsear
      const parts = line.replace(/\r/g, '').split(',');
      if (parts.length < 8) return null;

      const date = parts[0].trim();
      const nums = parts.slice(1, 7).map(n => parseInt(n, 10));
      const dream = parseInt(parts[7], 10);

      // Validar que todos los valores son números
      if (nums.some(isNaN) || isNaN(dream)) return null;

      return { date, nums: nums.sort((a, b) => a - b), dream };
    })
    .filter((d): d is HistoricalDraw => d !== null);
}

/**
 * Calcula la frecuencia de aparición de cada número (1-40)
 * en el histórico completo.
 */
export function calculateFrequencies(draws: HistoricalDraw[]): Record<number, number> {
  const freq: Record<number, number> = {};
  for (let i = 1; i <= 40; i++) freq[i] = 0;
  draws.forEach(d => d.nums.forEach(n => freq[n]++));
  return freq;
}

/**
 * Calcula cuántos sorteos han pasado desde la última aparición
 * de cada número (gap / "temperatura").
 */
export function calculateGaps(draws: HistoricalDraw[]): Record<number, number> {
  const gaps: Record<number, number> = {};
  for (let i = 1; i <= 40; i++) {
    for (let j = 0; j < draws.length; j++) {
      if (draws[j].nums.includes(i)) {
        gaps[i] = j;
        break;
      }
    }
    if (gaps[i] === undefined) gaps[i] = draws.length;
  }
  return gaps;
}

/**
 * Calcula la frecuencia de aparición de cada Número Sueño (1-5)
 * en el histórico completo.
 */
export function calculateDreamFrequencies(draws: HistoricalDraw[]): Record<number, number> {
  const freq: Record<number, number> = {};
  for (let i = 1; i <= 5; i++) freq[i] = 0;
  draws.forEach(d => freq[d.dream]++);
  return freq;
}

/**
 * Filtra el histórico para incluir solo sorteos realizados ANTES o EN una fecha dada.
 */
export function filterHistoryByDate(draws: HistoricalDraw[], targetDate: string): HistoricalDraw[] {
  if (!targetDate) return draws;

  const parse = (dateStr: string): number => {
    if (dateStr.includes('/')) {
      const [d, m, y] = dateStr.split('/').map(Number);
      return new Date(y, m - 1, d).getTime();
    }
    return new Date(dateStr).getTime();
  };

  const targetTime = parse(targetDate);
  return draws.filter(d => parse(d.date) <= targetTime);
}

export { SHEETS_CSV_URL };
