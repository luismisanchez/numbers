'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export function DisclaimerModal({ isOpen, onAccept }: DisclaimerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="bg-amber-50 dark:bg-amber-950/30 p-6 border-b border-amber-100 dark:border-amber-900/50 flex items-center gap-4">
          <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-full">
            <AlertTriangle className="text-amber-600 dark:text-amber-400 w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Aviso de Responsabilidad
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="prose prose-slate dark:prose-invert">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              IMPORTANTE: La lotería es un juego de puro azar.
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Este Laboratorio de Simulación es una <strong>herramienta estadística</strong> para análisis histórico y visualización. No predice resultados futuros ni garantiza premios.
            </p>
            <ul className="text-slate-600 dark:text-slate-400 text-sm space-y-2 list-none p-0">
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>Resultados pasados no aseguran éxitos futuros.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>La "Zona Realista" es una probabilidad matemática, no una certeza.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>Nunca juegues dinero que necesites para vivir.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onAccept}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 px-6 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
          >
            LO ENTIENDO Y ACEPTO
          </button>
          <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest">
            Aceptación Obligatoria según Principio IV
          </p>
        </div>
      </div>
    </div>
  );
}
