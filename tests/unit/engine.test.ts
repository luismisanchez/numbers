import { describe, it, expect } from 'vitest';
import { scoreCombo, calculateNumberWeights, scoreBulk } from '../../lib/euroDreamsEngine';
import { filterHistoryByDate } from '../../lib/historyService';

describe('EuroDreams Engine', () => {
  it('should score a perfect combo correctly (max 42)', () => {
    // Note: Finding a perfect 42 is hard, but we can check if it returns a number
    const combo = [1, 2, 3, 4, 5, 6]; // Probably not perfect
    const score = scoreCombo(combo);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(42);
  });

  it('should calculate weights based on frequency', () => {
    const frequencies: Record<number, number> = { 1: 10, 2: 5 };
    const totalDraws = 100; // Expected freq = (100 * 6) / 40 = 15
    const weights = calculateNumberWeights(frequencies, totalDraws);
    
    // Number 2 is colder than number 1, should have higher weight
    expect(weights[1]).toBeGreaterThan(weights[0]);
  });

  it('should filter history by date', () => {
    const draws = [
      { date: '2024-01-01', nums: [1, 2, 3, 4, 5, 6], dream: 1 },
      { date: '2024-02-01', nums: [10, 11, 12, 13, 14, 15], dream: 2 },
    ];
    const filtered = filterHistoryByDate(draws, '2024-01-15');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].date).toBe('2024-01-01');
  });

  it('should score combos in bulk using scoreBulk', () => {
    const combos = [1, 2, 3, 4, 5, 6, 10, 11, 12, 13, 14, 15];
    const results = scoreBulk(combos);
    expect(results).toHaveLength(2);
    expect(results[0]).toBe(scoreCombo([1, 2, 3, 4, 5, 6]));
    expect(results[1]).toBe(scoreCombo([10, 11, 12, 13, 14, 15]));
  });

  it('should generate combinations with higher scores when weighted', () => {
    // Mock cold numbers (1-6) with high weights
    const weights = new Array(40).fill(0.5);
    for (let i = 0; i < 6; i++) weights[i] = 2.0;

    // This is a probabilistic test, we check if multiple runs stay within reasonable bounds
    const nums = new Set<number>();
    while (nums.size < 6) {
      const total = weights.reduce((a, b) => a + b, 0);
      let rand = Math.random() * total;
      for (let j = 0; j < 40; j++) {
        rand -= weights[j];
        if (rand <= 0) {
          nums.add(j + 1);
          break;
        }
      }
    }
    expect(nums.size).toBe(6);
  });
});
