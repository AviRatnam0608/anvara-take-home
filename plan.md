# UX Improvements Plan

## Phase 1: Quick fixes (Form + Card layout)
**Scope:** 2 files | **Risk:** Low

### 1a. Preserve form data on validation failure
`create-campaign-form.tsx` — Add `useState` for each field (name, description, budget, startDate, endDate). Bind `value` + `onChange`. Values survive the `useActionState` round-trip when `state.fieldErrors` is returned.

### 1b. Pin card footer to bottom
`ad-slot-grid.tsx` — Add `flex flex-col` to each card link, `mt-auto` to the footer div (availability + price). Ensures consistent alignment across cards of different content heights.

---

## Phase 2: Marketplace card icons
**Scope:** 1 file | **Risk:** Low

Add Phosphor icons per ad slot type to each marketplace card.

| Type | Icon |
|------|------|
| DISPLAY | `Monitor` |
| VIDEO | `VideoCamera` |
| NATIVE | `Article` |
| NEWSLETTER | `EnvelopeSimple` |
| PODCAST | `Microphone` |

`ad-slot-grid.tsx` — Add icon map, render icon inside the card alongside the type badge.

---

## Phase 3: Backend search, filter & pagination
**Scope:** 1 file | **Risk:** Medium

Extend `GET /api/ad-slots` in `apps/backend/src/routes/adSlots.ts`:

- `search` — Case-insensitive search on `name`, `description`, and `publisher.name` (Prisma `OR` + `contains` + `mode: 'insensitive'`)
- `minPrice` / `maxPrice` — Prisma `gte`/`lte` on `basePrice`
- `type` — Already supported
- `page` / `limit` — Offset pagination via `skip`/`take`
- Response envelope: `{ data: AdSlot[], total, page, totalPages }`

---

## Phase 4: Frontend search, filter & pagination UI
**Scope:** 3 files (1 new) | **Risk:** Medium | **Depends on:** Phase 3

- **New: `marketplace-filters.tsx`** — Client component with: text search input (debounced), type dropdown, min/max price inputs. Updates URL search params via `useRouter` + `useSearchParams`.
- **`marketplace/page.tsx`** — Read `searchParams`, forward to `serverApi('/api/ad-slots?...')`, render `<MarketplaceFilters />` above grid.
- **`ad-slot-grid.tsx`** — Add Previous/Next pagination buttons at the bottom. Accept `page`, `totalPages` props.

---

## Execution Order

| Phase | What | Depends on |
|-------|------|-----------|
| 1 | Form fix + card footer | None |
| 2 | Card type icons | None |
| 3 | Backend search/filter/pagination | None |
| 4 | Frontend filter UI + pagination | Phase 3 |

Phases 1–3 are independent. Phase 4 requires Phase 3.
