import { scoreCombo, calculateNumberWeights, calculateHits } from '../lib/euroDreamsEngine';
import { HistoricalDraw, calculateFrequencies } from '../lib/historyService';

/**
 * Simulator Worker
 * Handles Monte Carlo simulations and high-performance scoring.
 */

addEventListener('message', (event) => {
  const { type, payload } = event.data;

  if (type === 'START_SIMULATION') {
    runSimulation(payload);
  } else if (type === 'START_BACKTEST') {
    runBacktest(payload);
  }
});

function runBacktest(payload: any) {
  const { historicalData, winningNums, sampleSize = 100000 } = payload;
  const start = performance.now();

  try {
    const distribution: Record<number, number> = {};
    const hits: number[] = [0, 0, 0, 0, 0, 0, 0]; // 0-6 hits
    const topPicks: { combo: number[], score: number }[] = [];
    
    const frequencies = calculateFrequencies(historicalData);
    const weights = calculateNumberWeights(frequencies, historicalData.length);
    
    const winnerScore = scoreCombo(winningNums);
    
    for (let i = 0; i < sampleSize; i++) {
      if (i > 0 && i % (sampleSize / 10) === 0) {
        postMessage({
          type: 'SIMULATION_PROGRESS',
          payload: { current: i, total: sampleSize, percent: Math.round((i / sampleSize) * 100) }
        });
      }

      const nums = new Set<number>();
      while (nums.size < 6) {
        const total = weights.reduce((a, b) => a + b, 0);
        let rand = Math.random() * total;
        let selected = 40;
        for (let j = 0; j < 40; j++) {
          rand -= weights[j];
          if (rand <= 0) { selected = j + 1; break; }
        }
        nums.add(selected);
      }
      const arr = Array.from(nums).sort((a, b) => a - b);
      const score = scoreCombo(arr);
      
      distribution[score] = (distribution[score] || 0) + 1;

      // Track hits
      const hitCount = calculateHits(arr, winningNums);
      hits[hitCount]++;

      // Track top 10
      if (topPicks.length < 10 || score > topPicks[topPicks.length - 1].score) {
        topPicks.push({ combo: arr, score });
        topPicks.sort((a, b) => b.score - a.score);
        if (topPicks.length > 10) topPicks.pop();
      }
    }

    const end = performance.now();

    postMessage({
      type: 'SIMULATION_COMPLETE',
      payload: {
        distribution,
        winnerScore,
        proximity: { hits, topPicks },
        elapsedMs: Math.round(end - start)
      }
    });
  } catch (error: any) {
    postMessage({
      type: 'SIMULATION_ERROR',
      payload: { message: error.message }
    });
  }
}

function runSimulation(payload: any) {
  const { count, logic, historicalData } = payload;
  const start = performance.now();
  
  try {
    const distribution: Record<number, number> = {};
    let totalScore = 0;

    let weights: number[] | null = null;
    if (logic !== 'random') {
      const frequencies = calculateFrequencies(historicalData);
      weights = calculateNumberWeights(frequencies, historicalData.length);
    }

    for (let i = 0; i < count; i++) {
      if (i > 0 && i % (count / 10) === 0) {
        postMessage({
          type: 'SIMULATION_PROGRESS',
          payload: { current: i, total: count, percent: Math.round((i / count) * 100) }
        });
      }

      let combo: number[] = [];
      const currentLogic = logic === 'hybrid' ? (i < count / 2 ? 'random' : 'weighted') : logic;

      if (currentLogic === 'random') {
        const nums = new Set<number>();
        while (nums.size < 6) nums.add(Math.floor(Math.random() * 40) + 1);
        combo = Array.from(nums).sort((a, b) => a - b);
      } else {
        const nums = new Set<number>();
        while (nums.size < 6) {
          const w = weights!;
          const total = w.reduce((a, b) => a + b, 0);
          let rand = Math.random() * total;
          let selected = 40;
          for (let j = 0; j < 40; j++) {
            rand -= w[j];
            if (rand <= 0) { selected = j + 1; break; }
          }
          nums.add(selected);
        }
        combo = Array.from(nums).sort((a, b) => a - b);
      }

      const score = scoreCombo(combo);
      distribution[score] = (distribution[score] || 0) + 1;
      totalScore += score;
    }

    const end = performance.now();

    postMessage({
      type: 'SIMULATION_COMPLETE',
      payload: {
        distribution,
        mean: totalScore / count,
        sd: 0,
        elapsedMs: Math.round(end - start)
      }
    });
  } catch (error: any) {
    postMessage({
      type: 'SIMULATION_ERROR',
      payload: { message: error.message }
    });
  }
}
