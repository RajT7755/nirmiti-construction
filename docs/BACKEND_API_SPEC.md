# Nirmiti CMS — Backend API Specification (version4)

**For backend developers implementing the Express API.**

| Item | Value |
|------|-------|
| Repo | [github.com/RajT7755/construction_cms](https://github.com/RajT7755/construction_cms) |
| Branch | `version4` (frontend + this spec) |
| Base URL | `http://localhost:3001` |
| Frontend port | `http://localhost:5173` |
| Auth | **Not required** — login page is client-side demo only. No `/api/login` route. |

---

## Quick setup

### Server `.env`

```env
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

### Frontend `.env` (to test against your API)

```env
VITE_API_URL=http://localhost:3001
VITE_USE_API=true
```

### CORS

```js
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());
```

---

## Frontend spec files (source of truth)

Each file in `src/lib/api/` defines the exact URL, HTTP method, and TypeScript request/response types the frontend expects.

| File | Endpoints |
|------|-----------|
| `src/lib/api/client.ts` | Base fetch client (`apiRequest`, `apiRequestBlob`) |
| `src/lib/storage/apiRepository.ts` | Master adapter — `hydrateFromApi()`, all modules |
| `src/lib/api/dashboard/dashboard.ts` | Dashboard summary |
| `src/lib/api/projects/projects.ts` | Projects CRUD |
| `src/lib/api/customers/customerSales.ts` | Legacy slim customer list |
| `src/lib/api/customers/addCustomer.ts` | Register + legacy create |
| `src/lib/api/customers/customerDetails.ts` | Full customer profiles |
| `src/lib/api/customers/temporaryBookings.ts` | Temporary bookings + proceed |
| `src/lib/api/customers/inactiveCustomers.ts` | Inactive customers |
| `src/lib/api/customers/export.ts` | Customer CSV export |
| `src/lib/api/sales/sales.ts` | Sales summary |
| `src/lib/api/sales/paymentSlabs.ts` | Payment slabs |
| `src/lib/api/sales/receivedPayments.ts` | Received payments |
| `src/lib/api/sales/paymentAllocation.ts` | Payment allocation |
| `src/lib/api/sales/paymentLedger.ts` | Per-customer ledger |
| `src/lib/api/sales/export.ts` | Received payments CSV export |
| `src/lib/api/whatsapp/whatsapp.ts` | Single WhatsApp message |
| `src/lib/api/whatsapp/whatsappBulk.ts` | Bulk WhatsApp |
| `src/lib/api/inventory/inventory.ts` | Inventory (placeholder) |
| `src/lib/api/shareholder/shareholder.ts` | Shareholders (placeholder) |
| `src/lib/api/settings/settings.ts` | Settings (placeholder) |

### Type definition files

| File | Types |
|------|-------|
| `src/lib/types.ts` | `ProjectData`, `BuildingConfig`, `WingConfig`, `SlabEntry`, `ReceivedPayment`, `DashboardSummary`, `Customer` |
| `src/lib/customers/customerDetailTypes.ts` | `CustomerDetailProfile`, `TemporaryBookingRecord`, `InactiveCustomerRecord`, `CategoryRow`, `SlabLedgerRow` |
| `src/lib/customers/buildCustomerProfile.ts` | `AddCustomerFormInput` |
| `src/lib/api/sales/paymentAllocation.ts` | `AllocatePaymentRequest`, `AllocatePaymentResult` |

---

## App mount — parallel hydration

When `VITE_USE_API=true`, the frontend calls these **5 endpoints in parallel** on load (`hydrateFromApi` in `apiRepository.ts`):

```
GET /api/projects
GET /api/customers/details
GET /api/customers/inactive
GET /api/payment-slabs
GET /api/received-payments
```

Implement **Phase 1 + Phase 2 + Phase 3 (slabs + received-payments)** before the app can load in API mode.

---

## Suggested implementation order

### Phase 1 — Core (do first)

- [ ] `GET /api/health`
- [ ] `GET /api/dashboard`
- [ ] `GET /api/projects`
- [ ] `GET /api/projects/:id`
- [ ] `POST /api/projects`
- [ ] `PATCH /api/projects/:id`
- [ ] `DELETE /api/projects/:id`
- [ ] `GET /api/customers/details`
- [ ] `GET /api/customers/:id/details`
- [ ] `POST /api/customers/register`

### Phase 2 — Customers

- [ ] `GET /api/customers` (legacy v1)
- [ ] `POST /api/customers` (legacy v1)
- [ ] `PATCH /api/customers/:id/details`
- [ ] `GET /api/customers/temporary-bookings`
- [ ] `GET /api/customers/booked-flats`
- [ ] `POST /api/customers/:id/proceed`
- [ ] `POST /api/customers/:id/release`
- [ ] `GET /api/customers/inactive`
- [ ] `POST /api/customers/:id/deactivate`
- [ ] `GET /api/customers/export`

### Phase 3 — Sales & payments

- [ ] `GET /api/sales/summary`
- [ ] `GET /api/payment-slabs`
- [ ] `POST /api/payment-slabs`
- [ ] `PUT /api/payment-slabs`
- [ ] `GET /api/received-payments`
- [ ] `POST /api/received-payments`
- [ ] `GET /api/received-payments/export`
- [ ] `GET /api/customers/:id/payment-categories`
- [ ] `GET /api/customers/:id/payment-categories/:category/due`
- [ ] `POST /api/payments/allocate`
- [ ] `GET /api/customers/:id/payment-ledger`
- [ ] `GET /api/customers/:id/active-slab`

### Phase 4 — WhatsApp (optional)

- [ ] `GET /api/whatsapp/templates`
- [ ] `POST /api/whatsapp/send`
- [ ] `GET /api/whatsapp/messages/:messageId`
- [ ] `POST /api/whatsapp/bulk`
- [ ] `GET /api/whatsapp/bulk/:batchId`
- [ ] `POST /api/whatsapp/bulk/:batchId/cancel`

### Phase 5 — Placeholders (low priority)

- [ ] `GET /api/inventory`
- [ ] `GET /api/shareholders`
- [ ] `GET /api/settings`

### v1 legacy (already on `main` branch — keep for compatibility)

- [ ] `GET /api/flats`
- [ ] `GET /api/bookings`
- [ ] `GET /api/investments`
- [ ] `GET /api/payments`

---

## Full endpoint reference

### Health

#### `GET /api/health`

**Response 200:**

```json
{
  "status": "ok",
  "service": "construction-cms-api",
  "timestamp": "2026-07-07T12:00:00.000Z"
}
```

---

### Dashboard

#### `GET /api/dashboard`

**Response 200:** `DashboardSummary`

```json
{
  "totalBookedFlats": 148,
  "totalFlats": 200,
  "bookedPercentage": 74,
  "remainingFlats": 52,
  "remainingInvestment": 42000000,
  "totalInvestment": 120000000,
  "overduePayments": 23,
  "totalSalesAmount": 386000000,
  "materialCost": 1420000,
  "costTrend": [
    { "m": "Jan", "v": 12.2 },
    { "m": "Feb", "v": 12.8 }
  ]
}
```

---

### Projects

Types (`src/lib/types.ts`):

```ts
interface BhkEntry { count: number; area: string; }

