# Implementation Plan: Historical Backtesting & Monte Carlo Simulator

**Branch**: `001-historical-backtesting-monte` | **Date**: 2026-05-15 | **Spec**: specs/001-historical-backtesting-monte/spec.md
**Input**: Feature specification from `specs/001-historical-backtesting-monte/spec.md`

## Summary

Implement a "Simulation Lab" for the EuroDreams Statistical Generator. This feature includes a "Time Machine" backtest to validate the engine against historical data, a Monte Carlo simulator to visualize theoretical vs. historical distributions, and proximity analysis to show "near misses." The approach leverages Web Workers for heavy computations and `localStorage` for data persistence.

## Technical Context

**Language/Version**: TypeScript 5.0+  
**Primary Dependencies**: Next.js 16.2.3, React 19.2.4, Lucide React, TailwindCSS 4  
**Storage**: `localStorage` (persisting last 10 simulation results)  
**Testing**: [NEEDS CLARIFICATION: No test runner configured in package.json. Recommend Vitest for engine logic.]  
**Target Platform**: Modern Web Browser (supports Web Workers)
**Project Type**: Next.js Web Application  
**Performance Goals**: Backtest < 2s, 10k Simulation < 5s  
**Constraints**: Must adhere to Constitution Principles I-V (Statistical Foundations, Historical Calibration, Realistic Zone, Responsible Disclosure, Data-Driven Validation).
**Scale/Scope**: 200+ historical draws, 3.8M possible combinations per draw, 10k simulations per run.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Statistical Foundation**: Does this change adhere to LLN, CLT, or Regression to the Mean? (Principle I) -> YES, uses Monte Carlo to validate CLT.
- [x] **Historical Alignment**: Are weights calibrated against empirical historical frequency? (Principle II) -> YES, feature re-calibrates weights for backtests.
- [x] **Realistic Zone**: Does this avoid overfitting by targeting the 25-35 point range? (Principle III) -> YES, validates this range via simulation.
- [x] **Responsible Disclosure**: Does this change maintain or enhance the mandatory disclaimer? (Principle IV) -> YES, FR-005 explicitly requires disclaimers.
- [x] **Validation Protocol**: Is there a plan to run `analyze_history.js` to verify the impact? (Principle V) -> YES, T017 in spec.

## Project Structure

### Documentation (this feature)

```text
specs/001-historical-backtesting-monte/
├── plan.md              # This file
├── research.md          # Vitest, Web Workers, Chart.js optimizations
├── data-model.md        # SimulationResult, BacktestConfig
├── quickstart.md        # User scenarios
├── contracts/           
│   └── worker-protocol.md # Main <-> Worker message schema
└── tasks.md             # Implementation tasks
```

### Source Code (repository root)

```text
app/
├── simulation-lab/      # New feature directory
│   ├── page.tsx         # Dashboard Tab
│   └── components/
│       ├── DistributionChart.tsx
│       ├── SimulationControls.tsx
│       └── ProximityAnalysis.tsx

lib/
├── euroDreamsEngine.ts  # Exported logic for worker
├── historyService.ts    # Date filtering support
├── hooks/
│   └── useSimulator.ts  # Worker lifecycle hook
└── services/
    └── persistenceService.ts # localStorage wrapper

workers/                 # New directory
└── simulator.worker.ts  # Heavy computations

tests/                   # New directory
├── unit/
│   └── engine.test.ts   # Statistical logic tests
└── integration/
    └── simulation.test.ts
```

**Structure Decision**: A dedicated `simulation-lab` route group in `app/` and a top-level `workers/` directory for bundled scripts. Logic is shared via `lib/`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
