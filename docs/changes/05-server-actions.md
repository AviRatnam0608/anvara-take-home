# Challenge 5: Dashboards with Server Actions

## Overview

Converted both dashboards (Publisher + Sponsor) to use **Next.js Server Actions** for all CRUD mutations. Replaced client-side fetching and imperative state management with `useActionState`, `useFormStatus`, `revalidatePath`, and a shared server-side API helper with cookie forwarding.

## Architecture

```
lib/server-api.ts              — Server-side fetch helper (cookie forwarding via next/headers)
lib/types.ts                   — ActionState type for server action return values

app/components/submit-button.tsx — Shared SubmitButton using useFormStatus()

dashboard/publisher/
  actions.ts                   — createAdSlotAction, updateAdSlotAction, deleteAdSlotAction
  page.tsx                     — Server Component: server-side fetch → props to children
  components/
    ad-slot-list.tsx           — Pure props-based component (no client-side fetch)
    ad-slot-card.tsx           — Displays ad slot with Edit/Delete actions
    create-ad-slot-form.tsx    — Modal form using useActionState + server action
    edit-ad-slot-form.tsx      — Modal form, pre-populated with existing data
    delete-ad-slot-button.tsx  — Form with window.confirm + useActionState

dashboard/sponsor/
  actions.ts                   — createCampaignAction, updateCampaignAction, deleteCampaignAction
  page.tsx                     — Server Component: server-side fetch via serverApi
  components/
    campaign-list.tsx           — Pure props-based (unchanged)
    campaign-card.tsx           — Displays campaign with Edit/Delete actions
    create-campaign-form.tsx    — Modal form using useActionState + server action
    edit-campaign-form.tsx      — Modal form with status dropdown, date inputs
    delete-campaign-button.tsx  — Form with window.confirm + useActionState
```

## Changes Made

### 1. Server-Side API Helper (`lib/server-api.ts`)

Server Actions can't use `credentials: 'include'` (browser-only). This helper reads cookies from `next/headers` and forwards them to the backend in every request.

**Key features:**
- Reads cookies via `cookies()` from `next/headers`
- Parses backend error messages (fixes the FIXME about generic "API request failed")
- Handles 204 No Content for DELETE responses
- Returns `{ data?, error? }` instead of throwing — cleaner for server actions

### 2. ActionState Type (`lib/types.ts`)

Standard return type for all server actions:
```typescript
interface ActionState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}
```

### 3. Shared SubmitButton (`app/components/submit-button.tsx`)

Uses `useFormStatus()` from `react-dom` to show pending state automatically. Must be rendered inside a `<form>` whose `action` is a server action.

### 4. Publisher Server Actions (`dashboard/publisher/actions.ts`)

Three server actions following the `(prevState, formData) => ActionState` pattern:

- **`createAdSlotAction`** — Validates name, type (against enum), basePrice (> 0). Calls `POST /api/ad-slots`. Calls `revalidatePath('/dashboard/publisher')` on success.
- **`updateAdSlotAction`** — Same validation + reads `id` from hidden field. Calls `PUT /api/ad-slots/:id`.
- **`deleteAdSlotAction`** — Reads `id` from hidden field. Calls `DELETE /api/ad-slots/:id`.

### 5. Publisher Dashboard Refactor

**`page.tsx`** — Converted from rendering `<PublisherContent>` (client-side fetching) to a Server Component that fetches ad slots via `serverApi` and passes them as props. This is required for `revalidatePath` to work.

**`ad-slot-list.tsx`** — Simplified from a client component with `useEffect` + `useState` to a pure props-based component. No more `refreshTrigger` pattern.

**`ad-slot-card.tsx`** — Added Edit button (opens `EditAdSlotForm` modal) and Delete button (`DeleteAdSlotButton` form).

**`create-ad-slot-form.tsx`** — Refactored from manual `useState` + `onSubmit` + `createAdSlot()` to `useActionState(createAdSlotAction)` with `<form action={formAction}>`. Modal auto-closes on `state.success` via `useEffect`.

**`edit-ad-slot-form.tsx`** — New. Modal with `defaultValue` props for pre-populating fields. Hidden `<input name="id">` passes the ad slot ID to the server action.

