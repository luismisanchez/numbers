"use client";

import { useState, useEffect } from 'react';
import type { HistoricalDraw } from './historyService';

export interface HistoryData {
  totalDraws: number;
  lastUpdate: string | null;
  draws: HistoricalDraw[];
  frequencies: Record<number, number>;
  gaps: Record<number, number>;
  dreamFrequencies: Record<number, number>;
}

export interface UseHistoryResult {
  /** Datos históricos cargados */
  data: HistoryData | null;
  /** true mientras se están cargando los datos */
  isLoading: boolean;
  /** Error si lo hay */
  error: string | null;
  /** Recargar datos manualmente */
  refresh: () => void;
}

/**
 * Hook que carga los datos históricos de EuroDreams desde la API
 * (que a su vez lee el Google Sheets en tiempo real).
 */
export function useHistory(): UseHistoryResult {
  const [data, setData] = useState<HistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/history');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, error, refresh: fetchData };
}
