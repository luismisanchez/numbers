# Checklist: Requirements Quality (Unit Tests for English)

**Feature**: Historical Backtesting & Monte Carlo Simulator (001)
**Purpose**: Validate quality, clarity, and completeness of feature requirements.
**Created**: 2026-05-15
**Actor**: Author/Reviewer

## Requirement Completeness
- [ ] CHK001 Are the exact contents and "acknowledgment" mechanism for the mandatory disclaimer specified? [Completeness, Spec §FR-005]
- [ ] CHK002 Does the spec define the "Simulation Lab" navigation entry point and its relationship to existing tabs? [Gap, Spec §FR-007]
- [ ] CHK003 Are the specific data points to be persisted in LocalStorage (for the last 10 runs) explicitly listed? [Completeness, Spec §FR-008]
- [ ] CHK004 Is the behavior for "Session Interruption" (e.g., browser close during simulation) documented? [Gap]

## Requirement Clarity
- [ ] CHK005 Is "Prominent Disclaimer" quantified with specific sizing, positioning, or blocking behavior requirements? [Clarity, Spec §Clarifications]
- [ ] CHK006 Are the selection criteria for "Engine-Weighted" draws in the Hybrid simulation explicitly defined? [Clarity, Spec §US2]
- [ ] CHK007 Is the term "Statistical Shift" defined with measurable visualization criteria? [Ambiguity, Spec §Independent Test US2]
- [ ] CHK008 Are the "Block & Warn" user-facing messages for insufficient data explicitly worded? [Clarity, Spec §Edge Cases]

## Requirement Consistency
- [ ] CHK009 Do the latency targets (SC-001, SC-002) align with the processing requirements for 3.8M combinations? [Consistency]
- [ ] CHK010 Are the "Realistic Zone" boundaries (25-35) consistent across all charts and descriptions? [Consistency, Spec §SC-003]
- [ ] CHK011 Does the Web Worker requirement (FR-003) align with the LocalStorage persistence goal (FR-008) regarding state sync? [Consistency]

## Measurability & Acceptance Criteria
- [ ] SC012 Can the "100% accuracy" of the visual boundary (SC-003) be objectively verified without implementation-specific tools? [Measurability]
- [ ] SC013 Is "Full distribution" (3.8M combinations) quantified as a hard requirement or a target for the backtest depth? [Measurability, Spec §Clarifications]
- [ ] SC014 Are the success criteria for the "Validation Report" (mentioned in Principles) defined with pass/fail metrics? [Gap]

## Scenario & Edge Case Coverage
- [ ] CHK015 Are requirements specified for partial data availability (e.g., 50-100 draws vs 1000+)? [Coverage, Spec §Assumption 1]
- [ ] CHK016 Is the fallback behavior documented for when a Web Worker fails to initialize? [Coverage, Spec §Edge Cases]
- [ ] CHK017 Are rollback requirements defined if LocalStorage reaches its capacity limit? [Gap]