**`delete-ad-slot-button.tsx`** — New. Wraps a `<form action={formAction}>` with `window.confirm()` in `onSubmit`. Shows "Deleting..." via `useFormStatus`.

**`publisher-content.tsx`** — Deleted. No longer needed since `revalidatePath` replaces the `refreshTrigger` counter pattern.

### 6. Sponsor Server Actions (`dashboard/sponsor/actions.ts`)

Three server actions:

- **`createCampaignAction`** — Validates name, budget (> 0), startDate, endDate (end > start). Converts dates to ISO strings. Calls `POST /api/campaigns`.
- **`updateCampaignAction`** — Same validation + status enum validation. Calls `PUT /api/campaigns/:id`.
- **`deleteCampaignAction`** — Calls `DELETE /api/campaigns/:id`.

### 7. Sponsor Dashboard Updates

**`page.tsx`** — Replaced manual cookie forwarding + `getCampaigns()` with `serverApi()`. Added `<CreateCampaignForm />` (replacing the TODO placeholder).

**`campaign-card.tsx`** — Added Edit button (opens `EditCampaignForm`) and Delete button (`DeleteCampaignButton`). Now uses the typed `Campaign` interface instead of inline type.

**`create-campaign-form.tsx`** — New. Modal form with Name, Description, Budget, Start Date, End Date.

**`edit-campaign-form.tsx`** — New. Pre-populated modal with all fields + Status dropdown. Uses `toDateInput()` helper to convert ISO strings to `YYYY-MM-DD` for `<input type="date">`.

**`delete-campaign-button.tsx`** — New. Same pattern as publisher's delete button.

## Design Decisions

### Why `useActionState` instead of `useFormState`?

React 19 renamed `useFormState` (from `react-dom`) to `useActionState` (from `react`). Since we're on React 19.2.3, `useActionState` is the canonical API.

### Why convert publisher data fetching to server-side?

`revalidatePath('/dashboard/publisher')` only re-renders **Server Components**. The previous client-side fetching via `useEffect` in `AdSlotList` wouldn't re-execute after revalidation. Moving to server-side fetch makes revalidation work automatically.

### Why a shared `serverApi()` helper?

- Server Actions can't use `credentials: 'include'` (browser-only)
- Manual cookie forwarding was duplicated in `sponsor/page.tsx`
- The client-side `api()` threw generic errors without parsing backend messages
- `serverApi()` returns `{ data?, error? }` — better for action return values

### Why `window.confirm()` for delete?

Simplest approach that provides confirmation UX without extra component complexity. Wrapped in a `<form>` so `useActionState` handles the state properly. The `onSubmit` handler calls `e.preventDefault()` if the user cancels.

### Why `defaultValue` instead of `value` in edit forms?

`<form action={formAction}>` works with uncontrolled inputs. Using `defaultValue` lets the form work with progressive enhancement and avoids needing `onChange` handlers + `useState` for each field.

## Tests

### Updated Tests

| File | Changes |
|---|---|
| `create-ad-slot-form.test.tsx` | Rewrote 10 tests to work with `useActionState` (mocked) instead of client-side `onSubmit`. Tests: button rendering, modal open/close, field validation display, server error display, form field names for FormData, error border styling. |
| `campaign-card.test.tsx` | Updated `baseCampaign` fixture to include `sponsorId` (required by typed `Campaign` interface). Added mock for server actions module. All 13 existing tests still pass. |

### Test Results

**Frontend:** 26 tests passing (3 test files)
**Backend:** 110 tests passing (5 test files)
**Total:** 136 tests, all passing

### TypeScript

`pnpm -r typecheck` — zero errors across both packages.

## Verification Results

### API-Level CRUD Verification (curl)

| Test | Expected | Actual |
|---|---|---|
| Publisher — Create ad slot | 201 | ✅ 201 |
| Publisher — Update ad slot | 200 | ✅ 200 |
| Publisher — Delete ad slot | 204 | ✅ 204 |
| Publisher — GET after delete | 404 | ✅ 404 |
| Sponsor — Create campaign | 201 | ✅ 201 |
| Sponsor — Update campaign | 200 | ✅ 200 |
| Sponsor — Delete campaign | 204 | ✅ 204 |
| Sponsor — GET after delete | 404 | ✅ 404 |
| Cross-role: publisher → campaign PUT | 403 | ✅ 403 |
| Cross-role: sponsor → ad-slot PUT | 403 | ✅ 403 |
| Invalid ad slot type | 400 | ✅ 400 |
| Empty campaign update body | 400 | ✅ 400 |
| Unauthenticated PUT | 401 | ✅ 401 |

