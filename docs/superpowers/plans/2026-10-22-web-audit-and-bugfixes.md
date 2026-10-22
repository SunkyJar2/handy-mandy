# Handy Mandy Deep-Dive Web Audit & Bugfix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish an automated Vitest TDD test suite and fix all 11 root-cause bugs, security vulnerabilities (IDOR & open redirect), broken user flows, and Modern Web Guidance accessibility defects discovered during the deep-dive web audit.

**Architecture:** We add Vitest unit/integration tests covering shared utilities, schemas, pricing, database URL sanitization, and SvelteKit server load/action/API handlers. Every bug fix follows strict Red-Green-Refactor TDD: write a failing test reproducing the exact bug first, verify it fails, implement the minimal fix, and verify all tests and `svelte-check` pass with zero errors and zero warnings.

**Tech Stack:** SvelteKit 2 / Svelte 5 (Runes), TypeScript 6, Vite 8, Vitest, Zod 4, Prisma 8 (`@prisma/orm-postgres`), Tailwind CSS v4.

## Global Constraints

- Follow strict TDD (`test-driven-development`): write failing test first, run it to watch it fail (RED), write minimal production code to pass (GREEN), and refactor.
- Maintain zero errors and zero warnings in `npm run check` (`svelte-check`).
- Follow `modern-web-guidance` standards for accessible dialogs (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `Escape` key handling), live regions (`aria-live="polite"`), skip links, semantic form controls, and keyboard navigation.
- Preserve all existing visual styling and Figma layout fidelity.

---

### Task 1: Configure Vitest Test Runner & Fix URL/Redirect Sanitization + DB SSL Warning (BUG-01 & BUG-11f)

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Create: `src/lib/shared/url.ts`
- Modify: `src/prisma/db.ts`
- Modify: `src/routes/login/+page.server.ts`
- Modify: `src/routes/login/+page.svelte`
- Modify: `src/routes/register/+page.server.ts`
- Modify: `src/routes/register/+page.svelte`
- Test: `src/lib/shared/url.test.ts`

**Interfaces:**
- Produces: `sanitizeNextUrl(raw: string | null | undefined): string` in `src/lib/shared/url.ts`
- Produces: `cleanUrl(raw?: string): string | null` in `src/prisma/db.ts`

- [x] **Step 1: Install Vitest (if needed) or configure test runner and write failing tests in `src/lib/shared/url.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { sanitizeNextUrl } from './url';
import { cleanUrl } from '../../prisma/db';

describe('sanitizeNextUrl', () => {
  it('returns / for null, undefined, or empty strings', () => {
    expect(sanitizeNextUrl(null)).toBe('/');
    expect(sanitizeNextUrl(undefined)).toBe('/');
    expect(sanitizeNextUrl('')).toBe('/');
  });

  it('allows valid internal paths with query strings', () => {
    expect(sanitizeNextUrl('/catalog')).toBe('/catalog');
    expect(sanitizeNextUrl('/catalog?category=lighting')).toBe('/catalog?category=lighting');
    expect(sanitizeNextUrl('/technicians?orderId=123')).toBe('/technicians?orderId=123');
  });

  it('rejects protocol-relative, backslash-relative, and external URLs', () => {
    expect(sanitizeNextUrl('//evil.com')).toBe('/');
    expect(sanitizeNextUrl('/\\evil.com')).toBe('/');
    expect(sanitizeNextUrl('https://evil.com')).toBe('/');
    expect(sanitizeNextUrl('javascript:alert(1)')).toBe('/');
  });
});

describe('cleanUrl', () => {
  it('sets uselibpqcompat=true when adding sslmode=require for remote hosts', () => {
    const res = cleanUrl('postgresql://user:pass@ep-test.aws.neon.tech/neondb');
    expect(res).toContain('sslmode=require');
    expect(res).toContain('uselibpqcompat=true');
  });
});
```

- [x] **Step 2: Run test to verify it fails (RED)**

Run: `npm test`
Expected: FAIL (`Cannot find module './url'`)

- [x] **Step 3: Implement `src/lib/shared/url.ts`, update `src/prisma/db.ts`, and wire `sanitizeNextUrl` into `/login` and `/register`**

