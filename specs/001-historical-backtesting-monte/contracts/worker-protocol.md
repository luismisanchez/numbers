# Worker Protocol: Simulation Lab

This document defines the message protocol between the Main Thread and the `simulator.worker.ts`.

## Message Flow: Start Simulation

**Direction**: Main → Worker

```typescript
{
  type: 'START_SIMULATION',
  payload: {
    count: number,        // e.g., 10000
    logic: 'hybrid' | 'random' | 'weighted',
    historicalData: Draw[], // Required for weight calibration
    targetDate?: string     // If backtesting
  }
}
```

## Message Flow: Progress Update

**Direction**: Worker → Main

```typescript
{
  type: 'SIMULATION_PROGRESS',
  payload: {
    current: number,
    total: number,
    percent: number
  }
}
```

## Message Flow: Simulation Complete

**Direction**: Worker → Main

```typescript
{
  type: 'SIMULATION_COMPLETE',
  payload: {
    distribution: Record<number, number>, // Score -> Count
    mean: number,
    sd: number,
    elapsedMs: number
  }
}
```

## Message Flow: Error

**Direction**: Worker → Main

```typescript
{
  type: 'SIMULATION_ERROR',
  payload: {
    message: string,
    stack?: string
  }
}
```
