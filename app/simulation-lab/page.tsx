'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, Play, Info, AlertCircle, History, BarChart3, RotateCcw, ChevronLeft } from 'lucide-react';
import { parseHistoryCSV, filterHistoryByDate, HistoricalDraw, SHEETS_CSV_URL } from '@/lib/historyService';
import { useSimulator } from '@/lib/hooks/useSimulator';
import { DisclaimerModal } from './components/DisclaimerModal';
import { DistributionChart } from './components/DistributionChart';
import { SimulationControls } from './components/SimulationControls';
import { ProximityAnalysis } from './components/ProximityAnalysis';
import { SimulationHistory } from './components/SimulationHistory';
import { persistenceService, SimulationResult } from '@/lib/services/persistenceService';

export default function SimulationLabPage() {
  const [history, setHistory] = useState<HistoricalDraw[]>([]);
  const [targetDate, setTargetDate] = useState<string>('');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [simHistory, setSimHistory] = useState<SimulationResult[]>([]);

  // Monte Carlo state
  const [simLogic, setSimLogic] = useState<'random' | 'weighted' | 'hybrid'>('hybrid');
  const [simCount, setSimCount] = useState(10000);
  const [lastAction, setLastAction] = useState<'backtest' | 'simulation' | null>(null);

  const { startBacktest, startSimulation, isRunning, progress, result, error } = useSimulator();

  // Load history on mount
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(SHEETS_CSV_URL);
        const csv = await res.text();
        const draws = parseHistoryCSV(csv);
        setHistory(draws);
        if (draws.length > 0) {
          setTargetDate(draws[0].date);
        }
        setSimHistory(persistenceService.getResults());
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setIsLoadingHistory(false);
      }
    }
    loadData();
  }, []);

  const filteredHistory = useMemo(() => {
    return filterHistoryByDate(history, targetDate);
  }, [history, targetDate]);

  const filteredCount = filteredHistory.length;
  const isInsufficient = filteredCount < 50 && targetDate !== '' && !isLoadingHistory;

  // Save results to history
  useEffect(() => {
    if (result && !isRunning) {
      const newResult: SimulationResult = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        type: lastAction === 'backtest' ? 'weighted' : simLogic,
        distribution: result.distribution,
        summary: {
          mean: result.mean,
          sd: result.sd,
          elapsedMs: result.elapsedMs
        },
        config: lastAction === 'backtest' ? { targetDate } : { simLogic, simCount }
      };
      persistenceService.saveResult(newResult);
      setSimHistory(persistenceService.getResults());
    }
  }, [result, isRunning]);

  const handleRunBacktest = () => {
    if (!hasAcceptedDisclaimer) {
      setLastAction('backtest');
      setShowDisclaimer(true);
      return;
    }
    setLastAction('backtest');
    const actualDraw = history.find(d => d.date === targetDate);
    if (filteredCount < 50) return;
    startBacktest({ historicalData: filteredHistory, winningNums: actualDraw?.nums || [], sampleSize: 100000 });
  };

  const handleRunSimulation = () => {
    if (!hasAcceptedDisclaimer) {
      setLastAction('simulation');
      setShowDisclaimer(true);
      return;
    }
    setLastAction('simulation');
    startSimulation({ count: simCount, logic: simLogic, historicalData: history });
  };

  const handleAcceptDisclaimer = () => {
    setHasAcceptedDisclaimer(true);
    setShowDisclaimer(false);
    
    // Use timeout to ensure state updates or pass variables directly
    if (lastAction === 'backtest') {
      const filtered = filterHistoryByDate(history, targetDate);
      const actualDraw = history.find(d => d.date === targetDate);
      if (filtered.length >= 50) {
        startBacktest({ historicalData: filtered, winningNums: actualDraw?.nums || [], sampleSize: 100000 });
      }
    } else if (lastAction === 'simulation') {
      startSimulation({ count: simCount, logic: simLogic, historicalData: history });
    }
  };

  const handleClearHistory = () => {
    persistenceService.clearResults();
    setSimHistory([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 pb-20">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors group"
              title="Volver al inicio"
            >
              <ChevronLeft className="w-6 h-6 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <BarChart3 className="text-blue-600 w-8 h-8" />
                Laboratorio de Simulación
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                Comprueba el rendimiento del motor y visualiza la distribución de probabilidades.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
            <History className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {history.length} Sorteos Cargados
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3 text-rose-700 dark:text-rose-400 text-sm font-medium">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
            <button onClick={() => window.location.reload()} className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 hover:underline">
              <RotateCcw className="w-3 h-3" /> Reiniciar
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Máquina del Tiempo
              </h2>
              <div className="space-y-4">
                <p className="text-[10px] text-slate-500 leading-tight">
                  Selecciona una fecha pasada para ver cómo habría funcionado el motor ese día.
                </p>
                <select 
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {history.map(d => <option key={d.date} value={d.date}>{d.date}</option>)}
                </select>
                {isInsufficient && (
                  <div className="text-[10px] text-rose-500 font-medium flex gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" /> Datos insuficientes ({filteredCount} sorteos).
                  </div>
                )}
                <button
                  disabled={isRunning || isInsufficient || isLoadingHistory}
                  onClick={handleRunBacktest}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-bold py-2 px-4 rounded-lg text-xs transition-all"
                >
                  {isRunning && lastAction === 'backtest' ? `Ejecutando ${progress?.percent}%` : 'Validar Fecha'}
                </button>
              </div>
            </div>

            <SimulationControls 
              logic={simLogic} setLogic={setSimLogic} count={simCount} setCount={setSimCount}
              onRun={handleRunSimulation} disabled={isLoadingHistory}
              isRunning={isRunning && lastAction === 'simulation'} progress={progress?.percent}
            />

            <SimulationHistory 
              results={simHistory} 
              onSelect={(res) => {}} 
              onClear={handleClearHistory} 
            />
          </div>

          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 min-h-[500px]">
              {result ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Análisis de Distribución</h2>
                        <p className="text-xs text-slate-500">Método: {lastAction === 'backtest' ? 'Validación Histórica' : simLogic}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tiempo de Proceso</div>
                      <div className="text-sm font-mono font-bold text-slate-900 dark:text-white">{result.elapsedMs}ms</div>
                    </div>
                  </div>

                  <DistributionChart 
                    distribution={result.distribution} 
                    winnerScore={(result as any).winnerScore}
                  />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <StatCard label="Puntuación Media" value={result.mean ? result.mean.toFixed(2) : 'N/A'} />
                    <StatCard label="Zona Objetivo" value="Ideal" sub="Puntos 25-35" highlight />
                    <StatCard label="Puntos Ganador" value={(result as any).winnerScore ?? 'N/A'} />
                    <StatCard label="Muestra" value="100k" />
                  </div>

                  {(result as any).proximity && (
                    <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
                      <ProximityAnalysis data={(result as any).proximity} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl animate-pulse" />
                    <div className="relative bg-slate-50 dark:bg-slate-800 p-10 rounded-full border border-slate-100 dark:border-slate-700">
                      <BarChart3 className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                    </div>
                  </div>
                  <div className="max-w-xs">
                    <h3 className="text-slate-900 dark:text-white font-bold text-lg">Laboratorio Preparado</h3>
                    <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                      Selecciona una fecha para validar el motor o lanza una simulación para ver la campana de probabilidad en acción.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DisclaimerModal isOpen={showDisclaimer} onAccept={handleAcceptDisclaimer} />
    </div>
  );
}

function StatCard({ label, value, sub, highlight }: { label: string; value: string | number; sub?: string; highlight?: boolean }) {
  return (
    <div className={`p-5 rounded-2xl border transition-all ${highlight ? 'bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/50 shadow-green-100/50 dark:shadow-none' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800/50'}`}>
      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">{label}</div>
      <div className={`text-2xl font-black ${highlight ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>{value}</div>
      {sub && <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}
