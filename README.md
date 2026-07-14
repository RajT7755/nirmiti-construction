# Nirmiti Construction CMS — version4

**Nirmiti Developers Construction Management System** — React + Vite frontend with a mirrored API layer and full backend specification for Express.

| Item | Value |
|------|-------|
| **Repo** | [github.com/RajT7755/construction_cms](https://github.com/RajT7755/construction_cms) |
| **Branch** | **`version4`** — frontend + backend API spec |

> **Backend developers:** Start with **[docs/BACKEND_API_SPEC.txt](docs/BACKEND_API_SPEC.txt)** — endpoints, JSON bodies, and phased implementation checklist.

---

## Quick start (frontend)

```bash
git clone https://github.com/RajT7755/construction_cms.git
cd construction_cms
git checkout version4

cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

**Register** a new account on first visit, then complete **Project Setup**. Data persists in browser `localStorage` by default (`nirmiti_cms_store_v1`).

### Production build

```bash
npm run build
npm run preview
```

---

## Backend developers — start here

### 1. API specification (primary doc)

**[docs/BACKEND_API_SPEC.txt](docs/BACKEND_API_SPEC.txt)**

- Base URL: `http://localhost:3001`
- Phased endpoint checklist (projects → customers → sales → WhatsApp → auth/settings)
- Request/response JSON for every route
- Server `.env` and CORS setup

### 2. Frontend API modules (source of truth)

Each file under `src/lib/api/` defines the exact URL, HTTP method, and TypeScript types the frontend expects:

| Path | Purpose |
|------|---------|
| `src/lib/api/client.ts` | `apiRequest`, `apiRequestBlob` |
| `src/lib/storage/apiRepository.ts` | `hydrateFromApi()` — parallel load when API mode is on |
| `src/lib/api/projects/projects.ts` | Projects CRUD |
| `src/lib/api/customers/*.ts` | Customer profiles, bookings, export |
| `src/lib/api/sales/*.ts` | Slabs, payments, invoices, allocation |
| `src/lib/api/messenger/*.ts` | Slab schedule + overdue recipients |
| `src/lib/api/whatsapp/*.ts` | Single + bulk WhatsApp |
| `src/lib/api/settings/*.ts` | Profile, business, sales, messenger templates |
| `src/lib/api/auth/registration.ts` | Register / login |

### 3. Route wiring map

**[src/app/routeRegistry.ts](src/app/routeRegistry.ts)** — every page mapped to context fields, `useAppData` actions, and API modules:

| Section | Routes |
|---------|--------|
| `AUTH_WIRING` | login, register, logout |
| `ONBOARDING_WIRING` | setup (first project) |
| `APP_ROUTE_WIRING` | dashboard, customers, messenger, sales, projects, … |
| `SETTINGS_WIRING` | profile, business, inventory, sales, customers settings |

### 4. Wiring a new backend endpoint

Follow this order (also documented in `src/app/index.tsx`):

1. `src/lib/api/<module>/<file>.ts`
2. `src/lib/storage/apiRepository.ts`
3. `src/hooks/useAppData.ts`
4. `src/app/routePages.tsx`
5. `src/app/routeRegistry.ts`
6. `src/app/routes.tsx`
7. UI component under `src/components/pages/`

### 5. Enable API mode

**Frontend `.env`:**

```env
VITE_API_URL=http://localhost:3001
VITE_USE_API=true
```

**Server `.env`:**

```env
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

When `VITE_USE_API=true`, `useAppData` hydrates from your Express API on load instead of localStorage.

### 6. Type definitions

| File | Types |
|------|-------|
| `src/lib/types.ts` | `ProjectData`, `SlabEntry`, `ReceivedPayment`, `Invoice`, `Customer` |
| `src/lib/customers/customerDetailTypes.ts` | `CustomerDetailProfile`, slab ledger |
| `src/lib/settings/settingsTypes.ts` | `BusinessProfileData`, `MessengerTemplateSettings` |

### 7. Deployment notes

See **[docs/VPS_DEPLOYMENT.txt](docs/VPS_DEPLOYMENT.txt)** for Hostinger VPS discussion (Node + MySQL stack).

---

## v4 module status

| Module | Route | Status |
|--------|-------|--------|
| Auth (login / register / logout) | `/login`, `/register`, `/logout` | Ready (localStorage) |
| Project setup | `/setup` | Ready |
| Dashboard | `/dashboard` | Ready |
| Customers | `/customers` | Ready |
| Add customer | `/add-customer` | Ready |
| Messenger (WhatsApp) | `/messenger` | Ready (preview + outbox) |
| Sales | `/sales` | Ready |
| Payment slabs | `/payment-slabs` | Ready |
| Received payments | `/received-payment` | Ready |
| Invoice preview | `/sales/invoice/:id` | Ready |
| Projects | `/projects` | Ready |
| Settings — Profile | `/settings/profile` | Ready |
| Settings — Business profile | `/settings/business` | Ready |
| Settings — Message templates | `/settings/sales/message-templates` | Ready |
| Settings — Invoice template | `/settings/sales/invoice-template` | Ready |
| Inventory | `/inventory` | Placeholder |
| Shareholder | `/shareholder` | Placeholder |

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  React + Vite frontend (version4)     localhost:5173     │
│  routes.tsx → routePages.tsx → pages/ → lib/api/         │
│  useAppData + localStorage (default) or apiRepository    │
└──────────────────────────┬───────────────────────────────┘
                           │  VITE_USE_API=true
                           ▼
┌──────────────────────────────────────────────────────────┐
│  Express API (you implement)          localhost:3001     │
│  Spec: docs/BACKEND_API_SPEC.txt                         │
└──────────────────────────────────────────────────────────┘
```

---

## Environment variables

Copy `.env.example` to `.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3001` | Express API base URL |
| `VITE_USE_API` | `false` | `true` = fetch from backend; `false` = localStorage |

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server (port 5173) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |

---

## Author

**Raj Taware** — [RajT7755](https://github.com/RajT7755)

Built for **Nirmiti Developers** — Construction Management System.