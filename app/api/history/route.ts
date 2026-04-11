import { NextResponse } from 'next/server';
import { parseHistoryCSV, calculateFrequencies, calculateGaps, calculateDreamFrequencies, SHEETS_CSV_URL } from '../../../lib/historyService';

/**
 * GET /api/history
 *
 * Proxy server-side al Google Sheets público con los resultados históricos.
 * Evita problemas de CORS y cachea la respuesta 1 hora (revalidate).
 */
export async function GET() {
  try {
    const response = await fetch(SHEETS_CSV_URL, {
      next: { revalidate: 3600 }, // Cache 1 hora en el servidor
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Error al obtener datos de Google Sheets' },
        { status: 502 }
      );
    }

    const csv = await response.text();
    const draws = parseHistoryCSV(csv);
    const frequencies = calculateFrequencies(draws);
    const gaps = calculateGaps(draws);
    const dreamFrequencies = calculateDreamFrequencies(draws);

    return NextResponse.json({
      totalDraws: draws.length,
      lastUpdate: draws[0]?.date ?? null,
      draws,
      frequencies,
      gaps,
      dreamFrequencies,
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar los datos históricos' },
      { status: 500 }
    );
  }
}
