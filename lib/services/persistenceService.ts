export interface SimulationResult {
  id: string;
  timestamp: number;
  type: 'hybrid' | 'random' | 'weighted';
  distribution: Record<number, number>;
  summary: {
    mean: number;
    sd: number;
    elapsedMs: number;
  };
  config?: any;
}

const STORAGE_KEY = 'rtk_sim_results';
const MAX_RESULTS = 10;

export const persistenceService = {
  saveResult(result: SimulationResult): void {
    const results = this.getResults();
    results.unshift(result);
    // Keep only last 10
    const trimmed = results.slice(0, MAX_RESULTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  },

  getResults(): SimulationResult[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  clearResults(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
};
