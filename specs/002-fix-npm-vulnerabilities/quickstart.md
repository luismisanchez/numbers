# Quickstart: Resolve Project Vulnerabilities

Follow these steps to apply and verify the security fixes.

## 1. Audit Current State
Generate a fresh vulnerability report:
```bash
npm audit
```

## 2. Apply Security Overrides
Add the following to your `package.json`:
```json
{
  "overrides": {
    "postcss": "^8.5.14"
  }
}
```
Then update the lockfile:
```bash
npm install
```

## 3. Verify Resolution
Check that vulnerabilities are resolved:
```bash
npm audit
```

## 4. Run Stability Tests
Ensure no regressions were introduced:
```bash
npm run build
npx vitest run
```