In `src/lib/shared/url.ts`:
```typescript
export function sanitizeNextUrl(raw: string | null | undefined): string {
  if (!raw || typeof raw !== 'string') return '/';
  const trimmed = raw.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return '/';
  }
  try {
    const parsed = new URL(trimmed, 'http://localhost');
    if (parsed.origin !== 'http://localhost') return '/';
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return '/';
  }
}
```

Update `src/routes/register/+page.server.ts` to add `load` returning `{ next: sanitizeNextUrl(url.searchParams.get('next')) }` and use `sanitizeNextUrl` on redirect; update `src/routes/login/+page.server.ts` to use `sanitizeNextUrl`; update `src/routes/login/+page.svelte` and `src/routes/register/+page.svelte` so cross-links and form actions preserve `?next=`.

- [x] **Step 4: Run test to verify it passes (GREEN)**

Run: `npm test`
Expected: PASS

---

### Task 2: Fix Date/Option Validation & Safe Cookie Parsing in Checkout Step 2 (BUG-06)

**Files:**
- Modify: `src/lib/shared/schemas.ts`
- Create: `src/lib/shared/checkout.ts`
- Modify: `src/routes/checkout/installation/+page.server.ts`
- Modify: `src/routes/checkout/installation/+page.svelte`
- Modify: `src/routes/checkout/review/+page.server.ts`
- Test: `src/lib/shared/checkout.test.ts`

**Interfaces:**
- Produces: `formatLocalDateInput(date: Date): string`, `getTomorrowLocalDate(): string`, `getMaxBookingLocalDate(daysAhead?: number): string`, `parseCheckoutOptionsCookie(raw?: string | null)` in `src/lib/shared/checkout.ts`

- [x] **Step 1: Write failing tests in `src/lib/shared/checkout.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import {
  formatLocalDateInput,
  getTomorrowLocalDate,
  parseCheckoutOptionsCookie
} from './checkout';
import { checkoutOptionsSchema } from './schemas';

describe('checkout date & cookie utilities', () => {
  it('formats local date as YYYY-MM-DD without UTC shift', () => {
    const d = new Date(2026, 9, 22, 2, 0, 0); // Oct 22 local 02:00 AM
    expect(formatLocalDateInput(d)).toBe('2026-10-22');
  });

  it('rejects today and past dates in checkoutOptionsSchema, accepts tomorrow', () => {
    const todayStr = formatLocalDateInput(new Date());
    const tomorrowStr = getTomorrowLocalDate();

    expect(checkoutOptionsSchema.safeParse({ preferredDate: todayStr }).success).toBe(false);
    expect(checkoutOptionsSchema.safeParse({ preferredDate: '2020-01-01' }).success).toBe(false);
    expect(checkoutOptionsSchema.safeParse({ preferredDate: tomorrowStr }).success).toBe(true);
  });

  it('safely parses malformed checkout options cookie without throwing', () => {
    expect(parseCheckoutOptionsCookie('{bad-json')).toEqual({
      includeInstallation: true,
      includeHub: false,
      preferredDate: null,
      specialInstructions: null
    });
  });
});
```

- [x] **Step 2: Run test to verify it fails (RED)**

Run: `npm test`
Expected: FAIL

- [x] **Step 3: Implement `src/lib/shared/checkout.ts`, update `checkoutOptionsSchema`, and validate in `/checkout/installation`**

Implement `src/lib/shared/checkout.ts`, update `checkoutOptionsSchema` in `src/lib/shared/schemas.ts`, update `/checkout/installation/+page.server.ts` (`load` and `saveOptions` validation with `fail(422)`), update `/checkout/installation/+page.svelte` to use `formatLocalDateInput` and display `form?.message`, and update `/checkout/review/+page.server.ts` to use `parseCheckoutOptionsCookie`.

- [x] **Step 4: Run test to verify it passes (GREEN)**

Run: `npm test`
Expected: PASS

---

### Task 3: Fix Catalog Unknown Category Filter & Admin Product PATCH Validation (BUG-03 & BUG-09)

**Files:**
- Modify: `src/lib/shared/schemas.ts`
- Modify: `src/routes/catalog/+page.server.ts`
- Modify: `src/routes/api/v1/admin/products/[id]/+server.ts`
- Modify: `src/routes/admin/catalog/+page.server.ts`
- Modify: `src/lib/components/ProductModal.svelte`
- Modify: `prisma/seed.ts`
- Test: `src/lib/shared/admin-catalog.test.ts`

