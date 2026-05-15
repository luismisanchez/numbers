# Data Model: Resolve Project Vulnerabilities

This document defines the key entities and structures affected by the vulnerability resolution process.

## Entities

### 1. PackageConfig (Project Override)
Represents the project-level configuration used to force specific dependency versions.

| Field | Type | Description |
|-------|------|-------------|
| overrides | Object | Mapping of package names to fixed versions (semver). |
| resolutions | Object | (Alternative) Yarn-equivalent mapping for fixed versions. |

### 2. DependencyNode
Represents a single package in the dependency tree.

| Field | Type | Description |
|-------|------|-------------|
| name | String | Canonical package name. |
| version | String | Currently resolved version. |
| path | String[] | Hierarchy from root to this package (e.g., `["next", "postcss"]`). |
| vulnerability | Object? | Optional reference to a reported security risk. |

## Relationships

- **PackageConfig** modifies the resolution of **DependencyNode** across all matching paths in the tree.
- **DependencyNode** belongs to a parent **DependencyNode** (except the root project).
