"use client";

import React, { useMemo } from 'react';
import { Sparkles, Trophy, CheckCircle2, XCircle, Loader2, BarChart3, Crosshair, MinusCircle, AlertTriangle } from 'lucide-react';
import { useEuroDreams } from '../lib/useEuroDreams';
import { useHistory } from '../lib/useHistory';
import { MAX_WEIGHTED_SCORE, type HistoricalInput, type RuleScore } from '../lib/euroDreamsEngine';

// Indicador de puntuación por regla: 2pts=verde, 1pt=ámbar, 0pts=rojo
const ScoreIcon = ({ points }: { points: number }) => {
  if (points === 2) return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
  if (points === 1) return <MinusCircle className="w-5 h-5 text-amber-400" />;
  return <XCircle className="w-5 h-5 text-rose-400" />;
};

const ScoreBadge = ({ score }: { score: RuleScore }) => {
  const colorClass = score.points === 2
    ? 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/30'
    : score.points === 1
      ? 'bg-amber-500/20 text-amber-400 ring-amber-500/30'
      : 'bg-rose-500/20 text-rose-400 ring-rose-500/30';
  return (
    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ring-1 ${colorClass}`}>
      {score.weighted}/{score.weightedMax}
    </span>
  );
};

// Subcomponente de auditoría con puntuación ponderada
const CheckItem = ({ label, value, score }: { label: string; value: string | number; score: RuleScore }) => {
  const borderClass = score.points === 2
    ? 'border-emerald-500/20'
    : score.points === 1
      ? 'border-amber-500/20'
      : 'border-white/10';
  return (
    <div className={`flex items-center justify-between p-3 bg-white/5 rounded-lg border ${borderClass}`}>
      <span className="text-slate-200 text-sm font-medium">{label}
        <span className="text-slate-600 text-xs ml-1">×{score.weight}</span>
      </span>
      <div className="flex items-center gap-2">
        <span className="text-white font-bold">{String(value)}</span>
        <ScoreBadge score={score} />
        <ScoreIcon points={score.points} />
      </div>
    </div>
  );
};

// Barra de puntuación como rango: zona ideal [11-15], extremos menos probables
const TotalScoreBar = ({ score, max, totalDraws }: { score: number; max: number; totalDraws?: number }) => {
  const TARGET_MIN = 25;
  const TARGET_MAX = 35;
  const scorePct = (score / max) * 100;
  const minPct = (TARGET_MIN / max) * 100;
  const maxPct = (TARGET_MAX / max) * 100;

  const inRange = score >= TARGET_MIN && score <= TARGET_MAX;
  const close = !inRange && score >= TARGET_MIN - 2 && score <= TARGET_MAX + 1;
  const statusColor = inRange ? 'text-emerald-400' : close ? 'text-amber-400' : 'text-rose-400';
  const statusText = inRange
    ? 'En zona ideal (60.2% de sorteos reales)'
    : close
      ? 'Cerca de la zona ideal'
      : score < TARGET_MIN
        ? 'Zona baja — combinación poco equilibrada'
        : 'Zona alta — sobreajuste estadístico';

  return (
    <div className="mb-6 p-4 bg-slate-900/50 rounded-2xl border border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Puntuación Total</span>
        <span className={`text-2xl font-black ${statusColor}`}>{score}<span className="text-sm text-slate-500">/{max}</span></span>
      </div>
      {/* Barra de rango */}
      <div className="relative w-full h-5 bg-slate-700/50 rounded-full overflow-hidden">
        {/* Gradiente de fondo: extremos rojos, centro verde */}
        <div className="absolute inset-0 flex">
          <div className="h-full bg-gradient-to-r from-rose-500/30 to-amber-500/20" style={{ width: `${minPct}%` }} />
          <div className="h-full bg-emerald-500/25 border-x-2 border-emerald-500/40" style={{ width: `${maxPct - minPct}%` }} />
          <div className="h-full bg-gradient-to-r from-amber-500/20 to-rose-500/30" style={{ width: `${100 - maxPct}%` }} />
        </div>
        {/* Marcador de puntuación */}
        <div
          className="absolute top-0 h-full w-1.5 rounded-full shadow-lg transition-all duration-700 ease-out"
          style={{
            left: `calc(${scorePct}% - 3px)`,
            backgroundColor: inRange ? '#34d399' : close ? '#fbbf24' : '#fb7185',
            boxShadow: `0 0 8px ${inRange ? '#34d39980' : close ? '#fbbf2480' : '#fb718580'}`,
          }}
        />
      </div>
      {/* Etiquetas del rango */}
      <div className="relative w-full mt-1 flex text-[10px] text-slate-500 font-mono" style={{ height: '14px' }}>
        <span className="absolute left-0">0</span>
        <span className="absolute text-emerald-500/70 font-bold" style={{ left: `${minPct}%`, transform: 'translateX(-50%)' }}>{TARGET_MIN}</span>
        <span className="absolute text-emerald-500/70 font-bold" style={{ left: `${maxPct}%`, transform: 'translateX(-50%)' }}>{TARGET_MAX}</span>
        <span className="absolute right-0">{max}</span>
      </div>
      <p className={`text-xs mt-3 ${statusColor}`}>
        {statusText}
        <span className="text-slate-500">{` · 9 reglas · ${totalDraws ?? '...'} sorteos`}</span>
      </p>
    </div>
  );
};

export default function App() {
  const { data: history, isLoading: historyLoading, error: historyError } = useHistory();

  // Construir input histórico para el engine (memoizado)
  const historicalInput = useMemo<HistoricalInput | null>(() => {
    if (!history) return null;
    return {
      frequencies: history.frequencies,
      dreamFrequencies: history.dreamFrequencies,
      totalDraws: history.totalDraws,
    };
  }, [history]);

  const { combo, dream, isGenerating, stats, generate: handleGenerate } = useEuroDreams(historicalInput);

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-slate-900 p-4 md:p-8 font-sans text-slate-100">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-pink-500/20 text-pink-400 rounded-2xl mb-2 ring-1 ring-pink-500/50">
            <Trophy className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">
            Generador EuroDreams
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Motor estadístico v4 · 9 reglas ponderadas por frecuencia histórica en tiempo real.
          </p>
          {history && (
            <p className="text-slate-500 text-sm">
              📊 {history.totalDraws} sorteos cargados · Último: {history.lastUpdate}
            </p>
          )}
          {historyLoading && (
            <p className="text-slate-600 text-sm animate-pulse">Cargando datos históricos...</p>
          )}
          {historyError && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm font-medium">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>No se pudieron cargar los datos de Google Sheets — usando algoritmo sin datos históricos</span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-start">

          {/* Panel Izquierdo: El Boleto */}
          <div className="md:col-span-5 bg-white rounded-3xl p-6 shadow-2xl shadow-indigo-500/10 ring-1 ring-slate-200/50 relative overflow-hidden">
            {/* Decoración del boleto */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 to-purple-600"></div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-wider">EuroDreams</h2>
              <p className="text-slate-500 text-sm font-medium">Tu Apuesta Maestra</p>
            </div>

            {/* Matriz Principal (1-40) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
              <div className="grid grid-cols-5 gap-2 md:gap-3">
                {Array.from({ length: 40 }, (_, i) => i + 1).map(n => {
                  const isSelected = combo.includes(n);
                  return (
                    <div
                      key={n}
                      className={`
                        aspect-square flex items-center justify-center rounded-lg font-bold text-lg transition-all duration-300
                        ${isSelected
                          ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/30 scale-110 ring-2 ring-white'
                          : 'bg-white text-slate-400 border border-slate-200 shadow-sm'}
                        ${isGenerating ? 'opacity-50 scale-95' : 'opacity-100'}
                      `}
                    >
                      {n}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Matriz Sueño (1-5) */}
            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 to-amber-500"></div>
              <h3 className="text-amber-700 font-bold mb-3 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" /> Número Sueño
              </h3>
              <div className="flex flex-col items-center gap-3">
                <div className="flex gap-4">
                  {[1, 2, 3].map(n => (
                    <div
                      key={`dream-${n}`}
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-300 border-2
                        ${dream === n
                          ? 'bg-amber-400 border-amber-400 text-slate-900 shadow-lg shadow-amber-400/40 scale-110'
                          : 'bg-white border-amber-200 text-amber-600'}
                        ${isGenerating ? 'opacity-50 scale-95' : 'opacity-100'}
                      `}
                    >
                      {n}
                    </div>
                  ))}
                </div>
                <div className="flex gap-4">
                  {[4, 5].map(n => (
                    <div
                      key={`dream-${n}`}
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-300 border-2
                        ${dream === n
                          ? 'bg-amber-400 border-amber-400 text-slate-900 shadow-lg shadow-amber-400/40 scale-110'
                          : 'bg-white border-amber-200 text-amber-600'}
                        ${isGenerating ? 'opacity-50 scale-95' : 'opacity-100'}
                      `}
                    >
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Panel Derecho: Estadísticas y Botón */}
          <div className="md:col-span-7 space-y-6">

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full relative group overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-[2px] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
              <div className="relative flex items-center justify-center gap-3 bg-slate-900 rounded-xl px-8 py-5 transition-all group-hover:bg-opacity-0">
                {isGenerating ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                    <span className="text-lg font-bold text-white">Procesando motor v3...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 text-white group-hover:animate-pulse" />
                    <span className="text-lg font-bold text-white">Generar Nueva Combinación</span>
                  </>
                )}
              </div>
            </button>

            {/* Tarjeta de validación de leyes */}
            <div className="bg-slate-800/50 border border-slate-700 backdrop-blur-sm rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Auditoría Matemática v4</h3>
              </div>

              {stats ? (
                <div className="space-y-3 opacity-100 transition-opacity duration-500">
                  {/* Barra de puntuación total */}
                  <TotalScoreBar score={stats.totalScore} max={MAX_WEIGHTED_SCORE} totalDraws={history?.totalDraws} />

                  {/* ── Esenciales ×3 (>90% cumplimiento histórico) ── */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 pt-1">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black ring-1 ring-emerald-500/30">3</span>
                      <span className="text-emerald-400">Esenciales</span>
                      <span className="text-slate-600 font-normal normal-case">— se cumplen en &gt;90% de sorteos reales</span>
                    </h4>
                    <CheckItem
                      label="Terminaciones únicas (Ideal: 5 · Ok: 4, 6)"
                      value={`${stats.uniqueEndings} distintas`}
                      score={stats.scores.endings}
                    />
                    <CheckItem
                      label="Filas distintas (Ideal: 5 · Ok: 4, 6)"
                      value={`${stats.uniqueRows} Filas`}
                      score={stats.scores.rows}
                    />
                    <CheckItem
                      label="Décadas (Ideal: 2-2-1-1)"
                      value={`[${stats.decadePattern}]`}
                      score={stats.scores.decades}
                    />
                    <CheckItem
                      label="Gaps entre números (Ideal: μ5-10, max≤15)"
                      value={`μ${stats.meanGap} · max ${stats.maxGap}`}
                      score={stats.scores.gaps}
                    />
                  </div>

                  {/* ── Frecuentes ×2 (75-90% cumplimiento) ── */}
                  <div className="space-y-3 mt-5 pt-5 border-t border-slate-700/50">
                    <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-black ring-1 ring-amber-500/30">2</span>
                      <span className="text-amber-400">Frecuentes</span>
                      <span className="text-slate-600 font-normal normal-case">— se cumplen en 75-90% de sorteos</span>
                    </h4>
                    <CheckItem
                      label="Consecutividad (Ideal: 0 · Ok: 1)"
                      value={`${stats.consecCount} Pareja(s)`}
                      score={stats.scores.consecutiveness}
                    />
                    <CheckItem
                      label="Paridad (Ideal: 3P/3I · Ok: 2/4, 4/2)"
                      value={`${stats.evens}P / ${stats.odds}I`}
                      score={stats.scores.parity}
                    />
                    <CheckItem
                      label="Columnas (Ideal: 1-1-2-2)"
                      value={stats.colPattern}
                      score={stats.scores.columns}
                    />
                    <CheckItem
                      label="Vecinos grid (Ideal: ≤2 · Ok: 3)"
                      value={`${stats.neighborPairs} parejas`}
                      score={stats.scores.neighbors}
                    />
                  </div>

                  {/* ── Variables ×1 (<75% cumplimiento) ── */}
                  <div className="space-y-3 mt-5 pt-5 border-t border-slate-700/50">
                    <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-500/20 text-slate-400 text-[10px] font-black ring-1 ring-slate-500/30">1</span>
                      <span className="text-slate-400">Variables</span>
                      <span className="text-slate-600 font-normal normal-case">— se cumplen en &lt;75% de sorteos</span>
                    </h4>
                    <CheckItem
                      label="Suma (Ideal: 110-136 · Ok: 100-145)"
                      value={stats.sum}
                      score={stats.scores.sum}
                    />
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}