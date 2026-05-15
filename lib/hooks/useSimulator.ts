import { useState, useCallback, useRef, useEffect } from 'react';

export interface SimulationProgress {
  current: number;
  total: number;
  percent: number;
}

export interface SimulationResultData {
  distribution: Record<number, number>;
  mean: number;
  sd: number;
  elapsedMs: number;
}

export function useSimulator() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<SimulationProgress | null>(null);
  const [result, setResult] = useState<SimulationResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const workerRef = useRef<Worker | null>(null);

  const startSimulation = useCallback((payload: any) => {
    if (isRunning) return;

    setError(null);
    setResult(null);
    setProgress(null);
    setIsRunning(true);

    // Create worker using Next.js pattern
    const worker = new Worker(
      new URL('../../workers/simulator.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (event) => {
      const { type, payload } = event.data;

      switch (type) {
        case 'SIMULATION_PROGRESS':
          setProgress(payload);
          break;
        case 'SIMULATION_COMPLETE':
          setResult(payload);
          setIsRunning(false);
          worker.terminate();
          break;
        case 'SIMULATION_ERROR':
          setError(payload.message);
          setIsRunning(false);
          worker.terminate();
          break;
      }
    };

    worker.onerror = (err) => {
      setError('Worker initialization failed');
      setIsRunning(false);
      worker.terminate();
    };

    workerRef.current = worker;
    worker.postMessage({ type: 'START_SIMULATION', payload });
  }, [isRunning]);

  const startBacktest = useCallback((payload: any) => {
    if (isRunning) return;

    setError(null);
    setResult(null);
    setProgress(null);
    setIsRunning(true);

    const worker = new Worker(
      new URL('../../workers/simulator.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (event) => {
      const { type, payload } = event.data;
      switch (type) {
        case 'SIMULATION_PROGRESS':
          setProgress(payload);
          break;
        case 'SIMULATION_COMPLETE':
          setResult(payload);
          setIsRunning(false);
          worker.terminate();
          break;
        case 'SIMULATION_ERROR':
          setError(payload.message);
          setIsRunning(false);
          worker.terminate();
          break;
      }
    };

    workerRef.current = worker;
    worker.postMessage({ type: 'START_BACKTEST', payload });
  }, [isRunning]);

  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      setIsRunning(false);
      setProgress(null);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (workerRef.current) workerRef.current.terminate();
    };
  }, []);

  return {
    startSimulation,
    startBacktest,
    terminate,
    isRunning,
    progress,
    result,
    error
  };
}
