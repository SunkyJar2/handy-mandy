# Handy Mandy

Handy Mandy is a full-stack smart home e-commerce and certified technician dispatch platform. It bridges the gap between purchasing IoT hardware and getting it correctly installed, offering a unified customer journey from product selection through automated field technician scheduling and payment settlement.

---

## Architecture and Key Capabilities

### 1. Curated Hardware Catalog
- Categorized device showcase spanning Security, Lighting, and Multi-Room Audio.
- High-fidelity studio product photography, dynamic pricing, and stock status indicators.
- Admin catalog management suite enabling real-time product publishing, price adjustments, and image preset selection.

### 2. Guided Checkout and Dispatch Pipeline
- **Location Management**: User address book with automatic primary address assignment, postal code validation, and inline creation dialogs.
- **Technician Scheduling**: Forward-looking calendar date picker enforcing booking bounds (from tomorrow up to 60 days ahead), time slot selection, and custom wiring/installation instructions.
- **Order Review**: Itemized breakdown encompassing equipment subtotal, standardized installation labor fees, platform service fees, and local Indonesian Rupiah (IDR) currency formatting.

### 3. Payment Settlement and State Machine
- Integrated payment processing compatible with Midtrans/Snap gateways alongside an automated development mock modal.
- Idempotent order status transitions (`PENDING_PAYMENT` -> `PAID` -> `INSTALLATION_SCHEDULED`) guarding against duplicate webhook replays.
- Collision-free sequential order reference generation based on chronological prefix tracking.

### 4. Field Technician Dispatch
- Direct assignment of verified installation specialists based on localized service areas.
- Booking status progression tracking (Scheduled, In Progress, Completed) accessible via customer and technician dashboards.

### 5. Security and Web Standards
- Protection against Insecure Direct Object References (IDOR) by scoping address, cart, and booking queries to authenticated user sessions.
- Strict redirect validation preventing open redirect attacks and protocol-relative navigation exploits.
- Full compliance with modern web accessibility guidelines: focus management, Escape key dismissals on all modal surfaces, semantic ARIA radiogroups for selectable cards, live regions for toast alerts, and keyboard skip links.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | SvelteKit 2, Svelte 5 (Runes reactivity: `$state`, `$derived`, `$effect`) |
| **Styling and UI** | Tailwind CSS v4, Lucide Svelte icon library |
| **Server and API** | SvelteKit Server Endpoints (`+server.ts`, `+page.server.ts`), Node.js |
| **Database and ORM** | PostgreSQL (Neon serverless pooler), Prisma 8 (`@prisma/orm-postgres`, contract-based typed queries) |
| **Data Validation** | Zod runtime schema validation |
| **Authentication and Security** | bcryptjs password hashing, HTTP-only secure cookie session tokens |
| **Testing and Verification** | Vitest, `svelte-check` static type diagnostics |
| **Build and Deployment** | Vite 6, `@sveltejs/adapter-vercel` |

---

## Getting Started

### Prerequisites
- Node.js (version 20 or later recommended)
- npm (version 10 or later)
- PostgreSQL database (local instance or hosted service such as Neon)

### Installation

1. **Clone the repository:**
   ```bash
   git clone git@github.com:SunkyJar2/handy-mandy.git
   cd handymandy
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root of the project with the following configuration:
   ```env
   # Database connection string (PostgreSQL with SSL mode)
   DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

   # Session authentication secret
   JWT_SECRET="your-secure-random-jwt-secret-key"

   # Payment gateway mode (MOCK or MIDTRANS)
   PAYMENT_PROVIDER="MOCK"

   # Midtrans API credentials (required only when PAYMENT_PROVIDER is MIDTRANS)
   MIDTRANS_SERVER_KEY=""
   MIDTRANS_CLIENT_KEY=""

   # Server port
   PORT=5173
   ```

4. **Initialize the Prisma contract:**
   ```bash
   npm run prisma contract emit
   ```

5. **Populate initial catalog and seed data:**
   ```bash
   npm run db:seed
   ```
   The seed script creates initial categories, all 12 smart home hardware products, technicians, service zones, and a default administrator account.
6. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## Verification and Quality Checks

The codebase adheres to strict automated testing and static type safety standards:

- **Run unit and integration tests:**
  ```bash
  npm test
  ```
- **Run Svelte and TypeScript typechecking:**
  ```bash
  npm run check
  ```
- **Produce an optimized production build:**
  ```bash
  npm run build
  ```
- **Preview the production build locally:**
  ```bash
  npm run preview
  ```

---

## Repository Structure

```text
├── docs/                   Implementation plans and architectural records
├── prisma/                 Prisma contract source, migration files, and database seeds
├── src/
│   ├── lib/
│   │   ├── components/     Reusable Svelte 5 UI components (modals, cards, navigation)
│   │   ├── server/         Server-side database guards, sessions, and auth utilities
│   │   ├── shared/         Shared schemas, price calculators, types, and URL helpers
│   │   └── stores/         Client-side reactive stores (toasts, UI state)
│   ├── prisma/             Compiled database contract definition and database client proxy
│   └── routes/             SvelteKit routing tree (storefront, checkout, admin, API)
├── static/
│   └── images/             High-resolution product photography and brand assets
└── tests/                  Vitest test suites for guards, date parsers, and validation
```
