# Inventory module — change log (Phase 1)

## Summary

Replaced the flat “Inventory under construction” placeholder with a modular **Inventory shell**: head navigation (Materials | Suppliers | Contractors | POs | **Work Order**), six KPI cards, activity tabs (Recent Orders | Overdue Payment), mock seed data under `src/lib/inventory/`, API list stubs, and nested React Router routes. Sub-pages are light stubs until Phase 2.

## New files

| Path | Role |
|------|------|
| `src/lib/inventory/inventoryTypes.ts` | Types: Material, Supplier, Contractor, PurchaseOrder, **WorkOrder**, OverdueBill, InventoryKpis |
| `src/lib/inventory/mockInventoryData.ts` | Phase 1 mock seed arrays (incl. **MOCK_WORK_ORDERS**) + pending bills total |
| `src/lib/inventory/inventoryMetrics.ts` | `computeInventoryKpis()` |
| `src/lib/api/inventory/materials.ts` | `materialsApi.list` → `GET /api/inventory/materials` |
| `src/lib/api/inventory/suppliers.ts` | `suppliersApi.list` |
| `src/lib/api/inventory/contractors.ts` | `contractorsApi.list` |
| `src/lib/api/inventory/purchaseOrders.ts` | `purchaseOrdersApi.list` |
| `src/lib/api/inventory/workOrders.ts` | `workOrdersApi.list` → `GET /api/inventory/work-orders` |
| `src/components/pages/inventory/InventoryLayout.tsx` | Shell: title, head nav, KPIs, activity tabs, `<Outlet />` |
| `src/components/pages/inventory/InventoryKpiGrid.tsx` | Six KPI cards |
| `src/components/pages/inventory/InventoryActivityTabs.tsx` | Recent Orders / Overdue Payment tabs |
| `src/components/pages/inventory/RecentPurchaseOrdersPanel.tsx` | PO table panel |
| `src/components/pages/inventory/InventoryOverduePaymentsPanel.tsx` | Overdue bills table panel |
| `src/components/pages/inventory/Materials.tsx` | Stub under Outlet |
| `src/components/pages/inventory/Suppliers.tsx` | Stub under Outlet |
| `src/components/pages/inventory/Contractors.tsx` | Stub under Outlet |
| `src/components/pages/inventory/PurchaseOrders.tsx` | Stub under Outlet |
| `src/components/pages/inventory/WorkOrders.tsx` | Stub under Outlet (next to POs) |
| `docs/INVENTORY_CHANGES.md` | This change log |

## Modified files (main app wiring)

