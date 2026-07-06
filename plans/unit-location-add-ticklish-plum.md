# Plan: Clear Mock Data + CEO Rename + First-Project Dashboard + Back Buttons + Stage Text Field

## Context
All changes apply to `src/app/App.tsx`. The file still contains hardcoded mock data arrays and "Bhagwat Sheth". Five targeted changes needed.

---

## Change 1 — Clear All Pre-filled Mock Data

Replace every hardcoded mock array with an empty typed array (keep the `const` name so nothing else breaks):

| Variable | Action |
|---|---|
| `recentBookings` | `= []` with inline type |
| `recentInvestments` | `= []` |
| `paymentRequests` | `= []` |
| `costTrend` | `= []` |
| `customersList` | `= []` |
| `flatData` (24-item `Array.from`) | `= []` |
| `mockReceivedLog` | `= []` |
| `defaultSlabs` | `= []` |

For every `.map()` over these arrays in the Dashboard / CustomerSales / ReceivedPayment / PaymentSlabs render blocks, add an empty-state row:
```tsx
{arr.length === 0 && (
  <tr><td colSpan={99} className="text-center py-6 text-sm text-gray-400">No data yet.</td></tr>
)}
```
Or for `div`-based lists: `{arr.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No data yet.</p>}`

---

## Change 2 — Rename "Bhagwat Sheth" → "CEO"

Two locations:
1. **Sidebar footer** (~line 246): name text → `CEO`, subtitle → `Nirmiti Developers`, avatar initials `BS` → `CE`
2. **TopBar** (~line 302): `<span>Bhagwat Sheth</span>` → `<span>CEO</span>`, avatar `BS` → `CE`

---

## Change 3 — Dashboard: Show First Project Hero Banner

Add `const firstProject = projects[0] ?? null;` inside `Dashboard`.

Insert as the **first child** of the return `<div className="p-6 space-y-5">`:

```tsx
{firstProject ? (
  <div className="bg-[#0f1a35] rounded-2xl px-6 py-5 flex items-center justify-between shadow-sm">
    <div>
      <p className="text-blue-300/60 text-[10px] font-semibold uppercase tracking-widest">Active Project</p>
      <h2 className="text-white text-2xl font-bold">{firstProject.name}</h2>
      <div className="flex items-center gap-3 mt-1">
        <span className="type-pill">{firstProject.propType}</span>
        <span>{firstProject.totalFlats} flats</span>
        {firstProject.totalShops > 0 && <span>· {firstProject.totalShops} shops</span>}
      </div>
    </div>
    <div className="flex gap-6">
      {[Booked, Available, Occupancy%].map(...)}
    </div>
  </div>
) : (
  <div className="bg-[#0f1a35] rounded-2xl px-6 py-5 flex items-center gap-4">
    <Building2 className="text-blue-400" />
    <p className="text-white">No project yet — go to Projects to create one.</p>
  </div>
)}
```

Also replace the three static KPI row-2 values (₹38.6Cr, 23 overdue, ₹5,240) with `—` and descriptive subtitles, since data is now empty.

Add an **All Projects list** card below the KPI rows, showing each project's name, type, booked count, available count, and an occupancy progress bar — all derived live from the `projects` prop.

---

## Change 4 — Back Buttons: ProjectSetup and PaymentSlabs

### ProjectSetup
- Add `onBack?: () => void` to props interface
- Render `{onBack && <button onClick={onBack}>← Back to Sales</button>}` at the top of the JSX
- Pass from App: `<ProjectSetup onCreate={...} onBack={() => setPage("sales")} />`

### PaymentSlabs
- Add `onBack?: () => void` to props interface
- Same back button at the top of the JSX
- Pass from App: `<PaymentSlabs projects={projects} onBack={() => setPage("sales")} />`

---

## Change 5 — Stage Field: Dropdown → Text Input

In `PaymentSlabs` new-slab form, replace:
```tsx
<select value={newStage} onChange={...}>
  {SLAB_STAGES.map(s => <option key={s}>{s}</option>)}
</select>
```
with:
```tsx
<input type="text" value={newStage} onChange={e => setNewStage(e.target.value)}
  placeholder="e.g. Plinth, 1st Slab, Roof Slab…"
  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm ..." />
```
Reset on submit: `setNewStage("")` instead of `setNewStage(SLAB_STAGES[2])`.

---

## Files Modified
- `src/app/App.tsx` only

## Verification
1. Dashboard: dark hero shows first project name & live stats; no hardcoded numbers anywhere.
2. Sidebar bottom and TopBar both read "CEO".
3. Payment Slabs page: "← Back to Sales" button at top; Stage is a free-text input.
4. Projects page: "← Back to Sales" button at top.
5. Customer / Sales / ReceivedPayment tables all show "No data yet." empty states.
