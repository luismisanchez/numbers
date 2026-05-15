'use client';

import React from 'react';
import { Settings2, Zap, Shuffle, Layers } from 'lucide-react';

interface SimulationControlsProps {
  logic: 'random' | 'weighted' | 'hybrid';
  setLogic: (logic: 'random' | 'weighted' | 'hybrid') => void;
  count: number;
  setCount: (count: number) => void;
  onRun: () => void;
  disabled?: boolean;
  isRunning?: boolean;
  progress?: number;
}

export function SimulationControls({
  logic,
  setLogic,
  count,
  setCount,
  onRun,
  disabled,
  isRunning,
  progress
}: SimulationControlsProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Settings2 className="w-5 h-5 text-purple-500" />
        Simulador de Probabilidad
      </h2>

      <div className="space-y-4">
        {/* Logic Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Método de Generación
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setLogic('random')}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-[10px] font-bold transition-all ${
                logic === 'random' 
                  ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800' 
                  : 'border-slate-100 dark:border-slate-800 text-slate-400'
              }`}
            >
              <Shuffle className="w-4 h-4" />
              PURO AZAR
            </button>
            <button
              onClick={() => setLogic('weighted')}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-[10px] font-bold transition-all ${
                logic === 'weighted' 
                  ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800' 
                  : 'border-slate-100 dark:border-slate-800 text-slate-400'
              }`}
            >
              <Zap className="w-4 h-4" />
              OPTIMIZADO
            </button>
            <button
              onClick={() => setLogic('hybrid')}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-[10px] font-bold transition-all ${
                logic === 'hybrid' 
                  ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800' 
                  : 'border-slate-100 dark:border-slate-800 text-slate-400'
              }`}
            >
              <Layers className="w-4 h-4" />
              HÍBRIDO
            </button>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            {logic === 'random' && 'Genera números sin ningún criterio estadístico.'}
            {logic === 'weighted' && 'Usa el motor para favorecer números "fríos" (que salen menos).'}
            {logic === 'hybrid' && 'Mezcla números al azar con optimizados para ver el contraste.'}
          </p>
        </div>

        {/* Sample Size */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <label className="text-slate-700 dark:text-slate-300">Cantidad de Pruebas</label>
            <span className="text-purple-600 font-mono">{count.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="1000"
            max="50000"
            step="1000"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

        <button
          disabled={disabled || isRunning}
          onClick={onRun}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold py-3 px-6 rounded-lg transition-all"
        >
          {isRunning ? (
            <div className="flex flex-col items-center w-full gap-1">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
                <span>Simulando...</span>
              </div>
              <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden mt-1">
                <div 
                  className="bg-white h-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-current" />
              Lanzar Simulación
            </>
          )}
        </button>
      </div>
    </div>
  );
}
