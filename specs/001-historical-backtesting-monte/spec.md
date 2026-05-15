# Feature Specification: Historical Backtesting & Monte Carlo Simulator

**Feature Branch**: `001-historical-backtesting-monte`  
**Created**: 2026-05-15  
**Status**: Draft  
**Input**: User description: "Historical Backtesting & Monte Carlo Simulator"

## Clarifications

### Session 2026-05-15
- Q: How should the 10,000 simulated draws be generated? → A: Hybrid (5k random, 5k engine-weighted) to visualize the statistical shift.
- Q: Where should the controls be integrated? → A: Dedicated "Simulation Lab" tab for rich visualization.
- Q: How to handle <50 draws for backtest? → A: Block & Warn with a "Not enough data" message (Principle I).
- Q: Should simulation results be persisted? → A: Local Storage for the last 5-10 runs for comparison.
- Q: Backtest depth? → A: Full distribution (3.8M combinations) to show winner's position in the bell curve.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Historical "Time Machine" Backtest (Priority: P1)

As a user, I want to select a date in the past and see how the engine would have performed if it only knew the data up to that day.

**Why this priority**: Core value proposition. It validates the engine's historical calibration (Principle II) by testing it against known results using a "blind" approach.

**Independent Test**: Can be tested by selecting a date (e.g., 2024-01-01), verifying weights are calculated only from pre-2024 data, and checking if the engine correctly identifies the draw that actually occurred on that date.

**Acceptance Scenarios**:

1. **Given** a date picker on the dashboard, **When** I select "2024-03-04", **Then** the engine should filter the historical data to include only draws before that date.
2. **Given** a backtest date selected, **When** the analysis runs, **Then** it should calculate the score for all possible combinations (or a 1M+ sample) and display where the actual winner sits in that distribution.

---

### User Story 2 - Monte Carlo Distribution Simulator (Priority: P2)

As a user, I want to run thousands of simulated draws to see the "theoretical" distribution of scores and compare it to the "realistic zone."

**Why this priority**: Validates Principle III (The Realistic Zone) by proving that the 25-35 point range is indeed the most likely outcome for random draws under the current weighting system.

**Independent Test**: Run a simulation of 10,000 draws (5k random, 5k engine-weighted) and verify that the resulting histograms correctly visualize the "Statistical Shift."

**Acceptance Scenarios**:

1. **Given** a "Run Simulation" button, **When** I click it, **Then** the system should generate 5,000 purely random and 5,000 engine-weighted combinations.
2. **Given** completed simulation results, **When** I view the dashboard, **Then** I should see a chart comparing the "Purely Random" vs "Engine-Weighted" vs "Historical" distributions.

---

### User Story 3 - Regret & Proximity Analysis (Priority: P3)

As a user, I want to see how many "near misses" the engine would have produced in the past to understand the volatility of the lottery.

**Why this priority**: Enhances Principle IV (Responsible Disclosure) by showing that even "statistically perfect" combinations rarely win, highlighting the randomness of the game.

**Independent Test**: Verify that the system can calculate the number of matching digits (0-6) between a set of generated numbers and a historical draw.

**Acceptance Scenarios**:

1. **Given** a backtest result, **When** the combinations are generated, **Then** it should show a summary table: "3 hits: 15 combinations, 4 hits: 1 combination, etc."

---

### Edge Cases

- **Insufficient Data**: If a selected backtest date results in <50 historical draws, the system MUST disable simulation and display a "Not enough historical data for reliable calibration" message.
- **Worker Failure**: System SHOULD handle Web Worker errors gracefully with an error toast and a recommendation to refresh.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a date-filtering mechanism for the `historyService`.
- **FR-002**: Engine MUST be able to re-calculate weights (x3, x2, x1) dynamically based on the filtered dataset.
- **FR-003**: System MUST execute Monte Carlo simulations using a Web Worker to avoid blocking the main UI thread.
- **FR-004**: System MUST display a comparison chart (histogram) using a library like Chart.js or similar (or stylized CSS).
- **FR-005**: System MUST display the mandatory disclaimer (Principle IV) prominently during the simulation process.
- **FR-006 (Constitution)**: System MUST display the mandatory disclaimer regarding randomness and responsible gaming (Principle IV).
- **FR-007**: System MUST implement a dedicated "Simulation Lab" tab/view to house these advanced tools.
- **FR-008**: System MUST persist the last 10 simulation results in `localStorage` for cross-session comparison.

### Key Entities *(include if feature involves data)*

- **BacktestConfig**: Date range, target draw, and engine version used for the simulation.
- **SimulationResult**: Array of scores, hit counts, and distribution data from the Monte Carlo run.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Backtest calculation for 200+ historical draws completes in under 2 seconds.
- **SC-002**: Monte Carlo simulation of 10,000 draws finishes in under 5 seconds.
- **SC-003**: UI displays the "Realistic Zone" overlay on the simulation chart with 100% accuracy.

## Assumptions

- **Assumption 1**: The user has enough historical data (at least 50 draws) for a meaningful backtest.
- **Assumption 2**: The client's browser supports Web Workers for the simulation.
- **Assumption 3**: Historical data from Lotoideas remains accessible or is cached locally.
