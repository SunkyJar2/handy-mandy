# Figma Redesign, Home/Catalog Cart Popover & End-to-End UI Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Align the entire Handy Mandy SvelteKit application with the updated Figma canvas (`fileKey: h4g4ElyPA91MLzrZYCp4kv`, `Page 1 #0:1` — all 16 frames plus unparented overlay layers), introducing the floating glassmorphic Cart Popover & FAB on Home and Catalog, the asymmetric Featured Bento Grid & live Search pill, the 6-column selectable/stepper Cart table, the split Technicians Location Search + Saved Address sidebar, and the Checkout Confirmation Invoice Receipt, elevated with intentional `/frontend-design`, `/ui-styling`, and `/modern-web-guidance` refinements.

**Architecture:**
- **Reactive Cart State (`src/lib/stores/cart.svelte.ts`)**: Hydrated on every page load from `src/routes/+layout.server.ts` (`items`, `subtotalIdr`, `itemCount`) so `<CartPopover />`, `<TopNav />`, `<ProductCard />`, and `/cart` share optimistic quantity increments (`+`/`-`), item deletion, and subtotal calculations without waterfall spinners.
- **Portal-Safe Overlay Mounting (`src/routes/+layout.svelte`)**: Render `<MenuDrawer />` (now left-anchored) and `<CartPopover />` as siblings **outside** `<TopNav />`'s `backdrop-filter: blur(29.65px)` `<header>` to prevent Chromium's `backdrop-filter` containing-block bug from trapping `position: fixed` overlays inside the `80px` navbar.
- **Selective Cart Checkout (`hm_checkout_items` cookie)**: Persist checked `CartItem.id`s from `/cart` through `/checkout/location`, `/checkout/installation`, `/checkout/review`, and `/api/v1/payments/complete` so unchecking items on `/cart` genuinely scopes the order and only removes purchased items from `CartItem` upon payment completion.
- **Additive Prisma 8 Schema Extension (`Address.label`)**: Add nullable `label String?` to `Address` in `src/prisma/contract.prisma` and `prisma/schema.prisma` (plus `DELETE /api/v1/addresses/[id]`) to power named saved addresses (`Home`, `School`) and click-to-filter Surabaya district search on `/technicians`.

**Tech Stack:** SvelteKit 3 + Svelte 5 Runes (`$state`, `$derived`, `$props`, `$effect`), Tailwind CSS v4 (`@tailwindcss/vite`), `svelte/transition` (`fly`, `scale`, `fade`, `slide` with `cubicOut` — no `tailwindcss-animate` dependency), Prisma 8 (`@prisma/orm-postgres`), Zod v4, Vitest 5, Lucide Svelte.

---

## Part 1: Comprehensive Figma (`#0:1`) vs. Codebase Audit & Intentional Alterations

### 1.1 Screen-by-Screen Diff Matrix (All 16 Frames + Unparented Layers)

