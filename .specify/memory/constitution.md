<!--
Sync Impact Report
Version change: [INITIAL] → 1.0.0
Modified principles:
- I. Statistical Foundations (New)
- II. Historical Calibration (New)
- III. The Realistic Zone (New)
- IV. Responsible Disclosure (New)
- V. Data-Driven Validation (New)
Added sections: Core Principles, Governance
Removed sections: None
Templates requiring updates:
- .specify/templates/plan-template.md (✅ updated)
- .specify/templates/spec-template.md (✅ updated)
- .specify/templates/tasks-template.md (✅ updated)
Follow-up TODOs: None
-->

# Generador Estadístico EuroDreams Constitution

## Core Principles

### I. Statistical Foundations
All generation logic MUST be grounded in established statistical laws, specifically the Law of Large Numbers, the Central Limit Theorem, and Regression to the Mean. The project is an exercise in analysis, not a gambling predictor.

### II. Historical Calibration
Generation rules MUST be weighted based on empirical frequency in historical draws. Frequent events (e.g., those appearing in >90% of draws) carry a x3 weight, while infrequent ones (<75%) carry a x1 weight.

### III. The Realistic Zone
The algorithm SHOULD avoid overfitting. Instead of maximizing scores, it targets the "realistic zone" (25-35/42 points) where ~60% of historical draws reside, ensuring combinations are statistically coherent but not artificially constrained.

### IV. Responsible Disclosure
Every user-facing interaction MUST include a disclaimer stating that the tool is for educational/fun purposes and does not increase winning odds. Promoting responsible gaming is non-negotiable.

### V. Data-Driven Validation
All modifications to the "Frankenstein" engine MUST be validated against historical data using `analyze_history.js` before being merged. Performance against the historical distribution is the primary success metric.

## Development Workflow

### Technical Integrity
- Use TypeScript for type safety in numerical calculations.
- Maintain `analyze_history.js` as the source of truth for rule calibration.
- Next.js is the chosen framework for the interactive dashboard.

### Quality Gates
- Algorithm changes require a "Validation Report" (output of analysis script).
- UI changes must maintain accessibility and the primary disclaimer's visibility.

## Governance
This constitution supersedes all other documentation. Amendments require a version bump and a Sync Impact Report.

### Versioning Policy
- **MAJOR**: Removal or redefinition of core principles (e.g., shifting from statistical to predictive).
- **MINOR**: Addition of new statistical rules or engine versions.
- **PATCH**: Wording clarifications or typo fixes.

**Version**: 1.0.0 | **Ratified**: 2026-05-15 | **Last Amended**: 2026-05-15