**Interfaces:**
- Produces: `adminProductPatchSchema` in `src/lib/shared/schemas.ts`

- [x] **Step 1: Write failing tests in `src/lib/shared/admin-catalog.test.ts`**

Test `adminProductPatchSchema` rejecting negative/NaN prices, short descriptions, invalid status enums, and empty payloads; test catalog category resolution returning `null` when `selectedCategory` slug does not match any category.

- [x] **Step 2: Run test to verify it fails (RED)**

Run: `npm test`
Expected: FAIL

- [x] **Step 3: Implement `adminProductPatchSchema`, fix `/catalog/+page.server.ts`, validate `PATCH /api/v1/admin/products/[id]`, fix image permissions & presets**

1. Add `adminProductPatchSchema` to `src/lib/shared/schemas.ts`.
2. In `src/routes/catalog/+page.server.ts`, if `selectedCategory` is provided and `foundCat` is undefined, return `products: []` immediately.
3. In `src/routes/api/v1/admin/products/[id]/+server.ts`, validate request body with `adminProductPatchSchema`, check category existence if `categoryId` is updated, and update `updatedAt`.
4. Fix `static/images/product-*.jpg` permissions (`0644`), add preset buttons in `ProductModal.svelte`, and update `prisma/seed.ts` product image URLs.

- [x] **Step 4: Run test to verify it passes (GREEN)**

Run: `npm test`
Expected: PASS

---

### Task 4: Fix Checkout Address IDOR, Inactive Cart Item Guard, Payment & Technician State Guards (BUG-04, BUG-05, BUG-07, BUG-08, BUG-10)

**Files:**
- Create: `src/lib/server/guards.ts`
- Modify: `src/routes/logout/+server.ts`
- Modify: `src/routes/api/v1/addresses/+server.ts`
- Modify: `src/routes/checkout/location/+page.server.ts`
- Modify: `src/routes/checkout/installation/+page.server.ts`
- Modify: `src/routes/checkout/review/+page.server.ts`
- Modify: `src/routes/checkout/confirmation/[orderId]/+page.server.ts`
- Modify: `src/routes/api/v1/payments/complete/+server.ts`
- Modify: `src/routes/technicians/+page.server.ts`
- Test: `src/lib/server/guards.test.ts`

**Interfaces:**
- Produces: `validateActiveCartItems`, `canCompletePayment`, `canAssignTechnician`, `nextOrderNumberFromMax` in `src/lib/server/guards.ts`

- [x] **Step 1: Write failing tests in `src/lib/server/guards.test.ts`**

Test:
- `validateActiveCartItems` returns `false` when cart is empty or contains any `INACTIVE` or missing product.
- `canCompletePayment` returns `'complete'` for `PENDING_PAYMENT`, `'idempotent'` for `PENDING_ASSIGNMENT`/`ASSIGNED`/`SCHEDULED`/`IN_PROGRESS`/`COMPLETED`, and `'invalid'` for `CANCELLED`.
- `canAssignTechnician` returns `true` only for `PENDING_ASSIGNMENT` and `ASSIGNED`, and `false` for `PENDING_PAYMENT`, `COMPLETED`, `CANCELLED`.
- `nextOrderNumberFromMax` increments the highest existing sequence for `HM-YYMMDD-NNNN` even when earlier orders were deleted.

- [x] **Step 2: Run test to verify it fails (RED)**

Run: `npm test`
Expected: FAIL

- [x] **Step 3: Implement `src/lib/server/guards.ts` and apply guards across checkout, payment, address, logout, and technician routes**

1. Create `src/lib/server/guards.ts`.
2. In `/logout/+server.ts`, delete `hm_checkout_address` and `hm_checkout_options` cookies in addition to `hm_session`.
3. In `/checkout/location/+page.server.ts`, `/checkout/installation/+page.server.ts`, and `/checkout/review/+page.server.ts`:
   - Redirect `303` to `/cart` if `!validateActiveCartItems(cartItems)`.
   - Scope all `Address` queries by `{ id: addressId, userId: locals.user.id }`.
   - Validate `savedAddressId` against `mappedAddresses` in `/checkout/location/+page.server.ts`.
