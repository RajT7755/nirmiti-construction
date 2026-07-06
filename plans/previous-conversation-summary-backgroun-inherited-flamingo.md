# Plan: Project Setup — Multi-Level Animated Configurator

## Context
The "Projects" nav item currently shows a plain placeholder. The user wants it replaced with a full multi-level project configurator: enter a project name, pick a property type (Residential / Commercial / Mixed-Use), then configure floors and units. Each level unlocks after the previous is completed, with a Fade-In + Slide-Up transition. The live summary card at the top updates on every keystroke.

## File to modify
`src/app/App.tsx` — single file, all changes contained here.

---

## Implementation Plan

### 1. Extend `Page` type
Add `"projects"` (already present) — no change needed; it's already in `NAV_ITEMS` and the render block.

### 2. Replace `Placeholder` for "projects" with `<ProjectSetup />`
In the App root render block change:
```tsx
{page === "projects" && <Placeholder title="Projects" />}
// → 
{page === "projects" && <ProjectSetup />}
```

### 3. State shape inside `ProjectSetup`

```ts
type PropertyType = "residential" | "commercial" | "semi";

interface CommercialConfig { floors: number; shopsPerFloor: number; areaPerShop: string; }
interface BhkRow { count: number; area: string; }
interface ResidentialConfig { floors: number; bhk: { "1BHK": BhkRow; "2BHK": BhkRow; "3BHK": BhkRow; "4BHK": BhkRow; }; }

// Active level: 1 | 2 | 3
// Completed levels tracked as Set<1|2|3>
// projectName: string
// propertyType: PropertyType | null
// commercial: CommercialConfig
// residential: ResidentialConfig
```

### 4. Level completion rules
- **Level 1 → 2**: `projectName.trim().length > 0`
- **Level 2 → 3**: `propertyType !== null`
- **Level 3**: no unlock needed — user fills config and hits "Create Project"

### 5. Animation (CSS, no motion/react)
Add a small `<style>` block or Tailwind `@keyframes` equivalent using inline style transitions:
- Entering level: `opacity: 0 → 1`, `translateY: 20px → 0`, duration `300ms`, `cubic-bezier(0.215, 0.610, 0.355, 1.000)`
- Completed levels: `transform: scale(0.98)`, pointer-events none, show green checkmark badge, fields become `readOnly` / `disabled`
- Use a React `key` trick or a CSS class `animate-level-in` applied when a level first becomes active

Implementation: each level card gets a wrapper div. When it transitions from locked → active, toggle a class that triggers the CSS transition. Simplest approach: store `justUnlocked` level in state, render the class for one render cycle.

### 6. Level 1 — Project Name + Live Summary Card
```
[Project Name input (full width)]          [Live Summary Card — sticky right]
                                            Total Units: {totalFlats + totalShops}
                                            {totalFlats} Flats | {totalShops} Shops
```
Right-aligned summary card updates on every state change using derived values (no useEffect needed).

### 7. Level 2 — Property Type Selector
Three large card buttons: 🏠 Residential | 🏢 Commercial | 🏢🏠 Semi (Mixed-Use)  
Active card gets navy border + blue background tint. Selecting any card immediately unlocks Level 3.

### 8. Level 3 — Dynamic Configurator

**Commercial** (Case A):
- Single horizontal row: `# Floors` counter + `Shops/Floor` counter + `Area (sq.ft.)` text input
- `+ Add Next Commercial Zone` button appends another row (array of CommercialConfig)
- Floor numbers generated automatically: floor index = cumulative

**Residential** (Case B):
- `# Floors` counter
- BHK composition panel: 4 rows (1BHK–4BHK), each with `[-][count][+]` stepper + area input
- Summary badge: "Calculated: {flatsPerFloor} Flats per Floor"

**Semi / Mixed-Use** (Case C):
- Info alert box at top
- Block 1: Commercial zone (same as Case A)
- Block 2: Residential zone (same as Case B)
- Visual divider between blocks

### 9. Live calculation logic (pure derived state, no useEffect)
```ts
// Commercial total
const totalShops = commercialZones.reduce((s, z) => s + z.floors * z.shopsPerFloor, 0);

// Residential total  
const flatsPerFloor = Object.values(residential.bhk).reduce((s, b) => s + b.count, 0);
const totalFlats = residential.floors * flatsPerFloor;

// Auto-generated floor array (for display / JSON payload)
const floorArray = [
  ...Array.from({ length: commercial.floors }, (_, i) => ({ index: i+1, type: "Commercial", ... })),
  ...Array.from({ length: residential.floors }, (_, i) => ({ index: commercial.floors + i+1, type: "Residential", ... })),
];
```

### 10. Color-coded tags (theme-consistent)
- Residential: `bg-blue-100 text-blue-700`
- Commercial: `bg-indigo-100 text-indigo-700`
- Semi: `bg-green-100 text-green-700`
- Completed level badge: `bg-green-50 text-green-600` with `✓`

### 11. Stepper counter component
Reusable inline `<Counter value min=0 onChange />` renders `[-] [n] [+]` buttons — used for floors, shops/floor, and BHK counts.

---

## Verification
1. Navigate to "Projects" in the sidebar — should show Level 1 (project name input + locked levels 2 & 3).
2. Type a name → Level 2 fades in with slide-up animation.
3. Select property type → Level 3 fades in; Level 2 shrinks to 0.98, shows ✓, fields locked.
4. Fill in floor/BHK config → Live summary card in Level 1 updates instantly.
5. Switch property types — Level 3 re-renders with correct Case A/B/C panel.
6. Test Mixed-Use: both commercial and residential blocks visible, totals sum correctly.
