# Changes Documentation

## Challenge 1 (Partial): Fix TypeScript Errors & Add Rate Limiting

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
