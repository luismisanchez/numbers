---

description: "Analysis-driven task list for Historical Backtesting & Monte Carlo Simulator"
---

# Tasks: Historical Backtesting & Monte Carlo Simulator

**Input**: Design documents from `specs/001-historical-backtesting-monte/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Vitest unit tests for engine logic and integration tests for worker flows.

**Organization**: Tasks are grouped by user story, with analysis refinements (G1, G2) incorporated into early phases.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and structure

- [ ] T001 Create project structure: `workers/`, `tests/unit/`, `tests/integration/`, `app/simulation-lab/components/`
- [ ] T002 Install `vitest`, `@vitest/ui`, and `react-chartjs-2` + `chart.js` dependencies
- [ ] T003 [P] Configure Vitest in `vitest.config.ts` for Next.js 16 and TypeScript support

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core logic and mandatory compliance (Principle IV)

- [ ] T004 [P] Refactor `lib/euroDreamsEngine.ts` to export scoring logic for use in Web Workers
- [ ] T005 [P] Implement date-filtering logic in `lib/historyService.ts` to support "Time Machine" views
- [ ] T006 Implement base `workers/simulator.worker.ts` with message protocol handlers per `contracts/worker-protocol.md`
- [ ] T007 Create `lib/hooks/useSimulator.ts` to manage Web Worker lifecycle (instantiation, termination)
- [ ] T008 [P] Implement `localStorage` service in `lib/services/persistenceService.ts` to store `SimulationResult`
- [ ] T009 [US1] Create mandatory Disclaimer Modal (Principle IV) in `app/simulation-lab/components/DisclaimerModal.tsx` (Refinement G2)

**Checkpoint**: Foundation ready - simulator engine, persistence, and compliance gate are functional.

---

## Phase 3: User Story 1 - Historical "Time Machine" Backtest (Priority: P1) 🎯 MVP

**Goal**: Select a past date and see the actual winner's position in the bell curve of 1M+ combinations.

**Independent Test**: Select a date, verify engine re-calibrates, and check that the winning combination is highlighted.

### Tests for User Story 1

- [ ] T010 [P] [US1] Unit test for date-filtered weight calibration in `tests/unit/engine.test.ts`
- [ ] T011 [P] [US1] Unit test for 1M+ combination scoring performance in `tests/unit/engine.test.ts`

### Implementation for User Story 1

- [ ] T012 [P] [US1] Implement "Time Machine" calibration and sampling logic in `workers/simulator.worker.ts`
- [ ] T013 [US1] Create `app/simulation-lab/page.tsx` with date picker and backtest trigger
- [ ] T014 [US1] Implement distribution histogram component in `app/simulation-lab/components/DistributionChart.tsx` using Chart.js
- [ ] T015 [US1] Implement "Realistic Zone" shaded background (scores 25-35) in `DistributionChart.tsx` (Refinement G1)
- [ ] T016 [US1] Add "Winner Highlight" logic to the chart to show the actual draw result's percentile
- [ ] T017 [US1] Add "Insufficient Data" warning (<50 draws) in `app/simulation-lab/page.tsx` (Edge Case)

**Checkpoint**: User Story 1 is fully functional - backtesting with visual "Realistic Zone" works independently.

---

## Phase 4: User Story 2 - Monte Carlo Distribution Simulator (Priority: P2)

**Goal**: Run 10k simulations (5k random, 5k engine-weighted) to visualize the statistical shift.

**Independent Test**: Run simulation, verify 10k results appear with two overlapping bell curves.

### Tests for User Story 2

- [ ] T018 [P] [US2] Unit test for weighted combination generator in `tests/unit/engine.test.ts`
- [ ] T019 [P] [US2] Integration test for "Hybrid" simulation logic in `tests/integration/simulation.test.ts`

### Implementation for User Story 2

- [ ] T020 [P] [US2] Implement "Hybrid" simulation logic (Random vs Weighted) in `workers/simulator.worker.ts`
- [ ] T021 [US2] Add Simulation Controls (Sample Size, Logic Type) to `app/simulation-lab/page.tsx`
- [ ] T022 [US2] Update `app/simulation-lab/components/DistributionChart.tsx` to support multiple datasets
- [ ] T023 [US2] Implement Progress Bar in `app/simulation-lab/page.tsx` using `SIMULATION_PROGRESS` worker messages

**Checkpoint**: User Story 2 is functional - users can run Monte Carlo simulations.

---

## Phase 5: User Story 3 - Regret & Proximity Analysis (Priority: P3)

**Goal**: Show "near misses" (3-4 hits) and top picks vs. actual winner.

**Independent Test**: Verify table shows hit counts (0-6) and lists top 10 engine picks.

### Implementation for User Story 3

- [ ] T024 [P] [US3] Implement digit matching logic (0-6 hits) in `workers/simulator.worker.ts`
- [ ] T025 [US3] Create `app/simulation-lab/components/ProximityAnalysis.tsx` to display hit counts and top combinations
- [ ] T026 [US3] Integrate ProximityAnalysis into `app/simulation-lab/page.tsx` post-simulation

**Checkpoint**: All user stories are functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T027 [P] Implement simulation history sidebar using `localStorage` (FR-008)
- [ ] T028 [P] Add Web Worker error handling (Edge Case) with toast notifications
- [ ] T029 Performance optimization: Ensure 3.8M combination backtest uses TypedArrays for memory efficiency
- [ ] T030 Manual validation: Verify "Realistic Zone" overlay precisely matches axis labels for 25 and 35 (Refinement A1)
- [ ] T031 Run `analyze_history.js` and update weights if backtesting reveals calibration drift (Principle V)

---

## Dependencies & Execution Order

- **Phase 1 & 2** are strict prerequisites.
- **User Story 1 (P1)** is the MVP.
- **T009 (Disclaimer)** must be completed before starting US1 implementation to ensure Principle IV compliance.
- **T015 (Overlay)** must be completed to satisfy SC-003 during US1 implementation.

## Parallel Execution Examples: Phase 2

```bash
# Developer A: Engine Logic
Task T004: Refactor Engine
Task T006: Worker Base

# Developer B: Persistence & Compliance
Task T008: LocalStorage Service
Task T009: Disclaimer Modal
```

---

## Implementation Strategy

1. **Compliance First**: Setup the disclaimer modal and foundational logic.
2. **Visual Proof**: Deliver US1 with the "Realistic Zone" shaded area to prove the theory.
3. **Scale Up**: Add US2 (Monte Carlo) and US3 (Proximity) to complete the analytical suite.
