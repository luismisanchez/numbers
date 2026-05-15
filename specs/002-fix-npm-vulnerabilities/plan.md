# Implementation Plan: Resolve Project Vulnerabilities

**Branch**: `002-fix-npm-vulnerabilities` | **Date**: 2026-05-15 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-fix-npm-vulnerabilities/spec.md`

## Summary

The primary goal is to achieve a zero-vulnerability state in the project's npm dependency tree. The technical approach involves a systematic hybrid strategy: first applying non-breaking automatic fixes via `npm audit fix`, followed by manual resolution of complex vulnerabilities (e.g., `postcss`, `next`) through version overrides in `package.json` or `npm audit fix --force` where justified. Stability is maintained by verifying the build and executing existing Vitest suites after each significant change.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+  
**Primary Dependencies**: `npm`, `next`, `postcss`, `react`, `chart.js`  
**Storage**: N/A  
**Testing**: Vitest 4.x  
**Target Platform**: Vercel / Node.js Environment
**Project Type**: Next.js Web Application  
**Performance Goals**: N/A (Security/Stability focus)  
**Constraints**: Zero vulnerabilities across all severities; No breaking changes to the "Realistic Zone" logic or UI components.  
**Scale/Scope**: ~20 direct dependencies, full transitive dependency tree.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Statistical Foundation**: N/A - Internal dependency maintenance. (Principle I)
- [x] **Historical Alignment**: N/A - Internal dependency maintenance. (Principle II)
- [x] **Realistic Zone**: N/A - Internal dependency maintenance. (Principle III)
- [x] **Responsible Disclosure**: Yes - Fixes to `next` and `postcss` must not impact the visibility or functionality of the mandatory disclaimer. (Principle IV)
- [x] **Validation Protocol**: Yes - Build and test suite execution will serve as the primary validation gate. (Principle V)

## Project Structure

### Documentation (this feature)

```text
specs/002-fix-npm-vulnerabilities/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# Single project structure
package.json            # Root configuration for dependency overrides
package-lock.json       # Generated lockfile after resolution
```

**Structure Decision**: Single project structure selected. The primary implementation point is the root `package.json` file.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
