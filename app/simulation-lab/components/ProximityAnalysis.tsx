'use client';

import React from 'react';
import { Target, Trophy, Info } from 'lucide-react';

interface ProximityAnalysisProps {
  data: {
    hits: number[];
    topPicks: { combo: number[], score: number }[];
  };
}

export function ProximityAnalysis({ data }: ProximityAnalysisProps) {
  const { hits, topPicks } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-rose-500" />
        <h2 className="text-lg font-semibold">Análisis de Cercanía</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hit Counts */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Distribución de Aciertos
          </h3>
          <div className="space-y-3">
            {[3, 4, 5, 6].map(h => (
              <div key={h} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${h >= 5 ? 'bg-amber-500' : 'bg-slate-400'}`} />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {h} Aciertos
                  </span>
                </div>
                <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                  {hits[h].toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[10px] text-slate-400 leading-relaxed italic">
            Los "Casi Aciertos" (3 o más números) muestran qué tan cerca se quedó el motor del resultado real en el pasado. Esto ayuda a entender la volatilidad del juego.
          </p>
        </div>

        {/* Top Picks */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Mejores Combinaciones Sugeridas
          </h3>
          <div className="space-y-2">
            {topPicks.map((pick, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800">
                <div className="flex gap-1">
                  {pick.combo.map(n => (
                    <span key={n} className="w-6 h-6 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      {n}
                    </span>
                  ))}
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">
                  {pick.score} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
