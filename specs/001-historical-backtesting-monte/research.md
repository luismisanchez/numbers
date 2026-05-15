# Research: Historical Backtesting & Monte Carlo Simulator

This document outlines the technical decisions and research findings for the "Simulation Lab" feature.

## Technical Decisions

### 1. Test Runner: Vitest
- **Decision**: Adopt **Vitest** for unit testing the engine logic and statistical rules.
- **Rationale**: 
  - Native support for TypeScript and ESM (which the project uses).
  - Faster than Jest and requires zero configuration to work with Next.js/Turbopack.
  - Compatible with `@testing-library/react` if needed for UI tests.
- **Alternatives considered**: 
  - **Jest**: Rejected due to complex setup with ESM and Next.js.
  - **Playwright (Component Testing)**: Good but slower for pure logic/math tests.

### 2. Computation: Web Workers (new URL pattern)
- **Decision**: Use standard **Browser Web Workers** instantiated via `new URL('../workers/simulator.worker.ts', import.meta.url)` with `{ type: 'module' }`.
- **Rationale**: 
  - Monte Carlo simulations (10,000 runs) and Backtests (3.8M combination scoring) are CPU-bound and will block the main thread.
  - Next.js (Webpack/Turbopack) natively supports this pattern for automatic bundling.
- **Alternatives considered**: 
  - **Main thread execution**: Rejected; will cause UI freezing during simulation.
  - **Server-side execution (API)**: Rejected; would increase latency and server cost. Client-side is sufficient for this volume of math.

### 3. Data Persistence: localStorage
- **Decision**: Use **localStorage** to store an array of the last 10 `SimulationResult` objects.
- **Rationale**: 
  - Allows cross-session comparison without a backend database.
  - Simple API and sufficient for the data volume (~1MB limit).
- **Alternatives considered**: 
  - **IndexedDB**: Better for large data, but `localStorage` is simpler for this scope.
  - **No persistence**: Rejected; users lose their simulation history on refresh.

### 4. Visualization: Chart.js (with canvas)
- **Decision**: Use **Chart.js** (React-chartjs-2) for rendering the distribution histograms.
- **Rationale**: 
  - Uses HTML5 Canvas, which is much more performant than SVG-based libraries (like Recharts) when handling thousands of data points or complex bell curves.
  - Supports "Shaded Area" overlays for the Realistic Zone via custom plugins or datasets.
- **Alternatives considered**: 
  - **Recharts (SVG)**: Easier to style but performance degrades with large histograms.
  - **Custom CSS Bars**: Hard to maintain for overlapping distributions.

## Implementation Details

- **Worker Strategy**: The worker will receive the historical data and engine weights, then return the scoring distribution (pre-binned).
- **Backtest Optimization**: For the 3.8M combination backtest, the worker will use `Float32Array` or `Uint16Array` for memory efficiency.
- **Disclaimer**: The disclaimer (Principle IV) will be visible as a "Quality Gate" modal before starting any simulation.
