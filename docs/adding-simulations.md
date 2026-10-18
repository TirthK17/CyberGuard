# Guide: Creating New Attack Sandboxes & Simulations

## 1. Overview
All CyberGuard simulations live under `src/components/simulations/` and utilize modular shared primitives from `src/components/simulations/shared/`. This ensures consistent UI frames, accessible keyboard navigation, streaming attacker terminal logs, and idempotent scoring.

---

## 2. Shared Components Catalog (`src/components/simulations/shared/`)

| Component | Responsibility |
|---|---|
| `SimHud` | Breadcrumb navigation, current act tracker, timed mode countdown, and score pill. |
| `ViewSwitcher` | Accessible tab switcher between Victim View, Attacker View, and Split Screen. |
| `AttackerTerminal` | Typewriter streaming terminal with `[+]`, `[!]`, and `[*]` prefixes and auto-scroll. |
| `PhoneFrame` | Device chrome simulating an Android / iOS smartphone with scrollable viewport. |
| `BrowserFrame` | macOS Safari-style window chrome simulating desktop browser interactions. |
| `DebriefCard` | End-of-scenario summary of attack tactics and real-world consequences. |
| `ScoreCard` | Final rating with itemized score breakdown and rule takeaway. |
| `useSimulationFlow` | State machine hook managing acts, scene history, timed mode, and score submission. |

---

## 3. Step-by-Step Implementation

### Step 1: Define Scene Data
Declare your simulation scenes as a typed configuration array:
```typescript
interface ScenarioScene {
  id: string;
  actTitle: string;
  prompt: string;
  options: {
    id: string;
    label: string;
    isSafe: boolean;
    points: number;
    feedback: string;
    nextSceneId: string;
  }[];
  attackerLogLines: string[];
}
```

### Step 2: Use `useSimulationFlow`
```typescript
export function MyNewSandbox({ onComplete }: { onComplete: (score: number) => void }) {
  const {
    currentScene,
    score,
    handleChoice,
    reset,
    timedMode,
    toggleTimedMode,
  } = useSimulationFlow({ scenes: MY_SCENES, onComplete });
  ...
}
```

### Step 3: Embed in `PhoneFrame` or `BrowserFrame`
Wrap your victim interface inside `<PhoneFrame>` or `<BrowserFrame>`:
```tsx
<div className="grid gap-6 lg:grid-cols-2">
  <PhoneFrame title="Secure Bank App">
    {/* Interactive Victim Screen */}
  </PhoneFrame>

  <AttackerTerminal
    logs={currentScene.attackerLogLines}
    title="C2 Adversary Terminal"
  />
</div>
```

### Step 4: Register Slug & Metadata
1. Add your simulation slug to `SANDBOXES` in `src/pages/SimulationPlayerPage.tsx`.
2. Add the database record to `DEFAULT_SIMULATIONS` in `src/lib/localDb.ts`.
3. Add the badge/category icon to `src/pages/SimulationsPage.tsx`.
