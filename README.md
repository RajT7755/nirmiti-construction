# Nirmiti Developers — Construction Management System v3

Standalone **Figma CRM frontend** for Nirmiti Group. This is the `version3` branch of [github.com/RajT7755/construction_cms](https://github.com/RajT7755/construction_cms).

| Branch | What it contains |
|--------|------------------|
| **`version3`** (this branch) | Modular refactor — page-per-module structure, mirrored API layer, `useAppData` |
| **`version2`** | Advanced Figma UI — monolithic App.tsx |
| **`main`** | v1 full-stack — React UI + Express API + Electron desktop |

**Design source:** [Figma — CRM Software](https://www.figma.com/design/iBcwibDvPJSyDNs9aunsqK/crm-software)

---

## What's New in v3

| Change | Description |
|--------|-------------|
| Modular pages | `src/components/pages/` — one file per sidebar module |
| Mirrored API | `src/lib/api/<module>/` matches page folder structure |
| Slim App.tsx | ~376 lines (routing shell only) |
| Shared UI | `Button`, `Badge`, `Modal`, `ExportExcelButton`, `Sidebar` |
| State hook | `useAppData` with optional `VITE_USE_API=true` |

### Folder structure

```
src/components/pages/     src/lib/api/
├── dashboard/            ├── dashboard/
├── customers/            ├── customers/
├── sales/                ├── sales/
├── inventory/            ├── inventory/
├── shareholder/          ├── shareholder/
├── projects/             ├── projects/
└── settings/             └── settings/
```

---

## What's New in v2

| Module | Status | Description |
|--------|--------|-------------|
| Login & Project Setup | Ready | Multi-level wizard: buildings, wings, BHK, commercial zones |
| Dashboard | Ready | Live project hero, KPI cards, all-projects list |
| Customer Sales | Ready | Customer database, overdue list, status table |
| Add Customer | Ready | Registration form with flat grid |
| Sales Dashboard | Ready | Property metrics, payment tracking, donut chart |
| Payment Slabs | Ready | Construction-stage slabs, WhatsApp message templates |
| Received Payments | Ready | Payment log and recording form |
| Inventory | Planned | Placeholder |
| Shareholder | Planned | Placeholder |
| Settings | Planned | Placeholder |

v2 starts with **empty data** (no pre-filled mock customers). All runtime data lives in **frontend React state**.

---

## Architecture

```
┌─────────────────────────────┐
│  CRM Frontend (version2)    │  React + Vite + Tailwind
│  http://localhost:5173      │  Frontend state only
└──────────────┬──────────────┘
               │  future: VITE_API_URL
               ▼
┌─────────────────────────────┐
│  Express API (main branch)  │  Node.js + Express
│  http://localhost:3001      │  Run separately
└─────────────────────────────┘

┌─────────────────────────────┐
│  Electron Desktop (main)    │  Wraps v1 UI today
│  npm run electron:dev       │  Can adopt v2 build later
└─────────────────────────────┘
```

---

## Prerequisites

- **Node.js** 18+
- **npm** or **pnpm**
- **Git**

---

## Quick Start — CRM Web App (version3)

```bash
git clone https://github.com/RajT7755/construction_cms.git
cd construction_cms
git checkout version3

npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Production build

```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to Vercel, Netlify, or any static host.

---

## Quick Start — Backend (main branch, optional)

The v2 UI works without the backend. To run the API separately:

```bash
# In a second terminal / second clone
git clone https://github.com/RajT7755/construction_cms.git
cd construction_cms
git checkout main
npm install
npm run server:dev
```

API: [http://localhost:3001/api/health](http://localhost:3001/api/health)

---

## Quick Start — Desktop App (main branch)

Electron lives on `main`, not `version2`:

```bash
git checkout main
npm install
npm run dev          # Terminal 1
npm run electron:dev # Terminal 2
```

To use the v2 UI in Electron later, build v2 (`npm run build` on `version2`) and point Electron's production loader at the `dist/` folder.

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3001` | Express API base URL (for future integration) |

---

## Frontend State Model (v2)

All data is stored in React state — nothing is persisted to a database yet.

| State | Location | Description |
|-------|----------|-------------|
| `projects[]` | App root `useState` | Created via Project Setup wizard |
| `customersList[]` | `App.tsx` module scope | Empty; ready for Add Customer |
| `defaultSlabs[]` | `App.tsx` module scope | Empty; managed in Payment Slabs page |
| `mockReceivedLog[]` | `App.tsx` module scope | Empty; managed in Received Payment page |

Centralized hook (ready for API migration): [`src/hooks/useAppData.ts`](src/hooks/useAppData.ts)

---

## Backend Connection Guide

### Step 1 — Run both services

```bash
# Terminal 1: backend (main branch)
git checkout main && npm run server:dev

# Terminal 2: frontend (version2 branch)
git checkout version2 && npm run dev
```

Set in `.env`:
```env
VITE_API_URL=http://localhost:3001
```

Ensure backend `.env` has:
```env
CORS_ORIGIN=http://localhost:5173
```

### Step 2 — Map existing API endpoints

Types are defined in [`src/lib/types.ts`](src/lib/types.ts).  
Fetch helpers are in [`src/lib/api.ts`](src/lib/api.ts).

| Frontend type | API endpoint (main branch) | Method |
|---------------|---------------------------|--------|
| `Customer` | `/api/customers` | GET, POST |
| `Booking` | `/api/bookings` | GET |
| `Investment` | `/api/investments` | GET |
| `PaymentRequest` | `/api/payments` | GET |
| `FlatRecord` | `/api/flats` | GET |
| `DashboardSummary` | `/api/dashboard` | GET |

Example (not wired to UI yet):

```ts
import { api } from "@/lib/api";

const customers = await api.customers.list();
const health = await api.health();
```

### Step 3 — Add proposed v2 endpoints to `server/index.js` (main branch)

| Frontend type | Proposed endpoint | Method |
|---------------|-------------------|--------|
| `ProjectData` | `/api/projects` | GET, POST |
| `SlabEntry` | `/api/payment-slabs` | GET, POST |
| `ReceivedPayment` | `/api/received-payments` | GET, POST |

Stub implementations already exist in `src/lib/api.ts` — they will work once you add matching routes to `server/index.js` on `main`.

### Step 4 — Wire UI to API

Replace module-level arrays in `App.tsx` with the `useAppData` hook:

```ts
// Before (v2)
const [projects, setProjects] = useState<ProjectData[]>([]);

// After (connected)
const { projects, addProject } = useAppData();
// On mount:
useEffect(() => {
  api.projects.list().then(setProjects).catch(console.error);
}, []);
```

Repeat for customers, slabs, and received payments.

### Step 5 — Dashboard KPIs

Derive dashboard numbers from live API data instead of hardcoded values:

```ts
const summary = await api.dashboard();
// Or compute from projects + customers client-side
```

---

## Project Structure

```
construction-cms-v2/
├── src/
│   ├── app/
│   │   └── App.tsx          # Main UI (~2,900 lines)
│   ├── hooks/
│   │   └── useAppData.ts    # Central state hook
│   ├── lib/
│   │   ├── api.ts           # API client stubs
│   │   └── types.ts         # Shared TypeScript types
│   ├── imports/
│   │   └── nirmiti_logo.jpg
│   └── styles/
├── plans/                   # Implementation reference docs
├── package.json
├── vite.config.ts
├── .env.example
└── README.md
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |

---

## Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | v1 — full-stack with Express + Electron |
| `version2` | v2 — standalone Figma CRM frontend |

These branches have **independent file trees**. `version2` is frontend-only; `main` has `server/` and `electron/`.

---

## Author

**Raj Taware** — [RajT7755](https://github.com/RajT7755)

Built for **Nirmiti Developers** — Construction Management System.