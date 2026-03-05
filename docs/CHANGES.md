# Changes Documentation

## Challenge 1: Fix TypeScript Errors & Add Rate Limiting

### Problem 1: Missing TypeScript Declarations for `cors`

**Error:**
```
src/index.ts(2,18): error TS7016: Could not find a declaration file for module 'cors'.
```

**Root Cause:** The `cors` package (`cors@2.8.5`) is written in plain JavaScript and does not ship with TypeScript type declarations. When `strict` mode is enabled in `tsconfig.json`, TypeScript rejects imports that implicitly resolve to `any`.

**Solution:** Installed `@types/cors` as a dev dependency. This is the DefinitelyTyped community-maintained type package for `cors` and is the standard approach for adding types to untyped npm packages.

```bash
pnpm --filter @anvara/backend add -D @types/cors
```

**Alternatives Considered:**
- *Adding a `declare module 'cors'` shim* — This would silence the error but provides no actual type safety. The `@types/cors` package gives full IntelliSense for cors options (`origin`, `methods`, `credentials`, etc.), which is more useful long-term.

**Files Changed:**
- `apps/backend/package.json` — added `@types/cors` to `devDependencies`

---

### Problem 2: No Rate Limiting on API Endpoints

**Context:** The backend's `src/index.ts` had a TODO comment requesting rate limiting to prevent endpoint abuse. All API routes were unprotected against request flooding.

**Solution:** Installed `express-rate-limit` and applied it as global middleware before all other middleware (cors, json parsing) and routes.

```bash
pnpm --filter @anvara/backend add express-rate-limit
```

**Configuration chosen:**
```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  limit: 100,               // 100 requests per window per IP
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
```

**Why these settings:**
- **100 requests / 15 minutes** — Generous enough for normal usage (browsing dashboards, submitting forms) while still blocking brute-force or scraping attempts. A real production app would tune this based on traffic patterns.
- **`standardHeaders: 'draft-8'`** — Sends `RateLimit-Limit`, `RateLimit-Remaining`, and `RateLimit-Reset` headers per the latest IETF draft. Clients can use these to implement backoff logic.
- **`legacyHeaders: false`** — Disables the older `X-RateLimit-*` headers to keep responses clean. No reason to support both.
- **Applied globally** — All `/api/*` routes get the same limit. Per-route limits (e.g. stricter on `/api/auth/login`) could be added later but are not needed at this stage.

**Trade-offs and Considerations:**
- **In-memory store** — The default store keeps counters in the Node.js process memory. This means rate limit state is lost on server restart and is not shared across multiple server instances. For a single-process dev/take-home setup this is fine. A production deployment with multiple instances would need a Redis or external store.
- **Global vs. per-route limiting** — A global limiter is simpler but treats all endpoints the same. Auth endpoints (login) are typically more sensitive and warrant stricter limits. This can be layered on in Challenge 3 when auth middleware is implemented.
- **IP-based tracking** — The limiter identifies clients by IP address. Behind a reverse proxy, `trust proxy` must be configured on Express for this to work correctly. Not an issue in the current local dev setup.

**Why `express-rate-limit`:**
- It is the most widely used rate limiting library for Express (~4M weekly downloads).
- Ships with built-in TypeScript types (no `@types/` package needed).
- Compatible with Express 5 (which this project uses).
- Recommended in the project's own TODO comment.
- Simple API with sensible defaults, minimal configuration needed.

**Files Changed:**
- `apps/backend/package.json` — added `express-rate-limit` to `dependencies`
- `apps/backend/src/index.ts` — imported `rateLimit`, created limiter config, applied as first middleware

---

### Problem 3: Non-Existent Fields in AdSlot Create Route

**Error:**
```
src/routes/adSlots.ts(85,9): error TS2353: Object literal may only specify known properties,
and 'dimensions' does not exist in type...
```

**Root Cause:** The `POST /api/ad-slots` handler destructured `dimensions` and `pricingModel` from the request body and passed them into `prisma.adSlot.create()`. Neither field exists on the `AdSlot` model in `schema.prisma`. The schema uses `width: Int?` and `height: Int?` instead of a `dimensions` string, and `pricingModel` belongs to the `Placement` model, not `AdSlot`.

**Solution:** Removed both `dimensions` and `pricingModel` from the destructured request body and from the Prisma `data` object. The route now only passes fields that actually exist on the AdSlot model (`name`, `description`, `type`, `basePrice`, `publisherId`).

