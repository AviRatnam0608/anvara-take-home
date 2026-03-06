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

## Challenges 3–5

*To be documented as completed.*
