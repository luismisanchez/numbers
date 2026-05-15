# Data Model: Historical Backtesting & Monte Carlo Simulator

This document defines the key entities and data structures for the Simulation Lab.

## Entities

### 1. BacktestConfig
Configuration for a "Time Machine" backtest run.

| Field | Type | Description |
|-------|------|-------------|
| `targetDate` | `string` | ISO date of the historical draw to backtest. |
| `historicalLimit` | `number` | Max draws used for calibration (default 250). |
| `engineVersion` | `string` | Version of the scoring engine (e.g., "v4"). |
| `sampleSize` | `number` | Number of combinations to score (default 1M). |

### 2. SimulationResult
The output of a Monte Carlo run, persisted in `localStorage`.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier (UUID). |
| `timestamp` | `number` | When the simulation was run. |
| `type` | `"hybrid" \| "random" \| "weighted"` | Type of generation logic used. |
| `distribution` | `Record<number, number>` | Score -> Frequency (pre-binned for histogram). |
| `summary` | `object` | Mean, standard deviation, and "Realistic Zone" % coverage. |
| `config` | `BacktestConfig \| null` | Backtest settings if applicable. |

### 3. ProximityAnalysis
Calculated results showing "near misses."

| Field | Type | Description |
|-------|------|-------------|
| `hits` | `number[]` | Array showing count for 0, 1, 2, 3, 4, 5, 6 hits. |
| `topCombinations` | `Combination[]` | Top 10 combinations by score for that backtest date. |

## Relationships

- A `SimulationResult` can optionally reference a `BacktestConfig` if it was part of a historical validation run.
- The `SimulationLab` state manages an array of `SimulationResult` (max 10).

## Persistence Schema (localStorage)

```json
{
  "rtk_sim_results": [
    {
      "id": "...",
      "timestamp": 123456789,
      "type": "hybrid",
      "distribution": { "25": 120, "26": 340, ... },
      "summary": { "mean": 29.5, "sd": 4.2 }
    }
  ]
}
```