interface WingConfig {
  id: string;
  name: string;           // editable label, e.g. "A", "B", "Tower-1"
  floors: number;
  bhk: Record<string, BhkEntry>;  // keys: "1BHK" | "2BHK" | "3BHK" | "4BHK"
  shopsPerFloor: number;
  shopArea: string;
}

interface BuildingConfig {
  id: string;
  name: string;
  numWings: number;
  wings: WingConfig[];
}

interface FlatUnit {
  id: string;
  number: string;
  floor: number;
  kind: "flat" | "shop";
  bhkType?: string;
  status: "available" | "booked" | "overdue";
}

interface ProjectData {
  id: string;
  name: string;
  propType: "residential" | "commercial" | "semi";
  totalFlats: number;
  totalShops: number;
  buildings: BuildingConfig[];
  units: FlatUnit[];
  createdAt?: string;     // ISO 8601
}
```

Frontend API module: `src/lib/api/projects/projects.ts`

| Method | URL | Request type | Response |
|--------|-----|--------------|----------|
| `GET` | `/api/projects` | — | `ProjectData[]` |
| `GET` | `/api/projects/:id` | — | `ProjectData` |
| `POST` | `/api/projects` | `CreateProjectRequest` | `ProjectData` |
| `PATCH` | `/api/projects/:id` | `UpdateProjectRequest` | `ProjectData` |
| `DELETE` | `/api/projects/:id` | — | `{ deleted: boolean }` |

`CreateProjectRequest = Omit<ProjectData, "id" | "createdAt">`  
`UpdateProjectRequest = Partial<Omit<ProjectData, "id">>`

#### `GET /api/projects`

**Response 200:** `ProjectData[]`

```json
[
  {
    "id": "proj-001",
    "name": "Sunrise Heights",
    "propType": "residential",
    "totalFlats": 120,
    "totalShops": 0,
    "buildings": [
      {
        "id": "bldg-001",
        "name": "Building 1",
        "numWings": 1,
        "wings": [
          {
            "id": "wing-001",
            "name": "A",
            "floors": 10,
            "bhk": {
              "1BHK": { "count": 2, "area": "650" },
              "2BHK": { "count": 4, "area": "950" },
              "3BHK": { "count": 0, "area": "" },
              "4BHK": { "count": 0, "area": "" }
            },
            "shopsPerFloor": 0,
            "shopArea": ""
          }
        ]
      }
    ],
    "units": [
      {
        "id": "u-001",
        "number": "Building 1-WA-201",
        "floor": 2,
        "kind": "flat",
        "bhkType": "2BHK",
        "status": "available"
      }
    ],
    "createdAt": "2026-07-11T10:00:00.000Z"
  }
]
```

#### `GET /api/projects/:id`

**Response 200:** `ProjectData`  
**Response 404:** `{ "error": "Project not found" }`

#### `POST /api/projects`

**Request body:** `CreateProjectRequest` (server generates `id` and `createdAt` if omitted)

```json
{
  "name": "Sunrise Heights",
  "propType": "residential",
  "totalFlats": 120,
  "totalShops": 0,
  "buildings": [
    {
      "id": "bldg-001",
      "name": "Building 1",
      "numWings": 1,
      "wings": [
        {
          "id": "wing-001",
          "name": "A",
          "floors": 10,
          "bhk": {
            "1BHK": { "count": 2, "area": "650" },
            "2BHK": { "count": 4, "area": "950" },
            "3BHK": { "count": 0, "area": "" },
            "4BHK": { "count": 0, "area": "" }
          },
          "shopsPerFloor": 0,
          "shopArea": ""
        }
      ]
    }
  ],
  "units": []
}
```

**Response 201:** `ProjectData`

#### `PATCH /api/projects/:id`

**Request body:** `UpdateProjectRequest` (partial fields)

**Response 200:** `ProjectData`  
**Response 404:** `{ "error": "Project not found" }`

#### `DELETE /api/projects/:id`

**Response 200:**

```json
{ "deleted": true }
```

**Response 404:** `{ "error": "Project not found" }`

---

### Customers — legacy (v1)

#### `GET /api/customers`

**Response 200:** `Customer[]`

```json
[
  {
    "id": "C001",
    "name": "Rajesh Kumar",
    "flat": "A-204",
    "floor": 2,
    "project": "Sunrise Heights",
    "status": "active",
    "amount": 4500000
  }
]
```

#### `POST /api/customers`

**Request body:** `Omit<Customer, "id">`

```json
{
  "name": "Rajesh Kumar",
  "flat": "A-204",
  "floor": 2,
  "project": "Sunrise Heights",
  "status": "pending",
  "amount": 4500000
}
```

**Response 201:** `Customer` (server generates `id`)

---

### Customers — full profiles (v3)

#### `GET /api/customers/details`

**Response 200:** `CustomerDetailProfile[]` (active + temporary only, not inactive)

#### `GET /api/customers/:id/details`

**Response 200:** `CustomerDetailProfile`

#### `PATCH /api/customers/:id/details`

**Request body:** `Partial<CustomerDetailProfile>`

**Response 200:** `CustomerDetailProfile`

#### `POST /api/customers/register`

**Request body:**

```json
{
  "profile": {
    "id": "CUST-001",
    "name": "Rajesh Kumar",
    "phone": "9876543210",
    "email": "rajesh@email.com",
    "address": "Pune, MH",
    "idProof": "Aadhaar",
    "idNumber": "1234-5678-9012",
    "project": "Sunrise Heights",
    "unitType": "Residential",
    "flatType": "2BHK",
    "building": "Tower A",
    "wing": "A",
    "flat": "A-204",
    "floor": 2,
    "area": "850",
    "parking": "open",
    "loanStatus": "No",
    "bookingType": "payment",
    "baseAmount": 4500000,
    "gstPct": 5,
    "gstAmount": 225000,
    "stampDuty": 135000,
    "agreementPrice": 50000,
    "electricalBill": 25000,
    "parkingAmount": 200000,
    "grandTotal": 5145000,
    "notes": ""
  },
  "initialPayment": {
    "amount": 514500,
    "method": "NEFT",
    "date": "2026-07-01"
  }
}
```

**Response 201:** `CustomerDetailProfile`

**`CustomerDetailProfile` shape:**

```json
{
  "id": "CUST-001",
  "name": "Rajesh Kumar",
  "flat": "A-204",
  "floor": 2,
  "project": "Sunrise Heights",
  "status": "active",
  "amount": 5145000,
  "phone": "9876543210",
  "email": "rajesh@email.com",
  "address": "Pune, MH",
  "idProof": "Aadhaar",
  "idNumber": "1234-5678-9012",
  "unitType": "Residential",
  "flatType": "2BHK",
  "building": "Tower A",
  "wing": "A",
  "area": "850",
  "parking": "open",
  "loanStatus": "No",
  "bookingType": "payment",
  "pricing": {
    "baseAmount": 4500000,
    "gstPct": 5,
    "gstAmount": 225000,
    "stampDuty": 135000,
    "agreementPrice": 50000,
    "electricalBill": 25000,
    "parkingAmount": 200000,
    "grandTotal": 5145000
  },
  "bookingSlab10": { "amount": 514500, "received": 514500 },
  "slabLedger": [
    {
      "slabNo": 0,
      "stage": "10% Booking",
      "percentage": 10,
      "slabAmount": 514500,
      "paidAmount": 514500,
      "remainingAmount": 0,
      "status": "received"
    }
  ],
  "categories": [
    { "key": "flat", "label": "Flat Payment", "due": 4500000, "paid": 514500, "remaining": 3985500 }
  ],
  "notes": "",
  "currentSlabLabel": "Slab #0 — 10% Booking"
}
```

---

### Temporary bookings

#### `GET /api/customers/temporary-bookings`

**Response 200:** `TemporaryBookingRecord[]`

#### `GET /api/customers/booked-flats`

**Response 200:**

```json
{ "total": 12, "temporary": 3, "confirmed": 9 }
```

#### `POST /api/customers/:id/proceed`

Convert temporary booking to confirmed.

**Request body (optional):**

```json
{
  "initialPayment": {
    "amount": 514500,
    "method": "NEFT",
    "date": "2026-07-01"
  }
}
```

**Response 200:** `CustomerDetailProfile`

#### `POST /api/customers/:id/release`

Release a temporary booking flat.

**Response 200:**

```json
{ "released": true }
```

---

### Inactive customers

#### `GET /api/customers/inactive`

**Response 200:** `InactiveCustomerRecord[]`

#### `POST /api/customers/:id/deactivate`

**Request body:**

```json
{
  "reason": "Customer cancelled booking",
  "date": "2026-07-05"
}
```

**Response 200:**

```json
{
  "customer": { "id": "CUST-001", "status": "inactive", "inactiveReason": "...", "inactiveDate": "2026-07-05", "flatReleased": true },
  "flatReleased": true
}
```

---

### Customer export

#### `GET /api/customers/export`

**Response 200:** CSV file (`Content-Type: text/csv`)

---

### Sales

#### `GET /api/sales/summary`

**Response 200:** `DashboardSummary` (same shape as `/api/dashboard`)

---

### Payment slabs

#### `GET /api/payment-slabs`

**Response 200:** `SlabEntry[]`

```json
[
  {
    "id": "S001",
    "slabNo": 1,
    "stage": "Plinth",
    "percentage": 15,
    "dateGenerated": "2026-06-01",
    "dueDate": "2026-07-01",
    "status": "sent"
  }
]
```

#### `POST /api/payment-slabs`

**Request body:** `Omit<SlabEntry, "id">`

**Response 201:** `SlabEntry`

#### `PUT /api/payment-slabs`

Replace entire slab list (used when frontend edits slabs in bulk).

**Request body:** `SlabEntry[]`

**Response 200:** `SlabEntry[]`

---

### Received payments

#### `GET /api/received-payments`

**Response 200:** `ReceivedPayment[]`

```json
[
  {
    "id": "RP-001",
    "customer": "Rajesh Kumar",
    "flat": "A-204",
    "category": "Flat Payment",
    "amount": 514500,
    "received": 514500,
    "method": "NEFT",
    "date": "2026-07-01",
    "status": "paid"
  }
]
```

#### `POST /api/received-payments`

**Request body:** `Omit<ReceivedPayment, "id">`

**Response 201:** `ReceivedPayment`

#### `GET /api/received-payments/export`

**Response 200:** CSV file

---

### Payment allocation

#### `GET /api/customers/:id/payment-categories`

**Response 200:** `CategoryRow[]`

```json
[
  { "key": "flat", "label": "Flat Payment", "due": 4500000, "paid": 514500, "remaining": 3985500 },
  { "key": "gst", "label": "GST", "due": 225000, "paid": 0, "remaining": 225000 }
]
```

**`category` path param values:** `flat` | `gst` | `stamp` | `agreement` | `parking` | `electrical`

#### `GET /api/customers/:id/payment-categories/:category/due`

**Response 200:**

```json
{ "remaining": 3985500 }
```

#### `POST /api/payments/allocate`

**Request body:**

```json
{
  "customerId": "CUST-001",
  "category": "flat",
  "amount": 500000,
  "method": "Cheque",
  "date": "2026-07-05"
}
```

**Response 200:**

```json
{
  "paymentId": "RP-1720000000",
  "category": "flat",
  "amountReceived": 500000,
  "categoryRemaining": 0,
  "slabLedger": [
    {
      "slabNo": 1,
      "stage": "Plinth",
      "percentage": 15,
      "slabAmount": 750000,
      "paidAmount": 500000,
      "remainingAmount": 250000,
      "status": "partial"
    }
  ],
  "autoSettledSlabNos": [],
  "skipWhatsApp": false
}
```

---

### Payment ledger

#### `GET /api/customers/:id/payment-ledger`

**Response 200:**

```json
{
  "customerId": "CUST-001",
  "flatTotal": 4500000,
  "flatPaid": 1014500,
  "flatRemaining": 3485500,
  "currentSlabLabel": "Slab #1 — Plinth",
  "slabs": []
}
```

#### `GET /api/customers/:id/active-slab`

**Response 200:** `SlabLedgerRow | null`

---

### WhatsApp

#### `GET /api/whatsapp/templates`

**Response 200:**

```json
[
  {
    "id": "tpl-001",
    "name": "payment_reminder",
    "language": "en",
    "body": "Dear {owner_name}, payment of {payment_value} is due for flat {flat_name}.",
    "variables": ["owner_name", "flat_name", "payment_value", "due_date", "build_status"]
  }
]
```

#### `POST /api/whatsapp/send`

**Request body:**

```json
{
  "to": "919876543210",
  "templateName": "payment_reminder",
  "languageCode": "en",
  "variables": {
    "owner_name": "Rajesh Kumar",
    "flat_name": "A-204",
    "payment_value": "750000",
    "due_date": "2026-07-01",
    "build_status": "Plinth"
  }
}
```

**Response 200:**

```json
{ "messageId": "wamid.xxx", "status": "queued" }
```

#### `GET /api/whatsapp/messages/:messageId`

**Response 200:** `WhatsAppSendResponse`

#### `POST /api/whatsapp/bulk`

**Request body:**

```json
{
  "templateName": "payment_reminder",
  "languageCode": "en",
  "slabId": "S001",
  "recipients": [
    {
      "customerId": "CUST-001",
      "phone": "919876543210",
      "variables": { "owner_name": "Rajesh Kumar", "flat_name": "A-204" }
    }
  ]
}
```

**Response 200:**

```json
{
  "batchId": "batch-1720000000",
  "total": 10,
  "queued": 10,
  "status": "processing"
}
```

#### `GET /api/whatsapp/bulk/:batchId`

**Response 200:**

```json
{
  "batchId": "batch-1720000000",
  "total": 10,
  "sent": 8,
  "delivered": 6,
  "failed": 2,
  "status": "partial",
  "failures": [{ "customerId": "CUST-003", "error": "Invalid phone number" }]
}
```

#### `POST /api/whatsapp/bulk/:batchId/cancel`

**Response 200:**

```json
{ "cancelled": true }
```

**Server env for WhatsApp (optional):**

```env
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_API_VERSION=v21.0
```

---

### Placeholders

#### `GET /api/inventory`

**Response 200:** `[]`

#### `GET /api/shareholders`

**Response 200:** `[]`

#### `GET /api/settings`

**Response 200:**

```json
{}
```

---

## Error responses

Use standard HTTP status codes:

| Code | When |
|------|------|
| 400 | Invalid request body |
| 404 | Customer / project / slab not found |
| 409 | Flat already booked |
| 500 | Server error |

**Error body format:**

```json
{ "error": "Customer not found", "code": "CUSTOMER_NOT_FOUND" }
```

---

## Testing with frontend

```bash
# Terminal 1 — backend
cd construction_cms
git checkout main   # or your backend branch
npm run server:dev

# Terminal 2 — frontend (version4)
git checkout version4
cp .env.example .env
# Set VITE_USE_API=true
npm install && npm run dev
```

Open `http://localhost:5173` — login with any credentials, then test each module.

---

## Contact

**Frontend:** Raj Taware — [RajT7755](https://github.com/RajT7755)

Built for **Nirmiti Developers** — Construction Management System.