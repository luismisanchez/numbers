"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  generateFrankenstein,
  generateDream,
  calculateStats,
  type EuroDreamsStats,
  type HistoricalInput,
} from './euroDreamsEngine';

export interface UseEuroDreamsResult {
  /** Los 6 números generados (1-40), ordenados de menor a mayor */
  combo: number[];
  /** Número Sueño (1-5) */
  dream: number | null;
  /** true mientras se está calculando una nueva combinación */
  isGenerating: boolean;
  /** Estadísticas / auditoría de la combinación actual */
  stats: EuroDreamsStats | null;
  /** Lanza una nueva generación (con feedback visual) */
  generate: () => void;
}

/**
 * Custom hook reutilizable que encapsula toda la lógica de generación
 * y estado del Generador EuroDreams.
 *
 * @param historical — datos históricos opcionales para adaptar la generación.
 * @param autoGenerate — si true (por defecto), genera una combinación al montar.
 * @param delay — milisegundos de retraso visual antes de mostrar el resultado (default 800).
 */
export function useEuroDreams(
  historical?: HistoricalInput | null,
  autoGenerate = true,
  delay = 800,
): UseEuroDreamsResult {
  const [combo, setCombo] = useState<number[]>([]);
  const [dream, setDream] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [stats, setStats] = useState<EuroDreamsStats | null>(null);

  const generate = useCallback(() => {
    setIsGenerating(true);
    setTimeout(() => {
      const hist = historical ?? undefined;
      const newCombo = generateFrankenstein(50_000, hist);
      setCombo(newCombo);
      setDream(generateDream(hist));
      setStats(calculateStats(newCombo));
      setIsGenerating(false);
    }, delay);
  }, [delay, historical]);

  useEffect(() => {
    if (autoGenerate) {
      generate();
    }
  }, [autoGenerate, generate]);

  return { combo, dream, isGenerating, stats, generate };
}