| Path | What changed |
|------|----------------|
| `src/app/routes.tsx` | Nested layout + children (`materials`, `suppliers`, `contractors`, `purchase-orders`, **`work-orders`**); index redirects to `materials` |
| `src/app/routePages.tsx` | `InventoryLayoutRoute` + sub-routes including **`WorkOrdersRoute`** |
| `src/app/routeRegistry.ts` | Wiring rows for inventory sub-paths including **`inventory/work-orders`** |
| `src/app/App.tsx` | Sidebar active key: any `pathname.startsWith("/inventory")` maps to inventory |
| `src/lib/api/index.ts` | Re-exports materials/suppliers/contractors/purchaseOrders/**workOrders** APIs |

## Deleted files

| Path | Reason |
|------|--------|
| `src/components/pages/inventory/Inventory.tsx` | Single placeholder replaced by `InventoryLayout` + nested stubs |

## Routes before → after

**Before**

| Path | UI |
|------|-----|
| `/inventory` | Placeholder “under construction” |

**After**

| Path | UI |
|------|-----|
| `/inventory` | Redirect → `/inventory/materials` |
| `/inventory/materials` | Layout shell + Materials stub |
| `/inventory/suppliers` | Layout shell + Suppliers stub |
| `/inventory/contractors` | Layout shell + Contractors stub |
| `/inventory/purchase-orders` | Layout shell + POs stub |
| `/inventory/work-orders` | Layout shell + Work Order stub |

Sidebar: still one item **Inventory** → `/inventory` (no extra side nav for sub-sections). Head tabs only.

### Head nav order

Materials → Suppliers → Contractors → **POs** → **Work Order**

## KPI definitions

| Card | Definition (mock) |
|------|-------------------|
| Low Materials | Count of materials with `quantity < reorderLevel` |
| Total Materials | `materials.length` |
| Total Suppliers | `suppliers.length` |
| Total Contractors | `contractors.length` |
| Total Material Costing (₹) | Σ `quantity × unitCost` via `fmt()` |
| Total Payment (₹) | Sum of overdue bill `dueAmount` (mock pending total) |

## Activity tabs

| Tab | Content |
|-----|---------|
| Recent Orders | Last POs from mock (status badges); “View all” → `/inventory/purchase-orders` |
| Overdue Payment | Overdue supplier/contractor bills from mock |

## API stubs added

| Method | Path | Client |
|--------|------|--------|
| GET | `/api/inventory` | `inventoryApi.list` (existing) |
| GET | `/api/inventory/materials` | `materialsApi.list` |
| GET | `/api/inventory/suppliers` | `suppliersApi.list` |
| GET | `/api/inventory/contractors` | `contractorsApi.list` |
| GET | `/api/inventory/purchase-orders` | `purchaseOrdersApi.list` |
| GET | `/api/inventory/work-orders` | `workOrdersApi.list` |

Phase 1 UI does **not** call these yet (mock only). Backend can implement later; see also `docs/BACKEND_API_SPEC.txt`.

## Phase 1.1 — Work Order (added next to POs)

Same pattern as Purchase Orders:

| Layer | Path |
|-------|------|
| Type | `WorkOrder` in `inventoryTypes.ts` |
| Mock | `MOCK_WORK_ORDERS` in `mockInventoryData.ts` |
| API | `src/lib/api/inventory/workOrders.ts` |
| Page | `src/components/pages/inventory/WorkOrders.tsx` |
| Route | `/inventory/work-orders` → `WorkOrdersRoute` |
| Registry | `inventory/work-orders` wiring row |
| Head tab | Label **Work Order** after **POs** |

## Phase 1.2 — Inventory Settings head navigation

Same head tabs as main Inventory (Materials | Suppliers | Contractors | POs | Work Order), under **Settings → Inventory**.

### New settings files

| Path | Role |
|------|------|
| `src/components/pages/settings/InventorySettings.tsx` | Layout: title + head nav + `<Outlet />` (replaced placeholder) |
| `src/components/pages/settings/inventory/MaterialsSettings.tsx` | Stub |
| `src/components/pages/settings/inventory/SuppliersSettings.tsx` | Stub |
| `src/components/pages/settings/inventory/ContractorsSettings.tsx` | Stub |
| `src/components/pages/settings/inventory/PurchaseOrdersSettings.tsx` | Stub |
| `src/components/pages/settings/inventory/WorkOrdersSettings.tsx` | Stub |

### Modified wiring

| Path | What changed |
|------|----------------|
| `src/app/routes.tsx` | Nested `settings/inventory` children + redirect to `materials` |
| `src/app/routePages.tsx` | `Inventory*SettingsRoute` exports for each sub-tab |
| `src/app/routeRegistry.ts` | Rows for `settings/inventory/*` |
| `src/app/App.tsx` | `pathname.startsWith("/settings/inventory")` → settings page key |
| `src/components/navigation/Sidebar.tsx` | Nested inventory settings paths + Settings → Inventory → materials |
| `src/components/pages/settings/SettingsLayout.tsx` | Inventory tab still points at `/settings/inventory` (redirects to materials) |

### Settings routes

| Path | UI |
|------|-----|
| `/settings/inventory` | Redirect → `/settings/inventory/materials` |
| `/settings/inventory/materials` | Materials Settings stub |
| `/settings/inventory/suppliers` | Suppliers Settings stub |
| `/settings/inventory/contractors` | Contractors Settings stub |
| `/settings/inventory/purchase-orders` | POs Settings stub |
| `/settings/inventory/work-orders` | Work Order Settings stub |

Head nav order (same as main Inventory): Materials → Suppliers → Contractors → POs → Work Order.

## Unchanged

- Sidebar still has a single main **Inventory** module entry (`/inventory`)  
- No full settings forms / CRUD yet  
- No `useAppData` inventory entity store yet  

## Phase 2 — Materials list + Add Material path

### Summary

Materials page under inventory Outlet: **Add Material** button (top-right), **Material List** table, **Low Materials** table (low stock only, qty ascending). Types extended for PO/WO pipeline. Add form path reserved for next design.

### Material fields (pipeline-ready)

| Field | Role |
|-------|------|
| `id` | Stable key; FK for PO `materialId` / WO `materialIds` |
| `name`, `type` | Catalog |
| `workCategories[]` | Aligns with work-order trades |
| `quantity`, `reorderLevel`, `unit`, `unitCost` | Stock + KPI |
| `currentSupplierId` / `currentSupplierName` | Supplier FK + display |

Low stock: `quantity < reorderLevel` via `getLowMaterialsSorted()` in `materialHelpers.ts`.

### New files

| Path | Role |
|------|------|
| `src/lib/inventory/materialHelpers.ts` | `isLowStock`, `getLowMaterialsSorted` |
| `src/components/pages/inventory/buttons/AddMaterialButton.tsx` | Navigates to `/inventory/materials/add` |
| `src/components/pages/inventory/materials/MaterialListTable.tsx` | Shared table (list + low) |
| `src/components/pages/inventory/AddMaterial.tsx` | Form placeholder |

### Modified files

| Path | Change |
|------|--------|
| `src/lib/inventory/inventoryTypes.ts` | Material fields; PO `materialId?`; WO `materialIds?` |
| `src/lib/inventory/mockInventoryData.ts` | Rich materials + PO/WO FKs |
| `src/components/pages/inventory/Materials.tsx` | Full list UI |
| `src/components/pages/inventory/InventoryLayout.tsx` | Materials tab active on `/materials/add` |
| `src/app/routes.tsx` | `materials/add` route |
| `src/app/routePages.tsx` | `AddMaterialRoute` |
| `src/app/routeRegistry.ts` | `inventory/materials/add` wiring |

### Routes

| Path | UI |
|------|-----|
| `/inventory/materials` | Material List + Low Materials + Add button |
| `/inventory/materials/add` | Add Material placeholder (form next) |

### Table columns

Name | Type | Work categories | Quantity | Current supplier

### Out of scope / next

1. Full Add Material form (name, type, categories, qty, supplier + save)  
2. Suppliers / Contractors directory pages  
3. Full POs / Work Orders UI using `materialId`  
4. More Inventory Settings forms  
5. API-backed inventory entities  

## Phase 2.1 — Clean inventory pages + material units

### Layout

- Removed **KPI cards** and **Recent Orders / Overdue Payment** from `InventoryLayout`.
- Clicking Inventory head tabs opens only that **page** in the outlet (Materials list, etc.).
- KPI/activity component files kept on disk for later reuse (not rendered).

### Units (Settings → Inventory → Materials)

| Piece | Detail |
|-------|--------|
| Type | `InventorySettingsData.units: string[]` |
| Defaults | bags, tons, cu.ft., nos, sq.ft., cu.m., kg, liters |
| Save | `updateInventorySettings({ units })` → localStorage (or API when enabled) |
| UI | Text field + **Save unit**; list with remove |
| Add Material | **Unit** `<select>` options from `inventorySettings.units` |

### Files touched (Phase 2.1)

| Path | Change |
|------|--------|
| `InventoryLayout.tsx` | Head nav + Outlet only |
| `settingsTypes.ts` | `InventorySettingsData` |
| `defaultSettings.ts` | `createDefaultInventorySettings`, `resolveInventorySettings` |
| `useAppData.ts` | Typed inventory settings update |
| `MaterialsSettings.tsx` | Unit field + save |
| `AddMaterial.tsx` | Unit dropdown from settings |
| store / seed / localStorage / api inventory settings | Persist units |

## Phase 2.2 — Inventory home (KPIs) vs section pages (Back)

### Behavior

| Path | Content |
|------|---------|
| `/inventory` | **Home:** KPI cards + Recent Orders / Overdue Payment |
| `/inventory/materials` (etc.) | **Section page** only; **Back to Inventory** returns home |

- Head tabs open section pages (Materials, Suppliers, Contractors, POs, Work Order).  
- Button: `buttons/BackToInventoryButton.tsx` → `/inventory`.  
- Index route is `InventoryHome` (no longer redirects to materials).

### New files

| Path | Role |
|------|------|
| `InventoryHome.tsx` | KPI grid + activity tabs |
| `buttons/BackToInventoryButton.tsx` | Return to home |

## Phase 3 — Add Material form + multi-delete + PO link

### Add Material (`/inventory/materials/add`)

| Field | Source |
|-------|--------|
| Material name | text (required) |
| Type | text (required) |
| Categories | comma-separated → `workCategories[]` |
| Unit | dropdown from Settings units |

- Save → `addMaterial` → store `materials[]` with stable **`id`** (`MAT-…`).  
- **PO connection:** `PurchaseOrder.materialId` = `Material.id` (seed POs already set). New materials can be linked when creating POs later.

### Materials list delete

- Checkbox per row + select all  
- **Delete (N)** → confirm → `deleteMaterials(ids)`  
- Warns if selected materials are referenced by purchase orders (history kept on PO)

### Store

| Field | Role |
|-------|------|
| `materials` | Catalog list |
| `purchaseOrders` | POs with `materialId` FK |

### New / key files

| Path | Role |
|------|------|
| `lib/inventory/createMaterial.ts` | Form → Material builder + id |
| `buttons/DeleteMaterialsButton.tsx` | Bulk delete |
| `AddMaterial.tsx` | Full form |
| `Materials.tsx` | Selection + store list |
| `useAppData` | `materials`, `purchaseOrders`, `addMaterial`, `deleteMaterials` |

## Phase 3.1 — View all, Export, units delete fix

### Bug fix: units not deleting

`resolveInventorySettings` treated empty `units: []` as “missing” and restored 8 defaults.  
**Fix:** only use defaults when `units` is **undefined**; empty array is valid.

### View all + Export

| Piece | Path / role |
|-------|-------------|
| View all button | `buttons/ViewAllMaterialsButton.tsx` → `/inventory/materials/all` |
| Export button | `buttons/ExportMaterialsButton.tsx` (CSV; includes material **id** for PO) |
| Export helper | `lib/inventory/exportMaterials.ts` |
| Full list page | `MaterialsAll.tsx` |

Material List header: **View all**. Toolbar: **Export**. All page: Export + Back.

### Unit UI

- Settings: clearer **Unit name** text field + Add unit  
- Add Material: settings **dropdown** + **custom unit** text field (custom wins if filled)

## Phase 4 — Suppliers (same structure as Materials) + shared work categories

### Suppliers

| Feature | Detail |
|---------|--------|
| Table | Supplier id, Name, Work categories |
| View all | `/inventory/suppliers/all` + Export |
| Export | id, name, categories, phone, email |
| Add / Delete | multi-select delete; Add Supplier form |
| PO link | `PurchaseOrder.supplierId` |

### Shared work categories

- Stored in `inventorySettings.workCategories`
- Managed under **Settings → Inventory → Suppliers**
- Used as **checkbox multi-select** on Add Material and Add Supplier (not free text)

### Key files

- `Suppliers.tsx`, `SuppliersAll.tsx`, `AddSupplier.tsx`
- `suppliers/SupplierListTable.tsx`
- `buttons/*Supplier*.tsx`, `exportSuppliers.ts`, `createSupplier.ts`

## How to verify

### Main Inventory

1. `npm run dev` → http://localhost:5173  
2. Inventory → **Suppliers** → list (id, name, work categories)  
3. **View all** + **Export**; **Add Supplier** with category checkboxes  
4. **Materials → Add Material** → work categories are multi-select (same list)  
5. Settings → Inventory → Suppliers → add/remove work categories  
6. Materials View all / Export still work  



### Inventory Settings

1. Settings → **Inventory**  
2. Land on `/settings/inventory/materials`  
3. Head tabs: Materials | Suppliers | Contractors | POs | Work Order  
4. Materials settings: type a unit → **Save unit** → appears in list  
5. Inventory → Materials → **Add Material** → Unit dropdown shows saved units  


## Phase 4.1 — Suppliers status/payment/id prefix (no hard delete)
- Delete removed; select rows → **Active** / **Inactive** buttons
- Columns: id, name, work categories, payment, status
- Add form: id (settings prefix), name, phone, email, categories, address, pincode, payment
- Settings: supplierIdPrefix + next sequence

## Phase 4.2 — Contractors parity with Suppliers
- List / Edit→Inactive / View all / Export / Add (id prefix, name, work profile text, categories dropdown+text, phone, email, address, pincode, status)
- Routes: `/inventory/contractors`, `/all`, `/add`
- Settings → Inventory → Contractors: ID prefix

---

## Phase 5 — Create/Edit map + backend impact (pre-inventory systems)

Documentation-only sync with frontend as built. Full endpoint contracts: `docs/BACKEND_API_SPEC.txt` (Inventory module section).

### MOST IMPORTANT — Backend impact on systems *before* inventory

#### Shared API client (all modules)

| File | Lines | Change |
|------|-------|--------|
| `src/lib/api/client.ts` | **1–68** | Optional `scope: "default" \| "inventory"` on `apiRequest` / `apiRequestBlob`; inventory scope prefers `VITE_INVENTORY_API_KEY` then `VITE_API_KEY` |

Pre-inventory modules (Sales, Customers, Projects, Dashboard, WhatsApp) omit the 3rd arg → **default scope unchanged**.

#### Sales vs inventory payment ledger (no name clash)

| System | Export | File | URL |
|--------|--------|------|-----|
| **Sales (before inventory)** | `paymentLedgerApi` | `src/lib/api/sales/paymentLedger.ts` **17–23** | `/api/customers/:id/payment-ledger` |
| **Inventory (new)** | `inventoryPaymentLedgerApi` | `src/lib/api/inventory/paymentLedger.ts` **20–27** | `/api/inventory/payment-ledger` |

`src/lib/api/index.ts`: sales export **11**; inventory payment exports **27–46**.

#### AppStore (optional fields — old localStorage still loads)

| File | Lines | Fields |
|------|-------|--------|
| `src/lib/storage/storeTypes.ts` | **40–49** | `inventorySettings?`, `materials?`, `suppliers?`, `contractors?`, `purchaseOrders?` |
| `seedStore.ts` | **35–53** | seed mocks |
| `localStorageRepo.ts` | **24–44** | merge defaults |
| `apiRepository.ts` | **105** | `inventorySettingsApi.get().catch(() => createDefaultInventorySettings())` — **non-fatal** so Customers/Sales hydrate still works |

#### Settings (shell existed before full inventory UI)

| File | Lines | Contract |
|------|-------|----------|
| `settingsTypes.ts` | **51–66** | `InventorySettingsData` |
| `settings/inventorySettings.ts` | **4–10** | `GET/PATCH /api/settings/inventory` |

Profile / business / customers / sales settings paths **unchanged**.

#### Does **not** change pre-inventory backend

- Customers, Sales slabs/received/allocate/invoices  
- Projects CRUD, Dashboard  
- WhatsApp / Messenger  
- Sales `paymentLedgerApi` URL  

#### New backend contracts (see BACKEND_API_SPEC)

| Method | Path | Client file |
|--------|------|-------------|
| GET | `/api/inventory/materials` | `materials.ts` **4–6** |
| GET | `/api/inventory/suppliers` | `suppliers.ts` **4–6** |
| GET | `/api/inventory/contractors` | `contractors.ts` **4–6** |
| GET | `/api/inventory/purchase-orders` | `purchaseOrders.ts` **4–6** |
| GET | `/api/inventory/work-orders` | `workOrders.ts` **4–6** |
| GET/POST | `/api/inventory/suppliers/:id/payments` (+ summary) | `supplierPayments.ts` **15–29** |
| GET/POST | `/api/inventory/contractors/:id/payments` (+ summary) | `contractorPayments.ts` **14–29** |
| GET/PATCH | `/api/inventory/purchase-orders/:id/payment` | `purchaseOrderPayments.ts` **16–29** |
| GET/PATCH | `/api/inventory/work-orders/:id/payment` | `workOrderPayments.ts` **16–29** |
| GET | `/api/inventory/payment-ledger?...` | `paymentLedger.ts` **20–27** |

---

### CREATE — path + lines + code

#### Create Material

| Layer | File | Lines |
|-------|------|-------|
| Form type | `src/lib/inventory/createMaterial.ts` | **3–11** |
| Build | `createMaterial.ts` | **29–45** |
| Hook | `src/hooks/useAppData.ts` | **751–760** |
| UI submit | `AddMaterial.tsx` | **71–76** |
| Route | `routes.tsx` | **93** → `/inventory/materials/add` |

```ts
// createMaterial.ts  36–40
  return {
    id: generateMaterialId(),
    name: input.name.trim(),
    type: input.type.trim(),
    workCategories,
    unit: input.unit.trim(),
```

```ts
// useAppData.ts  751–757
  const addMaterial = useCallback(
    (input: AddMaterialFormInput) => {
      if (!store) return null;
      const material = buildMaterialFromForm(input);
      const next = [...(store.materials ?? materials), material];
      persist({ ...store, materials: next });
```

#### Create Supplier

| Layer | File | Lines |
|-------|------|-------|
| Form / build | `createSupplier.ts` | **4–16**, **18–41** |
| Normalize | `createSupplier.ts` | **43–54** |
| Hook | `useAppData.ts` | **781–799** (increments `supplierIdNext`) |
| UI | `AddSupplier.tsx` | **82+** |
| Route | `routes.tsx` | **96** → `/inventory/suppliers/add` |

```ts
// createSupplier.ts  29–40
  return {
    id: formatSupplierId(input.idPrefix, input.idNext),
    name: input.name.trim(),
    workCategories: [...input.workCategories],
    // ... phone, email, address, pinCode
    paymentTotal: total,
    paymentRemaining: remaining,
    status: input.status ?? "active",
  };
```

#### Create Contractor

| Layer | File | Lines |
|-------|------|-------|
| Form / build | `createContractor.ts` | **4–17**, **19–45** |
| Normalize | `createContractor.ts` | **47–58** |
| Hook | `useAppData.ts` | **828–846** (increments `contractorIdNext`) |
| UI | `AddContractor.tsx` | **84+** |
| Route | `routes.tsx` | **103** → `/inventory/contractors/add` |

```ts
// createContractor.ts  31–44
  return {
    id: formatContractorId(input.idPrefix, input.idNext),
    name: input.name.trim(),
    workProfile,
    workCategories: [...input.workCategories],
    paymentTotal: total,
    paymentRemaining: remaining,
    status: input.status ?? "active",
    trade: workProfile || undefined,
  };
```

#### Domain types used by create

| Type | File | Lines |
|------|------|-------|
| `Material` | `inventoryTypes.ts` | **1–12** |
| `Supplier` | `inventoryTypes.ts` | **17–32** |
| `Contractor` | `inventoryTypes.ts` | **34–49** |
| `PurchaseOrder` (+ amount) | `inventoryTypes.ts` | **51–65** (`amountTotal`/`amountPaid` **61–64**) |
| `WorkOrder` (+ amount) | `inventoryTypes.ts` | **67–80** (**76–79**) |
| `PartyPaymentLine` | `paymentLedgerTypes.ts` | **5–15** |
| `InventorySettingsData` | `settingsTypes.ts` | **51–66** |

---

### EDIT — path + lines + code

#### Edit Material (multi-delete)

| Layer | File | Lines |
|-------|------|-------|
| UI | `Materials.tsx` | **34–41** |
| Hook | `useAppData.ts` | **762–772** |
| Button | `buttons/DeleteMaterialsButton.tsx` | full |

```ts
// useAppData.ts  762–769
  /** Remove materials by id. POs keep materialId/materialName for history (orphan FK ok). */
  const deleteMaterials = useCallback(
    (ids: string[]) => {
      if (!store || ids.length === 0) return false;
      const idSet = new Set(ids);
      const next = (store.materials ?? materials).filter((m) => !idSet.has(m.id));
      persist({ ...store, materials: next });
```

#### Edit Supplier (edit mode → Inactive + Delete)

| Layer | File | Lines |
|-------|------|-------|
| editMode | `Suppliers.tsx` | **20**, **40–47** |
| Inactive | `Suppliers.tsx` | **49–54** |
| Delete | `Suppliers.tsx` | **56–65** |
| Status hook | `useAppData.ts` | **801–813** |
| Delete hook | `useAppData.ts` | **861–870** |

```ts
// useAppData.ts  802–809
  const setSuppliersStatus = useCallback(
    (ids: string[], status: SupplierStatus) => {
      if (!store || ids.length === 0) return false;
      const idSet = new Set(ids);
      const next = (store.suppliers ?? suppliers).map((s) =>
        idSet.has(s.id) ? { ...normalizeSupplier(s), status } : normalizeSupplier(s)
      );
      persist({ ...store, suppliers: next });
```

#### Edit Contractor (same pattern)

| Layer | File | Lines |
|-------|------|-------|
| editMode / Inactive / Delete | `Contractors.tsx` | **16**, **37–42**, **46+**, **53–59** |
| Status / Delete hooks | `useAppData.ts` | **848–859**, **872–881** |

#### Edit payment Total / Remaining (rollup from PO / WO)

| Layer | File | Lines |
|-------|------|-------|
| summarize / from POs / from WOs | `paymentRollup.ts` | **12–30**, **33–54**, **57–78** |
| supplier / contractor rollup | `paymentRollup.ts` | **80–93**, **95–108** |
| Payment pages | `SupplierPaymentsPage.tsx`, `ContractorPaymentsPage.tsx` | full |
| Routes | `routes.tsx` | **97–100**, **104–107** |
| PO payment PATCH API | `purchaseOrderPayments.ts` | **23–28** |
| WO payment PATCH API | `workOrderPayments.ts` | **23–28** |

```ts
// paymentRollup.ts  36–48
export function linesFromPurchaseOrders(supplierId: string, orders: PurchaseOrder[]): PartyPaymentLine[] {
  return orders
    .filter((po) => po.supplierId === supplierId)
    .map((po) => {
      const amountTotal = po.amountTotal ?? 0;
      const amountPaid = po.amountPaid ?? 0;
      return {
        id: `pay-po-${po.id}`,
        partyType: "supplier" as const,
        partyId: supplierId,
        sourceType: "purchase_order" as const,
```

---

### Routes (create + edit entry)

**File:** `src/app/routes.tsx` **87–110**

| Path | Purpose |
|------|---------|
| `/inventory/materials` | list + multi-delete |
| `/inventory/materials/add` | **create** |
| `/inventory/materials/all` | view all / export |
| `/inventory/suppliers` | list + **edit mode** |
| `/inventory/suppliers/add` | **create** |
| `/inventory/suppliers/:supplierId/payments` | payment view |
| `/inventory/contractors` | list + **edit mode** |
| `/inventory/contractors/add` | **create** |
| `/inventory/contractors/:contractorId/payments` | payment view |
| `/inventory/purchase-orders` | PO list (stub) |
| `/inventory/work-orders` | WO list (stub) |

### Env (`.env.example`)

```env
VITE_API_URL=http://localhost:3001
VITE_USE_API=false
# VITE_API_KEY=
# VITE_INVENTORY_API_KEY=
```

### Verification (Phase 5)

1. Pre-inventory: Dashboard, Customers, Sales ledger, Projects still work.  
2. Create material / supplier / contractor → row appears; IDs use settings prefix.  
3. Edit supplier/contractor → Inactive + Delete; materials multi-delete.  
4. Payments pages match rollup from PO/WO amounts.  
5. `paymentLedgerApi` (sales) ≠ `inventoryPaymentLedgerApi` (inventory).  
