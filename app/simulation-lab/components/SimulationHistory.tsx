'use client';

import React from 'react';
import { History, Trash2, ChevronRight } from 'lucide-react';
import { SimulationResult } from '@/lib/services/persistenceService';

interface SimulationHistoryProps {
  results: SimulationResult[];
  onSelect: (result: SimulationResult) => void;
  onClear: () => void;
}

export function SimulationHistory({ results, onSelect, onClear }: SimulationHistoryProps) {
  if (results.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <History className="w-4 h-4" />
          Recent Runs
        </h2>
        <button 
          onClick={onClear}
          className="p-1 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded text-slate-400 hover:text-rose-500 transition-colors"
          title="Clear History"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        {results.map((res) => (
          <button
            key={res.id}
            onClick={() => onSelect(res)}
            className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border border-slate-100 dark:border-slate-800 transition-all group"
          >
            <div className="text-left">
              <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                {res.type}
              </div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {new Date(res.timestamp).toLocaleDateString()} {new Date(res.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}
