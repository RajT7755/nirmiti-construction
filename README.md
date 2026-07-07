# Nirmiti Developers — Construction Management System v4

Modular **Figma CRM frontend** for Nirmiti Group. This is the `version4` branch of [github.com/RajT7755/construction_cms](https://github.com/RajT7755/construction_cms).

| Branch | What it contains |
|--------|------------------|
| **`version4`** (this branch) | v3 frontend + wired API layer + **[Backend API Spec](docs/BACKEND_API_SPEC.md)** for Express |
| **`version3`** | Modular refactor — page-per-module, mirrored API layer, `useAppData` |
| **`version2`** | Advanced Figma UI — monolithic `App.tsx` (~2,900 lines) |
| **`main`** | v1 full-stack — React UI + Express API + Electron desktop |

> **Backend developers:** Read **[docs/BACKEND_API_SPEC.md](docs/BACKEND_API_SPEC.md)** for the full endpoint list, JSON request/response bodies, and implementation order.

**Design source:** [Figma — CRM Software](https://www.figma.com/design/iBcwibDvPJSyDNs9aunsqK/crm-software)

---

## What's New in v3

| Change | Description |
|--------|-------------|
| Modular pages | One file per sidebar module in `src/components/pages/` |
| Mirrored API | `src/lib/api/<module>/` matches page folder structure 1:1 |
| Slim `App.tsx` | ~376 lines — routing shell, login, setup only |
| Shared UI | `Button`, `Badge`, `Modal`, `ExportExcelButton`, `Sidebar` |
| Central state | `useAppData` hook with optional `VITE_USE_API=true` |
| Excel export | `ExportExcelButton` + `lib/export/excel.ts` (client-side CSV) |

---

## Features (Module Status)

| Module | Route | Status |
|--------|-------|--------|
| Login & Project Setup | setup flow | Ready |
| Dashboard | `dashboard` | Ready |
| Customer Sales | `customers` | Ready |
| Add Customer | `add-customer` | Ready (sub-route under Customers) |
| Sales Dashboard | `sales` | Ready |
| Payment Slabs | `payment-slabs` | Ready (sub-route under Sales) |
| Received Payments | `received-payment` | Ready (sub-route under Sales) |
| Projects | `projects` | Ready |
| Inventory | `inventory` | Placeholder |
| Shareholder | `shareholder` | Placeholder |
| Settings | `settings` | Placeholder |

v3 starts with **empty data**. All runtime data lives in React state via `useAppData` until `VITE_USE_API=true`.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  CRM Frontend (version3)          React + Vite + Tailwind│
│  http://localhost:5173                                   │
│                                                          │
│  App.tsx (shell) → pages/ → lib/api/ → Express backend  │
└──────────────────────────┬──────────────────────────────┘
                           │  VITE_API_URL (when VITE_USE_API=true)
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Express API (main branch)        http://localhost:3001 │
└─────────────────────────────────────────────────────────┘
```

---

## Prerequisites

- **Node.js** 18+
- **npm** or **pnpm**
- **Git**

> `node_modules/` and `dist/` are **not** committed. Run `npm install` after cloning.

---

## Quick Start

```bash
git clone https://github.com/RajT7755/construction_cms.git
cd construction_cms
git checkout version3

cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

**Default login:** any username + password (demo auth).

### Production build

```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to Vercel, Netlify, or any static host.

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3001` | Express API base URL |
| `VITE_USE_API` | `false` | `true` = fetch from backend; `false` = local React state |

---

## Project Structure

```
src/
├── app/
│   └── App.tsx                    # Routing shell (~376 lines)
├── components/
│   ├── navigation/
│   │   └── Sidebar.tsx            # 7-item main nav
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   └── ExportExcelButton.tsx
│   └── pages/
│       ├── dashboard/
│       │   └── Dashboard.tsx
│       ├── customers/
│       │   ├── CustomerSales.tsx
│       │   └── AddCustomer.tsx
│       ├── sales/
│       │   ├── Sales.tsx
│       │   ├── PaymentSlabs.tsx
│       │   └── ReceivedPayments.tsx
│       ├── inventory/
│       │   └── Inventory.tsx
│       ├── shareholder/
│       │   └── Shareholder.tsx
│       ├── projects/
│       │   └── Projects.tsx
│       └── settings/
│           └── Settings.tsx
├── hooks/
│   └── useAppData.ts              # Central state + API flag
├── lib/
│   ├── api/                       # Mirrors pages/ layout
│   │   ├── client.ts
│   │   ├── index.ts
│   │   ├── dashboard/dashboard.ts
│   │   ├── customers/
│   │   │   ├── customerSales.ts
│   │   │   ├── addCustomer.ts
│   │   │   └── export.ts
│   │   ├── sales/
│   │   │   ├── sales.ts
│   │   │   ├── paymentSlabs.ts
│   │   │   ├── receivedPayments.ts
│   │   │   └── export.ts
│   │   ├── inventory/inventory.ts
│   │   ├── shareholder/shareholder.ts
│   │   ├── projects/projects.ts
│   │   └── settings/settings.ts
│   ├── export/excel.ts
│   ├── types.ts
│   ├── utils.ts
│   ├── constants.ts
│   ├── projectUtils.ts
│   ├── mockData.ts
│   └── api.ts                     # Re-exports from api/index.ts
└── styles/
```

---

## Page ↔ API Mirror

Every page file has a matching API file at the same folder path:

| Page file | API file | Import |
|-----------|----------|--------|
| `pages/dashboard/Dashboard.tsx` | `api/dashboard/dashboard.ts` | `dashboardApi` |
| `pages/customers/CustomerSales.tsx` | `api/customers/customerSales.ts` | `customerSalesApi` |
| `pages/customers/AddCustomer.tsx` | `api/customers/addCustomer.ts` | `addCustomerApi` |
| Export button (customers) | `api/customers/export.ts` | `customersExportApi` |
| `pages/sales/Sales.tsx` | `api/sales/sales.ts` | `salesApi` |
| `pages/sales/PaymentSlabs.tsx` | `api/sales/paymentSlabs.ts` | `paymentSlabsApi` |
| `pages/sales/ReceivedPayments.tsx` | `api/sales/receivedPayments.ts` | `receivedPaymentsApi` |
| Export button (sales) | `api/sales/export.ts` | `salesExportApi` |
| `pages/inventory/Inventory.tsx` | `api/inventory/inventory.ts` | `inventoryApi` |
| `pages/shareholder/Shareholder.tsx` | `api/shareholder/shareholder.ts` | `shareholderApi` |
| `pages/projects/Projects.tsx` | `api/projects/projects.ts` | `projectsApi` |
| `pages/settings/Settings.tsx` | `api/settings/settings.ts` | `settingsApi` |

### API usage example

```ts
import { projectsApi } from "@/lib/api/projects/projects";

const projects = await projectsApi.list();
const created = await projectsApi.create(newProject);
```

---

## Navigation

**Sidebar (7 items):** Dashboard · Customers · Sales · Inventory · Shareholder · Projects · Settings

**Sub-routes (no sidebar entry):**

| Route | Reached from |
|-------|--------------|
| `add-customer` | Customers → Add Customer button |
| `payment-slabs` | Sales → Payment Slabs card |
| `received-payment` | Sales → Received Payments card |

---

## Frontend State (`useAppData`)

| State | Hook field | Description |
|-------|------------|-------------|
| Projects | `projects` | Created via Project Setup wizard |
| Customers | `customers` | Added via Add Customer form |
| Payment slabs | `slabs` | Managed in Payment Slabs page |
| Received payments | `receivedPayments` | Managed in Received Payments page |

```ts
const { projects, customers, slabs, receivedPayments, addProject, addCustomer } = useAppData();
```

When `VITE_USE_API=true`, the hook loads from the Express backend on mount.

---

## Backend Connection (optional)

### Step 1 — Run both services

```bash
# Terminal 1: backend (main branch)
git checkout main && npm run server:dev

# Terminal 2: frontend (version3 branch)
git checkout version3 && npm run dev
```

### Step 2 — Enable API mode

In `.env`:

```env
VITE_API_URL=http://localhost:3001
VITE_USE_API=true
```

On `main` branch backend `.env`:

```env
CORS_ORIGIN=http://localhost:5173
```

### Step 3 — API endpoints

| Type | Endpoint | Method |
|------|----------|--------|
| `Customer` | `/api/customers` | GET, POST |
| `ProjectData` | `/api/projects` | GET, POST |
| `SlabEntry` | `/api/payment-slabs` | GET, POST |
| `ReceivedPayment` | `/api/received-payments` | GET, POST |
| `DashboardSummary` | `/api/dashboard` | GET |

Proposed v3 routes may need to be added to `server/index.js` on the `main` branch.

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |

---

## Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | v1 — full-stack with Express + Electron |
| `version2` | v2 — standalone Figma CRM (monolithic App.tsx) |
| `version3` | v3 — modular pages + mirrored API (this branch) |

`version3` is frontend-only. Backend (`server/`) and Electron (`electron/`) live on `main`.

---

## Adding a New Module

1. Create `src/components/pages/<module>/<ModuleName>.tsx`
2. Create `src/lib/api/<module>/<moduleName>.ts` with matching camelCase name
3. Export from `src/lib/api/index.ts`
4. Add route id to `Page` type in `src/lib/types.ts`
5. Add nav item in `src/components/navigation/Sidebar.tsx` (if sidebar-visible)
6. Wire route in `src/app/App.tsx`

---

## Author

**Raj Taware** — [RajT7755](https://github.com/RajT7755)

Built for **Nirmiti Developers** — Construction Management System.