### Server-Side Rendering Verification

| Test | Result |
|---|---|
| Publisher dashboard — title, button, ad slot data, Edit/Delete buttons in SSR HTML | ✅ All present |
| Sponsor dashboard — title, button, campaign data, Edit/Delete buttons in SSR HTML | ✅ All present |

### Authentication & Role Guards

| Test | Expected | Actual |
|---|---|---|
| Unauthenticated → Publisher dashboard | 307 redirect | ✅ 307 |
| Unauthenticated → Sponsor dashboard | 307 redirect | ✅ 307 |
| Publisher → Sponsor dashboard | 307 redirect | ✅ 307 |
| Sponsor → Publisher dashboard | 307 redirect | ✅ 307 |

### Browser Verification

**Publisher Dashboard:**
- [x] Ad slots displayed with type badges, prices, availability
- [x] "Add Ad Slot" opens modal with Name, Description, Type, Base Price
- [x] Empty form submit shows field-level validation errors with red borders
- [x] Valid submit creates slot → modal closes → list refreshes
- [x] "Edit" opens pre-populated modal → save updates card → modal closes
- [x] "Delete" with confirm dialog → slot removed from list
- [x] `revalidatePath` refreshes data after every mutation

**Sponsor Dashboard:**
- [x] Campaigns displayed with status badges, budget bars, date ranges
- [x] "Add Campaign" opens modal with Name, Description, Budget, Start Date, End Date
- [x] Valid submit creates campaign with DRAFT status → list refreshes
- [x] "Edit" shows pre-populated modal with Status dropdown → status change works
- [x] "Delete" with confirm dialog → campaign removed from list
- [x] Date inputs work correctly with `<input type="date">`

## Files Modified/Created

| File | Action | Purpose |
|---|---|---|
| `lib/server-api.ts` | NEW | Server-side fetch with cookie forwarding |
| `lib/types.ts` | MODIFIED | Added `ActionState` type |
| `app/components/submit-button.tsx` | NEW | Shared `useFormStatus` button |
| `dashboard/publisher/actions.ts` | NEW | 3 server actions (create/update/delete) |
| `dashboard/publisher/page.tsx` | REFACTORED | Server-side data fetch |
| `dashboard/publisher/components/ad-slot-list.tsx` | SIMPLIFIED | Props-based, no client fetch |
| `dashboard/publisher/components/ad-slot-card.tsx` | ENHANCED | Added Edit/Delete buttons |
| `dashboard/publisher/components/create-ad-slot-form.tsx` | REFACTORED | useActionState + server action |
| `dashboard/publisher/components/edit-ad-slot-form.tsx` | NEW | Edit modal with pre-populated fields |
| `dashboard/publisher/components/delete-ad-slot-button.tsx` | NEW | Delete with confirm dialog |
| `dashboard/publisher/components/publisher-content.tsx` | DELETED | Replaced by revalidatePath |
| `dashboard/publisher/components/create-ad-slot-form.test.tsx` | REWRITTEN | Tests for useActionState-based form |
| `dashboard/sponsor/actions.ts` | NEW | 3 server actions (create/update/delete) |
| `dashboard/sponsor/page.tsx` | ENHANCED | Uses serverApi, added CreateCampaignForm |
| `dashboard/sponsor/components/campaign-card.tsx` | ENHANCED | Added Edit/Delete buttons, typed props |
| `dashboard/sponsor/components/create-campaign-form.tsx` | NEW | Create modal with date inputs |
| `dashboard/sponsor/components/edit-campaign-form.tsx` | NEW | Edit modal with status dropdown |
| `dashboard/sponsor/components/delete-campaign-button.tsx` | NEW | Delete with confirm dialog |
| `dashboard/sponsor/components/campaign-card.test.tsx` | UPDATED | Added sponsorId to fixtures, action mocks |