4. In `/api/v1/payments/complete/+server.ts`:
   - Use `canCompletePayment(order.status)`: reject `CANCELLED` with `409`, return idempotent redirect without resetting status or wiping cart if already paid, and delete `hm_checkout_address` & `hm_checkout_options` cookies on completion.
5. In `/checkout/confirmation/[orderId]/+page.server.ts`:
   - Redirect `303` to `/checkout/review` if `order.status === 'PENDING_PAYMENT'`.
6. In `/technicians/+page.server.ts`:
   - Only select/allow `targetOrder` if `canAssignTechnician(targetOrder.status)` in `load` and `actions.assign`.
7. In `/api/v1/addresses/+server.ts`:
   - Auto-set `isDefault = true` if user has 0 existing addresses; if `isDefault` is true, unset `isDefault` on previous user addresses.

- [x] **Step 4: Run test to verify it passes (GREEN)**

Run: `npm test`
Expected: PASS

---

### Task 5: Fix Guest Pending Cart Flow, UI Error Feedback, Svelte 5 Warnings & Modern Web Guidance Accessibility (BUG-02, BUG-08b, BUG-10b, BUG-11)

**Files:**
- Modify: `tsconfig.json`
- Modify: `src/routes/+layout.svelte`
- Modify: `src/lib/components/ProductCard.svelte`
- Modify: `src/lib/components/AddressDialog.svelte`
- Modify: `src/lib/components/ProductModal.svelte`
- Modify: `src/lib/components/MockSnapModal.svelte`
- Modify: `src/lib/components/MenuDrawer.svelte`
- Modify: `src/lib/components/ToastContainer.svelte`
- Modify: `src/routes/cart/+page.svelte`
- Modify: `src/routes/checkout/location/+page.svelte`
- Modify: `src/routes/checkout/review/+page.svelte`
- Modify: `src/routes/bookings/[id]/+page.svelte`
- Modify: `src/routes/technicians/+page.svelte`

- [x] **Step 1: Add unit test for local date display formatting & verify `npm run check` warnings**

Add test for timezone-safe `formatIsoDateDisplay('2026-10-30')` in `src/lib/shared/checkout.test.ts` and watch it fail (RED).

- [x] **Step 2: Implement UI, reactivity, and accessibility fixes**

1. Remove deprecated `"baseUrl": "."` from `tsconfig.json`.
2. In `src/lib/components/ProductCard.svelte`, include `window.location.search` in login redirect URL.
3. In `src/routes/+layout.svelte`, add skip-to-content link, `id="main-content" tabindex="-1"` on `<main>`, and `$effect` to process `sessionStorage.getItem('pendingCartProduct')` when `data.user` becomes authenticated.
4. In `src/routes/checkout/location/+page.svelte`:
   - Fix Svelte 5 `state_referenced_locally` warning using `$derived` / `$effect`.
   - Convert address cards from non-accessible `<div>`s to keyboard-accessible `<button type="button" role="radio" aria-checked={isSelected}>` elements within a `role="radiogroup"`.
   - Display `form?.message` error alert if address selection fails.
5. In `src/routes/cart/+page.svelte`: replace `<a href="#">` when `hasUnavailableItems` is true with a disabled `<button type="button" disabled>` so clicking does not jump to `#`.
6. In `src/routes/technicians/+page.svelte`: accept `form` prop and render `form?.message` error banner.
7. In `src/routes/bookings/[id]/+page.svelte`: display accurate status pill based on `data.order.status` and include a "Change Technician" link when `data.order.status === 'ASSIGNED'`.
8. In `AddressDialog.svelte`, `ProductModal.svelte`, `MockSnapModal.svelte`, and `MenuDrawer.svelte`:
   - Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `svelte:window onkeydown` `Escape` handler.
   - Reset `AddressDialog.svelte` fields after successful save.
9. In `ToastContainer.svelte`: add `role="status" aria-live="polite"`.

- [x] **Step 3: Run `npm test` and `npm run check` to verify 0 errors and 0 warnings**

Run: `npm test && npm run check`
Expected: All tests PASS, `svelte-check found 0 errors and 0 warnings`