| Surface | Figma Nodes | Current Codebase State | Figma Design Changes | Intentional `/frontend-design` & `/ui-styling` Alterations |
| :--- | :--- | :--- | :--- | :--- |
| **Global Typography & Tokens** | `GLOBAL_VARS`, `#199:270`, `#197:514`, `#267:636` | Loads only `Italiana` + `Outfit` in `src/app.html`; dead `animate-in` classes used without `tailwindcss-animate`. | Uses `Plus Jakarta Sans` on nav links (`28px`) and Cart Popover header (`#ADCCDE`), `#00FBFF` cyan on cart totals, `#272E5A`/`#4C527D` search pills, `#3C4268 -> #485075` popover gradient. | Load `Plus Jakarta Sans` in `src/app.html`; register semantic tokens in `src/routes/layout.css`; apply `tabular-nums` to all IDR prices, badges, and steppers; replace dead `animate-in` classes with real Svelte 5 `svelte/transition` + `prefers-reduced-motion` safety. |
| **Global Navbar & Drawer** | `#1:2`, `#197:143`, `#199:138`, `#219:105..205` | Brand left; 4 center links (`Catalog`, `Cart`, `Booking`, `Technicians`); Sign In + Hamburger on far right; right-side `MenuDrawer` rendered inside `TopNav`. | **Hamburger (`Menu` `#199:150`) moved to far left** before Logo + `Handy Mandy`; center links reduced to **`Catalog`, `Booking`, `Technicians`** (`Cart` text link removed); **Shopping Cart SVG (`#199:149`)** placed on far right next to `Sign In`. | Slide `MenuDrawer.svelte` from the **left** (`x: -320`) to match left hamburger origin; lift `MenuDrawer` + `CartPopover` outside `<header>` in `+layout.svelte` to escape `backdrop-filter` trap; add live `tabular-nums` badge to right Cart icon; toggle `<CartPopover />` on Home & Catalog (and navigate or toggle cleanly elsewhere). |
| **Home (`/`)** | `#1:2`, `#197:143` + unparented `#220:288`, `#196:117..118` | Hero has extra paragraph + `Explore Catalog` button; `Featured` is a flat single-row scroller; cards use `ShoppingCart` icon; no search bar; no FAB. | Hero shows clean editorial `"Every room,\na little smarter."` only; **`Search` pill (`#220:288`)** sits opposite `Featured`; **Asymmetric 2-Row Bento**: Giant `724x752` hero card (`Add to Cart +`) on left + 2-row card matrix (`Add +`) on right; **Floating Cart FAB (`#196:117`)** on bottom-right. | Wire the `Search` pill for instant client-side filtering across Home sections (plus `Enter` -> `/catalog?q=...` and clear `X`); build `FeaturedHeroCard.svelte` with responsive 12-col CSS Grid fallback on tablet/mobile; preserve subtle hover/header category links (`Explore Lighting ->`) for accessibility. |
| **Catalog (`/catalog`)** | Shared `#197:131` Cart Popover + `#220:288` Search + `#93:495` Card language | Category filter pills + 5-col `ProductCard` grid; no search input; no Cart FAB or Cart Popover; `409 ALREADY_IN_CART` on repeat click. | User specifically noted the new **Cart Pop-up applies to both Home and Catalog**; cards use `Add +` (`Plus` icon) and support multi-quantity additions. | Add matching `#220:288` live `Search` pill (`?q=...` synced + instant filter) alongside category pills; mount the **Floating Cart FAB + `<CartPopover />`** on `/catalog`; show subtle `"In Cart (N)"` pill badge on cards already in cart. |
| **Cart Pop-up (`CartPopover.svelte`)** | `#197:131`, `#197:514`, `#197:479` + unparented `#197:436` (`X`), `#197:521` (Cart SVG), `#197:525..580` (`- 1 +` steppers) | Does not exist (`+layout.server.ts` only queries `cartCount`). | `428x598` indigo-glass floating panel (`rounded-[36px..53px]`), header Cart icon + `"Cart"` + `X` close, stacked `80px` compact item cards with thumbnail, title, price, and inline `[ - 1 + ]` steppers; bottom `148px` (`y: 1310..1458`) left blank in Figma. | **Fill the blank `148px` bottom zone with a sticky glass summary footer**: live `Subtotal (N items)` in `#00FBFF` + secondary `View Cart` (`/cart`) & primary `Check Out` (`/checkout/location`) CTAs; morph `-` into `Trash2` at `qty === 1`; add empty/guest states; adapt to bottom-sheet on `< 640px` mobile with `overscroll-contain`, `Escape`, and outside-click dismiss. |
| **Full Cart Page (`/cart`)** | `#44:76` (Empty), `#82:72` (`Cart 2`) + `#129:125` | 4 columns (`Product`, `Category`, `Price`, `Cancel`); no checkboxes; no quantity steppers; `POST /api/v1/cart` blocks qty > 1. | **6 columns**: `[Checkbox]` (select-all + per-row), `Product` (thumb + title + muted desc), `Unit Price`, `Quantity` (`[ - 1 + ]`), `Total Price` (`#00FBFF`), `Action` (`Delete` underlined); bottom bar `Total (N Item): Rp...` + `Check Out`. | **Default all `available` items to checked on initial load** (avoiding Figma's static `Total (0 Item): Rp0` confusion while keeping full uncheck/select-all interactivity); persist selected IDs in `hm_checkout_items` cookie so checkout & payment only bill/clear selected items; stack columns cleanly on mobile `< 768px`. |
| **Technicians (`/technicians`)** | `#78:26`, `#222:430` + unparented `#220:295`, `#220:308`, `#222:493..539`, `#266:553` | Single column `"Searching for : Surabaya"` list with `Assign` button; no search bar; no saved addresses panel. | **2-column split**: Left has `"Location"` heading + **`Search` pill (`#222:493`, e.g. `"Menanggal"`)** + Technician cards (`Assign` vs **`✓ Assigned / In Progress...`** `#222:499`); Right has **`Saved Address` sidebar** with `+`/`-` toggle, inline `Name` + `Input your address` (`Cancel` / `Save`) quick-add card (`#222:516`), and saved address cards (`Home`, `School`) with `-` delete bar. | Add `Address.label` to Prisma + `DELETE /api/v1/addresses/[id]`; build smart Surabaya quick-address parser (`parseQuickSurabayaAddress`) so the minimalist 2-field Figma card works seamlessly with structured DB fields; clicking a Saved Address card filters technicians by its `district` (`"Menanggal"`) with an active selection ring; also query user's latest `ASSIGNED`/`IN_PROGRESS` order so assigned technician rows render the exact `✓ Assigned · In Progress...` pill! |
| **Checkout Steps 1–4** | `#67:23`, `#95:60`, `#109:188`, `#138:41` | Step 2 & Step 3 headings both say `"1. ..."`; Step 2 uses emojis `🛠️`/`📡`; Step 4 Confirmation lacks `PAYMENT & BOOKING CONFIRMED` badge and lacks the `Invoice Receipt` card. | Step 2: **`"2. Configure Installation & Add-ons"`** (clean typography, no emojis); Step 3: **`"3. Review & Complete Payment"`** + highlighted `Technician Installation` pill; Step 4 (`#138:41`): **`PAYMENT & BOOKING CONFIRMED`** pill badge + **bottom `"Invoice Receipt"` card** (`#158:45`) with line items, warranty note, `#4A6FA5` divider, and `Total Paid (IDR)`. | Fix Step 2 & 3 numbering and remove emojis; honor `hm_checkout_items` across Steps 1–3 & payment completion; add the full `"Invoice Receipt"` card to `/checkout/confirmation/[orderId]` **while retaining `Choose Technician` & `View Booking Details` CTAs** (omitted in static Figma `#138:41`) so users never hit a post-payment dead end. |
| **Auth, Bookings & Admin** | `#37:7`, `#47:58`, `#36:19`, `#60:136`, `#93:169`, `#129:40` | Auth hides Footer and embeds cross-link inside Register card; Bookings & Admin use older right-hamburger `TopNav`. | Register (`#37:7`) places `"Log in if you have an account"` below the card; all app screens (`#36:19`, `#60:136`, `#93:169`, `#129:40`) use the new left-hamburger + right-cart `TopNav`. | Move Register cross-link below the auth card (`#37:7`) and refine top bar strip + footer parity; apply `tabular-nums` and real Svelte transitions across Bookings & Admin tables. |

---

## Part 2: File Structure & Responsibility Map

### Schema & Shared Pure Logic (Unit-Tested First)
- Modify: `src/prisma/contract.prisma` & `prisma/schema.prisma` — add nullable `label String?` on `Address`.
- Modify: `src/lib/shared/types.ts` — add `label?: string | null` to `AddressDto`; add `CartMutationResponse` extending `CartResponse`.
- Modify: `src/lib/shared/schemas.ts` — add optional `label` to `addressSchema`; add `cartPatchSchema` (`quantity: 0..99`); add `quickAddressSchema`.
- Create: `src/lib/shared/cart-selection.ts` & `src/lib/shared/cart-selection.test.ts` — pure helpers for cart selection cookie (`parseSelectedCartItemIds`, `filterSelectedCartItems`, `computeSelectedCartTotals`) + product/technician search filtering (`filterProductsByQuery`, `filterTechniciansByLocation`).
- Create: `src/lib/shared/address.ts` & `src/lib/shared/address.test.ts` — `parseQuickSurabayaAddress` & `formatSavedAddressTitle` for the 2-line Figma Saved Address quick-add card.

### Backend API & Server Loaders
- Modify: `src/routes/+layout.server.ts` — return hydrated `cart: CartResponse` (`items`, `subtotalIdr`, `itemCount`) alongside `user` and `cartCount`.
- Modify: `src/routes/api/v1/cart/+server.ts` — `POST` increments `quantity` (up to `99`) when item already exists instead of returning `409 ALREADY_IN_CART`, and returns full `CartResponse` (`items`, `subtotalIdr`, `itemCount`).
- Modify: `src/routes/api/v1/cart/items/[id]/+server.ts` — add `PATCH` handler (`{ quantity }`: `0` deletes row, `1..99` updates row) and return updated `CartResponse` from both `PATCH` and `DELETE`.
- Modify: `src/routes/api/v1/addresses/+server.ts` — persist and return `label`.
- Create: `src/routes/api/v1/addresses/[id]/+server.ts` — `DELETE` handler verifying ownership (`userId === locals.user.id`) and promoting fallback default address if needed.
- Modify: `src/routes/cart/+page.server.ts` — add `updateQuantity` and `proceedCheckout` actions (setting `hm_checkout_items` cookie).
- Modify: `src/routes/checkout/location/+page.server.ts`, `src/routes/checkout/installation/+page.server.ts`, `src/routes/checkout/review/+page.server.ts`, and `src/routes/api/v1/payments/complete/+server.ts` — scope checkout quote/order creation to `hm_checkout_items` (when present) and delete only ordered `DEVICE` `productId`s from `CartItem` on payment completion.
- Modify: `src/routes/checkout/confirmation/[orderId]/+page.server.ts` — include `items` (`OrderItem[]`) on `order` for the `Invoice Receipt` card.
- Modify: `src/routes/technicians/+page.server.ts` — load user's saved `addresses` and active/assigned order (`activeAssignedOrder`) alongside `targetOrder` and `technicians`.

### Frontend Store, Components & Routes
- Modify: `src/app.html` & `src/routes/layout.css` — load `Plus Jakarta Sans`, define Figma v2 tokens, `tabular-nums` utility, and reduced-motion-safe styling.
- Create: `src/lib/stores/cart.svelte.ts` — reactive Svelte 5 class managing `items`, `isOpen`, `pendingIds`, `hydrate()`, `addProduct()`, `setQuantity()`, `removeItem()`, `open()`, `close()`, `toggle()`.
- Modify: `src/lib/components/TopNav.svelte` & `src/lib/components/MenuDrawer.svelte` — left Hamburger, 3 center links (`Catalog`, `Booking`, `Technicians`), right Cart icon button + badge, left-sliding `MenuDrawer` with Svelte `fly`/`fade` transitions.
- Create: `src/lib/components/CartPopover.svelte` & `src/lib/components/CartFab.svelte` — glassmorphic floating Cart Popover (`#197:131` + sticky subtotal/CTA footer + mobile bottom-sheet adaptation) and bottom-right Floating Cart Action Button (`#196:117`).
- Modify: `src/routes/+layout.svelte` — hydrate `cartStore` from `data.cart`, mount `<MenuDrawer />` and `<CartPopover />` outside `<header>`, and mount `<CartFab />` on `/` and `/catalog`.
- Create: `src/lib/components/SearchPill.svelte` & `src/lib/components/FeaturedHeroCard.svelte` — reusable `#220:288` glass search input pill and `#196:86` 2-row Featured Hero Card.
- Modify: `src/lib/components/ProductCard.svelte` — `Add +` (`Plus` icon), repeat-add support via `cartStore.addProduct`, `"In Cart (N)"` indicator, `tabular-nums`.
- Modify: `src/routes/+page.svelte` & `src/routes/catalog/+page.svelte` — editorial hero, live `SearchPill`, asymmetric Featured Bento Grid on Home, URL-synced live `SearchPill` + category filters on Catalog.
- Modify: `src/routes/cart/+page.svelte` — 6-column `Cart 2` (`#82:72`) layout with select-all/row checkboxes, `[ - 1 + ]` steppers, `#00FBFF` totals, underlined `Delete`, and `Check Out` form submission.
- Modify: `src/routes/technicians/+page.svelte` & `src/lib/components/AddressDialog.svelte` — 2-column `"Location"` + `SearchPill` + `Assigned / In Progress...` status pill + `"Saved Address"` inline quick-add/delete/filter sidebar; optional `Label` input in `AddressDialog.svelte`.
- Modify: `src/routes/checkout/installation/+page.svelte`, `src/routes/checkout/review/+page.svelte`, `src/routes/checkout/confirmation/[orderId]/+page.svelte`, `src/routes/register/+page.svelte`, `src/routes/login/+page.svelte` — step numbering & icon cleanup, `PAYMENT & BOOKING CONFIRMED` pill + `Invoice Receipt` card, Register external cross-link.

---

## Part 3: Bite-Sized TDD Implementation Tasks

### Task 1: Pure Cart Selection, Search Filtering & Quick-Address Helpers (TDD)

**Files:**
- Create: `src/lib/shared/cart-selection.ts`
- Create: `src/lib/shared/cart-selection.test.ts`
- Create: `src/lib/shared/address.ts`
- Create: `src/lib/shared/address.test.ts`
- Modify: `src/lib/shared/schemas.ts`
- Modify: `src/lib/shared/types.ts`

- [x] **Step 1: Write failing unit tests for cart selection, search filtering, and Surabaya quick-address parsing**

Create `src/lib/shared/cart-selection.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import {
  parseSelectedCartItemIds,
  filterCheckoutCartItems,
  computeSelectedCartTotals,
  filterProductsByQuery,
  filterTechniciansByLocation
} from './cart-selection';

describe('cart-selection helpers', () => {
  const sampleItems = [
    { id: 'ci-1', productId: 'p-1', quantity: 2, available: true, product: { id: 'p-1', priceIdr: 450000, status: 'ACTIVE' } },
    { id: 'ci-2', productId: 'p-2', quantity: 1, available: true, product: { id: 'p-2', priceIdr: 800000, status: 'ACTIVE' } },
    { id: 'ci-3', productId: 'p-3', quantity: 1, available: false, product: { id: 'p-3', priceIdr: 300000, status: 'INACTIVE' } }
  ];

  it('parses valid JSON string array from cookie and rejects malformed input', () => {
    expect(parseSelectedCartItemIds('["ci-1","ci-2"]')).toEqual(['ci-1', 'ci-2']);
    expect(parseSelectedCartItemIds('')).toBeNull();
    expect(parseSelectedCartItemIds('not-json')).toBeNull();
    expect(parseSelectedCartItemIds('{"bad":true}')).toBeNull();
  });

  it('returns all active items when cookie selection is null, or only matching active items when provided', () => {
    expect(filterCheckoutCartItems(sampleItems, null).map((i) => i.id)).toEqual(['ci-1', 'ci-2']);
    expect(filterCheckoutCartItems(sampleItems, ['ci-2', 'ci-3']).map((i) => i.id)).toEqual(['ci-2']);
  });

  it('computes selected item count (sum of quantities) and IDR subtotal for checked available items', () => {
    const res = computeSelectedCartTotals(sampleItems, new Set(['ci-1', 'ci-3']));
    expect(res).toEqual({ selectedLineCount: 1, selectedUnitCount: 2, subtotalIdr: 900000 });
  });

  it('filters products case-insensitively across name, description, and category name', () => {
    const products = [
      { name: 'Smart Door Lock', description: 'Biometric deadbolt', category: { name: 'Security' } },
      { name: 'Warm Smart Bulb', description: 'Dimmable E27 LED', category: { name: 'Lighting' } }
    ];
    expect(filterProductsByQuery(products, 'biometric')).toHaveLength(1);
    expect(filterProductsByQuery(products, 'LIGHTING')).toHaveLength(1);
    expect(filterProductsByQuery(products, '   ')).toHaveLength(2);
  });

  it('filters technicians by name, city, highlight, or service area', () => {
    const techs = [
      { fullName: 'Thaariq Cahya', city: 'Surabaya', areas: ['Menanggal', 'Gayungan'], highlight: 'Door locks' },
      { fullName: 'Rezvan Budi', city: 'Surabaya', areas: ['Gubeng', 'Sukolilo'], highlight: 'Lighting mesh' }
    ];
    expect(filterTechniciansByLocation(techs, 'menanggal').map((t) => t.fullName)).toEqual(['Thaariq Cahya']);
    expect(filterTechniciansByLocation(techs, 'gubeng').map((t) => t.fullName)).toEqual(['Rezvan Budi']);
  });
});
```

Create `src/lib/shared/address.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { parseQuickSurabayaAddress, formatSavedAddressSummary } from './address';

describe('parseQuickSurabayaAddress', () => {
  it('parses comma-separated Figma-style Surabaya quick address with postal code and known district', () => {
    const parsed = parseQuickSurabayaAddress({
      label: 'Home',
      rawAddress: 'Surabaya, Menanggal, Jl. Kembang Indah No. 12, 60267'
    });
    expect(parsed).toEqual({
      label: 'Home',
      province: 'Jawa Timur',
      city: 'Surabaya',
      district: 'Menanggal',
      addressLine: 'Jl. Kembang Indah No. 12',
      postalCode: '60267'
    });
  });

  it('extracts Kec. prefix and falls back to default Surabaya postal code when omitted', () => {
    const parsed = parseQuickSurabayaAddress({
      label: 'School',
      rawAddress: 'Pucang Anom No.91, Kertajaya, Kec. Gubeng, Surabaya'
    });
    expect(parsed.district).toBe('Gubeng');
    expect(parsed.city).toBe('Surabaya');
    expect(parsed.postalCode).toBe('60281');
    expect(parsed.addressLine).toContain('Pucang Anom No.91');
  });

  it('formats saved address title and subtitle cleanly', () => {
    expect(
      formatSavedAddressSummary({
        label: 'Home',
        district: 'Menanggal',
        city: 'Surabaya',
        addressLine: 'Jl. Kembang Indah',
        postalCode: '60267'
      })
    ).toEqual({
      title: 'Home',
      subtitle: 'Surabaya, Menanggal, Jl. Kembang Indah, 60267'
    });
  });
});
```

- [x] **Step 2: Run Vitest to confirm tests fail**

Run: `npm test`
Expected: FAIL (`Cannot find module './cart-selection'` / `'./address'`).

- [x] **Step 3: Implement `cart-selection.ts`, `address.ts`, and update `types.ts` + `schemas.ts`**

Create `src/lib/shared/cart-selection.ts`:
```ts
export function parseSelectedCartItemIds(raw: string | undefined | null): string[] | null {
  if (!raw || !raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const ids = parsed.filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
    return ids.length > 0 ? ids : null;
  } catch {
    return null;
  }
}

export function filterCheckoutCartItems<
  T extends { id: string; product?: { status: string; priceIdr: number } | null }
>(items: T[], selectedIds: string[] | null): T[] {
  const allowSet = selectedIds ? new Set(selectedIds) : null;
  return items.filter((item) => {
    if (!item.product || item.product.status !== 'ACTIVE') return false;
    return allowSet ? allowSet.has(item.id) : true;
  });
}

export function computeSelectedCartTotals<
  T extends { id: string; quantity: number; available: boolean; product: { priceIdr: number } }
>(items: T[], selectedIds: Set<string>): {
  selectedLineCount: number;
  selectedUnitCount: number;
  subtotalIdr: number;
} {
  let selectedLineCount = 0;
  let selectedUnitCount = 0;
  let subtotalIdr = 0;

  for (const item of items) {
    if (!item.available || !selectedIds.has(item.id)) continue;
    selectedLineCount += 1;
    selectedUnitCount += item.quantity;
    subtotalIdr += item.product.priceIdr * item.quantity;
  }

  return { selectedLineCount, selectedUnitCount, subtotalIdr };
}

export function filterProductsByQuery<
  T extends { name: string; description: string; category?: { name: string } | null }
>(products: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.category?.name.toLowerCase().includes(q) ?? false)
  );
}

export function filterTechniciansByLocation<
  T extends { fullName: string; city: string; areas: string[]; highlight?: string | null }
>(technicians: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return technicians;
  return technicians.filter(
    (t) =>
      t.fullName.toLowerCase().includes(q) ||
      t.city.toLowerCase().includes(q) ||
      t.areas.some((a) => a.toLowerCase().includes(q)) ||
      (t.highlight?.toLowerCase().includes(q) ?? false)
  );
}
```

Create `src/lib/shared/address.ts`:
```ts
const KNOWN_SURABAYA_DISTRICTS: Record<string, string> = {
  menanggal: '60234',
  gayungan: '60235',
  gubeng: '60281',
  kertajaya: '60282',
  sukolilo: '60111',
  mulyorejo: '60115',
  wonokromo: '60243',
  rungkut: '60293',
  tegalsari: '60262',
  sawahan: '60251',
  wiyung: '60228',
  lakarsantri: '60211',
  genteng: '60275',
  kenjeran: '60129',
  tandes: '60187'
};

export interface QuickAddressParsed {
  label: string;
  province: string;
  city: string;
  district: string;
  addressLine: string;
  postalCode: string;
}

export function parseQuickSurabayaAddress(input: {
  label: string;
  rawAddress: string;
}): QuickAddressParsed {
  const cleanLabel = input.label.trim() || 'Saved Address';
  const raw = input.rawAddress.trim();

  const postalMatch = raw.match(/\b(\d{5})\b/);
  let postalCode = postalMatch ? postalMatch[1] : '';

  const segments = raw
    .replace(/\b\d{5}\b/g, '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  let district = '';
  const kecSegment = segments.find((s) => /^kec\.?\s+/i.test(s));
  if (kecSegment) {
    district = kecSegment.replace(/^kec\.?\s+/i, '').trim();
  }

  if (!district) {
    for (const seg of segments) {
      const lower = seg.toLowerCase();
      if (KNOWN_SURABAYA_DISTRICTS[lower]) {
        district = seg;
        break;
      }
    }
  }

  if (!district) {
    for (const [key] of Object.entries(KNOWN_SURABAYA_DISTRICTS)) {
      if (raw.toLowerCase().includes(key)) {
        district = key.charAt(0).toUpperCase() + key.slice(1);
        break;
      }
    }
  }

  if (!postalCode) {
    const matchedPostal = district ? KNOWN_SURABAYA_DISTRICTS[district.toLowerCase()] : undefined;
    postalCode = matchedPostal || '60234';
  }

  const streetSegments = segments.filter((s) => {
    const lower = s.toLowerCase();
    if (lower === 'surabaya' || lower === 'jawa timur' || lower === 'east java') return false;
    if (district && (lower === district.toLowerCase() || lower === `kec. ${district.toLowerCase()}` || lower === `kec ${district.toLowerCase()}`)) {
      return false;
    }
    return true;
  });

  if (!district) {
    district = streetSegments.length > 1 ? streetSegments[streetSegments.length - 1] : 'Surabaya Central';
  }

  const addressLine = (streetSegments.join(', ') || raw).slice(0, 200);

  return {
    label: cleanLabel.slice(0, 50),
    province: 'Jawa Timur',
    city: 'Surabaya',
    district: district.slice(0, 100),
    addressLine: addressLine.length >= 5 ? addressLine : `${addressLine}, Surabaya`,
    postalCode
  };
}

export function formatSavedAddressSummary(addr: {
  label?: string | null;
  district: string;
  city: string;
  addressLine: string;
  postalCode: string;
}): { title: string; subtitle: string } {
  return {
    title: addr.label?.trim() || addr.district || 'Saved Address',
    subtitle: `${addr.city}, ${addr.district}, ${addr.addressLine}, ${addr.postalCode}`
  };
}
```

Update `src/lib/shared/types.ts` (`AddressDto` to include `label?: string | null`) and `src/lib/shared/schemas.ts` (`addressSchema` to include `label: z.string().trim().max(50).optional().nullable()`, plus export `cartItemQuantitySchema = z.object({ quantity: z.coerce.number().int().min(0).max(99) })` and `quickAddressSchema = z.object({ label: z.string().trim().min(1, 'Name is required.').max(50), rawAddress: z.string().trim().min(5, 'Enter a valid Surabaya address.').max(240) })`).

- [x] **Step 4: Run Vitest and typecheck**

Run: `npm test && npm run check`
Expected: PASS across all test suites and 0 `svelte-check` errors.

---

### Task 2: Additive Prisma 8 `Address.label` Schema + Cart & Address API Upgrades

**Files:**
- Modify: `src/prisma/contract.prisma`
- Modify: `prisma/schema.prisma`
- Create: `src/lib/server/cart.ts`
- Modify: `src/routes/+layout.server.ts`
- Modify: `src/routes/api/v1/cart/+server.ts`
- Modify: `src/routes/api/v1/cart/items/[id]/+server.ts`
- Modify: `src/routes/api/v1/addresses/+server.ts`
- Create: `src/routes/api/v1/addresses/[id]/+server.ts`

- [x] **Step 1: Add `label String?` to `Address` in Prisma 8 contract & schema and emit/push**

In `src/prisma/contract.prisma` (inside `model Address`) add `label String?` above `province`, and in `prisma/schema.prisma` add `label String? @db.VarChar(50)`.
Run: `npx prisma contract emit && npm run db:update`
Expected: Contract emitted cleanly to `src/prisma/contract.d.ts` + `src/prisma/contract.json`, and `Address.label` column added non-destructively to PostgreSQL.

- [x] **Step 2: Centralize `loadUserCart(userId)` in `src/lib/server/cart.ts` and wire `+layout.server.ts` + Cart APIs**

Create `src/lib/server/cart.ts`:
```ts
import { db } from '$lib/server/db';
import type { CartItemDto, CartResponse } from '$lib/shared/types';

export async function loadUserCart(userId: string): Promise<CartResponse> {
  const items = await db.orm.public.CartItem
    .where({ userId })
    .include('product', (p) => p.include('category'))
    .orderBy((c) => c.addedAt.desc())
    .all();

  let subtotalIdr = 0;
  let itemCount = 0;
  const mappedItems: CartItemDto[] = [];

  for (const item of items) {
    if (!item.product) continue;
    const isAvailable = item.product.status === 'ACTIVE';
    if (isAvailable) {
      subtotalIdr += item.product.priceIdr * item.quantity;
      itemCount += item.quantity;
    }

    mappedItems.push({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      available: isAvailable,
      product: {
        id: item.product.id,
        slug: item.product.slug,
        name: item.product.name,
        description: item.product.description,
        priceIdr: item.product.priceIdr,
        imageUrl: item.product.imageUrl,
        kind: item.product.kind as any,
        status: item.product.status as any,
        isFeatured: item.product.isFeatured,
        featuredRank: item.product.featuredRank,
        category: {
          id: item.product.category?.id ?? '',
          slug: item.product.category?.slug ?? '',
          name: item.product.category?.name ?? '',
          sortOrder: item.product.category?.sortOrder ?? 0
        }
      }
    });
  }

  return { items: mappedItems, subtotalIdr, itemCount };
}
```

Update:
1. `src/routes/+layout.server.ts`: Call `loadUserCart(locals.user.id)` when authenticated and return `{ user: locals.user, cartCount: cart.itemCount, cart }` (falling back to empty `{ items: [], subtotalIdr: 0, itemCount: 0 }`).
2. `src/routes/api/v1/cart/+server.ts`:
   - `GET`: return `json(await loadUserCart(locals.user.id))`.
   - `POST`: if `existing` `CartItem` is found, **increment `quantity` (`Math.min(99, existing.quantity + 1)`)** via `db.orm.public.CartItem.where({ id: existing.id }).update({ quantity: nextQty })` instead of returning `409 ALREADY_IN_CART`! Return `{ success: true, message: existing ? 'Updated quantity in cart' : 'Added to cart', ...(await loadUserCart(locals.user.id)) }` with status `200` (existing) or `201` (created).
3. `src/routes/api/v1/cart/items/[id]/+server.ts`:
   - Add `PATCH` handler validating `cartItemQuantitySchema`: if `quantity === 0`, delete the row; otherwise update `quantity`. Return `{ success: true, ...(await loadUserCart(locals.user.id)) }`.
   - Update `DELETE` handler to also return `{ success: true, ...(await loadUserCart(locals.user.id)) }`.

- [x] **Step 3: Wire `Address.label` in `GET`/`POST /api/v1/addresses` and create `DELETE /api/v1/addresses/[id]/+server.ts`**

Create `src/routes/api/v1/addresses/[id]/+server.ts`:
- Authenticate `locals.user`; verify `Address` exists and belongs to `locals.user.id`.
- Delete `Address` (`Order.address` uses `onDelete: SetNull` with immutable `Order.addressSnapshot`, so historical bookings remain intact).
- If deleted address was `isDefault`, promote the user's newest remaining address (if any) to `isDefault: true`.
- Return `{ success: true }`.

- [x] **Step 4: Verify typecheck & tests**

Run: `npm test && npm run check`
Expected: PASS with 0 errors.

---

### Task 3: Design Tokens, Typography (`Plus Jakarta Sans`), Reactive `cartStore` & Global Shell (`TopNav`, `MenuDrawer`, `CartPopover`, `CartFab`)

**Files:**
- Modify: `src/app.html`
- Modify: `src/routes/layout.css`
- Create: `src/lib/stores/cart.svelte.ts`
- Modify: `src/lib/components/TopNav.svelte`
- Modify: `src/lib/components/MenuDrawer.svelte`
- Create: `src/lib/components/CartPopover.svelte`
- Create: `src/lib/components/CartFab.svelte`
- Modify: `src/routes/+layout.svelte`

- [x] **Step 1: Add `Plus Jakarta Sans` to `src/app.html` and Figma v2 tokens to `src/routes/layout.css`**

In `src/app.html`, update Google Fonts link to:
`https://fonts.googleapis.com/css2?family=Italiana&family=Outfit:wght@100..900&family=Plus+Jakarta+Sans:wght@400..800&display=swap`
In `src/routes/layout.css`, add `--font-jakarta: 'Plus Jakarta Sans', var(--font-sans);`, `--color-hm-cyan: #00FBFF;`, `--color-hm-search-bg: #272E5A;`, `--color-hm-search-border: #4C527D;`, `--color-hm-popover-from: rgba(60, 66, 104, 0.94);`, `--color-hm-popover-to: rgba(72, 80, 117, 0.96);`, and `@media (prefers-reduced-motion: reduce)` transition guards.

- [x] **Step 2: Create `src/lib/stores/cart.svelte.ts`**

Implement a singleton reactive Svelte 5 class `CartStore`:
- `$state` fields: `items: CartItemDto[] = []`, `subtotalIdr = 0`, `itemCount = 0`, `isOpen = false`, `anchor: 'nav' | 'fab' = 'fab'`, `pendingProductIds = new Set<string>()`.
- `hydrate(cart: CartResponse)`: syncs server load data cleanly when no mutation is in flight.
- `open(anchor = 'fab')`, `close()`, `toggle(anchor = 'fab')`.
- `addProduct(product: ProductDto, isAuthenticated: boolean)`: handles guest `sessionStorage` redirect to `/login?next=...`, performs optimistic increment/insert, POSTs `/api/v1/cart`, syncs authoritative `CartResponse`, triggers subtle badge pulse + toast, rolls back on error.
- `setQuantity(itemId: string, quantity: number)` & `removeItem(itemId: string)`: optimistic update + `PATCH` / `DELETE` `/api/v1/cart/items/${itemId}` + `invalidateAll()` sync.
- `getProductQuantity(productId: string): number`: enables `<ProductCard />` `"In Cart (N)"` indicator.

- [x] **Step 3: Rebuild `TopNav.svelte` & `MenuDrawer.svelte` to match Figma `#199:138` / `#219:105`**

In `src/lib/components/TopNav.svelte`:
- **Left cluster**: Hamburger button (`/images/menu-icon.svg`, `w-9 h-9`, `aria-label="Open navigation menu"`) **first**, followed by `<a href="/">` Logo (`w-[60px] md:w-[72px]`) + `Handy Mandy` (`Outfit SemiBold 30px`).
- **Center cluster (`hidden lg:flex items-center gap-10 xl:gap-[73px]`)**: Only **`Catalog`** (`/catalog`), **`Booking`** (`/bookings`), **`Technicians`** (`/technicians`) rendered in `font-['Plus_Jakarta_Sans'] text-[22px] xl:text-[26px]` (plus `Admin` link if `user?.role === 'ADMIN'`).
- **Right cluster**:
  - **Shopping Cart icon button** (`/images/cart-icon.svg`, `w-9 h-9`) with `tabular-nums` `#25ED82` count pill (`cartStore.itemCount`). On click: if on `/cart`, smooth-scrolls to top; otherwise calls `cartStore.toggle('nav')`!
  - `Sign In` button (`w-[115px] h-[43px] border border-[#CFF2FF] rounded-[8px]`) or authenticated user name + `Sign out`.
- Lift `<MenuDrawer />` out of `<header>` (managed in `+layout.svelte` or rendered as a sibling outside `<header>`).

In `src/lib/components/MenuDrawer.svelte`:
- Anchor to **left** (`fixed top-0 left-0 z-50 h-full w-80 max-w-[85vw] bg-[#0c1c2e] border-r border-[#4A6FA5]/40`), using real Svelte `transition:fade={{ duration: 180 }}` on backdrop and `transition:fly={{ x: -320, duration: 240, easing: cubicOut }}` on the drawer panel.

- [x] **Step 4: Build `<CartPopover />` (`#197:131` + UX Footer) and `<CartFab />` (`#196:117`) and wire `+layout.svelte`**

Create `src/lib/components/CartPopover.svelte`:
- Renders when `cartStore.isOpen` is true (outside `<header>` in `+layout.svelte`, `z-50`).
- **Positioning**:
  - Mobile (`< 640px`): bottom sheet (`fixed inset-x-0 bottom-0 max-h-[82dvh] rounded-t-[36px]`) with subtle backdrop scrim.
  - Desktop (`>= 640px`): viewport-clamped floating glass panel (`fixed right-6 sm:right-8 w-[420px] max-w-[calc(100vw-2rem)] max-h-[min(600px,calc(100dvh-7rem))] rounded-[40px]`, anchored at `top-24` when opened from `'nav'` or `bottom-28` above FAB when opened from `'fab'`).
- **Visual surface (Figma `#197:131`)**: `background: linear-gradient(180deg, rgba(60, 66, 104, 0.95) 44%, rgba(72, 80, 117, 0.97) 92%); backdrop-filter: blur(24px);` with `border border-[#CFF2FF]/20 shadow-[0_24px_60px_rgba(0,0,0,0.55)]`.
- **Header (`#197:514`, `#197:521`, `#197:436`)**: `/images/cart-icon.svg` + `"Cart"` (`Plus Jakarta Sans Bold 26px text-[#ADCCDE]` with subtle bottom accent bar) + top-right Close `X` button (`w-10 h-10 rounded-full hover:bg-white/10`).
- **Scrollable Item Stack (`#197:479`, `overscroll-contain overflow-y-auto px-5 py-3 space-y-3`)**:
  - Compact `min-h-[80px]` cards (`rounded-[14px] bg-[#1A3551]/65 border border-[#CFF2FF]/15 p-2.5 flex items-center gap-3`):
    - `72x64` thumbnail (`rounded-[12px] object-cover`),
    - Title (`text-[#CFF2FF] font-medium line-clamp-1`) + unit/line price (`tabular-nums font-bold text-white/90 text-sm`),
    - **Inline `[ -  qty  + ]` Stepper (`#197:525..580`)**: `h-9 rounded-[8px] border-2 border-[#CFF2FF]/30 flex items-center` where `-` shows `Trash2` (`hover:text-[#FF6D6F]`) when `item.quantity === 1` and `Minus` otherwise!
- **Sticky Glass Footer (Intentional UX Enhancement over blank `y: 1310..1458`)**:
  - Shows `Subtotal ({cartStore.itemCount} {cartStore.itemCount === 1 ? 'item' : 'items'})` + `formatIdr(cartStore.subtotalIdr)` in `#00FBFF` (`tabular-nums font-bold text-xl`),
  - Two buttons: `View Cart` (`href="/cart"`, outlined) and `Check Out` (`href="/checkout/location"`, `bg-[#4A6FA5] hover:bg-[#5b84c0] text-white font-semibold`).
- **Light Dismiss**: `Escape` key handler + outside pointerdown listener + automatic close on route pathname change (`$effect` watching `page.url.pathname` when navigating to `/cart` or `/checkout/*`).

Create `src/lib/components/CartFab.svelte` (matching Figma `#196:117` + `#196:118`):
- Shown on `/` and `/catalog` (`fixed right-6 bottom-6 z-40 w-[68px] h-[68px] sm:w-[76px] sm:h-[76px] rounded-full bg-[#67729D]/65 hover:bg-[#67729D]/85 backdrop-blur-xl border border-[#CFF2FF]/30 shadow-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95`).
- Displays `/images/cart-icon.svg` (`w-9 h-9`) + live `#25ED82` `tabular-nums` count badge (`cartStore.itemCount`).

- [x] **Step 5: Verify build & typecheck**

Run: `npm test && npm run check`
Expected: PASS with 0 errors.

---

### Task 4: Homepage Asymmetric Bento Grid, Editorial Hero, Search Pill & Catalog Sync

**Files:**
- Create: `src/lib/components/SearchPill.svelte`
- Create: `src/lib/components/FeaturedHeroCard.svelte`
- Modify: `src/lib/components/ProductCard.svelte`
- Modify: `src/routes/+page.svelte`
- Modify: `src/routes/catalog/+page.server.ts`
- Modify: `src/routes/catalog/+page.svelte`

- [x] **Step 1: Create `SearchPill.svelte` (`#220:288`) and `FeaturedHeroCard.svelte` (`#196:86`)**

- `SearchPill.svelte`: `w-full sm:w-[380px] lg:w-[452px] h-[52px] sm:h-[56px] rounded-[30px] bg-[#272E5A]/90 border border-[#4C527D] focus-within:border-[#CFF2FF] focus-within:ring-2 focus-within:ring-[#CFF2FF]/20 px-6 flex items-center gap-3 shadow-lg transition-all`, binding `value`, optional `onsubmit`, clear `X` button when non-empty, and right magnifying-glass `Search` icon (`w-6 h-6 text-[#B6C4D3]`).
- `FeaturedHeroCard.svelte`: Matches Figma `#196:86` (`724x752` proportions, `rounded-[14px]`, `background: rgba(74, 111, 165, 0.26)`):
  - Top studio image (`h-[280px] sm:h-[380px] lg:h-[470px] w-full object-cover rounded-t-[14px]`) with `"Featured"` glass badge + `"In Cart (N)"` badge when `qty > 0`,
  - Bottom body (`p-6 sm:p-8 flex flex-col justify-between flex-1`): large title (`text-3xl sm:text-[42px] xl:text-[48px] text-[#CFF2FF] leading-tight`), bold white/emerald `tabular-nums` price (`text-2xl sm:text-[32px] font-bold text-white`), and oversized `Add to Cart +` button (`h-[56px] sm:h-[64px] px-7 rounded-[8px] border-2 border-[#CFF2FF]/35 hover:border-[#CFF2FF] hover:bg-[#CFF2FF]/15 text-xl sm:text-[26px] text-[#CFF2FF] flex items-center gap-3`).

- [x] **Step 2: Update `ProductCard.svelte` (`#93:495`)**

- Replace `<ShoppingCart />` icon inside the `Add` button with `<Plus class="w-4 h-4" />` (`Add +` matching Figma `#93:497`).
- Delegate `handleAdd` to `cartStore.addProduct(product, Boolean(user))` so repeat clicks increment quantity smoothly (no `409` error!) and display a subtle top-right `"In Cart · {qty}"` pill when `qty > 0`.
- Apply `tabular-nums` to `{formatIdr(product.priceIdr)}`.

- [x] **Step 3: Redesign `src/routes/+page.svelte` (`#1:2` & `#197:143`) and `src/routes/catalog/+page.svelte`**

In `src/routes/+page.svelte`:
- **Editorial Hero (`#1:2`)**: Full-bleed `/images/hero-bg.png` (`h-[440px] md:h-[525px]`) with vignette + crisp `"Every room,\na little smarter."` (`Italiana`, `text-5xl sm:text-7xl lg:text-[96px]`) — remove the non-Figma paragraph and button cluttering the hero image.
- **Featured Header + Search Pill (`#31:8` + `#220:288`)**: Flex row with `"Featured"` (`Outfit SemiBold 40px..64px`) on the left and `<SearchPill bind:value={searchQuery} placeholder="Search devices..." />` on the right (pressing `Enter` navigates to `/catalog?q=...`; typing filters Home sections live!).
- **Asymmetric Featured Bento Grid (`#196:86` + `#93:495..342`)**:
  - When `filteredFeatured.length > 0` and `!searchQuery.trim()`:
    - Desktop `lg:grid lg:grid-cols-12 lg:gap-[24px] items-stretch`:
      - Left `lg:col-span-5`: `<FeaturedHeroCard product={filteredFeatured[0]} user={data.user} />` spanning the full height of two standard card rows (`722px`).
      - Right `lg:col-span-7`: 2-row horizontal bento scroller (`grid grid-rows-2 grid-flow-col auto-cols-[300px] sm:auto-cols-[336px] gap-[21px] overflow-x-auto pb-2 snap-x`) rendering `filteredFeatured.slice(1)`! (If `filteredFeatured.length <= 3`, gracefully adapts to single-row grid so there are no awkward empty cells.)
  - Category sections (`Lighting`, `Security`, `Audio`): Horizontal 5-card rows (`gap-[21px]`) with subtle `"View all ->"` hover link.

In `src/routes/catalog/+page.server.ts` & `src/routes/catalog/+page.svelte`:
- Read optional `q = url.searchParams.get('q') ?? ''` in `+page.server.ts`.
- Add `<SearchPill bind:value={searchQuery} />` in the Catalog header opposite `"Smart Home Catalog"`, filtering `data.products` live via `filterProductsByQuery` and syncing `?q=` cleanly.

- [x] **Step 4: Run verification**

Run: `npm test && npm run check`
Expected: PASS with 0 errors.

---

### Task 5: Full Cart Page Overhaul (`Cart 2` `#82:72`) + Selective Checkout Wiring

**Files:**
- Modify: `src/routes/cart/+page.server.ts`
- Modify: `src/routes/cart/+page.svelte`
- Modify: `src/routes/checkout/location/+page.server.ts`
- Modify: `src/routes/checkout/installation/+page.server.ts`
- Modify: `src/routes/checkout/review/+page.server.ts`
- Modify: `src/routes/api/v1/payments/complete/+server.ts`

- [x] **Step 1: Add `proceedCheckout` action on `/cart` and wire `hm_checkout_items` across Checkout Steps 1–3 & Payment Completion**

1. In `src/routes/cart/+page.server.ts`:
   - Add `proceedCheckout` action: parses `selectedItemIds` from `formData.getAll('selectedItemId')`, validates at least 1 active cart item belongs to `locals.user.id`, stores `hm_checkout_items` (`JSON.stringify(validIds)`, `httpOnly: true, path: '/', sameSite: 'lax', maxAge: 86400`), and throws `redirect(303, '/checkout/location')`.
2. In `src/routes/checkout/location/+page.server.ts`, `src/routes/checkout/installation/+page.server.ts`, and `src/routes/checkout/review/+page.server.ts`:
   - Read `selectedIds = parseSelectedCartItemIds(cookies.get('hm_checkout_items'))`.
   - Scope `activeCartItems = filterCheckoutCartItems(cartItems, selectedIds)` (if `selectedIds` was set by an older session and matches 0 current items, fall back to all active `cartItems` so direct Cart Popover -> Checkout never breaks!).
   - Compute `devicesTotalIdr`, `cartItemsCount`, `quote`, and `OrderItem` creation strictly from `activeCartItems`.
3. In `src/routes/api/v1/payments/complete/+server.ts`:
   - Inside the payment completion transaction, query `purchasedDeviceItems = await tx.orm.public.OrderItem.where({ orderId, lineType: 'DEVICE' }).all()`, collect `purchasedProductIds`, and delete **only** matching `CartItem` rows for `locals.user.id` (instead of `.deleteAll()`), preserving any unchecked items left in `/cart`!
   - Also delete `hm_checkout_items` cookie alongside `hm_checkout_address` and `hm_checkout_options`.

- [x] **Step 2: Rebuild `src/routes/cart/+page.svelte` to match Figma `Cart 2` (`#82:72`)**

- Maintain reactive `selectedIds = $state<Set<string>>(...)` initialized to all `available` item IDs (`$effect` keeps new items selected and prunes removed IDs).
- **6-Column Desktop Header (`hidden md:grid md:grid-cols-12`)**:
  - Col 1: Select-All checkbox (`aria-label="Select all available items"`, `#B6C4D3` border, `#4A6FA5`/`#00FBFF` checked fill).
  - Col 2–5: `Product`
  - Col 6–7: `Unit Price`
  - Col 8–9: `Quantity`
  - Col 10–11: `Total Price`
  - Col 12: `Action`
- **Row Cards (`#93:273..307`)**:
  - Glass-gradient rounded row cards (`rounded-[16px]`, `linear-gradient(90deg, rgba(74, 111, 165, 0.42) 0%, rgba(28, 42, 63, 0.34) 100%)`, `border border-[#CFF2FF]/25`, responsive mobile stack + 12-col desktop grid):
    - Per-row checkbox (disabled if `!item.available`),
    - `85x57` rounded thumbnail + `20px..22px` title (`#CFF2FF`) + `#75929C` 1-line description,
    - `Unit Price`: `tabular-nums text-white/85`,
    - `Quantity`: **`[ -  qty  + ]` bordered pill stepper (`84x38`, `rounded-[8px]`, `border-2 border-[#CFF2FF]/30`)** wired to `cartStore.setQuantity(item.id, nextQty)`,
    - `Total Price`: **`tabular-nums font-semibold text-[#00FBFF]`** (`formatIdr(item.product.priceIdr * item.quantity)`),
    - `Action`: white underlined **`Delete`** button (`#267:644`) wired to `cartStore.removeItem(item.id)`.
- **Bottom Checkout Bar (`#267:672..678`)**:
  - Right-aligned `Total ({totals.selectedUnitCount} {totals.selectedUnitCount === 1 ? 'Item' : 'Items'}):` + **`#00FBFF` `text-2xl font-semibold tabular-nums`** `{formatIdr(totals.subtotalIdr)}` + **`Check Out`** submit button (`w-full sm:w-[255px] h-[46px] rounded-[10px] bg-[#4A6FA5] hover:bg-[#5b84c0] text-[#CFF2FF] font-medium text-xl`, disabled when `totals.selectedLineCount === 0` or any *selected* item is unavailable).

- [x] **Step 3: Run tests & typecheck**

Run: `npm test && npm run check`
Expected: PASS with 0 errors.

---

### Task 6: Technicians Page Split Overhaul (`Location` Search + `Saved Address` Sidebar + `Assigned` Pill)

**Files:**
- Modify: `src/routes/technicians/+page.server.ts`
- Modify: `src/routes/technicians/+page.svelte`
- Modify: `src/lib/components/AddressDialog.svelte`

- [x] **Step 1: Extend `src/routes/technicians/+page.server.ts` with Saved Addresses, Active Assigned Order & Quick-Address Actions**

In `src/routes/technicians/+page.server.ts`:
- Load user's saved `addresses` (`db.orm.public.Address.where({ userId: locals.user.id }).orderBy((a) => a.createdAt.desc()).all()`), mapping `label`, `province`, `city`, `district`, `addressLine`, `postalCode`, `isDefault`.
- Also load `activeAssignedOrders` (`status` in `['ASSIGNED', 'SCHEDULED', 'IN_PROGRESS']` for `locals.user.id`) so we know which `technicianId`s are currently assigned/in-progress for this customer!
- Add form actions (or pair with `/api/v1/addresses`):
  - `saveQuickAddress`: validates `quickAddressSchema`, parses with `parseQuickSurabayaAddress`, creates `Address` row, returns `{ savedAddressDistrict: parsed.district }`.
  - `deleteAddress`: deletes user's `Address` by `addressId`.

- [x] **Step 2: Rebuild `src/routes/technicians/+page.svelte` to match Figma `#78:26` & `#222:430`**

- Inside the main `rounded-[40px]` glass container (`max-w-[1360px]`, `bg-[#1A3551]/92`, `border-4 border-[#1A3551]`):
  - **2-Column Layout (`grid grid-cols-1 lg:grid-cols-12 gap-8 items-start`)**:
    - **Left Column (`lg:col-span-8 space-y-5`)**:
      - Header row: **`Location`** (`Outfit Bold 32px..40px text-[#CFF2FF]`) + `<SearchPill bind:value={locationQuery} placeholder="Search area or technician (e.g. Menanggal)" />`.
      - Filtered Technician Cards (`filterTechniciansByLocation(data.technicians, locationQuery)`):
        - Avatar + Name + `5 stars` + `MapPin` service areas (`Menanggal, Surabaya`) + highlight quote.
        - **Right Status / CTA Pill**:
          - If `assignedTechIds.has(tech.id)` (and no other `PENDING_ASSIGNMENT` `targetOrder` overrides it): render Figma `#222:499` + `#266:553`: pill (`w-[166px] min-h-[44px] rounded-[15px] bg-[#071824]/60 border border-[#CFF2FF]/20 px-4 py-1.5 flex flex-col items-center justify-center`) showing `<CheckCircle class="w-4 h-4 text-[#25ED82]" /> Assigned` + `"In Progress..."` (`text-xs text-[#9FA2A7]`)!
          - Else if `isAvailable && data.targetOrder`: `Assign` submit button (`w-[166px] h-10 rounded-[15px] bg-[#4A6FA5]`).
          - Else if `!isAvailable`: `Currently booked`.
          - Else: `Book via checkout to assign` link (`/catalog`).
    - **Right Column (`lg:col-span-4 space-y-3.5`) — `"Saved Address"` Sidebar (`#222:447`, `#222:516`, `#222:440..446`)**:
      - Header pill (`h-[52px] px-5 rounded-[24px] bg-[#151447]/65 border border-[#4C527D]/60 flex items-center justify-between`):
        - MapPin/Bookmark icon + `"Saved Address"` (`Outfit Medium 20px text-[#CFF2FF]`),
        - Toggle button: `+` (`PlusSquare` `#220:308` when closed) / `-` (`Minus` `#222:519` when inline add form is open).
      - **Inline Quick-Add Card (`#222:516`, shown when `isAddingAddress` is true, `transition:slide`)**:
        - `rounded-[24px] bg-[#006AD7]/15 border border-[#CFF2FF]/25 p-5 space-y-3`:
        - Minimalist underline input `Name` (`placeholder="Name (e.g. Home, School)"`, `border-b border-[#CFF2FF]/40 focus:border-[#CFF2FF]`) + top-right underlined `Cancel` button (`#222:530`).
        - Minimalist underline input `Input your address` (`placeholder="e.g. Menanggal, Jl. Kembang Indah, 60267"`) + bottom-right underlined `Save` button (`#222:537`).
      - **Saved Address Cards (`#222:440..446`)**:
        - Clickable `rounded-[24px]` glass cards (`p-4 border transition-all`, highlighted with `ring-2 ring-[#00FBFF]/60 bg-[#006AD7]/25` when `selectedAddressId === addr.id`):
        - Clicking a card sets `locationQuery = addr.district` (clicking again clears filter!), immediately filtering Surabaya technicians for that saved address!
        - Top-right `-` bar button (`#222:444`, `aria-label="Remove {title} address"`) deletes the address with optimistic removal + toast.
- Also add optional `Address Label (e.g. Home, Office)` input to `src/lib/components/AddressDialog.svelte` so addresses created during Checkout Step 1 also carry nice labels on `/technicians`.

- [x] **Step 3: Run tests & typecheck**

Run: `npm test && npm run check`
Expected: PASS with 0 errors.

---

### Task 7: Checkout Step 2/3 Polish, Step 4 `"Invoice Receipt"` Card (`#138:41`), Auth Cross-Link & Final Verification

**Files:**
- Modify: `src/routes/checkout/installation/+page.svelte`
- Modify: `src/routes/checkout/review/+page.svelte`
- Modify: `src/routes/checkout/confirmation/[orderId]/+page.server.ts`
- Modify: `src/routes/checkout/confirmation/[orderId]/+page.svelte`
- Modify: `src/routes/register/+page.svelte`

- [x] **Step 1: Update Checkout Step 2 (`#95:60`) & Step 3 (`#109:188`)**

1. `src/routes/checkout/installation/+page.svelte`:
   - Change `"1. Configure Installation & Add-ons"` -> **`"2. Configure Installation & Add-ons"`**.
   - Replace raw emojis (`🛠️`, `📡`) with crisp Lucide icons (`Wrench`, `Radio`) in `text-[#CFF2FF]`, and add `tabular-nums` to all IDR figures.
2. `src/routes/checkout/review/+page.svelte`:
   - Change `"1. Review & Complete Payment"` -> **`"3. Review & Complete Payment"`**.
   - Wrap the `Technician Installation` line inside Figma `#109:188`'s highlighted translucent pill (`p-3.5 rounded-[14px] bg-[#4A6FA5]/25 border border-[#CFF2FF]/15`), and apply `tabular-nums` to all figures.

- [x] **Step 2: Add `PAYMENT & BOOKING CONFIRMED` Badge + `"Invoice Receipt"` Card (`#138:41`) to Step 4 Confirmation**

1. `src/routes/checkout/confirmation/[orderId]/+page.server.ts`:
   - Include `items` on `Order` (`db.orm.public.Order.where({ id: params.orderId }).include('technician').include('items').first()`).
   - Return `lines: order.items.map(...)` (`lineType`, `nameSnapshot`, `unitPriceIdr`, `quantity`, `lineTotalIdr`).
2. `src/routes/checkout/confirmation/[orderId]/+page.svelte`:
   - In the top confirmation card (`#138:65`): add the **`PAYMENT & BOOKING CONFIRMED`** pill badge (`px-4 py-1 rounded-full bg-[#25ED82]/15 border border-[#25ED82]/40 text-[#25ED82] text-xs font-extrabold tracking-[0.14em] uppercase`) between the white checkmark circle and `"Thank you for your order!"`, and keep the `Choose Technician` + `View Booking Details` CTAs.
   - Below the top card, add the **new `"Invoice Receipt"` card (`#158:45`, `max-w-[880px] w-full rounded-[40px] p-8 sm:p-10 border border-[#CFF2FF]/25 backdrop-blur-md bg-[#1A3551]/60 space-y-6`)**:
     - Centered bold heading `"Invoice Receipt"` (`Outfit Bold 26px text-[#CFF2FF]`),
     - Itemized receipt rows (`data.order.lines`):
       - Left: line name (`text-[#CFF2FF] font-medium`) + subtitle (`{line.quantity} x {formatIdr(line.unitPriceIdr)}` in `#8CAAB5`, plus `"Full wiring & mounting warranty"` subtitle under `INSTALLATION` lines matching Figma `#176:49`!),
       - Right: `tabular-nums text-[#CFF2FF] font-medium` `{formatIdr(line.lineTotalIdr)}`,
     - `#4A6FA5` `h-[3px] rounded-full` divider (`#176:54`),
     - Bottom total row: `"Total Paid (IDR)"` (`text-lg font-medium text-[#CFF2FF]`) + `tabular-nums font-bold text-xl text-[#00FBFF]` `{formatIdr(data.order.totalIdr)}`.

- [x] **Step 3: Update `/register` Cross-Link Placement (`#37:7`) & Run Full Gate Verification**

- In `src/routes/register/+page.svelte`: move the `"Already have an account? Sign in"` (`Log in if you have an account`) link cleanly **below** the `max-w-[500px]` translucent card container to match Figma `#37:7`.
- Run full verification suite:
  1. `npm test` — all Vitest unit tests pass.
  2. `npm run check` — `svelte-kit sync && svelte-check` reports 0 errors and 0 warnings.
  3. `npm run build` — production Vite + Prisma contract build succeeds cleanly.
  4. Start dev server & verify desktop (`1440x900`) and mobile (`390x844`) user journeys across `/`, `/catalog` (Cart Popover + FAB + Search + `Add +` repeat increment), `/cart` (checkbox partial selection + `- 1 +` stepper + `Delete`), `/checkout/*` (`Invoice Receipt`), and `/technicians` (`Location` search + `Saved Address` quick-add/click-to-filter/delete + `Assigned` badge).