**Why not map `dimensions` to `width`/`height`:** The `dimensions` field was being passed as a raw string (e.g. `"300x250"`), but the schema expects separate integer fields. Parsing and mapping it would add complexity that belongs in a later challenge (Challenge 4 covers completing CRUD operations with proper validation). The immediate goal here is type correctness — making the code compile.

**Files Changed:**
- `apps/backend/src/routes/adSlots.ts` — removed `dimensions` and `pricingModel` from POST handler

---

### Problem 4: Express 5 Param Type Mismatch (`string | string[]`)

**Errors:**
```
src/routes/adSlots.ts(160,16): error TS2322: Type 'string | string[]' is not assignable to type 'string | undefined'.
src/routes/auth.ts(31,16):     error TS2322: Type 'string | string[]' is not assignable to type 'string | undefined'.
src/routes/auth.ts(42,16):     error TS2322: Type 'string | string[]' is not assignable to type 'string | undefined'.
```

**Root Cause:** Express 5 changed the type signature of `req.params` values from `string` to `string | string[]` to account for routes that can match multiple segments. Prisma's `where` clauses expect `string` (or `string | undefined` for optional fields like `userId`). Destructuring `req.params` directly and passing the value to Prisma creates a type mismatch.

**Solution:** Used the existing `getParam()` helper (from `src/utils/helpers.ts`) which safely normalizes `string | string[]` → `string`. This helper was already used in other routes in the same files — the broken routes were simply inconsistent.

Specific changes:
- **`adSlots.ts` unbook route** — Changed `const { id } = req.params` to `const id = getParam(req.params.id)` (matching the pattern already used in the GET and book routes in the same file).
- **`auth.ts` role route** — Changed `const { userId } = req.params` to `const userId = getParam(req.params.userId)` and added the `getParam` import.

**Why `getParam()` instead of a type assertion:** A cast like `req.params.id as string` would also silence the error, but it lies to the compiler — Express 5 genuinely can produce arrays for certain route patterns. `getParam()` handles both cases at runtime by extracting the first element if an array is received. It's defensive and consistent with the rest of the codebase.

**Files Changed:**
- `apps/backend/src/routes/adSlots.ts` — used `getParam()` in unbook route
- `apps/backend/src/routes/auth.ts` — imported `getParam`, used it for `userId` param

---

### Problem 5: Explicit `any` Types and Dead Code in Helpers

**Context:** `src/utils/helpers.ts` had multiple functions with explicit `any` parameter types (`formatCurrency`, `calculatePercentChange`, `parsePagination`, `isValidEmail`, `buildFilters`, `formatDate`), an unused variable (`unusedVariable`), and an unused export (`DEPRECATED_CONFIG`). While explicit `any` doesn't fail `tsc --noEmit` (only implicit `any` does), Challenge 1 specifically requires replacing `any` types with proper types and removing unused code.

**Changes Made:**

| Function | Before | After | Reasoning |
|---|---|---|---|
| `formatCurrency` | `amount: any` | `amount: number` | `Intl.NumberFormat.format()` expects a number |
| `calculatePercentChange` | `oldValue: any, newValue: any` | `oldValue: number, newValue: number` | Arithmetic operations require numbers |
| `parsePagination` | `query: any` | `query: Record<string, string \| string[] \| undefined>` | Matches Express `req.query` shape |
| `isValidEmail` | `email: any` | `email: string` | `RegExp.test()` expects a string |
| `buildFilters` | `query: any`, `filters: any` | Typed `Record` for both | Matches Express query params shape |
| `formatDate` | `date: any` | `date: string \| number \| Date` | The three types `new Date()` accepts |

**Dead code removed:**
- `unusedVariable` in `calculatePercentChange` — served no purpose, would trigger lint errors.
- `DEPRECATED_CONFIG` export — unused across the codebase, marked as deprecated by the original author.

**Also fixed:** `formatDate` now returns `'Invalid date'` for unparseable input instead of silently producing `'Invalid Date'` from `toLocaleDateString()` on an invalid `Date` object. This makes the failure explicit.

**Files Changed:**
- `apps/backend/src/utils/helpers.ts` — replaced all `any` types, removed dead code, added invalid date guard

---

### Verification

After all fixes, `pnpm typecheck` passes cleanly with zero errors on both backend and frontend:

```
apps/backend typecheck$ tsc --noEmit
apps/backend typecheck: Done
apps/frontend typecheck$ tsc --noEmit
apps/frontend typecheck: Done
```
