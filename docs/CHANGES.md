# Changes Documentation

This document tracks all changes made across the take-home challenges, with reasoning and trade-offs for each decision.

Detailed write-ups are in per-challenge files. Summaries are below.

## [Challenge 1: Fix TypeScript Errors & Add Rate Limiting](changes/01-typescript-and-rate-limiting.md)

**5 problems fixed across 4 backend files:**

| Problem | Fix |
|---|---|
| Missing `@types/cors` | Installed DefinitelyTyped package for full type safety |
| No rate limiting | Added `express-rate-limit` as global middleware (100 req/15min/IP) |
| `dimensions` / `pricingModel` in AdSlot create | Removed non-existent schema fields from Prisma `data` object |
| Express 5 `string \| string[]` param mismatch | Used existing `getParam()` helper to normalize params |
| Explicit `any` types and dead code in helpers | Replaced all `any` with proper types, removed unused variables/exports |

**Result:** `pnpm typecheck` passes with zero errors on both backend and frontend.

---

## [Challenge 2: Server-Side Data Fetching](changes/02-server-side-data-fetching.md)

**Converted sponsor dashboard from client-side `useEffect` fetching to Next.js Server Components.**

| Before | After |
|---|---|
| 4 sequential network round trips | 1 server-side render |
| Backend API URL exposed in client bundle | Fetches happen server-to-server |
| `useEffect`, `useState`, `authClient` shipped to browser | Zero data-fetching JS sent to client |
| `any[]` campaign type | Typed `Campaign[]` |
| 70-line client component | 28-line presentational Server Component |

**Result:** Campaign data appears in initial HTML (View Source). No client-side fetch to `/api/campaigns`. Graceful error handling when backend is down.

---

## [Challenge 3: Secure API Endpoints](changes/03-api-security.md)

**Replaced placeholder auth middleware with full session-based authentication and role-based authorization.**

| Before | After |
|---|---|
| `authMiddleware` was a no-op (`next()`) | Validates Better Auth session cookie via `auth.api.getSession()` |
| All data visible to anyone | Protected routes return 401 for unauthenticated requests |
| No ownership scoping | Campaigns scoped to sponsor, ad slots scoped to publisher |
| No cross-role protection | Sponsors get 403 on ad-slot routes, publishers get 403 on campaign routes |
| Frontend API calls had no credentials | `credentials: 'include'` + server-side cookie forwarding |
| No `/api/auth/me` endpoint | Returns authenticated user's profile, role, and entity ID |

**Result:** Unauthenticated requests → 401. Cross-user access → 404. Cross-role access → 403. Both dashboards load correctly with scoped data.

---

## [Challenge 4: Complete CRUD Operations](changes/04-crud-operations.md)

**Added 4 new endpoints, fixed broken POST validation, and added frontend API client functions.**

| Change | Detail |
|---|---|
| PUT /api/campaigns/:id | Update campaign (SPONSOR only, ownership-verified) |
| DELETE /api/campaigns/:id | Delete campaign (SPONSOR only, 204 No Content) |
| PUT /api/ad-slots/:id | Update ad slot (PUBLISHER only, ownership-verified) |
| DELETE /api/ad-slots/:id | Delete ad slot (PUBLISHER only, 204 No Content) |
| POST /api/ad-slots fix | Added `AdSlotType` enum validation (was leaking Prisma errors) |
| Frontend API client | Added `updateCampaign`, `deleteCampaign`, `updateAdSlot`, `deleteAdSlot` |
| Tests | +27 new tests (13 campaigns, 14 ad slots) — 126 total passing |

**Security:** All endpoints enforce role guards (403), ownership checks via `findFirst` (404 for not-owned — doesn't reveal existence), and enum validation (400 with clean messages).

---

## Challenge 5

*To be documented as completed.*
