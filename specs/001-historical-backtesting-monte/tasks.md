---

description: "Task list for Historical Backtesting & Monte Carlo Simulator implementation"
---

# Tasks: Historical Backtesting & Monte Carlo Simulator

**Input**: Design documents from `specs/001-historical-backtesting-monte/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Vitest unit tests are included for engine logic per research.md decisions.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure: `workers/`, `tests/unit/`, `tests/integration/`, `app/simulation-lab/components/`
- [ ] T002 Install `vitest`, `@vitest/ui`, and `react-chartjs-2` + `chart.js` dependencies
- [ ] T003 [P] Configure Vitest in `vitest.config.ts` for Next.js and TypeScript support

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure and worker logic that MUST be complete before ANY user story

- [ ] T004 [P] Refactor `lib/euroDreamsEngine.ts` to export scoring logic for use in Web Workers
- [ ] T005 [P] Implement date-filtering logic in `lib/historyService.ts` to support "Time Machine" views
- [ ] T006 Implement base `workers/simulator.worker.ts` with message protocol handlers per `contracts/worker-protocol.md`
- [ ] T007 Create `lib/hooks/useSimulator.ts` to manage Web Worker lifecycle (instantiation, progress, termination)
- [ ] T008 [P] Implement `localStorage` service in `lib/persistenceService.ts` to store `SimulationResult` objects

**Checkpoint**: Foundation ready - simulator engine and worker communication are functional

---

## Phase 3: User Story 1 - Historical "Time Machine" Backtest (Priority: P1) 🎯 MVP

**Goal**: Select a past date and see the actual winner's position in the bell curve of 1M+ combinations.

**Independent Test**: Select "2024-03-04" in the UI, verify engine re-calibrates using pre-March 2024 data, and check that the winning combination is correctly highlighted in the distribution.

### Tests for User Story 1

- [ ] T009 [P] [US1] Unit test for date-filtered weight calibration in `tests/unit/engine.test.ts`
- [ ] T010 [P] [US1] Unit test for 1M+ combination scoring performance in `tests/unit/engine.test.ts`

### Implementation for User Story 1

- [ ] T011 [P] [US1] Implement "Time Machine" calibration logic in `workers/simulator.worker.ts`
- [ ] T012 [US1] Create `app/simulation-lab/page.tsx` with date picker and backtest trigger
- [ ] T013 [US1] Implement distribution histogram component in `app/simulation-lab/components/DistributionChart.tsx` using Chart.js
- [ ] T014 [US1] Add "Winner Highlight" logic to the chart to show the actual draw result's percentile
- [ ] T015 [US1] Add "Insufficient Data" warning (<50 draws) in `app/simulation-lab/page.tsx` (Edge Case)

**Checkpoint**: User Story 1 is fully functional - backtesting works independently.

---

## Phase 4: User Story 2 - Monte Carlo Distribution Simulator (Priority: P2)

**Goal**: Run 10k simulations (5k random, 5k engine-weighted) to visualize the statistical shift.

**Independent Test**: Click "Run Simulation", verify 10k results appear, and check the "Hybrid" chart for two overlapping bell curves showing the engine's bias.

### Tests for User Story 2

- [ ] T016 [P] [US2] Unit test for weighted combination generator in `tests/unit/engine.test.ts`
- [ ] T017 [P] [US2] Integration test for "Hybrid" simulation logic in `tests/integration/simulation.test.ts`

### Implementation for User Story 2

- [ ] T018 [P] [US2] Implement "Hybrid" simulation logic (Random vs Weighted) in `workers/simulator.worker.ts`
- [ ] T019 [US2] Add Simulation Controls (Sample Size, Logic Type) to `app/simulation-lab/page.tsx`
- [ ] T020 [US2] Update `app/simulation-lab/components/DistributionChart.tsx` to support multiple datasets (Random vs Weighted)
- [ ] T021 [US2] Implement Progress Bar in `app/simulation-lab/page.tsx` using `SIMULATION_PROGRESS` worker messages

**Checkpoint**: User Story 2 is functional - users can run Monte Carlo simulations.

---

## Phase 5: User Story 3 - Regret & Proximity Analysis (Priority: P3)

**Goal**: Show "near misses" (3-4 hits) and top picks vs. actual winner.

**Independent Test**: After a backtest, verify the table shows "3 hits: X, 4 hits: Y" and lists the top 10 engine picks for that day.

### Implementation for User Story 3

- [ ] T022 [P] [US3] Implement digit matching logic (0-6 hits) in `workers/simulator.worker.ts`
- [ ] T023 [US3] Create `app/simulation-lab/components/ProximityTable.tsx` to display hit counts and top combinations
- [ ] T024 [US3] Integrate ProximityTable into `app/simulation-lab/page.tsx` post-simulation

**Checkpoint**: All user stories are functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T025 [P] Add mandatory Disclaimer (Principle IV) to `app/simulation-lab/page.tsx` as a prominent overlay/header
- [ ] T026 [P] Implement simulation history sidebar using `localStorage` (FR-008)
- [ ] T027 [P] Add Web Worker error handling (Edge Case) with toast notifications
- [ ] T028 Performance optimization: Ensure 3.8M combination backtest uses TypedArrays for memory efficiency
- [ ] T029 Run `analyze_history.js` and update weights if backtesting reveals calibration drift (Principle V)
- [ ] T030 Final validation of `quickstart.md` scenarios in the live UI

---

## Dependencies & Execution Order

- **Phase 1 & 2** are strict prerequisites.
- **User Story 1 (P1)** is the MVP and should be completed before P2/P3.
- **User Story 2 (P2)** and **User Story 3 (P3)** can be implemented in parallel if needed.

## Parallel Execution Examples: US1

```bash
# Developer A: Tests
Task T009: Unit test for date-filtered weights
Task T010: Unit test for combination scoring

# Developer B: Logic
Task T011: Worker calibration logic

# Developer C: UI
Task T012: Page structure + Date picker
Task T013: Distribution chart
```

---

## Implementation Strategy

1. **MVP First**: Complete US1 (Backtest) to provide immediate analytical value.
2. **Incremental**: Add the Monte Carlo simulator (US2) to prove the "Realistic Zone" theory.
3. **Analyze**: Use Proximity Analysis (US3) to highlight the game's volatility.
