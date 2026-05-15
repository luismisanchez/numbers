# Research: Resolve Project Vulnerabilities

This document outlines the technical decisions and research findings for the "Resolve Project Vulnerabilities" feature.

## Technical Decisions

### 1. Dependency Resolution Strategy: Global Overrides
- **Decision**: Use the `overrides` field in `package.json` to force `postcss@8.5.14` across all dependency paths.
- **Rationale**: Standard `npm audit fix` suggests downgrading `next` to version 9, which would be a catastrophic breaking change for the current `next@16` project. Forcing the fixed `postcss` version directly resolves the XSS vulnerability (GHSA-qx2v-qp2m-jg93) for all consumers (Next.js, Tailwind, Vite) while maintaining framework stability.
- **Alternatives considered**:
    - `npm audit fix --force`: Rejected due to major version downgrades.
    - Manual update of direct dependencies: Rejected because the vulnerability is transitive (deep in the tree).

### 2. Validation Protocol: Incremental Build & Test
- **Decision**: Execute `npm run build` and `npx vitest run` immediately after applying overrides.
- **Rationale**: Ensures that forcing a newer version of `postcss` doesn't break the CSS processing pipeline or framework internals.
- **Alternatives considered**:
    - Full manual QA: Deemed secondary to automated build verification for this internal fix.

## Security Findings

| Package | Severity | CVE / Advisory | Path | Fix Version |
|---------|----------|----------------|------|-------------|
| postcss | Moderate | GHSA-qx2v-qp2m-jg93 | next -> postcss | 8.5.10+ |
| postcss | Moderate | GHSA-qx2v-qp2m-jg93 | tailwind -> postcss | 8.5.10+ |
